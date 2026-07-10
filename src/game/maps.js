// Procedural zone map generation — Whispering Pines world layout
// shore → cabin_woods → haunted_forest → town (with grotto to the right, lighthouse to the left)
import { T, ZONE_DEFS, rng } from './constants';
import { GROTTO_BOTTOM } from './story';
import { getGrottoBiome } from './enemies';
import { genInterior, genStore, genMayors, genSaloon, genFishMarket, genPatricia, genTownhouse, genMayorsBasement, genNikkiBasement } from './interiors';
import { genCottage } from './cottageInteriors';

export function generateZone(zoneId, daySeed, grottoFloor, options = {}) {
  const def = ZONE_DEFS[zoneId];
  const w = def.w, h = def.h;
  const r = rng(daySeed * 7919 + hashStr(zoneId) + (grottoFloor || 0) * 31);
  const tiles = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) row.push(0);
    tiles.push(row);
  }
  const objects = [];
  const doors = [];

  if (def.interior && zoneId !== 'grotto') {
    switch (zoneId) {
      case 'home': genInterior(tiles, w, h, doors, r); break;
      case 'store': genStore(tiles, w, h, doors, r); break;
      case 'mayors': genMayors(tiles, w, h, doors, r, options.cycle || 1); break;
      case 'mayors_basement': genMayorsBasement(tiles, w, h, doors, r, objects); break;
      case 'nikki_basement': genNikkiBasement(tiles, w, h, doors, r, objects); break;
      case 'saloon': genSaloon(tiles, w, h, doors, r, options.restored); break;
      case 'fishmarket': genFishMarket(tiles, w, h, doors, r); break;
      case 'patricia': genPatricia(tiles, w, h, doors, r); break;
      case 'townhouse1':
      case 'townhouse2': genTownhouse(tiles, w, h, doors, r, { x: 38, y: 12 }); break;
      case 'cottage_rowan': genCottage(tiles, w, h, doors, r, 'workshop'); break;
      case 'cottage_willow': genCottage(tiles, w, h, doors, r, 'garden'); break;
      case 'cottage_finn': genCottage(tiles, w, h, doors, r, 'boathouse'); break;
      case 'cottage_luna': genCottage(tiles, w, h, doors, r, 'tower'); break;
      case 'cottage_dante': genCottage(tiles, w, h, doors, r, 'studio'); break;
      default: genInterior(tiles, w, h, doors, r); break;
    }
    // ── Saloon: Old Gus tends the bar when restored ──
    let npcs = [];
    if (zoneId === 'saloon' && options.restored) {
      npcs = [{ id: 'bartender', x: 5, y: 4, name: 'Old Gus', color: '#6a5a3a',
        lines: ['Welcome back! What can I get ya?',
                'The saloon\'s never looked better. Thanks to you.',
                'Pull up a stool. First round\'s on the house. Well... almost.',
                'Mayor Goodfellow\'s a strange one. Always working late, always smelling of chemicals. But he\'s kept this town together, so nobody asks questions.'] }];
    }
    return { tiles, objects, w, h, doors, npcs, features: {} };
  }

  switch (zoneId) {
    case 'shore': genShore(tiles, w, h, objects, doors, r); break;
    case 'cabin_woods': genCabinWoods(tiles, w, h, objects, doors, r); break;
    case 'haunted_forest': genHauntedForest(tiles, w, h, objects, doors, r); break;
    case 'town': genTown(tiles, w, h, objects, doors, r); break;
    case 'lighthouse': genLighthouse(tiles, w, h, objects, doors, r); break;
    case 'spooky_shores': genSpookyShores(tiles, w, h, objects, doors, r); break;
    case 'shaman_dungeon': genShamanDungeon(tiles, w, h, objects, doors, r); break;
    case 'grotto': genGrotto(tiles, w, h, objects, doors, r, grottoFloor || 1); break;
  }

  const npcs = NPC_PLACEMENT[zoneId] || [];
  return { tiles, objects, w, h, doors, npcs, features: {} };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function set(tiles, x, y, t, w, h) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  tiles[y][x] = t;
}

function rect(tiles, x0, y0, x1, y1, t, w, h) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) set(tiles, x, y, t, w, h);
}

function scatter(tiles, t, count, r, w, h, avoid) {
  let placed = 0, tries = 0;
  while (placed < count && tries < count * 8) {
    tries++;
    const x = 1 + Math.floor(r() * (w - 2));
    const y = 1 + Math.floor(r() * (h - 2));
    if (avoid && avoid(x, y)) continue;
    tiles[y][x] = t;
    placed++;
  }
}

function cluster(tiles, t, cx, cy, count, r, w, h, radius, avoid) {
  let placed = 0, tries = 0;
  while (placed < count && tries < count * 6) {
    tries++;
    const ang = r() * Math.PI * 2;
    const dist = r() * radius;
    const x = Math.round(cx + Math.cos(ang) * dist);
    const y = Math.round(cy + Math.sin(ang) * dist);
    if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
    if (avoid && avoid(x, y)) continue;
    if (tiles[y][x] === t) continue;
    tiles[y][x] = t;
    placed++;
  }
}

function windingPath(tiles, x0, y0, x1, y1, r, w, h) {
  // paths meander around buildings — never carve through walls, roofs or doors
  const carve = (x, y) => {
    const t = tiles[y] && tiles[y][x];
    if (t === T.WALL || t === T.ROOF || t === T.DOOR) return;
    set(tiles, x, y, T.PATH, w, h);
  };
  let cx = x0, cy = y0;
  let guard = 0;
  while ((Math.abs(cx - x1) > 1 || Math.abs(cy - y1) > 1) && guard < 200) {
    guard++;
    if (r() > 0.5) cx += cx < x1 ? 1 : cx > x1 ? -1 : 0;
    else cy += cy < y1 ? 1 : cy > y1 ? -1 : 0;
    carve(cx, cy);
  }
  carve(x1, y1);
}

// ═══════════════════════════════════════════════════════════
// SHORE — shipwreck beach, start of the game, fishing spot
// North → cabin_woods
// ═══════════════════════════════════════════════════════════
function genShore(tiles, w, h, objects, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.SAND, w, h);
  // ocean on the right and bottom
  for (let y = 0; y < h; y++)
    for (let x = w - 6; x < w; x++)
      tiles[y][x] = (x >= w - 3) ? T.DEEP_WATER : T.WATER;
  for (let y = h - 5; y < h; y++)
    for (let x = 0; x < w - 6; x++)
      if (r() > 0.3) tiles[y][x] = (y >= h - 2) ? T.DEEP_WATER : T.WATER;
  // grass inland
  rect(tiles, 0, 0, w - 10, h - 8, T.GRASS, w, h);
  scatter(tiles, T.DARK_GRASS, 80, r, w, h, (x, y) => tiles[y][x] !== T.GRASS);

  // dock for fishing
  for (let y = h - 10; y >= h - 6; y--) tiles[y][w - 7] = T.DOCK;
  tiles[h - 6][w - 6] = T.DOCK;

  // tree line on inland edge
  for (let x = 0; x < w - 10; x++)
    if (r() > 0.35) tiles[1][x] = T.TREE;
  cluster(tiles, T.TREE, 4, 4, 6, r, w, h, 3, (x, y) => y < 3 || tiles[y][x] !== T.GRASS);
  cluster(tiles, T.OAK, 2, 2, 3, r, w, h, 2, (x, y) => y < 3 || tiles[y][x] !== T.GRASS);
  cluster(tiles, T.PINE, 10, 3, 4, r, w, h, 2, (x, y) => y < 4 || tiles[y][x] !== T.GRASS);
  cluster(tiles, T.BIRCH, 12, 2, 4, r, w, h, 2, (x, y) => y < 4 || tiles[y][x] !== T.GRASS);

  // campfire near spawn
  tiles[h - 8][8] = T.CAMPFIRE;
  tiles[h - 8][6] = T.LANTERN_POST;
  tiles[h - 8][10] = T.LANTERN_POST;
  tiles[h - 9][9] = T.FALLEN_LOG;
  tiles[h - 7][7] = T.CRATE;
  tiles[h - 7][9] = T.BARREL;

  // flower garden
  cluster(tiles, T.FLOWER, 9, h - 5, 12, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.BUSH, 5, h - 8, 5, r, w, h, 2, (x, y) => tiles[y][x] !== T.GRASS);

  // scattered details
  scatter(tiles, T.MUSHROOM, 15, r, w, h, (x, y) => tiles[y][x] !== T.GRASS);
  scatter(tiles, T.FERN, 25, r, w, h, (x, y) => tiles[y][x] !== T.GRASS);
  scatter(tiles, T.TALL_GRASS, 40, r, w, h, (x, y) => tiles[y][x] !== T.GRASS);
  scatter(tiles, T.PEBBLE, 50, r, w, h, (x, y) => tiles[y][x] !== T.DEEP_WATER);
  scatter(tiles, T.FLOWER, 25, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  scatter(tiles, T.FALLEN_LOG, 8, r, w, h, (x, y) => tiles[y][x] === T.SAND);
  scatter(tiles, T.STUMP, 6, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  scatter(tiles, T.ROCK, 35, r, w, h, (x, y) => tiles[y][x] !== T.GRASS && tiles[y][x] !== T.SAND);
  cluster(tiles, T.ROCK, 3, 4, 6, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.ROCK, w - 4, 4, 5, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  // spooky ambiance — gravestones and spider webs at the tree line
  scatter(tiles, T.GRAVESTONE, 4, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  scatter(tiles, T.SPIDER_WEB, 5, r, w, h, (x, y) => tiles[y][x] === T.GRASS);

  // ── Shipwreck — placed AFTER scatters so it survives on the beach near spawn ──
  // The wrecked vessel sits on the sand, visible from where you wake up.
  tiles[28][16] = T.SHIPWRECK;
  tiles[27][14] = T.FALLEN_LOG;
  tiles[28][19] = T.BARREL;
  tiles[27][13] = T.CRATE;
  tiles[27][18] = T.PEBBLE;
  tiles[28][21] = T.ROCK;
  tiles[27][20] = T.PEBBLE;
  tiles[29][15] = T.PEBBLE;
  tiles[29][19] = T.FALLEN_LOG;

  // path north to cabin_woods
  for (let y = 0; y < 5; y++) tiles[y][Math.floor(w / 2)] = T.PATH;
  tiles[0][Math.floor(w / 2)] = T.DOOR;
  doors.push({ x: Math.floor(w / 2), y: 0, to: 'cabin_woods', targetX: 20, targetY: 32 });

  // interactable objects
  objects.push({ x: w - 9, y: h - 10, type: 'antique', collected: false });
  objects.push({ x: 3, y: 3, type: 'clue', collected: false, text: 'A weathered captain\'s log: "We struck something in the fog. It wasn\'t rock."' });

}

// ═══════════════════════════════════════════════════════════
// SPOOKY SHORES — the other side of the island (cycle 3 only)
// Dark beach, ship graveyards, bone-strewn dunes, shaman's crypt
// East → shore (back), North → shaman_dungeon
// ═══════════════════════════════════════════════════════════
function genSpookyShores(tiles, w, h, objects, doors, r) {
  // dark sand base
  rect(tiles, 0, 0, w - 1, h - 1, T.DARK_DIRT, w, h);
  scatter(tiles, T.SAND, 80, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);
  scatter(tiles, T.STONE, 40, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);

  // ocean on the left (the "far side")
  for (let y = 0; y < h; y++)
    for (let x = 0; x < 5; x++)
      tiles[y][x] = (x < 2) ? T.DEEP_WATER : T.WATER;

  // ship graveyard — multiple wrecks
  cluster(tiles, T.RUIN, 8, 10, 8, r, w, h, 3, (x, y) => tiles[y][x] === T.DARK_DIRT);
  cluster(tiles, T.RUIN, 12, 20, 6, r, w, h, 2, (x, y) => tiles[y][x] === T.DARK_DIRT);
  cluster(tiles, T.FALLEN_LOG, 6, 15, 10, r, w, h, 4, (x, y) => tiles[y][x] === T.DARK_DIRT);
  scatter(tiles, T.FALLEN_LOG, 12, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);

  // bone-strewn dunes
  scatter(tiles, T.BONE_PILE, 15, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);
  scatter(tiles, T.GRAVE_CROSS, 8, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);
  scatter(tiles, T.GRAVESTONE, 6, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);

  // dead tree forest
  cluster(tiles, T.DEAD_TREE, 20, 5, 12, r, w, h, 5, (x, y) => tiles[y][x] === T.DARK_DIRT);
  cluster(tiles, T.TWISTED_TREE, 30, 25, 14, r, w, h, 5, (x, y) => tiles[y][x] === T.DARK_DIRT);
  cluster(tiles, T.DEAD_TREE, 38, 15, 8, r, w, h, 4, (x, y) => tiles[y][x] === T.DARK_DIRT);

  // skull totems — eerie landmarks
  tiles[15][10] = T.SKULL_TOTEM;
  tiles[15][11] = T.CANDLES;
  tiles[22][35] = T.SKULL_TOTEM;
  tiles[22][34] = T.CANDLES;
  tiles[8][30] = T.SKULL_TOTEM;

  // hanging moss from dead branches
  scatter(tiles, T.HANGING_MOSS, 25, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);

  // spider webs
  scatter(tiles, T.SPIDER_WEB, 12, r, w, h, (x, y) => tiles[y][x] === T.DARK_DIRT);

  // eerie fog pond (fishing spot)
  const fpx = 20, fpy = 30;
  for (let y = fpy - 3; y <= fpy + 3; y++)
    for (let x = fpx - 4; x <= fpx + 4; x++)
      if (Math.hypot(x - fpx, y - fpy) < 4)
        set(tiles, x, y, T.DEEP_WATER, w, h);
  tiles[fpy - 3][fpx] = T.DOCK;
  tiles[fpy - 2][fpx] = T.LANTERN_POST;

  // campfire rest area
  tiles[25][25] = T.CAMPFIRE;
  tiles[25][23] = T.LANTERN_POST;
  tiles[25][27] = T.LANTERN_POST;
  tiles[26][24] = T.FALLEN_LOG;
  tiles[26][26] = T.STUMP;

  // path from east door (shore) to the crypt entrance (north)
  for (let x = w - 5; x > 5; x--) tiles[19][x] = T.PATH;
  for (let y = 19; y > 5; y--) tiles[y][6] = T.PATH;
  windingPath(tiles, 6, 5, 10, 2, r, w, h);

  // lanterns along path
  tiles[19][w - 8] = T.LANTERN_POST;
  tiles[19][15] = T.LANTERN_POST;
  tiles[15][6] = T.LANTERN_POST;
  tiles[10][6] = T.LANTERN_POST;

  // east door back to Pinebrook Town
  for (let x = w - 5; x < w; x++) tiles[19][x] = T.PATH;
  tiles[19][w - 1] = T.DOOR;
  doors.push({ x: w - 1, y: 19, to: 'town', targetX: 22, targetY: 4 });

  // north door to shaman's crypt (the dungeon)
  for (let y = 0; y < 4; y++) tiles[y][10] = T.PATH;
  tiles[0][10] = T.DOOR;
  doors.push({ x: 10, y: 0, to: 'shaman_dungeon', targetX: 11, targetY: 15 });

  // interactable objects — lore
  objects.push({ x: 10, y: 12, type: 'clue', collected: false, text: 'A weathered sign, nailed to a dead tree: "THE FAR SHORE. No one who crosses returns. The shaman keeps what the island discards."' });
  objects.push({ x: 30, y: 8, type: 'clue', collected: false, text: 'Scratched into a gravestone: "She was the last witch. The island took her body, but her book — her book it could not swallow."' });
  objects.push({ x: 15, y: 28, type: 'antique', collected: false });
  objects.push({ x: 35, y: 32, type: 'clue', collected: false, text: 'A child\'s doll, half-buried in the dark sand. Its eyes are missing. Someone took them.' });
}

// ═══════════════════════════════════════════════════════════
// SHAMAN'S CRYPT — dungeon with the Undead Shaman boss
// South → spooky_shores
// Boss guards the Witch's Tome
// ═══════════════════════════════════════════════════════════
function genShamanDungeon(tiles, w, h, objects, doors, r) {
  // dark stone walls
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  // dark floor tint
  scatter(tiles, T.DARK_DIRT, 30, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);

  // bone decorations
  scatter(tiles, T.BONE_PILE, 8, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
  scatter(tiles, T.PEBBLE, 15, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
  scatter(tiles, T.SPIDER_WEB, 6, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);

  // skull totems at corners
  tiles[3][3] = T.SKULL_TOTEM;
  tiles[3][w - 4] = T.SKULL_TOTEM;
  tiles[h - 4][3] = T.SKULL_TOTEM;
  tiles[h - 4][w - 4] = T.SKULL_TOTEM;

  // candles around the boss arena
  const bx = Math.floor(w / 2), by = Math.floor(h / 2);
  tiles[by - 2][bx - 2] = T.CANDLES;
  tiles[by - 2][bx + 2] = T.CANDLES;
  tiles[by + 2][bx - 2] = T.CANDLES;
  tiles[by + 2][bx + 2] = T.CANDLES;

  // crystal light sources for eerie glow
  tiles[2][2] = T.CRYSTAL;
  tiles[2][w - 3] = T.CRYSTAL;
  tiles[h - 3][2] = T.CRYSTAL;
  tiles[h - 3][w - 3] = T.CRYSTAL;

  // floor lanterns
  tiles[1][Math.floor(w / 2)] = T.LANTERN_FLOOR;
  tiles[h - 2][Math.floor(w / 2)] = T.LANTERN_FLOOR;

  // The Witch's Tome pedestal — placed in the center
  // It becomes interactable after the boss is defeated (engine checks boss state)
  tiles[by][bx] = T.WITCH_TOME;

  // south door back to spooky shores
  tiles[h - 2][Math.floor(w / 2)] = T.DOOR;
  doors.push({ x: Math.floor(w / 2), y: h - 2, to: 'spooky_shores', targetX: 10, targetY: 4 });

  // lore object
  objects.push({ x: 3, y: h - 3, type: 'clue', collected: false, text: 'A journal page, torn and stained: "The shaman was once the island\'s healer. The hunger twisted him. He guards the witch\'s book not out of loyalty — but because the island made him forget how to let go."' });
}

// ═══════════════════════════════════════════════════════════
// CABIN WOODS — wooded area with the player's cabin, fishing pond
// South → shore, North → haunted_forest, Cabin door → home
// ═══════════════════════════════════════════════════════════
function genCabinWoods(tiles, w, h, objects, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.GRASS, w, h);
  scatter(tiles, T.DARK_GRASS, 100, r, w, h, (x, y) => tiles[y][x] !== T.GRASS);

  // tree clusters
  cluster(tiles, T.TREE, 5, 5, 10, r, w, h, 4, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.OAK, 35, 5, 8, r, w, h, 4, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.PINE, 5, 28, 8, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.BIRCH, 35, 28, 6, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.BUSH, 20, 15, 8, r, w, h, 5);
  cluster(tiles, T.BERRY_BUSH, 10, 20, 5, r, w, h, 3);

  // the cabin (spooky but comfy) — 4x4 building with roof
  const cx = 8, cy = 7;
  rect(tiles, cx, cy, cx + 3, cy + 3, T.WALL, w, h);
  rect(tiles, cx + 1, cy + 1, cx + 2, cy + 2, T.ROOF, w, h);
  tiles[cy + 3][cx + 1] = T.DOOR;
  doors.push({ x: cx + 1, y: cy + 3, to: 'home', targetX: 8, targetY: 11 });

  // lanterns and decor around cabin
  tiles[cy + 4][cx] = T.LANTERN_POST;
  tiles[cy + 4][cx + 3] = T.LANTERN_POST;
  tiles[cy + 5][cx + 1] = T.PUMPKIN;
  tiles[cy + 5][cx + 2] = T.PUMPKIN;
  tiles[cy + 5][cx] = T.CRATE;
  tiles[cy + 5][cx + 3] = T.BARREL;
  tiles[cy + 4][cx + 2] = T.PLANT_POT;

  // fishing pond near cabin
  const px_ = 28, py = 18;
  for (let y = py - 3; y <= py + 3; y++)
    for (let x = px_ - 4; x <= px_ + 4; x++)
      if (Math.hypot(x - px_, y - py) < 4)
        set(tiles, x, y, r() > 0.2 ? T.WATER : T.DEEP_WATER, w, h);
  cluster(tiles, T.LILY, px_, py, 4, r, w, h, 3, (x, y) => tiles[y][x] !== T.WATER);
  // dock at pond
  tiles[py - 3][px_] = T.DOCK;
  tiles[py - 4][px_] = T.DOCK;
  tiles[py - 2][px_ - 4] = T.LANTERN_POST;
  tiles[py - 2][px_ + 4] = T.LANTERN_POST;

  // campfire
  tiles[20][12] = T.CAMPFIRE;
  tiles[20][10] = T.LANTERN_POST;
  tiles[20][14] = T.LANTERN_POST;
  tiles[21][11] = T.FALLEN_LOG;
  tiles[21][13] = T.STUMP;

  // scattered details — avoid overwriting the cabin walls, door, paths, and water
  const isScatterable = (x, y) => tiles[y][x] !== T.GRASS && tiles[y][x] !== T.DARK_GRASS;
  scatter(tiles, T.FERN, 40, r, w, h, isScatterable);
  scatter(tiles, T.TALL_GRASS, 50, r, w, h, isScatterable);
  scatter(tiles, T.FLOWER, 30, r, w, h, isScatterable);
  scatter(tiles, T.MUSHROOM, 15, r, w, h, isScatterable);
  scatter(tiles, T.STUMP, 8, r, w, h, isScatterable);
  scatter(tiles, T.FALLEN_LOG, 10, r, w, h, isScatterable);
  scatter(tiles, T.ROCK, 30, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  cluster(tiles, T.ROCK, 34, 6, 6, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.ROCK, 6, 30, 5, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  // eerie cabin woods atmosphere
  scatter(tiles, T.SPIDER_WEB, 6, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  scatter(tiles, T.GRAVESTONE, 3, r, w, h, (x, y) => tiles[y][x] === T.GRASS);

  // paths
  // south door to shore
  for (let y = h - 5; y < h; y++) tiles[y][Math.floor(w / 2)] = T.PATH;
  tiles[h - 1][Math.floor(w / 2)] = T.DOOR;
  doors.push({ x: Math.floor(w / 2), y: h - 1, to: 'shore', targetX: 22, targetY: 3 });
  // north door to haunted_forest
  for (let y = 0; y < 5; y++) tiles[y][Math.floor(w / 2)] = T.PATH;
  tiles[0][Math.floor(w / 2)] = T.DOOR;
  doors.push({ x: Math.floor(w / 2), y: 0, to: 'haunted_forest', targetX: 23, targetY: 36 });
  // path from spawn to cabin
  windingPath(tiles, Math.floor(w / 2), h - 5, cx + 1, cy + 4, r, w, h);

  // ── Quest: The Wet Footprints ──
  // The first footprint is found by the jack-o-lanterns outside the cabin.
  objects.push({ x: 10, y: 13, type: 'footprints', collected: false, persist: true,
    text: 'Wet footprints pool around the jack-o-lanterns by the cabin. Barefoot... and the toes are far too long. They lead east, toward the old fishing pond.' });
  objects.push({ x: 16, y: 14, type: 'footprints', collected: false, persist: true,
    text: 'The trail continues through the trees. The prints are uneven, as if whoever made them was limping... or dragging something.' });
  objects.push({ x: 22, y: 16, type: 'footprints', collected: false, persist: true,
    text: 'The footprints grow fainter here, near the water. They stop at the pond\'s edge — but nothing went in. They just... end.' });
  // The hidden note — tucked near the pond, reveals the shore investigation
  objects.push({ x: 24, y: 15, type: 'note', collected: false,
    text: 'A waterlogged note, pinned under a stone by the pond: "The figure walks the shore at midnight, wailing of what lies beneath. If you\'re reading this, you\'ve seen it too. Come to the shipwreck after dark. —P"' });

  objects.push({ x: 4, y: 4, type: 'clue', collected: false, text: 'Scratched into a tree: "The cabin lights itself at night. Don\'t be afraid."' });
  objects.push({ x: 36, y: 30, type: 'antique', collected: false });

  // ── Captain Holloway Evidence: hidden in the woods ──
  // Each piece debunks one layer of the ghost's disguise.
  objects.push({ x: 4, y: 6, type: 'evidence_sailcloth', collected: false,
    text: 'A scrap of sail canvas, caught on a low branch. Torn, weathered — and recently handled. Someone wrapped themselves in this.' });
  objects.push({ x: 31, y: 19, type: 'evidence_conch', collected: false,
    text: 'A large spiral conch shell lies half-buried in the pond reeds. You blow through it experimentally — it produces a low, mournful wail. Exactly like the ghost\'s cry on the shore.' });
  objects.push({ x: 25, y: 21, type: 'evidence_boot', collected: false,
    text: 'A single worn boot, hidden deep in the reeds. Its heel has a distinctive crescent-shaped mark — the same shape pressed into every footprint you found on the shore.' });
  objects.push({ x: 16, y: 28, type: 'evidence_fogoil', collected: false,
    text: 'An empty glass bottle, slick with an oily residue. Whatever was inside made the fog cling unnaturally thick. It was discarded here, near the path to the shore.' });
}

// ═══════════════════════════════════════════════════════════
// HAUNTED FOREST — dense dark woods, stone circle, fishing pond
// South → cabin_woods, North → town, Right → grotto, Left → lighthouse (locked)
// ═══════════════════════════════════════════════════════════
function genHauntedForest(tiles, w, h, objects, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.DARK_GRASS, w, h);
  scatter(tiles, T.GRASS, 100, r, w, h, (x, y) => tiles[y][x] !== T.DARK_GRASS);

  // dense haunted tree groves — more trees for a thick, oppressive forest
  cluster(tiles, T.TWISTED_TREE, 8, 8, 28, r, w, h, 5);
  cluster(tiles, T.TWISTED_TREE, 20, 30, 28, r, w, h, 5);
  cluster(tiles, T.TWISTED_TREE, 38, 12, 18, r, w, h, 4);
  cluster(tiles, T.TWISTED_TREE, 5, 18, 14, r, w, h, 4);
  cluster(tiles, T.DEAD_TREE, 35, 10, 14, r, w, h, 4);
  cluster(tiles, T.DEAD_TREE, 6, 28, 12, r, w, h, 3);
  cluster(tiles, T.DEAD_TREE, 42, 32, 10, r, w, h, 3);
  cluster(tiles, T.OAK, 38, 30, 12, r, w, h, 3);
  cluster(tiles, T.OAK, 8, 15, 8, r, w, h, 3);
  cluster(tiles, T.PINE, 15, 5, 14, r, w, h, 3, (x, y) => tiles[y][x] === T.DARK_GRASS);
  cluster(tiles, T.PINE, 5, 25, 12, r, w, h, 3, (x, y) => tiles[y][x] === T.DARK_GRASS);
  cluster(tiles, T.BIRCH, 25, 15, 10, r, w, h, 2);
  cluster(tiles, T.WILLOW, 10, 25, 8, r, w, h, 2);
  // ancient big trees — massive, towering over the forest
  cluster(tiles, T.BIG_TREE, 12, 6, 3, r, w, h, 4);
  cluster(tiles, T.BIG_TREE, 30, 28, 3, r, w, h, 4);
  cluster(tiles, T.BIG_TREE, 40, 8, 2, r, w, h, 3);
  cluster(tiles, T.BIG_TREE, 6, 32, 2, r, w, h, 3);
  scatter(tiles, T.BIG_TREE, 3, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  cluster(tiles, T.BUSH, 12, 15, 10, r, w, h, 4);
  cluster(tiles, T.BERRY_BUSH, 12, 20, 5, r, w, h, 2);
  cluster(tiles, T.MUSHROOM, 15, 10, 14, r, w, h, 3, (x, y) => tiles[y][x] === T.DARK_GRASS);
  scatter(tiles, T.MUSHROOM, 20, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  scatter(tiles, T.FERN, 50, r, w, h);
  scatter(tiles, T.TALL_GRASS, 60, r, w, h);
  scatter(tiles, T.FLOWER, 30, r, w, h);
  scatter(tiles, T.MOSS, 40, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  scatter(tiles, T.STUMP, 12, r, w, h);
  scatter(tiles, T.FALLEN_LOG, 15, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  scatter(tiles, T.ROCK, 25, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  cluster(tiles, T.ROCK, 3, 20, 6, r, w, h, 3, (x, y) => tiles[y][x] === T.DARK_GRASS);
  cluster(tiles, T.ROCK, 42, 22, 5, r, w, h, 3, (x, y) => tiles[y][x] === T.DARK_GRASS);
  // deep haunted forest — bones, webs, hanging moss
  scatter(tiles, T.BONE_PILE, 6, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  scatter(tiles, T.SPIDER_WEB, 8, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  scatter(tiles, T.HANGING_MOSS, 12, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);
  scatter(tiles, T.GRAVE_CROSS, 4, r, w, h, (x, y) => tiles[y][x] === T.DARK_GRASS);

  // winding path from bottom to top
  let ppx = 23;
  for (let y = h - 1; y >= 0; y--) {
    tiles[y][ppx] = T.PATH;
    if (r() > 0.6) ppx += r() > 0.5 ? 1 : -1;
    ppx = Math.max(2, Math.min(w - 3, ppx));
  }

  // stone circle clearing
  const scx = 12, scy = 8;
  rect(tiles, scx - 3, scy - 3, scx + 3, scy + 3, T.MOSS, w, h);
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    set(tiles, Math.round(scx + Math.cos(ang) * 3), Math.round(scy + Math.sin(ang) * 3), T.STONE_CIRCLE, w, h);
  }
  tiles[scy][scx] = T.CRYSTAL;
  tiles[scy - 1][scx] = T.CANDLES;
  tiles[scy + 1][scx] = T.CANDLES;

  // dark fishing pond
  const fpx = 38, fpy = 22;
  for (let y = fpy - 2; y <= fpy + 2; y++)
    for (let x = fpx - 3; x <= fpx + 3; x++)
      if (Math.hypot(x - fpx, y - fpy) < 3)
        set(tiles, x, y, T.DEEP_WATER, w, h);
  cluster(tiles, T.LILY, fpx, fpy, 3, r, w, h, 2, (x, y) => tiles[y][x] !== T.DEEP_WATER);
  tiles[fpy - 2][fpx] = T.DOCK;
  tiles[fpy - 3][fpx] = T.LANTERN_POST;

  // grotto entrance (right side)
  const gx = w - 1, gy = Math.floor(h / 2);
  for (let x = w - 5; x < w; x++) tiles[gy][x] = T.PATH;
  tiles[gy][w - 3] = T.CAVE;
  tiles[gy][w - 2] = T.MOSS;
  tiles[gy][w - 1] = T.DOOR;
  doors.push({ x: w - 1, y: gy, to: 'grotto', targetX: 12, targetY: 15 });
  tiles[gy - 1][w - 2] = T.LANTERN_POST;
  tiles[gy - 1][w - 3] = T.ROCK;
  tiles[gy + 1][w - 3] = T.ROCK;

  // Nikki's basement — hidden hatch in the deep woods (cycle 2 event)
  // The door is always here, but the engine only lets you through once Nikki
  // has taken someone. Before that: frost-sealed, whispering.
  const nbx = w - 1, nby = 4;
  for (let x = w - 4; x < w; x++) tiles[nby][x] = T.PATH;
  tiles[nby][w - 3] = T.SKULL_TOTEM;
  tiles[nby][w - 2] = T.CANDLES;
  tiles[nby][w - 1] = T.DOOR;
  doors.push({ x: w - 1, y: nby, to: 'nikki_basement', targetX: 7, targetY: 10 });

  // lighthouse path (left side — locked)
  const lx = 0, ly = Math.floor(h / 2);
  for (let x = 0; x < 5; x++) tiles[ly][x] = T.PATH;
  tiles[ly][2] = T.FENCE;
  tiles[ly][1] = T.FENCE;
  tiles[ly][0] = T.DOOR;
  doors.push({ x: 0, y: ly, to: 'lighthouse', targetX: 28, targetY: 15 });
  tiles[ly - 1][1] = T.LANTERN_POST;
  tiles[ly + 1][1] = T.LANTERN_POST;

  // lanterns along path
  for (let y = h - 3; y > 2; y -= 5) {
    if (tiles[y][ppx] === T.PATH) tiles[y][ppx + 1] = T.LANTERN_POST;
  }

  // doors
  tiles[h - 1][23] = T.DOOR;
  doors.push({ x: 23, y: h - 1, to: 'cabin_woods', targetX: 20, targetY: 3 });
  tiles[0][Math.floor(w / 2)] = T.DOOR;
  doors.push({ x: Math.floor(w / 2), y: 0, to: 'town', targetX: 22, targetY: 32 });

  // interactable objects
  objects.push({ x: 4, y: 4, type: 'antique', collected: false });
  objects.push({ x: scx + 3, y: scy - 2, type: 'clue', collected: false, text: 'A faded note pinned under a stone: "They come when the bells ring."' });
  objects.push({ x: 40, y: 5, type: 'clue', collected: false, text: 'Carved into bark: "The stones remember what we forgot."' });
  objects.push({ x: lx + 1, y: ly - 1, type: 'clue', collected: false, text: 'A rusted sign: "LIGHTHOUSE — Condemned. Do Not Enter."' });
}

// ═══════════════════════════════════════════════════════════
// TOWN — 6 buildings in a circle, statue in center
// South → haunted_forest
// Buildings: Store, Mayor's, Saloon, Fish Market, Patricia's, Town House
// ═══════════════════════════════════════════════════════════
function genTown(tiles, w, h, objects, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.GRASS, w, h);
  scatter(tiles, T.DARK_GRASS, 60, r, w, h, (x, y) => tiles[y][x] === T.GRASS);

  // border trees
  cluster(tiles, T.TREE, 3, 3, 4, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.OAK, w - 4, 3, 5, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.PINE, 3, h - 4, 4, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  cluster(tiles, T.BIRCH, w - 4, h - 4, 4, r, w, h, 3, (x, y) => tiles[y][x] !== T.GRASS);
  scatter(tiles, T.TALL_GRASS, 15, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  scatter(tiles, T.FLOWER, 30, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  scatter(tiles, T.ROCK, 20, r, w, h, (x, y) => tiles[y][x] === T.GRASS);
  cluster(tiles, T.ROCK, 3, 3, 5, r, w, h, 3, (x, y) => tiles[y][x] === T.GRASS);
  cluster(tiles, T.ROCK, w - 4, h - 4, 5, r, w, h, 3, (x, y) => tiles[y][x] === T.GRASS);

  // center — ancient tentacle creature statue (the island's old god)
  const ctx = 22, cty = 17;
  // wide cobblestone plaza with mossy edges
  rect(tiles, ctx - 5, cty - 5, ctx + 5, cty + 5, T.STONE, w, h);
  rect(tiles, ctx - 5, cty - 5, ctx + 5, cty + 5, T.MOSS, w, h);
  // clear the immediate area around the statue base — cobblestone
  rect(tiles, ctx - 3, cty - 3, ctx + 3, cty + 3, T.STONE, w, h);
  // ring of candles around the statue at a safe distance
  tiles[cty - 3][ctx] = T.CANDLES;
  tiles[cty + 3][ctx] = T.CANDLES;
  tiles[cty][ctx - 3] = T.CANDLES;
  tiles[cty][ctx + 3] = T.CANDLES;
  // crystals at the plaza corners
  tiles[cty - 3][ctx - 3] = T.CRYSTAL;
  tiles[cty + 3][ctx + 3] = T.CRYSTAL;
  tiles[cty - 3][ctx + 3] = T.CRYSTAL;
  tiles[cty + 3][ctx - 3] = T.CRYSTAL;

  // 11 buildings in a circle around the statue
  const buildings = [
    { cx: 22, cy: 6, dx: 22, dy: 8, to: 'store', name: 'Store' },
    { cx: 33, cy: 11, dx: 33, dy: 13, to: 'mayors', name: 'Mayor' },
    { cx: 33, cy: 23, dx: 33, dy: 21, to: 'saloon', name: 'Saloon' },
    { cx: 28, cy: 28, dx: 28, dy: 26, to: 'fishmarket', name: 'Fish Market' },
    { cx: 11, cy: 23, dx: 11, dy: 21, to: 'patricia', name: 'Patricia' },
    { cx: 11, cy: 11, dx: 11, dy: 13, to: 'townhouse1', name: 'House' },
    { cx: 38, cy: 9, dx: 38, dy: 11, to: 'townhouse2', name: 'House' },
    // ── Romance NPC houses ──
    { cx: 38, cy: 17, dx: 38, dy: 15, to: 'cottage_rowan', name: 'Workshop' },
    { cx: 16, cy: 6, dx: 16, dy: 8, to: 'cottage_willow', name: 'Garden' },
    { cx: 4, cy: 17, dx: 4, dy: 15, to: 'cottage_finn', name: 'Boathouse' },
    { cx: 38, cy: 28, dx: 38, dy: 26, to: 'cottage_luna', name: 'Tower' },
    { cx: 16, cy: 30, dx: 16, dy: 28, to: 'cottage_dante', name: 'Studio' },
  ];

  for (const b of buildings) {
    rect(tiles, b.cx - 2, b.cy - 2, b.cx + 2, b.cy + 2, T.WALL, w, h);
    rect(tiles, b.cx - 1, b.cy - 1, b.cx + 1, b.cy + 1, T.ROOF, w, h);
    tiles[b.dy][b.dx] = T.DOOR;
    doors.push({ x: b.dx, y: b.dy, to: b.to, targetX: Math.floor(ZONE_DEFS[b.to].w / 2), targetY: ZONE_DEFS[b.to].h - 2 });
    // lantern post outside each building — past the door on the path side,
    // never carved into a neighbour's walls or roof
    const lpy = b.dy < b.cy ? b.dy - 1 : b.dy + 1;
    const lpx = b.dx < ctx ? b.dx + 1 : b.dx - 1;
    if (lpy > 0 && lpy < h - 1 && tiles[lpy][lpx] !== T.WALL && tiles[lpy][lpx] !== T.ROOF && tiles[lpy][lpx] !== T.DOOR) {
      tiles[lpy][lpx] = T.LANTERN_POST;
    }
    // path from door toward center
    windingPath(tiles, b.dx, b.dy, ctx, cty, r, w, h);
    // decor around buildings
    if (r() > 0.5) tiles[b.cy + 2 < h ? b.cy + 2 : b.cy][b.cx - 3 > 0 ? b.cx - 3 : b.cx] = T.BUSH;
    if (r() > 0.5) tiles[b.cy - 2 > 0 ? b.cy - 2 : b.cy][b.cx + 3 < w ? b.cx + 3 : b.cx] = T.FLOWER;
  }

  // ── Cobblestone walkways throughout the town ──
  // Convert all PATH tiles laid by windingPath into cobblestone (STONE)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (tiles[y][x] === T.PATH) tiles[y][x] = T.STONE;
  // Cobblestone ring road encircling the plaza at radius 6
  for (let a = 0; a < 64; a++) {
    const ang = (a / 64) * Math.PI * 2;
    const rx = Math.round(ctx + Math.cos(ang) * 6);
    const ry = Math.round(cty + Math.sin(ang) * 6);
    if (rx > 0 && ry > 0 && rx < w - 1 && ry < h - 1 && tiles[ry][rx] === T.GRASS) tiles[ry][rx] = T.STONE;
  }
  // Cobblestone spokes from the ring road to each building door
  for (const b of buildings) {
    const ringX = Math.round(ctx + (b.dx - ctx) * 0.7);
    const ringY = Math.round(cty + (b.dy - cty) * 0.7);
    let lx = ringX, ly = ringY;
    const dx = b.dx - lx, dy = b.dy - ly;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    for (let i = 0; i <= steps; i++) {
      const sx = Math.round(lx + (dx * i) / steps);
      const sy = Math.round(ly + (dy * i) / steps);
      if (sx > 0 && sy > 0 && sx < w - 1 && sy < h - 1 && tiles[sy][sx] !== T.WALL && tiles[sy][sx] !== T.ROOF && tiles[sy][sx] !== T.DOOR) tiles[sy][sx] = T.STONE;
    }
  }

  // ── Intricate town details — a living, bustling settlement ──
  const isTownGrass = (x, y) => tiles[y][x] === T.GRASS || tiles[y][x] === T.DARK_GRASS;

  // market stalls near the store and fish market — crates, barrels, flower boxes
  const stallSpots = [{ sx: 20, sy: 10 }, { sx: 24, sy: 26 }];
  for (const s of stallSpots) {
    set(tiles, s.sx, s.sy, T.CRATE, w, h);
    set(tiles, s.sx + 1, s.sy, T.BARREL, w, h);
    set(tiles, s.sx, s.sy + 1, T.FLOWER_BOX, w, h);
    set(tiles, s.sx + 1, s.sy + 1, T.CRATE, w, h);
  }

  // community garden plot near a townhouse — tilled rows with a scarecrow
  const ggx = 5, ggy = 9;
  for (let y = ggy; y < ggy + 3; y++)
    for (let x = ggx; x < ggx + 3; x++) set(tiles, x, y, T.TILLED, w, h);
  set(tiles, ggx - 1, ggy, T.SCARECROW, w, h);
  set(tiles, ggx + 3, ggy + 1, T.HAY_BALE, w, h);
  set(tiles, ggx, ggy + 3, T.PLANT_POT, w, h);
  set(tiles, ggx + 2, ggy + 3, T.FLOWER_BOX, w, h);
  set(tiles, ggx - 1, ggy + 2, T.WINDMILL, w, h);

  // flower gardens flanking the plaza
  cluster(tiles, T.FLOWER, ctx - 6, cty + 2, 14, r, w, h, 3, isTownGrass);
  cluster(tiles, T.FLOWER, ctx + 6, cty - 2, 14, r, w, h, 3, isTownGrass);
  cluster(tiles, T.BUSH, ctx - 6, cty - 4, 8, r, w, h, 3, isTownGrass);
  cluster(tiles, T.BUSH, ctx + 6, cty + 4, 8, r, w, h, 3, isTownGrass);
  cluster(tiles, T.BERRY_BUSH, ctx + 7, cty, 5, r, w, h, 2, isTownGrass);

  // ornamental trees lining the ring road
  cluster(tiles, T.WILLOW, ctx - 7, cty - 6, 3, r, w, h, 2, isTownGrass);
  cluster(tiles, T.WILLOW, ctx + 7, cty + 6, 3, r, w, h, 2, isTownGrass);
  cluster(tiles, T.BIRCH, ctx + 7, cty - 6, 3, r, w, h, 2, isTownGrass);
  cluster(tiles, T.BIRCH, ctx - 7, cty + 6, 3, r, w, h, 2, isTownGrass);
  cluster(tiles, T.OAK, ctx - 8, cty, 2, r, w, h, 2, isTownGrass);
  cluster(tiles, T.OAK, ctx + 8, cty, 2, r, w, h, 2, isTownGrass);
  cluster(tiles, T.PINE, 3, 3, 4, r, w, h, 2, isTownGrass);
  cluster(tiles, T.PINE, w - 4, 3, 4, r, w, h, 2, isTownGrass);

  // lush ground cover throughout green spaces
  scatter(tiles, T.FERN, 45, r, w, h, isTownGrass);
  scatter(tiles, T.TALL_GRASS, 55, r, w, h, isTownGrass);
  scatter(tiles, T.FLOWER, 60, r, w, h, isTownGrass);
  scatter(tiles, T.MUSHROOM, 22, r, w, h, isTownGrass);
  scatter(tiles, T.PEBBLE, 45, r, w, h, isTownGrass);
  scatter(tiles, T.STUMP, 8, r, w, h, isTownGrass);
  scatter(tiles, T.FALLEN_LOG, 10, r, w, h, isTownGrass);
  scatter(tiles, T.MOSS, 30, r, w, h, isTownGrass);

  // fairy mushroom ring in a quiet corner, among the southern pines
  const mrx = 5, mry = 30;
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    set(tiles, Math.round(mrx + Math.cos(ang) * 2), Math.round(mry + Math.sin(ang) * 2), T.MUSHROOM, w, h);
  }
  set(tiles, mrx, mry, T.FLOWER, w, h);

  // lantern posts around the ring road — warm light encircling town
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    const rx = Math.round(ctx + Math.cos(ang) * 6);
    const ry = Math.round(cty + Math.sin(ang) * 6);
    if (rx > 0 && ry > 0 && rx < w - 1 && ry < h - 1 && tiles[ry][rx] === T.STONE) set(tiles, rx, ry, T.LANTERN_POST, w, h);
  }

  // hay bales and feed trough near the southern cottages — farm charm
  set(tiles, 12, 27, T.HAY_BALE, w, h);
  set(tiles, 13, 27, T.FEED_TROUGH, w, h);
  set(tiles, 11, 28, T.BARREL, w, h);

  // extra benches and flower vases — seating around the plaza
  set(tiles, ctx - 2, cty - 4, T.BENCH, w, h);
  set(tiles, ctx + 2, cty - 4, T.BENCH, w, h);
  set(tiles, ctx - 5, cty + 2, T.FLOWER_VASE, w, h);
  set(tiles, ctx + 5, cty + 2, T.FLOWER_VASE, w, h);

  // decorative pond with lilies near the well — life and movement
  const ppx = ctx - 6, ppy = cty - 6;
  for (let y = ppy - 1; y <= ppy + 1; y++)
    for (let x = ppx - 1; x <= ppx + 1; x++)
      if (Math.hypot(x - ppx, y - ppy) < 1.5) set(tiles, x, y, T.WATER, w, h);
  set(tiles, ppx, ppy, T.LILY, w, h);
  set(tiles, ppx + 1, ppy, T.LILY, w, h);

  // well near the statue
  tiles[cty - 3][ctx - 4] = T.WELL;
  tiles[cty - 3][ctx - 5] = T.LANTERN_POST;

  // benches
  tiles[cty + 3][ctx - 3] = T.BENCH;
  tiles[cty + 3][ctx + 3] = T.BENCH;
  tiles[cty - 3][ctx + 4] = T.BENCH;

  // campfire gathering spot
  tiles[cty + 4][ctx] = T.CAMPFIRE;
  tiles[cty + 4][ctx - 1] = T.FALLEN_LOG;
  tiles[cty + 4][ctx + 1] = T.FALLEN_LOG;

  // lanterns along paths
  tiles[cty][ctx - 5] = T.LANTERN_POST;
  tiles[cty][ctx + 5] = T.LANTERN_POST;

  // ── Place the tentacle statue AFTER all paths/walkways are laid ──
  // (windingPath overwrites the destination tile, so this must come last)
  tiles[cty][ctx] = T.TENTACLE_STATUE;

  // south door to haunted_forest — cobblestone approach
  for (let y = h - 5; y < h; y++) tiles[y][ctx] = T.STONE;
  tiles[h - 1][ctx] = T.DOOR;
  doors.push({ x: ctx, y: h - 1, to: 'haunted_forest', targetX: 23, targetY: 2 });

  // ── North door to Spooky Shores (cycle 3 only) ──
  // The engine checks story cycle before allowing entry through this portal.
  for (let y = 0; y < 5; y++) tiles[y][ctx] = T.STONE;
  tiles[0][ctx] = T.DOOR;
  doors.push({ x: ctx, y: 0, to: 'spooky_shores', targetX: 44, targetY: 19 });

  // interactable objects
  objects.push({ x: ctx, y: cty + 2, type: 'lore', collected: false,
    text: 'The tentacle statue looms in the square — old, older than the town. Its stone tentacles reach skyward, sucker-pitted, frozen mid-writhe. The townsfolk leave offerings at its base. Nobody remembers why. You feel it watching you.' });
  objects.push({ x: ctx + 5, y: cty + 5, type: 'clue', collected: false, text: 'A child\'s drawing pinned to a post: stick figures holding hands around the statue. Below it, in shaky handwriting: "We feed it so it sleeps."' });
  objects.push({ x: 3, y: 3, type: 'antique', collected: false });
}

// ═══════════════════════════════════════════════════════════
// LIGHTHOUSE — foggy coast, tall lighthouse (locked until requirements met)
// Right → haunted_forest
// ═══════════════════════════════════════════════════════════
function genLighthouse(tiles, w, h, objects, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.STONE, w, h);
  scatter(tiles, T.DARK_DIRT, 80, r, w, h, (x, y) => tiles[y][x] === T.STONE);
  scatter(tiles, T.MOSS, 40, r, w, h, (x, y) => tiles[y][x] === T.STONE);

  // beach on the right side (arrival)
  rect(tiles, w - 6, 0, w - 1, h - 1, T.SAND, w, h);
  for (let y = 0; y < 4; y++)
    for (let x = w - 4; x < w; x++) tiles[y][x] = (x >= w - 2) ? T.DEEP_WATER : T.WATER;

  // the lighthouse (tall tower)
  const lx = 8, ly = 6;
  rect(tiles, lx, ly, lx + 4, ly + 14, T.WALL, w, h);
  rect(tiles, lx + 1, ly, lx + 3, ly + 2, T.STONE, w, h);
  // light at top
  tiles[ly][lx + 2] = T.CRYSTAL;
  tiles[ly - 1 < 0 ? 0 : ly - 1][lx + 2] = T.LANTERN_POST;
  tiles[ly + 1][lx + 2] = T.LANTERN_FLOOR;
  tiles[ly + 2][lx + 2] = T.LANTERN_FLOOR;
  // door at base — sealed; the crystal at the top is the real destination
  tiles[ly + 14][lx + 2] = T.DOOR;
  doors.push({ x: lx + 2, y: ly + 14, to: 'lighthouse_base', targetX: lx + 2, targetY: ly + 16 });

  // rocky coast
  cluster(tiles, T.ROCK, 5, 20, 10, r, w, h, 4, (x, y) => tiles[y][x] === T.STONE);
  cluster(tiles, T.ROCK, 15, 25, 8, r, w, h, 4, (x, y) => tiles[y][x] === T.STONE);
  cluster(tiles, T.PEBBLE, 20, 15, 20, r, w, h, 5, (x, y) => tiles[y][x] === T.SAND);

  // dead trees
  cluster(tiles, T.DEAD_TREE, 4, 24, 5, r, w, h, 3, (x, y) => tiles[y][x] === T.STONE);
  cluster(tiles, T.TWISTED_TREE, 20, 4, 4, r, w, h, 3, (x, y) => tiles[y][x] === T.STONE);

  // path to lighthouse
  for (let x = w - 6; x > lx + 2; x--) tiles[ly + 14][x] = T.PATH;
  tiles[ly + 14][w - 6] = T.LANTERN_POST;
  tiles[ly + 13][w - 4] = T.LANTERN_POST;

  // right door back to haunted_forest
  for (let x = w - 5; x < w; x++) tiles[Math.floor(h / 2)][x] = T.PATH;
  tiles[Math.floor(h / 2)][w - 1] = T.DOOR;
  doors.push({ x: w - 1, y: Math.floor(h / 2), to: 'haunted_forest', targetX: 2, targetY: Math.floor(38 / 2) });

  // interactable objects
  objects.push({ x: lx + 2, y: ly + 4, type: 'clue', collected: false, text: 'A plaque: "Erected 1847. Extinguished 1923. Let no hand relight it."' });
  objects.push({ x: 20, y: 20, type: 'antique', collected: false });
  objects.push({ x: 5, y: 25, type: 'clue', collected: false, text: 'A journal: "The light shows what lies beneath the island. I wish I had never seen it."' });
}

// ═══════════════════════════════════════════════════════════
// GROTTO — dungeon with crystals and pillars
// ═══════════════════════════════════════════════════════════

// ── Random pond: varies size, position, and only appears sometimes ──
function maybePond(tiles, w, h, r, waterTile, chance) {
  if (r() > chance) return;
  const pw = 2 + Math.floor(r() * 4); // 2–5 wide
  const ph = 1 + Math.floor(r() * 3); // 1–3 tall
  const px = 3 + Math.floor(r() * (w - pw - 6));
  const py = 3 + Math.floor(r() * (h - ph - 6));
  for (let y = py; y < py + ph; y++)
    for (let x = px; x < px + pw; x++)
      if (r() > 0.1) set(tiles, x, y, waterTile, w, h);
  // occasional dock or lily
  if (r() > 0.5) set(tiles, px, py - 1, T.DOCK, w, h);
  if (r() > 0.6) set(tiles, px + pw - 1, py + ph - 1, T.LILY, w, h);
}

// ── Biome-specific wall pillars and room divisions for structural variety ──
function genGrottoStructure(tiles, w, h, r, biome) {
  const pillarTile = biome.id === 'lava' ? T.ROCK
    : biome.id === 'frost' ? T.CRYSTAL
    : biome.id === 'bone' ? T.SKULL_TOTEM
    : biome.id === 'abyss' ? T.STONE_CIRCLE
    : T.CRYSTAL;

  const layout = Math.floor(r() * 4); // 4 different structural layouts
  switch (layout) {
    case 0: {
      // Pillar grid — evenly spaced columns
      for (let y = 4; y < h - 3; y += 4)
        for (let x = 4; x < w - 3; x += 4)
          if (r() > 0.3) set(tiles, x, y, pillarTile, w, h);
      break;
    }
    case 1: {
      // Central chamber with corner pillars
      const cx = Math.floor(w / 2), cy = Math.floor(h / 2);
      set(tiles, cx - 3, cy - 3, pillarTile, w, h);
      set(tiles, cx + 3, cy - 3, pillarTile, w, h);
      set(tiles, cx - 3, cy + 3, pillarTile, w, h);
      set(tiles, cx + 3, cy + 3, pillarTile, w, h);
      // wall stubs dividing the room
      for (let y = 3; y < cy - 2; y++) set(tiles, cx - 6, y, T.WALL, w, h);
      for (let y = cy + 3; y < h - 3; y++) set(tiles, cx + 6, y, T.WALL, w, h);
      break;
    }
    case 2: {
      // Winding wall segments — creates corridors
      for (let i = 0; i < 4; i++) {
        const sx = 2 + Math.floor(r() * (w - 8));
        const sy = 2 + Math.floor(r() * (h - 8));
        const len = 3 + Math.floor(r() * 5);
        const horizontal = r() > 0.5;
        for (let j = 0; j < len; j++) {
          if (horizontal) set(tiles, sx + j, sy, T.WALL, w, h);
          else set(tiles, sx, sy + j, T.WALL, w, h);
        }
      }
      break;
    }
    case 3: {
      // Scattered clusters of pillars — organic cave formations
      for (let i = 0; i < 5; i++) {
        const cx = 3 + Math.floor(r() * (w - 6));
        const cy = 3 + Math.floor(r() * (h - 6));
        const sz = 1 + Math.floor(r() * 3);
        for (let dy = -sz; dy <= sz; dy++)
          for (let dx = -sz; dx <= sz; dx++)
            if (Math.hypot(dx, dy) <= sz && r() > 0.4)
              set(tiles, cx + dx, cy + dy, pillarTile, w, h);
      }
      break;
    }
  }
}

function genGrotto(tiles, w, h, objects, doors, r, floor) {
  const biome = getGrottoBiome(floor);
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);

  // ── Biome-specific floor tint variation ──
  if (biome.id === 'moss' || biome.id === 'bone') {
    scatter(tiles, T.DARK_DIRT, 8, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
  }

  // ── Biome-specific ground variation and decorations ──
  switch (biome.id) {
    case 'moss':
      // Damp caverns — moss patches, mushrooms, ferns, green crystals
      scatter(tiles, T.MOSS, 20, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.MUSHROOM, 12, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.FERN, 15, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      cluster(tiles, T.CRYSTAL, 5, 5, 3, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.CRYSTAL, w - 5, h - 5, 2, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.ROCK, 4, h - 4, 3, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.ROCK, w - 4, 4, 3, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      break;
    case 'crystal':
      // Glittering crystal caves — dense crystal formations, stone circles
      cluster(tiles, T.CRYSTAL, 5, 5, 6, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.CRYSTAL, w - 5, h - 5, 5, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.CRYSTAL, w - 5, 5, 4, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.CRYSTAL, 5, h - 5, 4, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      scatter(tiles, T.STONE_CIRCLE, 5, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.PEBBLE, 15, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      break;
    case 'bone':
      // Ossuary tunnels — bones, skulls, graves, spider webs
      scatter(tiles, T.BONE_PILE, 12, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.DARK_DIRT, 15, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.SPIDER_WEB, 8, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      cluster(tiles, T.SKULL_TOTEM, 5, 5, 2, r, w, h, 1, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.SKULL_TOTEM, w - 5, h - 5, 2, r, w, h, 1, (x, y) => tiles[y][x] !== T.FLOOR);
      scatter(tiles, T.GRAVE_CROSS, 4, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.ROCK, 6, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      break;
    case 'frost':
      // Frozen depths — ice crystals, frost pebbles, pale moss
      cluster(tiles, T.CRYSTAL, 5, 5, 5, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.CRYSTAL, w - 5, h - 5, 4, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.CRYSTAL, w - 5, 5, 3, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      scatter(tiles, T.PEBBLE, 20, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.MOSS, 10, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.STONE_CIRCLE, 4, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      // frozen pool — random size and position, not every floor
      maybePond(tiles, w, h, r, T.DEEP_WATER, 0.45);
      break;
    case 'lava':
      // Ember pits — scorched earth, campfires, volcanic rock
      scatter(tiles, T.DARK_DIRT, 25, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      cluster(tiles, T.ROCK, 5, 5, 5, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.ROCK, w - 5, h - 5, 5, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.ROCK, w - 5, 5, 4, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.ROCK, 5, h - 5, 4, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      // ember patches
      for (let i = 0; i < 4; i++) {
        const ex = 3 + Math.floor(r() * (w - 6));
        const ey = 3 + Math.floor(r() * (h - 6));
        if (tiles[ey][ex] === T.FLOOR) tiles[ey][ex] = T.CAMPFIRE;
      }
      scatter(tiles, T.PEBBLE, 10, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      break;
    case 'abyss':
      // Abyssal depths — void stones, dark crystals, bone offerings
      cluster(tiles, T.CRYSTAL, 5, 5, 4, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.CRYSTAL, w - 5, h - 5, 4, r, w, h, 3, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.SKULL_TOTEM, w - 5, 5, 3, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      cluster(tiles, T.SKULL_TOTEM, 5, h - 5, 3, r, w, h, 2, (x, y) => tiles[y][x] !== T.FLOOR);
      scatter(tiles, T.BONE_PILE, 8, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.DARK_DIRT, 12, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      scatter(tiles, T.STONE_CIRCLE, 6, r, w, h, (x, y) => tiles[y][x] === T.FLOOR);
      // void pool — random, not every floor
      maybePond(tiles, w, h, r, T.DEEP_WATER, 0.5);
      break;
  }

  // ── Structural variety — biome-specific pillar/wall layouts ──
  genGrottoStructure(tiles, w, h, r, biome);

  // deep water fishing pool — random, only ~50% of qualifying floors
  if (floor >= 20 && biome.id !== 'frost' && biome.id !== 'abyss') {
    maybePond(tiles, w, h, r, T.DEEP_WATER, 0.5);
  }

  // corner lanterns
  tiles[2][2] = T.LANTERN_FLOOR;
  tiles[2][w - 3] = T.LANTERN_FLOOR;
  tiles[h - 3][2] = T.LANTERN_FLOOR;
  tiles[h - 3][w - 3] = T.LANTERN_FLOOR;

  // stairs up at top center
  tiles[1][Math.floor(w / 2)] = T.STAIRS_UP;
  tiles[h - 3][Math.floor(w / 2) - 1] = T.LANTERN_FLOOR;
  tiles[h - 3][Math.floor(w / 2) + 1] = T.LANTERN_FLOOR;

  // ── Waystone — fast travel to any reached floor (placed near stairs up) ──
  tiles[1][Math.floor(w / 2) - 2] = T.WAYSTONE;
  tiles[2][Math.floor(w / 2) - 2] = T.LANTERN_FLOOR;

  // ── Surface portal every 10 floors — escape back to the haunted forest ──
  if (floor % 10 === 0) {
    tiles[1][Math.floor(w / 2) + 2] = T.SURFACE_PORTAL;
    tiles[2][Math.floor(w / 2) + 2] = T.CANDLES;
    tiles[2][Math.floor(w / 2) + 1] = T.LANTERN_FLOOR;
  }

  // Floor 50+: lighthouse key chest on the middle-right side
  // (moved from bottom-center so it's clearly visible and not lost in corners)
  if (floor >= GROTTO_BOTTOM) {
    const kcx = w - 4;
    const kcy = Math.floor(h / 2);
    tiles[kcy][kcx] = T.LIGHTHOUSE_KEY_CHEST;
    // light it up so it's easy to spot in the dark grotto
    tiles[kcy][kcx - 1] = T.CANDLES;
    tiles[kcy][kcx + 1] = T.LANTERN_FLOOR;
    tiles[kcy - 1][kcx] = T.LANTERN_FLOOR;
    tiles[kcy + 1][kcx] = T.LANTERN_FLOOR;
  }
  // Stairs down on every floor (including 50 and 100) so the player can always descend
  tiles[h - 2][Math.floor(w / 2)] = T.STAIRS_DOWN;
  // Prize chest every 10th floor — boss floors (50, 100) place it off-center
  // so the boss (which spawns at exact center) doesn't get stuck on the solid chest
  if (floor % 10 === 0) {
    const pcx = Math.floor(w / 2) - 4;
    const pcy = Math.floor(h / 2);
    tiles[pcy][pcx] = T.GROTTO_CHEST;
    tiles[pcy][pcx - 1] = T.CANDLES;
    tiles[pcy][pcx + 1] = T.CANDLES;
  }
}

export const NPC_PLACEMENT = {
  town: [
    // ── Romanceable NPCs (stand outside their homes) ──
    { id: 'rowan', x: 38, y: 14, name: 'Rowan', color: '#7a5a3a', romanceable: true,
      lines: ['...You again. Come to bother me?',
              'I was just finishing a carving. You can watch, if you keep quiet.',
              'The wood remembers. So do I.'] },
    { id: 'willow', x: 16, y: 9, name: 'Willow', color: '#6a9a5a', romanceable: true,
      lines: ['Oh, hello! I was just watering the garden.',
              'The herbs are thriving today. The island is generous.',
              'You should come by for tea sometime!'] },
    { id: 'finn', x: 4, y: 14, name: 'Finn', color: '#4a7aaa', romanceable: true,
      lines: ['Ahoy! Perfect timing — the fish are biting today!',
              'The sea was calm this morning. Good omen, I think.',
              'You ever been on a boat? I should take you out sometime!'] },
    { id: 'luna', x: 37, y: 25, name: 'Luna', color: '#8a6aaa', romanceable: true,
      lines: ['The stars were... talkative last night. About you, interestingly.',
              'I sense something different about you. The crystals agree.',
              'Come by my tower sometime. I have things to show you.'] },
    { id: 'dante', x: 16, y: 27, name: 'Dante', color: '#aa5a4a', romanceable: true,
      lines: ['I was just painting. The light is... adequate today.',
              'You have an interesting silhouette. I mean that artistically. Mostly.',
              'This town is full of ghosts. But you\'re not one. Not yet.'] },
    // ── Original NPCs ──
    { id: 'mabel', x: 22, y: 10, name: 'Mabel', color: '#a07a5a', shop: true,
      lines: ['Welcome to my general store! Buy what you need, sell what you\'ve found.',
              'The fish market across the square sells tanks for your prize catches.',
              'Old saloon hasn\'t been open in years. Shame — it was the heart of this town.'] },
    { id: 'mayor', x: 33, y: 15, name: 'Mayor Goodfellow', color: '#5a6a8a',
      lines: ['Welcome to Pinebrook. I\'m the mayor — though there aren\'t many left to govern.',
              'The lighthouse on the western shore has been dark for decades. Some say it holds answers.',
              'If you\'re looking for adventure, the Grotto beneath the forest goes deep. Very deep.',
              'My son Thomas... he passed, years ago. The island takes so much from us all.',
              'Some say they hear sounds from my cellar at night. Rats. Just rats. Pay it no mind.'] },
    { id: 'patricia', x: 11, y: 20, name: 'Crazy Patricia', color: '#9a6aaa',
      lines: ['They think I\'m crazy! But I\'ve SEEN things. The lights in the forest aren\'t fireflies.',
              'The lighthouse... it calls to me in dreams. Three requirements, it says. THREE!',
              'You want to open the saloon? Bring wood, lots of wood. And stone. And maybe some courage.'] },
    { id: 'bartender', x: 33, y: 20, name: 'Old Gus', color: '#6a5a3a',
      lines: ['This here saloon\'s been shut since the last storm took the roof.',
              'You bring me enough wood and stone, I\'ll help you fix \'er up. She\'ll be grand again.',
              'A cold drink and a warm fire... that\'s all a person needs.',
              'Mayor Goodfellow\'s a strange one. Always working late, always smelling of chemicals. But he\'s kept this town together, so nobody asks questions.'] },
    { id: 'fishmonger', x: 22, y: 25, name: 'Bait Betty', color: '#4a8aaa', shop: true, shopType: 'fishmonger',
      lines: ['Fish market! Best bait and gear on the island! Stock up before you cast.',
              'Premium bait doubles your catch zone — worth every coin for them rare ones!',
              'A tackle box pays for itself — ten percent more on every fish you sell.',
              'The deep grotto waters have fish nobody\'s ever seen. Past floor 20, they say.'] },
  ],
  haunted_forest: [
    { id: 'wren', x: 30, y: 20, name: 'Wren', color: '#6a8a5a',
      lines: ['You smell like the sea. I haven\'t seen the sea in... how long?',
              'The stones in the clearing hum when the moon is right. I don\'t go near them anymore.',
              'Fritz. Good cat. Cats see things we can\'t. Trust him.',
              'The Grotto entrance is to the east. Be careful down there.'] },
  ],
};