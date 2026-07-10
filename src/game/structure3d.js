// 3D depth pass — gives the ENTIRE world visible vertical volume and grounding
// shadows so everything reads as little 3D dioramas: walls, roofs, furniture,
// trees, rocks, bushes, and outdoor decor.
import { T, COLORS } from './constants';

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

function shade(hex, amt) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.min(255, r + amt));
  const ng = Math.max(0, Math.min(255, g + amt));
  const nb = Math.max(0, Math.min(255, b + amt));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// Consistent light direction: upper-left. Shadows fall to the front-right.
function castShadow(ctx, ox, oy, s, w, h, strength = 0.22) {
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(ox + w * 0.5 + s * 0.06, oy + h * 0.94, w * 0.42, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const WALL_TYPES = new Set([T.WALL, T.DOOR, T.WINDOW]);

const BIG_OBJECTS = new Set([
  T.BED, T.TABLE, T.CHEST, T.STOVE, T.BOOKSHELF, T.WORKBENCH,
  T.WELL, T.BARREL, T.CRATE, T.ANVIL, T.STATUE, T.BENCH,
  T.GRAVE, T.GRAVESTONE, T.FENCE, T.FALLEN_LOG, T.STONE_CIRCLE,
  T.CAMPFIRE, T.LANTERN_POST, T.GROTTO_CHEST,
]);

const TREES = new Set([
  T.TREE, T.TWISTED_TREE, T.PINE, T.OAK, T.BIRCH, T.WILLOW, T.DEAD_TREE,
]);

const SMALL_DECOR = new Set([
  T.FLOWER, T.MUSHROOM, T.PEBBLE, T.FERN, T.TALL_GRASS, T.STUMP, T.BUSH, T.BERRY_BUSH,
]);

const GROUND_TILES = new Set([
  T.GRASS, T.DARK_GRASS, T.SAND, T.PATH, T.FLOOR, T.STONE, T.MOSS, T.DARK_DIRT,
  T.WATER, T.DEEP_WATER, T.TILLED, T.RUG, T.DOCK, T.BRIDGE, T.LILY,
]);

// Tiles that rise above the ground and need 3D treatment.
export function isStructural(tile) {
  return !GROUND_TILES.has(tile);
}

// Draw 3D depth pass for ALL elevated tiles. Called AFTER flat tiles are drawn.
export function drawStructure3D(ctx, tile, ox, oy, s, tx, ty, tiles, w, h) {
  const wallCol = COLORS.wall[0];
  const wallTop = shade(wallCol, 18);
  const wallSide = shade(wallCol, -22);
  const wallDeep = shade(wallCol, -42);
  const roofCol = COLORS.roof[0];
  const roofTop = shade(roofCol, 22);
  const roofSide = shade(roofCol, -28);
  const roofDeep = shade(roofCol, -48);

  // ── WALLS, DOORS, WINDOWS ──
  if (WALL_TYPES.has(tile)) {
    const above = ty > 0 ? tiles[ty - 1][tx] : -1;
    if (!WALL_TYPES.has(above) && above !== T.ROOF) {
      const capH = s * 0.1;
      px(ctx, ox - s * 0.02, oy - capH, s + s * 0.04, capH, wallTop);
      px(ctx, ox - s * 0.02, oy - capH, s + s * 0.04, 1, shade(wallCol, 35));
      px(ctx, ox + s - s * 0.02, oy - capH, s * 0.06, capH, shade(wallCol, 8));
    }
    const below = ty + 1 < h ? tiles[ty + 1][tx] : -1;
    if (!WALL_TYPES.has(below) && below !== T.ROOF) {
      const baseH = s * 0.12;
      px(ctx, ox, oy + s, s, baseH, wallSide);
      px(ctx, ox + s * 0.88, oy + s, s * 0.12, baseH, wallDeep);
      px(ctx, ox, oy + s + baseH - 2, s, 2, wallDeep);
    }
  }

  // ── ROOFS ──
  if (tile === T.ROOF) {
    const below = ty + 1 < h ? tiles[ty + 1][tx] : -1;
    if (below !== T.ROOF) {
      const eaveH = s * 0.18;
      const eaveW = s * 0.06;
      px(ctx, ox - eaveW, oy + s, s + eaveW * 2, eaveH, roofSide);
      px(ctx, ox - eaveW, oy + s, s + eaveW * 2, 2, roofDeep);
      px(ctx, ox - eaveW, oy + s + eaveH - 2, s + eaveW * 2, 3, roofDeep);
    }
    const above = ty > 0 ? tiles[ty - 1][tx] : -1;
    if (above !== T.ROOF) {
      const ridgeH = s * 0.06;
      px(ctx, ox, oy - ridgeH, s, ridgeH, roofTop);
      px(ctx, ox, oy - ridgeH, s, 1, shade(roofCol, 40));
    }
  }

  // ── TREES — grounding shadow + trunk base volume ──
  if (TREES.has(tile)) {
    // wide soft grounding shadow under the canopy
    castShadow(ctx, ox, oy, s, s, 0.3);
    const trunkCol = COLORS.trunk[0];
    const trunkSide = shade(trunkCol, -30);
    const below = ty + 1 < h ? tiles[ty + 1][tx] : -1;
    if (!TREES.has(below)) {
      // trunk root flare — darker base where trunk meets ground
      px(ctx, ox + s * 0.4, oy + s * 0.82, s * 0.2, s * 0.08, trunkSide);
      px(ctx, ox + s * 0.42, oy + s * 0.85, s * 0.16, s * 0.04, shade(trunkCol, -50));
    }
  }

  // ── ROCKS — vertical side faces for 3D boulder look ──
  if (tile === T.ROCK) {
    castShadow(ctx, ox, oy, s, s, 0.3);
    const rockCol = '#52525c';
    const rockSide = shade(rockCol, -28);
    const rockDeep = shade(rockCol, -45);
    // front face — visible vertical side
    px(ctx, ox + s * 0.08, oy + s * 0.7, s * 0.84, s * 0.22, rockSide);
    px(ctx, ox + s * 0.08, oy + s * 0.7, s * 0.84, s * 0.04, shade(rockCol, -15));
    px(ctx, ox + s * 0.7, oy + s * 0.7, s * 0.22, s * 0.22, rockDeep);
    // bottom edge
    px(ctx, ox + s * 0.08, oy + s * 0.9, s * 0.84, 2, rockDeep);
  }

  // ── BIG OBJECTS / FURNITURE — grounding shadow + base volume ──
  if (BIG_OBJECTS.has(tile)) {
    castShadow(ctx, ox, oy, s, s, 0.25);
    const below = ty + 1 < h ? tiles[ty + 1][tx] : -1;
    if (!BIG_OBJECTS.has(below)) {
      px(ctx, ox + s * 0.08, oy + s * 0.92, s * 0.84, s * 0.04, 'rgba(0,0,0,0.15)');
    }
  }

  // ── SMALL DECOR — subtle grounding shadows for flowers, mushrooms, etc. ──
  if (SMALL_DECOR.has(tile)) {
    if (tile === T.BUSH || tile === T.BERRY_BUSH) {
      castShadow(ctx, ox, oy, s, s, 0.22);
    } else if (tile === T.STUMP) {
      castShadow(ctx, ox, oy, s, s, 0.25);
    } else {
      // tiny soft shadow for flowers, mushrooms, ferns, pebbles, grass
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(ox + s * 0.5, oy + s * 0.9, s * 0.16, s * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── CRYSTAL — glow base + grounding shadow ──
  if (tile === T.CRYSTAL) {
    castShadow(ctx, ox, oy, s, s, 0.28);
  }

  // ── RUIN — grounding shadow + base ──
  if (tile === T.RUIN) {
    castShadow(ctx, ox, oy, s, s, 0.25);
  }

  // ── CAVE — dark depth around the entrance ──
  if (tile === T.CAVE) {
    px(ctx, ox + s * 0.1, oy + s * 0.7, s * 0.8, s * 0.15, shade('#2a2a30', -30));
  }

  // ── STAIRS — depth at the step edges ──
  if (tile === T.STAIRS_DOWN || tile === T.STAIRS_UP) {
    px(ctx, ox + s * 0.15, oy + s, s * 0.7, s * 0.06, 'rgba(0,0,0,0.3)');
  }
}