// Seasonal system — foliage color palettes and season-aware weather picking.
// Seasons shift automatically every 14 days (see engine.endDay).
// Special weather events (glowing fog, silent snow, blood moon) are rare
// and dramatically change how the island looks.

export const SEASONAL_FOLIAGE = {
  autumn: {
    treeCanopy: 0x8a6a2a,
    treeCanopyLight: 0xaa8a3a,
    pineCanopy: 0x2a4a34,
    pineCanopyLight: 0x3a5a44,
    bushColor: 0x3a4a2a,
    bushLight: 0x4a5a3a,
    grassTint: 0xc4a040,   // golden autumn grass
  },
  winter: {
    treeCanopy: 0x8a9aa8,  // frosty grey-blue bare branches
    treeCanopyLight: 0xa0b0bc,
    pineCanopy: 0x3a4a44,
    pineCanopyLight: 0x4a5a54,
    bushColor: 0x4a5a52,
    bushLight: 0x5a6a62,
    grassTint: 0xc8d0c8,   // frosty white-green
  },
  spring: {
    treeCanopy: 0x5a9a4a,  // fresh bright green
    treeCanopyLight: 0x6aaa5a,
    pineCanopy: 0x2a5a34,
    pineCanopyLight: 0x3a6a44,
    bushColor: 0x3a6a3a,
    bushLight: 0x4a7a4a,
    grassTint: 0x6a9a50,   // vibrant spring green
  },
  summer: {
    treeCanopy: 0x2a5a2a,  // deep lush green
    treeCanopyLight: 0x3a6a3a,
    pineCanopy: 0x1a3a24,
    pineCanopyLight: 0x2a4a34,
    bushColor: 0x2a4a2a,
    bushLight: 0x3a5a3a,
    grassTint: 0x4a8a40,   // deep summer green
  },
};

export function getSeasonalFoliage(season) {
  return SEASONAL_FOLIAGE[season] || SEASONAL_FOLIAGE.autumn;
}

// Season-aware weather picking. Each season has different probabilities,
// and special weather events have a small chance to occur.
export function pickSeasonalWeather(r, interior, season) {
  if (interior) return 'clear';
  const roll = r();

  // Seasonal weather weight tables: [clear, drizzle, rain, storm, fog, heavyFog]
  const tables = {
    autumn:  [0.24, 0.17, 0.15, 0.06, 0.15, 0.12],
    winter:  [0.28, 0.10, 0.08, 0.05, 0.12, 0.10],
    spring:  [0.26, 0.22, 0.16, 0.08, 0.08, 0.06],
    summer:  [0.38, 0.12, 0.10, 0.12, 0.06, 0.04],
  };
  const t = tables[season] || tables.autumn;

  // Special weather — rare, rarer in summer
  const specialChance = season === 'summer' ? 0.04 : 0.07;
  if (roll < specialChance) {
    const sRoll = r();
    if (sRoll < 0.40) return 'glowing_fog';
    if (sRoll < 0.75) return 'silent_snow';
    return 'blood_moon';
  }

  // Standard weather distribution
  let acc = specialChance;
  const labels = ['clear', 'drizzle', 'rain', 'storm', 'fog', 'heavy_fog'];
  for (let i = 0; i < t.length; i++) {
    acc += t[i];
    if (roll < acc) return labels[i];
  }
  return 'clear';
}