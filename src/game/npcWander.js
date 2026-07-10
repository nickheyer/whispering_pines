// NPC wandering AI — NPCs amble around their home area during the day
// and retreat inside their houses at 22:00 (1320 min), re-emerging at 06:00.
import { TIME_START } from './constants';

const NIGHT_HOUR = 1320; // 22:00
const MORNING_HOUR = TIME_START; // 06:00
const WANDER_RADIUS = 5;
const SHOP_RADIUS = 1.5;

export function installNpcWander(Game) {
  Game.prototype.updateNpcs = function (dt) {
    if (!this.zone || !this.zone.npcs || this.zone.def && this.zone.def.interior) return;
    const time = this.state.time;
    const isNight = time >= NIGHT_HOUR || time < MORNING_HOUR;

    for (const npc of this.zone.npcs) {
      // initialize per-npc wander state anchored to spawn position
      if (!npc._wander) {
        npc._wander = {
          homeX: npc.x, homeY: npc.y,
          targetX: npc.x, targetY: npc.y,
          pause: 1 + Math.random() * 3,
          state: isNight ? 'inside' : 'idle',
          speed: 0.7 + Math.random() * 0.4,
        };
        npc.dir = npc.dir || 0;
      }
      const w = npc._wander;
      const radius = npc.shop ? SHOP_RADIUS : WANDER_RADIUS;

      // ── Inside for the night — re-emerge at dawn ──
      if (w.state === 'inside') {
        if (!isNight) {
          w.state = 'idle';
          npc.x = w.homeX; npc.y = w.homeY;
          w.pause = 0.5 + Math.random() * 2;
        }
        continue;
      }

      // ── Night falls — head home ──
      if (isNight) {
        w.state = 'going_home';
      }

      // ── Movement: either walking home or wandering to a target ──
      if (w.state === 'going_home') {
        _stepTowards(this, npc, w, w.homeX, w.homeY, dt, 1.4);
        const d = Math.hypot(w.homeX - npc.x, w.homeY - npc.y);
        if (d < 0.3) { npc.x = w.homeX; npc.y = w.homeY; w.state = 'inside'; }
        continue;
      }

      if (w.state === 'walking') {
        const arrived = _stepTowards(this, npc, w, w.targetX, w.targetY, dt, 1.0);
        if (arrived) { w.state = 'idle'; w.pause = 1.5 + Math.random() * 4; }
        continue;
      }

      // idle — tick down pause, then pick a new wander target
      w.pause -= dt;
      if (w.pause <= 0) {
        const tgt = _pickWanderTarget(this, w, radius);
        if (tgt) { w.targetX = tgt.x; w.targetY = tgt.y; w.state = 'walking'; }
        else { w.pause = 2 + Math.random() * 3; }
      }
    }
  };
}

function _stepTowards(game, npc, w, tx, ty, dt, mult) {
  const dx = tx - npc.x, dy = ty - npc.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.3) return true;
  const spd = w.speed * mult;
  const nx = npc.x + (dx / d) * spd * dt;
  const ny = npc.y + (dy / d) * spd * dt;
  let moved = false;
  if (!game.isSolid(Math.floor(nx), Math.floor(npc.y))) { npc.x = nx; moved = true; }
  if (!game.isSolid(Math.floor(npc.x), Math.floor(ny))) { npc.y = ny; moved = true; }
  if (!moved) return true; // blocked — treat as arrived so NPC picks a new target
  npc.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 2) : (dy > 0 ? 0 : 1);
  return false;
}

function _pickWanderTarget(game, w, radius) {
  for (let tries = 0; tries < 10; tries++) {
    const ang = Math.random() * Math.PI * 2;
    const r = 1 + Math.random() * radius;
    const tx = w.homeX + Math.cos(ang) * r;
    const ty = w.homeY + Math.sin(ang) * r;
    const txi = Math.floor(tx), tyi = Math.floor(ty);
    if (txi > 0 && tyi > 0 && txi < game.zone.w - 1 && tyi < game.zone.h - 1 && !game.isSolid(txi, tyi)) {
      return { x: tx, y: ty };
    }
  }
  return null;
}