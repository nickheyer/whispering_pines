// Enhanced building & furniture sprites — richer textures, depth, shadows, architectural detail
import { COLORS } from './constants';

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

// ---- WALL (exterior clapboard with depth, beams, foundation) ----
export function drawWall(ctx, ox, oy, s, tileHash) {
  const n = tileHash();
  // base
  px(ctx, ox, oy, s, s, COLORS.wall[0]);
  // clapboard horizontal courses with beveled edges
  const courses = 5;
  for (let i = 0; i < courses; i++) {
    const cy = oy + s * (i / courses);
    const ch = s / courses;
    px(ctx, ox, cy, s, ch, i % 2 === 0 ? COLORS.wall[0] : COLORS.wall[1]);
    // top highlight on each board
    px(ctx, ox, cy, s, Math.max(1, ch * 0.12), shade(COLORS.wall[1], 8));
    // bottom shadow
    px(ctx, ox, cy + ch - Math.max(1, ch * 0.1), s, Math.max(1, ch * 0.1), COLORS.wall[2]);
  }
  // vertical corner post (left) — gives 3D framed look
  px(ctx, ox, oy, s * 0.08, s, '#3a2a1a');
  px(ctx, ox + s * 0.02, oy + s * 0.04, s * 0.03, s * 0.92, '#2a1a0a');
  // vertical corner post (right)
  px(ctx, ox + s * 0.92, oy, s * 0.08, s, '#3a2a1a');
  px(ctx, ox + s * 0.94, oy + s * 0.04, s * 0.03, s * 0.92, '#2a1a0a');
  // wood grain knots
  if (n > 0.4) {
    const kx = ox + s * (0.3 + n * 0.3);
    const ky = oy + s * (0.2 + (n * 7 % 1) * 0.5);
    px(ctx, kx, ky, s * 0.04, s * 0.04, COLORS.wall[2]);
    px(ctx, kx + s * 0.01, ky + s * 0.01, s * 0.02, s * 0.02, '#1a0a05');
  }
  if (n > 0.7) {
    const kx = ox + s * (0.5 + n * 0.2);
    const ky = oy + s * (0.4 + (n * 3 % 1) * 0.4);
    px(ctx, kx, ky, s * 0.03, s * 0.03, COLORS.wall[2]);
  }
  // iron nails along the posts
  const nailCols = [0.05, 0.95];
  for (const nx of nailCols) {
    for (let i = 0; i < 3; i++) {
      const ny = 0.12 + i * 0.32;
      px(ctx, ox + s * (nx - 0.015), oy + s * ny, s * 0.03, s * 0.03, '#5a4a3a');
      px(ctx, ox + s * (nx - 0.01), oy + s * ny, s * 0.015, s * 0.015, '#7a6a5a');
    }
  }
  // top cap beam
  px(ctx, ox, oy, s, s * 0.04, '#2a1a0a');
  px(ctx, ox, oy + s * 0.03, s, s * 0.015, '#3a2a1a');
  // stone foundation — chunkier, with mortar gaps
  px(ctx, ox, oy + s * 0.88, s, s * 0.12, '#4a4248');
  px(ctx, ox, oy + s * 0.88, s, s * 0.02, '#5a5258');
  // individual stones
  const stoneCount = 3;
  for (let i = 0; i < stoneCount; i++) {
    const sx = ox + s * (i * 0.34 + 0.02);
    const sw = s * 0.3;
    px(ctx, sx, oy + s * 0.9, sw, s * 0.09, n > 0.5 ? '#52525c' : '#4a4a52');
    px(ctx, sx, oy + s * 0.9, sw, s * 0.02, '#6a6a74');
    px(ctx, sx + s * 0.02, oy + s * 0.92, sw - s * 0.04, s * 0.03, '#3a3a42');
    // mortar gap
    px(ctx, sx + sw - s * 0.01, oy + s * 0.9, s * 0.02, s * 0.09, '#2a2a30');
  }
  // moss on foundation
  if (n > 0.6) px(ctx, ox + s * 0.1, oy + s * 0.95, s * 0.15, s * 0.03, '#3e5e34');
  if (n > 0.8) px(ctx, ox + s * 0.7, oy + s * 0.96, s * 0.12, s * 0.02, '#3e5e34');
}

// ---- DOOR (reinforced, with frame, hinges, step) ----
export function drawDoor(ctx, ox, oy, s, tileHash) {
  const n = tileHash();
  // wall background
  px(ctx, ox, oy, s, s, COLORS.wall[0]);
  px(ctx, ox, oy + s * 0.88, s, s * 0.12, '#4a4248');
  // stone step
  px(ctx, ox + s * 0.15, oy + s * 0.88, s * 0.7, s * 0.06, '#5a5658');
  px(ctx, ox + s * 0.15, oy + s * 0.93, s * 0.7, s * 0.02, '#3a3638');
  // door frame — deep recessed
  px(ctx, ox + s * 0.16, oy + s * 0.04, s * 0.68, s * 0.86, '#2a1a0a');
  // frame inner highlight (left + top)
  px(ctx, ox + s * 0.16, oy + s * 0.04, s * 0.03, s * 0.86, '#3a2a1a');
  px(ctx, ox + s * 0.16, oy + s * 0.04, s * 0.68, s * 0.03, '#3a2a1a');
  // door slab
  px(ctx, ox + s * 0.22, oy + s * 0.08, s * 0.56, s * 0.8, '#4a2a12');
  px(ctx, ox + s * 0.22, oy + s * 0.08, s * 0.56, s * 0.02, '#5a3a22');
  // vertical plank divisions
  px(ctx, ox + s * 0.4, oy + s * 0.08, s * 0.02, s * 0.8, '#2a1808');
  px(ctx, ox + s * 0.58, oy + s * 0.08, s * 0.02, s * 0.8, '#2a1808');
  // iron cross-bracing (X pattern)
  ctx.save();
  ctx.strokeStyle = '#3a3a3e';
  ctx.lineWidth = Math.max(1, s * 0.025);
  ctx.beginPath();
  ctx.moveTo(ox + s * 0.26, oy + s * 0.12);
  ctx.lineTo(ox + s * 0.72, oy + s * 0.84);
  ctx.moveTo(ox + s * 0.72, oy + s * 0.12);
  ctx.lineTo(ox + s * 0.26, oy + s * 0.84);
  ctx.stroke();
  ctx.restore();
  // iron bands horizontal
  px(ctx, ox + s * 0.2, oy + s * 0.15, s * 0.6, s * 0.04, '#3a3a3e');
  px(ctx, ox + s * 0.2, oy + s * 0.15, s * 0.6, s * 0.01, '#5a5a5e');
  px(ctx, ox + s * 0.2, oy + s * 0.77, s * 0.6, s * 0.04, '#3a3a3e');
  px(ctx, ox + s * 0.2, oy + s * 0.77, s * 0.6, s * 0.01, '#5a5a5e');
  // rivets on bands
  for (let i = 0; i < 4; i++) {
    px(ctx, ox + s * (0.24 + i * 0.15), oy + s * 0.165, s * 0.02, s * 0.02, '#6a6a6e');
    px(ctx, ox + s * (0.24 + i * 0.15), oy + s * 0.785, s * 0.02, s * 0.02, '#6a6a6e');
  }
  // hinges
  px(ctx, ox + s * 0.24, oy + s * 0.2, s * 0.06, s * 0.08, '#2a2a2e');
  px(ctx, ox + s * 0.24, oy + s * 0.7, s * 0.06, s * 0.08, '#2a2a2e');
  px(ctx, ox + s * 0.25, oy + s * 0.21, s * 0.04, s * 0.06, '#4a4a4e');
  // door handle — ornate
  px(ctx, ox + s * 0.64, oy + s * 0.48, s * 0.08, s * 0.08, '#d4a04a');
  px(ctx, ox + s * 0.65, oy + s * 0.49, s * 0.06, s * 0.06, '#ffd470');
  px(ctx, ox + s * 0.66, oy + s * 0.5, s * 0.03, s * 0.03, '#ffeab0');
  // keyhole
  px(ctx, ox + s * 0.67, oy + s * 0.56, s * 0.02, s * 0.03, '#1a0a05');
  // top lintel
  px(ctx, ox + s * 0.14, oy + s * 0.02, s * 0.72, s * 0.04, '#2a1a0a');
  px(ctx, ox + s * 0.14, oy + s * 0.02, s * 0.72, s * 0.01, '#3a2a1a');
}

// ---- WINDOW (paned, with sill, frame, reflection) ----
export function drawWindow(ctx, ox, oy, s, tileHash) {
  const n = tileHash();
  // wall bg
  px(ctx, ox, oy, s, s, COLORS.wall[0]);
  for (let i = 0; i < 5; i++) {
    const cy = oy + s * (i / 5);
    px(ctx, ox, cy, s, s / 5, i % 2 === 0 ? COLORS.wall[0] : COLORS.wall[1]);
  }
  px(ctx, ox, oy + s * 0.88, s, s * 0.12, '#4a4248');
  // window sill
  px(ctx, ox + s * 0.12, oy + s * 0.82, s * 0.76, s * 0.06, '#3a2a1a');
  px(ctx, ox + s * 0.12, oy + s * 0.82, s * 0.76, s * 0.015, '#5a3a22');
  px(ctx, ox + s * 0.1, oy + s * 0.86, s * 0.8, s * 0.03, '#2a1a0a');
  // window frame — recessed
  px(ctx, ox + s * 0.14, oy + s * 0.1, s * 0.72, s * 0.74, '#2a1a0a');
  px(ctx, ox + s * 0.16, oy + s * 0.12, s * 0.68, s * 0.7, '#3a2a1a');
  // glass panes — cold blue with reflection
  px(ctx, ox + s * 0.18, oy + s * 0.14, s * 0.64, s * 0.66, '#2a3a5a');
  px(ctx, ox + s * 0.18, oy + s * 0.14, s * 0.64, s * 0.33, '#3a5a7a');
  // warm glow inside at night-ish
  px(ctx, ox + s * 0.22, oy + s * 0.18, s * 0.2, s * 0.15, 'rgba(255,200,100,0.15)');
  // cross muntins
  px(ctx, ox + s * 0.48, oy + s * 0.14, s * 0.03, s * 0.66, '#2a1a0a');
  px(ctx, ox + s * 0.18, oy + s * 0.45, s * 0.64, s * 0.03, '#2a1a0a');
  // diagonal light reflection
  ctx.save();
  ctx.globalAlpha = 0.3;
  px(ctx, ox + s * 0.22, oy + s * 0.16, s * 0.04, s * 0.2, '#a0c0e0');
  px(ctx, ox + s * 0.26, oy + s * 0.16, s * 0.02, s * 0.12, '#c0e0ff');
  ctx.restore();
  // shutters
  px(ctx, ox + s * 0.02, oy + s * 0.12, s * 0.1, s * 0.72, '#3a2a12');
  px(ctx, ox + s * 0.03, oy + s * 0.14, s * 0.07, s * 0.68, '#4a3a22');
  px(ctx, ox + s * 0.88, oy + s * 0.12, s * 0.1, s * 0.72, '#3a2a12');
  px(ctx, ox + s * 0.89, oy + s * 0.14, s * 0.07, s * 0.68, '#4a3a22');
  // shutter slats
  for (let i = 0; i < 4; i++) {
    px(ctx, ox + s * 0.03, oy + s * (0.2 + i * 0.16), s * 0.07, s * 0.02, '#2a1a08');
    px(ctx, ox + s * 0.89, oy + s * (0.2 + i * 0.16), s * 0.07, s * 0.02, '#2a1a08');
  }
}

// ---- FLOOR (wide planks, grain, depth shadows) ----
export function drawFloor(ctx, ox, oy, s, tileHash) {
  const n = tileHash();
  // base
  px(ctx, ox, oy, s, s, COLORS.floor[0]);
  // 3 horizontal planks with bevel
  const planks = 3;
  for (let i = 0; i < planks; i++) {
    const py = oy + s * (i / planks);
    const ph = s / planks;
    const v = i % 2 === 0 ? COLORS.floor[0] : COLORS.floor[1];
    px(ctx, ox, py, s, ph, v);
    // top highlight
    px(ctx, ox, py, s, Math.max(1, ph * 0.1), shade(v, 10));
    // bottom shadow seam
    px(ctx, ox, py + ph - Math.max(1, ph * 0.08), s, Math.max(1, ph * 0.08), COLORS.floor[2]);
  }
  // staggered vertical seams between planks
  const seams = [
    { x: n > 0.5 ? 0.3 : 0.7, plank: 0 },
    { x: n > 0.3 ? 0.6 : 0.2, plank: 1 },
    { x: n > 0.7 ? 0.4 : 0.8, plank: 2 },
  ];
  for (const seam of seams) {
    const py = oy + s * (seam.plank / planks);
    px(ctx, ox + s * seam.x, py, s * 0.015, s / planks, COLORS.floor[2]);
  }
  // wood grain — wavy lines
  if (n > 0.3) px(ctx, ox + s * 0.08, oy + s * 0.1, s * 0.25, s * 0.008, COLORS.floor[2]);
  if (n > 0.6) px(ctx, ox + s * 0.4, oy + s * 0.42, s * 0.3, s * 0.008, COLORS.floor[2]);
  if (n > 0.4) px(ctx, ox + s * 0.12, oy + s * 0.75, s * 0.22, s * 0.008, COLORS.floor[2]);
  // knots
  if (n > 0.7) {
    px(ctx, ox + s * 0.55, oy + s * 0.25, s * 0.03, s * 0.03, COLORS.floor[2]);
    px(ctx, ox + s * 0.56, oy + s * 0.26, s * 0.015, s * 0.015, '#2a1a08');
  }
  // board-end nails
  px(ctx, ox + s * 0.05, oy + s * 0.05, s * 0.02, s * 0.02, '#5a4a3a');
  px(ctx, ox + s * 0.93, oy + s * 0.38, s * 0.02, s * 0.02, '#5a4a3a');
  px(ctx, ox + s * 0.05, oy + s * 0.72, s * 0.02, s * 0.02, '#5a4a3a');
}

// ---- RUG (patterned, fringed) ----
export function drawRug(ctx, ox, oy, s) {
  // fringe
  for (let i = 0; i < 8; i++) {
    px(ctx, ox + s * (0.12 + i * 0.1), oy + s * 0.06, s * 0.02, s * 0.05, '#d4a04a');
    px(ctx, ox + s * (0.12 + i * 0.1), oy + s * 0.89, s * 0.02, s * 0.05, '#d4a04a');
  }
  // outer border
  px(ctx, ox + s * 0.1, oy + s * 0.1, s * 0.8, s * 0.8, '#5a2a2a');
  // inner border
  px(ctx, ox + s * 0.16, oy + s * 0.16, s * 0.68, s * 0.68, '#7a3a3a');
  // center field
  px(ctx, ox + s * 0.22, oy + s * 0.22, s * 0.56, s * 0.56, '#9a4a4a');
  // diamond pattern
  px(ctx, ox + s * 0.35, oy + s * 0.35, s * 0.3, s * 0.3, '#c4a04a');
  px(ctx, ox + s * 0.4, oy + s * 0.4, s * 0.2, s * 0.2, '#6a3a3a');
  px(ctx, ox + s * 0.46, oy + s * 0.46, s * 0.08, s * 0.08, '#d4b06a');
  // corner accents
  px(ctx, ox + s * 0.18, oy + s * 0.18, s * 0.04, s * 0.04, '#c4a04a');
  px(ctx, ox + s * 0.78, oy + s * 0.18, s * 0.04, s * 0.04, '#c4a04a');
  px(ctx, ox + s * 0.18, oy + s * 0.78, s * 0.04, s * 0.04, '#c4a04a');
  px(ctx, ox + s * 0.78, oy + s * 0.78, s * 0.04, s * 0.04, '#c4a04a');
}

// ---- BED (frame, quilt, pillows, headboard) ----
export function drawBed(ctx, ox, oy, s) {
  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(ox + s * 0.06, oy + s * 0.82, s * 0.88, s * 0.06);
  // frame
  px(ctx, ox + s * 0.06, oy + s * 0.2, s * 0.88, s * 0.65, '#3a2410');
  px(ctx, ox + s * 0.06, oy + s * 0.2, s * 0.88, s * 0.04, '#4a3420');
  px(ctx, ox + s * 0.06, oy + s * 0.8, s * 0.88, s * 0.06, '#2a1808');
  // frame detail
  px(ctx, ox + s * 0.08, oy + s * 0.24, s * 0.84, s * 0.02, '#5a3a22');
  // mattress
  px(ctx, ox + s * 0.1, oy + s * 0.25, s * 0.8, s * 0.5, '#c4b494');
  px(ctx, ox + s * 0.1, oy + s * 0.25, s * 0.8, s * 0.03, '#d4c4a4');
  // mattress tufting
  px(ctx, ox + s * 0.3, oy + s * 0.35, s * 0.03, s * 0.03, '#a49474');
  px(ctx, ox + s * 0.55, oy + s * 0.35, s * 0.03, s * 0.03, '#a49474');
  px(ctx, ox + s * 0.8, oy + s * 0.35, s * 0.03, s * 0.03, '#a49474');
  // pillows
  px(ctx, ox + s * 0.12, oy + s * 0.22, s * 0.32, s * 0.16, '#e0d8c4');
  px(ctx, ox + s * 0.14, oy + s * 0.24, s * 0.28, s * 0.1, '#fff8e8');
  px(ctx, ox + s * 0.46, oy + s * 0.22, s * 0.32, s * 0.16, '#e0d8c4');
  px(ctx, ox + s * 0.48, oy + s * 0.24, s * 0.28, s * 0.1, '#fff8e8');
  // blanket
  px(ctx, ox + s * 0.1, oy + s * 0.48, s * 0.8, s * 0.28, '#7a4a5a');
  px(ctx, ox + s * 0.1, oy + s * 0.48, s * 0.8, s * 0.04, '#6a3a4a');
  px(ctx, ox + s * 0.1, oy + s * 0.74, s * 0.8, s * 0.03, '#5a2a3a');
  // quilt pattern — diamonds
  for (let i = 0; i < 4; i++) {
    px(ctx, ox + s * (0.16 + i * 0.18), oy + s * 0.56, s * 0.06, s * 0.06, '#9a6a7a');
    px(ctx, ox + s * (0.18 + i * 0.18), oy + s * 0.58, s * 0.02, s * 0.02, '#b48a9a');
  }
  // headboard — tall with posts
  px(ctx, ox + s * 0.06, oy + s * 0.06, s * 0.88, s * 0.16, '#4a2a18');
  px(ctx, ox + s * 0.08, oy + s * 0.08, s * 0.84, s * 0.12, '#3a1a08');
  // headboard posts
  px(ctx, ox + s * 0.04, oy + s * 0.06, s * 0.06, s * 0.2, '#2a1808');
  px(ctx, ox + s * 0.9, oy + s * 0.06, s * 0.06, s * 0.2, '#2a1808');
  px(ctx, ox + s * 0.04, oy + s * 0.06, s * 0.06, s * 0.03, '#5a3a22');
  px(ctx, ox + s * 0.9, oy + s * 0.06, s * 0.06, s * 0.03, '#5a3a22');
  // headboard carving
  px(ctx, ox + s * 0.4, oy + s * 0.1, s * 0.2, s * 0.06, '#5a3a22');
  px(ctx, ox + s * 0.46, oy + s * 0.12, s * 0.08, s * 0.03, '#6a4a32');
}

// ---- TABLE (with cloth, grain, turned legs) ----
export function drawTable(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.12, oy + s * 0.82, s * 0.76, s * 0.04);
  // tabletop — thick
  px(ctx, ox + s * 0.08, oy + s * 0.22, s * 0.84, s * 0.14, '#6a4a2a');
  px(ctx, ox + s * 0.08, oy + s * 0.22, s * 0.84, s * 0.03, '#8a6a4a');
  px(ctx, ox + s * 0.08, oy + s * 0.33, s * 0.84, s * 0.03, '#4a2a10');
  // beveled edge
  px(ctx, ox + s * 0.08, oy + s * 0.22, s * 0.03, s * 0.14, '#4a2a10');
  px(ctx, ox + s * 0.89, oy + s * 0.22, s * 0.03, s * 0.14, '#4a2a10');
  // wood grain on top
  px(ctx, ox + s * 0.14, oy + s * 0.26, s * 0.2, s * 0.01, '#4a2a10');
  px(ctx, ox + s * 0.4, oy + s * 0.28, s * 0.25, s * 0.01, '#4a2a10');
  px(ctx, ox + s * 0.68, oy + s * 0.25, s * 0.18, s * 0.01, '#4a2a10');
  // knot
  px(ctx, ox + s * 0.55, oy + s * 0.27, s * 0.03, s * 0.02, '#3a1a08');
  // turned legs with detail
  for (const lx of [0.15, 0.77]) {
    px(ctx, ox + s * lx, oy + s * 0.36, s * 0.08, s * 0.44, '#4a2a10');
    // turning rings
    px(ctx, ox + s * lx, oy + s * 0.42, s * 0.08, s * 0.02, '#2a1808');
    px(ctx, ox + s * lx, oy + s * 0.55, s * 0.08, s * 0.02, '#2a1808');
    px(ctx, ox + s * lx, oy + s * 0.68, s * 0.08, s * 0.02, '#2a1808');
    // bulb
    px(ctx, ox + s * (lx - 0.01), oy + s * 0.5, s * 0.1, s * 0.06, '#5a3a1a');
    // foot
    px(ctx, ox + s * (lx - 0.01), oy + s * 0.76, s * 0.1, s * 0.04, '#3a1a08');
  }
}

// ---- CHAIR (spindled back, turned legs) ----
export function drawChair(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.28, oy + s * 0.8, s * 0.44, s * 0.04);
  // seat
  px(ctx, ox + s * 0.26, oy + s * 0.28, s * 0.48, s * 0.1, '#5a3a1a');
  px(ctx, ox + s * 0.26, oy + s * 0.28, s * 0.48, s * 0.02, '#7a5a3a');
  px(ctx, ox + s * 0.26, oy + s * 0.36, s * 0.48, s * 0.02, '#3a1a08');
  // back posts
  px(ctx, ox + s * 0.26, oy + s * 0.1, s * 0.06, s * 0.22, '#3a1a08');
  px(ctx, ox + s * 0.68, oy + s * 0.1, s * 0.06, s * 0.22, '#3a1a08');
  // top rail
  px(ctx, ox + s * 0.24, oy + s * 0.08, s * 0.52, s * 0.05, '#4a2a10');
  px(ctx, ox + s * 0.24, oy + s * 0.08, s * 0.52, s * 0.01, '#6a4a22');
  // spindles
  for (let i = 0; i < 3; i++) {
    px(ctx, ox + s * (0.34 + i * 0.1), oy + s * 0.14, s * 0.02, s * 0.16, '#3a1a08');
  }
  // legs
  px(ctx, ox + s * 0.28, oy + s * 0.38, s * 0.06, s * 0.42, '#3a1a08');
  px(ctx, ox + s * 0.66, oy + s * 0.38, s * 0.06, s * 0.42, '#3a1a08');
  px(ctx, ox + s * 0.3, oy + s * 0.55, s * 0.02, s * 0.02, '#2a1808');
  px(ctx, ox + s * 0.68, oy + s * 0.55, s * 0.02, s * 0.02, '#2a1808');
}

// ---- CHEST (iron-banded, with lock, beveled) ----
export function drawChest(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(ox + s * 0.1, oy + s * 0.82, s * 0.8, s * 0.05);
  // body
  px(ctx, ox + s * 0.1, oy + s * 0.3, s * 0.8, s * 0.55, '#5a3a1a');
  px(ctx, ox + s * 0.1, oy + s * 0.3, s * 0.8, s * 0.04, '#6a4a2a');
  px(ctx, ox + s * 0.1, oy + s * 0.8, s * 0.8, s * 0.05, '#3a1a08');
  // beveled front
  px(ctx, ox + s * 0.12, oy + s * 0.34, s * 0.76, s * 0.44, '#6a4a2a');
  px(ctx, ox + s * 0.12, oy + s * 0.34, s * 0.02, s * 0.44, '#4a2a10');
  px(ctx, ox + s * 0.86, oy + s * 0.34, s * 0.02, s * 0.44, '#4a2a10');
  // wood plank lines
  px(ctx, ox + s * 0.4, oy + s * 0.34, s * 0.02, s * 0.44, '#3a1a08');
  px(ctx, ox + s * 0.58, oy + s * 0.34, s * 0.02, s * 0.44, '#3a1a08');
  // lid — rounded top
  px(ctx, ox + s * 0.1, oy + s * 0.18, s * 0.8, s * 0.14, '#7a5a3a');
  px(ctx, ox + s * 0.1, oy + s * 0.18, s * 0.8, s * 0.03, '#9a7a5a');
  px(ctx, ox + s * 0.12, oy + s * 0.3, s * 0.76, s * 0.02, '#3a1a08');
  // iron corner bands
  px(ctx, ox + s * 0.1, oy + s * 0.18, s * 0.06, s * 0.67, '#2a2a2e');
  px(ctx, ox + s * 0.84, oy + s * 0.18, s * 0.06, s * 0.67, '#2a2a2e');
  // horizontal iron bands
  px(ctx, ox + s * 0.1, oy + s * 0.38, s * 0.8, s * 0.04, '#2a2a2e');
  px(ctx, ox + s * 0.1, oy + s * 0.38, s * 0.8, s * 0.01, '#4a4a4e');
  px(ctx, ox + s * 0.1, oy + s * 0.68, s * 0.8, s * 0.04, '#2a2a2e');
  px(ctx, ox + s * 0.1, oy + s * 0.68, s * 0.8, s * 0.01, '#4a4a4e');
  // rivets
  for (let i = 0; i < 5; i++) {
    px(ctx, ox + s * (0.14 + i * 0.17), oy + s * 0.39, s * 0.02, s * 0.02, '#6a6a6e');
    px(ctx, ox + s * (0.14 + i * 0.17), oy + s * 0.69, s * 0.02, s * 0.02, '#6a6a6e');
  }
  // lock plate
  px(ctx, ox + s * 0.4, oy + s * 0.42, s * 0.2, s * 0.22, '#3a3a3e');
  px(ctx, ox + s * 0.42, oy + s * 0.44, s * 0.16, s * 0.18, '#2a2a2e');
  // lock
  px(ctx, ox + s * 0.44, oy + s * 0.48, s * 0.12, s * 0.12, '#d4a04a');
  px(ctx, ox + s * 0.46, oy + s * 0.5, s * 0.08, s * 0.08, '#ffd470');
  px(ctx, ox + s * 0.48, oy + s * 0.52, s * 0.04, s * 0.04, '#ffeab0');
  // keyhole
  px(ctx, ox + s * 0.49, oy + s * 0.54, s * 0.02, s * 0.03, '#1a0a05');
  px(ctx, ox + s * 0.485, oy + s * 0.55, s * 0.03, s * 0.02, '#1a0a05');
}

// ---- STOVE (cast iron, fire glow, pipe) ----
export function drawStove(ctx, ox, oy, s) {
  const t = performance.now() / 200;
  const flick = Math.sin(t) * 0.1 + 0.9;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(ox + s * 0.12, oy + s * 0.86, s * 0.76, s * 0.05);
  // body
  px(ctx, ox + s * 0.12, oy + s * 0.12, s * 0.76, s * 0.74, '#2a2a2e');
  px(ctx, ox + s * 0.12, oy + s * 0.12, s * 0.76, s * 0.04, '#3a3a3e');
  px(ctx, ox + s * 0.12, oy + s * 0.82, s * 0.76, s * 0.04, '#1a1a1e');
  // beveled edges
  px(ctx, ox + s * 0.12, oy + s * 0.12, s * 0.03, s * 0.74, '#3a3a3e');
  px(ctx, ox + s * 0.85, oy + s * 0.12, s * 0.03, s * 0.74, '#1a1a1e');
  // firebox door
  px(ctx, ox + s * 0.2, oy + s * 0.32, s * 0.6, s * 0.38, '#1a1a1e');
  px(ctx, ox + s * 0.2, oy + s * 0.32, s * 0.6, s * 0.03, '#2a2a2e');
  px(ctx, ox + s * 0.2, oy + s * 0.32, s * 0.03, s * 0.38, '#2a2a2e');
  // fire glow
  px(ctx, ox + s * 0.26, oy + s * 0.42, s * 0.48, s * 0.22, `rgba(255,106,26,${flick})`);
  px(ctx, ox + s * 0.3, oy + s * 0.46, s * 0.4, s * 0.14, `rgba(255,160,48,${flick})`);
  px(ctx, ox + s * 0.34, oy + s * 0.48, s * 0.32, s * 0.08, `rgba(255,212,96,${flick})`);
  // grate bars
  for (let i = 0; i < 5; i++) {
    px(ctx, ox + s * (0.28 + i * 0.1), oy + s * 0.42, s * 0.02, s * 0.22, '#1a1a1e');
  }
  // door handle
  px(ctx, ox + s * 0.72, oy + s * 0.48, s * 0.04, s * 0.06, '#4a4a4e');
  // top cook surface
  px(ctx, ox + s * 0.16, oy + s * 0.16, s * 0.68, s * 0.1, '#1a1a1e');
  px(ctx, ox + s * 0.18, oy + s * 0.18, s * 0.64, s * 0.06, '#0a0a0e');
  // burner rings
  px(ctx, ox + s * 0.26, oy + s * 0.2, s * 0.16, s * 0.02, '#2a2a2e');
  px(ctx, ox + s * 0.5, oy + s * 0.2, s * 0.16, s * 0.02, '#2a2a2e');
  // stovepipe
  px(ctx, ox + s * 0.4, oy + s * 0.02, s * 0.2, s * 0.12, '#2a2a2e');
  px(ctx, ox + s * 0.42, oy + s * 0.02, s * 0.16, s * 0.1, '#1a1a1e');
  px(ctx, ox + s * 0.4, oy + s * 0.12, s * 0.2, s * 0.02, '#3a3a3e');
}

// ---- BOOKSHELF (framed, varied books, carvings) ----
export function drawBookshelf(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.08, oy + s * 0.92, s * 0.84, s * 0.04);
  // frame
  px(ctx, ox + s * 0.06, oy + s * 0.04, s * 0.88, s * 0.92, '#3a2210');
  px(ctx, ox + s * 0.06, oy + s * 0.04, s * 0.88, s * 0.04, '#4a3220');
  // back panel
  px(ctx, ox + s * 0.1, oy + s * 0.08, s * 0.8, s * 0.84, '#2a1808');
  // shelves
  for (let i = 0; i < 3; i++) {
    px(ctx, ox + s * 0.1, oy + s * (0.08 + i * 0.3), s * 0.8, s * 0.025, '#4a3220');
    px(ctx, ox + s * 0.1, oy + s * (0.08 + i * 0.3), s * 0.8, s * 0.008, '#5a4230');
  }
  // books — varied colors, sizes, tilted
  const cols = ['#8a3a2a', '#3a5a4a', '#5a4a8a', '#8a6a3a', '#3a3a5a', '#6a3a5a', '#4a6a3a', '#8a4a6a'];
  const shelfYs = [0.1, 0.4, 0.7];
  for (let shelf = 0; shelf < 3; shelf++) {
    let bx = 0.12;
    let i = 0;
    while (bx < 0.86) {
      const bh = 0.22 + ((i + shelf) % 4) * 0.015;
      const bw = 0.07 + ((i * 3 + shelf) % 3) * 0.015;
      const col = cols[(i + shelf * 2) % cols.length];
      const tilt = (i === 4 && shelf === 1) ? 0.1 : 0;
      px(ctx, ox + s * bx, oy + s * (shelfYs[shelf] + (0.28 - bh) + tilt), s * bw, s * bh, col);
      px(ctx, ox + s * bx, oy + s * (shelfYs[shelf] + (0.28 - bh) + tilt), s * bw, s * 0.015, shade(col, 25));
      px(ctx, ox + s * (bx + bw - 0.01), oy + s * (shelfYs[shelf] + (0.28 - bh) + tilt), s * 0.01, s * bh, shade(col, -25));
      // gold trim on some
      if (i % 3 === 0) px(ctx, ox + s * bx, oy + s * (shelfYs[shelf] + (0.28 - bh) + tilt + 0.02), s * bw, s * 0.01, '#d4a04a');
      bx += bw + 0.005;
      i++;
    }
  }
  // frame edges
  px(ctx, ox + s * 0.06, oy + s * 0.04, s * 0.04, s * 0.92, '#5a4230');
  px(ctx, ox + s * 0.9, oy + s * 0.04, s * 0.04, s * 0.92, '#5a4230');
  // carved top
  px(ctx, ox + s * 0.3, oy + s * 0.0, s * 0.4, s * 0.05, '#3a2210');
  px(ctx, ox + s * 0.35, oy + s * 0.01, s * 0.3, s * 0.03, '#5a3a22');
}

// ---- PUMPKIN (Jack-o-lantern with glow) ----
export function drawPumpkin(ctx, ox, oy, s) {
  const t = performance.now() / 500;
  const glow = Math.sin(t) * 0.15 + 0.85;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.15, oy + s * 0.82, s * 0.7, s * 0.04);
  // body — ribbed
  px(ctx, ox + s * 0.15, oy + s * 0.32, s * 0.7, s * 0.5, '#a45a1a');
  px(ctx, ox + s * 0.2, oy + s * 0.3, s * 0.6, s * 0.52, '#c47a2a');
  // ribs
  for (let i = 0; i < 4; i++) {
    px(ctx, ox + s * (0.25 + i * 0.14), oy + s * 0.32, s * 0.02, s * 0.5, '#8a4a10');
  }
  // highlights
  px(ctx, ox + s * 0.22, oy + s * 0.34, s * 0.06, s * 0.4, '#d48a3a');
  // stem
  px(ctx, ox + s * 0.44, oy + s * 0.22, s * 0.12, s * 0.14, '#4a5a2a');
  px(ctx, ox + s * 0.46, oy + s * 0.22, s * 0.08, s * 0.12, '#5a6a3a');
  px(ctx, ox + s * 0.48, oy + s * 0.22, s * 0.02, s * 0.12, '#6a7a4a');
  // curly vine
  px(ctx, ox + s * 0.56, oy + s * 0.24, s * 0.03, s * 0.02, '#4a5a2a');
  px(ctx, ox + s * 0.58, oy + s * 0.22, s * 0.02, s * 0.03, '#4a5a2a');
  // face — glowing
  px(ctx, ox + s * 0.28, oy + s * 0.48, s * 0.12, s * 0.12, `rgba(255,160,48,${glow})`);
  px(ctx, ox + s * 0.6, oy + s * 0.48, s * 0.12, s * 0.12, `rgba(255,160,48,${glow})`);
  // eye pupils
  px(ctx, ox + s * 0.3, oy + s * 0.5, s * 0.04, s * 0.06, `rgba(255,212,96,${glow})`);
  px(ctx, ox + s * 0.62, oy + s * 0.5, s * 0.04, s * 0.06, `rgba(255,212,96,${glow})`);
  // jagged mouth
  px(ctx, ox + s * 0.3, oy + s * 0.66, s * 0.4, s * 0.06, `rgba(255,160,48,${glow})`);
  px(ctx, ox + s * 0.32, oy + s * 0.7, s * 0.04, s * 0.04, '#c47a2a');
  px(ctx, ox + s * 0.44, oy + s * 0.7, s * 0.04, s * 0.04, '#c47a2a');
  px(ctx, ox + s * 0.56, oy + s * 0.7, s * 0.04, s * 0.04, '#c47a2a');
  // inner glow on ground
  ctx.save();
  ctx.globalAlpha = glow * 0.2;
  px(ctx, ox + s * 0.1, oy + s * 0.8, s * 0.8, s * 0.08, '#ffa030');
  ctx.restore();
}

// ---- CANDLES (with flickering flames) ----
export function drawCandles(ctx, ox, oy, s) {
  const t = performance.now() / 120;
  const flick = Math.sin(t) * 0.3 + Math.sin(t * 2.3) * 0.2;
  const positions = [0.3, 0.5, 0.7];
  for (let i = 0; i < positions.length; i++) {
    const cx = ox + s * positions[i];
    const h = s * (0.25 + i * 0.03);
    // candle holder
    px(ctx, cx - s * 0.04, oy + s * 0.75, s * 0.08, s * 0.04, '#5a4a2a');
    // candle body
    px(ctx, cx - s * 0.03, oy + s * 0.5, s * 0.06, h, '#e0d0a0');
    px(ctx, cx - s * 0.03, oy + s * 0.5, s * 0.02, h, '#f0e0b0');
    px(ctx, cx + s * 0.01, oy + s * 0.5, s * 0.02, h, '#c4b480');
    // melted wax
    px(ctx, cx - s * 0.02, oy + s * 0.5, s * 0.04, s * 0.03, '#d4c490');
    // wick
    px(ctx, cx - s * 0.005, oy + s * 0.45, s * 0.01, s * 0.03, '#2a1a0a');
    // flame
    const fh = s * (0.08 + flick * 0.02);
    px(ctx, cx - s * 0.02, oy + s * 0.45 - fh, s * 0.04, fh, '#ff8a1a');
    px(ctx, cx - s * 0.01, oy + s * 0.45 - fh * 0.7, s * 0.02, fh * 0.7, '#ffd460');
    px(ctx, cx, oy + s * 0.45 - fh * 0.3, s * 0.01, fh * 0.3, '#ffffe0');
    // glow
    ctx.save();
    ctx.globalAlpha = 0.15;
    px(ctx, cx - s * 0.08, oy + s * 0.3, s * 0.16, s * 0.3, '#ffa030');
    ctx.restore();
  }
}

// ---- PAINTING (framed landscape) ----
export function drawPainting(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.08, oy + s * 0.82, s * 0.84, s * 0.04);
  // ornate frame
  px(ctx, ox + s * 0.06, oy + s * 0.06, s * 0.88, s * 0.78, '#3a2a1a');
  px(ctx, ox + s * 0.06, oy + s * 0.06, s * 0.88, s * 0.03, '#5a4a3a');
  px(ctx, ox + s * 0.06, oy + s * 0.06, s * 0.03, s * 0.78, '#5a4a3a');
  px(ctx, ox + s * 0.91, oy + s * 0.06, s * 0.03, s * 0.78, '#2a1a0a');
  px(ctx, ox + s * 0.06, oy + s * 0.81, s * 0.88, s * 0.03, '#2a1a0a');
  // inner gold trim
  px(ctx, ox + s * 0.1, oy + s * 0.1, s * 0.8, s * 0.02, '#d4a04a');
  px(ctx, ox + s * 0.1, oy + s * 0.1, s * 0.02, s * 0.68, '#d4a04a');
  px(ctx, ox + s * 0.88, oy + s * 0.1, s * 0.02, s * 0.68, '#d4a04a');
  px(ctx, ox + s * 0.1, oy + s * 0.76, s * 0.8, s * 0.02, '#d4a04a');
  // canvas
  px(ctx, ox + s * 0.14, oy + s * 0.14, s * 0.72, s * 0.6, '#1a2a3a');
  // sky
  px(ctx, ox + s * 0.14, oy + s * 0.14, s * 0.72, s * 0.25, '#3a5a7a');
  px(ctx, ox + s * 0.14, oy + s * 0.14, s * 0.72, s * 0.05, '#5a7a9a');
  // moon
  px(ctx, ox + s * 0.68, oy + s * 0.2, s * 0.06, s * 0.06, '#e0e0d0');
  px(ctx, ox + s * 0.69, oy + s * 0.21, s * 0.04, s * 0.04, '#f0f0e0');
  // mountains
  px(ctx, ox + s * 0.14, oy + s * 0.36, s * 0.72, s * 0.12, '#2a3a4a');
  px(ctx, ox + s * 0.2, oy + s * 0.3, s * 0.15, s * 0.18, '#3a4a5a');
  px(ctx, ox + s * 0.5, oy + s * 0.28, s * 0.2, s * 0.2, '#3a4a5a');
  // ground
  px(ctx, ox + s * 0.14, oy + s * 0.48, s * 0.72, s * 0.26, '#1a2a1a');
  // trees silhouettes
  px(ctx, ox + s * 0.2, oy + s * 0.4, s * 0.04, s * 0.16, '#0a1a0a');
  px(ctx, ox + s * 0.72, oy + s * 0.42, s * 0.04, s * 0.14, '#0a1a0a');
  // water reflection
  px(ctx, ox + s * 0.14, oy + s * 0.6, s * 0.72, s * 0.1, '#2a4a5a');
  px(ctx, ox + s * 0.66, oy + s * 0.62, s * 0.06, s * 0.02, '#5a7a8a');
  // corner ornaments
  px(ctx, ox + s * 0.08, oy + s * 0.08, s * 0.04, s * 0.04, '#d4a04a');
  px(ctx, ox + s * 0.88, oy + s * 0.08, s * 0.04, s * 0.04, '#d4a04a');
  px(ctx, ox + s * 0.08, oy + s * 0.78, s * 0.04, s * 0.04, '#d4a04a');
  px(ctx, ox + s * 0.88, oy + s * 0.78, s * 0.04, s * 0.04, '#d4a04a');
}

// ---- PLANT POT (with drooping plant) ----
export function drawPlantPot(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.28, oy + s * 0.82, s * 0.44, s * 0.04);
  // pot rim
  px(ctx, ox + s * 0.28, oy + s * 0.46, s * 0.44, s * 0.08, '#6a4a2a');
  px(ctx, ox + s * 0.28, oy + s * 0.46, s * 0.44, s * 0.02, '#7a5a3a');
  // pot body — tapered
  px(ctx, ox + s * 0.3, oy + s * 0.54, s * 0.4, s * 0.3, '#8a5a3a');
  px(ctx, ox + s * 0.34, oy + s * 0.82, s * 0.32, s * 0.02, '#6a4a2a');
  // pot shading
  px(ctx, ox + s * 0.3, oy + s * 0.54, s * 0.05, s * 0.3, '#7a4a2a');
  px(ctx, ox + s * 0.65, oy + s * 0.54, s * 0.05, s * 0.3, '#9a6a4a');
  // pot texture lines
  px(ctx, ox + s * 0.36, oy + s * 0.62, s * 0.28, s * 0.01, '#6a4a2a');
  px(ctx, ox + s * 0.34, oy + s * 0.72, s * 0.32, s * 0.01, '#6a4a2a');
  // soil
  px(ctx, ox + s * 0.3, oy + s * 0.5, s * 0.4, s * 0.04, '#3a2a1a');
  // plant stems
  px(ctx, ox + s * 0.4, oy + s * 0.3, s * 0.02, s * 0.22, '#4a7a3a');
  px(ctx, ox + s * 0.5, oy + s * 0.25, s * 0.02, s * 0.27, '#4a7a3a');
  px(ctx, ox + s * 0.58, oy + s * 0.32, s * 0.02, s * 0.2, '#4a7a3a');
  // leaves
  px(ctx, ox + s * 0.36, oy + s * 0.28, s * 0.08, s * 0.06, '#5a8a4a');
  px(ctx, ox + s * 0.46, oy + s * 0.22, s * 0.1, s * 0.07, '#6a9a5a');
  px(ctx, ox + s * 0.56, oy + s * 0.3, s * 0.08, s * 0.06, '#5a8a4a');
  px(ctx, ox + s * 0.42, oy + s * 0.36, s * 0.06, s * 0.05, '#4a7a3a');
}

// ---- CRATE (slatted, with iron corners) ----
export function drawCrate(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(ox + s * 0.08, oy + s * 0.84, s * 0.84, s * 0.05);
  // body
  px(ctx, ox + s * 0.08, oy + s * 0.16, s * 0.84, s * 0.7, '#6a4a2a');
  px(ctx, ox + s * 0.08, oy + s * 0.16, s * 0.84, s * 0.03, '#8a6a4a');
  px(ctx, ox + s * 0.08, oy + s * 0.83, s * 0.84, s * 0.03, '#4a2a10');
  // horizontal planks
  px(ctx, ox + s * 0.08, oy + s * 0.38, s * 0.84, s * 0.03, '#4a2a10');
  px(ctx, ox + s * 0.08, oy + s * 0.62, s * 0.84, s * 0.03, '#4a2a10');
  // vertical slats
  for (let i = 0; i < 5; i++) {
    px(ctx, ox + s * (0.08 + i * 0.18), oy + s * 0.16, s * 0.02, s * 0.7, '#3a1a08');
  }
  // wood grain
  px(ctx, ox + s * 0.12, oy + s * 0.22, s * 0.2, s * 0.01, '#4a2a10');
  px(ctx, ox + s * 0.5, oy + s * 0.45, s * 0.2, s * 0.01, '#4a2a10');
  // iron corner brackets
  px(ctx, ox + s * 0.08, oy + s * 0.16, s * 0.06, s * 0.06, '#3a3a3e');
  px(ctx, ox + s * 0.86, oy + s * 0.16, s * 0.06, s * 0.06, '#3a3a3e');
  px(ctx, ox + s * 0.08, oy + s * 0.8, s * 0.06, s * 0.06, '#3a3a3e');
  px(ctx, ox + s * 0.86, oy + s * 0.8, s * 0.06, s * 0.06, '#3a3a3e');
  // iron rivets
  for (const [rx, ry] of [[0.1, 0.18], [0.88, 0.18], [0.1, 0.82], [0.88, 0.82]]) {
    px(ctx, ox + s * rx, oy + s * ry, s * 0.02, s * 0.02, '#6a6a6e');
  }
  // brand mark
  px(ctx, ox + s * 0.4, oy + s * 0.45, s * 0.2, s * 0.1, '#4a2a10');
  px(ctx, ox + s * 0.44, oy + s * 0.48, s * 0.12, s * 0.04, '#3a1a08');
}

// ---- BARREL (hooped, with wood grain) ----
export function drawBarrel(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(ox + s * 0.16, oy + s * 0.86, s * 0.68, s * 0.04);
  // body
  px(ctx, ox + s * 0.16, oy + s * 0.12, s * 0.68, s * 0.74, '#5a3a1a');
  px(ctx, ox + s * 0.16, oy + s * 0.12, s * 0.68, s * 0.04, '#7a5a3a');
  px(ctx, ox + s * 0.16, oy + s * 0.82, s * 0.68, s * 0.04, '#3a1a08');
  // top
  px(ctx, ox + s * 0.18, oy + s * 0.14, s * 0.64, s * 0.06, '#6a4a2a');
  px(ctx, ox + s * 0.2, oy + s * 0.15, s * 0.6, s * 0.03, '#7a5a3a');
  // vertical staves
  for (let i = 0; i < 6; i++) {
    px(ctx, ox + s * (0.16 + i * 0.115), oy + s * 0.12, s * 0.015, s * 0.74, '#3a1a08');
    if (i % 2 === 0) px(ctx, ox + s * (0.18 + i * 0.115), oy + s * 0.12, s * 0.04, s * 0.74, '#6a4a2a');
  }
  // iron hoops
  px(ctx, ox + s * 0.16, oy + s * 0.28, s * 0.68, s * 0.04, '#2a2a2e');
  px(ctx, ox + s * 0.16, oy + s * 0.28, s * 0.68, s * 0.01, '#4a4a4e');
  px(ctx, ox + s * 0.16, oy + s * 0.56, s * 0.68, s * 0.04, '#2a2a2e');
  px(ctx, ox + s * 0.16, oy + s * 0.56, s * 0.68, s * 0.01, '#4a4a4e');
  // hoop rivets
  for (let i = 0; i < 4; i++) {
    px(ctx, ox + s * (0.2 + i * 0.16), oy + s * 0.29, s * 0.02, s * 0.02, '#5a5a5e');
    px(ctx, ox + s * (0.2 + i * 0.16), oy + s * 0.57, s * 0.02, s * 0.02, '#5a5a5e');
  }
  // bung hole
  px(ctx, ox + s * 0.42, oy + s * 0.42, s * 0.1, s * 0.08, '#2a1808');
  px(ctx, ox + s * 0.44, oy + s * 0.44, s * 0.06, s * 0.04, '#1a0a05');
}

// ---- WORKBENCH (with tools, vise) ----
export function drawWorkbench(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(ox + s * 0.08, oy + s * 0.84, s * 0.84, s * 0.04);
  // top — thick slab
  px(ctx, ox + s * 0.06, oy + s * 0.26, s * 0.88, s * 0.14, '#5a3a1a');
  px(ctx, ox + s * 0.06, oy + s * 0.26, s * 0.88, s * 0.03, '#7a5a3a');
  px(ctx, ox + s * 0.06, oy + s * 0.37, s * 0.88, s * 0.03, '#3a1a08');
  // wood grain
  px(ctx, ox + s * 0.1, oy + s * 0.3, s * 0.25, s * 0.01, '#3a1a08');
  px(ctx, ox + s * 0.4, oy + s * 0.32, s * 0.3, s * 0.01, '#3a1a08');
  px(ctx, ox + s * 0.72, oy + s * 0.29, s * 0.2, s * 0.01, '#3a1a08');
  // legs
  px(ctx, ox + s * 0.1, oy + s * 0.4, s * 0.08, s * 0.44, '#4a2a10');
  px(ctx, ox + s * 0.82, oy + s * 0.4, s * 0.08, s * 0.44, '#4a2a10');
  // cross brace
  px(ctx, ox + s * 0.1, oy + s * 0.72, s * 0.8, s * 0.04, '#3a1a08');
  // vise
  px(ctx, ox + s * 0.08, oy + s * 0.2, s * 0.1, s * 0.08, '#4a4a4e');
  px(ctx, ox + s * 0.1, oy + s * 0.22, s * 0.06, s * 0.04, '#6a6a6e');
  // tools on top — hammer
  px(ctx, ox + s * 0.24, oy + s * 0.18, s * 0.14, s * 0.06, '#7a6a5a');
  px(ctx, ox + s * 0.26, oy + s * 0.22, s * 0.03, s * 0.06, '#5a3a1a');
  // saw
  px(ctx, ox + s * 0.48, oy + s * 0.2, s * 0.2, s * 0.04, '#8a8a8e');
  px(ctx, ox + s * 0.46, oy + s * 0.18, s * 0.06, s * 0.04, '#5a3a1a');
  // saw teeth
  for (let i = 0; i < 6; i++) {
    px(ctx, ox + s * (0.5 + i * 0.03), oy + s * 0.24, s * 0.015, s * 0.02, '#6a6a6e');
  }
  // nails scattered
  px(ctx, ox + s * 0.72, oy + s * 0.24, s * 0.02, s * 0.02, '#6a6a6e');
  px(ctx, ox + s * 0.78, oy + s * 0.22, s * 0.02, s * 0.02, '#6a6a6e');
  px(ctx, ox + s * 0.82, oy + s * 0.25, s * 0.02, s * 0.02, '#6a6a6e');
}

// ---- WELL (stone, with roof) ----
export function drawWell(ctx, ox, oy, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(ox + s * 0.14, oy + s * 0.84, s * 0.72, s * 0.05);
  // stone base
  px(ctx, ox + s * 0.16, oy + s * 0.4, s * 0.68, s * 0.46, '#5a5658');
  px(ctx, ox + s * 0.16, oy + s * 0.4, s * 0.68, s * 0.03, '#6a6668');
  px(ctx, ox + s * 0.16, oy + s * 0.83, s * 0.68, s * 0.03, '#3a3638');
  // stones
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const sx = ox + s * (0.18 + col * 0.16);
      const sy = oy + s * (0.44 + row * 0.1);
      px(ctx, sx, sy, s * 0.14, s * 0.08, (row + col) % 2 === 0 ? '#5a5658' : '#525256');
      px(ctx, sx, sy, s * 0.14, s * 0.015, '#6a6668');
      px(ctx, sx, sy + s * 0.06, s * 0.14, s * 0.02, '#3a3638');
    }
  }
  // water in well
  px(ctx, ox + s * 0.24, oy + s * 0.5, s * 0.52, s * 0.08, '#2a4a6b');
  px(ctx, ox + s * 0.26, oy + s * 0.52, s * 0.48, s * 0.03, '#3a5a7b');
  // wooden posts
  px(ctx, ox + s * 0.18, oy + s * 0.05, s * 0.06, s * 0.38, '#3a2a1a');
  px(ctx, ox + s * 0.76, oy + s * 0.05, s * 0.06, s * 0.38, '#3a2a1a');
  // roof
  px(ctx, ox + s * 0.1, oy + s * 0.02, s * 0.8, s * 0.06, '#2a1808');
  px(ctx, ox + s * 0.08, oy + s * 0.0, s * 0.84, s * 0.04, '#4a2a18');
  // roof shingles
  for (let i = 0; i < 5; i++) {
    px(ctx, ox + s * (0.12 + i * 0.15), oy + s * 0.04, s * 0.1, s * 0.02, '#3a1a08');
  }
  // crossbeam
  px(ctx, ox + s * 0.18, oy + s * 0.2, s * 0.64, s * 0.04, '#3a2a1a');
  // bucket on rope
  px(ctx, ox + s * 0.46, oy + s * 0.24, s * 0.02, s * 0.18, '#5a4a3a');
  px(ctx, ox + s * 0.42, oy + s * 0.4, s * 0.16, s * 0.1, '#5a3a1a');
  px(ctx, ox + s * 0.42, oy + s * 0.4, s * 0.16, s * 0.02, '#7a5a3a');
  px(ctx, ox + s * 0.42, oy + s * 0.48, s * 0.16, s * 0.02, '#3a1a08');
  // handle
  px(ctx, ox + s * 0.44, oy + s * 0.38, s * 0.12, s * 0.02, '#3a2a1a');
}

// ---- LANTERN POST (tall, with glass and glow) ----
export function drawLanternPost(ctx, ox, oy, s) {
  const t = performance.now() / 400;
  const flick = Math.sin(t) * 0.1 + 0.9;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.4, oy + s * 0.92, s * 0.2, s * 0.04);
  // base
  px(ctx, ox + s * 0.38, oy + s * 0.86, s * 0.24, s * 0.08, '#3a2a1a');
  px(ctx, ox + s * 0.4, oy + s * 0.87, s * 0.2, s * 0.06, '#4a3a2a');
  // post
  px(ctx, ox + s * 0.46, oy + s * 0.3, s * 0.08, s * 0.56, '#3a2a1a');
  px(ctx, ox + s * 0.47, oy + s * 0.3, s * 0.04, s * 0.56, '#4a3a2a');
  // decorative bands
  px(ctx, ox + s * 0.44, oy + s * 0.5, s * 0.12, s * 0.02, '#2a1a0a');
  px(ctx, ox + s * 0.44, oy + s * 0.7, s * 0.12, s * 0.02, '#2a1a0a');
  // crossbar
  px(ctx, ox + s * 0.34, oy + s * 0.28, s * 0.32, s * 0.04, '#3a2a1a');
  // lantern body — iron frame
  px(ctx, ox + s * 0.34, oy + s * 0.14, s * 0.32, s * 0.18, '#2a2a2e');
  px(ctx, ox + s * 0.36, oy + s * 0.16, s * 0.28, s * 0.14, '#1a1a1e');
  // glass
  px(ctx, ox + s * 0.38, oy + s * 0.18, s * 0.24, s * 0.1, `rgba(255,176,74,${flick * 0.5})`);
  // flame
  px(ctx, ox + s * 0.46, oy + s * 0.2, s * 0.08, s * 0.06, `rgba(255,160,48,${flick})`);
  px(ctx, ox + s * 0.48, oy + s * 0.22, s * 0.04, s * 0.03, `rgba(255,212,96,${flick})`);
  // frame bars
  px(ctx, ox + s * 0.42, oy + s * 0.16, s * 0.02, s * 0.14, '#2a2a2e');
  px(ctx, ox + s * 0.56, oy + s * 0.16, s * 0.02, s * 0.14, '#2a2a2e');
  px(ctx, ox + s * 0.36, oy + s * 0.22, s * 0.28, s * 0.02, '#2a2a2e');
  // top — peaked roof
  px(ctx, ox + s * 0.32, oy + s * 0.08, s * 0.36, s * 0.08, '#2a1a0a');
  px(ctx, ox + s * 0.34, oy + s * 0.06, s * 0.32, s * 0.04, '#3a2a1a');
  // finial
  px(ctx, ox + s * 0.48, oy + s * 0.02, s * 0.04, s * 0.06, '#3a2a1a');
  px(ctx, ox + s * 0.49, oy + s * 0.03, s * 0.02, s * 0.03, '#5a4a3a');
  // ground glow
  ctx.save();
  ctx.globalAlpha = flick * 0.15;
  px(ctx, ox + s * 0.2, oy + s * 0.88, s * 0.6, s * 0.08, '#ffa030');
  ctx.restore();
}

// ---- LANTERN FLOOR (small, portable) ----
export function drawLanternFloor(ctx, ox, oy, s) {
  const t = performance.now() / 400;
  const flick = Math.sin(t) * 0.1 + 0.9;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(ox + s * 0.3, oy + s * 0.82, s * 0.4, s * 0.04);
  // base
  px(ctx, ox + s * 0.34, oy + s * 0.76, s * 0.32, s * 0.06, '#3a2a1a');
  px(ctx, ox + s * 0.36, oy + s * 0.77, s * 0.28, s * 0.04, '#4a3a2a');
  // body
  px(ctx, ox + s * 0.36, oy + s * 0.42, s * 0.28, s * 0.36, '#3a2a1a');
  px(ctx, ox + s * 0.38, oy + s * 0.44, s * 0.24, s * 0.32, '#2a2a2e');
  // glass
  px(ctx, ox + s * 0.4, oy + s * 0.46, s * 0.2, s * 0.28, `rgba(255,176,74,${flick * 0.5})`);
  // flame
  px(ctx, ox + s * 0.44, oy + s * 0.52, s * 0.12, s * 0.12, `rgba(255,160,48,${flick})`);
  px(ctx, ox + s * 0.46, oy + s * 0.54, s * 0.08, s * 0.08, `rgba(255,212,96,${flick})`);
  px(ctx, ox + s * 0.48, oy + s * 0.56, s * 0.04, s * 0.04, `rgba(255,255,224,${flick})`);
  // frame bars
  px(ctx, ox + s * 0.43, oy + s * 0.44, s * 0.02, s * 0.32, '#2a2a2e');
  px(ctx, ox + s * 0.55, oy + s * 0.44, s * 0.02, s * 0.32, '#2a2a2e');
  px(ctx, ox + s * 0.38, oy + s * 0.58, s * 0.24, s * 0.02, '#2a2a2e');
  // top
  px(ctx, ox + s * 0.34, oy + s * 0.36, s * 0.32, s * 0.06, '#2a1a0a');
  px(ctx, ox + s * 0.36, oy + s * 0.34, s * 0.28, s * 0.04, '#3a2a1a');
  // handle
  px(ctx, ox + s * 0.46, oy + s * 0.28, s * 0.02, s * 0.08, '#3a2a1a');
  px(ctx, ox + s * 0.44, oy + s * 0.26, s * 0.12, s * 0.02, '#3a2a1a');
}

// ---- CAMPFIRE (with logs, stones, animated flames, sparks) ----
export function drawCampfire(ctx, ox, oy, s, tileHash) {
  const t = performance.now() / 100;
  const flick = Math.sin(t) * 0.15 + Math.sin(t * 2.3) * 0.1;
  const n = tileHash();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.92, s * 0.4, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // stone ring
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI * 0.1 + (i / 4) * Math.PI * 1.2;
    const rx = ox + s * 0.5 + Math.cos(ang) * s * 0.36;
    const ry = oy + s * 0.82 + Math.sin(ang) * s * 0.08;
    px(ctx, rx - s * 0.05, ry - s * 0.03, s * 0.1, s * 0.06, '#5a5658');
    px(ctx, rx - s * 0.05, ry - s * 0.03, s * 0.1, s * 0.015, '#6a6668');
  }
  // logs — crossed
  px(ctx, ox + s * 0.22, oy + s * 0.62, s * 0.56, s * 0.1, '#3a2a1a');
  px(ctx, ox + s * 0.22, oy + s * 0.62, s * 0.56, s * 0.02, '#4a3a2a');
  px(ctx, ox + s * 0.22, oy + s * 0.7, s * 0.56, s * 0.02, '#2a1a0a');
  // bark texture
  px(ctx, ox + s * 0.3, oy + s * 0.64, s * 0.04, s * 0.06, '#2a1a0a');
  px(ctx, ox + s * 0.52, oy + s * 0.64, s * 0.03, s * 0.06, '#2a1a0a');
  // ember bed
  px(ctx, ox + s * 0.3, oy + s * 0.6, s * 0.4, s * 0.06, `rgba(255,80,20,${0.6 + flick * 0.2})`);
  px(ctx, ox + s * 0.36, oy + s * 0.62, s * 0.28, s * 0.03, `rgba(255,140,40,${0.7 + flick * 0.2})`);
  // outer flame (orange-red)
  const fh = s * (0.38 + flick * 0.08);
  px(ctx, ox + s * 0.3, oy + s * 0.6 - fh, s * 0.4, fh, '#ff5a10');
  // mid flame (orange)
  const fh2 = s * (0.3 + flick * 0.07);
  px(ctx, ox + s * 0.34, oy + s * 0.6 - fh2, s * 0.32, fh2, '#ff8a20');
  // inner flame (yellow)
  const fh3 = s * (0.22 + flick * 0.06);
  px(ctx, ox + s * 0.38, oy + s * 0.6 - fh3, s * 0.24, fh3, '#ffc040');
  // core (white-hot)
  const fh4 = s * (0.12 + flick * 0.04);
  px(ctx, ox + s * 0.42, oy + s * 0.6 - fh4, s * 0.16, fh4, '#ffe880');
  px(ctx, ox + s * 0.45, oy + s * 0.55, s * 0.06, s * 0.08, '#ffffe0');
  // flame tips — flickering
  px(ctx, ox + s * (0.36 + flick * 0.05), oy + s * 0.2, s * 0.03, s * 0.06, '#ffa030');
  px(ctx, ox + s * (0.5 - flick * 0.04), oy + s * 0.16, s * 0.025, s * 0.08, '#ffc040');
  // sparks
  if (n > 0.3) {
    const sx = ox + s * (0.4 + flick * 0.2 + n * 0.2);
    const sy = oy + s * (0.15 - flick * 0.1);
    px(ctx, sx, sy, s * 0.025, s * 0.025, '#ffd460');
    px(ctx, sx, sy - s * 0.03, s * 0.015, s * 0.02, '#ffa030');
  }
  if (n > 0.6) {
    const sx = ox + s * (0.55 + flick * 0.15);
    const sy = oy + s * (0.22 - flick * 0.08);
    px(ctx, sx, sy, s * 0.02, s * 0.02, '#ffe880');
  }
  // ground glow
  ctx.save();
  ctx.globalAlpha = 0.15 + flick * 0.05;
  px(ctx, ox + s * 0.1, oy + s * 0.86, s * 0.8, s * 0.06, '#ff8a20');
  ctx.restore();
}

// ---- ROOF (shingled building top — occludes interiors) ----
export function drawRoof(ctx, ox, oy, s, tileHash) {
  const n = tileHash();
  // base dark shingle
  px(ctx, ox, oy, s, s, COLORS.roof[0]);
  // horizontal shingle courses with beveled edges
  const rows = 4;
  for (let i = 0; i < rows; i++) {
    const cy = oy + s * (i / rows);
    const ch = s / rows;
    px(ctx, ox, cy, s, ch, i % 2 === 0 ? COLORS.roof[0] : COLORS.roof[1]);
    // top highlight on each shingle row
    px(ctx, ox, cy, s, 1, shade(COLORS.roof[0], 25));
    // bottom shadow
    px(ctx, ox, cy + ch - 1, s, 1, COLORS.roof[2]);
    // staggered shingle seams
    const seamX = (i % 2 === 0) ? 0.3 : 0.7;
    px(ctx, ox + s * seamX, cy, 1, ch, COLORS.roof[2]);
  }
  // central ridge beam
  px(ctx, ox + s * 0.42, oy, s * 0.16, s, shade(COLORS.roof[0], 15));
  px(ctx, ox + s * 0.42, oy, s * 0.16, 1, shade(COLORS.roof[0], 30));
  px(ctx, ox + s * 0.42, oy + s - 1, s * 0.16, 1, COLORS.roof[2]);
  // weathering / moss patches
  if (n > 0.35) {
    px(ctx, ox + s * 0.08, oy + s * 0.55, s * 0.18, s * 0.07, '#3a4a2a');
    px(ctx, ox + s * 0.1, oy + s * 0.53, s * 0.08, s * 0.03, '#4a5a3a');
  }
  if (n > 0.65) {
    px(ctx, ox + s * 0.7, oy + s * 0.25, s * 0.14, s * 0.06, '#3a4a2a');
  }
  if (n > 0.85) {
    px(ctx, ox + s * 0.55, oy + s * 0.7, s * 0.1, s * 0.04, '#4a5a3a');
  }
  // top edge shadow (depth — roof sits above walls)
  px(ctx, ox, oy, s, 2, 'rgba(0,0,0,0.3)');
  px(ctx, ox, oy, 2, s, 'rgba(0,0,0,0.15)');
  px(ctx, ox + s - 2, oy, 2, s, 'rgba(0,0,0,0.2)');
}

// ---- BENCH (wooden park bench) ----
export function drawBench(ctx, ox, oy, s) {
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(ox + s * 0.5, oy + s * 0.88, s * 0.36, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // seat plank
  px(ctx, ox + s * 0.15, oy + s * 0.45, s * 0.7, s * 0.12, '#6a4a2a');
  px(ctx, ox + s * 0.15, oy + s * 0.45, s * 0.7, s * 0.03, '#8a6a3a');
  px(ctx, ox + s * 0.15, oy + s * 0.55, s * 0.7, 1, '#4a3018');
  // backrest
  px(ctx, ox + s * 0.18, oy + s * 0.15, s * 0.64, s * 0.1, '#5a3a1a');
  px(ctx, ox + s * 0.18, oy + s * 0.15, s * 0.64, s * 0.02, '#7a5a2a');
  // backrest supports
  px(ctx, ox + s * 0.2, oy + s * 0.25, s * 0.05, s * 0.22, '#4a3018');
  px(ctx, ox + s * 0.72, oy + s * 0.25, s * 0.05, s * 0.22, '#4a3018');
  // legs
  px(ctx, ox + s * 0.2, oy + s * 0.57, s * 0.06, s * 0.2, '#3a2810');
  px(ctx, ox + s * 0.72, oy + s * 0.57, s * 0.06, s * 0.2, '#3a2810');
}