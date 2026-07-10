// Encounter trigger system — evaluates conditions for Scooby-Doo style villain encounters.
// Each villain has a `triggers` object defining when/where they can appear.
// ALL conditions in the trigger must be met simultaneously for the encounter to fire.
//
// Supported trigger conditions:
//   night: true              — only at night
//   timeRange: [300, 1170]   — only between these in-game minutes (0-1440)
//   zone: 'shore'            — only in this zone (defaults to villain.zone)
//   weather: ['fog', ...]    — only during these weather types
//   minDay: 3                — player must have reached this day
//   questFlag: 'questNoteFound' — state.flags must have this flag set
//   requireVillainUnmasked: 'id' — another villain must already be unmasked (chaining)
//   nearTile: T.RUIN         — player must be within `nearRadius` tiles of this tile type
//   nearObject: 'antique'    — player must be near an uncollected ground object of this type
//   minDistance: 6           — villain spawns at least this many tiles from the player
//   spawnChance: 0.003       — per-frame probability once all conditions are met (throttles frequency)
//   cooldownDay: 1           — won't re-trigger for N in-game days after last attempt

import { VILLAINS } from './story';

// Track last encounter attempt per villain to enforce cooldown
const lastAttempt = {}; // villainId -> in-game day number

export function checkTrigger(trigger, state, game) {
  if (!trigger) return false;

  // zone check
  const requiredZone = trigger.zone || (VILLAINS.find(v => v.triggers === trigger)?.zone);
  if (requiredZone && state.zone !== requiredZone) return false;

  // night check
  if (trigger.night && !game.atm.isNight(state.time)) return false;

  // time range
  if (trigger.timeRange) {
    const [start, end] = trigger.timeRange;
    if (state.time < start || state.time > end) return false;
  }

  // weather
  if (trigger.weather && !trigger.weather.includes(state.weather)) return false;

  // minimum day
  if (trigger.minDay && state.day < trigger.minDay) return false;

  // quest flag
  if (trigger.questFlag) {
    if (!state.flags || !state.flags[trigger.questFlag]) return false;
  }

  // villain chaining — another villain must already be unmasked
  if (trigger.requireVillainUnmasked) {
    if (!state.villainsUnmasked || !state.villainsUnmasked.includes(trigger.requireVillainUnmasked)) return false;
  }

  // already unmasked this villain? no repeat
  if (state.villainsUnmasked && state.villainsUnmasked.includes(trigger._villainId)) return false;

  // proximity to a specific tile type
  if (trigger.nearTile) {
    const radius = trigger.nearRadius || 5;
    const p = state.player;
    let found = false;
    const px = Math.floor(p.x), py = Math.floor(p.y);
    for (let dy = -radius; dy <= radius && !found; dy++) {
      for (let dx = -radius; dx <= radius && !found; dx++) {
        const tx = px + dx, ty = py + dy;
        if (tx < 0 || ty < 0 || tx >= game.zone.w || ty >= game.zone.h) continue;
        if (game.tiles[ty][tx] === trigger.nearTile) found = true;
      }
    }
    if (!found) return false;
  }

  // proximity to an uncollected ground object
  if (trigger.nearObject) {
    const radius = trigger.nearRadius || 5;
    const p = state.player;
    const found = game.zone.objects.some(o =>
      !o.collected && o.type === trigger.nearObject &&
      Math.abs(o.x - p.x) < radius && Math.abs(o.y - p.y) < radius
    );
    if (!found) return false;
  }

  return true;
}

// Returns the villain to encounter, or null.
// Called each frame from the engine; respects spawnChance + cooldown.
export function evaluateEncounters(state, game) {
  for (const villain of VILLAINS) {
    if (!villain.triggers) continue;
    if (state.villainsUnmasked && state.villainsUnmasked.includes(villain.id)) continue;
    if (game.pendingVillainReveal || game.dialogue || game.confrontation) continue; // don't stack encounters

    const trigger = { ...villain.triggers, _villainId: villain.id };

    // cooldown check
    if (trigger.cooldownDay) {
      const last = lastAttempt[villain.id];
      if (last !== undefined && state.day - last < trigger.cooldownDay) continue;
    }

    if (!checkTrigger(trigger, state, game)) continue;

    // spawn chance — throttles how often the encounter actually fires once conditions are met
    const chance = trigger.spawnChance !== undefined ? trigger.spawnChance : 0.002;
    if (Math.random() > chance) continue;

    // record attempt for cooldown
    lastAttempt[villain.id] = state.day;

    return villain;
  }
  return null;
}