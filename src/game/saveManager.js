// Save slot management for Whispering Pines
const META_KEY = 'whispering_pines_meta';
export const SAVE_PREFIX = 'whispering_pines_save_';

export function getSaveMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '[]'); }
  catch { return []; }
}

export function getSaveSlots() {
  const meta = getSaveMeta();
  const slots = [];
  for (let i = 0; i < 3; i++) {
    if (meta[i]) slots.push({ ...meta[i], slot: i, exists: true });
    else slots.push({ slot: i, exists: false });
  }
  return slots;
}

export function deleteSave(slot) {
  localStorage.removeItem(SAVE_PREFIX + slot);
  const meta = getSaveMeta();
  delete meta[slot];
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function saveMeta(slot, state) {
  const meta = getSaveMeta();
  meta[slot] = {
    characterName: state.character?.name || 'Survivor',
    day: state.day || 1,
    zone: state.zone || 'shore',
    level: state.level || 1,
    timestamp: Date.now(),
  };
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}