// Small ambient critters that bring the forest to life — they scurry away when the player approaches.
import { T } from './constants';

// Tiles that block critter movement (solid obstacles)
const SOLID_TILES = new Set([
  T.WALL, T.DOOR, T.TREE, T.TWISTED_TREE, T.PINE, T.OAK, T.BIRCH, T.WILLOW, T.DEAD_TREE,
  T.BUSH, T.BERRY_BUSH, T.FENCE, T.ROCK, T.STONE_CIRCLE, T.RUIN, T.WELL, T.GRAVE,
  T.GRAVESTONE, T.GRAVE_CROSS, T.SKULL_TOTEM, T.CHEST, T.STOVE, T.TABLE, T.CHAIR,
  T.BOOKSHELF, T.WINDOW, T.CRATE, T.BARREL, T.ANVIL, T.WORKBENCH, T.STATUE, T.TENTACLE_STATUE,
  T.FALLEN_LOG, T.STUMP, T.BENCH, T.FIREPLACE, T.BED, T.WITCH_TOME, T.BONE_PILE, T.CAVE,
  T.PAINTING, T.PICTURE_FRAME, T.WALL_CLOCK, T.MIRROR, T.ROOF, T.CAMPFIRE, T.CRYSTAL,
  T.LANTERN_POST, T.SIGN, T.STAIRS_DOWN, T.STAIRS_UP, T.GROTTO_CHEST, T.HANGING_MOSS,
]);

function isBlocked(tiles, tx, tz, w, h) {
  if (tx < 1 || tz < 1 || tx >= w - 1 || tz >= h - 1) return true;
  const t = tiles[tz][tx];
  if (t === T.WATER || t === T.DEEP_WATER) return true;
  return SOLID_TILES.has(t);
}

// Weighted critter types — common small critters more frequent, deer rarer
const CRITTER_POOL = [
  'squirrel', 'squirrel', 'squirrel', 'squirrel',
  'rabbit', 'rabbit', 'rabbit', 'rabbit',
  'bird', 'bird', 'bird', 'bird',
  'deer', 'deer', 'deer',
  'fox', 'fox', 'fox',
  'crow', 'crow',
];

export function spawnCritters(zone, tiles) {
  if (zone.def.interior) return [];
  const count = 6 + Math.floor(Math.random() * 5);
  const critters = [];
  for (let i = 0; i < count; i++) {
    let x, z, ok = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      x = 2 + Math.random() * (zone.w - 4);
      z = 2 + Math.random() * (zone.h - 4);
      if (!isBlocked(tiles, Math.floor(x), Math.floor(z), zone.w, zone.h)) { ok = true; break; }
    }
    if (!ok) continue;
    critters.push({
      x, z,
      type: CRITTER_POOL[Math.floor(Math.random() * CRITTER_POOL.length)],
      dir: Math.random() * Math.PI * 2,
      state: 'idle',
      timer: 1 + Math.random() * 3,
      anim: Math.random() * 10,
      wasFleeing: false,
    });
  }
  return critters;
}

// Returns an array of { type, dist } for critters that just started fleeing this frame
export function updateCritters(critters, px, pz, dt, tiles, w, h) {
  const fleeEvents = [];
  for (const c of critters) {
    c.anim += dt * (c.state === 'flee' ? 14 : 5);
    const dist = Math.hypot(c.x - px, c.z - pz);
    const fleeRange = c.type === 'bird' || c.type === 'crow' ? 5.0 : c.type === 'deer' ? 5.5 : 3.0;

    if (dist < fleeRange) {
      if (c.state !== 'flee') {
        fleeEvents.push({ type: c.type, dist });
      }
      c.state = 'flee';
      c.timer = 1.2 + Math.random() * 0.8;
      c.dir = Math.atan2(c.z - pz, c.x - px) + (Math.random() - 0.5) * 0.6;
    } else {
      c.timer -= dt;
      if (c.timer <= 0) {
        if (c.state === 'flee') {
          c.state = 'idle';
          c.timer = 1.5 + Math.random() * 3;
        } else {
          c.state = 'wander';
          c.dir = Math.random() * Math.PI * 2;
          c.timer = 0.8 + Math.random() * 1.5;
        }
      }
    }

    if (c.state === 'flee' || c.state === 'wander') {
      const speed = c.state === 'flee'
        ? (c.type === 'bird' || c.type === 'crow' ? 9 : c.type === 'deer' ? 8 : c.type === 'fox' ? 7.5 : 6)
        : 1.5;
      const nx = c.x + Math.cos(c.dir) * speed * dt;
      const nz = c.z + Math.sin(c.dir) * speed * dt;
      if (!isBlocked(tiles, Math.floor(nx), Math.floor(c.z), w, h)) c.x = nx;
      else c.dir += Math.PI * 0.5 + Math.random() * 0.5;
      if (!isBlocked(tiles, Math.floor(c.x), Math.floor(nz), w, h)) c.z = nz;
      else c.dir += Math.PI * 0.5 + Math.random() * 0.5;
      c.x = Math.max(1, Math.min(w - 1, c.x));
      c.z = Math.max(1, Math.min(h - 1, c.z));
    }
  }
  return fleeEvents;
}

function cp(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

// Pixel-art critter drawing on a TILE_PX (48px) canvas
export function drawCritter(ctx, type, anim, state) {
  const s = ctx.canvas.width;
  const cx = s / 2;
  const moving = state === 'flee' || state === 'wander';
  const bob = moving ? Math.abs(Math.sin(anim)) * (state === 'flee' ? 3 : 1.5) : Math.sin(anim * 0.5) * 0.5;
  const baseY = s * 0.65 - bob;

  if (type === 'squirrel') {
    // bushy tail — sways as it runs
    const tailWag = Math.sin(anim * 0.8) * 2;
    cp(ctx, cx + 7, baseY - 13 + tailWag, 7, 11, '#6a4220');
    cp(ctx, cx + 5, baseY - 15 + tailWag, 10, 7, '#7a5230');
    cp(ctx, cx + 7, baseY - 17 + tailWag, 6, 5, '#8a6240');
    // body
    cp(ctx, cx - 6, baseY - 9, 13, 11, '#8a5a30');
    cp(ctx, cx - 4, baseY - 7, 9, 7, '#9a6a40');
    // belly
    cp(ctx, cx - 3, baseY - 4, 7, 4, '#b48a5a');
    // head
    cp(ctx, cx - 9, baseY - 13, 7, 7, '#8a5a30');
    cp(ctx, cx - 8, baseY - 12, 5, 5, '#9a6a40');
    // ears
    cp(ctx, cx - 9, baseY - 15, 2, 3, '#6a4020');
    cp(ctx, cx - 5, baseY - 15, 2, 3, '#6a4020');
    // eye
    cp(ctx, cx - 7, baseY - 11, 2, 2, '#1a1a1a');
    cp(ctx, cx - 6, baseY - 11, 1, 1, '#ffffff');
    // nose
    cp(ctx, cx - 10, baseY - 9, 2, 2, '#4a2a10');
    // feet — animate when moving
    if (moving) {
      const fl = Math.sin(anim) * 2;
      cp(ctx, cx - 4, baseY + Math.max(0, fl), 3, 2, '#6a4020');
      cp(ctx, cx + 1, baseY + Math.max(0, -fl), 3, 2, '#6a4020');
    } else {
      cp(ctx, cx - 4, baseY, 3, 2, '#6a4020');
      cp(ctx, cx + 1, baseY, 3, 2, '#6a4020');
      // nut in paws when idle
      cp(ctx, cx - 3, baseY - 2, 4, 3, '#8a6a3a');
    }
  } else if (type === 'rabbit') {
    // ears — flop when running
    const earBend = moving ? Math.sin(anim) * 1.5 : 0;
    cp(ctx, cx - 7, baseY - 19 + earBend, 3, 10, '#b4a494');
    cp(ctx, cx + 4, baseY - 19 - earBend, 3, 10, '#b4a494');
    cp(ctx, cx - 6, baseY - 18 + earBend, 1, 8, '#d4c4b4');
    cp(ctx, cx + 5, baseY - 18 - earBend, 1, 8, '#d4c4b4');
    // body
    cp(ctx, cx - 7, baseY - 9, 14, 11, '#c4b4a4');
    cp(ctx, cx - 5, baseY - 7, 10, 7, '#d4c4b4');
    // head
    cp(ctx, cx - 5, baseY - 13, 10, 9, '#c4b4a4');
    cp(ctx, cx - 3, baseY - 11, 6, 5, '#d4c4b4');
    // eyes
    cp(ctx, cx - 3, baseY - 9, 2, 2, '#1a1a1a');
    cp(ctx, cx + 2, baseY - 9, 2, 2, '#1a1a1a');
    // nose
    cp(ctx, cx - 1, baseY - 6, 2, 2, '#8a5a5a');
    // whiskers
    cp(ctx, cx - 4, baseY - 5, 3, 1, '#a4948499');
    cp(ctx, cx + 2, baseY - 5, 3, 1, '#a4948499');
    // cotton tail
    cp(ctx, cx + 6, baseY - 5, 4, 4, '#e4e4d4');
    // feet
    if (moving) {
      const fl = Math.sin(anim) * 2;
      cp(ctx, cx - 4, baseY + Math.max(0, fl), 4, 2, '#a49484');
      cp(ctx, cx + 1, baseY + Math.max(0, -fl), 4, 2, '#a49484');
    } else {
      cp(ctx, cx - 4, baseY, 4, 2, '#a49484');
      cp(ctx, cx + 1, baseY, 4, 2, '#a49484');
    }
  } else if (type === 'bird') {
    const wingFlap = state === 'flee' ? Math.abs(Math.sin(anim)) * 5 : Math.sin(anim * 0.3) * 1;
    const flyY = state === 'flee' ? -6 - Math.abs(Math.sin(anim)) * 2 : 0;
    // body
    cp(ctx, cx - 4, baseY - 7 + flyY, 9, 7, '#4a7aaa');
    cp(ctx, cx - 2, baseY - 5 + flyY, 5, 4, '#5a8aba');
    // head
    cp(ctx, cx + 2, baseY - 11 + flyY, 5, 5, '#4a7aaa');
    // beak
    cp(ctx, cx + 7, baseY - 9 + flyY, 4, 2, '#d4a020');
    // eye
    cp(ctx, cx + 4, baseY - 9 + flyY, 2, 2, '#1a1a1a');
    // wing — flaps up when fleeing
    cp(ctx, cx - 6, baseY - 6 + flyY - wingFlap, 7, 3, '#3a6a9a');
    cp(ctx, cx - 4, baseY - 4 + flyY - wingFlap * 0.5, 5, 2, '#2a5a8a');
    // tail feathers
    cp(ctx, cx - 7, baseY - 5 + flyY, 3, 3, '#3a6a9a');
    // legs — only visible when grounded
    if (state !== 'flee') {
      cp(ctx, cx - 2, baseY + flyY, 1, 3, '#8a7a4a');
      cp(ctx, cx + 2, baseY + flyY, 1, 3, '#8a7a4a');
    }
  } else if (type === 'deer') {
    // Deer — tall, graceful; bounds with all four legs when fleeing
    const bound = state === 'flee' ? Math.abs(Math.sin(anim)) * 4 : 0;
    const legSwing = moving ? Math.sin(anim) * 3 : 0;
    // antlers (on this stag)
    cp(ctx, cx - 6, baseY - 20, 2, 5, '#8a7a5a');
    cp(ctx, cx + 4, baseY - 20, 2, 5, '#8a7a5a');
    cp(ctx, cx - 9, baseY - 21, 4, 2, '#8a7a5a');
    cp(ctx, cx + 5, baseY - 21, 4, 2, '#8a7a5a');
    cp(ctx, cx - 10, baseY - 20, 2, 2, '#6a5a3a');
    cp(ctx, cx + 8, baseY - 20, 2, 2, '#6a5a3a');
    // head
    cp(ctx, cx - 3, baseY - 18 - bound, 7, 7, '#9a6a3a');
    cp(ctx, cx - 2, baseY - 16 - bound, 5, 4, '#aa7a4a');
    // snout
    cp(ctx, cx - 8, baseY - 14 - bound, 4, 3, '#8a5a2a');
    // eye
    cp(ctx, cx - 1, baseY - 15 - bound, 2, 2, '#1a1a1a');
    // ear
    cp(ctx, cx + 3, baseY - 19 - bound, 3, 4, '#8a5a30');
    // neck
    cp(ctx, cx - 1, baseY - 12 - bound, 5, 5, '#9a6a3a');
    // body — longer, chestnut brown
    cp(ctx, cx - 6, baseY - 9 - bound, 15, 10, '#9a6a3a');
    cp(ctx, cx - 4, baseY - 7 - bound, 11, 6, '#aa7a4a');
    // white rump patch (flashes when bounding away)
    cp(ctx, cx + 7, baseY - 7 - bound, 4, 5, '#e4d4b4');
    // legs — galloping animation
    if (moving) {
      cp(ctx, cx - 5, baseY + legSwing, 2, 6, '#8a5a30');
      cp(ctx, cx - 1, baseY - legSwing, 2, 6, '#8a5a30');
      cp(ctx, cx + 3, baseY + legSwing, 2, 6, '#8a5a30');
      cp(ctx, cx + 7, baseY - legSwing, 2, 6, '#8a5a30');
    } else {
      cp(ctx, cx - 5, baseY, 2, 5, '#8a5a30');
      cp(ctx, cx - 1, baseY, 2, 5, '#8a5a30');
      cp(ctx, cx + 3, baseY, 2, 5, '#8a5a30');
      cp(ctx, cx + 7, baseY, 2, 5, '#8a5a30');
    }
    // tail flash — white, flicks up when startled
    if (state === 'flee') cp(ctx, cx + 10, baseY - 9 - bound, 3, 4, '#f4e4c4');
  } else if (type === 'fox') {
    // Fox — slinks low, tail puffs out when fleeing
    const slink = moving ? Math.sin(anim) * 1.5 : 0;
    // bushy tail with white tip — swishes
    const tailSwish = Math.sin(anim * 0.6) * 3;
    cp(ctx, cx + 8, baseY - 10 + tailSwish, 6, 5, '#c45a20');
    cp(ctx, cx + 11, baseY - 8 + tailSwish, 4, 4, '#e4a070');
    cp(ctx, cx + 13, baseY - 7 + tailSwish, 3, 3, '#f4e4d4');
    // body — low and sleek
    cp(ctx, cx - 5, baseY - 8 + slink, 13, 8, '#c45a20');
    cp(ctx, cx - 3, baseY - 6 + slink, 9, 5, '#d46a30');
    // white chest
    cp(ctx, cx - 4, baseY - 3 + slink, 6, 3, '#e4d4c4');
    // head — pointed snout
    cp(ctx, cx - 8, baseY - 11 + slink, 7, 7, '#c45a20');
    cp(ctx, cx - 6, baseY - 9 + slink, 5, 4, '#d46a30');
    // snout
    cp(ctx, cx - 12, baseY - 9 + slink, 5, 3, '#b44a10');
    // nose tip
    cp(ctx, cx - 13, baseY - 9 + slink, 2, 2, '#1a1a1a');
    // ears — pointed, alert
    cp(ctx, cx - 8, baseY - 14 + slink, 2, 4, '#a44010');
    cp(ctx, cx - 5, baseY - 14 + slink, 2, 4, '#a44010');
    cp(ctx, cx - 8, baseY - 14 + slink, 1, 2, '#1a1a1a');
    cp(ctx, cx - 5, baseY - 14 + slink, 1, 2, '#1a1a1a');
    // eye — sharp amber
    cp(ctx, cx - 7, baseY - 10 + slink, 2, 2, '#e4a020');
    cp(ctx, cx - 6, baseY - 10 + slink, 1, 1, '#1a1a1a');
    // legs — quick trot
    if (moving) {
      const fl = Math.sin(anim) * 2;
      cp(ctx, cx - 4, baseY + Math.max(0, fl), 2, 4, '#a44010');
      cp(ctx, cx + 0, baseY + Math.max(0, -fl), 2, 4, '#a44010');
      cp(ctx, cx + 4, baseY + Math.max(0, fl), 2, 4, '#a44010');
      cp(ctx, cx + 7, baseY + Math.max(0, -fl), 2, 4, '#a44010');
    } else {
      cp(ctx, cx - 4, baseY, 2, 4, '#a44010');
      cp(ctx, cx + 0, baseY, 2, 4, '#a44010');
      cp(ctx, cx + 4, baseY, 2, 4, '#a44010');
      cp(ctx, cx + 7, baseY, 2, 4, '#a44010');
    }
  } else if (type === 'crow') {
    // Crow — larger than songbird, dark glossy, caws when fleeing
    const wingFlap = state === 'flee' ? Math.abs(Math.sin(anim)) * 6 : Math.sin(anim * 0.25) * 1;
    const flyY = state === 'flee' ? -8 - Math.abs(Math.sin(anim)) * 3 : 0;
    // body — larger, glossy black
    cp(ctx, cx - 5, baseY - 8 + flyY, 11, 8, '#1a1a2a');
    cp(ctx, cx - 3, baseY - 6 + flyY, 7, 5, '#2a2a3a');
    // head
    cp(ctx, cx + 2, baseY - 12 + flyY, 6, 6, '#1a1a2a');
    cp(ctx, cx + 3, baseY - 11 + flyY, 4, 3, '#2a2a3a');
    // heavy beak
    cp(ctx, cx + 8, baseY - 10 + flyY, 5, 3, '#3a3a3a');
    cp(ctx, cx + 8, baseY - 9 + flyY, 4, 1, '#5a5a5a');
    // eye — amber, intelligent
    cp(ctx, cx + 5, baseY - 10 + flyY, 2, 2, '#e4a020');
    cp(ctx, cx + 5, baseY - 10 + flyY, 1, 1, '#1a1a1a');
    // wings — large, powerful flaps
    cp(ctx, cx - 8, baseY - 7 + flyY - wingFlap, 8, 4, '#0a0a1a');
    cp(ctx, cx - 6, baseY - 5 + flyY - wingFlap * 0.5, 6, 2, '#1a1a2a');
    // tail feathers — fan out
    cp(ctx, cx - 9, baseY - 5 + flyY, 4, 4, '#0a0a1a');
    cp(ctx, cx - 9, baseY - 3 + flyY, 3, 3, '#1a1a2a');
    // legs — black, only when grounded
    if (state !== 'flee') {
      cp(ctx, cx - 2, baseY + flyY, 1, 4, '#3a3a3a');
      cp(ctx, cx + 2, baseY + flyY, 1, 4, '#3a3a3a');
      // feet
      cp(ctx, cx - 3, baseY + 3 + flyY, 3, 1, '#3a3a3a');
      cp(ctx, cx + 1, baseY + 3 + flyY, 3, 1, '#3a3a3a');
    }
  }
}