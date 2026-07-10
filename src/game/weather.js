// Weather system — weather types, mood, and spirit manifestations
// Weather influences fog density, rain, color mood, and which spirits appear.

export const WEATHER_TYPES = {
  clear:     { label: 'Clear',      fogBoost: 0,    rain: false,  mood: 'cozy',   darkness: 0,    lightning: false },
  drizzle:   { label: 'Drizzle',   fogBoost: 0.10, rain: 'light', mood: 'mellow', darkness: 0.05, lightning: false },
  rain:      { label: 'Rain',      fogBoost: 0.15, rain: 'full',  mood: 'somber', darkness: 0.10, lightning: false },
  storm:     { label: 'Storm',     fogBoost: 0.25, rain: 'heavy', mood: 'unease', darkness: 0.25, lightning: true },
  fog:       { label: 'Fog',       fogBoost: 0.40, rain: false,   mood: 'eerie',  darkness: 0.08, lightning: false },
  heavy_fog: { label: 'Heavy Fog', fogBoost: 0.80, rain: false,   mood: 'dread',  darkness: 0.16, lightning: false },
  // ── Special weather events — rare, dramatic, change how the island looks ──
  glowing_fog: { label: 'Glowing Fog', fogBoost: 0.70, rain: false, mood: 'eerie',  darkness: 0.12, lightning: false, special: true, glow: true },
  silent_snow: { label: 'Silent Snow',  fogBoost: 0.20, rain: false, mood: 'cozy',   darkness: 0.08, lightning: false, special: true, snow: true },
  blood_moon:  { label: 'Blood Moon',   fogBoost: 0.15, rain: false, mood: 'dread',  darkness: 0.20, lightning: false, special: true, redTint: true },
};

// Spirits that manifest based on weather (and sometimes time of day)
export const SPIRITS = {
  pale:    { color: '#d4d4e4', eye: '#3a3a5a', size: 1.0,  weather: ['clear'],        nightOnly: true },
  wisp:    { color: '#a0e890', eye: '#e0ffc0', size: 0.65, weather: ['fog', 'heavy_fog', 'glowing_fog'], nightOnly: false, glow: true },
  shadow:  { color: '#1a1a2a', eye: '#ff3a2a', size: 1.15, weather: ['heavy_fog', 'storm', 'blood_moon'], nightOnly: true },
  drowned: { color: '#5a8aaa', eye: '#a0d0f0', size: 0.95, weather: ['rain', 'drizzle', 'storm'], nightOnly: true, drip: true },
  wraith:  { color: '#2a1a3a', eye: '#ff2aff', size: 1.25, weather: ['storm'],        nightOnly: true, crackle: true },
};

export function rollSpirit(weather, isNight) {
  const candidates = Object.values(SPIRITS).filter(s =>
    s.weather.includes(weather) && (!s.nightOnly || isNight)
  );
  if (candidates.length === 0) return 'pale';
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  // return the key
  return Object.keys(SPIRITS).find(k => SPIRITS[k] === picked);
}

export function getSpirit(type) {
  return SPIRITS[type] || SPIRITS.pale;
}

export function pickWeather(r, interior) {
  if (interior) return 'clear';
  const roll = r();
  if (roll < 0.28) return 'clear';
  if (roll < 0.46) return 'drizzle';
  if (roll < 0.61) return 'rain';
  if (roll < 0.72) return 'storm';
  if (roll < 0.86) return 'fog';
  return 'heavy_fog';
}