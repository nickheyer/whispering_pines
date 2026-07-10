// Interior building generators — cozy, spooky, lived-in spaces
import { T } from './constants';

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

function rect(tiles, x0, y0, x1, y1, t, w, h) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      tiles[y][x] = t;
    }
}

// ---- THE CABIN (player's home — luxurious rustic retreat) ----
export function genInterior(tiles, w, h, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);

  // ── Large central rug — anchors the whole living space ──
  rect(tiles, cx - 4, cy - 3, cx + 4, cy + 3, T.RUG, w, h);

  // ── Windows — framed with warmth on all three walls ──
  tiles[0][cx] = T.WINDOW;
  tiles[0][3] = T.WINDOW;
  tiles[0][w - 4] = T.WINDOW;

  // ── Gallery wall (left) — alternating paintings & framed art ──
  tiles[3][1] = T.PAINTING;
  tiles[5][1] = T.PICTURE_FRAME;
  tiles[7][1] = T.PAINTING;
  tiles[9][1] = T.MIRROR;

  // ── Gallery wall (right) — grand mirror, paintings, clock ──
  tiles[3][w - 2] = T.MIRROR;
  tiles[5][w - 2] = T.PAINTING;
  tiles[7][w - 2] = T.PICTURE_FRAME;
  tiles[1][cx - 3] = T.WALL_CLOCK;
  tiles[1][cx + 3] = T.PAINTING;

  // ── Master bedroom corner — luxurious bed flanked by candles & flowers ──
  tiles[2][2] = T.BED;
  tiles[3][2] = T.LANTERN_FLOOR;
  tiles[2][3] = T.CANDLES;
  tiles[2][4] = T.FLOWER_VASE;
  tiles[4][2] = T.TALL_PLANT;
  tiles[4][4] = T.FLOOR_LAMP;
  tiles[3][4] = T.FLOWER_VASE;

  // ── Library nook (right) — floor-to-ceiling bookshelves with reading chair ──
  tiles[2][w - 3] = T.BOOKSHELF;
  tiles[3][w - 3] = T.BOOKSHELF;
  tiles[4][w - 3] = T.BOOKSHELF;
  tiles[5][w - 3] = T.BOOKSHELF;
  tiles[4][w - 4] = T.BOOK_STACK;
  tiles[5][w - 4] = T.CHAIR;
  tiles[4][w - 5] = T.FLOOR_LAMP;
  tiles[5][w - 5] = T.CANDLES;
  tiles[2][w - 5] = T.HANGING_PLANT;
  tiles[3][w - 4] = T.FLOWER_VASE;

  // ── Grand stone fireplace — the warm heart of the cabin, centered on back wall ──
  tiles[h - 3][cx - 3] = T.FIREPLACE;
  tiles[h - 4][cx - 4] = T.PAINTING;   // art above the fireside
  tiles[h - 4][cx - 2] = T.PICTURE_FRAME;
  tiles[h - 2][cx - 4] = T.TALL_PLANT;
  tiles[h - 2][cx - 2] = T.FLOWER_VASE;

  // ── Fireside bench — cozy seating beside the hearth ──
  tiles[h - 3][cx + 2] = T.BENCH;
  tiles[h - 2][cx + 3] = T.LANTERN_FLOOR;
  tiles[h - 2][cx + 4] = T.TALL_PLANT;

  // ── Formal dining table — candlelit, vase centerpiece, flower accents ──
  tiles[cy][cx] = T.TABLE;
  tiles[cy + 1][cx] = T.CHAIR;
  tiles[cy - 1][cx] = T.CHAIR;
  tiles[cy][cx - 1] = T.CHAIR;
  tiles[cy][cx + 1] = T.CHAIR;
  tiles[cy - 1][cx - 1] = T.CANDLES;
  tiles[cy + 1][cx - 1] = T.FLOWER_VASE;
  tiles[cy + 1][cx + 1] = T.FLOWER_VASE;
  tiles[cy - 1][cx + 1] = T.FLOWER_VASE;

  // ── Ambient lighting — warm lanterns and candles throughout ──
  tiles[2][cx] = T.FLOOR_LAMP;
  tiles[cy - 2][cx - 4] = T.LANTERN_FLOOR;
  tiles[cy - 2][cx + 4] = T.LANTERN_FLOOR;
  tiles[cy + 2][cx - 3] = T.CANDLES;
  tiles[cy + 2][cx + 3] = T.CANDLES;
  tiles[1][cx] = T.LANTERN_FLOOR;

  // ── Gourmet kitchen — stove, pantry barrels, flower box, herb plants ──
  tiles[h - 3][2] = T.STOVE;
  tiles[h - 4][2] = T.PAINTING;         // kitchen art
  tiles[h - 3][3] = T.CRATE;
  tiles[h - 4][3] = T.BARREL;
  tiles[h - 3][4] = T.LANTERN_FLOOR;
  tiles[h - 2][2] = T.PLANT_POT;
  tiles[h - 2][3] = T.FLOWER_VASE;
  tiles[h - 2][4] = T.FLOWER_BOX;

  // ── Crafting & storage corner — workbench, dual chests, organized crates ──
  tiles[h - 4][w - 3] = T.CHEST;
  tiles[h - 3][w - 3] = T.CHEST;
  tiles[h - 3][w - 4] = T.WORKBENCH;
  tiles[h - 4][w - 4] = T.BARREL;
  tiles[h - 3][w - 5] = T.CRATE;
  tiles[h - 4][w - 5] = T.LANTERN_FLOOR;
  tiles[h - 2][w - 3] = T.HANGING_PLANT;

  // ── Entryway decor — welcoming touches by the door ──
  tiles[h - 2][cx - 1] = T.FLOWER_VASE;
  tiles[h - 2][cx + 1] = T.FLOWER_VASE;
  tiles[cy + 2][cx] = T.BOOK_STACK;
  tiles[1][cx - 1] = T.HANGING_PLANT;
  tiles[1][cx + 1] = T.HANGING_PLANT;

  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'cabin_woods', targetX: 9, targetY: 11 });
}

// ---- GENERAL STORE ----
export function genStore(tiles, w, h, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  // windows
  tiles[0][3] = T.WINDOW;
  tiles[0][cx] = T.WINDOW;
  tiles[0][w - 4] = T.WINDOW;

  // shop counter
  tiles[h - 4][cx - 2] = T.TABLE;
  tiles[h - 4][cx - 1] = T.TABLE;
  tiles[h - 4][cx] = T.TABLE;
  tiles[h - 3][cx - 1] = T.CHAIR;

  // shelves along walls
  tiles[2][2] = T.BOOKSHELF;
  tiles[3][2] = T.BOOKSHELF;
  tiles[2][3] = T.CRATE;
  tiles[3][3] = T.BARREL;
  tiles[2][w - 3] = T.BOOKSHELF;
  tiles[3][w - 3] = T.BOOKSHELF;
  tiles[2][w - 4] = T.BARREL;
  tiles[3][w - 4] = T.CRATE;

  // lanterns
  tiles[2][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][2] = T.LANTERN_FLOOR;
  tiles[h - 3][w - 3] = T.LANTERN_FLOOR;
  tiles[h - 2][cx - 2] = T.PUMPKIN;
  tiles[h - 2][cx + 2] = T.PUMPKIN;

  // painting
  tiles[h - 4][1] = T.PAINTING;
  tiles[h - 4][w - 2] = T.PAINTING;

  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'town', targetX: 22, targetY: 9 });
}

// ---- MAYOR'S OFFICE ----
export function genMayors(tiles, w, h, doors, r, cycle = 1) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  tiles[0][3] = T.WINDOW;
  tiles[0][cx] = T.WINDOW;
  tiles[0][w - 4] = T.WINDOW;

  // mayor's desk
  tiles[4][cx - 1] = T.TABLE;
  tiles[4][cx] = T.TABLE;
  tiles[5][cx] = T.CHAIR;
  tiles[3][cx - 1] = T.CHEST;

  // bookshelves
  tiles[2][2] = T.BOOKSHELF;
  tiles[3][2] = T.BOOKSHELF;
  tiles[2][w - 3] = T.BOOKSHELF;
  tiles[3][w - 3] = T.BOOKSHELF;

  // rug
  rect(tiles, cx - 2, 5, cx + 2, h - 4, T.RUG, w, h);

  // decor
  tiles[h - 4][1] = T.PAINTING;
  tiles[h - 4][w - 2] = T.PAINTING;
  tiles[h - 3][2] = T.PLANT_POT;
  tiles[h - 3][w - 3] = T.PLANT_POT;
  tiles[2][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][cx] = T.LANTERN_FLOOR;

  // hidden trapdoor beneath the rug — leads to the mayor's basement
  tiles[h - 5][cx] = T.TRAPDOOR;

  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'town', targetX: 33, targetY: 14 });
}

// ---- MAYOR'S BASEMENT (hidden laboratory — Easter egg) ----
export function genMayorsBasement(tiles, w, h, doors, r, objects) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.DARK_DIRT, w, h);
  rect(tiles, 2, 2, w - 3, h - 3, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  // operating table — where the mayor "works" on his son
  tiles[5][cx - 1] = T.TABLE;
  tiles[5][cx] = T.TABLE;
  tiles[5][cx + 1] = T.TABLE;

  // lab apparatus along the walls
  tiles[2][2] = T.STOVE;
  tiles[2][3] = T.CRYSTAL;
  tiles[3][2] = T.BOOKSHELF;
  tiles[2][w - 3] = T.WORKBENCH;
  tiles[2][w - 4] = T.BARREL;

  // bone piles — remnants of "donors"
  tiles[h - 3][w - 3] = T.BONE_PILE;
  tiles[h - 4][w - 2] = T.BONE_PILE;

  // candles — eerie operating light
  tiles[4][cx] = T.CANDLES;
  tiles[h - 4][cx] = T.CANDLES;

  // skull totem — macabre trophy
  tiles[h - 3][2] = T.SKULL_TOTEM;

  // floor lanterns
  tiles[3][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][cx] = T.LANTERN_FLOOR;

  // door back up to the mayor's office
  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'mayors', targetX: cx, targetY: h - 4 });

  // ── Lore objects ──
  objects.push({ x: cx, y: 5, type: 'lore', collected: false,
    text: 'A sheet-draped figure lies on the table. Beneath the cloth: the small body of a child. The arms end in hands that don\'t match — one is larger, from a grown man. The stitching is crude but recent.' });
  objects.push({ x: 2, y: 3, type: 'lore', collected: false,
    text: 'A journal, open to a faded page: "My Thomas. The fever took him three winters ago. But the island gives back what it takes, if you know how to ask. I will not let my boy stay dead."' });
  objects.push({ x: 2, y: 4, type: 'lore', collected: false,
    text: 'A later entry, in a shakier hand: "The island demands flesh for flesh. Travelers wash ashore — gifts, sent by the tide. Thomas needs new hands. His own are too far gone. The saloon keeper\'s wife had such fine, strong hands."' });
  objects.push({ x: w - 3, y: 2, type: 'lore', collected: false,
    text: 'Medical notes annotated with occult symbols: "The galvanic apparatus is nearly complete. The crystal provides the spark. Three attempts have failed — the body rejects foreign parts. But the next visitor will be the right one."' });
  objects.push({ x: w - 3, y: h - 3, type: 'lore', collected: false,
    text: 'A list of names, each crossed out: "Margaret Vale. Thomas Brewer. Old Eli. The fisherman\'s boy." At the bottom, in fresh ink: "The new arrival — washed ashore. The island sent them. They will be perfect."' });
}

// ---- NIKKI'S BASEMENT (cycle 2 kidnapping lair) ----
// A damp cellar where Nikki keeps the partner she stole — coffin, candles,
// a shrine to the player. Door back up to the haunted forest.
export function genNikkiBasement(tiles, w, h, doors, r, objects) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.DARK_DIRT, w, h);
  rect(tiles, 2, 2, w - 3, h - 3, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  // coffin in the center — where Nikki keeps her "guest"
  tiles[6][cx - 1] = T.BED;
  tiles[6][cx] = T.BED;

  // vigil candles around the coffin
  tiles[5][cx - 2] = T.CANDLES;
  tiles[5][cx + 1] = T.CANDLES;
  tiles[7][cx - 2] = T.CANDLES;
  tiles[7][cx + 1] = T.CANDLES;

  // shrine to the player — skull totem flanked by flowers
  tiles[3][cx] = T.SKULL_TOTEM;
  tiles[3][cx - 2] = T.FLOWER;
  tiles[3][cx + 2] = T.FLOWER;
  tiles[2][cx] = T.HANGING_MOSS;

  // collected keepsakes along the walls
  tiles[2][2] = T.CRATE;
  tiles[3][2] = T.BARREL;
  tiles[2][w - 3] = T.CRATE;
  tiles[3][w - 3] = T.BARREL;

  // remnants of... others
  tiles[h - 3][2] = T.BONE_PILE;
  tiles[h - 3][w - 3] = T.BONE_PILE;

  // floor lanterns — dim, damp light
  tiles[4][cx - 3] = T.LANTERN_FLOOR;
  tiles[h - 3][cx + 3] = T.LANTERN_FLOOR;

  // door back up to the haunted forest
  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'haunted_forest', targetX: 44, targetY: 4 });

  // lore objects — Nikki's obsession made manifest
  objects.push({ x: 3, y: 3, type: 'lore', collected: false,
    text: 'A shrine of you. Carvings, sketches, a lock of your hair tied with ribbon. Dozens of candles burned to stumps around a portrait you never sat for. She painted it from memory.' });
  objects.push({ x: cx, y: 6, type: 'lore', collected: false,
    text: 'The coffin is lined with soft cloth. A pillow. A blanket. A gag. She wanted them comfortable. She wanted them to stay.' });
}

// ---- OLD SALOON (run-down, restorable) ----
export function genSaloon(tiles, w, h, doors, r, restored = false) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  tiles[0][3] = T.WINDOW;
  tiles[0][cx] = T.WINDOW;
  tiles[0][w - 4] = T.WINDOW;

  // ── Back bar: shelves for bottles, spanning the top wall ──
  tiles[1][3] = T.BOOKSHELF;
  tiles[1][4] = T.BOOKSHELF;
  tiles[1][5] = T.BOOKSHELF;
  tiles[1][w - 6] = T.BOOKSHELF;
  tiles[1][w - 5] = T.BOOKSHELF;
  tiles[1][w - 4] = T.BOOKSHELF;

  // ── Beer keg stacks flanking the back bar ──
  tiles[2][2] = T.BARREL;
  tiles[2][3] = T.BARREL;
  tiles[3][2] = T.BARREL;
  tiles[2][w - 3] = T.BARREL;
  tiles[2][w - 4] = T.BARREL;
  tiles[3][w - 3] = T.BARREL;

  // ── The bar counter — a long continuous bar across the middle ──
  tiles[5][2] = T.TABLE;
  tiles[5][3] = T.TABLE;
  tiles[5][4] = T.TABLE;
  tiles[5][5] = T.TABLE;
  tiles[5][6] = T.TABLE;
  tiles[5][w - 7] = T.TABLE;
  tiles[5][w - 6] = T.TABLE;
  tiles[5][w - 5] = T.TABLE;
  tiles[5][w - 4] = T.TABLE;
  tiles[5][w - 3] = T.TABLE;
  // a gap in the middle for the bartender to pass through
  // crates/barrels behind the bar (bartender's side — row 4)
  tiles[4][3] = T.CRATE;
  tiles[4][5] = T.BARREL;
  tiles[4][w - 4] = T.CRATE;
  tiles[4][w - 6] = T.BARREL;

  // ── Bar stools facing the counter (row 6) ──
  tiles[6][3] = T.CHAIR;
  tiles[6][5] = T.CHAIR;
  tiles[6][w - 4] = T.CHAIR;
  tiles[6][w - 6] = T.CHAIR;

  // ── Booth tables along the side walls ──
  // left booth
  tiles[8][2] = T.TABLE;
  tiles[8][3] = T.TABLE;
  tiles[8][1] = T.CHAIR;
  tiles[8][4] = T.CHAIR;
  tiles[9][2] = T.CHAIR;
  tiles[9][3] = T.CHAIR;
  // right booth
  tiles[8][w - 3] = T.TABLE;
  tiles[8][w - 4] = T.TABLE;
  tiles[8][w - 2] = T.CHAIR;
  tiles[8][w - 5] = T.CHAIR;
  tiles[9][w - 3] = T.CHAIR;
  tiles[9][w - 4] = T.CHAIR;

  // ── Central card table ──
  tiles[cy_safe(h, 7)][cx] = T.TABLE;
  tiles[cy_safe(h, 6)][cx] = T.CHAIR;
  tiles[cy_safe(h, 8)][cx] = T.CHAIR;

  // ── Dim lighting ──
  tiles[2][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][2] = T.LANTERN_FLOOR;
  tiles[h - 3][w - 3] = T.LANTERN_FLOOR;
  tiles[h - 3][cx] = T.LANTERN_FLOOR;

  // ── Wall decor ──
  tiles[h - 4][1] = T.PAINTING;
  tiles[h - 4][w - 2] = T.PAINTING;
  tiles[h - 3][1] = T.POSTER;
  tiles[h - 3][w - 2] = T.POSTER;
  tiles[h - 2][2] = T.PUMPKIN;
  tiles[h - 2][w - 3] = T.PUMPKIN;

  if (restored) {
    // ── Restored: warm, lively, welcoming — a proper town tavern ──
    // central rug tying the room together
    rect(tiles, cx - 2, 6, cx + 2, h - 4, T.RUG, w, h);
    // stove behind the bar — hot food and warmth
    tiles[4][cx - 1] = T.STOVE;
    tiles[4][cx + 1] = T.STOVE;
    // extra bar stools
    tiles[6][4] = T.CHAIR;
    tiles[6][cx] = T.CHAIR;
    tiles[6][w - 5] = T.CHAIR;
    // a second booth table in the center
    tiles[cy_safe(h, 9)][cx - 1] = T.TABLE;
    tiles[cy_safe(h, 9)][cx + 1] = T.TABLE;
    tiles[cy_safe(h, 10)][cx - 1] = T.CHAIR;
    tiles[cy_safe(h, 10)][cx + 1] = T.CHAIR;
    // warm lighting — candles along the bar and extra lanterns
    tiles[4][2] = T.CANDLES;
    tiles[4][w - 3] = T.CANDLES;
    tiles[6][cx - 1] = T.CANDLES;
    tiles[6][cx + 1] = T.CANDLES;
    tiles[3][cx] = T.LANTERN_FLOOR;
    tiles[3][3] = T.LANTERN_FLOOR;
    tiles[3][w - 4] = T.LANTERN_FLOOR;
    tiles[h - 3][cx - 2] = T.LANTERN_FLOOR;
    tiles[h - 3][cx + 2] = T.LANTERN_FLOOR;
    // plant pots and pumpkins — life and festivity
    tiles[h - 3][1] = T.PLANT_POT;
    tiles[h - 3][w - 2] = T.PLANT_POT;
    tiles[2][3] = T.PUMPKIN;
    tiles[2][w - 4] = T.PUMPKIN;
    // more wall art
    tiles[7][1] = T.PAINTING;
    tiles[7][w - 2] = T.PAINTING;
    // a chest for storage behind the bar
    tiles[4][6] = T.CHEST;
    // a clock on the wall
    tiles[h - 4][cx] = T.WALL_CLOCK;
    // tall plants in the corners
    tiles[h - 2][cx - 2] = T.TALL_PLANT;
    tiles[h - 2][cx + 2] = T.TALL_PLANT;
  }

  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'town', targetX: 33, targetY: 20 });
}

function cy_safe(h, val) { return Math.min(val, h - 3); }

// ---- FISH MARKET ----
export function genFishMarket(tiles, w, h, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  tiles[0][3] = T.WINDOW;
  tiles[0][cx] = T.WINDOW;
  tiles[0][w - 4] = T.WINDOW;

  // fish tank displays (crates representing tanks)
  tiles[3][3] = T.CRATE;
  tiles[4][3] = T.CRATE;
  tiles[3][4] = T.BARREL;
  tiles[4][4] = T.CRATE;
  tiles[3][w - 4] = T.CRATE;
  tiles[4][w - 4] = T.CRATE;
  tiles[3][w - 5] = T.BARREL;
  tiles[4][w - 5] = T.CRATE;

  // sales counter
  tiles[h - 4][cx - 1] = T.TABLE;
  tiles[h - 4][cx] = T.TABLE;
  tiles[h - 4][cx + 1] = T.TABLE;
  tiles[h - 3][cx] = T.CHAIR;

  // bait and gear on shelves
  tiles[2][2] = T.BOOKSHELF;
  tiles[2][3] = T.BARREL;
  tiles[2][w - 3] = T.BOOKSHELF;
  tiles[2][w - 4] = T.BARREL;

  // decor
  tiles[2][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][2] = T.LANTERN_FLOOR;
  tiles[h - 3][w - 3] = T.LANTERN_FLOOR;
  tiles[h - 4][1] = T.PAINTING;
  tiles[h - 4][w - 2] = T.PAINTING;
  tiles[h - 3][cx - 2] = T.PLANT_POT;
  tiles[h - 3][cx + 2] = T.PLANT_POT;

  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'town', targetX: 22, targetY: 27 });
}

// ---- PATRICIA'S COTTAGE (cluttered, mysterious) ----
export function genPatricia(tiles, w, h, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  tiles[0][3] = T.WINDOW;
  tiles[0][cx] = T.WINDOW;
  tiles[0][w - 4] = T.WINDOW;

  // cluttered table
  tiles[4][cx - 1] = T.TABLE;
  tiles[4][cx] = T.TABLE;
  tiles[5][cx] = T.CHAIR;

  // lots of candles (mysterious vibe)
  tiles[2][2] = T.CANDLES;
  tiles[2][w - 3] = T.CANDLES;
  tiles[4][2] = T.CANDLES;
  tiles[4][w - 3] = T.CANDLES;
  tiles[h - 4][2] = T.CANDLES;
  tiles[h - 4][w - 3] = T.CANDLES;

  // bookshelf with strange tomes
  tiles[2][3] = T.BOOKSHELF;
  tiles[3][3] = T.BOOKSHELF;
  tiles[2][w - 4] = T.BOOKSHELF;
  tiles[3][w - 4] = T.BOOKSHELF;

  // rug
  rect(tiles, cx - 2, 5, cx + 2, h - 4, T.RUG, w, h);

  // decor
  tiles[h - 4][1] = T.PAINTING;
  tiles[h - 4][w - 2] = T.PAINTING;
  tiles[2][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][2] = T.PUMPKIN;
  tiles[h - 3][w - 3] = T.PUMPKIN;
  tiles[h - 2][cx - 2] = T.PLANT_POT;
  tiles[h - 2][cx + 2] = T.PLANT_POT;

  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'town', targetX: 11, targetY: 22 });
}

// ---- TOWN HOUSE (simple home) ----
export function genTownhouse(tiles, w, h, doors, r) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  tiles[0][cx] = T.WINDOW;
  tiles[0][3] = T.WINDOW;

  // bed
  tiles[2][2] = T.BED;
  tiles[2][3] = T.LANTERN_FLOOR;

  // table and chair
  tiles[5][cx] = T.TABLE;
  tiles[6][cx] = T.CHAIR;

  // storage
  tiles[h - 3][2] = T.CHEST;
  tiles[h - 3][w - 3] = T.CRATE;
  tiles[h - 3][w - 4] = T.BARREL;

  // decor
  tiles[h - 4][1] = T.PAINTING;
  tiles[2][cx] = T.LANTERN_FLOOR;
  tiles[h - 3][cx] = T.LANTERN_FLOOR;
  tiles[h - 2][cx - 1] = T.PLANT_POT;
  tiles[h - 2][cx + 1] = T.PUMPKIN;

  tiles[h - 1][cx] = T.DOOR;
  doors.push({ x: cx, y: h - 1, to: 'town', targetX: 11, targetY: 14 });
}