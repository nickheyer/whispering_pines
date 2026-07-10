// Interior generators for romanceable NPCs' homes
import { T } from './constants';

function set(tiles, x, y, t2, w, h) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  tiles[y][x] = t2;
}

function rect(tiles, x0, y0, x1, y1, t, w, h) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) set(tiles, x, y, t, w, h);
}

// Generic cottage interior — themed by accent color and decor type
export function genCottage(tiles, w, h, doors, r, theme) {
  rect(tiles, 0, 0, w - 1, h - 1, T.WALL, w, h);
  rect(tiles, 1, 1, w - 2, h - 2, T.FLOOR, w, h);
  const cx = Math.floor(w / 2);

  // windows on back wall
  tiles[0][2] = T.WINDOW;
  tiles[0][cx] = T.WINDOW;
  tiles[0][w - 3] = T.WINDOW;

  // bed area
  tiles[2][2] = T.BED;
  tiles[2][1] = T.LANTERN_FLOOR;

  // central table
  tiles[Math.floor(h / 2)][cx] = T.TABLE;
  tiles[Math.floor(h / 2) + 1][cx] = T.CHAIR;
  tiles[Math.floor(h / 2) - 1][cx] = T.CHAIR;

  // storage
  tiles[h - 3][2] = T.CHEST;
  tiles[h - 3][w - 3] = T.CRATE;
  tiles[h - 3][w - 4] = T.BARREL;

  // theme-specific decor
  switch (theme) {
    case 'workshop': // Rowan — woodworker
      tiles[3][w - 3] = T.WORKBENCH;
      tiles[4][w - 3] = T.ANVIL;
      tiles[h - 2][cx - 1] = T.BOOK_STACK;
      tiles[h - 2][cx + 1] = T.PLANT_POT;
      tiles[2][cx + 1] = T.PICTURE_FRAME;
      tiles[h - 4][1] = T.PAINTING;
      break;
    case 'garden': // Willow — herbalist
      tiles[h - 2][1] = T.PLANT_POT;
      tiles[h - 2][2] = T.PLANT_POT;
      tiles[h - 2][3] = T.TALL_PLANT;
      tiles[3][w - 3] = T.HANGING_PLANT;
      tiles[3][w - 4] = T.HANGING_PLANT;
      tiles[h - 4][cx - 1] = T.FLOWER_VASE;
      tiles[h - 4][cx + 1] = T.FIREPLACE;
      tiles[2][cx + 1] = T.FLOWER_VASE;
      break;
    case 'boathouse': // Finn — fisherman
      tiles[h - 2][1] = T.BARREL;
      tiles[h - 2][2] = T.BARREL;
      tiles[3][w - 3] = T.CRATE;
      tiles[3][w - 4] = T.CRATE;
      tiles[h - 4][cx - 1] = T.FIREPLACE;
      tiles[h - 4][cx + 1] = T.WINDOW;
      tiles[2][cx + 1] = T.PICTURE_FRAME;
      tiles[h - 2][cx] = T.LANTERN_FLOOR;
      break;
    case 'tower': // Luna — astronomer/witch
      tiles[2][cx + 1] = T.BOOKSHELF;
      tiles[3][cx + 1] = T.BOOKSHELF;
      tiles[3][cx - 1] = T.CRYSTAL;
      tiles[h - 2][1] = T.BOOK_STACK;
      tiles[h - 2][2] = T.BOOK_STACK;
      tiles[h - 4][cx - 1] = T.MIRROR;
      tiles[h - 4][cx + 1] = T.CANDLES;
      tiles[h - 4][cx] = T.FIREPLACE;
      tiles[h - 3][w - 3] = T.WALL_CLOCK;
      break;
    case 'studio': // Dante — artist
      tiles[3][w - 3] = T.PICTURE_FRAME;
      tiles[3][w - 4] = T.PAINTING;
      tiles[4][w - 3] = T.PAINTING;
      tiles[h - 4][cx - 1] = T.FIREPLACE;
      tiles[h - 2][1] = T.BOOK_STACK;
      tiles[h - 2][2] = T.BOOK_STACK;
      tiles[2][cx + 1] = T.FLOWER_VASE;
      tiles[h - 4][cx + 1] = T.TALL_PLANT;
      tiles[h - 2][cx] = T.LANTERN_FLOOR;
      break;
  }

  // door
  tiles[h - 1][cx] = T.DOOR;
  // register exit door back to town — each cottage maps to its exterior building position
  const exits = {
    workshop: { x: 38, y: 15 },
    garden: { x: 16, y: 8 },
    boathouse: { x: 4, y: 15 },
    tower: { x: 28, y: 28 },
    studio: { x: 16, y: 28 },
  };
  const exit = exits[theme];
  if (exit) doors.push({ x: cx, y: h - 1, to: 'town', targetX: exit.x, targetY: exit.y });
}