// Main game engine: state, input, update loop, rendering, farming, fishing, building, mystery, save/load
import { T, TILE_PROPS, ZONE_DEFS, ITEMS, SEASONS, BUILDABLES, MYSTERY_EVENTS, DAY_LENGTH, TIME_START, SELL_PRICES, SHOP_ITEMS, FISHING_SHOP_ITEMS, getGrottoPrize, TOOLS, SALOON_RESTORE_COST, WEAPONS, ARMOR, SALOON_ITEMS, CRAFT_RECIPES } from './constants';
import { VILLAINS, TRUTH_FRAGMENTS, getIslandMonologue, CYCLE_CONFIG, GROTTO_BOTTOM, HOLLOWAY_EVIDENCE, HOLLOWAY_CONFRONTATION, canChooseHanzo, getTrueEndingMonologue } from './story';
// GROTTO_BOTTOM is used in loadGrotto for lighthouse key chest removal
import { NIKKI_NPC, shouldSpawnNikki, getNikkiPlacement, checkNikkiKidnapping, getNikkiBasementNpcs, getNikkiDialogue, NIKKI_BASEMENT_LINE } from './nikki';
import { installParticles } from './particles';
import { installActionPrompt } from './actionPrompt';
import { installNikkiCompanion } from './nikkiCompanion';
import { installCompanionTalk } from './companionTalk';
import { installConsumables } from './consumables';
import { DEJA_VU_LINES } from './dejavu';
import { evaluateEncounters } from './encounters';
import { generateZone } from './maps';
import { Renderer3D } from './renderer3d';
import { installBuildPreview } from './buildPreview';
import { installInteract } from './interactSystem';
import { installObjectVisuals } from './objectVisuals';
import { installTentacleMonument } from './tentacleMonument'; import { installNpcWander } from './npcWander';
import { installFarmStructures } from './farmStructures';
import { installExtraStructures } from './extraStructures';
import { installTileDecor } from './tileDecor';
import { Atmosphere } from './atmosphere';
import { AudioEngine } from './audio';
import { rollFish, getFishInfo, getFishSellPrice, getRarityInfo } from './fish';
import { spawnEnemies, spawnBoss, getBossType } from './enemies';
import { saveMeta } from './saveManager';
import { WEATHER_TYPES, rollSpirit, getSpirit } from './weather';
import { getRomanceNpc, getRomanceDialogue, getRomanceLevel, getGiftReaction, ROMANCE_THRESHOLD_CONFESSION } from './romance';
import { STRANGER_NPCS, shouldSpawnStrangers, rollStrangerArrival, getStrangerShopItems } from './strangers';
import { FISH_TABLE } from './fish';
import { pickSeasonalWeather } from './seasons';

export class Game {
  constructor(canvas, onState, saveSlot = 0) {
    this.canvas = canvas;
    this.renderer3d = new Renderer3D(canvas);
    this.onState = onState;
    this.saveSlot = saveSlot;
    this.saveKey = 'whispering_pines_save_' + saveSlot;
    this.atm = new Atmosphere();
    this.audio = new AudioEngine();
    this.keys = {};
    this.touch = { dx: 0, dy: 0, active: false };
    this.running = false;
    this.lastTime = 0;
    this.actionPrompt = null;
    this.dialogue = null;
    this.buildMode = null; // buildable id when placing
    this.fishingState = null; // {phase:'cast'|'wait'|'bite', timer}
    this.toast = null;
    this.ghosts = []; // {x,y,zone,alpha,life}
    this.footprints = []; // mystery footprint trails {x,y,zone,age}
    this.mysteryHotspot = null; // {x,y,zone} where Fritz hisses
    this.playerTrail = []; // recent positions for Fritz to follow
    this.npcStates = {};
    this.enemies = [];
    this.doorCooldown = 0;
    this.fritzPetCd = 0;
    this.actionState = null;
    this.confrontation = null;
    this.particles = [];
    this.treeChops = {};
    this.init();
  }

  init() {
    this.resize();
    this._onResize = () => this.resize();
    this._onKeyDown = (e) => this.handleKey(e, true);
    this._onKeyUp = (e) => this.handleKey(e, false);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  resize() {
    this.vw = this.canvas.clientWidth;
    this.vh = this.canvas.clientHeight;
    this.renderer3d.resize(this.vw, this.vh);
  }

  // Shared old-save migrations for load() and _loadBackup()
  _migrateSave() {
    if (this.state.player.hp === undefined) {
      this.state.player.hp = this.getPlayerMaxHp();
      this.state.player.maxHp = this.state.player.hp;
    }
    if (this.state.xp === undefined) this.state.xp = 0;
    if (!this.state.xpToNext) this.state.xpToNext = (this.state.level || 1) * 50;
    if (this.state.selectedTool === undefined) this.state.selectedTool = 0;
    // restore the lantern from the save so world glow, HUD and toggle agree
    this.lanternOn = this.state.lanternOn = !!this.state.lanternOn;
    if (!this.state.storyCycle) this.state.storyCycle = 1;
    if (!this.state.villainsUnmasked) this.state.villainsUnmasked = [];
    if (!this.state.truthFragments) this.state.truthFragments = [];
    if (!this.state.chestStorage) this.state.chestStorage = {};
    if (this.state.petSwapOffered === undefined) this.state.petSwapOffered = false;
    if (!this.state.romance) this.state.romance = {};
    if (!this.state.equippedWeapon) this.state.equippedWeapon = null;
    if (!this.state.equippedArmor) this.state.equippedArmor = null;
    if (!this.state.equippedHat) this.state.equippedHat = null;
    if (this.state.permHpBonus === undefined) this.state.permHpBonus = 0;
    if (this.state.tempAttackBonus === undefined) this.state.tempAttackBonus = 0;
    if (!this.state.inventory.waystone) this.state.inventory.waystone = 1;
    if (this.state.inventory.coins) {
      this.state.coins = (this.state.coins || 0) + this.state.inventory.coins;
      delete this.state.inventory.coins;
    }
    if (this.state.zones && this.state.zones.grotto) this.state.zones.grotto.overrides = {};
    const cw = this.state.zones && this.state.zones.cabin_woods;
    if (cw && cw.objects) {
      const evidenceSpots = { '4,6': 'evidence_sailcloth', '31,19': 'evidence_conch', '25,21': 'evidence_boot', '16,28': 'evidence_fogoil' };
      for (const key in evidenceSpots) {
        if (cw.objects[key] && !(this.state.flags && this.state.flags[evidenceSpots[key]])) delete cw.objects[key];
      }
    }
  }

  load() {
    const raw = localStorage.getItem(this.saveKey);
    if (!raw) return this._loadBackup();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      // Main save is corrupt JSON — try the backup before giving up
      return this._loadBackup();
    }
    this.state = data;
    this._migrateSave();
    this.enemies = [];
    // Zone loading is OUTSIDE the parse try/catch — a zone error must never
    // cause a "save not found" → newGame() → save wipe. Fall back to shore.
    try {
      this.loadZone(this.state.zone || 'shore');
      this.ensureSafeSpawn();
    } catch (zoneErr) {
      console.error('Whispering Pines: zone load failed, recovering to shore:', zoneErr);
      this.state.zone = 'shore';
      this.loadZone('shore');
      this.ensureSafeSpawn();
    }
    return true;
  }

  _loadBackup() {
    const backupRaw = localStorage.getItem(this.saveKey + '_backup');
    if (!backupRaw) return false;
    let data;
    try {
      data = JSON.parse(backupRaw);
    } catch (e) {
      return false;
    }
    this.state = data;
    this._migrateSave();
    this.enemies = [];
    try {
      this.loadZone(this.state.zone || 'shore');
      this.ensureSafeSpawn();
    } catch (zoneErr) {
      this.state.zone = 'shore';
      this.loadZone('shore');
      this.ensureSafeSpawn();
    }
    return true;
  }

  newGame(character) {
    this.state = {
      zone: 'shore',
      character: character || { name: 'Survivor', gender: 'boy', pet: 'fritz', skin: '#e0b890', hair: '#5a3a1a', shirt: '#4a6a8a', pants: '#2e2e3e' },
      player: { x: 8, y: 28, dir: 0, moving: false, anim: 0, energy: 100, hasHoe: true, hasCan: true, hasRod: true, hp: 60, maxHp: 60 },
      fritz: { x: 7, y: 28, dir: 3, state: 'follow', anim: 0 },
      time: TIME_START,
      day: 1,
      season: 'autumn',
      weather: 'clear',
      weatherTimer: 600,
      inventory: { wood: 5, fiber: 3, seed_pumpkin: 2, seed_corn: 2, seed_potato: 2, seed_tomato: 2, pumpkin: 0, stone: 2, waystone: 1 },
      zones: {},
      journal: [],
      mysteries: [],
      flags: {},
      friendship: {},
      level: 1, strength: 1, coins: 20, xp: 0, xpToNext: 50,
      grottoFloor: 0, grottoChests: {},
      storyCycle: 1,
      villainsUnmasked: [],
      truthFragments: [],
      introSeen: false,
      selectedTool: 0,
      lanternOn: false,
      chestStorage: {},
      romance: {},
      petSwapOffered: false,
      equippedWeapon: null,
      equippedArmor: null,
      equippedHat: null,
      permHpBonus: 0,
      tempAttackBonus: 0,
      nikkiCompanion: null,
    };
    this.loadZone('shore');
    this.ensureSafeSpawn();
  }

  loadZone(zoneId) {
    if (zoneId === 'grotto') { this.loadGrotto(); return; }
    if (zoneId === 'shaman_dungeon') { this.loadShamanDungeon(); return; }
    if (!this.state.zones[zoneId]) this.state.zones[zoneId] = { overrides: {}, objects: {} };
    const zdata = this.state.zones[zoneId];
    const daySeed = this.state.day;
    const restored = !!(this.state.flags && this.state.flags.saloonRestored);
    const gen = generateZone(zoneId, daySeed, undefined, { restored, cycle: this.state.storyCycle || 1 });
    // merge overrides
    const tiles = gen.tiles.map(row => row.slice());
    const crops = {};
    for (const key in zdata.overrides) {
      const [x, y] = key.split(',').map(Number);
      const ov = zdata.overrides[key];
      if (y < tiles.length && x < tiles[0].length) tiles[y][x] = ov.tile;
      if (ov.crop !== undefined) crops[key] = ov;
    }
    // Ensure doors are never overwritten by stale overrides from older saves
    for (const door of gen.doors) {
      const dkey = `${door.x},${door.y}`;
      if (zdata.overrides[dkey]) {
        delete zdata.overrides[dkey];
        delete crops[dkey];
      }
      if (door.y < tiles.length && door.x < tiles[0].length) {
        tiles[door.y][door.x] = T.DOOR;
      }
    }
    // objects collected
    const objects = gen.objects.map((o, i) => ({ ...o, collected: !!zdata.objects[`${o.x},${o.y}`] }));
    this.zone = {
      id: zoneId, tiles, w: gen.w, h: gen.h, doors: gen.doors,
      objects, npcs: gen.npcs.slice(), def: ZONE_DEFS[zoneId],
    };
    // Nikki's kidnapping — the stolen partner vanishes from town until they've
    // been rescued AND walked out of the basement with you
    if (zoneId === 'town' && this.state.flags && this.state.flags.nikkiKidnapped &&
        !(this.state.flags.nikkiRescued && this.state.flags.partnerWalkedOut)) {
      this.zone.npcs = this.zone.npcs.filter(n => n.id !== this.state.flags.nikkiKidnapped);
    }
    // Nikki's basement — Nikki guards the coffin; the stolen partner lies inside.
    // After the rescue, the freed partner waits by the coffin until spoken to.
    if (zoneId === 'nikki_basement') {
      this.zone.npcs = (this.state.flags && this.state.flags.partnerWalkedOut) ? [] : getNikkiBasementNpcs(this.state);
    }
    // Nikki the stalker appears in outdoor zones (cycle 2+)
    // If she's been romanced, she follows the player instead of spawning as a placed NPC
    if (shouldSpawnNikki(this.state, zoneId) && !(this.state.flags && this.state.flags.nikkiRomanced)) {
      const pos = getNikkiPlacement(zoneId);
      if (pos && !this.zone.npcs.find(n => n.id === 'nikki')) {
        this.zone.npcs.push({ ...NIKKI_NPC, x: pos.x, y: pos.y, romanceable: true });
      }
    }
    // Smoke & Stack — mysterious strangers in town
    if (zoneId === 'town' && shouldSpawnStrangers(this.state)) {
      for (const sn of STRANGER_NPCS) {
        if (!this.zone.npcs.find(n => n.id === sn.id)) {
          this.zone.npcs.push({ ...sn });
        }
      }
    }
    this.tiles = tiles;
    this.crops = crops;
    if (zoneId === 'town' && this.state.flags && this.state.flags.saloonRestored) {
      this.applySaloonExteriorUpgrade();
    }
    this.renderer3d.buildWorld(this.tiles, this.crops, this.zone, this.state.season);
  }

  ensureSafeSpawn() {
    if (!this.state || !this.tiles) return;
    const p = this.state.player;
    let tx = Math.floor(p.x), ty = Math.floor(p.y);
    const w = this.zone.w, h = this.zone.h;
    // clamp into bounds
    tx = Math.max(1, Math.min(w - 2, tx));
    ty = Math.max(1, Math.min(h - 2, ty));
    // if current tile is walkable, just snap
    if (!this.isSolid(tx, ty)) {
      p.x = tx + 0.5; p.y = ty + 0.5;
      return;
    }
    // spiral outward to find nearest walkable tile
    for (let radius = 1; radius < Math.max(w, h); radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          const cx = tx + dx, cy = ty + dy;
          if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
          if (!this.isSolid(cx, cy)) {
            p.x = cx + 0.5; p.y = cy + 0.5;
            return;
          }
        }
      }
    }
    // fallback: force-clear the tile
    if (this.zone.id === 'grotto') this.tiles[ty][tx] = T.FLOOR;
    else this.setTileOverride(tx, ty, T.PATH);
    p.x = tx + 0.5; p.y = ty + 0.5;
  }

  save() {
    if (this.state) {
      // Preserve the previous save as a backup before overwriting — protects
      // against save corruption or accidental newGame() overwrites.
      const existing = localStorage.getItem(this.saveKey);
      if (existing) localStorage.setItem(this.saveKey + '_backup', existing);
      localStorage.setItem(this.saveKey, JSON.stringify(this.state));
      saveMeta(this.saveSlot, this.state);
    }
  }

  loadShamanDungeon() {
    if (!this.state.zones['shaman_dungeon']) this.state.zones['shaman_dungeon'] = { overrides: {}, objects: {} };
    const gen = generateZone('shaman_dungeon', this.state.day, undefined, { cycle: this.state.storyCycle });
    const tiles = gen.tiles;
    this.zone = { id: 'shaman_dungeon', tiles, w: gen.w, h: gen.h, doors: gen.doors, objects: gen.objects, npcs: [], def: ZONE_DEFS['shaman_dungeon'] };
    this.tiles = tiles;
    this.crops = {};
    // spawn the undead shaman boss (unless already defeated)
    if (this.state.flags && this.state.flags.shamanDefeated) {
      this.boss = null;
    } else {
      this.boss = spawnBoss('undead_shaman', tiles, gen.w, gen.h, 12, 9);
      this.enemies = [this.boss];
    }
    this.floorCleared = false;
    this.markEnemiesEncountered();
    this.renderer3d.buildWorld(this.tiles, this.crops, this.zone, this.state.season);
  }

  loadGrotto() {
    const floor = this.state.grottoFloor || 1;
    if (!this.state.zones['grotto']) this.state.zones['grotto'] = { overrides: {}, objects: {} };
    const gen = generateZone('grotto', this.state.day, floor);
    const tiles = gen.tiles;
    // remove already-collected prize chests — ONLY the prize chest (placed
    // off-center, see maps.js), NOT the lighthouse key chest
    if (this.state.grottoChests && this.state.grottoChests[floor]) {
      const cx = Math.floor(gen.w / 2) - 4;
      const cy = Math.floor(gen.h / 2);
      if (tiles[cy] && tiles[cy][cx] === T.GROTTO_CHEST) tiles[cy][cx] = T.FLOOR;
    }
    // remove already-collected lighthouse key chest (now at middle-right)
    if (this.state.flags && this.state.flags.lighthouseKey && floor >= GROTTO_BOTTOM) {
      const kx = gen.w - 4;
      const ky = Math.floor(gen.h / 2);
      if (tiles[ky] && (tiles[ky][kx] === T.LIGHTHOUSE_KEY_CHEST || tiles[ky][kx] === T.GROTTO_CHEST)) tiles[ky][kx] = T.FLOOR;
    }
    this.zone = { id: 'grotto', tiles, w: gen.w, h: gen.h, doors: [], objects: [], npcs: [], def: ZONE_DEFS['grotto'], grottoFloor: floor };
    this.tiles = tiles;
    this.crops = {};
    this._spawnGrottoEnemies(this.state.player.x, this.state.player.y);
    this.floorCleared = false;
    this.renderer3d.buildWorld(this.tiles, this.crops, this.zone, this.state.season);
  }

  // ── Grotto enemy spawn — always re-derive this.boss so the HP bar and
  // phase system track the live object (floor 50/100 spawn a single boss) ──
  _spawnGrottoEnemies(px, py) {
    this.enemies = spawnEnemies(this.state.grottoFloor, this.tiles, this.zone.w, this.zone.h, px, py);
    this.boss = (this.enemies.length === 1 && this.enemies[0].isBoss) ? this.enemies[0] : null;
    this.markEnemiesEncountered();
  }

  // ── Bestiary tracking ──
  markEnemiesEncountered() {
    if (!this.state.flags) this.state.flags = {};
    if (!this.state.flags.bestiary) this.state.flags.bestiary = {};
    for (const e of (this.enemies || [])) {
      if (!this.state.flags.bestiary[e.typeId]) {
        this.state.flags.bestiary[e.typeId] = { encountered: true, defeated: 0 };
      } else {
        this.state.flags.bestiary[e.typeId].encountered = true;
      }
    }
    if (this.boss && this.boss.typeId) {
      const bid = this.boss.typeId;
      if (!this.state.flags.bestiary[bid]) {
        this.state.flags.bestiary[bid] = { encountered: true, defeated: 0 };
      } else {
        this.state.flags.bestiary[bid].encountered = true;
      }
    }
  }

  markEnemyDefeated(typeId) {
    if (!this.state.flags) this.state.flags = {};
    if (!this.state.flags.bestiary) this.state.flags.bestiary = {};
    if (!this.state.flags.bestiary[typeId]) {
      this.state.flags.bestiary[typeId] = { encountered: true, defeated: 1 };
    } else {
      this.state.flags.bestiary[typeId].defeated = (this.state.flags.bestiary[typeId].defeated || 0) + 1;
    }
  }

  descendGrotto() {
    if (this.enemies && this.enemies.length > 0) {
      this.showToast('The floor is not yet cleared — defeat all enemies before descending.', 4000);
      return;
    }
    this.state.grottoFloor = (this.state.grottoFloor || 0) + 1;
    if (!this.state.flags) this.state.flags = {};
    this.state.flags.maxGrottoFloor = Math.max(this.state.flags.maxGrottoFloor || 0, this.state.grottoFloor);
    this.loadGrotto();
    this.state.player.x = 12; this.state.player.y = 15;
    // Place Fritz right next to the player on the new floor
    this.state.fritz.x = 11.6; this.state.fritz.y = 15;
    this.state.fritz.state = 'follow';
    this.state.fritz.dir = this.state.player.dir;
    this.playerTrail = [];
    this._spawnGrottoEnemies(12, 15);
    this.showToast(`Grotto Floor ${this.state.grottoFloor}`, 3000);
    this.pushState();
    this.save();
  }

  ascendGrotto() {
    if ((this.state.grottoFloor || 0) <= 1) {
      // exit to forest
      this.state.grottoFloor = 0;
      this.transitionZone('haunted_forest', 23, 36);
      return;
    }
    this.state.grottoFloor -= 1;
    this.loadGrotto();
    this.state.player.x = 12; this.state.player.y = 2;
    // Place Fritz right next to the player on the new floor
    this.state.fritz.x = 11.6; this.state.fritz.y = 2;
    this.state.fritz.state = 'follow';
    this.state.fritz.dir = this.state.player.dir;
    this.playerTrail = [];
    this._spawnGrottoEnemies(12, 2);
    this.showToast(`Grotto Floor ${this.state.grottoFloor}`, 3000);
    this.pushState();
    this.save();
  }

  // ── Grotto fast travel — jump to any previously reached floor ──
  grottoFastTravel(targetFloor) {
    if (targetFloor < 1) targetFloor = 1;
    const maxFloor = (this.state.flags && this.state.flags.maxGrottoFloor) || this.state.grottoFloor || 1;
    if (targetFloor > maxFloor) { this.showToast('You haven\'t reached that floor yet.'); return; }
    this.state.grottoFloor = targetFloor;
    this.loadGrotto();
    this.state.player.x = 12; this.state.player.y = 15;
    // Place Fritz right next to the player after fast travel
    this.state.fritz.x = 11.6; this.state.fritz.y = 15;
    this.state.fritz.state = 'follow';
    this.state.fritz.dir = this.state.player.dir;
    this.playerTrail = [];
    this._spawnGrottoEnemies(12, 15);
    this.showToast(`Warped to Grotto Floor ${this.state.grottoFloor}`, 3000);
    this.pushState();
    this.save();
  }

  // ── Surface portal — return to the haunted forest from deep grotto ──
  exitToSurface() {
    this.state.grottoFloor = 0;
    this.enemies = [];
    this.boss = null;
    this.transitionZone('haunted_forest', 23, 36);
  }

  collectGrottoPrize() {
    const floor = this.state.grottoFloor;
    if (this.state.grottoChests[floor]) { this.showToast('Already claimed.'); return; }
    this.state.grottoChests[floor] = true;
    const prize = getGrottoPrize(floor);
    this.state.strength += prize.strength;
    this.state.level += 1;
    this.state.player.maxHp = this.getPlayerMaxHp();
    this.state.player.hp = this.state.player.maxHp;
    this.state.journal.push({ day: this.state.day, text: prize.text, type: 'prize' });
    this.audio.playSfx('bell');
    this.showToast(prize.text, 5000);
    // remove the prize chest at its actual position (off-center on boss floors)
    const pcx = Math.floor(this.zone.w / 2) - 4;
    const pcy = Math.floor(this.zone.h / 2);
    if (this.tiles[pcy] && this.tiles[pcy][pcx] === T.GROTTO_CHEST) {
      this.tiles[pcy][pcx] = T.FLOOR;
      this.renderer3d.updateTile(pcx, pcy, T.FLOOR);
    }
    this.pushState();
    this.save();
  }

  sellItem(itemId) {
    if (!this.hasItem(itemId, 1)) { this.showToast('Nothing to sell'); return; }
    let price = SELL_PRICES[itemId] || getFishSellPrice(itemId) || 1;
    // Tackle box passive: +10% sell value on fish
    if (this.hasItem('tackle_box', 1) && getFishInfo(itemId)) price = Math.ceil(price * 1.1);
    // Vampire Blood: double fish sell value
    if (this.state.flags && this.state.flags.vampireBloodTaken && getFishInfo(itemId)) price *= 2;
    this.removeItem(itemId, 1);
    this.state.coins = (this.state.coins || 0) + price;
    this.audio.playSfx('pickup');
    const name = getFishInfo(itemId)?.name || ITEMS[itemId]?.name || itemId;
    this.showToast(`Sold ${name} for ${price} coins`);
    this.pushState();
  }

  buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId) || FISHING_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if ((this.state.coins || 0) < item.price) { this.showToast('Not enough coins'); return; }
    this.state.coins -= item.price;
    // Weapons and armor are equipped on purchase
    if (item.category === 'weapons') {
      this.state.equippedWeapon = itemId;
      this.audio.playSfx('pickup');
      this.showToast(`Equipped ${item.name}! ${item.desc}`, 4000);
    } else if (item.category === 'armor') {
      this.state.equippedArmor = itemId;
      this.state.player.maxHp = this.getPlayerMaxHp();
      this.state.player.hp = this.state.player.maxHp;
      this.audio.playSfx('pickup');
      this.showToast(`Equipped ${item.name}! ${item.desc}`, 4000);
    } else {
      this.addItem(itemId, 1);
      this.audio.playSfx('pickup');
      this.showToast(`Bought ${item.name} for ${item.price} coins`);
    }
    this.pushState();
  }

  buyDrink(itemId) {
    const item = SALOON_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    if ((this.state.coins || 0) < item.price) { this.showToast('Not enough coins'); return; }
    this.state.coins -= item.price;
    switch (item.effect) {
      case 'energy':
        this.state.player.energy = Math.min(100, (this.state.player.energy || 0) + 50);
        break;
      case 'heal':
        this.state.player.hp = this.getPlayerMaxHp();
        break;
      case 'strength':
        this.state.strength = (this.state.strength || 1) + 1;
        this.state.player.maxHp = this.getPlayerMaxHp();
        this.state.player.hp = this.state.player.maxHp;
        break;
      case 'maxhp':
        this.state.permHpBonus = (this.state.permHpBonus || 0) + 10;
        this.state.player.maxHp = this.getPlayerMaxHp();
        this.state.player.hp = this.state.player.maxHp;
        break;
      case 'tempattack':
        this.state.tempAttackBonus = (this.state.tempAttackBonus || 0) + 5;
        break;
      case 'item_bait':
        this.addItem('gus_bait', 1);
        break;
      case 'item_crystal':
        this.addItem('crystal', 2);
        break;
      case 'item_food':
        this.addItem('mushroom', 2);
        this.addItem('berry', 2);
        this.addItem('herb', 1);
        break;
      case 'fogwalker':
        this.state.player.energy = 100;
        this.state.tempAttackBonus = (this.state.tempAttackBonus || 0) + 5;
        break;
    }
    this.audio.playSfx('pickup');
    this.showToast(`${item.name}! ${item.desc}!`, 3000);
    this.pushState();
    this.save();
  }

  buyStrangerItem(itemId) {
    const items = getStrangerShopItems(this.state);
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    if (item.price > 0 && (this.state.coins || 0) < item.price) { this.showToast('Not enough coins'); return; }
    this.state.coins -= item.price;

    if (itemId === 'vampire_blood') {
      if (!this.state.flags) this.state.flags = {};
      this.state.flags.vampireBloodTaken = true;
      this.state.player.maxHp = this.getPlayerMaxHp();
      this.state.player.hp = this.state.player.maxHp;
      this.state.journal.push({ day: this.state.day, text: 'You drank the Vampire Blood. Power floods your veins — every stat surges by 25%. Fish you catch will be rarer and worth twice as much. Smoke watches you with hunger in his eyes.', type: 'mystery' });
      this.showToast('🧛 You drank the Vampire Blood! All stats +25%!', 6000);
      this.audio.playSfx('bell');
    } else if (itemId === 'vampiric_sword') {
      if (!this.state.flags) this.state.flags = {};
      this.state.flags.boughtVampiricSword = true;
      this.state.equippedWeapon = 'vampiric_sword';
      this.state.journal.push({ day: this.state.day, text: 'You bought the Vampiric Sword. Its blade drinks light. Stack said only one thing: "Aim for the heart."', type: 'mystery' });
      this.showToast('🗡️ Equipped the Vampiric Sword!', 5000);
      this.audio.playSfx('pickup');
    } else if (itemId === 'tommy_gun') {
      if (!this.state.flags) this.state.flags = {};
      this.state.flags.boughtTommyGun = true;
      this.state.equippedWeapon = 'tommy_gun';
      this.showToast('🔫 Equipped the Tommy Gun! +120 Attack', 5000);
      this.audio.playSfx('pickup');
    } else if (itemId === 'handgun_1911') {
      if (!this.state.flags) this.state.flags = {};
      this.state.flags.boughtHandgun = true;
      this.state.equippedWeapon = 'handgun_1911';
      this.showToast('🔫 Equipped the 1911 Handgun! +60 Attack', 5000);
      this.audio.playSfx('pickup');
    }
    this.pushState();
    this.save();
  }

  craftItem(recipeId) {
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    for (const item in recipe.cost) {
      if (!this.hasItem(item, recipe.cost[item])) { this.showToast('Not enough materials!'); return; }
    }
    for (const item in recipe.cost) this.removeItem(item, recipe.cost[item]);
    if (recipe.category === 'weapons') {
      this.state.equippedWeapon = recipe.result;
      this.showToast(`Crafted & equipped ${recipe.name}! ${recipe.desc}`, 4000);
    } else if (recipe.category === 'armor') {
      this.state.equippedArmor = recipe.result;
      this.state.player.maxHp = this.getPlayerMaxHp();
      this.state.player.hp = this.state.player.maxHp;
      this.showToast(`Crafted & equipped ${recipe.name}! ${recipe.desc}`, 4000);
    } else {
      this.addItem(recipe.result, 1);
      this.showToast(`Crafted ${recipe.name}!`, 3000);
    }
    this.audio.playSfx('pickup');
    this.pushState();
    this.save();
  }

  attendPatriciaParty() {
    if (!this.state.flags) this.state.flags = {};
    this.state.flags.patriciaPartyToday = false;
    this.state.flags.patriciaPartyAttended = true;
    this.addItem('deer_antler_crown', 1);
    this.state.equippedHat = 'deer_antler_crown';
    this.state.journal.push({ day: this.state.day, text: 'You attended Patricia\'s party. The whole town was there — Gus poured drinks, the Mayor made a toast, even Hattie cracked a smile. Patricia presented you with a Deer Antler Crown — a Pinebrook tradition for those who earn the town\'s trust. "Welcome to Pinebrook," she said. "For real, this time."', type: 'mystery' });
    this.audio.playSfx('bell');
    this.showToast('🎉 You attended Patricia\'s Party! Received the Deer Antler Crown! 🦌', 6000);
    this.pushState();
    this.save();
  }

  toggleHat() {
    if (!this.hasItem('deer_antler_crown', 1)) return;
    this.state.equippedHat = this.state.equippedHat === 'deer_antler_crown' ? null : 'deer_antler_crown';
    this.audio.playSfx('pickup');
    this.pushState();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.audio.start();
    this.loop();
  }

  stop() {
    this.running = false;
    this.audio.stop();
    // Remove window listeners so a stopped (stale) Game instance can't
    // intercept keyboard input and push its stale state to the HUD.
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
    if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp);
    // Free the renderer's scene and GL context — stop() is terminal (GamePage
    // constructs a fresh Game on every mount)
    if (this.renderer3d) this.renderer3d.dispose();
  }

  loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    // A thrown frame must never kill the rAF chain — that hard-freezes the
    // game with no recovery except a reload. Log it and keep running.
    try {
      this.update(dt);
      this.render();
    } catch (err) {
      if (String(err) !== this._lastLoopError) {
        this._lastLoopError = String(err);
        console.error('Whispering Pines: frame error (game continues):', err);
      }
    }
    requestAnimationFrame(this.loop);
  };

  handleKey(e, down) {
    if (!this.running) return;
    const k = e.key.toLowerCase();
    // Always release keys so nothing sticks
    const tag = e.target && e.target.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable);
    if (down) {
      if (typing) return;
      this.keys[k] = true;
      if (k === 'e') { e.preventDefault(); this.interact(false, false); }
      if (k === 't') { e.preventDefault(); this.talkToCompanion(); }
      if (k === 'p') { e.preventDefault(); this.trySecretButton(); }
      if (k === ' ') { e.preventDefault(); this.interact(false, true); }
      if (k === 'b') { e.preventDefault(); this.onState({ toggleBuild: true }); }
      if (k === 'j') { e.preventDefault(); this.onState({ toggleJournal: true }); }
      if (k === 'm') { e.preventDefault(); this.onState({ toggleMap: true }); }
      if (k === 'escape') { this.buildMode = null; this.onState({ closeMenus: true }); }
      if (k >= '1' && k <= '9') { this.selectTool(parseInt(k) - 1); }
      if (k === '0') { this.selectTool(9); }
    } else {
      this.keys[k] = false;
    }
  }

  // touch controls from React
  setTouch(dx, dy, active) {
    this.touch.dx = dx; this.touch.dy = dy; this.touch.active = active;
  }

  getTool() {
    return TOOLS[this.state.selectedTool || 0];
  }

  selectTool(index) {
    if (index >= 0 && index < TOOLS.length) {
      this.state.selectedTool = index;
      // Lantern stays on when selected — turns off when switching away
      if (TOOLS[index].id !== 'lantern') this.lanternOn = this.state.lanternOn = false;
      else this.lanternOn = this.state.lanternOn = true;
      this.pushState();
    }
  }

  toggleLantern() {
    this.lanternOn = this.state.lanternOn = !this.lanternOn;
    this.audio.playSfx('pickup');
    this.showToast(this.lanternOn ? 'Lantern lit — the dark recedes.' : 'Lantern dimmed.', 2000);
    this.pushState();
  }

  // ── Secret button — only in the exact top-left corner of Grotto Floor 1 ──
  trySecretButton() {
    if (this.state.zone !== 'grotto' || (this.state.grottoFloor || 0) !== 1) return;
    const px = Math.floor(this.state.player.x);
    const py = Math.floor(this.state.player.y);
    if (px <= 1 && py <= 1) {
      this.onState({ openGodPrompt: true });
      this.audio.playSfx('bell');
    }
  }

  // ── Waystone — permanent item that teleports the player home to their cabin ──
  useWaystone() {
    if (this.state.zone === 'home') { this.showToast('You are already home.', 3000); return; }
    if (this.doorCooldown > 0) return;
    // no escaping mid-combat in the grotto — the stone needs calm air
    if ((this.zone.id === 'grotto' || this.zone.id === 'shaman_dungeon') && this.enemies && this.enemies.length > 0) {
      this.showToast('The Waystone stays cold. It will not sing with enemies near.', 3000);
      return;
    }
    this.showToast('The Waystone hums... the cabin pulls you home.', 3000);
    this.audio.playSfx('bell');
    this.transitionZone('home', 8, 11);
  }

  toggleGodMode() {
    if (!this.state.flags || !this.state.flags.godModeUnlocked) return;
    this.state.flags.godModeActive = !this.state.flags.godModeActive;
    this.audio.playSfx('bell');
    this.showToast(this.state.flags.godModeActive ? '✦ GOD MODE ACTIVATED ✦' : 'God mode deactivated.', 3000);
    this.pushState();
    this.save();
  }

  submitGodCode(code) {
    if (code.toUpperCase().trim() === 'GOD') {
      if (!this.state.flags) this.state.flags = {};
      this.state.flags.godModeUnlocked = true;
      this.state.flags.godModeActive = true;
      this.state.journal.push({ day: this.state.day, text: 'A whisper from the void: "GOD mode unlocked. You are invincible."', type: 'mystery' });
      this.audio.playSfx('bell');
      this.showToast('✦ GOD MODE UNLOCKED! ✦', 5000);
      this.pushState();
      this.save();
    } else if (code.toUpperCase().trim() === 'R50') {
      if (!this.state.flags) this.state.flags = {};
      this.state.flags.lighthouseKey = false;
      this.state.inventory.lighthouse_key = 0;
      if (this.state.grottoChests) delete this.state.grottoChests[50];
      this.boss = null;
      this.enemies = [];
      if (this.state.zone === 'grotto' && this.state.grottoFloor === 50) {
        this.loadGrotto();
      }
      this.showToast('Floor 50 reset — the Abyssal Warden and chests have returned.', 5000);
      this.audio.playSfx('bell');
      this.pushState();
      this.save();
    } else {
      this.showToast('Nothing happens. The void is silent.', 3000);
      this.audio.playSfx('hiss');
      this.pushState();
    }
  }

  triggerAction(toolId, impactCallback) {
    this.actionState = { tool: toolId, timer: 0.5, maxTimer: 0.5, dir: this.state.player.dir, impactCallback: impactCallback || null, impactTriggered: false };
  }

  getTile(x, y) {
    if (x < 0 || y < 0 || y >= this.zone.h || x >= this.zone.w) return T.WALL;
    return this.tiles[y][x];
  }

  // Map the tile the player is standing on to a footstep sound type
  getStepSound(tile) {
    switch (tile) {
      case T.SAND: case T.DOCK: case T.PEBBLE: return 'step_sand';
      case T.FLOOR: case T.RUG: case T.STOVE: case T.TABLE: case T.CHAIR:
      case T.CHEST: case T.BED: case T.BOOKSHELF: case T.WORKBENCH: case T.BENCH:
      case T.CRATE: case T.BARREL: case T.WINDOW: case T.DOOR: case T.WALL:
      case T.PAINTING: case T.POSTER: case T.PICTURE_FRAME: case T.WALL_CLOCK:
      case T.MIRROR: case T.TRAPDOOR: case T.FIREPLACE: case T.ANVIL:
      case T.FENCE_GATE: case T.CHICKEN_COOP: case T.FEED_TROUGH: case T.WINDMILL: case T.FLOWER_BOX:
        return 'step_wood';
      case T.STONE: case T.ROCK: case T.STONE_CIRCLE: case T.CRYSTAL:
      case T.STATUE: case T.TENTACLE_STATUE: case T.WELL: case T.GRAVE:
      case T.GRAVESTONE: case T.GRAVE_CROSS: case T.RUIN: case T.CAVE:
      case T.SKULL_TOTEM: case T.BONE_PILE: case T.GROTTO_CHEST: case T.WITCH_TOME:
      case T.STAIRS_DOWN: case T.STAIRS_UP: case T.DARK_DIRT: case T.STONE_WALL:
        return 'step_stone';
      default: return 'step_grass';
    }
  }

  isSolid(x, y) {
    const t = this.getTile(x, y);
    const p = TILE_PROPS[t];
    if (!p) return false;
    if (this.state.player.swimming && p.water) return false;
    if (!this.state.player.swimming && p.water) return true; // water blocks land movement
    return p.solid;
  }

  canMoveTo(x, y, dx = 0, dy = 0) {
    const r = 0.35;
    if (this.isSolid(Math.floor(x), Math.floor(y))) return false;
    if (dx !== 0 && this.isSolid(Math.floor(x + dx * r), Math.floor(y))) return false;
    if (dy !== 0 && this.isSolid(Math.floor(x), Math.floor(y + dy * r))) return false;
    // diagonal corner check — prevents clipping into rock corners
    if (dx !== 0 && dy !== 0 && this.isSolid(Math.floor(x + dx * r), Math.floor(y + dy * r))) return false;
    return true;
  }

  update(dt) {
    const s = this.state;
    // time progression
    s.time += (dt / DAY_LENGTH) * 1440;
    if (s.time >= 1440) {
      this.endDay();
    }

    // weather — season affects probabilities and enables special events
    s.weatherTimer -= dt;
    if (s.weatherTimer <= 0) {
      const newWeather = pickSeasonalWeather(Math.random, this.zone.def.interior, s.season);
      if (newWeather !== s.weather) {
        const wdef = WEATHER_TYPES[newWeather];
        if (wdef && wdef.special) {
          this.showToast(`${wdef.label} settles over the island...`, 5000);
        }
      }
      s.weather = newWeather;
      s.weatherTimer = 400 + Math.random() * 600;
    }
    this.atm.tickWeather(dt, s.weather);
    const wdef = WEATHER_TYPES[s.weather] || WEATHER_TYPES.clear;
    this.audio.setRain(wdef.rain && !this.zone.def.interior);
    this.audio.setMood(this.atm.isNight(s.time) ? 'unease' : wdef.mood);

    // player movement
    const p = s.player;
    let dx = 0, dy = 0;
    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;
    if (this.touch.active) { dx += this.touch.dx; dy += this.touch.dy; }
    const len = Math.hypot(dx, dy);
    if (len > 0 && !this.fishingState) {
      dx /= len; dy /= len;
      const speed = 3.2;
      const nx = p.x + dx * speed * dt;
      const ny = p.y + dy * speed * dt;
      if (this.canMoveTo(nx, p.y, dx, 0)) p.x = nx;
      if (this.canMoveTo(p.x, ny, 0, dy)) p.y = ny;
      // clamp to map bounds — never walk off the map
      p.x = Math.max(0.5, Math.min(this.zone.w - 0.5, p.x));
      p.y = Math.max(0.5, Math.min(this.zone.h - 0.5, p.y));
      p.moving = true;
      p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 2) : (dy > 0 ? 0 : 1);
      p.anim += dt * 8;
      // trail for Fritz
      this.playerTrail.push({ x: p.x, y: p.y });
      if (this.playerTrail.length > 30) this.playerTrail.shift();
      // surface-based footstep sounds — timed to stride
      this.stepTimer = (this.stepTimer || 0) + dt;
      if (this.stepTimer > 0.32) {
        this.stepTimer = 0;
        const tile = this.getTile(Math.floor(p.x), Math.floor(p.y));
        this.audio.playSfx(this.getStepSound(tile));
      }
    } else {
      p.moving = false;
      this.stepTimer = 0.16; // ready for a quick first step when moving again
    }

    // action animation timer — trigger impact at swing peak
    if (this.actionState) {
      this.actionState.timer -= dt;
      if (!this.actionState.impactTriggered && this.actionState.timer < this.actionState.maxTimer * 0.55) {
        this.actionState.impactTriggered = true;
        if (this.actionState.impactCallback) this.actionState.impactCallback();
      }
      if (this.actionState.timer <= 0) this.actionState = null;
    }

    // update particles
    for (const part of this.particles) {
      if (part.pickup) {
        if (part.delay > 0) {
          part.delay -= dt;
          part.x += part.vx * dt;
          part.y += part.vz * dt;
          part.vh -= 8 * dt;
          part.height += part.vh * dt;
          if (part.height < 0) { part.height = 0; part.vh *= -0.3; part.vx *= 0.5; part.vz *= 0.5; }
        } else {
          const p = this.state.player;
          const dx = p.x - part.x;
          const dy = p.y - part.y;
          const d = Math.hypot(dx, dy);
          if (d < 0.7) {
            part.collected = true;
            this.audio.playSfx('pickup');
          } else {
            const pull = 5 + (4 - Math.min(part.life, 4)) * 3;
            part.x += (dx / d) * pull * dt;
            part.y += (dy / d) * pull * dt;
            part.height = Math.min(part.height + 3 * dt, 1.0);
          }
          part.life -= dt;
        }
      } else {
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.vy += 4 * dt;
        part.life -= dt;
      }
    }
    this.particles = this.particles.filter(p => p.life > 0 && !p.collected);

    // fishing update
    this.updateFishing(dt);

    // Fritz AI
    this.updateFritz(dt);
    this.updateNpcs(dt); // townsfolk amble by day, retreat home at 22:00

    // Nikki companion — follows the player if romanced
    this.updateNikkiCompanion(dt);

    // ghosts (mystery figures)
    this.updateGhosts(dt);

    // grotto enemies
    this.updateEnemies(dt);

    // footprints fade
    for (const f of this.footprints) f.age += dt;
    this.footprints = this.footprints.filter(f => f.age < 60 && f.zone === this.state.zone);

    // door cooldown tick (used by interact)
    if (this.doorCooldown > 0) this.doorCooldown -= dt;
    // fritz pet cooldown
    if (this.fritzPetCd > 0) this.fritzPetCd -= dt;

    // action prompt
    this.updateActionPrompt();

    // atmosphere
    this.atm.update(dt * 1000);

    // push state to React (throttled)
    this.stateSyncTimer = (this.stateSyncTimer || 0) + dt;
    if (this.stateSyncTimer > 0.25) {
      this.stateSyncTimer = 0;
      this.pushState();
    }

    // ambient spirits — type depends on weather; wisps may appear in fog by day
    if (!this.zone.def.interior) {
      const isNight = this.atm.isNight(s.time);
      const foggy = s.weather === 'fog' || s.weather === 'heavy_fog';
      const stormy = s.weather === 'storm' || s.weather === 'rain';
      const baseChance = (isNight ? 0.0012 : 0) + (foggy ? 0.0008 : 0) + (stormy && isNight ? 0.0006 : 0);
      if (Math.random() < baseChance) this.spawnSpirit();
    }
    // villain encounters — trigger conditions evaluated by the encounter system
    if (!this.zone.def.interior) {
      const villain = evaluateEncounters(s, this);
      if (villain) this.encounterVillain(villain.id);
    }

    // Cycle 2: random deja vu memory flashes — the island's memory wipe is imperfect
    if ((s.storyCycle || 1) === 2 && !this.zone.def.interior && !this.fishingState && !this.dialogue) {
      this.dejaVuTimer = (this.dejaVuTimer || 0) + dt;
      if (this.dejaVuTimer > 15 && Math.random() < 0.004) {
        this.triggerDejaVu();
        this.dejaVuTimer = 0;
      }
    }
  }

  updateFritz(dt) {
    const p = this.state.player;
    const f = this.state.fritz;
    // pet state — sit and enjoy, then resume following
    if (f.state === 'pet') {
      f.petTimer -= dt;
      f.anim += dt * 3;
      if (f.petTimer <= 0) { f.state = 'follow'; }
      return;
    }
    // if sleeping at night inside, sleep
    if (this.zone.def.interior && this.atm.isNight(this.state.time) && !p.moving) {
      // sleep near bed
      f.state = 'sleep';
      return;
    }
    // hiss near mystery hotspot
    if (this.mysteryHotspot && this.mysteryHotspot.zone === this.state.zone) {
      const d = Math.hypot(f.x - this.mysteryHotspot.x, f.y - this.mysteryHotspot.y);
      if (d < 4) {
        f.state = 'hiss';
        f.dir = this.mysteryHotspot.x > f.x ? 3 : 2;
        f.anim += dt * 6;
        return;
      }
    }
    // sit beside player when fishing
    if (this.fishingState) {
      f.state = 'sit';
      f.x = p.x + (p.dir === 3 ? -0.8 : p.dir === 2 ? 0.8 : 0.6);
      f.y = p.y + 0.4;
      f.dir = p.dir;
      f.anim += dt * 4;
      return;
    }
    // follow player trail — always stay behind the player (opposite of facing direction)
    const pdirOffset = [
      { x: 0, y: -1 },   // dir 0 (down/facing south) → companion stays north
      { x: 0, y: 1 },    // dir 1 (up/facing north) → companion stays south
      { x: 1, y: 0 },    // dir 2 (left) → companion stays east
      { x: -1, y: 0 },   // dir 3 (right) → companion stays west
    ];
    const behind = pdirOffset[p.dir];
    const desiredX = p.x + behind.x * 1.2;
    const desiredY = p.y + behind.y * 1.2;
    const ddx = desiredX - f.x, ddy = desiredY - f.y;
    const d = Math.hypot(ddx, ddy);
    if (d > 0.3) {
      f.state = 'follow';
      // catch-up: move faster the further away Fritz is, so he never gets left behind
      const speed = 2.6 + Math.min(d, 6) * 1.2;
      f.x += (ddx / d) * speed * dt;
      f.y += (ddy / d) * speed * dt;
      f.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 3 : 2) : (ddy > 0 ? 0 : 1);
      f.anim += dt * 8;
    } else {
      f.state = p.moving ? 'follow' : 'sit';
      f.anim += dt * 2;
    }
  }

  updateFishing(dt) {
    if (!this.fishingState) return;
    const fs = this.fishingState;
    fs.timer -= dt;
    if (fs.phase === 'cast') {
      if (fs.timer <= 0) {
        fs.phase = 'wait';
        fs.timer = 2 + Math.random() * 5;
      }
    } else if (fs.phase === 'wait') {
      if (fs.timer <= 0) {
        // pre-roll the fish and launch the skill mini-game
        let fish = rollFish();
        // Vampire Blood: bump rarity up one tier
        if (this.state.flags && this.state.flags.vampireBloodTaken) {
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
          const idx = rarityOrder.indexOf(fish.rarity);
          if (idx < rarityOrder.length - 1) {
            const newRarity = rarityOrder[idx + 1];
            const pool = FISH_TABLE.filter(f => f.rarity === newRarity);
            if (pool.length > 0) fish = pool[Math.floor(Math.random() * pool.length)];
          }
        }
        const rarityInfo = getRarityInfo(fish.rarity);
        const zoneWidths = { common: 0.30, uncommon: 0.22, rare: 0.16, epic: 0.11, legendary: 0.07 };
        const speeds = { common: 0.8, uncommon: 1.0, rare: 1.3, epic: 1.6, legendary: 2.0 };
        fs.phase = 'minigame';
        fs.fish = fish;
        fs.rarityInfo = rarityInfo;
        let zoneW = zoneWidths[fish.rarity] || 0.25;
        // bait consumable — widens the catch zone, consumed on bite
        if (this.hasItem('gus_bait', 1)) {
          zoneW = Math.min(zoneW * 3.0, 0.95);
          this.removeItem('gus_bait', 1);
        } else if (this.hasItem('premium_bait', 1)) {
          zoneW = Math.min(zoneW * 2.0, 0.9);
          this.removeItem('premium_bait', 1);
        } else if (this.hasItem('bait', 1)) {
          zoneW = Math.min(zoneW * 1.5, 0.9);
          this.removeItem('bait', 1);
        }
        fs.zoneWidth = zoneW;
        fs.speed = speeds[fish.rarity] || 1.0;
        fs.zonePos = 0.1 + Math.random() * (0.9 - fs.zoneWidth - 0.1);
        this.audio.playSfx('splash');
        this.pushState();
      }
    }
  }

  startFishing() {
    if (!this.state.player.hasRod) { this.showToast('No fishing rod'); return; }
    this.fishingState = { phase: 'cast', timer: 1 };
    this.showToast('Cast line...');
  }

  completeCatch(success) {
    if (!this.fishingState || this.fishingState.phase !== 'minigame') return;
    const fs = this.fishingState;
    if (success) {
      this.addItem(fs.fish.id, 1);
      // permanent bestiary record — survives eating/selling the last one
      if (!this.state.flags) this.state.flags = {};
      if (!this.state.flags.fishCaught) this.state.flags.fishCaught = {};
      this.state.flags.fishCaught[fs.fish.id] = true;
      this.audio.playSfx('catch');
      const xpByRarity = { common: 2, uncommon: 4, rare: 8, epic: 15, legendary: 30 };
      this.gainXp(xpByRarity[fs.fish.rarity] || 2);
      if (fs.fish.rarity === 'legendary' || fs.fish.rarity === 'epic') {
        this.audio.playSfx('bell');
      }
      const rarityName = fs.fish.rarity.charAt(0).toUpperCase() + fs.fish.rarity.slice(1);
      this.catchResult = { fish: fs.fish, rarityInfo: fs.rarityInfo, until: performance.now() + 3500 };
      this.showToast(`Caught ${fs.fish.name}! (${rarityName})`, 4000);
    } else {
      this.audio.playSfx('hiss');
      this.showToast('The fish got away...');
    }
    this.fishingState = null;
    this.pushState();
  }

  petFritz() {
    const f = this.state.fritz;
    f.state = 'pet';
    f.petTimer = 1.5;
    // face the player
    f.dir = f.x > this.state.player.x ? 2 : 3;
    this.fritzPetCd = 2.0;
    this.audio.playSfx('pickup');
    // heart particles above Fritz
    this.spawnHeartParticles(f.x, f.y - 0.5);
    const petName = this.state.character?.pet === 'void' ? 'Void' : this.state.character?.pet === 'hanzo' ? 'Hanzo' : 'Fritz';
    const lines = petName === 'Hanzo' ? [
      'Hanzo snorts happily.',
      'Hanzo leans against your leg.',
      'Hanzo\'s stubby tail wags.',
      'Hanzo drools contentedly.',
    ] : [
      `${petName} purrs contentedly.`,
      `${petName} nuzzles your hand.`,
      `${petName}'s eyes close in bliss.`,
      `${petName} leans into your touch.`,
    ];
    this.showToast(lines[Math.floor(Math.random() * lines.length)], 2000);
    this.pushState();
  }


  talkToNPC(npc) {
    // Nikki in her basement — the confrontation that frees the kidnapped partner
    if (npc.id === 'nikki_basement') {
      this.dialogue = { name: 'Nikki', text: NIKKI_BASEMENT_LINE, nikkiBasement: true };
      this.audio.playSfx('hiss');
      this.pushState();
      return;
    }
    // Nikki the stalker outdoors (cycle 2+) — now romanceable via the standard romance branch below
    // The kidnapped partner — in the coffin, freed only after Nikki flees
    if (npc.kidnapped || npc.rescued) {
      if (this.state.flags && this.state.flags.nikkiRescued) {
        const rNpc = getRomanceNpc(npc.id);
        this.dialogue = { name: npc.name, text: rNpc ? `${rNpc.name} stirs in the coffin, blinking. "...you came. You actually came. I thought... I thought she'd keep me here forever." They reach for your hand. "Take me home. Please."` : 'They reach for you, trembling. "Take me out of here."' };
        // They walk out with you — the companion returns to your side
        if (!this.state.flags.partnerWalkedOut) {
          this.state.flags.partnerWalkedOut = true;
          this.state.romanceCompanion = { npcId: npc.id, name: npc.name, color: npc.color || '#c46a8a', x: this.state.player.x - 1, y: this.state.player.y, dir: 3, state: 'follow', anim: 0 };
          this.state.journal.push({ day: this.state.day, text: `${npc.name} is back at your side. They hold your hand a little too tightly now, and they don't like the dark anymore. Neither do you.`, type: 'romance', npcId: npc.id, npcName: npc.name });
          this.zone.npcs = this.zone.npcs.filter(n => n.id !== npc.id);
          if (this.renderer3d) this.renderer3d.buildWorld(this.tiles, this.crops, this.zone, this.state.season);
          this.save();
        }
      } else {
        this.dialogue = { name: npc.name, text: 'They lie motionless in the coffin, breathing faintly. A gag. Bound hands. They can\'t speak. Nikki won\'t let them go.' };
      }
      this.audio.playSfx('pickup');
      this.pushState();
      return;
    }
    // Romanceable NPCs — dialogue changes with affection level
    if (npc.romanceable) {
      const rNpc = getRomanceNpc(npc.id);
      if (rNpc) {
        if (!this.state.romance) this.state.romance = {};
        if (!this.state.romance[npc.id]) this.state.romance[npc.id] = { points: 0, talkCount: 0, giftsGiven: 0, confessed: false };
        const rs = this.state.romance[npc.id];
        const oldLevel = getRomanceLevel(rs.points);
        // Placed Nikki speaks her cycle dialogue — jealous foreshadowing in
        // Cycle 2, full obsession in Cycle 3 (romance panel still available)
        const line = npc.id === 'nikki' ? getNikkiDialogue(this.state, rs.talkCount || 0) : getRomanceDialogue(rNpc, rs);
        this.dialogue = { name: rNpc.name, text: line, romanceable: true, npcId: npc.id };
        // talking gives +2 affection (diminishing if already talked today)
        const todayKey = `romanceTalk_${npc.id}_${this.state.day}`;
        if (!this.state.flags) this.state.flags = {};
        if (!this.state.flags[todayKey]) {
          rs.points += 2;
          rs.talkCount = (rs.talkCount || 0) + 1;
          this.state.flags[todayKey] = true;
          // ── Romance journal: first meeting ──
          if (rs.talkCount === 1) {
            this.state.journal.push({ day: this.state.day, text: `You met ${rNpc.name} at ${rNpc.houseLabel}. ${rNpc.personality.charAt(0).toUpperCase() + rNpc.personality.slice(1)} — they seem like someone worth getting to know.`, type: 'romance', npcId: npc.id, npcName: rNpc.name });
          }
          // ── Romance journal: level-up milestone ──
          const newLevel = getRomanceLevel(rs.points);
          if (newLevel.name !== oldLevel.name) {
            this.state.journal.push({ day: this.state.day, text: `Your bond with ${rNpc.name} has deepened — you are now ${newLevel.name}s.`, type: 'romance', npcId: npc.id, npcName: rNpc.name });
            this.audio.playSfx('bell');
          }
        }
        this.audio.playSfx('pickup');
        this.pushState();
        return;
      }
    }
    if (npc.id === 'bartender') {
      if (!(this.state.flags && this.state.flags.saloonRestored)) {
        this.onState({ openSaloon: true });
        this.audio.playSfx('pickup');
        return;
      }
      this.onState({ openBar: true });
      this.audio.playSfx('pickup');
      return;
    }
    // Mayor reacts if the player has discovered his basement
    if (npc.id === 'mayor' && this.state.flags && this.state.flags.mayorSecretDiscovered) {
      this.dialogue = { name: npc.name, text: 'You... you went downstairs. I can see it in your eyes. Please — you must understand. He was my SON. The island takes everyone eventually. I only tried to give back what it stole. Please don\'t tell anyone.' };
      this.audio.playSfx('pickup');
      this.pushState();
      return;
    }
    const seen = this.state.friendship[npc.id] || 0;
    if (!npc.lines || !npc.lines.length) {
      this.dialogue = { name: npc.name || '???', text: 'They have nothing to say right now.' };
      this.audio.playSfx('pickup');
      this.pushState();
      return;
    }
    const line = npc.lines[Math.min(seen % npc.lines.length, npc.lines.length - 1)];
    this.dialogue = { name: npc.name, text: line };
    this.state.friendship[npc.id] = seen + 1;
    this.audio.playSfx('pickup');
    this.pushState();
  }

  sleep() {
    const before = {
      day: this.state.day,
      coins: this.state.coins || 0,
      xp: this.state.xp || 0,
      level: this.state.level || 1,
      weather: this.state.weather,
      time: this.state.time,
    };
    this.endDay(true);
    const after = {
      day: this.state.day,
      coins: this.state.coins || 0,
      xp: this.state.xp || 0,
      level: this.state.level || 1,
      weather: this.state.weather,
      season: this.state.season,
      time: this.state.time,
    };
    this.save();
    this.onState({
      sleepTransition: { before, after },
    });
  }

  endDay(fromSleep) {
    const s = this.state;
    s.day += 1;
    s.time = TIME_START;
    s.player.energy = 100;
    if (s.player.maxHp) s.player.hp = s.player.maxHp;
    // season change every 14 days
    if (s.day % 14 === 1 && s.day > 1) {
      const idx = SEASONS.indexOf(s.season);
      s.season = SEASONS[(idx + 1) % SEASONS.length];
    }
    // grow crops in every zone (fields keep growing while you sleep at home) —
    // rain auto-waters, each watered stage advances daily
    const rained = ['rain', 'storm', 'drizzle', 'heavy_fog'].includes(s.weather);
    for (const zoneId in s.zones) {
      const overrides = s.zones[zoneId].overrides || {};
      for (const key in overrides) {
        const ov = overrides[key];
        if (ov.crop === undefined) continue;
        if ((rained || ov.watered) && ov.cropStage < (ov.growDays || 2)) ov.cropStage += 1;
        ov.watered = false;
        // current-zone crop objects share these refs; refresh their visuals
        if (zoneId === s.zone && this.renderer3d) this.renderer3d.updateCrop(...key.split(',').map(Number), ov);
      }
    }
    // ── Tree & rock regrowth — resources replenish after a few days ──
    for (const zoneId in s.zones) {
      const zd = s.zones[zoneId];
      if (zd.regrow) {
        zd.regrow = zd.regrow.filter(r => {
          if (s.day >= r.day) {
            const key = `${r.x},${r.y}`;
            const cur = zd.overrides[key];
            if (!cur || cur.tile === T.GRASS) zd.overrides[key] = { tile: r.tile };
            return false;
          }
          return true;
        });
      }
    }
    // ── Animal production — chickens & cows produce every 2 days ──
    if (!s.flags) s.flags = {};
    if (s.flags.hasChickens) {
      s.flags.lastEggDay = s.flags.lastEggDay || s.day;
      if (s.day - s.flags.lastEggDay >= 2) {
        const cnt = s.flags.chickenCount || 2;
        this.addItem('egg', cnt);
        s.flags.lastEggDay = s.day;
        this.showToast(`🐔 Your chickens laid ${cnt} eggs!`, 4000);
      }
    }
    if (s.flags.hasCows) {
      s.flags.lastMilkDay = s.flags.lastMilkDay || s.day;
      if (s.day - s.flags.lastMilkDay >= 2) {
        const cnt = s.flags.cowCount || 2;
        this.addItem('milk', cnt);
        s.flags.lastMilkDay = s.day;
        this.showToast(`🐮 Your cows produced ${cnt} milk!`, 4000);
      }
    }
    // mystery event overnight (only if slept in bed or outside at midnight)
    if (fromSleep && Math.random() < 0.7) {
      const ev = MYSTERY_EVENTS[Math.floor(Math.random() * MYSTERY_EVENTS.length)];
      s.mysteries.push({ day: s.day, ...ev });
      s.journal.push({ day: s.day, text: ev.text, type: 'mystery' });
      // spawn footprints or ghost
      if (ev.id === 'footprints') {
        for (let i = 0; i < 5; i++)
          this.footprints.push({ x: 6 + i * 0.5, y: 7, zone: 'shore', age: 0 });
      }
      if (ev.id === 'figure') this.mysteryHotspot = { x: 5, y: 5, zone: 'shore' };
      if (ev.id === 'bells') this.audio.playSfx('bell');
      this.showToast(ev.text, 5000);
    }
    // Smoke & Stack — strangers arrive (cycle 2, day 7+)
    if (rollStrangerArrival(s)) {
      s.journal.push({ day: s.day, text: 'STRANGERS: Two dark-skinned men rolled into Pinebrook today. They lean against the statue in the square, selling something nobody on this island has seen in years — guns. They call themselves Smoke and Stack. One of them has too many teeth.', type: 'clue' });
      this.showToast('⚠ Two strangers have arrived in town...', 6000);
      this.audio.playSfx('bell');
      if (s.zone === 'town') this.loadZone('town');
    }
    // Patricia's party — random event in Cycle 2 after she's unmasked
    if (this.state.flags && this.state.flags.patriciaPartyEligible && !this.state.flags.patriciaPartyAttended) {
      if (this.state.flags.patriciaPartyToday) {
        // party was today but player missed it — allow another chance
        this.state.flags.patriciaPartyToday = false;
      } else if (Math.random() < 0.35) {
        this.state.flags.patriciaPartyToday = true;
        this.state.journal.push({ day: this.state.day, text: 'PATRICIA\'S PARTY: Patricia is throwing a celebration in the town square today! Head to Pinebrook Town to join the festivities.', type: 'clue' });
        this.showToast('🎉 Patricia is throwing a party in town today!', 6000);
      }
    }
    // reset daily buffs
    s.tempAttackBonus = 0;
    // ── Nikki's kidnapping (cycle 2) — 2 days after a romance confession ──
    const kidnappedId = checkNikkiKidnapping(s);
    if (kidnappedId && !(s.flags && s.flags.nikkiKidnapped)) {
      const victim = getRomanceNpc(kidnappedId);
      const name = victim ? victim.name : 'Your partner';
      if (!s.flags) s.flags = {};
      s.flags.nikkiKidnapped = kidnappedId;
      s.flags.nikkiKidnapClue = true;
      s.journal.push({ day: s.day, text: `MISSING: You woke and ${name} was gone. Their cottage is empty — the door left open, a single red ribbon on the threshold. A wet trail of footprints leads toward the Haunted Forest. Nikki was seen near the woods last night, humming.`, type: 'clue' });
      s.journal.push({ day: s.day, text: `QUEST: Find ${name}. Search the deep Haunted Forest for a hatch in the ground — Nikki has been keeping a cellar there.`, type: 'clue' });
      this.showToast(`⚠ ${name} is missing! A trail leads to the Haunted Forest...`, 7000);
      this.audio.playSfx('hiss');
    }
    // reset weather
    s.weatherTimer = 300;
    this.save();
    // Don't reload grotto/dungeon zones on day change — they have no crops or
    // trees to grow, and reloading respawns all enemies AND triggers an
    // expensive buildWorld that freezes the game mid-combat.
    if (s.zone !== 'grotto' && s.zone !== 'shaman_dungeon') {
      this.loadZone(s.zone);
    }
    this.pushState();
  }

  setTileOverride(x, y, tile, extra) {
    if (!this.tiles || y < 0 || y >= this.tiles.length || x < 0 || x >= (this.tiles[y]?.length || 0)) return;
    this.tiles[y][x] = tile;
    const key = `${x},${y}`;
    const ov = { tile, ...(extra || {}) };
    this.state.zones[this.state.zone].overrides[key] = ov;
    if (ov.crop !== undefined) this.crops[key] = ov;
    else delete this.crops[key];
    if (this.renderer3d) this.renderer3d.updateTile(x, y, tile);
  }
  saveTileOverride(x, y, ov) {
    this.state.zones[this.state.zone].overrides[`${x},${y}`] = ov;
  }

  addItem(id, count) {
    this.state.inventory[id] = (this.state.inventory[id] || 0) + count;
  }
  removeItem(id, count) {
    this.state.inventory[id] = Math.max(0, (this.state.inventory[id] || 0) - count);
  }
  hasItem(id, count) {
    return (this.state.inventory[id] || 0) >= count;
  }

  startBuild(buildableId) {
    this.buildMode = buildableId;
    this.showToast('Press E to place · place multiple · Esc to cancel');
  }

  tryPlace() {
    const p = this.state.player;
    const fx = Math.floor(p.x + (p.dir === 3 ? 1 : p.dir === 2 ? -1 : 0));
    const fy = Math.floor(p.y + (p.dir === 0 ? 1 : p.dir === 1 ? -1 : 0));
    const b = BUILDABLES.find(b => b.id === this.buildMode);
    if (!b) { this.buildMode = null; return; }
    const cur = this.getTile(fx, fy);
    // ── Pick up: if facing an already-placed buildable, break it and refund ──
    const placedBuildable = BUILDABLES.find(bb => bb.tile === cur);
    if (placedBuildable) {
      this.pickupBuildable(fx, fy, placedBuildable);
      return;
    }
    // check costs
    for (const item in b.cost) {
      if (!this.hasItem(item, b.cost[item])) { this.showToast('Not enough materials'); return; }
    }
    // can place on any walkable ground tile (grass, flowers, path, floor, etc.)
    const curProps = TILE_PROPS[cur];
    if (curProps && (curProps.solid || curProps.water)) {
      this.showToast('Cannot place here'); return;
    }
    for (const item in b.cost) this.removeItem(item, b.cost[item]);
    this.setTileOverride(fx, fy, b.tile);
    this.audio.playSfx('pickup');
    this.showToast(`Placed ${b.name}! Press Esc to exit build mode`);
    // keep buildMode active — place as many as materials allow
    this.pushState();
  }

  // ── Storage Chest ──
  depositToChest(itemId, count = 1) {
    if (!this.hasItem(itemId, count)) return;
    this.removeItem(itemId, count);
    if (!this.state.chestStorage) this.state.chestStorage = {};
    this.state.chestStorage[itemId] = (this.state.chestStorage[itemId] || 0) + count;
    this.audio.playSfx('pickup');
    this.pushState();
    this.save();
  }

  withdrawFromChest(itemId, count = 1) {
    if (!this.state.chestStorage) return;
    const stored = this.state.chestStorage[itemId] || 0;
    if (stored < count) return;
    this.state.chestStorage[itemId] = stored - count;
    if (this.state.chestStorage[itemId] <= 0) delete this.state.chestStorage[itemId];
    this.addItem(itemId, count);
    this.audio.playSfx('pickup');
    this.pushState();
    this.save();
  }

  // ── Witch's Tome interaction ──
  interactWitchTome() {
    // If boss is still alive, can't take the tome
    if ((this.state.storyCycle || 1) < 3) {
      this.showToast('An ancient pedestal... but nothing rests upon it. Not yet.', 4000);
      return;
    }
    if (this.boss && this.boss.hp > 0) {
      this.showToast('The Undead Shaman guards the tome! Defeat it first!', 4000);
      return;
    }
    if (this.state.flags && this.state.flags.witchTomeFound) {
      this.showToast('You have already taken the Witch\'s Tome.', 3000);
      return;
    }
    if (!this.state.flags) this.state.flags = {};
    this.state.flags.witchTomeFound = true;
    this.addItem('witch_tome', 1);
    this.state.journal.push({ day: this.state.day, text: 'You took the Witch\'s Tome from the pedestal. Its pages whisper in a language older than memory. Take it to the lighthouse.', type: 'mystery' });
    this.audio.playSfx('bell');
    this.showToast('✦ You found the Witch\'s Tome! Take it to the Lighthouse crystal. ✦', 6000);
    // remove the tome tile
    const fy = Math.floor(this.state.player.y + (this.state.player.dir === 0 ? 1 : this.state.player.dir === 1 ? -1 : 0));
    const fx = Math.floor(this.state.player.x + (this.state.player.dir === 3 ? 1 : this.state.player.dir === 2 ? -1 : 0));
    this.tiles[fy][fx] = T.FLOOR;
    this.renderer3d.updateTile(fx, fy, T.FLOOR);
    this.pushState();
    this.save();
  }

  // ── Mayor's Basement: hidden laboratory (Easter egg) ──
  enterMayorsBasement() {
    const cycle = this.state.storyCycle || 1;
    const day = this.state.day;
    if (cycle === 1 && day < 7) {
      this.showToast('The floorboard creaks beneath your feet... a cold draft seeps up from below. But it\'s nailed shut. Not yet.', 4000);
      return;
    }
    if (this.doorCooldown > 0) return;
    this.transitionZone('mayors_basement', 7, 10);
  }

  // ── Pet swap: offer Hanzo on cycle 3 ──
  offerPetSwap() {
    if (!canChooseHanzo(this.state)) return;
    if (this.state.petSwapOffered) return;
    if (this.state.character?.pet === 'hanzo') return;
    this.state.petSwapOffered = true;
    this.onState({
      story: {
        phase: 'ending',
        ending: 'pet_swap',
        cycle: this.state.storyCycle,
        speaker: 'A Choice',
        lines: [
          'You wake on the shore. But this time, you remember everything.',
          'Your companion sits beside you — loyal, as always.',
          'But something stirs in the woods. A low growl. A sturdy shape.',
          'An English Bulldog emerges from the treeline. Old, scarred, wise.',
          '"Name\'s Hanzo," a voice seems to say. Or maybe you just know.',
          '"I\'ve been waiting. Three cycles, same as you. I\'m done waiting."',
          'He sits. Your current companion looks at you. The choice is yours.',
        ],
      }
    });
  }

  choosePet(petType) {
    if (!this.state.character) this.state.character = {};
    const oldPet = this.state.character.pet;
    this.state.character.pet = petType;
    const petName = petType === 'hanzo' ? 'Hanzo' : petType === 'void' ? 'Void' : 'Fritz';
    if (oldPet !== petType) {
      this.state.journal.push({ day: this.state.day, text: `${petName} joins you on your journey. The island feels different with a new companion.`, type: 'mystery' });
    }
    this.pushState();
    this.save();
  }

  // ── Saloon restoration ──
  restoreSaloon() {
    const cost = SALOON_RESTORE_COST;
    for (const item in cost) {
      if (!this.hasItem(item, cost[item])) { this.showToast('Not enough materials!'); return false; }
    }
    for (const item in cost) this.removeItem(item, cost[item]);
    if (!this.state.flags) this.state.flags = {};
    this.state.flags.saloonRestored = true;
    this.state.journal.push({ day: this.state.day, text: 'The Old Saloon is restored! Pinebrook has a heart again.', type: 'milestone' });
    this.audio.playSfx('bell');
    this.showToast('✦ The Saloon is restored! Step inside! ✦', 6000);
    this.loadZone(this.state.zone);
    this.onState({ closeSaloon: true });
    this.pushState();
    this.save();
    return true;
  }

  applySaloonExteriorUpgrade() {
    // Saloon building in town: cx=33, cy=23, door at (33,21)
    // Light up the area to show it's restored and lively
    this.setTileOverride(30, 22, T.LANTERN_POST);
    this.setTileOverride(36, 22, T.LANTERN_POST);
    this.setTileOverride(30, 25, T.LANTERN_POST);
    this.setTileOverride(36, 25, T.LANTERN_POST);
    this.setTileOverride(31, 26, T.PUMPKIN);
    this.setTileOverride(35, 26, T.PUMPKIN);
    this.setTileOverride(33, 27, T.CAMPFIRE);
    this.setTileOverride(31, 27, T.BENCH);
    this.setTileOverride(35, 27, T.BENCH);
  }

  transitionZone(to, tx, ty) {
    if (to === 'grotto' && (this.state.grottoFloor || 0) === 0) {
      this.state.grottoFloor = 1;
    }
    if (to !== 'grotto') this.state.grottoFloor = 0;
    if (to !== 'grotto' && to !== 'shaman_dungeon') this.enemies = [];
    if (to !== 'grotto' && to !== 'shaman_dungeon') this.boss = null;
    this.state.zone = to;
    this.loadZone(to);
    this.state.player.x = tx + 0.5;
    this.state.player.y = ty + 0.5;
    this.state.player.moving = false;
    this.doorCooldown = 0.6;
    // ensure arrival point and immediate surroundings are walkable
    const atx = Math.floor(tx), aty = Math.floor(ty);
    this.clearArrivalArea(atx, aty, to);
    this.ensureSafeSpawn();
    // re-spawn grotto enemies now that player position is set
    if (to === 'grotto') {
      this._spawnGrottoEnemies(this.state.player.x, this.state.player.y);
      this.floorCleared = false;
    }
    if (to === 'shaman_dungeon') {
      // boss is spawned in loadShamanDungeon, but we need to set enemies after player position
      if (this.boss) {
        this.enemies = [this.boss];
        this.markEnemiesEncountered();
        this.floorCleared = false;
      }
    }
    // bring Fritz along — place right at the player so he's already beside you
    const pp = this.state.player;
    const f = this.state.fritz;
    f.x = pp.x - 0.4;
    f.y = pp.y;
    f.state = 'follow';
    f.dir = pp.dir;
    // bring romance companion along too
    if (this.state.romanceCompanion) {
      this.state.romanceCompanion.x = pp.x + 0.4;
      this.state.romanceCompanion.y = pp.y;
      this.state.romanceCompanion.state = 'follow';
      this.state.romanceCompanion.dir = pp.dir;
    }
    this.playerTrail = [];
    this.pushState();
    this.save();
  }

  clearArrivalArea(cx, cy, zoneTo) {
    const w = this.zone.w, h = this.zone.h;
    cx = Math.max(1, Math.min(w - 2, cx));
    cy = Math.max(1, Math.min(h - 2, cy));
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const t = this.getTile(x, y);
        const p = TILE_PROPS[t];
        if (p && (p.solid || p.water) && !p.door) {
          if (zoneTo === 'grotto') this.tiles[y][x] = T.FLOOR;
          else this.setTileOverride(x, y, T.PATH);
        }
      }
    }
  }

  spawnSpirit() {
    const p = this.state.player;
    const isNight = this.atm.isNight(this.state.time);
    const type = rollSpirit(this.state.weather || 'clear', isNight);
    const spirit = getSpirit(type);
    this.ghosts.push({
      x: p.x + (Math.random() - 0.5) * 8,
      y: p.y + (Math.random() - 0.5) * 6,
      zone: this.state.zone,
      alpha: 0, life: 0, maxLife: 3 + Math.random() * 3,
      type,
      phase: Math.random() * Math.PI * 2,
    });
    this.mysteryHotspot = { x: this.ghosts[this.ghosts.length - 1].x, y: this.ghosts[this.ghosts.length - 1].y, zone: this.state.zone };
    // wisps hum softly; shadow/wraith figures hiss
    this.audio.playSfx(spirit.glow ? 'pickup' : 'hiss');
  }

  tryVillainEncounter() {
    const zoneId = this.state.zone;
    const villain = VILLAINS.find(v => v.zone === zoneId && !this.state.villainsUnmasked.includes(v.id));
    if (!villain) return;
    // only trigger if player has explored a bit (day > 2)
    if (this.state.day < 3) return;
    this.encounterVillain(villain.id);
  }

  spawnVillainGhost(villainId) {
    // remove any existing villain ghost
    this.ghosts = this.ghosts.filter(g => !g.persistent);
    // find the villain's anchor tile to place the ghost near it
    const villain = VILLAINS.find(v => v.id === villainId);
    let gx = this.state.player.x, gy = this.state.player.y;
    if (villainId === 'captain_holloway') {
      // place at the shipwreck
      for (let y = 0; y < this.zone.h; y++)
        for (let x = 0; x < this.zone.w; x++)
          if (this.tiles[y][x] === T.SHIPWRECK) { gx = x + 0.5; gy = y + 0.5; }
    }
    const type = villainId === 'captain_holloway' ? 'captain' : 'pale';
    this.ghosts.push({
      x: gx, y: gy, zone: this.state.zone,
      alpha: 0, life: 0, maxLife: 9999,
      type, phase: 0, persistent: true,
    });
    this.villainGhost = this.ghosts[this.ghosts.length - 1];
    this.mysteryHotspot = { x: gx, y: gy, zone: this.state.zone };
    if (type === 'captain') this.audio.playSfx('hiss');
  }

  updateGhosts(dt) {
    for (const g of this.ghosts) {
      if (g.persistent) {
        // persistent villain ghost — fade in and stay at full
        g.alpha = Math.min(0.85, g.alpha + dt * 1.5);
        continue;
      }
      g.life += dt;
      g.alpha = g.life < 1 ? g.life : Math.max(0, 1 - (g.life - 1) / (g.maxLife - 1));
    }
    this.ghosts = this.ghosts.filter(g =>
      (g.persistent ? g.zone === this.state.zone : g.life < g.maxLife && g.zone === this.state.zone)
    );
  }

  showToast(text, duration = 3000) {
    this.toast = { text, until: performance.now() + duration };
    this.pushState();
  }

  triggerDejaVu() {
    const line = DEJA_VU_LINES[Math.floor(Math.random() * DEJA_VU_LINES.length)];
    this.state.journal.push({ day: this.state.day, text: `MEMORY: ${line}`, type: 'mystery' });
    this.showToast('⚠ A memory surfaces from another life...', 5000);
    this.audio.playSfx('bell');
    this.pushState();
  }

  pushState() {
    const s = this.state;
    if (!s) return;
    // detect new journal entries since last push
    const journalLen = s.journal ? s.journal.length : 0;
    const newCount = this._lastJournalCount !== undefined ? Math.max(0, journalLen - this._lastJournalCount) : 0;
    const newEntry = newCount > 0 ? s.journal[s.journal.length - 1] : null;
    this._lastJournalCount = journalLen;
    this.onState({
      time: s.time, day: s.day, season: s.season, weather: s.weather,
      zone: this.zone?.def?.name || 'Unknown', zoneId: s.zone,
      energy: s.player.energy,
      hp: s.player.hp, maxHp: s.player.maxHp,
      xp: s.xp, xpToNext: s.xpToNext,
      inventory: s.inventory,
      journal: s.journal,
      mysteries: s.mysteries,
      dialogue: this.dialogue,
      toast: this.toast,
      actionPrompt: this.actionPrompt,
      buildMode: this.buildMode,
      fishing: this.fishingState,
      catchResult: this.catchResult,
      isNight: this.atm.isNight(s.time),
      introSeen: s.introSeen,
      character: s.character,
      level: s.level, strength: s.strength, coins: s.coins,
      grottoFloor: s.grottoFloor,
      selectedTool: s.selectedTool || 0,
      lanternOn: !!this.lanternOn,
      enemyCount: this.enemies ? this.enemies.length : 0,
      storyCycle: s.storyCycle || 1,
      villainsUnmasked: s.villainsUnmasked || [],
      truthFragments: s.truthFragments || [],
      hasLighthouseKey: !!(s.flags && s.flags.lighthouseKey),
      cabinName: CYCLE_CONFIG[s.storyCycle || 1]?.cabinName || 'The Cabin',
      saloonRestored: !!(s.flags && s.flags.saloonRestored),
      chestStorage: s.chestStorage || {},
      witchTomeFound: !!(s.flags && s.flags.witchTomeFound),
      equippedWeapon: s.equippedWeapon || null,
      equippedArmor: s.equippedArmor || null,
      craftRecipes: CRAFT_RECIPES,
      equippedHat: s.equippedHat || null,
      hasAntlerCrown: this.hasItem('deer_antler_crown', 1),
      patriciaPartyToday: !!(s.flags && s.flags.patriciaPartyToday),
      tempAttackBonus: s.tempAttackBonus || 0,
      permHpBonus: s.permHpBonus || 0,
      shamanDefeated: !!(s.flags && s.flags.shamanDefeated),
      petSwapOffered: s.petSwapOffered || false,
      bossActive: !!(this.boss && this.boss.hp > 0),
      bossHp: this.boss ? this.boss.hp : 0,
      bossMaxHp: this.boss ? this.boss.maxHp : 0,
      bossName: this.boss ? this.boss.name : '',
      strangerShopItems: getStrangerShopItems(s),
      vampireBloodTaken: !!(s.flags && s.flags.vampireBloodTaken),
      bestiary: s.flags?.bestiary || {},
      fishCaught: s.flags?.fishCaught || {},
      godModeUnlocked: !!(s.flags && s.flags.godModeUnlocked),
      godModeActive: !!(s.flags && s.flags.godModeActive),
      romance: s.romance || {},
      nikkiRomanced: !!(s.flags && s.flags.nikkiRomanced),
      nikkiKidnapped: s.flags?.nikkiKidnapped || null,
      nikkiRescued: !!(s.flags && s.flags.nikkiRescued),
      maxGrottoFloor: s.flags?.maxGrottoFloor || s.grottoFloor || 0,
      confrontation: this.confrontation,
      hollowayEvidence: HOLLOWAY_EVIDENCE.map(e => ({
        ...e,
        found: !!(s.flags && s.flags[e.id]),
      })),
      journalNew: newCount,
      journalNewEntry: newEntry,
    });
  }

  closeDialogue() {
    const wasNikkiBasement = this.dialogue && this.dialogue.nikkiBasement;
    this.dialogue = null;
    // Nikki's basement confrontation — she flees, the partner is freed
    if (wasNikkiBasement && this.state.flags && this.state.flags.nikkiKidnapped && !this.state.flags.nikkiRescued) {
      this.state.flags.nikkiRescued = true;
      const victimId = this.state.flags.nikkiKidnapped;
      const rNpc = getRomanceNpc(victimId);
      const name = rNpc ? rNpc.name : 'Your partner';
      this.state.journal.push({ day: this.state.day, text: `RESCUE: You found ${name} in Nikki's basement — in a coffin, alive. Nikki fled into the dark, weeping. ${name} is safe now, but the island feels colder. Nikki is still out there. Somewhere.`, type: 'mystery' });
      this.state.journal.push({ day: this.state.day, text: 'NIKKI: She called it love. She kept them like a keepsake. She is not gone — only grieving. Watch the woods.', type: 'clue' });
      this.audio.playSfx('bell');
      this.showToast(`✦ You freed ${name}! But Nikki fled into the dark... ✦`, 6000);
      this.spawnHeartParticles(this.state.player.x, this.state.player.y - 0.5);
      // reload the basement so Nikki disappears and the partner is freed
      this.loadZone('nikki_basement');
    }
    // remove the villain ghost when the encounter dialogue ends
    if (!this.pendingVillainReveal && !this.confrontation && !wasNikkiBasement) {
      this.ghosts = this.ghosts.filter(g => !g.persistent);
      this.villainGhost = null;
    }
    this.pushState();
  }

  openRomancePanel(npcId) {
    const rNpc = getRomanceNpc(npcId);
    if (!rNpc) return;
    if (!this.state.romance) this.state.romance = {};
    if (!this.state.romance[npcId]) this.state.romance[npcId] = { points: 0, talkCount: 0, giftsGiven: 0, confessed: false };
    this.onState({ openRomance: true, romanceNpcId: npcId });
  }

  giveGift(npcId, itemId) {
    const rNpc = getRomanceNpc(npcId);
    if (!rNpc) return;
    if (!this.hasItem(itemId, 1)) return;
    // one gift per NPC per day
    const todayKey = `romanceGift_${npcId}_${this.state.day}`;
    if (!this.state.flags) this.state.flags = {};
    if (this.state.flags[todayKey]) {
      this.showToast(`${rNpc.name} has already received a gift today.`, 3000);
      return;
    }
    this.removeItem(itemId, 1);
    this.state.flags[todayKey] = true;
    if (!this.state.romance) this.state.romance = {};
    if (!this.state.romance[npcId]) this.state.romance[npcId] = { points: 0, talkCount: 0, giftsGiven: 0, confessed: false };
    const rs = this.state.romance[npcId];
    const oldLevel = getRomanceLevel(rs.points);
    const reaction = getGiftReaction(rNpc, itemId);
    rs.points += reaction.points;
    rs.giftsGiven = (rs.giftsGiven || 0) + 1;
    // ── Romance journal: gift reaction ──
    this.state.journal.push({ day: this.state.day, text: `You gave ${rNpc.name} a gift. "${reaction.text}" (+${reaction.points} ♥)`, type: 'romance', npcId, npcName: rNpc.name, giftType: reaction.type });
    // ── Romance journal: level-up milestone ──
    const newLevel = getRomanceLevel(rs.points);
    if (newLevel.name !== oldLevel.name) {
      this.state.journal.push({ day: this.state.day, text: `Your bond with ${rNpc.name} has deepened — you are now ${newLevel.name}s.`, type: 'romance', npcId, npcName: rNpc.name });
      this.audio.playSfx('bell');
    }
    this.audio.playSfx(reaction.type === 'loved' ? 'bell' : 'pickup');
    this.showToast(`${rNpc.name}: "${reaction.text}" (+${reaction.points} ♥)`, 5000);
    this.pushState();
    this.save();
  }

  confessRomance(npcId) {
    const rNpc = getRomanceNpc(npcId);
    if (!rNpc) return;
    if (!this.state.romance || !this.state.romance[npcId]) return;
    const rs = this.state.romance[npcId];
    const threshold = rNpc.confessionThreshold || ROMANCE_THRESHOLD_CONFESSION;
    if (rs.points < threshold) { this.showToast('Your bond isn\'t strong enough yet.', 3000); return; }
    if (rs.confessed) { this.showToast('You\'re already together!'); return; }
    rs.confessed = true;
    rs.confessedDay = this.state.day;
    this.state.journal.push({ day: this.state.day, text: `You confessed your feelings to ${rNpc.name}. ${rNpc.confessionResponse}`, type: 'romance', npcId, npcName: rNpc.name, milestone: 'confession' });
    this.audio.playSfx('bell');
    this.showToast(`♥ You and ${rNpc.name} are now together! ♥`, 6000);
    // spawn heart particles
    this.spawnHeartParticles(this.state.player.x, this.state.player.y - 0.5);
    // ── Romanced NPC becomes your companion, following you everywhere ──
    if (!this.state.flags) this.state.flags = {};
    if (npcId === 'nikki') this.state.flags.nikkiRomanced = true;
    this.state.romanceCompanion = { npcId, name: rNpc.name, color: rNpc.color || '#c46a8a', x: this.state.player.x - 1, y: this.state.player.y, dir: 3, state: 'follow', anim: 0 };
    if (npcId === 'nikki') {
      this.state.journal.push({ day: this.state.day, text: 'Nikki has moved in with you. She follows you everywhere now — a constant shadow at your side. She\'s quiet when you sleep, talks when you walk, and watches the woods with eyes that see too much.', type: 'romance', npcId: 'nikki', npcName: 'Nikki', milestone: 'moved_in' });
    } else {
      this.state.journal.push({ day: this.state.day, text: `${rNpc.name} has moved in with you. They follow you everywhere now — a constant presence at your side, through the fog, the grotto, and the long dark nights.`, type: 'romance', npcId, npcName: rNpc.name, milestone: 'moved_in' });
    }
    this.pushState();
    this.save();
  }

  markJournalRead() {
    this._lastJournalCount = this.state.journal ? this.state.journal.length : 0;
  }

  canEnterLighthouse() {
    const s = this.state;
    return s.flags && s.flags.lighthouseKey;
  }

  collectLighthouseKey() {
    if (this.state.flags && this.state.flags.lighthouseKey) { this.showToast('Already have the Lighthouse Key.'); return; }
    if (!this.state.flags) this.state.flags = {};
    this.state.flags.lighthouseKey = true;
    this.addItem('lighthouse_key', 1);
    this.state.journal.push({ day: this.state.day, text: 'At the bottom of the Grotto, you found a rusted iron key. It hums with cold light. The lighthouse door...', type: 'mystery' });
    this.audio.playSfx('bell');
    this.showToast('✦ You found the Lighthouse Key! ✦', 6000);
    // remove the key chest at its actual position (middle-right on floor 50)
    const kcx = this.zone.w - 4;
    const kcy = Math.floor(this.zone.h / 2);
    if (this.tiles[kcy] && (this.tiles[kcy][kcx] === T.LIGHTHOUSE_KEY_CHEST || this.tiles[kcy][kcx] === T.GROTTO_CHEST)) {
      this.tiles[kcy][kcx] = T.FLOOR;
      this.renderer3d.updateTile(kcx, kcy, T.FLOOR);
    }
    this.pushState();
    this.save();
  }

  // ── Villain encounter system ──
  // Called when player interacts near a mystery hotspot or at night in certain zones
  encounterVillain(villainId) {
    const villain = VILLAINS.find(v => v.id === villainId);
    if (!villain) return;
    if (this.state.villainsUnmasked.includes(villainId)) return;

    // spawn a visible ghost sprite for the encounter
    this.spawnVillainGhost(villainId);

    // Captain Holloway — logic-based confrontation requires all evidence
    if (villainId === 'captain_holloway') {
      const allFound = HOLLOWAY_EVIDENCE.every(e => this.state.flags && this.state.flags[e.id]);
      if (!allFound) {
        const found = HOLLOWAY_EVIDENCE.filter(e => this.state.flags && this.state.flags[e.id]).length;
        this.dialogue = {
          name: villain.name,
          text: villain.disguise + ` ...But you have only ${found} of ${HOLLOWAY_EVIDENCE.length} pieces of evidence. The ghost retreats into the fog before you can confront it. Search the Whispering Woods more thoroughly.`,
        };
        this.pendingVillainReveal = null;
        this.pushState();
        return;
      }
      this.startHollowayConfrontation(villain);
      return;
    }

    // Other villains: show disguise, then unmask
    this.dialogue = { name: villain.name, text: villain.disguise };
    this.pendingVillainReveal = villain;
    this.pushState();
  }

  startHollowayConfrontation(villain) {
    this.confrontation = {
      villain,
      step: 0,
      mode: 'evidence',
      lastResponse: '',
      lastCorrect: false,
      totalSteps: HOLLOWAY_CONFRONTATION.length,
      evidence: HOLLOWAY_EVIDENCE.filter(e => this.state.flags && this.state.flags[e.id]),
    };
    this.dialogue = { name: villain.name, text: HOLLOWAY_CONFRONTATION[0].ghostLine };
    this.pushState();
  }

  submitConfrontationEvidence(evidenceId) {
    if (!this.confrontation || this.confrontation.mode !== 'evidence') return;
    const step = HOLLOWAY_CONFRONTATION[this.confrontation.step];
    if (evidenceId === step.correctEvidence) {
      this.confrontation.lastCorrect = true;
      this.confrontation.lastResponse = step.response;
      this.confrontation.mode = 'response';
      this.audio.playSfx('pickup');
    } else {
      this.confrontation.lastCorrect = false;
      this.confrontation.lastResponse = step.wrongResponse;
      this.confrontation.mode = 'response';
      this.audio.playSfx('hiss');
    }
    this.pushState();
  }

  advanceConfrontation() {
    if (!this.confrontation || this.confrontation.mode !== 'response') return;
    const wasCorrect = this.confrontation.lastCorrect;
    const villain = this.confrontation.villain;
    if (wasCorrect) {
      this.confrontation.step += 1;
      if (this.confrontation.step >= HOLLOWAY_CONFRONTATION.length) {
        this.completeHollowayConfrontation();
        return;
      }
      const completedStep = HOLLOWAY_CONFRONTATION[this.confrontation.step - 1];
      const nextStep = HOLLOWAY_CONFRONTATION[this.confrontation.step];
      const text = completedStep.ghostRetort
        ? completedStep.ghostRetort + '\n\n' + nextStep.ghostLine
        : nextStep.ghostLine;
      this.dialogue = { name: villain.name, text };
      this.confrontation.mode = 'evidence';
    } else {
      const step = HOLLOWAY_CONFRONTATION[this.confrontation.step];
      this.dialogue = { name: villain.name, text: step.ghostLine };
      this.confrontation.mode = 'evidence';
    }
    this.pushState();
  }

  completeHollowayConfrontation() {
    const villain = this.confrontation.villain;
    const lastStep = HOLLOWAY_CONFRONTATION[HOLLOWAY_CONFRONTATION.length - 1];
    this.confrontation = null;
    this.pendingVillainReveal = villain;
    this.dialogue = {
      name: villain.name + ' — Cornered',
      text: lastStep.response + '\n\nThe figure staggers back. The wailing stops. The fog-cloak slips — and beneath it is no spirit at all. "Alright," a gruff voice says. "Alright, you got me."',
    };
    this.pushState();
  }

  unmaskVillain() {
    if (!this.pendingVillainReveal) return;
    const v = this.pendingVillainReveal;
    this.state.villainsUnmasked.push(v.id);
    const fragmentIndex = this.state.villainsUnmasked.length - 1;
    const fragment = TRUTH_FRAGMENTS[fragmentIndex] || TRUTH_FRAGMENTS[TRUTH_FRAGMENTS.length - 1];
    this.state.truthFragments.push(fragment);
    this.state.journal.push({ day: this.state.day, text: `UNMASKED: ${v.name}. ${v.reveal}`, type: 'mystery' });
    this.state.journal.push({ day: this.state.day, text: `TRUTH: ${v.truth}`, type: 'mystery' });
    this.state.journal.push({ day: this.state.day, text: `CLUE: ${v.clue}`, type: 'clue' });
    this.audio.playSfx('bell');

    // Cycle 2: Patricia throws a party after being unmasked
    if (v.id === 'drowned_woman' && (this.state.storyCycle || 1) === 2) {
      if (!this.state.flags) this.state.flags = {};
      this.state.flags.patriciaPartyEligible = true;
      this.state.journal.push({ day: this.state.day, text: 'Patricia, unmasked and unashamed, announces she\'s throwing a party for the whole town. "No hard feelings," she says with a grin. "Come to the square when it happens."', type: 'clue' });
    }

    // Show reveal dialogue
    this.dialogue = { name: v.name + ' — Unmasked', text: v.reveal + ' ' + v.truth };
    this.pendingVillainReveal = null;
    // the villain's disguise is broken — remove the ghost sprite
    this.ghosts = this.ghosts.filter(g => !g.persistent);
    this.villainGhost = null;
    this.pushState();
    this.save();
  }

  // ── Lighthouse ending sequence ──
  triggerLighthouseEnding() {
    const cycle = this.state.storyCycle || 1;
    const allUnmasked = this.state.villainsUnmasked.length >= 4;
    if (!allUnmasked || !this.canEnterLighthouse()) {
      this.showToast('The light is cold and dark. You are not ready.', 4000);
      return;
    }

    // Cycle 3: true ending requires reading the Witch's Tome at the crystal
    const hasTome = this.state.flags && this.state.flags.witchTomeFound;
    if (cycle >= 3 && hasTome) {
      // TRUE ENDING — the island is freed; its true form manifests
      this.state.flags = this.state.flags || {}; this.state.flags.curseBroken = true; if (!this.state.flags.bestiary) this.state.flags.bestiary = {}; if (!this.state.flags.bestiary.the_island) this.state.flags.bestiary.the_island = { encountered: true, defeated: 0 };
      this.state.journal.push({ day: this.state.day, text: '✦ You read the Witch\'s Tome aloud at the lighthouse crystal. The island\'s true name burns the curse away. ✦', type: 'mystery' });
      this.ghosts = this.ghosts.filter(g => !g.persistent); this.ghosts.push({ x: this.state.player.x, y: this.state.player.y - 3, zone: this.state.zone, alpha: 0, life: 0, maxLife: 9999, type: 'tentacle', phase: 0, persistent: true });
      this.onState({
        story: {
          phase: 'ending',
          ending: 'true',
          cycle: 3,
          speaker: 'The Island',
          lines: getTrueEndingMonologue(),
        }
      });
      this.save();
      return;
    }

    if (cycle >= 3 && !hasTome) {
      this.showToast('The crystal hums, but something is missing. There is a book — on the far shore. Find it.', 5000);
      return;
    }

    // Cycles 1-2: the island wipes your memory
    const lines = getIslandMonologue(cycle);
    this.onState({
      story: {
        phase: 'ending',
        ending: 'cycle',
        cycle,
        speaker: 'The Island',
        lines,
      }
    });
  }

  // ── True ending finished: terminal state. Save and let GamePage return to the main menu. ──
  finishGame() {
    this.state.journal.push({ day: this.state.day, text: '✦ The curse is broken. The island is free. So are you. ✦', type: 'mystery' });
    this.save();
  }

  // ── NG+ reset: island wipes memory, throws you back to shore ──
  startNewCycle() {
    const cycle = (this.state.storyCycle || 1) + 1;

    // NG+ reset: keep level, strength, inventory, tools; reset zone, day, flags
    const keptLevel = this.state.level;
    const keptStrength = this.state.strength;
    const keptXp = this.state.xp;
    const keptXpToNext = this.state.xpToNext;
    const keptInventory = { ...this.state.inventory };
    const keptSelectedTool = this.state.selectedTool;
    const keptGrottoChests = { ...this.state.grottoChests };

    this.state = {
      zone: 'shore',
      character: this.state.character,
      player: { x: 7, y: 11, dir: 0, moving: false, anim: 0, energy: 100, hasHoe: true, hasCan: true, hasRod: true, hp: this.state.player.maxHp, maxHp: this.state.player.maxHp },
      fritz: { x: 6, y: 11, dir: 3, state: 'follow', anim: 0 },
      time: TIME_START,
      day: 1,
      season: 'autumn',
      weather: 'clear',
      weatherTimer: 600,
      inventory: keptInventory,
      zones: {},
      journal: this.state.journal, // keep journal — the player subconsciously remembers
      mysteries: this.state.mysteries,
      flags: {
        strangersArrivedCycle2: !!(this.state.flags && this.state.flags.strangersArrivedCycle2),
        boughtTommyGun: !!(this.state.flags && this.state.flags.boughtTommyGun),
        boughtHandgun: !!(this.state.flags && this.state.flags.boughtHandgun),
        vampireBloodTaken: !!(this.state.flags && this.state.flags.vampireBloodTaken),
        boughtVampiricSword: !!(this.state.flags && this.state.flags.boughtVampiricSword),
        // carry over farm animals across cycles
        hasChickens: !!(this.state.flags && this.state.flags.hasChickens),
        chickenCount: (this.state.flags && this.state.flags.chickenCount) || 0,
        hasCows: !!(this.state.flags && this.state.flags.hasCows),
        cowCount: (this.state.flags && this.state.flags.cowCount) || 0,
        godModeUnlocked: !!(this.state.flags && this.state.flags.godModeUnlocked),
        godModeActive: !!(this.state.flags && this.state.flags.godModeActive),
      },
      romance: {},
      romanceCompanion: null,
      friendship: this.state.friendship,
      level: keptLevel,
      strength: keptStrength,
      coins: this.state.coins,
      xp: keptXp,
      xpToNext: keptXpToNext,
      grottoFloor: 0,
      grottoChests: keptGrottoChests,
      storyCycle: cycle,
      villainsUnmasked: [], // must re-unmask each cycle
      truthFragments: [],
      introSeen: true, // skip intro on NG+
      selectedTool: keptSelectedTool,
      chestStorage: this.state.chestStorage || {},
      petSwapOffered: false,
      equippedWeapon: this.state.equippedWeapon,
      equippedArmor: this.state.equippedArmor,
      equippedHat: this.state.equippedHat,
      permHpBonus: this.state.permHpBonus || 0,
      tempAttackBonus: 0,
    };

    this.loadZone('shore');
    this.ensureSafeSpawn();
    this.enemies = [];
    this.ghosts = [];
    this.footprints = [];
    this.playerTrail = [];
    this.confrontation = null;
    this.boss = null;
    this.save();
    this.pushState();
    // On cycle 3, offer the pet swap to Hanzo
    if (cycle === 3) {
      setTimeout(() => this.offerPetSwap(), 2000);
    }
  }

  getPlayerMaxHp() {
    let hp = 60 + (this.state.level || 1) * 10 + (this.state.strength || 1) * 5 + (this.state.permHpBonus || 0);
    if (this.state.equippedArmor && ARMOR[this.state.equippedArmor]) hp += ARMOR[this.state.equippedArmor].defense;
    if (this.state.flags && this.state.flags.vampireBloodTaken) hp = Math.floor(hp * 1.25);
    return hp;
  }

  getPlayerAttack() {
    let atk = 5 + (this.state.strength || 1) * 2 + (this.state.level || 1) + (this.state.tempAttackBonus || 0);
    if (this.getTool().id === 'sword') atk += 3;
    if (this.state.equippedWeapon && WEAPONS[this.state.equippedWeapon]) atk += WEAPONS[this.state.equippedWeapon].attack;
    if (this.state.flags && this.state.flags.vampireBloodTaken) atk = Math.floor(atk * 1.25);
    return atk;
  }

  updateEnemies(dt) {
    if (!this.enemies || this.enemies.length === 0) {
      if (this.zone && this.zone.id === 'grotto' && !this.floorCleared) {
        this.floorCleared = true;
        this.showToast('Floor cleared! Descend when ready.', 4000);
        this.audio.playSfx('bell');
        this.pushState();
      }
      return;
    }
    const p = this.state.player;
    for (const e of this.enemies) {
      if (e.attackCd > 0) e.attackCd -= dt;
      if (e.hitFlash > 0) e.hitFlash -= dt;
      e.anim += dt * 4;

      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < 8) {
        // chase player
        const ddx = p.x - e.x, ddy = p.y - e.y;
        const d = Math.hypot(ddx, ddy);
        if (d > 0.5) {
          const nx = e.x + (ddx / d) * e.speed * dt;
          const ny = e.y + (ddy / d) * e.speed * dt;
          if (!this.isSolid(Math.floor(nx), Math.floor(e.y))) e.x = nx;
          if (!this.isSolid(Math.floor(e.x), Math.floor(ny))) e.y = ny;
          e.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 3 : 2) : (ddy > 0 ? 0 : 1);
        }
        // attack only when touching the player
        if (dist < 0.8 && e.attackCd <= 0) {
          this.enemyAttackPlayer(e);
          e.attackCd = 1.2;
        }
      } else {
        // wander
        e.wanderTimer -= dt;
        if (e.wanderTimer <= 0) {
          e.wanderDir = Math.random() * Math.PI * 2;
          e.wanderTimer = 1 + Math.random() * 2;
        }
        const wx = Math.cos(e.wanderDir), wy = Math.sin(e.wanderDir);
        const nx = e.x + wx * e.speed * 0.4 * dt;
        const ny = e.y + wy * e.speed * 0.4 * dt;
        if (!this.isSolid(Math.floor(nx), Math.floor(e.y))) e.x = nx;
        else e.wanderDir = Math.random() * Math.PI * 2;
        if (!this.isSolid(Math.floor(e.x), Math.floor(ny))) e.y = ny;
        else e.wanderDir = Math.random() * Math.PI * 2;
      }
    }
  }

  attackEnemy(enemy) {
    let dmg = this.getPlayerAttack();
    // Vampiric Sword: extreme damage to bosses
    if (this.state.equippedWeapon === 'vampiric_sword' && enemy.isBoss) {
      dmg *= 5;
    }
    enemy.hp -= dmg;
    enemy.hitFlash = 0.2;
    this.audio.playSfx('chop');

    // Boss phase transitions
    if (enemy.isBoss && enemy.phase !== undefined) {
      const hpPct = enemy.hp / enemy.maxHp;
      const bossType = getBossType(enemy.typeId);
      if (bossType) {
        for (let i = bossType.phases.length - 1; i >= 0; i--) {
          if (hpPct <= bossType.phases[i].hpThreshold && enemy.phase < i) {
            enemy.phase = i;
            enemy.atk = Math.floor(bossType.baseAtk * bossType.phases[i].atkMult);
            enemy.speed = bossType.speed * bossType.phases[i].speedMult;
            this.showToast(bossType.phases[i].name, 4000);
            this.audio.playSfx('bell');
            break;
          }
        }
      }
    }

    if (enemy.hp <= 0) {
      this.gainXp(enemy.xp);
      this.markEnemyDefeated(enemy.typeId);
      this.enemies = this.enemies.filter(e => e !== enemy);
      this.audio.playSfx('catch');
      this.showToast(`Defeated ${enemy.name}! +${enemy.xp} XP`, 3000);

      // Boss defeat — shaman drops nothing directly, but unlocks the tome
      if (enemy.isBoss && enemy.typeId === 'undead_shaman') {
        if (!this.state.flags) this.state.flags = {};
        this.state.flags.shamanDefeated = true;
        this.boss = null;
        this.state.journal.push({ day: this.state.day, text: 'The Undead Shaman crumbles to dust. The Witch\'s Tome pulses on its pedestal — it is yours to take now.', type: 'mystery' });
        this.showToast('✦ The Shaman is defeated! The tome awaits! ✦', 6000);
        this.audio.playSfx('bell');
      } else if (enemy.isBoss && enemy.typeId === 'abyssal_warden') {
        this.boss = null;
        this.addItem('crystal', 5);
        this.addItem('iron', 5);
        this.state.journal.push({ day: this.state.day, text: 'The Abyssal Warden dissolves into shadow. A cache of crystals and iron clatters to the floor. The deeper depths await.', type: 'mystery' });
        this.showToast('✦ The Abyssal Warden falls! Crystals & iron recovered! ✦', 6000);
        this.audio.playSfx('bell');
      } else if (enemy.isBoss && enemy.typeId === 'depth_leviathan') {
        this.boss = null;
        this.addItem('crystal', 10);
        this.addItem('iron', 10);
        this.addItem('diamond', 2);
        this.state.journal.push({ day: this.state.day, text: 'The Depth Leviathan collapses. Its void-wracked form disperses into nothingness. You have conquered the deepest horror the grotto has to offer. Diamonds and riches spill from its remains.', type: 'mystery' });
        this.showToast('✦ The Depth Leviathan is defeated! Diamonds & riches yours! ✦', 7000);
        this.audio.playSfx('bell');
      } else {
        // chance to drop loot
        if (Math.random() < 0.25) {
          this.addItem('crystal', 1);
          this.showToast('Found a crystal!');
        } else if (Math.random() < 0.15) {
          this.addItem('iron', 1);
          this.showToast('Found iron ore!');
        }
      }
    } else {
      this.showToast(`-${dmg} HP to ${enemy.name}`, 1500);
    }
    this.pushState();
  }

  enemyAttackPlayer(enemy) {
    if (this.state.flags && this.state.flags.godModeActive) {
      this.audio.playSfx('pickup');
      this.showToast('✦ GOD MODE — No damage taken!', 1500);
      this.pushState();
      return;
    }
    const dmg = enemy.atk;
    this.state.player.hp -= dmg;
    this.audio.playSfx('hiss');
    this.showToast(`-${dmg} HP!`, 1500);
    if (this.state.player.hp <= 0) {
      this.playerDeath();
    }
    this.pushState();
  }

  gainXp(amount) {
    this.state.xp = (this.state.xp || 0) + amount;
    while (this.state.xp >= this.state.xpToNext) {
      this.state.xp -= this.state.xpToNext;
      this.state.level += 1;
      this.state.xpToNext = this.state.level * 50;
      this.state.strength += 1;
      this.state.player.maxHp = this.getPlayerMaxHp();
      this.state.player.hp = this.state.player.maxHp;
      this.audio.playSfx('bell');
      this.showToast(`✦ Level Up! Lv ${this.state.level} — HP & Strength increased!`, 5000);
    }
  }

  playerDeath() {
    this.showToast('You collapse... and wake in your bed the next morning. Half your supplies were lost in the delirium — but your clues and tools are safe.', 6000);
    // lose half of all supplies — keep clues, quest items, and equipment
    const protectedItems = new Set([
      'clue', 'antique', 'witch_tome', 'deer_antler_crown', 'vampire_blood',
      'iron_sword', 'steel_sword', 'ancient_blade', 'vampiric_sword', 'tommy_gun', 'handgun_1911',
      'leather_armor', 'iron_armor', 'ancient_armor', 'bait', 'premium_bait', 'tackle_box', 'waystone',
    ]);
    for (const id in this.state.inventory) {
      if (!protectedItems.has(id)) {
        this.state.inventory[id] = Math.floor((this.state.inventory[id] || 0) / 2);
      }
    }
    this.state.grottoFloor = 0;
    this.enemies = [];
    this.boss = null;
    // wake at home, then advance the day through endDay so crops, regrowth,
    // animals and seasons still tick — fromSleep=false skips mystery events
    this.state.player.hp = this.getPlayerMaxHp();
    this.transitionZone('home', 8, 11);
    this.endDay(false);
    this.pushState();
  }

  // ---- RENDER ----
  render() {
    this.renderer3d.render(this.state, this.zone, this.tiles, this.crops, this.ghosts, this.enemies, this.particles, this.atm, this.actionState, this.footprints, this.fishingState);
    // Play flee sounds for critters that just started running from the player
    if (this.renderer3d._critterFlees) {
      for (const ev of this.renderer3d._critterFlees) {
        const volume = Math.max(0.1, 1 - ev.dist / 6);
        this.audio.playCritterSound(ev.type, volume);
      }
      this.renderer3d._critterFlees = null;
    }
  }
}

// Renderer prototype patches install once at module scope — installing in the
// Game constructor grew the _buildTileObject wrapper chain every menu→play cycle
installFarmStructures(Renderer3D);
installExtraStructures(Renderer3D);
installTileDecor(Renderer3D);
installParticles(Game);
installActionPrompt(Game);
installNikkiCompanion(Game);
installCompanionTalk(Game);
installConsumables(Game);
installInteract(Game);
installBuildPreview(Game, Renderer3D);
installObjectVisuals(Renderer3D);
installTentacleMonument(Renderer3D); installNpcWander(Game);