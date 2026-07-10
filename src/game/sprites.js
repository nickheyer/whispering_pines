// Procedural pixel-art sprite drawing on canvas
import { drawSwordBlade } from './swordStyles';
import { TILE, SCALE, T, COLORS } from './constants';
import { drawEnemySprite } from './enemySprites';

// Lantern glow overlay flag — set by renderer3d when the lantern tool is active
let _lanternOn = false;
export function setLanternOn(v) { _lanternOn = !!v; }

function drawLanternOverlay(ctx, x, y, s, dir, leanX, leanY, bob) {
  if (!_lanternOn) return;
  const cx = x + s / 2 + leanX;
  const cy = y + s / 2 + leanY + bob;
  let armX, armY;
  // arm extends outward in the facing direction — clearly visible
  const armLen = s * 0.42;
  switch (dir) {
    case 0: armX = cx + s * 0.15; armY = cy + armLen; break;
    case 1: armX = cx + s * 0.15; armY = cy - armLen; break;
    case 2: armX = cx - armLen; armY = cy + s * 0.08; break;
    case 3: armX = cx + armLen; armY = cy + s * 0.08; break;
  }
  // arm — drawn from shoulder to wrist, clearly extending outward
  const skin = '#e0b890';
  const skinShade = '#c0a070';
  const shoulderX = cx + (dir === 3 ? s * 0.1 : dir === 2 ? -s * 0.1 : s * 0.05);
  const shoulderY = cy + s * 0.05;
  // arm rectangle from shoulder to hand
  const armDx = armX - shoulderX;
  const armDy = armY - shoulderY;
  const armThick = s * 0.1;
  ctx.fillStyle = skin;
  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(Math.atan2(armDy, armDx));
  ctx.fillRect(0, -armThick / 2, Math.hypot(armDx, armDy), armThick);
  ctx.fillStyle = skinShade;
  ctx.fillRect(0, armThick / 2 - s * 0.02, Math.hypot(armDx, armDy), s * 0.02);
  ctx.restore();
  // hand
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(armX, armY, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // lantern position — hangs below the hand
  const lx = Math.floor(armX);
  const ly = Math.floor(armY + s * 0.12);
  // glow halo — large and bright
  const grad = ctx.createRadialGradient(lx, ly + s * 0.05, 0, lx, ly + s * 0.05, s * 0.5);
  grad.addColorStop(0, 'rgba(255,220,130,0.95)');
  grad.addColorStop(0.3, 'rgba(255,180,70,0.5)');
  grad.addColorStop(0.6, 'rgba(255,150,50,0.25)');
  grad.addColorStop(1, 'rgba(255,140,40,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(lx, ly + s * 0.05, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // lantern frame — top ring
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(lx - Math.ceil(s * 0.07), ly - Math.ceil(s * 0.04), Math.ceil(s * 0.14), Math.ceil(s * 0.03));
  // lantern body — cage frame
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(lx - Math.ceil(s * 0.07), ly - Math.ceil(s * 0.02), Math.ceil(s * 0.03), Math.ceil(s * 0.18));
  ctx.fillRect(lx + Math.ceil(s * 0.04), ly - Math.ceil(s * 0.02), Math.ceil(s * 0.03), Math.ceil(s * 0.18));
  // glowing glass — bright center
  ctx.fillStyle = '#ffd966';
  ctx.fillRect(lx - Math.ceil(s * 0.04), ly, Math.ceil(s * 0.08), Math.ceil(s * 0.14));
  // inner flame glow
  ctx.fillStyle = 'rgba(255,200,80,0.7)';
  ctx.fillRect(lx - Math.ceil(s * 0.025), ly + Math.ceil(s * 0.02), Math.ceil(s * 0.05), Math.ceil(s * 0.08));
  // bottom cap
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(lx - Math.ceil(s * 0.07), ly + Math.ceil(s * 0.15), Math.ceil(s * 0.14), Math.ceil(s * 0.03));
  // top handle — small loop
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = Math.ceil(s * 0.02);
  ctx.beginPath();
  ctx.arc(lx, ly - Math.ceil(s * 0.06), Math.ceil(s * 0.04), 0, Math.PI);
  ctx.stroke();
}
import {
  drawWall as drawWallEnhanced, drawDoor as drawDoorEnhanced, drawWindow as drawWindowEnhanced,
  drawFloor as drawFloorEnhanced, drawRug as drawRugEnhanced, drawBed as drawBedEnhanced,
  drawTable as drawTableEnhanced, drawChair as drawChairEnhanced, drawChest as drawChestEnhanced,
  drawStove as drawStoveEnhanced, drawBookshelf as drawBookshelfEnhanced, drawPumpkin as drawPumpkinEnhanced,
  drawCandles as drawCandlesEnhanced, drawPainting as drawPaintingEnhanced, drawPlantPot as drawPlantPotEnhanced,
  drawCrate as drawCrateEnhanced, drawBarrel as drawBarrelEnhanced, drawWorkbench as drawWorkbenchEnhanced,
  drawWell as drawWellEnhanced, drawLanternPost as drawLanternPostEnhanced, drawLanternFloor as drawLanternFloorEnhanced,
  drawCampfire as drawCampfireEnhanced, drawRoof as drawRoofEnhanced, drawBench as drawBenchEnhanced,
} from './buildingSprites';
import { drawPlayerSide } from './playerSideView';

const PX = TILE * SCALE;

// Module-level current tile coords (set by drawTile)
let _tx = 0, _ty = 0;

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

// Deterministic per-tile hash (stable regardless of camera position)
function tileHash() {
  let h = (_tx * 73856093) ^ (_ty * 19349663);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---- Tile drawing ----
export function drawTile(ctx, id, ox, oy, tileData, tx, ty) {
  _tx = tx; _ty = ty;
  const s = PX;
  // base ground first (most tiles sit on grass/sand/floor)
  switch (id) {
    case T.GRASS:
    case T.FLOWER:
    case T.MUSHROOM:
    case T.PEBBLE:
    case T.TILLED:
    case T.PLANT_POT:
    case T.RUG:
    case T.PUMPKIN:
    case T.CANDLES:
    case T.LANTERN_FLOOR:
      fillTile(ctx, ox, oy, COLORS.grass, s); break;
    case T.DARK_GRASS:
    case T.MOSS:
      fillTile(ctx, ox, oy, COLORS.darkGrass, s); break;
    case T.SAND:
    case T.DOCK:
    case T.BRIDGE:
      fillTile(ctx, ox, oy, COLORS.sand, s); break;
    case T.WATER:
    case T.LILY:
      fillTile(ctx, ox, oy, COLORS.water, s); break;
    case T.DEEP_WATER:
      fillTile(ctx, ox, oy, COLORS.deepWater, s); break;
    case T.PATH:
      fillTile(ctx, ox, oy, COLORS.path, s); break;
    case T.FLOOR:
    case T.WALL:
    case T.DOOR:
    case T.ROOF:
    case T.BED:
    case T.TABLE:
    case T.CHAIR:
    case T.CHEST:
    case T.STOVE:
    case T.WINDOW:
    case T.BOOKSHELF:
    case T.PAINTING:
    case T.CRATE:
    case T.BARREL:
    case T.ANVIL:
    case T.WORKBENCH:
      fillTile(ctx, ox, oy, COLORS.floor, s); break;
    case T.BENCH:
      fillTile(ctx, ox, oy, COLORS.grass, s); break;
    case T.STONE:
    case T.DARK_DIRT:
    case T.STONE_CIRCLE:
    case T.ROCK:
    case T.CRYSTAL:
    case T.STATUE:
    case T.STAIRS_DOWN:
    case T.STAIRS_UP:
    case T.GROTTO_CHEST:
      fillTile(ctx, ox, oy, COLORS.stone, s); break;
    case T.RUIN:
    case T.GRAVE:
    case T.GRAVESTONE:
    case T.BONE_PILE:
    case T.SKULL_TOTEM:
    case T.HANGING_MOSS:
    case T.GRAVE_CROSS:
    case T.SPIDER_WEB:
    case T.WITCH_TOME:
      fillTile(ctx, ox, oy, COLORS.darkGrass, s); break;
    case T.TREE:
    case T.TWISTED_TREE:
    case T.PINE:
    case T.OAK:
    case T.BIRCH:
    case T.WILLOW:
    case T.DEAD_TREE:
    case T.BUSH:
    case T.BERRY_BUSH:
    case T.FALLEN_LOG:
    case T.STUMP:
    case T.FERN:
    case T.TALL_GRASS:
      fillTile(ctx, ox, oy, COLORS.grass, s); break;
    case T.LANTERN_POST:
      fillTile(ctx, ox, oy, COLORS.grass, s); break;
    case T.FENCE:
    case T.WELL:
    case T.CAMPFIRE:
      fillTile(ctx, ox, oy, COLORS.grass, s); break;
    case T.SIGN:
      fillTile(ctx, ox, oy, COLORS.grass, s); break;
    default:
      fillTile(ctx, ox, oy, COLORS.grass, s);
  }

  // details / objects on top
  switch (id) {
    case T.WATER: waterDetail(ctx, ox, oy, s); break;
    case T.DEEP_WATER: waterDetail(ctx, ox, oy, s, true); break;
    case T.TREE: drawTree(ctx, ox, oy, s, false); break;
    case T.TWISTED_TREE: drawTree(ctx, ox, oy, s, true); break;
    case T.PINE: drawPine(ctx, ox, oy, s); break;
    case T.BUSH: drawBush(ctx, ox, oy, s); break;
    case T.FLOWER: drawFlower(ctx, ox, oy, s); break;
    case T.MUSHROOM: drawMushroom(ctx, ox, oy, s); break;
    case T.PEBBLE: drawPebble(ctx, ox, oy, s); break;
    case T.ROCK: drawRock(ctx, ox, oy, s); break;
    case T.RUIN: drawRuin(ctx, ox, oy, s); break;
    case T.FALLEN_LOG: drawLog(ctx, ox, oy, s); break;
    case T.LANTERN_POST: drawLanternPostEnhanced(ctx, ox, oy, s); break;
    case T.LANTERN_FLOOR: drawLanternFloorEnhanced(ctx, ox, oy, s); break;
    case T.STONE_CIRCLE: drawStoneCircle(ctx, ox, oy, s); break;
    case T.CRYSTAL: drawCrystal(ctx, ox, oy, s); break;
    case T.GRAVE: drawGrave(ctx, ox, oy, s, false); break;
    case T.GRAVESTONE: drawGrave(ctx, ox, oy, s, true); break;
    case T.STATUE: drawStatue(ctx, ox, oy, s); break;
    case T.STAIRS_DOWN: drawStairsDown(ctx, ox, oy, s); break;
    case T.STAIRS_UP: drawStairsUp(ctx, ox, oy, s); break;
    case T.GROTTO_CHEST: drawGrottoChest(ctx, ox, oy, s); break;
    case T.CAVE: drawCave(ctx, ox, oy, s); break;
    case T.WELL: drawWellEnhanced(ctx, ox, oy, s); break;
    case T.CAMPFIRE: drawCampfireEnhanced(ctx, ox, oy, s, tileHash); break;
    case T.PATH: pathDetail(ctx, ox, oy, s); break;
    case T.DOOR: drawDoorEnhanced(ctx, ox, oy, s, tileHash); break;
    case T.WALL: drawWallEnhanced(ctx, ox, oy, s, tileHash); break;
    case T.FLOOR: drawFloorEnhanced(ctx, ox, oy, s, tileHash); break;
    case T.RUG: drawRugEnhanced(ctx, ox, oy, s); break;
    case T.BED: drawBedEnhanced(ctx, ox, oy, s); break;
    case T.TABLE: drawTableEnhanced(ctx, ox, oy, s); break;
    case T.CHAIR: drawChairEnhanced(ctx, ox, oy, s); break;
    case T.CHEST: drawChestEnhanced(ctx, ox, oy, s); break;
    case T.STOVE: drawStoveEnhanced(ctx, ox, oy, s); break;
    case T.WINDOW: drawWindowEnhanced(ctx, ox, oy, s, tileHash); break;
    case T.BOOKSHELF: drawBookshelfEnhanced(ctx, ox, oy, s); break;
    case T.PUMPKIN: drawPumpkinEnhanced(ctx, ox, oy, s); break;
    case T.CANDLES: drawCandlesEnhanced(ctx, ox, oy, s); break;
    case T.PAINTING: drawPaintingEnhanced(ctx, ox, oy, s); break;
    case T.PLANT_POT: drawPlantPotEnhanced(ctx, ox, oy, s); break;
    case T.CRATE: drawCrateEnhanced(ctx, ox, oy, s); break;
    case T.BARREL: drawBarrelEnhanced(ctx, ox, oy, s); break;
    case T.WORKBENCH: drawWorkbenchEnhanced(ctx, ox, oy, s); break;
    case T.TILLED: drawTilled(ctx, ox, oy, s, tileData); break;
    case T.LILY: drawLily(ctx, ox, oy, s); break;
    case T.BRIDGE: drawBridge(ctx, ox, oy, s); break;
    case T.DOCK: drawDock(ctx, ox, oy, s); break;
    case T.DARK_DIRT: px(ctx, ox + s * 0.2, oy + s * 0.2, s * 0.6, s * 0.6, COLORS.trunk); break;
    case T.OAK: drawOak(ctx, ox, oy, s); break;
    case T.BIRCH: drawBirch(ctx, ox, oy, s); break;
    case T.WILLOW: drawWillow(ctx, ox, oy, s); break;
    case T.DEAD_TREE: drawDeadTree(ctx, ox, oy, s); break;
    case T.FERN: drawFern(ctx, ox, oy, s); break;
    case T.TALL_GRASS: drawTallGrass(ctx, ox, oy, s); break;
    case T.BERRY_BUSH: drawBerryBush(ctx, ox, oy, s); break;
    case T.STUMP: drawStump(ctx, ox, oy, s); break;
    case T.ROOF: drawRoofEnhanced(ctx, ox, oy, s, tileHash); break;
    case T.BENCH: drawBenchEnhanced(ctx, ox, oy, s); break;
    default: break;
  }
}

function fillTile(ctx, ox, oy, palette, s) {
  // base fill
  px(ctx, ox, oy, s, s, palette[0]);
  const n = tileHash();
  const n2 = (n * 137) % 1;
  const n3 = (n * 263) % 1;
  // organic patches — layered for depth
  if (n > 0.10) px(ctx, ox + s * 0.18, oy + s * 0.12, s * 0.5, s * 0.42, palette[1]);
  if (n > 0.35) px(ctx, ox + s * 0.05, oy + s * 0.5, s * 0.38, s * 0.34, palette[2]);
  if (n > 0.55) px(ctx, ox + s * 0.55, oy + s * 0.45, s * 0.35, s * 0.3, palette[1]);
  if (n > 0.78) px(ctx, ox + s * 0.35, oy + s * 0.05, s * 0.22, s * 0.18, palette[2]);
  // subtle edge shadows for 3D depth
  px(ctx, ox, oy + s - 2, s, 2, 'rgba(0,0,0,0.08)');
  px(ctx, ox + s - 2, oy, 2, s, 'rgba(0,0,0,0.06)');
  // small detail specks
  if (n2 > 0.3) px(ctx, ox + s * 0.72, oy + s * 0.12, s * 0.05, s * 0.05, palette[2]);
  if (n2 > 0.75) px(ctx, ox + s * 0.12, oy + s * 0.82, s * 0.04, s * 0.04, palette[1]);
  if (n3 > 0.5) px(ctx, ox + s * 0.85, oy + s * 0.68, s * 0.04, s * 0.04, palette[2]);
  // grass blade highlights
  if (n2 > 0.4) {
    px(ctx, ox + s * 0.2 + n2 * s * 0.3, oy + s * 0.7, s * 0.02, s * 0.12, palette[2]);
    px(ctx, ox + s * 0.5 + n2 * s * 0.2, oy + s * 0.75, s * 0.02, s * 0.1, palette[1]);
  }
  if (n2 > 0.7) {
    px(ctx, ox + s * 0.8 - n2 * s * 0.1, oy + s * 0.4, s * 0.02, s * 0.08, palette[2]);
  }
}

function waterDetail(ctx, ox, oy, s, deep) {
  const t = performance.now() / 600;
  const wave = Math.sin(t + _tx * 0.5 + _ty * 0.3) * s * 0.04;
  const wave2 = Math.cos(t * 0.7 + _tx * 0.3 - _ty * 0.5) * s * 0.03;
  const c1 = deep ? '#3a6080' : '#4a7090';
  const c2 = deep ? '#5080a0' : '#6a90b0';
  const c3 = deep ? '#2a5070' : '#3a6080';
  const c4 = deep ? '#6090b0' : '#80b0d0';
  // animated wave lines (layered)
  px(ctx, ox + s * 0.15, oy + s * 0.3 + wave, s * 0.4, s * 0.04, c1);
  px(ctx, ox + s * 0.5, oy + s * 0.7 - wave, s * 0.3, s * 0.04, c1);
  px(ctx, ox + s * 0.1, oy + s * 0.55 + wave * 0.5, s * 0.15, s * 0.03, c2);
  px(ctx, ox + s * 0.65, oy + s * 0.2 - wave * 0.5, s * 0.12, s * 0.03, c2);
  px(ctx, ox + s * 0.3, oy + s * 0.45 + wave2, s * 0.2, s * 0.03, c3);
  px(ctx, ox + s * 0.55, oy + s * 0.5 + wave2 * 0.7, s * 0.15, s * 0.02, c3);
  // sparkle highlights
  const sp = tileHash();
  if (sp > 0.88) px(ctx, ox + s * 0.4, oy + s * 0.4, s * 0.05, s * 0.05, c4);
  if (sp > 0.95) px(ctx, ox + s * 0.7, oy + s * 0.6, s * 0.04, s * 0.04, c4);
}

function pathDetail(ctx, ox, oy, s) {
  const n = tileHash();
  if (n > 0.5) px(ctx, ox + s * 0.25, oy + s * 0.3, s * 0.22, s * 0.18, '#5c4f3d');
  if (n > 0.75) px(ctx, ox + s * 0.6, oy + s * 0.6, s * 0.15, s * 0.12, '#6b5d48');
  if (n > 0.85) px(ctx, ox + s * 0.7, oy + s * 0.2, s * 0.06, s * 0.06, '#5c4f3d');
}

function drawTree(ctx, ox, oy, s, twisted) {
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.95, s * 0.38, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // trunk with bark texture
  px(ctx, ox + s * 0.42, oy + s * 0.5, s * 0.16, s * 0.45, COLORS.trunk[0]);
  px(ctx, ox + s * 0.44, oy + s * 0.5, s * 0.08, s * 0.45, COLORS.trunk[1]);
  px(ctx, ox + s * 0.46, oy + s * 0.6, s * 0.03, s * 0.2, '#1a0f08');
  px(ctx, ox + s * 0.42, oy + s * 0.7, s * 0.03, s * 0.15, '#0a0805');
  // canopy
  const c = twisted ? ['#15281a', '#0a1a0f', '#1a3320', '#0d1e12'] : ['#2a3a2a', '#1f2f1f', '#3a4f3a', '#1a2a1a'];
  const cx = ox + s * 0.5, cy = oy + s * 0.3;
  if (twisted) {
    // dark gnarled canopy
    px(ctx, cx - s * 0.32, cy - s * 0.1, s * 0.28, s * 0.32, c[0]);
    px(ctx, cx + s * 0.02, cy - s * 0.28, s * 0.28, s * 0.32, c[1]);
    px(ctx, cx - s * 0.18, cy + s * 0.05, s * 0.38, s * 0.28, c[0]);
    px(ctx, cx + s * 0.08, cy + s * 0.1, s * 0.22, s * 0.22, c[1]);
    px(ctx, cx - s * 0.25, cy - s * 0.05, s * 0.12, s * 0.15, c[2]);
    px(ctx, cx + s * 0.15, cy - s * 0.15, s * 0.08, s * 0.1, c[2]);
    // bare branches
    px(ctx, cx + s * 0.3, cy + s * 0.0, s * 0.04, s * 0.15, COLORS.trunk[1]);
    px(ctx, cx - s * 0.35, cy - s * 0.2, s * 0.04, s * 0.12, COLORS.trunk[1]);
  } else {
    // layered round canopy with depth
    px(ctx, cx - s * 0.38, cy - s * 0.12, s * 0.76, s * 0.58, c[3]);
    px(ctx, cx - s * 0.34, cy - s * 0.08, s * 0.68, s * 0.5, c[0]);
    px(ctx, cx - s * 0.22, cy - s * 0.32, s * 0.44, s * 0.34, c[1]);
    px(ctx, cx - s * 0.3, cy - s * 0.08, s * 0.2, s * 0.2, c[2]);
    px(ctx, cx + s * 0.1, cy - s * 0.05, s * 0.15, s * 0.15, c[2]);
    px(ctx, cx + s * 0.2, cy + s * 0.1, s * 0.1, s * 0.1, c[2]);
  }
}

function drawPine(ctx, ox, oy, s) {
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.95, s * 0.3, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // trunk
  px(ctx, ox + s * 0.44, oy + s * 0.55, s * 0.12, s * 0.4, COLORS.trunk[0]);
  px(ctx, ox + s * 0.46, oy + s * 0.55, s * 0.04, s * 0.4, COLORS.trunk[1]);
  // layered triangular canopy
  const c = COLORS.pine;
  px(ctx, ox + s * 0.18, oy + s * 0.3, s * 0.64, s * 0.2, c[0]);
  px(ctx, ox + s * 0.13, oy + s * 0.12, s * 0.74, s * 0.2, c[1]);
  px(ctx, ox + s * 0.22, oy + s * 0.0, s * 0.56, s * 0.18, c[0]);
  px(ctx, ox + s * 0.28, oy + s * 0.32, s * 0.16, s * 0.12, c[1]);
}

function drawBush(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.15, oy + s * 0.3, s * 0.7, s * 0.5, COLORS.tree[0]);
  px(ctx, ox + s * 0.35, oy + s * 0.2, s * 0.3, s * 0.2, COLORS.tree[1]);
}

function drawFlower(ctx, ox, oy, s) {
  const cols = COLORS.flower;
  const n = tileHash();
  const col = n > 0.66 ? cols[0] : n > 0.33 ? cols[1] : cols[2];
  const sway = Math.sin(performance.now() / 700 + _tx * 0.7) * s * 0.03;
  px(ctx, ox + s * 0.4 + sway * 0.5, oy + s * 0.5, s * 0.04, s * 0.3, '#5a8a4a');
  px(ctx, ox + s * 0.32 + sway, oy + s * 0.42, s * 0.16, s * 0.16, col);
  px(ctx, ox + s * 0.36 + sway, oy + s * 0.44, s * 0.04, s * 0.04, '#fff8e0');
}

function drawMushroom(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.42, oy + s * 0.5, s * 0.1, s * 0.25, '#e0d0b0');
  px(ctx, ox + s * 0.32, oy + s * 0.35, s * 0.3, s * 0.2, '#b0605a');
  px(ctx, ox + s * 0.4, oy + s * 0.4, s * 0.05, s * 0.05, '#d08070');
}

function drawPebble(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.3, oy + s * 0.5, s * 0.3, s * 0.2, '#8a8a8e');
  px(ctx, ox + s * 0.35, oy + s * 0.48, s * 0.1, s * 0.08, '#a0a0a4');
}

function drawRock(ctx, ox, oy, s) {
  const n = tileHash();
  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.92, s * 0.38, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // dark base shape (irregular)
  px(ctx, ox + s * 0.08, oy + s * 0.38, s * 0.84, s * 0.5, '#363640');
  px(ctx, ox + s * 0.16, oy + s * 0.26, s * 0.68, s * 0.28, '#363640');
  px(ctx, ox + s * 0.06, oy + s * 0.48, s * 0.2, s * 0.3, '#363640');
  // mid-tone body
  px(ctx, ox + s * 0.12, oy + s * 0.34, s * 0.76, s * 0.44, '#52525c');
  px(ctx, ox + s * 0.2, oy + s * 0.24, s * 0.58, s * 0.24, '#52525c');
  // upper highlight face
  px(ctx, ox + s * 0.18, oy + s * 0.28, s * 0.52, s * 0.2, '#6a6a74');
  px(ctx, ox + s * 0.26, oy + s * 0.2, s * 0.38, s * 0.14, '#6a6a74');
  // bright top edge
  px(ctx, ox + s * 0.24, oy + s * 0.24, s * 0.3, s * 0.07, '#808088');
  px(ctx, ox + s * 0.32, oy + s * 0.2, s * 0.16, s * 0.05, '#8a8a92');
  // dark crevices and cracks
  px(ctx, ox + s * 0.44, oy + s * 0.38, s * 0.03, s * 0.3, '#262630');
  px(ctx, ox + s * 0.58, oy + s * 0.5, s * 0.12, s * 0.02, '#262630');
  px(ctx, ox + s * 0.2, oy + s * 0.55, s * 0.15, s * 0.02, '#262630');
  // facet lines
  px(ctx, ox + s * 0.35, oy + s * 0.42, s * 0.02, s * 0.2, '#42424c');
  px(ctx, ox + s * 0.62, oy + s * 0.35, s * 0.02, s * 0.15, '#42424c');
  // moss patches (deterministic)
  if (n > 0.35) {
    px(ctx, ox + s * 0.1, oy + s * 0.68, s * 0.24, s * 0.07, '#3e5e34');
    px(ctx, ox + s * 0.14, oy + s * 0.65, s * 0.12, s * 0.04, '#4e6e44');
  }
  if (n > 0.65) {
    px(ctx, ox + s * 0.66, oy + s * 0.72, s * 0.18, s * 0.06, '#3e5e34');
    px(ctx, ox + s * 0.7, oy + s * 0.7, s * 0.08, s * 0.03, '#4e6e44');
  }
  if (n > 0.85) {
    px(ctx, ox + s * 0.4, oy + s * 0.3, s * 0.1, s * 0.04, '#4e6e44');
  }
  // small pebble beside
  if (n > 0.8) {
    px(ctx, ox + s * 0.76, oy + s * 0.82, s * 0.12, s * 0.1, '#52525c');
    px(ctx, ox + s * 0.78, oy + s * 0.84, s * 0.07, s * 0.05, '#6a6a74');
  }
}

function drawRuin(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.2, oy + s * 0.5, s * 0.6, s * 0.3, COLORS.ruin[0]);
  px(ctx, ox + s * 0.25, oy + s * 0.3, s * 0.3, s * 0.25, COLORS.ruin[1]);
  px(ctx, ox + s * 0.5, oy + s * 0.55, s * 0.2, s * 0.15, COLORS.ruin[2]);
}

function drawLog(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.1, oy + s * 0.55, s * 0.8, s * 0.2, COLORS.trunk[0]);
  px(ctx, ox + s * 0.1, oy + s * 0.55, s * 0.1, s * 0.2, COLORS.trunk[1]);
  px(ctx, ox + s * 0.8, oy + s * 0.55, s * 0.1, s * 0.2, COLORS.trunk[1]);
  // bark texture lines
  px(ctx, ox + s * 0.3, oy + s * 0.57, s * 0.04, s * 0.16, '#1a0f08');
  px(ctx, ox + s * 0.55, oy + s * 0.57, s * 0.03, s * 0.14, '#1a0f08');
  // moss on log
  const n = tileHash();
  if (n > 0.4) px(ctx, ox + s * 0.2, oy + s * 0.55, s * 0.15, s * 0.04, '#3e5e34');
  if (n > 0.7) px(ctx, ox + s * 0.65, oy + s * 0.55, s * 0.12, s * 0.04, '#3e5e34');
}

function drawOak(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.95, s * 0.42, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // thick trunk
  px(ctx, ox + s * 0.38, oy + s * 0.45, s * 0.24, s * 0.5, COLORS.trunk[0]);
  px(ctx, ox + s * 0.42, oy + s * 0.45, s * 0.14, s * 0.5, COLORS.trunk[1]);
  px(ctx, ox + s * 0.44, oy + s * 0.55, s * 0.04, s * 0.3, '#1a0f08');
  px(ctx, ox + s * 0.42, oy + s * 0.7, s * 0.03, s * 0.15, '#0a0805');
  // large spreading canopy (multiple layers)
  const c = ['#2a4228', '#1f3a1f', '#365a34', '#1a2e18'];
  const cx = ox + s * 0.5, cy = oy + s * 0.22;
  px(ctx, cx - s * 0.44, cy - s * 0.08, s * 0.88, s * 0.55, c[3]);
  px(ctx, cx - s * 0.38, cy - s * 0.04, s * 0.76, s * 0.46, c[0]);
  px(ctx, cx - s * 0.28, cy - s * 0.28, s * 0.5, s * 0.36, c[1]);
  px(ctx, cx - s * 0.36, cy - s * 0.02, s * 0.22, s * 0.22, c[2]);
  px(ctx, cx + s * 0.12, cy + s * 0.02, s * 0.2, s * 0.2, c[2]);
  px(ctx, cx - s * 0.1, cy - s * 0.18, s * 0.16, s * 0.16, c[2]);
  px(ctx, cx + s * 0.22, cy - s * 0.1, s * 0.12, s * 0.12, c[2]);
  // acorn dots
  const n = tileHash();
  if (n > 0.5) px(ctx, cx + s * 0.2, cy + s * 0.18, s * 0.04, s * 0.06, '#8a6a2a');
  if (n > 0.8) px(ctx, cx - s * 0.3, cy + s * 0.2, s * 0.04, s * 0.06, '#8a6a2a');
}

function drawBirch(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.95, s * 0.3, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // white trunk with dark patches
  px(ctx, ox + s * 0.42, oy + s * 0.35, s * 0.16, s * 0.6, COLORS.birch[0]);
  px(ctx, ox + s * 0.44, oy + s * 0.4, s * 0.1, s * 0.55, COLORS.birch[1]);
  // black bark patches
  px(ctx, ox + s * 0.43, oy + s * 0.45, s * 0.04, s * 0.06, '#2a2a2a');
  px(ctx, ox + s * 0.5, oy + s * 0.6, s * 0.04, s * 0.05, '#2a2a2a');
  px(ctx, ox + s * 0.45, oy + s * 0.75, s * 0.03, s * 0.04, '#2a2a2a');
  px(ctx, ox + s * 0.48, oy + s * 0.85, s * 0.03, s * 0.03, '#2a2a2a');
  // sparse yellow-green canopy
  const c = ['#8a9a4a', '#7a8a3a', '#9aaa5a'];
  const cx = ox + s * 0.5, cy = oy + s * 0.12;
  px(ctx, cx - s * 0.3, cy - s * 0.05, s * 0.6, s * 0.3, c[1]);
  px(ctx, cx - s * 0.22, cy - s * 0.15, s * 0.44, s * 0.22, c[0]);
  px(ctx, cx + s * 0.05, cy - s * 0.08, s * 0.22, s * 0.22, c[2]);
  px(ctx, cx - s * 0.15, cy + s * 0.05, s * 0.16, s * 0.14, c[2]);
  px(ctx, cx + s * 0.18, cy + s * 0.1, s * 0.12, s * 0.1, c[2]);
}

function drawWillow(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.95, s * 0.35, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // trunk
  px(ctx, ox + s * 0.44, oy + s * 0.35, s * 0.12, s * 0.6, COLORS.trunk[0]);
  px(ctx, ox + s * 0.46, oy + s * 0.35, s * 0.06, s * 0.6, COLORS.trunk[1]);
  // drooping canopy
  const c = COLORS.willow;
  const cx = ox + s * 0.5, cy = oy + s * 0.1;
  // top dome
  px(ctx, cx - s * 0.32, cy - s * 0.05, s * 0.64, s * 0.26, c[0]);
  px(ctx, cx - s * 0.24, cy - s * 0.12, s * 0.48, s * 0.2, c[2]);
  px(ctx, cx - s * 0.1, cy - s * 0.16, s * 0.2, s * 0.12, c[0]);
  // drooping strands on sides
  px(ctx, cx - s * 0.36, cy + s * 0.08, s * 0.05, s * 0.55, c[1]);
  px(ctx, cx - s * 0.24, cy + s * 0.14, s * 0.05, s * 0.5, c[1]);
  px(ctx, cx - s * 0.1, cy + s * 0.18, s * 0.05, s * 0.45, c[0]);
  px(ctx, cx + s * 0.08, cy + s * 0.18, s * 0.05, s * 0.45, c[0]);
  px(ctx, cx + s * 0.22, cy + s * 0.14, s * 0.05, s * 0.5, c[1]);
  px(ctx, cx + s * 0.34, cy + s * 0.08, s * 0.05, s * 0.55, c[1]);
  // inner highlights
  px(ctx, cx - s * 0.15, cy + s * 0.02, s * 0.1, s * 0.08, c[2]);
  px(ctx, cx + s * 0.08, cy + s * 0.0, s * 0.08, s * 0.06, c[2]);
}

function drawDeadTree(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.95, s * 0.28, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  const c = COLORS.deadTree;
  // trunk
  px(ctx, ox + s * 0.44, oy + s * 0.35, s * 0.12, s * 0.6, c[0]);
  px(ctx, ox + s * 0.46, oy + s * 0.35, s * 0.06, s * 0.6, c[1]);
  // bare branches spreading upward and outward
  px(ctx, ox + s * 0.48, oy + s * 0.15, s * 0.04, s * 0.25, c[0]);
  px(ctx, ox + s * 0.34, oy + s * 0.1, s * 0.04, s * 0.16, c[2]);
  px(ctx, ox + s * 0.56, oy + s * 0.08, s * 0.04, s * 0.18, c[2]);
  px(ctx, ox + s * 0.28, oy + s * 0.22, s * 0.04, s * 0.13, c[1]);
  px(ctx, ox + s * 0.64, oy + s * 0.18, s * 0.04, s * 0.15, c[1]);
  px(ctx, ox + s * 0.4, oy + s * 0.05, s * 0.04, s * 0.16, c[2]);
  px(ctx, ox + s * 0.54, oy + s * 0.02, s * 0.04, s * 0.13, c[2]);
  // twig tips
  px(ctx, ox + s * 0.26, oy + s * 0.3, s * 0.04, s * 0.08, c[1]);
  px(ctx, ox + s * 0.66, oy + s * 0.28, s * 0.04, s * 0.1, c[1]);
  px(ctx, ox + s * 0.3, oy + s * 0.08, s * 0.03, s * 0.06, c[2]);
  px(ctx, ox + s * 0.6, oy + s * 0.06, s * 0.03, s * 0.06, c[2]);
}

function drawFern(ctx, ox, oy, s) {
  const c = COLORS.fern;
  const n = tileHash();
  const wind = Math.sin(performance.now() / 800 + _tx * 0.6) * s * 0.02;
  const cx = ox + s * 0.5, cy = oy + s * 0.75;
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI * 0.4 + (i / 4) * Math.PI * 0.8;
    const len = s * (0.28 + (n * (i + 1) % 3) * 0.06);
    const dx = Math.cos(ang) + wind * 0.3, dy = Math.sin(ang);
    for (let j = 0; j < 5; j++) {
      const t = j / 4;
      const fx = cx + dx * len * t;
      const fy = cy + dy * len * t;
      const w = s * (0.04 - t * 0.02);
      px(ctx, fx, fy, w, s * 0.05, c[1]);
      if (j > 0) {
        px(ctx, fx - s * 0.05, fy, s * 0.05, s * 0.03, c[0]);
        px(ctx, fx + s * 0.02, fy, s * 0.05, s * 0.03, c[0]);
      }
    }
  }
  px(ctx, cx - s * 0.06, cy - s * 0.02, s * 0.12, s * 0.06, c[2]);
}

function drawTallGrass(ctx, ox, oy, s) {
  const n = tileHash();
  const wind = Math.sin(performance.now() / 600 + _tx * 0.5) * s * 0.04;
  const c = ['#6a9a4a', '#5a8a3a', '#7aaa5a'];
  const cx = ox + s * 0.5, cy = oy + s * 0.88;
  for (let i = 0; i < 7; i++) {
    const off = (i - 3) * s * 0.07;
    const h = s * (0.22 + (n * (i + 2) % 4) * 0.07);
    const lean = ((n * (i + 5)) % 2 - 0.5) * s * 0.08 + wind;
    const col = i % 2 === 0 ? c[0] : c[1];
    px(ctx, cx + off + lean, cy - h, s * 0.03, h, col);
    px(ctx, cx + off + lean, cy - h, s * 0.03, s * 0.05, c[2]);
  }
}

function drawBerryBush(ctx, ox, oy, s) {
  // bush body
  px(ctx, ox + s * 0.12, oy + s * 0.3, s * 0.76, s * 0.5, COLORS.tree[0]);
  px(ctx, ox + s * 0.2, oy + s * 0.2, s * 0.6, s * 0.25, COLORS.tree[1]);
  px(ctx, ox + s * 0.28, oy + s * 0.15, s * 0.3, s * 0.15, COLORS.tree[0]);
  // berries
  const c = COLORS.berry;
  const n = tileHash();
  px(ctx, ox + s * 0.28, oy + s * 0.45, s * 0.06, s * 0.06, c[0]);
  px(ctx, ox + s * 0.5, oy + s * 0.35, s * 0.06, s * 0.06, c[0]);
  px(ctx, ox + s * 0.65, oy + s * 0.5, s * 0.06, s * 0.06, c[1]);
  px(ctx, ox + s * 0.4, oy + s * 0.6, s * 0.06, s * 0.06, c[0]);
  px(ctx, ox + s * 0.55, oy + s * 0.55, s * 0.06, s * 0.06, c[1]);
  if (n > 0.5) px(ctx, ox + s * 0.2, oy + s * 0.55, s * 0.06, s * 0.06, c[0]);
  if (n > 0.7) px(ctx, ox + s * 0.7, oy + s * 0.35, s * 0.06, s * 0.06, c[1]);
  // berry highlights
  px(ctx, ox + s * 0.29, oy + s * 0.46, s * 0.02, s * 0.02, '#e06060');
  px(ctx, ox + s * 0.51, oy + s * 0.36, s * 0.02, s * 0.02, '#e06060');
}

function drawStump(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.9, s * 0.3, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // stump body
  px(ctx, ox + s * 0.28, oy + s * 0.5, s * 0.44, s * 0.4, COLORS.trunk[0]);
  px(ctx, ox + s * 0.32, oy + s * 0.5, s * 0.36, s * 0.4, COLORS.trunk[1]);
  // bark texture
  px(ctx, ox + s * 0.35, oy + s * 0.6, s * 0.03, s * 0.2, '#1a0f08');
  px(ctx, ox + s * 0.55, oy + s * 0.55, s * 0.03, s * 0.25, '#1a0f08');
  // top cut surface with rings
  px(ctx, ox + s * 0.26, oy + s * 0.44, s * 0.48, s * 0.12, '#6a5238');
  px(ctx, ox + s * 0.3, oy + s * 0.46, s * 0.4, s * 0.08, '#5a4228');
  px(ctx, ox + s * 0.34, oy + s * 0.48, s * 0.32, s * 0.05, '#4a3218');
  px(ctx, ox + s * 0.38, oy + s * 0.49, s * 0.24, s * 0.03, '#3a2210');
  px(ctx, ox + s * 0.42, oy + s * 0.5, s * 0.16, s * 0.02, '#2a1a08');
  // moss on stump
  const n = tileHash();
  if (n > 0.4) px(ctx, ox + s * 0.3, oy + s * 0.45, s * 0.1, s * 0.04, '#3e5e34');
  if (n > 0.7) px(ctx, ox + s * 0.58, oy + s * 0.46, s * 0.08, s * 0.03, '#3e5e34');
}

function drawStoneCircle(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.2, oy + s * 0.3, s * 0.6, s * 0.5, '#5a5658');
  px(ctx, ox + s * 0.3, oy + s * 0.2, s * 0.4, s * 0.2, '#6a6668');
  px(ctx, ox + s * 0.25, oy + s * 0.35, s * 0.15, s * 0.3, '#484446');
}

function drawCrystal(ctx, ox, oy, s) {
  const t = performance.now() / 800;
  const pulse = Math.sin(t + _tx * 0.5) * 0.15 + 0.85;
  // glow base
  px(ctx, ox + s * 0.2, oy + s * 0.72, s * 0.6, s * 0.08, `rgba(106,192,224,${0.25 * pulse})`);
  px(ctx, ox + s * 0.3, oy + s * 0.68, s * 0.4, s * 0.06, `rgba(150,220,255,${0.3 * pulse})`);
  // main crystal shard (faceted)
  px(ctx, ox + s * 0.38, oy + s * 0.2, s * 0.24, s * 0.6, '#4a9ac8');
  // left facet (lighter)
  px(ctx, ox + s * 0.38, oy + s * 0.2, s * 0.1, s * 0.6, '#7ac4e8');
  // right facet (darker)
  px(ctx, ox + s * 0.52, oy + s * 0.2, s * 0.1, s * 0.6, '#2a6a8a');
  // top point highlight
  px(ctx, ox + s * 0.42, oy + s * 0.1, s * 0.12, s * 0.15, '#9ae0f0');
  px(ctx, ox + s * 0.44, oy + s * 0.05, s * 0.08, s * 0.1, '#caeeff');
  // side shard
  px(ctx, ox + s * 0.58, oy + s * 0.35, s * 0.08, s * 0.35, '#3a80a0');
  px(ctx, ox + s * 0.58, oy + s * 0.35, s * 0.04, s * 0.35, '#5ab0d0');
  // bright core
  px(ctx, ox + s * 0.42, oy + s * 0.3, s * 0.06, s * 0.4, `rgba(202,238,255,${pulse})`);
  // base rock
  px(ctx, ox + s * 0.3, oy + s * 0.75, s * 0.4, s * 0.12, '#3a3a44');
  px(ctx, ox + s * 0.34, oy + s * 0.72, s * 0.32, s * 0.06, '#5a5a64');
}

function drawGrave(ctx, ox, oy, s, stone) {
  if (stone) {
    px(ctx, ox + s * 0.3, oy + s * 0.2, s * 0.4, s * 0.6, '#6a6a6e');
    px(ctx, ox + s * 0.35, oy + s * 0.3, s * 0.3, s * 0.08, '#4a4a4e');
  } else {
    px(ctx, ox + s * 0.35, oy + s * 0.45, s * 0.3, s * 0.35, '#5a5a5e');
    px(ctx, ox + s * 0.4, oy + s * 0.3, s * 0.2, s * 0.2, '#4a4a4e');
  }
}

function drawStatue(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.35, oy + s * 0.1, s * 0.3, s * 0.8, '#7a7678');
  px(ctx, ox + s * 0.3, oy + s * 0.05, s * 0.4, s * 0.15, '#8a8688');
  px(ctx, ox + s * 0.38, oy + s * 0.35, s * 0.24, s * 0.1, '#5a5658');
}

function drawStairsDown(ctx, ox, oy, s) {
  // dark hole with steps descending
  px(ctx, ox + s * 0.15, oy + s * 0.15, s * 0.7, s * 0.7, '#1a1a22');
  px(ctx, ox + s * 0.25, oy + s * 0.3, s * 0.5, s * 0.1, '#2a2a32');
  px(ctx, ox + s * 0.25, oy + s * 0.5, s * 0.5, s * 0.1, '#3a3a42');
  px(ctx, ox + s * 0.25, oy + s * 0.7, s * 0.5, s * 0.1, '#4a4a52');
}

function drawStairsUp(ctx, ox, oy, s) {
  px(ctx, ox + s * 0.15, oy + s * 0.15, s * 0.7, s * 0.7, '#5a5a62');
  px(ctx, ox + s * 0.25, oy + s * 0.7, s * 0.5, s * 0.1, '#7a7a82');
  px(ctx, ox + s * 0.25, oy + s * 0.5, s * 0.5, s * 0.1, '#6a6a72');
  px(ctx, ox + s * 0.25, oy + s * 0.3, s * 0.5, s * 0.1, '#5a5a62');
}

function drawGrottoChest(ctx, ox, oy, s) {
  // ornate chest with glow
  px(ctx, ox + s * 0.15, oy + s * 0.25, s * 0.7, s * 0.5, '#5a3a1a');
  px(ctx, ox + s * 0.15, oy + s * 0.2, s * 0.7, s * 0.1, '#d4a838');
  px(ctx, ox + s * 0.2, oy + s * 0.3, s * 0.6, s * 0.1, '#3a2a0a');
  px(ctx, ox + s * 0.43, oy + s * 0.4, s * 0.14, s * 0.14, '#d4a838');
  px(ctx, ox + s * 0.46, oy + s * 0.42, s * 0.08, s * 0.08, '#ffd470');
}

function drawCave(ctx, ox, oy, s) {
  px(ctx, ox, oy, s, s, '#2a2a30');
  px(ctx, ox + s * 0.2, oy + s * 0.2, s * 0.6, s * 0.6, '#1a1a22');
  px(ctx, ox + s * 0.3, oy + s * 0.3, s * 0.4, s * 0.4, '#0a0a12');
}

function drawTilled(ctx, ox, oy, s, data) {
  px(ctx, ox, oy, s, s, '#4a3828');
  for (let i = 0; i < 3; i++)
    px(ctx, ox + s * 0.1, oy + s * (0.2 + i * 0.3), s * 0.8, s * 0.06, '#3a2818');
  if (data && data.cropStage !== undefined) drawCrop(ctx, data.cropStage, ox, oy, s, data.watered);
}

export function drawCrop(ctx, stage, ox, oy, s, watered) {
  if (stage === 0) {
    // sprout — two tiny leaves
    px(ctx, ox + s * 0.38, oy + s * 0.6, s * 0.08, s * 0.05, '#5a8a3a');
    px(ctx, ox + s * 0.54, oy + s * 0.6, s * 0.08, s * 0.05, '#5a8a3a');
    px(ctx, ox + s * 0.46, oy + s * 0.58, s * 0.04, s * 0.08, '#4a7a2a');
  } else if (stage === 1) {
    // growing vine — leaves spreading
    px(ctx, ox + s * 0.42, oy + s * 0.4, s * 0.16, s * 0.35, '#6a9a4a');
    px(ctx, ox + s * 0.38, oy + s * 0.5, s * 0.24, s * 0.25, '#5a8a3a');
    // leaves
    px(ctx, ox + s * 0.28, oy + s * 0.45, s * 0.12, s * 0.1, '#5a8a3a');
    px(ctx, ox + s * 0.6, oy + s * 0.45, s * 0.12, s * 0.1, '#5a8a3a');
    px(ctx, ox + s * 0.35, oy + s * 0.35, s * 0.1, s * 0.08, '#6a9a4a');
    px(ctx, ox + s * 0.55, oy + s * 0.38, s * 0.1, s * 0.08, '#6a9a4a');
  } else if (stage >= 2) {
    // mature pumpkin plant
    px(ctx, ox + s * 0.42, oy + s * 0.25, s * 0.16, s * 0.4, '#6a9a4a');
    // large leaves
    px(ctx, ox + s * 0.25, oy + s * 0.4, s * 0.16, s * 0.12, '#5a8a3a');
    px(ctx, ox + s * 0.6, oy + s * 0.4, s * 0.16, s * 0.12, '#5a8a3a');
    px(ctx, ox + s * 0.3, oy + s * 0.3, s * 0.14, s * 0.1, '#4a7a2a');
    // pumpkin fruit — ribbed
    px(ctx, ox + s * 0.3, oy + s * 0.45, s * 0.4, s * 0.3, '#d4842a');
    px(ctx, ox + s * 0.32, oy + s * 0.47, s * 0.36, s * 0.26, '#e4943a');
    // ribs
    px(ctx, ox + s * 0.38, oy + s * 0.45, s * 0.03, s * 0.28, '#b4641a');
    px(ctx, ox + s * 0.5, oy + s * 0.45, s * 0.03, s * 0.28, '#b4641a');
    // highlight
    px(ctx, ox + s * 0.36, oy + s * 0.47, s * 0.1, s * 0.08, '#f4b45a');
    // stem
    px(ctx, ox + s * 0.47, oy + s * 0.38, s * 0.06, s * 0.08, '#3a5a2a');
  }
  if (watered) {
    px(ctx, ox + s * 0.3, oy + s * 0.7, s * 0.4, s * 0.06, '#3a5a7a');
    px(ctx, ox + s * 0.32, oy + s * 0.72, s * 0.06, s * 0.02, '#5a8aaa');
    px(ctx, ox + s * 0.5, oy + s * 0.71, s * 0.06, s * 0.02, '#5a8aaa');
  }
}

function drawLily(ctx, ox, oy, s) {
  // lily pad — round, notched with veining
  px(ctx, ox + s * 0.15, oy + s * 0.3, s * 0.7, s * 0.45, '#3a6a3a');
  px(ctx, ox + s * 0.18, oy + s * 0.32, s * 0.64, s * 0.4, '#4a7a4a');
  px(ctx, ox + s * 0.2, oy + s * 0.35, s * 0.6, s * 0.3, '#5a8a5a');
  // notch cut
  px(ctx, ox + s * 0.46, oy + s * 0.5, s * 0.08, s * 0.25, COLORS.water[0]);
  // veins
  px(ctx, ox + s * 0.3, oy + s * 0.4, s * 0.3, s * 0.01, '#2a5a2a');
  px(ctx, ox + s * 0.35, oy + s * 0.5, s * 0.25, s * 0.01, '#2a5a2a');
  // flower petals — layered
  px(ctx, ox + s * 0.34, oy + s * 0.25, s * 0.12, s * 0.12, '#e4d4e4');
  px(ctx, ox + s * 0.36, oy + s * 0.27, s * 0.08, s * 0.08, '#f4e4f4');
  // flower center
  px(ctx, ox + s * 0.38, oy + s * 0.29, s * 0.04, s * 0.04, '#e4c44a');
}

function drawBridge(ctx, ox, oy, s) {
  px(ctx, ox, oy, s, s, '#7a5a3a');
  px(ctx, ox, oy, s, s * 0.1, '#5a3a1a');
  px(ctx, ox, oy + s * 0.9, s, s * 0.1, '#5a3a1a');
}

function drawDock(ctx, ox, oy, s) {
  px(ctx, ox, oy, s, s, '#9a7a4a');
  px(ctx, ox + s * 0.3, oy, s * 0.06, s, '#7a5a2a');
  px(ctx, ox + s * 0.6, oy, s * 0.06, s, '#7a5a2a');
}

// ---- Player ----
// dir: 0=down,1=up,2=left,3=right
export function drawPlayer(ctx, px_, py, dir, frame, action, char, actionState, equippedHat, fishingState, equippedWeapon) {
  const s = PX;
  const x = px_, y = py;
  const time = performance.now() / 1000;
  // idle breathing — subtle life
  const breathe = (action === 'idle') ? Math.round(Math.sin(time * 2.5) * 0.8) : 0;
  const bob = (action === 'walk') ? [0, -1, 0, -1][frame % 4] : breathe;
  const shirt = char?.shirt || '#4a6a8a';
  const shirtDark = shade(shirt, -25);
  const pants = char?.pants || '#2e2e3e';
  const skin = char?.skin || '#e0b890';
  const skinShade = shade(skin, -20);
  const hair = char?.hair || '#5a3a1a';
  const hairDark = shade(hair, -25);
  const isGirl = char?.gender === 'girl';

  // ---- frame-by-frame tool animation ----
  // swingArc: -1=raised, 0=neutral, 1=full forward impact
  // phase: 0=windup, 1=strike, 2=impact, 3=recover
  let swingArc = 0;
  let phase = -1;
  const toolId = actionState ? actionState.tool : null;
  if (actionState) {
    const sp = 1 - (actionState.timer / actionState.maxTimer);
    if (toolId === 'sword') {
      // horizontal slash — fast windup, quick sweep, long recover
      if (sp < 0.15) { swingArc = -(sp / 0.15) * 0.6; phase = 0; }
      else if (sp < 0.40) { swingArc = -0.6 + ((sp - 0.15) / 0.25) * 1.6; phase = 1; }
      else if (sp < 0.55) { swingArc = 1.0; phase = 2; }
      else { swingArc = 1.0 - ((sp - 0.55) / 0.45); phase = 3; }
    } else if (toolId === 'watering_can') {
      // gentle tilt — slow raise, tilt to pour, hold, recover
      if (sp < 0.25) { swingArc = -(sp / 0.25) * 0.5; phase = 0; }
      else if (sp < 0.50) { swingArc = -0.5 + ((sp - 0.25) / 0.25) * 1.0; phase = 1; }
      else if (sp < 0.75) { swingArc = 0.5; phase = 2; }
      else { swingArc = 0.5 - ((sp - 0.75) / 0.25) * 0.5; phase = 3; }
    } else if (toolId === 'fishing_rod') {
      // cast — sweep forward and release
      if (sp < 0.25) { swingArc = -(sp / 0.25) * 0.4; phase = 0; }
      else if (sp < 0.45) { swingArc = -0.4 + ((sp - 0.25) / 0.20) * 1.4; phase = 1; }
      else if (sp < 0.60) { swingArc = 1.0; phase = 2; }
      else { swingArc = 1.0 - ((sp - 0.60) / 0.40); phase = 3; }
    } else {
      // overhead chop/dig (axe, pickaxe, hoe, shovel, hammer) — raise high, swing down hard
      if (sp < 0.30) { swingArc = -(sp / 0.30); phase = 0; }
      else if (sp < 0.55) { swingArc = -1 + ((sp - 0.30) / 0.25) * 2; phase = 1; }
      else if (sp < 0.68) { swingArc = 1; phase = 2; }
      else { swingArc = 1 - ((sp - 0.68) / 0.32); phase = 3; }
    }
  }

  // body lean — coils back during windup, lunges forward at impact
  const leanByPhase = [-0.30, 0.15, 0.45, 0.15];
  let leanX = 0, leanY = 0;
  if (phase >= 0) {
    const amt = leanByPhase[phase] * s;
    if (dir === 0) leanY = amt;
    else if (dir === 1) leanY = -amt;
    else if (dir === 2) leanX = -amt;
    else leanX = amt;
  }
  // legs brace during windup (back foot plants), lunge during impact (front foot forward)
  const legBrace = phase >= 0 ? [-0.03, 0.01, 0.05, 0.01][phase] : 0;
  const legOff = legBrace * s;
  const legFX = (dir === 3 ? legOff : dir === 2 ? -legOff : 0);
  const legFY = (dir === 0 ? legOff : dir === 1 ? -legOff : 0);

  // Side-view body for horizontal directions; front view for up/down
  if (dir === 2 || dir === 3) {
    drawPlayerSide(ctx, x, y, s, dir, frame, action, char, bob, leanX, leanY, phase, equippedHat);
  } else {
  if (isGirl) {
    // dress — fitted bodice, flared skirt to mid-thigh, slim feminine silhouette
    px(ctx, x + s * 0.32 + leanX * 0.3, y + s * 0.56 + bob + leanY * 0.3, s * 0.36, s * 0.14, shirt);
    px(ctx, x + s * 0.28 + leanX * 0.3, y + s * 0.64 + bob + leanY * 0.3, s * 0.44, s * 0.16, shirt);
    px(ctx, x + s * 0.24 + leanX * 0.3, y + s * 0.74 + bob + leanY * 0.3, s * 0.52, s * 0.08, shirt);
    px(ctx, x + s * 0.22 + leanX * 0.3, y + s * 0.80 + bob + leanY * 0.3, s * 0.56, s * 0.04, shirtDark);
    // slim lower legs below the dress
    px(ctx, x + s * 0.38 + leanX * 0.2, y + s * 0.80 + leanY * 0.2, s * 0.08, s * 0.10, pants);
    px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.80 + leanY * 0.2 + legFY, s * 0.08, s * 0.10, pants);
    px(ctx, x + s * 0.38 + leanX * 0.2, y + s * 0.88 + leanY * 0.2, s * 0.08, s * 0.06, '#1a1a1e');
    px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.88 + leanY * 0.2 + legFY, s * 0.08, s * 0.06, '#1a1a1e');
    if (action === 'walk') {
      const off = [0, s * 0.04, 0, -s * 0.04][frame % 4];
      px(ctx, x + s * 0.38 + leanX * 0.2, y + s * 0.80 + leanY * 0.2 + off, s * 0.08, s * 0.08, pants);
      px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.80 + leanY * 0.2 + legFY - off, s * 0.08, s * 0.08, pants);
      px(ctx, x + s * 0.38 + leanX * 0.2, y + s * 0.86 + leanY * 0.2 + off, s * 0.08, s * 0.06, '#1a1a1e');
      px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.86 + leanY * 0.2 + legFY - off, s * 0.08, s * 0.06, '#1a1a1e');
    }
  } else {
    // legs with shoes (shift with lunge + lean)
    px(ctx, x + s * 0.32 + leanX * 0.2, y + s * 0.7 + leanY * 0.2, s * 0.14, s * 0.22, pants);
    px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.7 + leanY * 0.2 + legFY, s * 0.14, s * 0.22, pants);
    px(ctx, x + s * 0.32 + leanX * 0.2, y + s * 0.88 + leanY * 0.2, s * 0.14, s * 0.06, '#1a1a1e');
    px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.88 + leanY * 0.2 + legFY, s * 0.14, s * 0.06, '#1a1a1e');
    if (action === 'walk') {
      const off = [0, s * 0.06, 0, -s * 0.06][frame % 4];
      px(ctx, x + s * 0.32 + leanX * 0.2, y + s * 0.7 + leanY * 0.2 + off, s * 0.14, s * 0.18, pants);
      px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.7 + leanY * 0.2 + legFY - off, s * 0.14, s * 0.18, pants);
      px(ctx, x + s * 0.32 + leanX * 0.2, y + s * 0.86 + leanY * 0.2 + off, s * 0.14, s * 0.06, '#1a1a1e');
      px(ctx, x + s * 0.54 + leanX * 0.2 + legFX, y + s * 0.86 + leanY * 0.2 + legFY - off, s * 0.14, s * 0.06, '#1a1a1e');
    }
  }
  // torso — slimmer for girls
  const tW = isGirl ? 0.40 : 0.48, tX = isGirl ? 0.30 : 0.26;
  px(ctx, x + s * tX + leanX * 0.5, y + s * 0.4 + bob + leanY * 0.5, s * tW, s * 0.35, shirt);
  px(ctx, x + s * tX + leanX * 0.5, y + s * 0.65 + bob + leanY * 0.5, s * tW, s * 0.06, shirtDark);
  // backpack strap — visible over the shoulder
  px(ctx, x + s * 0.24 + leanX * 0.5, y + s * 0.4 + bob + leanY * 0.5, s * 0.04, s * 0.32, '#3a2a1a');
  px(ctx, x + s * 0.70 + leanX * 0.5, y + s * 0.4 + bob + leanY * 0.5, s * 0.04, s * 0.32, '#3a2a1a');
  // backpack peeking behind shoulder
  px(ctx, x + s * 0.20 + leanX * 0.5, y + s * 0.42 + bob + leanY * 0.5, s * 0.08, s * 0.18, '#4a3a28');
  px(ctx, x + s * 0.72 + leanX * 0.5, y + s * 0.42 + bob + leanY * 0.5, s * 0.08, s * 0.18, '#4a3a28');
  // belt with buckle
  px(ctx, x + s * 0.26 + leanX * 0.5, y + s * 0.62 + bob + leanY * 0.5, s * 0.48, s * 0.05, shade(pants, -15));
  px(ctx, x + s * 0.46 + leanX * 0.5, y + s * 0.63 + bob + leanY * 0.5, s * 0.06, s * 0.03, '#8a7a4a');
  // arms — both engage the tool; extension peaks at impact
  const armEngage = phase >= 0 ? [0.3, 0.6, 1.0, 0.5][phase] : 0;
  const armReach = armEngage * s * 0.08;
  const rArmX = (dir === 3 ? armReach : dir === 2 ? -armReach * 0.3 : 0);
  const rArmY = (dir === 0 ? armReach : dir === 1 ? -armReach * 0.5 : 0);
  const lArmX = (dir === 3 ? armReach * 0.4 : dir === 2 ? -armReach * 0.6 : 0);
  const lArmY = (dir === 0 ? armReach * 0.5 : dir === 1 ? -armReach * 0.3 : 0);
  const aW = isGirl ? 0.08 : 0.1;
  px(ctx, x + s * 0.18 + leanX * 0.5 + lArmX, y + s * 0.42 + bob + leanY * 0.4 + lArmY, s * aW, s * 0.22, shirt);
  px(ctx, x + s * 0.72 + leanX * 0.5 + rArmX, y + s * 0.42 + bob + leanY * 0.4 + rArmY, s * aW, s * 0.22, shirt);
  px(ctx, x + s * 0.18 + leanX * 0.5 + lArmX, y + s * 0.62 + bob + leanY * 0.4 + lArmY, s * aW, s * 0.06, skin);
  px(ctx, x + s * 0.72 + leanX * 0.5 + rArmX, y + s * 0.62 + bob + leanY * 0.4 + rArmY, s * aW, s * 0.06, skin);
  // head (leans more than torso for whiplash feel)
  px(ctx, x + s * 0.3 + leanX, y + s * 0.12 + bob + leanY, s * 0.4, s * 0.32, skin);
  px(ctx, x + s * 0.3 + leanX, y + s * 0.38 + bob + leanY, s * 0.4, s * 0.06, skinShade);
  // hair — longer for female, with bow
  const hairLen = isGirl ? 0.22 : 0.12;
  px(ctx, x + s * 0.28 + leanX, y + s * 0.06 + bob + leanY, s * 0.44, s * hairLen, hair);
  px(ctx, x + s * 0.28 + leanX, y + s * 0.04 + bob + leanY, s * 0.44, s * 0.04, hairDark);
  if (isGirl) {
    px(ctx, x + s * 0.20 + leanX, y + s * 0.14 + bob + leanY, s * 0.08, s * 0.42, hair);
    px(ctx, x + s * 0.72 + leanX, y + s * 0.14 + bob + leanY, s * 0.08, s * 0.42, hair);
    px(ctx, x + s * 0.22 + leanX, y + s * 0.52 + bob + leanY, s * 0.56, s * 0.08, hairDark);
    px(ctx, x + s * 0.32 + leanX, y + s * 0.12 + bob + leanY, s * 0.36, s * 0.10, hair);
    px(ctx, x + s * 0.40 + leanX, y + s * 0.0 + bob + leanY, s * 0.20, s * 0.06, '#d44a6a');
    px(ctx, x + s * 0.48 + leanX, y + s * 0.0 + bob + leanY, s * 0.04, s * 0.12, '#a83a52');
  }
  if (dir === 1) {
    px(ctx, x + s * 0.28 + leanX, y + s * 0.08 + bob + leanY, s * 0.44, s * (isGirl ? 0.26 : 0.2), hair);
  } else if (dir === 2) {
    px(ctx, x + s * 0.58 + leanX, y + s * 0.1 + bob + leanY, s * 0.16, s * (isGirl ? 0.28 : 0.2), hair);
  } else if (dir === 3) {
    px(ctx, x + s * 0.26 + leanX, y + s * 0.1 + bob + leanY, s * 0.16, s * (isGirl ? 0.28 : 0.2), hair);
  }
  // eyes with blink
  const blink = Math.sin(time * 0.5 + _tx) > 0.96;
  if (dir !== 1) {
    if (blink) {
      if (dir === 0 || dir === 3) px(ctx, x + s * 0.56 + leanX, y + s * 0.28 + bob + leanY, s * 0.06, s * 0.02, '#2a2a2a');
      if (dir === 0 || dir === 2) px(ctx, x + s * 0.38 + leanX, y + s * 0.28 + bob + leanY, s * 0.06, s * 0.02, '#2a2a2a');
    } else {
      if (dir === 0 || dir === 3) px(ctx, x + s * 0.56 + leanX, y + s * 0.26 + bob + leanY, s * 0.06, s * 0.06, '#2a2a2a');
      if (dir === 0 || dir === 2) px(ctx, x + s * 0.38 + leanX, y + s * 0.26 + bob + leanY, s * 0.06, s * 0.06, '#2a2a2a');
    }
  }
  // deer antler crown — cosmetic hat
  if (equippedHat === 'deer_antler_crown') {
    // crown band
    px(ctx, x + s * 0.26 + leanX, y + s * 0.04 + bob + leanY, s * 0.48, s * 0.05, '#6a4a2a');
    px(ctx, x + s * 0.26 + leanX, y + s * 0.04 + bob + leanY, s * 0.48, s * 0.02, '#9a7a4a');
    // left antler — shaft + tines
    px(ctx, x + s * 0.28 + leanX, y + s * 0.0 + bob + leanY, s * 0.04, s * 0.1, '#8a7a5a');
    px(ctx, x + s * 0.24 + leanX, y + s * 0.0 + bob + leanY, s * 0.04, s * 0.04, '#8a7a5a');
    px(ctx, x + s * 0.20 + leanX, y + s * 0.02 + bob + leanY, s * 0.04, s * 0.04, '#8a7a5a');
    // right antler — shaft + tines
    px(ctx, x + s * 0.68 + leanX, y + s * 0.0 + bob + leanY, s * 0.04, s * 0.1, '#8a7a5a');
    px(ctx, x + s * 0.72 + leanX, y + s * 0.0 + bob + leanY, s * 0.04, s * 0.04, '#8a7a5a');
    px(ctx, x + s * 0.76 + leanX, y + s * 0.02 + bob + leanY, s * 0.04, s * 0.04, '#8a7a5a');
  }
  } // end front-view body branch
  // tool swing — drawn with body lean + phase for motion trails
  if (actionState) {
    drawToolInHand(ctx, x, y, s, dir, actionState.tool, swingArc, bob, leanX, leanY, phase, equippedWeapon);
  }
  // ── Fishing pole — held out with line in the water while fishing ──
  if (fishingState) {
    drawFishingPole(ctx, x, y, s, dir, bob, leanX, leanY, fishingState);
  }
  // ── Lantern — arm extends holding a glowing lantern when lit ──
  drawLanternOverlay(ctx, x, y, s, dir, leanX, leanY, bob);
}

// ── Fishing pole — held out forward with line drooping into the water ──
function drawFishingPole(ctx, x, y, s, dir, bob, leanX, leanY, fishingState) {
  const poleCol = '#d4c4a4';
  const poleDark = '#a08868';
  const lineCol = 'rgba(220,220,200,0.6)';

  // hand position
  let hx, hy;
  if (dir === 0) { hx = x + s * 0.72 + leanX; hy = y + s * 0.58 + bob + leanY; }
  else if (dir === 1) { hx = x + s * 0.70 + leanX; hy = y + s * 0.40 + bob + leanY; }
  else if (dir === 2) { hx = x + s * 0.24 + leanX; hy = y + s * 0.48 + bob + leanY; }
  else { hx = x + s * 0.76 + leanX; hy = y + s * 0.48 + bob + leanY; }

  // pole angle — extends outward in the facing direction, angled upward
  let baseAngle;
  if (dir === 0) baseAngle = -0.3;       // down/south: pole tilts forward and up
  else if (dir === 1) baseAngle = Math.PI - 0.3; // up/north
  else if (dir === 2) baseAngle = Math.PI / 2 - 0.3; // left
  else baseAngle = -Math.PI / 2 - 0.3;  // right

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(baseAngle);

  const poleLen = s * 0.5;
  const poleW = s * 0.025;

  // pole shaft — tapered, with wood grain
  ctx.fillStyle = poleDark;
  ctx.fillRect(-poleW / 2, 0, poleW, poleLen);
  ctx.fillStyle = poleCol;
  ctx.fillRect(-poleW / 2, 0, poleW * 0.6, poleLen);
  ctx.fillStyle = shade(poleCol, 30);
  ctx.fillRect(-poleW / 2, 0, poleW * 0.2, poleLen);
  // grip wrap
  ctx.fillStyle = poleDark;
  ctx.fillRect(-poleW / 2, 0, poleW, s * 0.05);
  ctx.fillRect(-poleW / 2, s * 0.1, poleW, s * 0.03);

  // tip guide (small ring)
  ctx.fillStyle = '#8a7a5a';
  ctx.fillRect(-poleW, poleLen - s * 0.02, poleW * 2, s * 0.03);

  ctx.restore();

  // fishing line — droops from pole tip downward into the water
  const tipX = hx + Math.cos(baseAngle - Math.PI / 2) * poleLen;
  const tipY = hy + Math.sin(baseAngle - Math.PI / 2) * poleLen;

  ctx.strokeStyle = lineCol;
  ctx.lineWidth = s * 0.015;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  // line droops down with a gentle curve
  const lineLen = s * 0.35;
  const dropX = tipX + (dir === 3 ? lineLen * 0.5 : dir === 2 ? -lineLen * 0.5 : 0);
  const dropY = tipY + (dir === 0 ? lineLen : dir === 1 ? -lineLen * 0.3 : lineLen * 0.7);
  ctx.quadraticCurveTo(tipX + (dropX - tipX) * 0.3, tipY + s * 0.08, dropX, dropY);
  ctx.stroke();

  // small ripple at the water entry point during bite phase
  if (fishingState.phase === 'minigame' || fishingState.phase === 'wait') {
    ctx.strokeStyle = 'rgba(150,200,255,0.5)';
    ctx.lineWidth = s * 0.01;
    ctx.beginPath();
    ctx.ellipse(dropX, dropY, s * 0.06, s * 0.02, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ---- Tool swing rendering ----
// Uses rotation-based pivoting from the hand for a natural swinging arc.
function drawToolInHand(ctx, x, y, s, dir, toolId, swingArc, bob, leanX, leanY, phase, equippedWeapon) {
  const handleCol = '#7a5a3a';
  const handleMid = '#6a4a2a';
  const handleDark = '#4a3018';

  // hand pivot position — where the tool is gripped
  let hx, hy;
  if (dir === 0) { hx = x + s * 0.72 + leanX; hy = y + s * 0.58 + bob + leanY; }
  else if (dir === 1) { hx = x + s * 0.70 + leanX; hy = y + s * 0.40 + bob + leanY; }
  else if (dir === 2) { hx = x + s * 0.24 + leanX; hy = y + s * 0.48 + bob + leanY; }
  else { hx = x + s * 0.76 + leanX; hy = y + s * 0.48 + bob + leanY; }

  // base angle: tool points outward from body in facing direction
  // Canvas rotate(0) leaves handle pointing down (+Y). So:
  // dir 0=down → 0 (tool extends downward, in front of character)
  // dir 1=up → PI (tool extends upward, in front of character facing away)
  // dir 2=left → PI/2 (tool extends leftward)
  // dir 3=right → -PI/2 (tool extends rightward)
  let baseAngle;
  if (dir === 0) baseAngle = 0;              // pointing down (toward camera = in front)
  else if (dir === 1) baseAngle = Math.PI;   // pointing up (away from camera = in front of char)
  else if (dir === 2) baseAngle = Math.PI / 2;  // pointing left
  else baseAngle = -Math.PI / 2;            // pointing right

  // swing rotation offset — windup tilts back, impact sweeps forward
  // swingArc: -1=fully raised, 0=neutral, 1=full forward
  // For overhead tools, the swing pivots around the hand: raised = angle shifts back, forward = angle shifts ahead
  let swingOffset = 0;
  if (toolId === 'sword') {
    // horizontal slash — sweep left then right
    swingOffset = swingArc * 0.9;
  } else if (toolId === 'watering_can') {
    swingOffset = swingArc * 0.5;
  } else if (toolId === 'fishing_rod') {
    swingOffset = swingArc * 0.7;
  } else {
    // overhead chop — raise back, then sweep down past neutral
    swingOffset = swingArc * 1.1;
  }

  const angle = baseAngle + swingOffset;

  // ---- curved motion trail (arc sweep) ----
  if (phase === 1 || phase === 2) {
    ctx.save();
    ctx.translate(hx, hy);
    const trailAlpha = phase === 2 ? 0.6 : 0.3;
    ctx.globalAlpha = trailAlpha;
    const radius = s * 0.55;

    if (toolId === 'sword') {
      // bright curved slash arc
      ctx.rotate(baseAngle);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = s * 0.05;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, radius, -0.5, 0.5);
      ctx.stroke();
      ctx.strokeStyle = '#c8c8f0';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.08, -0.45, 0.45);
      ctx.stroke();
    } else if (toolId === 'watering_can') {
      // water spray particles — falling droplets
      ctx.rotate(angle);
      for (let i = 0; i < 8; i++) {
        const dr = radius * (0.4 + i * 0.08);
        const da = (i % 2 - 0.5) * 0.3;
        const dx = Math.sin(da) * dr;
        const dy = Math.cos(da) * dr + i * s * 0.02;
        ctx.fillStyle = i % 2 ? '#8ac8f0' : '#a0d8ff';
        ctx.fillRect(dx - s * 0.02, dy - s * 0.02, s * 0.04, s * 0.04);
      }
    } else if (toolId === 'fishing_rod') {
      // line unfurling — thin curve
      ctx.rotate(angle);
      ctx.strokeStyle = 'rgba(220,220,200,0.4)';
      ctx.lineWidth = s * 0.015;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(radius * 0.5, -radius * 0.3, radius, 0);
      ctx.stroke();
    } else {
      // overhead chop — vertical arc blur
      ctx.rotate(baseAngle);
      const grad = ctx.createLinearGradient(0, 0, 0, radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.5)');
      grad.addColorStop(1, 'rgba(200,200,210,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-s * 0.06, 0);
      ctx.lineTo(s * 0.06, 0);
      ctx.lineTo(s * 0.03, radius);
      ctx.lineTo(-s * 0.03, radius);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ---- impact flash / spark at peak impact ----
  if (phase === 2 && swingArc > 0.5) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);
    const tipX = 0;
    const tipY = s * 0.55;
    const sparkR = s * 0.12;
    const flashAlpha = (swingArc - 0.5) / 0.5;
    // radial flash
    const grad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, sparkR);
    grad.addColorStop(0, `rgba(255,255,255,${0.7 * flashAlpha})`);
    grad.addColorStop(0.5, `rgba(255,240,200,${0.3 * flashAlpha})`);
    grad.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(tipX, tipY, sparkR, 0, Math.PI * 2);
    ctx.fill();
    // spark star lines
    ctx.strokeStyle = `rgba(255,255,220,${0.6 * flashAlpha})`;
    ctx.lineWidth = s * 0.02;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(tipX + Math.cos(a) * s * 0.06, tipY + Math.sin(a) * s * 0.06);
      ctx.lineTo(tipX + Math.cos(a) * s * 0.16, tipY + Math.sin(a) * s * 0.16);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- draw tool as rotated unit pivoting from hand ----
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(angle);

  // tool head colors
  const cols = {
    axe: '#9a9aa4', sword: '#d4d4e4', hoe: '#8a8a94', pickaxe: '#7a7a84',
    shovel: '#9a9aa4', watering_can: '#5a8aaa', fishing_rod: '#d4c4a4',
    hammer: '#aa8a6a', hands: '#9a9aa4',
  };
  const hc = cols[toolId] || '#9a9aa4';
  const hLight = shade(hc, 30);
  const hDark = shade(hc, -25);

  const hw = s * 0.08;       // handle width
  const handleLen = s * 0.36;

  // handle — drawn as a tapered shaft with grain highlight
  // In local space, tool extends downward from pivot (0,0)
  ctx.fillStyle = handleDark;
  ctx.fillRect(-hw / 2, 0, hw, handleLen);
  ctx.fillStyle = handleCol;
  ctx.fillRect(-hw / 2, 0, hw * 0.65, handleLen);
  ctx.fillStyle = shade(handleCol, 35);
  ctx.fillRect(-hw / 2, 0, hw * 0.2, handleLen);
  // grip wrap
  ctx.fillStyle = handleDark;
  ctx.fillRect(-hw / 2, s * 0.02, hw, s * 0.03);
  ctx.fillRect(-hw / 2, s * 0.08, hw, s * 0.03);

  // tool head positioned at end of handle
  const ex = 0, ey = handleLen;

  if (toolId === 'sword') {
    drawSwordBlade(ctx, s, ey, hDark, hc, equippedWeapon);
  } else if (toolId === 'axe') {
    // axe head — curved blade with edge highlight
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.05, ey - s * 0.04, s * 0.18, s * 0.16);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.04, ey - s * 0.03, s * 0.16, s * 0.14);
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.04, ey - s * 0.03, s * 0.16, s * 0.03);
    // blade edge — bright sharp side
    ctx.fillStyle = '#c4c4ce';
    ctx.fillRect(s * 0.08, ey - s * 0.02, s * 0.05, s * 0.12);
    ctx.fillStyle = '#e4e4ee';
    ctx.fillRect(s * 0.1, ey - s * 0.01, s * 0.02, s * 0.10);
    // mounting eye
    ctx.fillStyle = handleDark;
    ctx.fillRect(-s * 0.04, ey + s * 0.01, s * 0.04, s * 0.04);
  } else if (toolId === 'pickaxe') {
    // double-headed curved pick
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.16, ey - s * 0.04, s * 0.32, s * 0.08);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.15, ey - s * 0.03, s * 0.30, s * 0.06);
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.15, ey - s * 0.03, s * 0.30, s * 0.015);
    // pointed tips
    ctx.fillStyle = hDark;
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, ey - s * 0.04);
    ctx.lineTo(-s * 0.24, ey - s * 0.02);
    ctx.lineTo(-s * 0.16, ey + s * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.16, ey - s * 0.04);
    ctx.lineTo(s * 0.24, ey - s * 0.02);
    ctx.lineTo(s * 0.16, ey + s * 0.02);
    ctx.closePath();
    ctx.fill();
  } else if (toolId === 'hoe') {
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.04, ey - s * 0.02, s * 0.16, s * 0.08);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.03, ey - s * 0.01, s * 0.14, s * 0.06);
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.03, ey - s * 0.01, s * 0.14, s * 0.02);
    // blade
    ctx.fillStyle = '#5a5a64';
    ctx.fillRect(s * 0.09, ey, s * 0.06, s * 0.1);
    ctx.fillStyle = '#7a7a84';
    ctx.fillRect(s * 0.09, ey, s * 0.02, s * 0.1);
  } else if (toolId === 'shovel') {
    // shovel blade — scoop shape
    ctx.fillStyle = hDark;
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, ey);
    ctx.lineTo(s * 0.06, ey);
    ctx.lineTo(s * 0.08, ey + s * 0.16);
    ctx.lineTo(-s * 0.08, ey + s * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hc;
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, ey + s * 0.01);
    ctx.lineTo(s * 0.05, ey + s * 0.01);
    ctx.lineTo(s * 0.07, ey + s * 0.15);
    ctx.lineTo(-s * 0.07, ey + s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.04, ey + s * 0.01, s * 0.02, s * 0.12);
    // edge highlight
    ctx.fillStyle = '#a0a0aa';
    ctx.fillRect(-s * 0.07, ey + s * 0.14, s * 0.14, s * 0.015);
  } else if (toolId === 'watering_can') {
    // can body
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.08, ey - s * 0.06, s * 0.2, s * 0.18);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.07, ey - s * 0.05, s * 0.18, s * 0.16);
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.07, ey - s * 0.05, s * 0.18, s * 0.03);
    ctx.fillStyle = shade(hc, 50);
    ctx.fillRect(-s * 0.06, ey - s * 0.04, s * 0.04, s * 0.04);
    // spout
    ctx.fillStyle = '#3a6a8a';
    ctx.fillRect(s * 0.1, ey - s * 0.03, s * 0.12, s * 0.05);
    ctx.fillStyle = '#2a5a7a';
    ctx.fillRect(s * 0.2, ey - s * 0.02, s * 0.04, s * 0.03);
    // handle arch
    ctx.strokeStyle = hDark;
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.arc(-s * 0.02, ey - s * 0.06, s * 0.06, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else if (toolId === 'fishing_rod') {
    // tapered rod
    ctx.fillStyle = handleDark;
    ctx.fillRect(-s * 0.02, ey, s * 0.04, s * 0.3);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.015, ey, s * 0.03, s * 0.3);
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.01, ey, s * 0.01, s * 0.3);
    // line + hook
    ctx.strokeStyle = 'rgba(200,200,200,0.6)';
    ctx.lineWidth = s * 0.01;
    ctx.beginPath();
    ctx.moveTo(0, ey + s * 0.3);
    ctx.quadraticCurveTo(s * 0.06, ey + s * 0.4, s * 0.02, ey + s * 0.52);
    ctx.stroke();
    ctx.fillStyle = '#c4c4d4';
    ctx.fillRect(s * 0.01, ey + s * 0.5, s * 0.03, s * 0.03);
    // reel
    ctx.fillStyle = '#4a4a4e';
    ctx.beginPath();
    ctx.arc(0, ey - s * 0.02, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6a6a74';
    ctx.beginPath();
    ctx.arc(0, ey - s * 0.02, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  } else if (toolId === 'hammer') {
    // hammer head — block with face
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.1, ey - s * 0.06, s * 0.2, s * 0.12);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.09, ey - s * 0.05, s * 0.18, s * 0.1);
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.09, ey - s * 0.05, s * 0.18, s * 0.02);
    // claw back
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.13, ey - s * 0.04, s * 0.04, s * 0.08);
    // face
    ctx.fillStyle = shade(hc, 40);
    ctx.fillRect(s * 0.08, ey - s * 0.04, s * 0.02, s * 0.08);
  } else {
    // generic
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.06, ey - s * 0.06, s * 0.14, s * 0.14);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.05, ey - s * 0.05, s * 0.12, s * 0.12);
    ctx.fillStyle = hLight;
    ctx.fillRect(-s * 0.05, ey - s * 0.05, s * 0.12, s * 0.02);
  }

  ctx.restore();
}

// ---- Fritz the cat ----
// state: follow, sit, sleep, hiss
export function drawFritz(ctx, px_, py, dir, state, frame, petType = 'fritz') {
  const s = PX;
  const x = px_, y = py;
  let orange, orangeDark, white, black;
  if (petType === 'void') { orange = '#2a2a3a'; orangeDark = '#1a1a2a'; white = '#3a3a4a'; black = '#9a6acf'; }
  else if (petType === 'hanzo') { orange = '#8a8a92'; orangeDark = '#5a5a62'; white = '#b0b0b8'; black = '#2a2a2e'; }
  else { orange = '#d4842a'; orangeDark = '#a4601a'; white = '#f0e0c0'; black = '#2a1a1a'; }
  const isDog = petType === 'hanzo';

  // ── Hanzo the French Bulldog ──
  if (isDog) {
    return drawHanzo(ctx, px_, py, dir, state, frame, orange, orangeDark, white, black);
  }
  let bob = 0;
  if (state === 'follow') bob = [0, -1, 0, -1][frame % 4];

  if (state === 'sleep') {
    // curled up
    px(ctx, x + s * 0.2, y + s * 0.55, s * 0.6, s * 0.3, orange);
    px(ctx, x + s * 0.25, y + s * 0.5, s * 0.5, s * 0.15, orangeDark);
    px(ctx, x + s * 0.7, y + s * 0.55, s * 0.15, s * 0.15, orange);
    px(ctx, x + s * 0.72, y + s * 0.58, s * 0.06, s * 0.06, black);
    return;
  }

  // body
  px(ctx, x + s * 0.25, y + s * 0.45 + bob, s * 0.5, s * 0.3, orange);
  px(ctx, x + s * 0.28, y + s * 0.5 + bob, s * 0.44, s * 0.15, orangeDark);
  // legs
  if (state === 'follow') {
    const off = [0, s * 0.05, 0, -s * 0.05][frame % 4];
    px(ctx, x + s * 0.28, y + s * 0.72 + bob + off, s * 0.1, s * 0.15, orangeDark);
    px(ctx, x + s * 0.6, y + s * 0.72 + bob - off, s * 0.1, s * 0.15, orangeDark);
  } else {
    px(ctx, x + s * 0.28, y + s * 0.72 + bob, s * 0.1, s * 0.15, orangeDark);
    px(ctx, x + s * 0.6, y + s * 0.72 + bob, s * 0.1, s * 0.15, orangeDark);
  }
  // head
  const hx = dir === 3 ? x + s * 0.55 : dir === 2 ? x + s * 0.15 : x + s * 0.35;
  px(ctx, hx, y + s * 0.2 + bob, s * 0.3, s * 0.28, orange);
  // ears
  px(ctx, hx, y + s * 0.15 + bob, s * 0.08, s * 0.1, orange);
  px(ctx, hx + s * 0.22, y + s * 0.15 + bob, s * 0.08, s * 0.1, orange);
  // nose — pink triangle
  px(ctx, hx + s * 0.12, y + s * 0.36 + bob, s * 0.06, s * 0.04, '#d46a7a');
  // face
  if (state === 'hiss') {
    px(ctx, hx + s * 0.08, y + s * 0.3 + bob, s * 0.06, s * 0.06, '#ff3a2a');
    px(ctx, hx + s * 0.16, y + s * 0.3 + bob, s * 0.06, s * 0.06, '#ff3a2a');
    // arched back
    px(ctx, x + s * 0.3, y + s * 0.35 + bob, s * 0.4, s * 0.15, orangeDark);
    // hiss mouth — open with teeth
    px(ctx, hx + s * 0.1, y + s * 0.4 + bob, s * 0.1, s * 0.03, black);
    px(ctx, hx + s * 0.11, y + s * 0.4 + bob, s * 0.02, s * 0.02, white);
    px(ctx, hx + s * 0.15, y + s * 0.4 + bob, s * 0.02, s * 0.02, white);
  } else {
    if (dir !== 1) {
      // eyes with green iris
      px(ctx, hx + s * 0.1, y + s * 0.3 + bob, s * 0.05, s * 0.05, black);
      px(ctx, hx + s * 0.18, y + s * 0.3 + bob, s * 0.05, s * 0.05, black);
      px(ctx, hx + s * 0.11, y + s * 0.31 + bob, s * 0.02, s * 0.02, '#5acc5a');
      px(ctx, hx + s * 0.19, y + s * 0.31 + bob, s * 0.02, s * 0.02, '#5acc5a');
    }
    // whiskers
    px(ctx, hx + s * 0.04, y + s * 0.36 + bob, s * 0.06, s * 0.01, shade(white, -20));
    px(ctx, hx + s * 0.04, y + s * 0.38 + bob, s * 0.06, s * 0.01, shade(white, -20));
    px(ctx, hx + s * 0.22, y + s * 0.36 + bob, s * 0.06, s * 0.01, shade(white, -20));
    px(ctx, hx + s * 0.22, y + s * 0.38 + bob, s * 0.06, s * 0.01, shade(white, -20));
  }
  // tail
  const tailWag = state === 'sit' ? Math.sin(frame * 0.3) * s * 0.05 : 0;
  px(ctx, x + s * 0.7 + tailWag, y + s * 0.4 + bob, s * 0.08, s * 0.25, orange);
  px(ctx, x + s * 0.72 + tailWag, y + s * 0.38 + bob, s * 0.06, s * 0.08, white);
}

// ---- Hanzo the French Bulldog ----
// Stocky body, short stubby legs, wrinkly flat face, floppy jowls, stubby tail
function drawHanzo(ctx, px_, py, dir, state, frame, body, bodyDark, light, dark) {
  const s = PX;
  const x = px_, y = py;
  const t = performance.now() / 1000;
  let bob = 0;
  if (state === 'follow') bob = [0, -1, 0, -1][frame % 4];
  const breathe = (state === 'sit' || state === 'pet') ? Math.round(Math.sin(t * 2) * 0.6) : 0;
  bob += breathe;

  if (state === 'sleep') {
    // curled up bulldog
    px(ctx, x + s * 0.15, y + s * 0.55, s * 0.7, s * 0.3, body);
    px(ctx, x + s * 0.2, y + s * 0.5, s * 0.6, s * 0.15, bodyDark);
    px(ctx, x + s * 0.72, y + s * 0.55, s * 0.18, s * 0.18, body);
    px(ctx, x + s * 0.74, y + s * 0.58, s * 0.08, s * 0.08, dark);
    return;
  }

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.5, y + s * 0.92, s * 0.38, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // stocky body — wide and low
  px(ctx, x + s * 0.2, y + s * 0.4 + bob, s * 0.6, s * 0.35, body);
  px(ctx, x + s * 0.22, y + s * 0.45 + bob, s * 0.56, s * 0.18, bodyDark);
  // chest — broader
  px(ctx, x + s * 0.15, y + s * 0.5 + bob, s * 0.7, s * 0.2, body);
  px(ctx, x + s * 0.18, y + s * 0.55 + bob, s * 0.64, s * 0.12, bodyDark);

  // short stubby legs
  if (state === 'follow') {
    const off = [0, s * 0.04, 0, -s * 0.04][frame % 4];
    px(ctx, x + s * 0.22, y + s * 0.7 + bob + off, s * 0.12, s * 0.18, bodyDark);
    px(ctx, x + s * 0.66, y + s * 0.7 + bob - off, s * 0.12, s * 0.18, bodyDark);
    px(ctx, x + s * 0.22, y + s * 0.85 + bob + off, s * 0.12, s * 0.05, dark);
    px(ctx, x + s * 0.66, y + s * 0.85 + bob - off, s * 0.12, s * 0.05, dark);
  } else {
    px(ctx, x + s * 0.22, y + s * 0.7 + bob, s * 0.12, s * 0.18, bodyDark);
    px(ctx, x + s * 0.66, y + s * 0.7 + bob, s * 0.12, s * 0.18, bodyDark);
    px(ctx, x + s * 0.22, y + s * 0.85 + bob, s * 0.12, s * 0.05, dark);
    px(ctx, x + s * 0.66, y + s * 0.85 + bob, s * 0.05, dark);
  }

  // head — big, wrinkly, flat-faced
  const hx = dir === 3 ? x + s * 0.55 : dir === 2 ? x + s * 0.05 : x + s * 0.3;
  const hy = y + s * 0.15 + bob;
  px(ctx, hx, hy, s * 0.4, s * 0.35, body);
  px(ctx, hx, hy + s * 0.28, s * 0.4, s * 0.08, bodyDark);
  // wrinkles
  px(ctx, hx + s * 0.05, hy + s * 0.05, s * 0.3, s * 0.02, bodyDark);
  px(ctx, hx + s * 0.05, hy + s * 0.12, s * 0.25, s * 0.02, bodyDark);

  // floppy ears
  px(ctx, hx + s * 0.02, hy + s * 0.02, s * 0.1, s * 0.12, bodyDark);
  px(ctx, hx + s * 0.3, hy + s * 0.02, s * 0.1, s * 0.12, bodyDark);

  // flat face — pushed-in snout
  px(ctx, hx + s * 0.08, hy + s * 0.18, s * 0.28, s * 0.15, light);
  px(ctx, hx + s * 0.1, hy + s * 0.2, s * 0.24, s * 0.1, body);
  // jowls
  px(ctx, hx + s * 0.06, hy + s * 0.25, s * 0.1, s * 0.08, bodyDark);
  px(ctx, hx + s * 0.26, hy + s * 0.25, s * 0.1, s * 0.08, bodyDark);

  if (state === 'hiss') {
    // angry face — teeth showing
    px(ctx, hx + s * 0.1, hy + s * 0.3, s * 0.06, s * 0.04, '#ff3a2a');
    px(ctx, hx + s * 0.22, hy + s * 0.3, s * 0.06, s * 0.04, '#ff3a2a');
    px(ctx, hx + s * 0.14, hy + s * 0.34, s * 0.04, s * 0.03, '#ffffff');
    px(ctx, hx + s * 0.2, hy + s * 0.34, s * 0.04, s * 0.03, '#ffffff');
  } else if (state === 'pet') {
    // happy squinting eyes
    px(ctx, hx + s * 0.12, hy + s * 0.14, s * 0.06, s * 0.02, dark);
    px(ctx, hx + s * 0.22, hy + s * 0.14, s * 0.06, s * 0.02, dark);
  } else {
    if (dir !== 1) {
      px(ctx, hx + s * 0.12, hy + s * 0.13, s * 0.06, s * 0.06, dark);
      px(ctx, hx + s * 0.22, hy + s * 0.13, s * 0.06, s * 0.06, dark);
    }
  }

  // stubby tail — small curl
  const tailWag = state === 'sit' ? Math.sin(frame * 0.3) * s * 0.03 : 0;
  px(ctx, x + s * 0.75 + tailWag, y + s * 0.42 + bob, s * 0.06, s * 0.08, body);
  px(ctx, x + s * 0.77 + tailWag, y + s * 0.38 + bob, s * 0.04, s * 0.04, bodyDark);
}

// ---- NPC — each has a unique silhouette based on id ----
export function drawNPC(ctx, px_, py, color, dir, frame, npcId) {
  const s = PX;
  const x = px_, y = py;
  const bob = [0, -1, 0, -1][frame % 4];
  const skin = '#e0b890';
  const skinShade = '#c0a070';

  // shared base: legs
  px(ctx, x + s * 0.3, y + s * 0.7, s * 0.14, s * 0.25, '#3a3a4a');
  px(ctx, x + s * 0.52, y + s * 0.7, s * 0.14, s * 0.25, '#3a3a4a');

  switch (npcId) {
    case 'mabel': {
      // Shopkeeper — green apron over brown dress, bun hair, round glasses
      px(ctx, x + s * 0.24, y + s * 0.42 + bob, s * 0.5, s * 0.34, '#6a4a3a');
      px(ctx, x + s * 0.28, y + s * 0.44 + bob, s * 0.42, s * 0.28, '#4a6a4a');
      px(ctx, x + s * 0.3, y + s * 0.46 + bob, s * 0.06, s * 0.02, '#d4c46a');
      px(ctx, x + s * 0.62, y + s * 0.46 + bob, s * 0.06, s * 0.02, '#d4c46a');
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.28, skin);
      px(ctx, x + s * 0.28, y + s * 0.1 + bob, s * 0.44, s * 0.08, '#5a3a1a');
      // bun on top
      px(ctx, x + s * 0.42, y + s * 0.06 + bob, s * 0.16, s * 0.1, '#5a3a1a');
      px(ctx, x + s * 0.44, y + s * 0.07 + bob, s * 0.12, s * 0.06, '#6a4a2a');
      if (dir !== 1) {
        // round glasses
        px(ctx, x + s * 0.36, y + s * 0.24 + bob, s * 0.08, s * 0.06, '#d4a04a');
        px(ctx, x + s * 0.54, y + s * 0.24 + bob, s * 0.08, s * 0.06, '#d4a04a');
        px(ctx, x + s * 0.44, y + s * 0.26 + bob, s * 0.08, s * 0.01, '#3a2a1a');
        px(ctx, x + s * 0.38, y + s * 0.26 + bob, s * 0.04, s * 0.03, '#2a2a2a');
        px(ctx, x + s * 0.56, y + s * 0.26 + bob, s * 0.04, s * 0.03, '#2a2a2a');
        // smile
        px(ctx, x + s * 0.42, y + s * 0.34 + bob, s * 0.16, s * 0.02, '#5a3a2a');
      }
      break;
    }
    case 'mayor': {
      // Mayor — formal dark coat, white collar, top hat, gray mustache
      px(ctx, x + s * 0.26, y + s * 0.4 + bob, s * 0.48, s * 0.36, '#2e2e3e');
      px(ctx, x + s * 0.3, y + s * 0.4 + bob, s * 0.4, s * 0.06, '#1a1a2a');
      // white collar / cravat
      px(ctx, x + s * 0.42, y + s * 0.44 + bob, s * 0.16, s * 0.08, '#e8e8e0');
      px(ctx, x + s * 0.46, y + s * 0.48 + bob, s * 0.08, s * 0.06, '#5a2a2a');
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.28, skin);
      // gray hair at sides
      px(ctx, x + s * 0.28, y + s * 0.14 + bob, s * 0.1, s * 0.14, '#8a8a8a');
      px(ctx, x + s * 0.6, y + s * 0.14 + bob, s * 0.1, s * 0.14, '#8a8a8a');
      // top hat
      px(ctx, x + s * 0.32, y + s * 0.02 + bob, s * 0.36, s * 0.16, '#1a1a1e');
      px(ctx, x + s * 0.36, y + s * 0.04 + bob, s * 0.28, s * 0.1, '#2a2a2e');
      px(ctx, x + s * 0.28, y + s * 0.16 + bob, s * 0.44, s * 0.03, '#1a1a1e');
      // hat band
      px(ctx, x + s * 0.34, y + s * 0.12 + bob, s * 0.32, s * 0.03, '#5a2a2a');
      if (dir !== 1) {
        // eyes
        px(ctx, x + s * 0.4, y + s * 0.26 + bob, s * 0.05, s * 0.05, '#2a2a2a');
        px(ctx, x + s * 0.54, y + s * 0.26 + bob, s * 0.05, s * 0.05, '#2a2a2a');
        // gray mustache
        px(ctx, x + s * 0.36, y + s * 0.32 + bob, s * 0.28, s * 0.05, '#9a9a9a');
        px(ctx, x + s * 0.34, y + s * 0.34 + bob, s * 0.06, s * 0.03, '#7a7a7a');
        px(ctx, x + s * 0.6, y + s * 0.34 + bob, s * 0.06, s * 0.03, '#7a7a7a');
      }
      break;
    }
    case 'patricia': {
      // Patricia — wild messy purple hair, mismatched colorful shawl, wide eyes
      px(ctx, x + s * 0.22, y + s * 0.42 + bob, s * 0.56, s * 0.34, '#5a4a6a');
      // colorful patchwork shawl
      px(ctx, x + s * 0.24, y + s * 0.46 + bob, s * 0.2, s * 0.16, '#8a4a6a');
      px(ctx, x + s * 0.46, y + s * 0.46 + bob, s * 0.16, s * 0.16, '#4a8a6a');
      px(ctx, x + s * 0.58, y + s * 0.5 + bob, s * 0.14, s * 0.12, '#8a8a4a');
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.28, skin);
      // wild messy hair — spiky and unkempt
      px(ctx, x + s * 0.22, y + s * 0.08 + bob, s * 0.56, s * 0.12, '#7a4a9a');
      px(ctx, x + s * 0.2, y + s * 0.04 + bob, s * 0.12, s * 0.1, '#7a4a9a');
      px(ctx, x + s * 0.36, y + s * 0.02 + bob, s * 0.1, s * 0.12, '#8a5aaa');
      px(ctx, x + s * 0.5, y + s * 0.04 + bob, s * 0.14, s * 0.1, '#7a4a9a');
      px(ctx, x + s * 0.66, y + s * 0.06 + bob, s * 0.08, s * 0.1, '#8a5aaa');
      // stray strands
      px(ctx, x + s * 0.24, y + s * 0.12 + bob, s * 0.04, s * 0.08, '#6a3a8a');
      px(ctx, x + s * 0.7, y + s * 0.14 + bob, s * 0.04, s * 0.08, '#6a3a8a');
      if (dir !== 1) {
        // wide staring eyes
        px(ctx, x + s * 0.38, y + s * 0.24 + bob, s * 0.08, s * 0.08, '#ffffff');
        px(ctx, x + s * 0.52, y + s * 0.24 + bob, s * 0.08, s * 0.08, '#ffffff');
        px(ctx, x + s * 0.4, y + s * 0.26 + bob, s * 0.04, s * 0.04, '#3a2a5a');
        px(ctx, x + s * 0.54, y + s * 0.26 + bob, s * 0.04, s * 0.04, '#3a2a5a');
        // open mouth
        px(ctx, x + s * 0.44, y + s * 0.34 + bob, s * 0.1, s * 0.04, '#6a2a3a');
      }
      break;
    }
    case 'bartender': {
      // Old Gus — rolled-up sleeves, vest, beard, balding
      px(ctx, x + s * 0.26, y + s * 0.4 + bob, s * 0.48, s * 0.36, '#6a5a3a');
      // vest
      px(ctx, x + s * 0.28, y + s * 0.42 + bob, s * 0.44, s * 0.2, '#4a3a1a');
      px(ctx, x + s * 0.46, y + s * 0.42 + bob, s * 0.08, s * 0.2, '#e8e0d0');
      // vest buttons
      px(ctx, x + s * 0.48, y + s * 0.46 + bob, s * 0.02, s * 0.02, '#c4a44a');
      px(ctx, x + s * 0.48, y + s * 0.54 + bob, s * 0.02, s * 0.02, '#c4a44a');
      // rolled sleeves — arms bare below elbow
      px(ctx, x + s * 0.2, y + s * 0.56 + bob, s * 0.1, s * 0.12, skin);
      px(ctx, x + s * 0.68, y + s * 0.56 + bob, s * 0.1, s * 0.12, skin);
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.28, skin);
      // balding head — hair only on sides
      px(ctx, x + s * 0.28, y + s * 0.12 + bob, s * 0.1, s * 0.12, '#3a2a1a');
      px(ctx, x + s * 0.6, y + s * 0.12 + bob, s * 0.1, s * 0.12, '#3a2a1a');
      px(ctx, x + s * 0.32, y + s * 0.1 + bob, s * 0.36, s * 0.04, '#4a3a2a');
      if (dir !== 1) {
        // eyes — tired, half-closed
        px(ctx, x + s * 0.4, y + s * 0.26 + bob, s * 0.06, s * 0.03, '#2a2a2a');
        px(ctx, x + s * 0.54, y + s * 0.26 + bob, s * 0.06, s * 0.03, '#2a2a2a');
        // big bushy beard
        px(ctx, x + s * 0.3, y + s * 0.3 + bob, s * 0.4, s * 0.16, '#3a2a1a');
        px(ctx, x + s * 0.32, y + s * 0.32 + bob, s * 0.36, s * 0.04, '#4a3a2a');
        px(ctx, x + s * 0.34, y + s * 0.4 + bob, s * 0.32, s * 0.04, '#2a1a0a');
        // eyebrows
        px(ctx, x + s * 0.38, y + s * 0.22 + bob, s * 0.08, s * 0.02, '#2a1a0a');
        px(ctx, x + s * 0.54, y + s * 0.22 + bob, s * 0.08, s * 0.02, '#2a1a0a');
      }
      break;
    }
    case 'fishmonger': {
      // Bait Betty — yellow rain hat, blue waders, holding a fish
      px(ctx, x + s * 0.24, y + s * 0.5 + bob, s * 0.52, s * 0.26, '#3a5a7a');
      // wader straps
      px(ctx, x + s * 0.34, y + s * 0.48 + bob, s * 0.04, s * 0.12, '#5a7a9a');
      px(ctx, x + s * 0.6, y + s * 0.48 + bob, s * 0.04, s * 0.12, '#5a7a9a');
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.28, skin);
      // yellow rain hat
      px(ctx, x + s * 0.26, y + s * 0.06 + bob, s * 0.48, s * 0.14, '#d4c41a');
      px(ctx, x + s * 0.28, y + s * 0.08 + bob, s * 0.44, s * 0.08, '#e4d42a');
      // hat brim
      px(ctx, x + s * 0.22, y + s * 0.18 + bob, s * 0.56, s * 0.03, '#b4a41a');
      if (dir !== 1) {
        px(ctx, x + s * 0.4, y + s * 0.26 + bob, s * 0.06, s * 0.06, '#2a2a2a');
        px(ctx, x + s * 0.54, y + s * 0.26 + bob, s * 0.06, s * 0.06, '#2a2a2a');
        // freckles
        px(ctx, x + s * 0.36, y + s * 0.32 + bob, s * 0.02, s * 0.02, '#a06040');
        px(ctx, x + s * 0.6, y + s * 0.32 + bob, s * 0.02, s * 0.02, '#a06040');
        px(ctx, x + s * 0.48, y + s * 0.34 + bob, s * 0.02, s * 0.02, '#a06040');
        // grin
        px(ctx, x + s * 0.42, y + s * 0.36 + bob, s * 0.16, s * 0.02, '#5a3a2a');
      }
      // holding a fish
      px(ctx, x + s * 0.68, y + s * 0.5 + bob, s * 0.2, s * 0.08, '#6a9ab0');
      px(ctx, x + s * 0.84, y + s * 0.49 + bob, s * 0.06, s * 0.06, '#5a8aa0');
      px(ctx, x + s * 0.66, y + s * 0.52 + bob, s * 0.04, s * 0.06, '#6a9ab0');
      break;
    }
    case 'wren': {
      // Wren — green hooded cloak, pale face, quiet forest wanderer
      px(ctx, x + s * 0.2, y + s * 0.38 + bob, s * 0.6, s * 0.4, '#3a5a3a');
      px(ctx, x + s * 0.22, y + s * 0.4 + bob, s * 0.56, s * 0.04, '#4a6a4a');
      // hood opening — face visible inside
      px(ctx, x + s * 0.34, y + s * 0.16 + bob, s * 0.32, s * 0.26, skin);
      px(ctx, x + s * 0.32, y + s * 0.16 + bob, s * 0.36, s * 0.04, '#2a4a2a');
      // hood top — drapes over head
      px(ctx, x + s * 0.26, y + s * 0.04 + bob, s * 0.48, s * 0.16, '#3a5a3a');
      px(ctx, x + s * 0.28, y + s * 0.06 + bob, s * 0.44, s * 0.1, '#4a6a4a');
      // hood point
      px(ctx, x + s * 0.42, y + s * 0.0 + bob, s * 0.16, s * 0.06, '#3a5a3a');
      // hood sides drape
      px(ctx, x + s * 0.24, y + s * 0.18 + bob, s * 0.08, s * 0.2, '#2a4a2a');
      px(ctx, x + s * 0.68, y + s * 0.18 + bob, s * 0.08, s * 0.2, '#2a4a2a');
      if (dir !== 1) {
        // calm eyes
        px(ctx, x + s * 0.42, y + s * 0.26 + bob, s * 0.05, s * 0.04, '#2a4a3a');
        px(ctx, x + s * 0.54, y + s * 0.26 + bob, s * 0.05, s * 0.04, '#2a4a3a');
        // small frown — somber
        px(ctx, x + s * 0.44, y + s * 0.34 + bob, s * 0.12, s * 0.02, '#4a3a2a');
      }
      break;
    }
    case 'smoke': {
      // Smoke — dark-skinned stranger, dark coat, slicked-back hair, too many teeth
      const dSkin = '#5a3a2a';
      const dSkinShade = '#4a2e20';
      px(ctx, x + s * 0.24, y + s * 0.4 + bob, s * 0.52, s * 0.36, '#2a1a2a');
      px(ctx, x + s * 0.28, y + s * 0.44 + bob, s * 0.44, s * 0.28, '#3a2a3a');
      // collar
      px(ctx, x + s * 0.3, y + s * 0.4 + bob, s * 0.4, s * 0.06, '#1a0a1a');
      // head — dark skin
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.3, dSkin);
      px(ctx, x + s * 0.32, y + s * 0.16 + bob, s * 0.36, s * 0.24, dSkinShade);
      // slicked-back hair
      px(ctx, x + s * 0.28, y + s * 0.1 + bob, s * 0.44, s * 0.1, '#1a1a1a');
      px(ctx, x + s * 0.3, y + s * 0.08 + bob, s * 0.4, s * 0.06, '#0a0a0a');
      if (dir !== 1) {
        // glowing red eyes — vampire
        px(ctx, x + s * 0.38, y + s * 0.24 + bob, s * 0.06, s * 0.05, '#cc1a1a');
        px(ctx, x + s * 0.54, y + s * 0.24 + bob, s * 0.06, s * 0.05, '#cc1a1a');
        px(ctx, x + s * 0.39, y + s * 0.25 + bob, s * 0.02, s * 0.02, '#ff6a6a');
        px(ctx, x + s * 0.55, y + s * 0.25 + bob, s * 0.02, s * 0.02, '#ff6a6a');
        // smile — too many teeth
        px(ctx, x + s * 0.36, y + s * 0.34 + bob, s * 0.28, s * 0.03, '#1a0a0a');
        px(ctx, x + s * 0.38, y + s * 0.34 + bob, s * 0.04, s * 0.04, '#e8e8e0');
        px(ctx, x + s * 0.44, y + s * 0.34 + bob, s * 0.04, s * 0.04, '#e8e8e0');
        px(ctx, x + s * 0.5, y + s * 0.34 + bob, s * 0.04, s * 0.04, '#e8e8e0');
        px(ctx, x + s * 0.56, y + s * 0.34 + bob, s * 0.04, s * 0.04, '#e8e8e0');
      }
      break;
    }
    case 'stack': {
      // Stack — dark-skinned stranger, bald, heavy build, stern expression
      const dSkin = '#4a2e1e';
      const dSkinShade = '#3a2418';
      px(ctx, x + s * 0.24, y + s * 0.4 + bob, s * 0.52, s * 0.36, '#2a2a2a');
      px(ctx, x + s * 0.28, y + s * 0.44 + bob, s * 0.44, s * 0.28, '#1a1a1a');
      // broad shoulders
      px(ctx, x + s * 0.2, y + s * 0.46 + bob, s * 0.08, s * 0.16, '#2a2a2a');
      px(ctx, x + s * 0.72, y + s * 0.46 + bob, s * 0.08, s * 0.16, '#2a2a2a');
      // head — dark skin, bald
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.3, dSkin);
      px(ctx, x + s * 0.32, y + s * 0.16 + bob, s * 0.36, s * 0.24, dSkinShade);
      // scalp shine
      px(ctx, x + s * 0.36, y + s * 0.15 + bob, s * 0.28, s * 0.04, '#5a3e2e');
      if (dir !== 1) {
        // dark eyes — no glow, just cold
        px(ctx, x + s * 0.38, y + s * 0.24 + bob, s * 0.07, s * 0.05, '#0a0a0a');
        px(ctx, x + s * 0.54, y + s * 0.24 + bob, s * 0.07, s * 0.05, '#0a0a0a');
        // stubble
        px(ctx, x + s * 0.34, y + s * 0.32 + bob, s * 0.32, s * 0.08, dSkinShade);
        // flat mouth
        px(ctx, x + s * 0.4, y + s * 0.36 + bob, s * 0.2, s * 0.02, '#1a0a0a');
      }
      break;
    }
    default: {
      // generic NPC fallback
      px(ctx, x + s * 0.26, y + s * 0.42 + bob, s * 0.48, s * 0.32, color);
      px(ctx, x + s * 0.3, y + s * 0.14 + bob, s * 0.4, s * 0.3, skin);
      px(ctx, x + s * 0.28, y + s * 0.1 + bob, s * 0.44, s * 0.12, '#3a2a1a');
      if (dir !== 1) {
        px(ctx, x + s * 0.4, y + s * 0.26 + bob, s * 0.06, s * 0.06, '#2a2a2a');
        px(ctx, x + s * 0.54, y + s * 0.26 + bob, s * 0.06, s * 0.06, '#2a2a2a');
      }
    }
  }
}

// ---- Ghostly figure (fades) — type drives appearance ----
export function drawGhost(ctx, px_, py, alpha, type = 'pale', phase = 0) {
  const s = PX;
  const x = px_, y = py;
  const t = performance.now() / 1000;
  ctx.save();
  ctx.globalAlpha = alpha;

  if (type === 'wisp') {
    // small floating glowing orb, drifts up and down
    const drift = Math.sin(t * 1.5 + phase) * s * 0.12;
    const cx = x + s * 0.5, cy = y + s * 0.4 + drift;
    ctx.globalCompositeOperation = 'lighter';
    // outer glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.45);
    grad.addColorStop(0, 'rgba(180,255,160,0.75)');
    grad.addColorStop(0.35, 'rgba(120,232,144,0.4)');
    grad.addColorStop(1, 'rgba(120,232,144,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2); ctx.fill();
    // bright core
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.12);
    core.addColorStop(0, 'rgba(255,255,220,0.95)');
    core.addColorStop(1, 'rgba(220,255,160,0)');
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.12, 0, Math.PI * 2); ctx.fill();
    // sparkle trail
    for (let i = 0; i < 4; i++) {
      const a = t * 2 + i * 1.57 + phase;
      const sr = s * 0.15;
      const sx = cx + Math.cos(a) * sr;
      const sy = cy + Math.sin(a) * sr;
      ctx.fillStyle = `rgba(200,255,180,${0.3 + Math.sin(t * 3 + i) * 0.2})`;
      ctx.fillRect(sx, sy, s * 0.02, s * 0.02);
    }
    ctx.restore();
    return;
  }

  if (type === 'shadow') {
    // dark silhouette with glowing red eyes
    const sway = Math.sin(t + phase) * s * 0.04;
    px(ctx, x + s * 0.28 + sway, y + s * 0.18, s * 0.44, s * 0.62, '#12121f');
    px(ctx, x + s * 0.30 + sway, y + s * 0.7, s * 0.12, s * 0.18, '#0a0a14');
    px(ctx, x + s * 0.46 + sway, y + s * 0.7, s * 0.12, s * 0.18, '#0a0a14');
    // glowing eyes
    ctx.fillStyle = '#ff3a2a';
    ctx.fillRect(x + s * 0.36 + sway, y + s * 0.34, s * 0.06, s * 0.05);
    ctx.fillRect(x + s * 0.52 + sway, y + s * 0.34, s * 0.06, s * 0.05);
    ctx.restore();
    return;
  }

  if (type === 'drowned') {
    // bluish dripping figure
    const drip = (Math.sin(t * 2 + phase) * 0.5 + 0.5);
    px(ctx, x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.5, '#5a8aaa');
    px(ctx, x + s * 0.32, y + s * 0.6, s * 0.1, s * 0.2, '#4a7a9a');
    px(ctx, x + s * 0.5, y + s * 0.6, s * 0.1, s * 0.2, '#4a7a9a');
    // drips
    ctx.fillStyle = 'rgba(160,208,240,0.7)';
    ctx.fillRect(x + s * 0.38, y + s * 0.7, s * 0.03, s * 0.1 + drip * s * 0.1);
    ctx.fillRect(x + s * 0.56, y + s * 0.7, s * 0.03, s * 0.08 + (1 - drip) * s * 0.1);
    // eyes
    px(ctx, x + s * 0.4, y + s * 0.4, s * 0.06, s * 0.06, '#a0d0f0');
    px(ctx, x + s * 0.54, y + s * 0.4, s * 0.06, s * 0.06, '#a0d0f0');
    ctx.restore();
    return;
  }

  if (type === 'wraith') {
    // dark purple floating figure with crackling energy
    const float = Math.sin(t * 1.8 + phase) * s * 0.06;
    px(ctx, x + s * 0.26, y + s * 0.2 + float, s * 0.48, s * 0.5, '#2a1a3a');
    // tattered bottom
    for (let i = 0; i < 4; i++) {
      px(ctx, x + s * (0.28 + i * 0.11), y + s * 0.65 + float, s * 0.08, s * (0.12 + Math.sin(t * 3 + i) * 0.04), '#1a0a2a');
    }
    // crackle sparks
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const ang = t * 4 + i * 2.1 + phase;
      const sx = x + s * 0.5 + Math.cos(ang) * s * 0.25;
      const sy = y + s * 0.4 + float + Math.sin(ang) * s * 0.2;
      ctx.fillStyle = '#ff6aff';
      ctx.fillRect(sx, sy, s * 0.04, s * 0.04);
    }
    // glowing magenta eyes
    ctx.fillStyle = '#ff2aff';
    ctx.fillRect(x + s * 0.38, y + s * 0.36 + float, s * 0.06, s * 0.06);
    ctx.fillRect(x + s * 0.54, y + s * 0.36 + float, s * 0.06, s * 0.06);
    ctx.restore();
    return;
  }

  if (type === 'captain') {
    // Ghost of Captain Holloway — spectral sea captain in tattered sail-cloth shroud
    const float = Math.sin(t * 1.0 + phase) * s * 0.05;
    const sway = Math.sin(t * 0.7 + phase) * s * 0.03;
    // ghostly aura
    ctx.globalCompositeOperation = 'lighter';
    const aura = ctx.createRadialGradient(x + s * 0.5, y + s * 0.4 + float, 0, x + s * 0.5, y + s * 0.4 + float, s * 0.55);
    aura.addColorStop(0, 'rgba(140,180,220,0.3)');
    aura.addColorStop(1, 'rgba(140,180,220,0)');
    ctx.fillStyle = aura;
    ctx.fillRect(x, y, s, s);
    ctx.globalCompositeOperation = 'source-over';
    // tattered coat / sail-cloth shroud — flowing body
    px(ctx, x + s * 0.25 + sway, y + s * 0.25 + float, s * 0.5, s * 0.55, 'rgba(180,200,220,0.75)');
    // coat sides — darker
    px(ctx, x + s * 0.27 + sway, y + s * 0.6 + float, s * 0.16, s * 0.2, 'rgba(150,170,200,0.55)');
    px(ctx, x + s * 0.57 + sway, y + s * 0.6 + float, s * 0.16, s * 0.2, 'rgba(150,170,200,0.55)');
    // tattered wisps at bottom
    for (let i = 0; i < 5; i++) {
      const wx = x + s * (0.26 + i * 0.1) + sway;
      const wh = s * (0.1 + Math.sin(t * 2 + i) * 0.04);
      px(ctx, wx, y + s * 0.78 + float, s * 0.07, wh, 'rgba(160,180,210,0.45)');
    }
    // arms — reaching outward
    px(ctx, x + s * 0.18 + sway, y + s * 0.38 + float, s * 0.08, s * 0.22, 'rgba(170,190,215,0.65)');
    px(ctx, x + s * 0.74 + sway, y + s * 0.38 + float, s * 0.08, s * 0.22, 'rgba(170,190,215,0.65)');
    // tricorn hat — brim
    px(ctx, x + s * 0.28 + sway, y + s * 0.12 + float, s * 0.44, s * 0.08, 'rgba(60,70,90,0.85)');
    px(ctx, x + s * 0.22 + sway, y + s * 0.16 + float, s * 0.1, s * 0.06, 'rgba(50,60,80,0.75)');
    px(ctx, x + s * 0.68 + sway, y + s * 0.16 + float, s * 0.1, s * 0.06, 'rgba(50,60,80,0.75)');
    // hat crown
    px(ctx, x + s * 0.34 + sway, y + s * 0.06 + float, s * 0.32, s * 0.1, 'rgba(55,65,85,0.85)');
    // face — gaunt, pale
    px(ctx, x + s * 0.34 + sway, y + s * 0.22 + float, s * 0.32, s * 0.18, 'rgba(200,210,225,0.65)');
    // hollow eyes — glowing blue
    ctx.globalCompositeOperation = 'lighter';
    px(ctx, x + s * 0.38 + sway, y + s * 0.27 + float, s * 0.07, s * 0.06, 'rgba(120,200,255,0.95)');
    px(ctx, x + s * 0.55 + sway, y + s * 0.27 + float, s * 0.07, s * 0.06, 'rgba(120,200,255,0.95)');
    px(ctx, x + s * 0.39 + sway, y + s * 0.28 + float, s * 0.03, s * 0.03, 'rgba(200,240,255,1)');
    px(ctx, x + s * 0.56 + sway, y + s * 0.28 + float, s * 0.03, s * 0.03, 'rgba(200,240,255,1)');
    ctx.globalCompositeOperation = 'source-over';
    // mouth — wailing O
    px(ctx, x + s * 0.46 + sway, y + s * 0.36 + float, s * 0.06, s * 0.04, 'rgba(40,50,70,0.75)');
    // ghostly beard — wispy
    px(ctx, x + s * 0.4 + sway, y + s * 0.4 + float, s * 0.04, s * 0.08, 'rgba(200,210,225,0.4)');
    px(ctx, x + s * 0.56 + sway, y + s * 0.4 + float, s * 0.04, s * 0.08, 'rgba(200,210,225,0.4)');
    px(ctx, x + s * 0.46 + sway, y + s * 0.42 + float, s * 0.06, s * 0.06, 'rgba(190,200,215,0.35)');
    ctx.restore();
    return;
  }

  if (type === 'tentacle') {
    // The Island's true form — Lovecraftian shadow, writhing tentacles, glowing red eyes
    drawTentacleEntity(ctx, x + s * 0.5, y + s * 0.5, s * 0.95, t, alpha);
    ctx.restore();
    return;
  }

  // default: pale ghost — wisp-tailed spectre with mournful expression
  const float = Math.sin(t * 1.2 + phase) * s * 0.04;
  // body — translucent flowing
  px(ctx, x + s * 0.3, y + s * 0.28 + float, s * 0.4, s * 0.5, '#d4d4e4');
  px(ctx, x + s * 0.32, y + s * 0.58 + float, s * 0.1, s * 0.2, '#c4c4d4');
  px(ctx, x + s * 0.5, y + s * 0.58 + float, s * 0.1, s * 0.2, '#c4c4d4');
  // tattered wisp tails
  px(ctx, x + s * 0.32, y + s * 0.75 + float, s * 0.08, s * 0.15, '#b4b4c4');
  px(ctx, x + s * 0.52, y + s * 0.75 + float, s * 0.08, s * 0.15, '#b4b4c4');
  // arms — reaching
  px(ctx, x + s * 0.22, y + s * 0.4 + float, s * 0.08, s * 0.2, '#c4c4d4');
  px(ctx, x + s * 0.68, y + s * 0.4 + float, s * 0.08, s * 0.2, '#c4c4d4');
  // eyes — hollow dark
  px(ctx, x + s * 0.4, y + s * 0.4 + float, s * 0.06, s * 0.06, '#3a3a5a');
  px(ctx, x + s * 0.54, y + s * 0.4 + float, s * 0.06, s * 0.06, '#3a3a5a');
  // eye glow — faint
  ctx.globalCompositeOperation = 'lighter';
  px(ctx, x + s * 0.41, y + s * 0.41 + float, s * 0.02, s * 0.02, '#8a8aaa');
  px(ctx, x + s * 0.55, y + s * 0.41 + float, s * 0.02, s * 0.02, '#8a8aaa');
  ctx.globalCompositeOperation = 'source-over';
  // mournful mouth — small O
  px(ctx, x + s * 0.46, y + s * 0.48 + float, s * 0.06, s * 0.04, '#3a3a5a');
  ctx.restore();
}

// ---- Ground collectible item ----
export function drawGroundItem(ctx, type, px_, py) {
  const s = PX;
  if (type === 'footprints') {
    // trail of wet, too-long bare footprints
    const wet = '#2a3a4a';
    const shine = '#5a7a9a';
    for (let i = 0; i < 3; i++) {
      const fx = px_ + s * (0.18 + i * 0.26);
      const fy = py + s * (0.45 + (i % 2) * 0.12);
      // sole pad
      px(ctx, fx, fy, s * 0.13, s * 0.08, wet);
      // toes — too long
      px(ctx, fx + s * 0.01, fy - s * 0.06, s * 0.03, s * 0.06, wet);
      px(ctx, fx + s * 0.05, fy - s * 0.07, s * 0.025, s * 0.07, wet);
      px(ctx, fx + s * 0.09, fy - s * 0.05, s * 0.025, s * 0.05, wet);
      // wet sheen
      px(ctx, fx + s * 0.02, fy + s * 0.01, s * 0.05, s * 0.03, shine);
    }
    return;
  }
  if (type === 'note') {
    // waterlogged parchment note pinned under a stone
    px(ctx, px_ + s * 0.28, py + s * 0.48, s * 0.38, s * 0.24, '#d4c8a0');
    px(ctx, px_ + s * 0.30, py + s * 0.50, s * 0.34, s * 0.02, '#a89870');
    px(ctx, px_ + s * 0.30, py + s * 0.56, s * 0.34, s * 0.02, '#a89870');
    px(ctx, px_ + s * 0.30, py + s * 0.62, s * 0.34, s * 0.02, '#a89870');
    // wet stain
    px(ctx, px_ + s * 0.38, py + s * 0.54, s * 0.1, s * 0.06, '#8a9aaa');
    // holding stone
    px(ctx, px_ + s * 0.6, py + s * 0.6, s * 0.14, s * 0.1, '#5a5a64');
    px(ctx, px_ + s * 0.62, py + s * 0.6, s * 0.1, s * 0.04, '#6a6a74');
    return;
  }
  if (type === 'evidence_sailcloth') {
    // tattered cloth draped on ground
    px(ctx, px_ + s * 0.18, py + s * 0.5, s * 0.5, s * 0.22, '#d4c8a8');
    px(ctx, px_ + s * 0.15, py + s * 0.55, s * 0.1, s * 0.14, '#b8ac8c');
    px(ctx, px_ + s * 0.62, py + s * 0.5, s * 0.08, s * 0.18, '#b8ac8c');
    px(ctx, px_ + s * 0.35, py + s * 0.55, s * 0.02, s * 0.1, '#8a7e68');
    px(ctx, px_ + s * 0.5, py + s * 0.58, s * 0.02, s * 0.08, '#8a7e68');
    // faint glow
    px(ctx, px_ + s * 0.3, py + s * 0.48, s * 0.2, s * 0.03, 'rgba(200,180,120,0.2)');
    return;
  }
  if (type === 'evidence_conch') {
    // spiral shell
    px(ctx, px_ + s * 0.28, py + s * 0.38, s * 0.36, s * 0.3, '#e0d0b0');
    px(ctx, px_ + s * 0.34, py + s * 0.44, s * 0.24, s * 0.2, '#f0e0c0');
    px(ctx, px_ + s * 0.4, py + s * 0.5, s * 0.12, s * 0.1, '#d4c4a4');
    px(ctx, px_ + s * 0.45, py + s * 0.54, s * 0.05, s * 0.05, '#b8a884');
    // opening
    px(ctx, px_ + s * 0.3, py + s * 0.5, s * 0.08, s * 0.06, '#9a8a64');
    return;
  }
  if (type === 'evidence_boot') {
    // boot lying on its side
    px(ctx, px_ + s * 0.2, py + s * 0.5, s * 0.42, s * 0.16, '#4a3828');
    px(ctx, px_ + s * 0.2, py + s * 0.4, s * 0.2, s * 0.2, '#4a3828');
    px(ctx, px_ + s * 0.22, py + s * 0.42, s * 0.16, s * 0.14, '#5a4838');
    // crescent heel mark
    px(ctx, px_ + s * 0.5, py + s * 0.55, s * 0.07, s * 0.04, '#8a7a6a');
    px(ctx, px_ + s * 0.52, py + s * 0.56, s * 0.04, s * 0.02, '#aa9a8a');
    return;
  }
  if (type === 'evidence_fogoil') {
    // small glass bottle
    px(ctx, px_ + s * 0.35, py + s * 0.4, s * 0.2, s * 0.3, '#3a4a5a');
    px(ctx, px_ + s * 0.37, py + s * 0.42, s * 0.16, s * 0.22, '#4a5a6a');
    px(ctx, px_ + s * 0.4, py + s * 0.35, s * 0.1, s * 0.08, '#5a4a3a');
    // glass shine
    px(ctx, px_ + s * 0.4, py + s * 0.45, s * 0.04, s * 0.1, '#6a8a9a');
    // oily residue puddle
    px(ctx, px_ + s * 0.3, py + s * 0.68, s * 0.3, s * 0.03, 'rgba(60,80,100,0.3)');
    return;
  }
  // default: antique / small chest
  px(ctx, px_ + s * 0.35, py + s * 0.45, s * 0.3, s * 0.25, '#c4b48a');
  px(ctx, px_ + s * 0.4, py + s * 0.4, s * 0.2, s * 0.1, '#8a7a5a');
}

// ---- Witch's Tome ground item (on pedestal) ----
export function drawWitchTome(ctx, px_, py) {
  const s = PX;
  const t = performance.now() / 500;
  const glow = 0.5 + Math.sin(t) * 0.2;
  // pedestal
  px(ctx, px_ + s * 0.3, py + s * 0.6, s * 0.4, s * 0.25, '#3a3a42');
  px(ctx, px_ + s * 0.32, py + s * 0.62, s * 0.36, s * 0.2, '#4a4a52');
  px(ctx, px_ + s * 0.34, py + s * 0.64, s * 0.32, s * 0.16, '#5a5a62');
  // tome book
  px(ctx, px_ + s * 0.28, py + s * 0.35, s * 0.44, s * 0.3, '#3a1525');
  px(ctx, px_ + s * 0.3, py + s * 0.37, s * 0.4, s * 0.26, '#4a1a30');
  // cover decoration — pentagram/eye
  px(ctx, px_ + s * 0.4, py + s * 0.42, s * 0.2, s * 0.16, '#2a0a15');
  ctx.save();
  ctx.globalAlpha = glow;
  px(ctx, px_ + s * 0.44, py + s * 0.45, s * 0.12, s * 0.1, '#c43a5a');
  px(ctx, px_ + s * 0.46, py + s * 0.47, s * 0.08, s * 0.06, '#ff5a7a');
  ctx.restore();
  // pages — old and yellowed
  px(ctx, px_ + s * 0.3, py + s * 0.55, s * 0.4, s * 0.04, '#c4b48a');
  px(ctx, px_ + s * 0.3, py + s * 0.58, s * 0.4, s * 0.02, '#a49474');
  // spine
  px(ctx, px_ + s * 0.28, py + s * 0.35, s * 0.03, s * 0.3, '#2a0a15');
  // glow aura
  ctx.save();
  ctx.globalAlpha = glow * 0.15;
  ctx.fillStyle = '#c43a5a';
  ctx.beginPath();
  ctx.arc(px_ + s * 0.5, py + s * 0.5, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---- Color helper ----
function shade(hex, amt) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.min(255, r + amt));
  const ng = Math.max(0, Math.min(255, g + amt));
  const nb = Math.max(0, Math.min(255, b + amt));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// ---- The Island's true form: Lovecraftian tentacle shadow ----
export function drawTentacleEntity(ctx, cx, cy, size, t, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const s = size;
  const sway = Math.sin(t * 0.8) * s * 0.03;
  // Dark fog aura — what lies within is unknowable
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.6);
  aura.addColorStop(0, 'rgba(20,5,25,0.55)');
  aura.addColorStop(0.5, 'rgba(15,2,20,0.28)');
  aura.addColorStop(1, 'rgba(10,0,15,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(cx - s * 0.6, cy - s * 0.6, s * 1.2, s * 1.2);
  // Writhing tentacles — dark silhouettes reaching into the void
  ctx.fillStyle = '#0a0512';
  const numTent = 7;
  for (let i = 0; i < numTent; i++) {
    const baseAngle = (i / numTent) * Math.PI * 2 + sway + Math.PI * 0.5;
    const wiggle = Math.sin(t * 2 + i * 1.3) * 0.35;
    const angle = baseAngle + wiggle;
    const len = s * (0.22 + Math.sin(t * 1.5 + i) * 0.06 + (i % 2) * 0.04);
    const bx = cx + Math.cos(baseAngle) * s * 0.1;
    const by = cy + Math.sin(baseAngle) * s * 0.1;
    const ex = cx + Math.cos(angle) * len;
    const ey = cy + Math.sin(angle) * len;
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.035, by);
    ctx.quadraticCurveTo(
      (bx + ex) / 2 + Math.sin(t + i) * s * 0.04,
      (by + ey) / 2 + Math.cos(t + i) * s * 0.04,
      ex, ey
    );
    ctx.quadraticCurveTo((bx + ex) / 2, (by + ey) / 2, bx + s * 0.035, by);
    ctx.fill();
  }
  // Central mass — dark, amorphous, shifting
  ctx.fillStyle = '#080208';
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.17, s * 0.21, sway, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0d0410';
  ctx.beginPath(); ctx.arc(cx - s * 0.07, cy - s * 0.04, s * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + s * 0.06, cy - s * 0.07, s * 0.09, 0, Math.PI * 2); ctx.fill();
  // Glowing red eyes — the only thing truly visible
  ctx.globalCompositeOperation = 'lighter';
  const eyeGlow = 0.65 + Math.sin(t * 3) * 0.3;
  ctx.fillStyle = `rgba(255,30,20,${eyeGlow})`;
  ctx.beginPath(); ctx.arc(cx - s * 0.055, cy - s * 0.05, s * 0.024, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + s * 0.05, cy - s * 0.06, s * 0.021, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,210,190,${eyeGlow})`;
  ctx.beginPath(); ctx.arc(cx - s * 0.055, cy - s * 0.05, s * 0.009, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + s * 0.05, cy - s * 0.06, s * 0.008, 0, Math.PI * 2); ctx.fill();
  // a third eye — faint, watching from above
  ctx.fillStyle = `rgba(200,20,30,${eyeGlow * 0.45})`;
  ctx.beginPath(); ctx.arc(cx - s * 0.003, cy - s * 0.12, s * 0.011, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

// ---- Shadow under entities ----
export function drawShadow(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.5, y + s * 0.92, s * 0.3, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Heart particle ----
export function drawHeart(ctx, x, y, size, color) {
  const h = size * 2;
  ctx.fillStyle = color;
  // two top lobes
  ctx.fillRect(x, y, h * 0.4, h * 0.4);
  ctx.fillRect(x + h * 0.5, y, h * 0.4, h * 0.4);
  // middle block
  ctx.fillRect(x + h * 0.1, y + h * 0.25, h * 0.7, h * 0.3);
  // bottom point — triangle
  ctx.beginPath();
  ctx.moveTo(x + h * 0.1, y + h * 0.5);
  ctx.lineTo(x + h * 0.8, y + h * 0.5);
  ctx.lineTo(x + h * 0.45, y + h * 0.85);
  ctx.closePath();
  ctx.fill();
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(x + h * 0.1, y + h * 0.05, h * 0.12, h * 0.12);
}

// ---- Enemy rendering ---- (delegates to enemySprites.js for distinct monster silhouettes)
export function drawEnemy(ctx, ox, oy, enemy, frame) {
  drawEnemySprite(ctx, ox, oy, enemy, frame);
}
// ---- Legacy enemy body (unused — kept for reference, will be removed) ----
function _legacyDrawEnemy(ctx, ox, oy, enemy, frame) {
  const s = PX;
  const x = ox, y = oy;
  const flash = enemy.hitFlash > 0;
  const c = flash ? '#ffffff' : enemy.color;
  const dark = flash ? '#dddddd' : enemy.dark;
  const bob = [0, -1, 0, -1][frame % 4];

  drawShadow(ctx, x, y, s);
  const t = enemy.typeId;

  if (t === 'bat') {
    const wf = Math.sin(frame * 0.8) * s * 0.12;
    px(ctx, x + s * 0.05, y + s * 0.3 + bob - wf, s * 0.2, s * 0.35, dark);
    px(ctx, x + s * 0.75, y + s * 0.3 + bob - wf, s * 0.2, s * 0.35, dark);
    px(ctx, x + s * 0.3, y + s * 0.35 + bob, s * 0.4, s * 0.3, c);
    px(ctx, x + s * 0.35, y + s * 0.55 + bob, s * 0.3, s * 0.1, dark);
    px(ctx, x + s * 0.38, y + s * 0.22 + bob, s * 0.06, s * 0.06, '#ff3a2a');
    px(ctx, x + s * 0.56, y + s * 0.22 + bob, s * 0.06, s * 0.06, '#ff3a2a');
  } else if (t === 'slime') {
    px(ctx, x + s * 0.15, y + s * 0.5 + bob, s * 0.7, s * 0.35, c);
    px(ctx, x + s * 0.2, y + s * 0.45 + bob, s * 0.6, s * 0.12, dark);
    px(ctx, x + s * 0.25, y + s * 0.5 + bob, s * 0.15, s * 0.08, shade(c, 30));
    px(ctx, x + s * 0.38, y + s * 0.58 + bob, s * 0.07, s * 0.07, '#1a1a1a');
    px(ctx, x + s * 0.55, y + s * 0.58 + bob, s * 0.07, s * 0.07, '#1a1a1a');
  } else if (t === 'spider') {
    px(ctx, x + s * 0.1, y + s * 0.35 + bob, s * 0.12, s * 0.3, dark);
    px(ctx, x + s * 0.78, y + s * 0.35 + bob, s * 0.12, s * 0.3, dark);
    px(ctx, x + s * 0.05, y + s * 0.45 + bob, s * 0.12, s * 0.25, dark);
    px(ctx, x + s * 0.83, y + s * 0.45 + bob, s * 0.12, s * 0.25, dark);
    px(ctx, x + s * 0.28, y + s * 0.3 + bob, s * 0.44, s * 0.35, c);
    px(ctx, x + s * 0.35, y + s * 0.2 + bob, s * 0.3, s * 0.15, dark);
    px(ctx, x + s * 0.38, y + s * 0.38 + bob, s * 0.06, s * 0.06, '#ff3a2a');
    px(ctx, x + s * 0.56, y + s * 0.38 + bob, s * 0.06, s * 0.06, '#ff3a2a');
  } else if (t === 'centipede') {
    // segmented body — multiple rounded segments with legs
    const wig = Math.sin(frame * 0.5) * s * 0.04;
    for (let i = 0; i < 5; i++) {
      const sx = x + s * (0.15 + i * 0.14) + (i % 2 ? wig : -wig);
      const sy = y + s * 0.45 + bob;
      const sz = s * (0.16 - i * 0.01);
      px(ctx, sx, sy, sz, s * 0.2, i % 2 ? c : dark);
      // legs
      px(ctx, sx, sy + s * 0.18, s * 0.03, s * 0.08, dark);
      px(ctx, sx + sz - s * 0.03, sy + s * 0.18, s * 0.03, s * 0.08, dark);
    }
    // head with mandibles
    px(ctx, x + s * 0.72 + wig, y + s * 0.4 + bob, s * 0.14, s * 0.18, c);
    px(ctx, x + s * 0.82 + wig, y + s * 0.36 + bob, s * 0.04, s * 0.08, dark);
    px(ctx, x + s * 0.82 + wig, y + s * 0.5 + bob, s * 0.04, s * 0.08, dark);
    px(ctx, x + s * 0.76 + wig, y + s * 0.44 + bob, s * 0.05, s * 0.05, '#ff3a2a');
  } else if (t === 'mushroom_zombie') {
    // shambling humanoid with a mushroom cap for a head
    px(ctx, x + s * 0.3, y + s * 0.65 + bob, s * 0.15, s * 0.25, dark);
    px(ctx, x + s * 0.55, y + s * 0.65 + bob, s * 0.15, s * 0.25, dark);
    px(ctx, x + s * 0.25, y + s * 0.35 + bob, s * 0.5, s * 0.35, c);
    px(ctx, x + s * 0.28, y + s * 0.38 + bob, s * 0.44, s * 0.12, dark);
    // mushroom cap head
    px(ctx, x + s * 0.28, y + s * 0.1 + bob, s * 0.44, s * 0.22, '#b06050');
    px(ctx, x + s * 0.3, y + s * 0.08 + bob, s * 0.4, s * 0.16, '#c47060');
    // spots
    px(ctx, x + s * 0.35, y + s * 0.14 + bob, s * 0.06, s * 0.06, '#e0d0b0');
    px(ctx, x + s * 0.52, y + s * 0.18 + bob, s * 0.05, s * 0.05, '#e0d0b0');
    // stalk
    px(ctx, x + s * 0.4, y + s * 0.3 + bob, s * 0.2, s * 0.08, '#d4c4a0');
    // glowing eyes under cap
    px(ctx, x + s * 0.38, y + s * 0.3 + bob, s * 0.06, s * 0.05, '#5aff5a');
    px(ctx, x + s * 0.54, y + s * 0.3 + bob, s * 0.06, s * 0.05, '#5aff5a');
    // spore particles
    px(ctx, x + s * 0.2, y + s * 0.2 + bob, s * 0.03, s * 0.03, 'rgba(180,160,100,0.4)');
    px(ctx, x + s * 0.7, y + s * 0.25 + bob, s * 0.03, s * 0.03, 'rgba(180,160,100,0.4)');
  } else if (t === 'bone_serpent') {
    // sinuous skeletal snake — segmented spine with ribs
    const wave = Math.sin(frame * 0.4) * s * 0.06;
    for (let i = 0; i < 6; i++) {
      const sx = x + s * (0.15 + i * 0.12);
      const sy = y + s * 0.5 + bob + Math.sin(frame * 0.3 + i * 0.8) * s * 0.05;
      px(ctx, sx, sy, s * 0.1, s * 0.12, i % 2 ? c : dark);
      // ribs
      px(ctx, sx - s * 0.02, sy + s * 0.1, s * 0.04, s * 0.06, dark);
      px(ctx, sx + s * 0.08, sy + s * 0.1, s * 0.04, s * 0.06, dark);
    }
    // skull head
    px(ctx, x + s * 0.78 + wave, y + s * 0.42 + bob, s * 0.16, s * 0.18, c);
    px(ctx, x + s * 0.82 + wave, y + s * 0.44 + bob, s * 0.08, s * 0.1, dark);
    // jaw with teeth
    px(ctx, x + s * 0.88 + wave, y + s * 0.5 + bob, s * 0.06, s * 0.04, dark);
    px(ctx, x + s * 0.82 + wave, y + s * 0.46 + bob, s * 0.03, s * 0.03, '#ff3a2a');
  } else if (t === 'cave_troll' || t === 'blood_beast' || t === 'ancient_guardian') {
    // big brute — large body, small head, long arms
    px(ctx, x + s * 0.08, y + s * 0.25 + bob, s * 0.84, s * 0.55, c);
    px(ctx, x + s * 0.12, y + s * 0.28 + bob, s * 0.76, s * 0.2, dark);
    px(ctx, x + s * 0.15, y + s * 0.45 + bob, s * 0.25, s * 0.15, shade(c, -20));
    px(ctx, x + s * 0.55, y + s * 0.5 + bob, s * 0.2, s * 0.12, shade(c, -20));
    // tiny head
    px(ctx, x + s * 0.35, y + s * 0.08 + bob, s * 0.3, s * 0.22, c);
    px(ctx, x + s * 0.37, y + s * 0.1 + bob, s * 0.26, s * 0.16, dark);
    // tusks
    px(ctx, x + s * 0.38, y + s * 0.26 + bob, s * 0.04, s * 0.06, '#d4d4c4');
    px(ctx, x + s * 0.58, y + s * 0.26 + bob, s * 0.04, s * 0.06, '#d4d4c4');
    // eyes
    px(ctx, x + s * 0.4, y + s * 0.16 + bob, s * 0.06, s * 0.06, '#ff3a2a');
    px(ctx, x + s * 0.54, y + s * 0.16 + bob, s * 0.06, s * 0.06, '#ff3a2a');
    // arms
    px(ctx, x + s * 0.02, y + s * 0.4 + bob, s * 0.1, s * 0.3, c);
    px(ctx, x + s * 0.88, y + s * 0.4 + bob, s * 0.1, s * 0.3, c);
    if (t === 'blood_beast') {
      // pulsating veins
      px(ctx, x + s * 0.2, y + s * 0.35 + bob, s * 0.04, s * 0.2, '#6a1818');
      px(ctx, x + s * 0.6, y + s * 0.35 + bob, s * 0.04, s * 0.2, '#6a1818');
    }
    if (t === 'ancient_guardian') {
      // glowing runes
      px(ctx, x + s * 0.3, y + s * 0.5 + bob, s * 0.04, s * 0.04, '#4a9ac8');
      px(ctx, x + s * 0.66, y + s * 0.5 + bob, s * 0.04, s * 0.04, '#4a9ac8');
    }
  } else if (t === 'golem' || t === 'abyssal') {
    px(ctx, x + s * 0.1, y + s * 0.1 + bob, s * 0.8, s * 0.8, c);
    px(ctx, x + s * 0.15, y + s * 0.15 + bob, s * 0.7, s * 0.15, dark);
    px(ctx, x + s * 0.2, y + s * 0.3 + bob, s * 0.2, s * 0.15, shade(c, -20));
    px(ctx, x + s * 0.55, y + s * 0.35 + bob, s * 0.15, s * 0.1, shade(c, -20));
    px(ctx, x + s * 0.2, y + s * 0.6 + bob, s * 0.6, s * 0.08, dark);
    px(ctx, x + s * 0.35, y + s * 0.2 + bob, s * 0.08, s * 0.08, '#ff3a2a');
    px(ctx, x + s * 0.57, y + s * 0.2 + bob, s * 0.08, s * 0.08, '#ff3a2a');
  } else {
    // generic humanoid: skeleton, ghoul, wraith, demon, shadow, rat, crystal_wraith, fire_imp, ice_lurker, dark_knight, void_warden
    const isFloaty = (t === 'wraith' || t === 'shadow' || t === 'void_warden' || t === 'crystal_wraith');
    const legY = isFloaty ? s * 0.7 : s * 0.65;
    px(ctx, x + s * 0.3, y + legY + bob, s * 0.15, s * 0.25, dark);
    px(ctx, x + s * 0.55, y + legY + bob, s * 0.15, s * 0.25, dark);
    if (isFloaty) {
      px(ctx, x + s * 0.25, y + s * 0.8 + bob, s * 0.12, s * 0.15, c);
      px(ctx, x + s * 0.4, y + s * 0.85 + bob, s * 0.1, s * 0.1, dark);
      px(ctx, x + s * 0.58, y + s * 0.8 + bob, s * 0.12, s * 0.15, c);
    }
    px(ctx, x + s * 0.25, y + s * 0.35 + bob, s * 0.5, s * 0.35, c);
    px(ctx, x + s * 0.28, y + s * 0.38 + bob, s * 0.44, s * 0.12, dark);
    px(ctx, x + s * 0.3, y + s * 0.12 + bob, s * 0.4, s * 0.28, c);
    px(ctx, x + s * 0.28, y + s * 0.36 + bob, s * 0.44, s * 0.06, dark);
    if (t === 'demon' || t === 'fire_imp') {
      px(ctx, x + s * 0.28, y + s * 0.02 + bob, s * 0.1, s * 0.14, dark);
      px(ctx, x + s * 0.62, y + s * 0.02 + bob, s * 0.1, s * 0.14, dark);
    }
    if (t === 'fire_imp') {
      // fiery aura
      px(ctx, x + s * 0.15, y + s * 0.5 + bob, s * 0.05, s * 0.08, '#ff6600');
      px(ctx, x + s * 0.8, y + s * 0.5 + bob, s * 0.05, s * 0.08, '#ff6600');
      px(ctx, x + s * 0.2, y + s * 0.15 + bob, s * 0.04, s * 0.06, '#ffaa30');
    }
    if (t === 'ice_lurker') {
      // ice crystals on shoulders
      px(ctx, x + s * 0.2, y + s * 0.3 + bob, s * 0.08, s * 0.1, '#a0d4e8');
      px(ctx, x + s * 0.72, y + s * 0.3 + bob, s * 0.08, s * 0.1, '#a0d4e8');
      // frost breath
      px(ctx, x + s * 0.4, y + s * 0.35 + bob, s * 0.04, s * 0.04, 'rgba(180,220,240,0.5)');
    }
    if (t === 'dark_knight') {
      // armor plate
      px(ctx, x + s * 0.3, y + s * 0.4 + bob, s * 0.4, s * 0.2, shade(c, -30));
      px(ctx, x + s * 0.42, y + s * 0.42 + bob, s * 0.16, s * 0.16, shade(c, 20));
      // visor slit
      px(ctx, x + s * 0.36, y + s * 0.2 + bob, s * 0.28, s * 0.04, '#1a1a1a');
      px(ctx, x + s * 0.4, y + s * 0.21 + bob, s * 0.06, s * 0.02, '#ff3a2a');
      px(ctx, x + s * 0.54, y + s * 0.21 + bob, s * 0.06, s * 0.02, '#ff3a2a');
    }
    if (t === 'crystal_wraith') {
      // crystal shards embedded in body
      px(ctx, x + s * 0.3, y + s * 0.42 + bob, s * 0.06, s * 0.12, '#8ac4e8');
      px(ctx, x + s * 0.64, y + s * 0.42 + bob, s * 0.06, s * 0.12, '#8ac4e8');
      // glow
      px(ctx, x + s * 0.35, y + s * 0.2 + bob, s * 0.1, s * 0.1, 'rgba(120,200,240,0.3)');
    }
    if (t === 'rat') {
      px(ctx, x + s * 0.7, y + s * 0.5 + bob, s * 0.2, s * 0.06, dark);
      px(ctx, x + s * 0.85, y + s * 0.45 + bob, s * 0.08, s * 0.08, dark);
    }
    if (t !== 'dark_knight') {
      px(ctx, x + s * 0.38, y + s * 0.22 + bob, s * 0.07, s * 0.07, '#ff3a2a');
      px(ctx, x + s * 0.55, y + s * 0.22 + bob, s * 0.07, s * 0.07, '#ff3a2a');
    }
  }
}

// ---- Undead Shaman Boss ----
export function drawShamanBoss(ctx, ox, oy, enemy, frame) {
  const s = PX;
  const x = ox, y = oy;
  const flash = enemy.hitFlash > 0;
  const t = performance.now() / 1000;
  const float = Math.sin(t * 1.2) * s * 0.04;
  const bob = float;
  const c = flash ? '#ffffff' : (enemy.phase >= 2 ? '#3a5a3a' : enemy.color);
  const dark = flash ? '#dddddd' : (enemy.phase >= 2 ? '#1a3a1a' : enemy.dark);
  const glow = enemy.phase >= 1 ? '#4aff4a' : '#8a7aaa';

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.5, y + s * 0.92, s * 0.42, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // tattered robe — large, floating
  px(ctx, x + s * 0.15, y + s * 0.25 + bob, s * 0.7, s * 0.55, c);
  px(ctx, x + s * 0.18, y + s * 0.3 + bob, s * 0.64, s * 0.4, dark);
  // robe tatters at bottom
  for (let i = 0; i < 5; i++) {
    const tx = x + s * (0.18 + i * 0.13);
    const th = s * (0.1 + Math.sin(t * 3 + i) * 0.04);
    px(ctx, tx, y + s * 0.75 + bob, s * 0.1, th, dark);
  }

  // bone ribcage visible through robe
  px(ctx, x + s * 0.35, y + s * 0.4 + bob, s * 0.04, s * 0.2, '#d4d4c4');
  px(ctx, x + s * 0.45, y + s * 0.4 + bob, s * 0.04, s * 0.2, '#d4d4c4');
  px(ctx, x + s * 0.55, y + s * 0.4 + bob, s * 0.04, s * 0.2, '#d4d4c4');
  // horizontal ribs
  for (let i = 0; i < 3; i++)
    px(ctx, x + s * 0.33, y + s * (0.42 + i * 0.07) + bob, s * 0.3, s * 0.015, '#b4b4a4');

  // skull head
  px(ctx, x + s * 0.32, y + s * 0.08 + bob, s * 0.36, s * 0.3, '#e0e0d0');
  px(ctx, x + s * 0.34, y + s * 0.1 + bob, s * 0.32, s * 0.25, '#d0d0c0');
  // eye sockets — glowing
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 8;
  px(ctx, x + s * 0.38, y + s * 0.18 + bob, s * 0.08, s * 0.08, glow);
  px(ctx, x + s * 0.54, y + s * 0.18 + bob, s * 0.08, s * 0.08, glow);
  ctx.shadowBlur = 0;
  // nose hole
  px(ctx, x + s * 0.46, y + s * 0.28 + bob, s * 0.04, s * 0.04, '#1a1a1a');
  // teeth
  for (let i = 0; i < 4; i++)
    px(ctx, x + s * (0.38 + i * 0.07), y + s * 0.33 + bob, s * 0.04, s * 0.04, '#c4c4b4');

  // antler crown — bones tied to skull
  px(ctx, x + s * 0.3, y + s * 0.02 + bob, s * 0.03, s * 0.1, '#d4d4c4');
  px(ctx, x + s * 0.3, y + s * 0.02 + bob, s * 0.06, s * 0.02, '#b4b4a4');
  px(ctx, x + s * 0.67, y + s * 0.02 + bob, s * 0.03, s * 0.1, '#d4d4c4');
  px(ctx, x + s * 0.64, y + s * 0.02 + bob, s * 0.06, s * 0.02, '#b4b4a4');

  // staff in right hand
  px(ctx, x + s * 0.72, y + s * 0.3 + bob, s * 0.04, s * 0.5, '#4a3a2a');
  px(ctx, x + s * 0.73, y + s * 0.28 + bob, s * 0.02, s * 0.5, '#6a5a3a');
  // staff orb — glowing
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 12;
  px(ctx, x + s * 0.7, y + s * 0.22 + bob, s * 0.1, s * 0.1, glow);
  ctx.shadowBlur = 0;

  // crackling energy in phase 2+
  if (enemy.phase >= 1) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const ang = t * 5 + i * 1.57;
      const ex = x + s * 0.5 + Math.cos(ang) * s * 0.35;
      const ey = y + s * 0.5 + bob + Math.sin(ang) * s * 0.3;
      ctx.fillStyle = glow;
      ctx.fillRect(ex, ey, s * 0.04, s * 0.04);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // boss health bar above
  const barW = s * 0.8;
  const barH = 4;
  const barX = x + s * 0.1;
  const barY = y - 6;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#3a1a1a';
  ctx.fillRect(barX, barY, barW, barH);
  const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
  ctx.fillStyle = hpPct > 0.5 ? '#4a8a3a' : hpPct > 0.25 ? '#c4a030' : '#c43030';
  ctx.fillRect(barX, barY, barW * hpPct, barH);
}