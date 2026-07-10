// Core game constants, tile definitions, palettes, items, seasons

export const TILE = 16;          // logical pixel tile size
export const SCALE = 3;          // render scale
export const TILE_PX = TILE * SCALE; // 48px on screen

export const DAY_LENGTH = 840;   // seconds for a full in-game day (14 min real)
export const TIME_START = 360;   // 6:00 AM in minutes

// ---- Tile IDs ----
export const T = {
  GRASS: 1, DARK_GRASS: 2, SAND: 3, WATER: 4, DEEP_WATER: 5,
  PATH: 6, FLOOR: 7, WALL: 8, DOOR: 9, TREE: 10, TWISTED_TREE: 11,
  STONE: 12, RUIN: 13, MOSS: 14, FLOWER: 15, LANTERN_POST: 16,
  TILLED: 17, BUSH: 18, FENCE: 19, STONE_CIRCLE: 20, GRAVE: 21,
  DOCK: 22, LILY: 23, MUSHROOM: 24, PINE: 25, ROCK: 26, SIGN: 27,
  CRYSTAL: 28, WELL: 30, CAMPFIRE: 31, BRIDGE: 32, DARK_DIRT: 34,
  PEBBLE: 35, FALLEN_LOG: 36, RUG: 37, BED: 38, TABLE: 39, CHAIR: 40,
  CHEST: 41, STOVE: 42, WINDOW: 43, BOOKSHELF: 44, LANTERN_FLOOR: 45,
  PUMPKIN: 46, CANDLES: 47, PAINTING: 48, PLANT_POT: 49, CRATE: 50,
  BARREL: 51, ANVIL: 52, WORKBENCH: 53, GRAVESTONE: 54, STATUE: 55,
  STAIRS_DOWN: 60,
  STAIRS_UP: 61,
  GROTTO_CHEST: 62,
  CAVE: 63,
  OAK: 64, BIRCH: 65, WILLOW: 66, DEAD_TREE: 67,
  FERN: 68, TALL_GRASS: 69, BERRY_BUSH: 70, STUMP: 71,
  ROOF: 72, BENCH: 73,
  WITCH_TOME: 74, BONE_PILE: 75, SKULL_TOTEM: 76, HANGING_MOSS: 77, GRAVE_CROSS: 78, SPIDER_WEB: 79,
  SHIPWRECK: 100, WAYSTONE: 101, SURFACE_PORTAL: 102, COW: 103,
  POSTER: 80, PICTURE_FRAME: 81, TALL_PLANT: 82, HANGING_PLANT: 83,
  FLOWER_VASE: 84, FIREPLACE: 85, FLOOR_LAMP: 86, WALL_CLOCK: 87,
  MIRROR: 88, BOOK_STACK: 89, TRAPDOOR: 90,
  TENTACLE_STATUE: 91,
  // Farm & outdoor structures
  FENCE_GATE: 92, SCARECROW: 93, HAY_BALE: 94, CHICKEN_COOP: 95,
  FEED_TROUGH: 96, WINDMILL: 97, STONE_WALL: 98, FLOWER_BOX: 99,
  COBBLE: 104,
  BIG_TREE: 105,
  LIGHTHOUSE_KEY_CHEST: 106,
};

// solid = blocks movement, water = blocks land movement,
// door = transition, tilled = farmable soil
export const TILE_PROPS = {
  [T.GRASS]: { solid: false },
  [T.DARK_GRASS]: { solid: false },
  [T.SAND]: { solid: false },
  [T.WATER]: { solid: false, water: true },
  [T.DEEP_WATER]: { solid: false, water: true },
  [T.PATH]: { solid: false },
  [T.FLOOR]: { solid: false },
  [T.WALL]: { solid: true },
  [T.DOOR]: { solid: true, door: true },
  [T.TREE]: { solid: true },
  [T.TWISTED_TREE]: { solid: true },
  [T.PINE]: { solid: true },
  [T.STONE]: { solid: false },
  [T.COBBLE]: { solid: false },
  [T.RUIN]: { solid: true },
  [T.MOSS]: { solid: false },
  [T.FLOWER]: { solid: false },
  [T.LANTERN_POST]: { solid: false, light: true },
  [T.TILLED]: { solid: false, tilled: true },
  [T.BUSH]: { solid: true },
  [T.FENCE]: { solid: true },
  [T.STONE_CIRCLE]: { solid: true, light: true },
  [T.GRAVE]: { solid: true },
  [T.GRAVESTONE]: { solid: true },
  [T.DOCK]: { solid: false },
  [T.LILY]: { solid: false },
  [T.MUSHROOM]: { solid: false, gather: 'mushroom' },
  [T.PEBBLE]: { solid: false },
  [T.FALLEN_LOG]: { solid: true },
  [T.ROCK]: { solid: true, gather: 'stone' },
  [T.CRYSTAL]: { solid: true, light: true, gather: 'crystal' },
  [T.WELL]: { solid: true },
  [T.CAMPFIRE]: { solid: true, light: true },
  [T.BRIDGE]: { solid: false },
  [T.DARK_DIRT]: { solid: false },
  [T.RUG]: { solid: false },
  [T.BED]: { solid: true, interact: 'sleep' },
  [T.TABLE]: { solid: true },
  [T.CHAIR]: { solid: true },
  [T.CHEST]: { solid: true, interact: 'storage' },
  [T.STOVE]: { solid: true, light: true },
  [T.WINDOW]: { solid: true },
  [T.BOOKSHELF]: { solid: true },
  [T.LANTERN_FLOOR]: { solid: false, light: true },
  [T.PUMPKIN]: { solid: false, light: true },
  [T.CANDLES]: { solid: false, light: true },
  [T.PAINTING]: { solid: true },
  [T.PLANT_POT]: { solid: false },
  [T.CRATE]: { solid: true },
  [T.BARREL]: { solid: true },
  [T.ANVIL]: { solid: true },
  [T.WORKBENCH]: { solid: true, interact: 'craft' },
  [T.STATUE]: { solid: true, light: true },
  [T.STAIRS_DOWN]: { solid: false, interact: 'descend' },
  [T.STAIRS_UP]: { solid: false, interact: 'ascend' },
  [T.GROTTO_CHEST]: { solid: true, interact: 'grotto_prize' },
  [T.LIGHTHOUSE_KEY_CHEST]: { solid: true, interact: 'lighthouse_key' },
  [T.CAVE]: { solid: true },
  [T.OAK]: { solid: true },
  [T.BIRCH]: { solid: true },
  [T.WILLOW]: { solid: true },
  [T.DEAD_TREE]: { solid: true },
  [T.FERN]: { solid: false },
  [T.TALL_GRASS]: { solid: false },
  [T.BERRY_BUSH]: { solid: true, gather: 'berry' },
  [T.STUMP]: { solid: true },
  [T.ROOF]: { solid: true },
  [T.BENCH]: { solid: true },
  [T.WITCH_TOME]: { solid: true, interact: 'witch_tome' },
  [T.BONE_PILE]: { solid: true },
  [T.SKULL_TOTEM]: { solid: true, light: true },
  [T.HANGING_MOSS]: { solid: false },
  [T.GRAVE_CROSS]: { solid: true },
  [T.SPIDER_WEB]: { solid: false },
  [T.POSTER]: { solid: true },
  [T.PICTURE_FRAME]: { solid: true },
  [T.TALL_PLANT]: { solid: false },
  [T.HANGING_PLANT]: { solid: false },
  [T.FLOWER_VASE]: { solid: false },
  [T.FIREPLACE]: { solid: true, light: true },
  [T.FLOOR_LAMP]: { solid: false, light: true },
  [T.WALL_CLOCK]: { solid: true },
  [T.MIRROR]: { solid: true },
  [T.BOOK_STACK]: { solid: false },
  [T.TRAPDOOR]: { solid: true, interact: 'mayor_basement' },
  [T.TENTACLE_STATUE]: { solid: true, light: true },
  // Farm & outdoor structures
  [T.FENCE_GATE]: { solid: true },
  [T.SCARECROW]: { solid: true },
  [T.HAY_BALE]: { solid: true },
  [T.CHICKEN_COOP]: { solid: true, interact: 'collect_eggs' },
  [T.FEED_TROUGH]: { solid: true },
  [T.COW]: { solid: true, interact: 'collect_milk' },
  [T.WINDMILL]: { solid: true },
  [T.STONE_WALL]: { solid: true },
  [T.FLOWER_BOX]: { solid: false },
  [T.SHIPWRECK]: { solid: true },
  [T.WAYSTONE]: { solid: true, interact: 'waystone' },
  [T.SURFACE_PORTAL]: { solid: false, interact: 'surface_portal' },
  [T.BIG_TREE]: { solid: true },
};

// Palette: muted greens, deep blues, amber, purple fog, orange autumn
export const COLORS = {
  grass: ['#3a5a40', '#4a6a48', '#2f4a35'],
  darkGrass: ['#2c4530', '#36493a', '#243a28'],
  sand: ['#b09a72', '#c4ad7e', '#9a8460'],
  water: ['#2a4a6b', '#3a5a7b', '#1f3a55'],
  deepWater: ['#1c3450', '#26405e', '#152840'],
  path: ['#6b5d48', '#7a6b52', '#5c4f3d'],
  floor: ['#6b4e3a', '#5a4130', '#7a5d44'],
  wall: ['#3a2c22', '#4a3828', '#2c2018'],
  stone: ['#5a5a64', '#6a6a74', '#48484e'],
  ruin: ['#4a4650', '#5a5460', '#3a3640'],
  moss: ['#3a5a3a', '#446a44', '#2c4a2c'],
  tree: ['#2a3a2a', '#1f2f1f'],
  trunk: ['#3a2a1a', '#2a1f14'],
  pine: ['#1f3a2a', '#162a1f'],
  flower: ['#d4a5c0', '#c4b04a', '#a0a0d4'],
  lantern: ['#ffb04a', '#ff8a2a'],
  fog: 'rgba(120,110,150,0.10)',
  fogNight: 'rgba(80,70,120,0.22)',
  birch: ['#d4d4c8', '#c4c4b8', '#b4b4a8'],
  willow: ['#4a6a3a', '#3a5a2a', '#5a7a4a'],
  deadTree: ['#4a4038', '#3a3028', '#5a5048'],
  berry: ['#d44040', '#c03030'],
  fern: ['#3a6a3a', '#4a7a4a', '#2a5a2a'],
  roof: ['#3a2a1e', '#42302a', '#2a1a10'],
};

// ---- Items ----
export const ITEMS = {
  wood: { name: 'Wood', icon: '🪵', color: '#7a5a3a' },
  stone: { name: 'Stone', icon: '🪨', color: '#8a8a94' },
  fiber: { name: 'Fiber', icon: '🌾', color: '#b0a04a' },
  mushroom: { name: 'Mushroom', icon: '🍄', color: '#c08070' },
  berry: { name: 'Berry', icon: '🫐', color: '#5a4a8a' },
  fish_common: { name: 'Sardine', icon: '🐟', color: '#7a9ab0' },
  fish_rare: { name: 'Moonfish', icon: '🐠', color: '#a0b0e0' },
  fish_legend: { name: 'Ghost Eel', icon: '🐡', color: '#c0d0e0' },
  seed_pumpkin: { name: 'Pumpkin Seed', icon: '🌱', color: '#8aa050' },
  pumpkin: { name: 'Pumpkin', icon: '🎃', color: '#d4842a' },
  herb: { name: 'Herb', icon: '🌿', color: '#6a9a5a' },
  antique: { name: 'Antique', icon: '🏺', color: '#9a8a6a' },
  clue: { name: 'Clue', icon: '📜', color: '#c4b48a' },
  crystal: { name: 'Crystal', icon: '💎', color: '#8ac0e0' },
  coins: { name: 'Coins', icon: '🪙', color: '#d4a838' },
  iron: { name: 'Iron', icon: '⚙️', color: '#8a8a8a' },
  amulet: { name: 'Amulet', icon: '🔱', color: '#c0a0d0' },
  witch_tome: { name: 'Witch\'s Tome', icon: '📕', color: '#6a1a3a' },
  waystone: { name: 'Waystone', icon: '🪨', color: '#8a6acc' },
  lighthouse_key: { name: 'Lighthouse Key', icon: '🗝️', color: '#d4a838' },
  deer_antler_crown: { name: 'Deer Antler Crown', icon: '🦌', color: '#8a6a4a' },
  bait: { name: 'Bait', icon: '🪱', color: '#b08060' },
  premium_bait: { name: 'Premium Bait', icon: '🦐', color: '#e08060' },
  gus_bait: { name: "Gus's Lucky Bait", icon: '🪱', color: '#d4a838' },
  tackle_box: { name: 'Tackle Box', icon: '🧰', color: '#8a6a4a' },
  ruby: { name: 'Ruby', icon: '❤️', color: '#e02040' },
  sapphire: { name: 'Sapphire', icon: '💙', color: '#2040e0' },
  emerald: { name: 'Emerald', icon: '💚', color: '#20c040' },
  diamond: { name: 'Diamond', icon: '💎', color: '#e0f0ff' },
  amethyst: { name: 'Amethyst', icon: '🟣', color: '#a040c0' },
  gold_ore: { name: 'Gold Ore', icon: '🟡', color: '#d4a838' },
  vampire_blood: { name: 'Vampire Blood', icon: '🧛', color: '#8a1a1a' },
  vampiric_sword: { name: 'Vampiric Sword', icon: '🗡️', color: '#5a1a2a' },
  tommy_gun: { name: 'Tommy Gun', icon: '🔫', color: '#4a4a4a' },
  handgun_1911: { name: '1911 Handgun', icon: '🔫', color: '#3a3a3a' },
  egg: { name: 'Egg', icon: '🥚', color: '#e8d8a0' },
  milk: { name: 'Milk', icon: '🥛', color: '#f0f0e8' },
  // ── New crops ──
  corn: { name: 'Corn', icon: '🌽', color: '#d4a838' },
  potato: { name: 'Potato', icon: '🥔', color: '#b08a50' },
  tomato: { name: 'Tomato', icon: '🍅', color: '#c43030' },
  blueberry: { name: 'Blueberry', icon: '🫐', color: '#3a4a8a' },
  apple: { name: 'Apple', icon: '🍎', color: '#c02020' },
  peach: { name: 'Peach', icon: '🍑', color: '#e08860' },
  blackberry: { name: 'Blackberry', icon: '🟣', color: '#2a1a3a' },
  raspberry: { name: 'Raspberry', icon: '🔴', color: '#a02040' },
  lemon: { name: 'Lemon', icon: '🍋', color: '#d4c830' },
  lime: { name: 'Lime', icon: '🟢', color: '#8ac030' },
  avocado: { name: 'Avocado', icon: '🥑', color: '#4a6a30' },
  // ── Seeds for new crops ──
  seed_corn: { name: 'Corn Seed', icon: '🌱', color: '#d4a838' },
  seed_potato: { name: 'Potato Seed', icon: '🌱', color: '#b08a50' },
  seed_tomato: { name: 'Tomato Seed', icon: '🌱', color: '#c43030' },
  seed_blueberry: { name: 'Blueberry Seed', icon: '🌱', color: '#3a4a8a' },
  seed_apple: { name: 'Apple Seed', icon: '🌱', color: '#c02020' },
  seed_peach: { name: 'Peach Seed', icon: '🌱', color: '#e08860' },
  seed_blackberry: { name: 'Blackberry Seed', icon: '🌱', color: '#2a1a3a' },
  seed_raspberry: { name: 'Raspberry Seed', icon: '🌱', color: '#a02040' },
  seed_lemon: { name: 'Lemon Seed', icon: '🌱', color: '#d4c830' },
  seed_lime: { name: 'Lime Seed', icon: '🌱', color: '#8ac030' },
  seed_avocado: { name: 'Avocado Seed', icon: '🌱', color: '#4a6a30' },
};

// ---- Tools (hotbar) ----
export const TOOLS = [
  { id: 'hands', name: 'Hands', icon: '✋', desc: 'Gather & interact' },
  { id: 'axe', name: 'Axe', icon: '🪓', desc: 'Chop trees' },
  { id: 'hoe', name: 'Hoe', icon: '🛠️', desc: 'Till soil' },
  { id: 'watering_can', name: 'Watering Can', icon: '🚿', desc: 'Water crops' },
  { id: 'fishing_rod', name: 'Fishing Rod', icon: '🎣', desc: 'Catch fish' },
  { id: 'pickaxe', name: 'Pickaxe', icon: '⛏️', desc: 'Mine rocks' },
  { id: 'sword', name: 'Sword', icon: '⚔️', desc: 'Fight enemies' },
  { id: 'shovel', name: 'Shovel', icon: '🪏', desc: 'Dig & clear' },
  { id: 'hammer', name: 'Hammer', icon: '🔨', desc: 'Build furniture' },
  { id: 'lantern', name: 'Lantern', icon: '🏮', desc: 'Light the way' },
];

// ---- Seasons ----
export const SEASONS = ['autumn', 'winter', 'spring', 'summer'];
export const SEASON_LEAVES = {
  autumn: '#c47a2a',
  winter: '#c0d0e0',
  spring: '#7ab04a',
  summer: '#4a8a3a',
};

// ---- Zones ----
export const ZONE_DEFS = {
  shore: { name: 'Shipwreck Shore', w: 44, h: 34, fog: 0.5, fireflies: true },
  cabin_woods: { name: 'Whispering Woods', w: 40, h: 34, fog: 0.7, fireflies: true },
  home: { name: 'The Cabin', w: 18, h: 14, interior: true, fog: 0 },
  haunted_forest: { name: 'Haunted Forest', w: 46, h: 38, fog: 0.85, fireflies: true },
  town: { name: 'Pinebrook Town', w: 44, h: 34, fog: 0.5, fireflies: true },
  store: { name: 'General Store', w: 14, h: 12, interior: true, fog: 0 },
  mayors: { name: "Mayor's Office", w: 14, h: 12, interior: true, fog: 0 },
  mayors_basement: { name: "Mayor's Basement", w: 14, h: 12, interior: true, fog: 0 },
  nikki_basement: { name: "Nikki's Basement", w: 14, h: 12, interior: true, fog: 0 },
  saloon: { name: 'Old Saloon', w: 16, h: 12, interior: true, fog: 0 },
  fishmarket: { name: 'Fish Market', w: 16, h: 12, interior: true, fog: 0 },
  patricia: { name: "Patricia's Cottage", w: 14, h: 12, interior: true, fog: 0 },
  townhouse1: { name: 'Town House', w: 12, h: 10, interior: true, fog: 0 },
  townhouse2: { name: 'Town House', w: 12, h: 10, interior: true, fog: 0 },
  cottage_rowan: { name: "Rowan's Workshop", w: 14, h: 12, interior: true, fog: 0 },
  cottage_willow: { name: "Willow's Garden", w: 14, h: 12, interior: true, fog: 0 },
  cottage_finn: { name: "Finn's Boathouse", w: 14, h: 12, interior: true, fog: 0 },
  cottage_luna: { name: "Luna's Tower", w: 14, h: 12, interior: true, fog: 0 },
  cottage_dante: { name: "Dante's Studio", w: 14, h: 12, interior: true, fog: 0 },
  grotto: { name: 'The Grotto', w: 24, h: 18, fog: 0.3, fireflies: false, interior: true },
  lighthouse: { name: 'The Lighthouse', w: 30, h: 30, fog: 0.85, fireflies: true },
  spooky_shores: { name: 'Spooky Shores', w: 46, h: 38, fog: 0.9, fireflies: true },
  shaman_dungeon: { name: 'Shaman\'s Crypt', w: 22, h: 18, fog: 0.3, fireflies: false, interior: true },
};

// Zones where fishing is allowed
export const FISHING_ZONES = ['shore', 'cabin_woods', 'haunted_forest'];

// ---- Buildable furniture (base building) ----
export const BUILDABLES = [
  { id: 'table', tile: T.TABLE, name: 'Table', cost: { wood: 4 } },
  { id: 'chair', tile: T.CHAIR, name: 'Chair', cost: { wood: 2 } },
  { id: 'chest', tile: T.CHEST, name: 'Chest', cost: { wood: 6 } },
  { id: 'bed', tile: T.BED, name: 'Bed', cost: { wood: 8, fiber: 4 } },
  { id: 'stove', tile: T.STOVE, name: 'Stove', cost: { stone: 6, wood: 2 } },
  { id: 'bookshelf', tile: T.BOOKSHELF, name: 'Bookshelf', cost: { wood: 6 } },
  { id: 'lantern_floor', tile: T.LANTERN_FLOOR, name: 'Lantern', cost: { wood: 2, fiber: 1 } },
  { id: 'pumpkin', tile: T.PUMPKIN, name: 'Jack-o-Lantern', cost: { pumpkin: 1 } },
  { id: 'candles', tile: T.CANDLES, name: 'Candles', cost: { fiber: 2 } },
  { id: 'plant_pot', tile: T.PLANT_POT, name: 'Plant Pot', cost: { stone: 3 } },
  { id: 'crate', tile: T.CRATE, name: 'Crate', cost: { wood: 3 } },
  { id: 'barrel', tile: T.BARREL, name: 'Barrel', cost: { wood: 4 } },
  { id: 'workbench', tile: T.WORKBENCH, name: 'Workbench', cost: { wood: 8, stone: 4 } },
  { id: 'rug', tile: T.RUG, name: 'Rug', cost: { fiber: 6 } },
  { id: 'painting', tile: T.PAINTING, name: 'Painting', cost: { wood: 4, fiber: 2 } },
  { id: 'poster', tile: T.POSTER, name: 'Poster', cost: { wood: 2, fiber: 1 } },
  { id: 'picture_frame', tile: T.PICTURE_FRAME, name: 'Picture Frame', cost: { wood: 3 } },
  { id: 'tall_plant', tile: T.TALL_PLANT, name: 'Tall Plant', cost: { wood: 1, fiber: 2 } },
  { id: 'hanging_plant', tile: T.HANGING_PLANT, name: 'Hanging Plant', cost: { fiber: 3 } },
  { id: 'flower_vase', tile: T.FLOWER_VASE, name: 'Flower Vase', cost: { stone: 2, fiber: 1 } },
  { id: 'fireplace', tile: T.FIREPLACE, name: 'Fireplace', cost: { stone: 10, wood: 4 } },
  { id: 'floor_lamp', tile: T.FLOOR_LAMP, name: 'Floor Lamp', cost: { wood: 3, fiber: 2 } },
  { id: 'wall_clock', tile: T.WALL_CLOCK, name: 'Wall Clock', cost: { wood: 4 } },
  { id: 'mirror', tile: T.MIRROR, name: 'Mirror', cost: { stone: 4, wood: 2 } },
  { id: 'book_stack', tile: T.BOOK_STACK, name: 'Book Stack', cost: { wood: 2, fiber: 1 } },
  // ── Farm & outdoor structures ──
  { id: 'fence', tile: T.FENCE, name: 'Wooden Fence', cost: { wood: 2 } },
  { id: 'fence_gate', tile: T.FENCE_GATE, name: 'Fence Gate', cost: { wood: 3 } },
  { id: 'stone_wall', tile: T.STONE_WALL, name: 'Stone Wall', cost: { stone: 4 } },
  { id: 'scarecrow', tile: T.SCARECROW, name: 'Scarecrow', cost: { wood: 3, fiber: 2 } },
  { id: 'hay_bale', tile: T.HAY_BALE, name: 'Hay Bale', cost: { fiber: 4 } },
  { id: 'chicken_coop', tile: T.CHICKEN_COOP, name: 'Chicken Coop', cost: { wood: 10, fiber: 2 } },
  { id: 'cow', tile: T.COW, name: 'Cow Pasture', cost: { wood: 15, fiber: 5 } },
  { id: 'feed_trough', tile: T.FEED_TROUGH, name: 'Feed Trough', cost: { wood: 5 } },
  { id: 'windmill', tile: T.WINDMILL, name: 'Windmill', cost: { wood: 15, stone: 5, fiber: 3 } },
  { id: 'flower_box', tile: T.FLOWER_BOX, name: 'Flower Box', cost: { wood: 2, fiber: 1 } },
];

export const SALOON_RESTORE_COST = { wood: 20, stone: 15, fiber: 8 };

export const SEEDS = [
  { id: 'seed_pumpkin', crop: 'pumpkin', growDays: 2, yield: 'pumpkin' },
  { id: 'seed_corn', crop: 'corn', growDays: 2, yield: 'corn' },
  { id: 'seed_potato', crop: 'potato', growDays: 2, yield: 'potato' },
  { id: 'seed_tomato', crop: 'tomato', growDays: 2, yield: 'tomato' },
  { id: 'seed_blueberry', crop: 'blueberry', growDays: 3, yield: 'blueberry' },
  { id: 'seed_apple', crop: 'apple', growDays: 3, yield: 'apple' },
  { id: 'seed_peach', crop: 'peach', growDays: 3, yield: 'peach' },
  { id: 'seed_blackberry', crop: 'blackberry', growDays: 2, yield: 'blackberry' },
  { id: 'seed_raspberry', crop: 'raspberry', growDays: 2, yield: 'raspberry' },
  { id: 'seed_lemon', crop: 'lemon', growDays: 4, yield: 'lemon' },
  { id: 'seed_lime', crop: 'lime', growDays: 4, yield: 'lime' },
  { id: 'seed_avocado', crop: 'avocado', growDays: 4, yield: 'avocado' },
];

// Crops mature after their seed's growDays watered days
export function cropMature(ov) { return ov.cropStage >= (ov.growDays || 2); }
// Map growth progress onto the renderer's 3 visual stages (sprout/bush/fruiting)
export function cropVisualStage(ov) {
  if (cropMature(ov)) return 2;
  return ov.cropStage >= (ov.growDays || 2) / 2 ? 1 : 0;
}

// ---- Shop: sell prices (coins per item) ----
export const SELL_PRICES = {
  fish_common: 5, fish_rare: 15, fish_legend: 50,
  pumpkin: 8, mushroom: 3, antique: 25, herb: 4,
  crystal: 30, wood: 1, stone: 1, fiber: 1, iron: 5, berry: 2,
  ruby: 80, sapphire: 60, emerald: 100, diamond: 200, amethyst: 50, gold_ore: 40,
  egg: 5, milk: 10,
  corn: 6, potato: 4, tomato: 5, blueberry: 8, apple: 7, peach: 8,
  blackberry: 6, raspberry: 6, lemon: 10, lime: 10, avocado: 12,
};

// Consumable items — eating/drinking restores HP
export const CONSUMABLES = {
  egg: { hp: 15, energy: 20, name: 'Egg', verb: 'Ate' },
  milk: { hp: 25, energy: 30, name: 'Milk', verb: 'Drank' },
  pumpkin: { hp: 12, energy: 15, name: 'Pumpkin', verb: 'Ate' },
  mushroom: { hp: 5, energy: 5, name: 'Mushroom', verb: 'Ate' },
  berry: { hp: 4, energy: 6, name: 'Berry', verb: 'Ate' },
  herb: { hp: 8, energy: 5, name: 'Herb', verb: 'Ate' },
  corn: { hp: 10, energy: 15, name: 'Corn', verb: 'Ate' },
  potato: { hp: 15, energy: 20, name: 'Potato', verb: 'Ate' },
  tomato: { hp: 8, energy: 10, name: 'Tomato', verb: 'Ate' },
  blueberry: { hp: 5, energy: 8, name: 'Blueberry', verb: 'Ate' },
  apple: { hp: 8, energy: 12, name: 'Apple', verb: 'Ate' },
  peach: { hp: 10, energy: 12, name: 'Peach', verb: 'Ate' },
  blackberry: { hp: 6, energy: 8, name: 'Blackberry', verb: 'Ate' },
  raspberry: { hp: 6, energy: 8, name: 'Raspberry', verb: 'Ate' },
  lemon: { hp: 5, energy: 15, name: 'Lemon', verb: 'Ate' },
  lime: { hp: 5, energy: 15, name: 'Lime', verb: 'Ate' },
  avocado: { hp: 20, energy: 25, name: 'Avocado', verb: 'Ate' },
};

// ---- Shop: buyable items ----
export const SHOP_ITEMS = [
  { id: 'seed_pumpkin', name: 'Pumpkin Seeds', icon: '🌱', price: 3, category: 'supplies' },
  { id: 'fiber', name: 'Fiber Bundle', icon: '🌾', price: 2, category: 'supplies' },
  { id: 'wood', name: 'Wood Plank', icon: '🪵', price: 2, category: 'supplies' },
  { id: 'stone', name: 'Stone Block', icon: '🪨', price: 2, category: 'supplies' },
  { id: 'seed_corn', name: 'Corn Seeds', icon: '🌱', price: 4, category: 'supplies' },
  { id: 'seed_potato', name: 'Potato Seeds', icon: '🌱', price: 4, category: 'supplies' },
  { id: 'seed_tomato', name: 'Tomato Seeds', icon: '🌱', price: 4, category: 'supplies' },
  { id: 'seed_blueberry', name: 'Blueberry Seeds', icon: '🌱', price: 6, category: 'supplies' },
  { id: 'seed_apple', name: 'Apple Seeds', icon: '🌱', price: 6, category: 'supplies' },
  { id: 'seed_peach', name: 'Peach Seeds', icon: '🌱', price: 6, category: 'supplies' },
  { id: 'seed_blackberry', name: 'Blackberry Seeds', icon: '🌱', price: 5, category: 'supplies' },
  { id: 'seed_raspberry', name: 'Raspberry Seeds', icon: '🌱', price: 5, category: 'supplies' },
  { id: 'seed_lemon', name: 'Lemon Seeds', icon: '🌱', price: 8, category: 'supplies' },
  { id: 'seed_lime', name: 'Lime Seeds', icon: '🌱', price: 8, category: 'supplies' },
  { id: 'seed_avocado', name: 'Avocado Seeds', icon: '🌱', price: 10, category: 'supplies' },
  // Weapons — increase attack power
  { id: 'iron_sword', name: 'Iron Sword', icon: '🗡️', price: 50, category: 'weapons', attack: 8, desc: '+8 Attack' },
  { id: 'steel_sword', name: 'Steel Sword', icon: '⚔️', price: 150, category: 'weapons', attack: 15, desc: '+15 Attack' },
  { id: 'ancient_blade', name: 'Ancient Blade', icon: '🔮', price: 400, category: 'weapons', attack: 30, desc: '+30 Attack' },
  // Armor — increases max HP
  { id: 'leather_armor', name: 'Leather Armor', icon: '🦺', price: 40, category: 'armor', defense: 20, desc: '+20 Max HP' },
  { id: 'iron_armor', name: 'Iron Armor', icon: '🛡️', price: 120, category: 'armor', defense: 40, desc: '+40 Max HP' },
  { id: 'ancient_armor', name: 'Ancient Armor', icon: '✨', price: 350, category: 'armor', defense: 80, desc: '+80 Max HP' },
];

// ---- Fishing shop: Bait Betty's tackle shop ----
export const FISHING_SHOP_ITEMS = [
  { id: 'bait', name: 'Bait', icon: '🪱', price: 3, category: 'fishing', desc: '+50% catch zone' },
  { id: 'premium_bait', name: 'Premium Bait', icon: '🦐', price: 8, category: 'fishing', desc: '2× catch zone' },
  { id: 'tackle_box', name: 'Tackle Box', icon: '🧰', price: 25, category: 'fishing', desc: '+10% fish sell value' },
];

// Equipment stats lookup
export const WEAPONS = {
  iron_sword: { attack: 8 },
  steel_sword: { attack: 15 },
  ancient_blade: { attack: 30 },
  handgun_1911: { attack: 60 },
  tommy_gun: { attack: 120 },
  vampiric_sword: { attack: 80 },
};
export const ARMOR = {
  leather_armor: { defense: 20 },
  iron_armor: { defense: 40 },
  ancient_armor: { defense: 80 },
};

// ---- Saloon: buyable drinks & Gus's exclusive wares ----
export const SALOON_ITEMS = [
  { id: 'hot_cider', name: 'Hot Cider', icon: '🍺', price: 8, desc: '+50 Energy', effect: 'energy' },
  { id: 'health_tonic', name: 'Health Tonic', icon: '🧪', price: 12, desc: 'Full HP', effect: 'heal' },
  { id: 'courage_ale', name: 'Courage Ale', icon: '🍻', price: 25, desc: '+1 Strength', effect: 'strength' },
  { id: 'iron_moonshine', name: 'Iron Gut Moonshine', icon: '🍶', price: 40, desc: '+10 Max HP', effect: 'maxhp' },
  { id: 'witchs_brew', name: "Witch's Brew", icon: '⚗️', price: 35, desc: '+5 Attack (today)', effect: 'tempattack' },
  // ── Gus's exclusive wares — only available at the saloon ──
  { id: 'gus_lucky_bait', name: "Gus's Lucky Bait", icon: '🪱', price: 15, desc: '3× catch zone', effect: 'item_bait' },
  { id: 'prospectors_tonic', name: "Prospector's Tonic", icon: '☕', price: 75, desc: 'Yields 2 crystals', effect: 'item_crystal' },
  { id: 'saloon_stew', name: 'Saloon Stew', icon: '🍲', price: 10, desc: 'Food bundle', effect: 'item_food' },
  { id: 'fogwalker_reserve', name: "Fogwalker's Reserve", icon: '🥃', price: 30, desc: 'Full energy +5 Atk', effect: 'fogwalker' },
];

// ---- Crafting recipes (at the workbench) ----
export const CRAFT_RECIPES = [
  // Weapons
  { id: 'iron_sword', name: 'Iron Sword', icon: '🗡️', category: 'weapons', result: 'iron_sword',
    cost: { iron: 5, wood: 5 }, desc: '+8 Attack when equipped' },
  { id: 'steel_sword', name: 'Steel Sword', icon: '⚔️', category: 'weapons', result: 'steel_sword',
    cost: { iron: 10, crystal: 3 }, desc: '+15 Attack when equipped' },
  { id: 'ancient_blade', name: 'Ancient Blade', icon: '🔮', category: 'weapons', result: 'ancient_blade',
    cost: { crystal: 5, iron: 3, antique: 1 }, desc: '+30 Attack when equipped' },
  // Armor
  { id: 'leather_armor', name: 'Leather Armor', icon: '🦺', category: 'armor', result: 'leather_armor',
    cost: { fiber: 10, wood: 5 }, desc: '+20 Max HP when equipped' },
  { id: 'iron_armor', name: 'Iron Armor', icon: '🛡️', category: 'armor', result: 'iron_armor',
    cost: { iron: 8, fiber: 5 }, desc: '+40 Max HP when equipped' },
  { id: 'ancient_armor', name: 'Ancient Armor', icon: '✨', category: 'armor', result: 'ancient_armor',
    cost: { crystal: 5, iron: 3, antique: 2 }, desc: '+80 Max HP when equipped' },
  // Fishing gear
  { id: 'bait', name: 'Bait', icon: '🪱', category: 'fishing', result: 'bait',
    cost: { fiber: 2 }, desc: '+50% catch zone when fishing' },
  { id: 'premium_bait', name: 'Premium Bait', icon: '🦐', category: 'fishing', result: 'premium_bait',
    cost: { mushroom: 1, berry: 1 }, desc: '2× catch zone when fishing' },
  { id: 'tackle_box', name: 'Tackle Box', icon: '🧰', category: 'fishing', result: 'tackle_box',
    cost: { wood: 5, iron: 3 }, desc: '+10% fish sell value (passive)' },
];

// ---- Grotto prizes (every 10th floor) ----
export const GROTTO_PRIZE_NAMES = [
  'Iron Grip', 'Forest Vitality', 'Deep Resolve', 'Steady Hands',
  'Island Toughness', 'Ancient Vigor', 'Watcher\'s Blessing',
  'Rooted Strength', 'Tidal Endurance', 'Eternal Flame',
];
export function getGrottoPrize(floor) {
  const tier = floor / 10;
  const name = GROTTO_PRIZE_NAMES[Math.min(tier - 1, GROTTO_PRIZE_NAMES.length - 1)];
  return { floor, name, strength: tier, text: `You found a relic: ${name}! +${tier} Strength` };
}

// Mystery events that occur overnight
export const MYSTERY_EVENTS = [
  { id: 'footprints', text: 'Strange wet footprints appeared by the door overnight.' },
  { id: 'lantern_lit', text: 'The lantern outside was lit, though no one was here.' },
  { id: 'furniture_moved', text: 'A chair had moved across the room while you slept.' },
  { id: 'bells', text: 'You heard bells ringing from the old church at midnight.' },
  { id: 'symbols', text: 'Unfamiliar symbols were scratched onto a stone this morning.' },
  { id: 'figure', text: 'A pale figure stood at the tree line, then was gone.' },
  { id: 'voices', text: 'Soft voices drifted through the fog, speaking a name you almost knew.' },
  { id: 'warmth', text: 'The stove was still warm in the morning, though you did not light it.' },
];

export function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}