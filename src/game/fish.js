// 100 fish and aquatic life species with rarity-based catch system

export const FISH_RARITY = {
  common:    { name: 'Common',    icon: '🐟', color: '#7a9ab0', weight: 1000 },
  uncommon:  { name: 'Uncommon',  icon: '🐠', color: '#5aaa7a', weight: 350 },
  rare:      { name: 'Rare',      icon: '🐡', color: '#b070d0', weight: 100 },
  epic:      { name: 'Epic',      icon: '🦈', color: '#e0a040', weight: 25 },
  legendary: { name: 'Legendary', icon: '🐋', color: '#e04040', weight: 5 },
};

function f(id, name, rarity, value) {
  return { id, name, rarity, value };
}

export const FISH_TABLE = [
  // ── Common (40) ──
  f('sardine', 'Sardine', 'common', 3),
  f('anchovy', 'Anchovy', 'common', 2),
  f('mackerel', 'Mackerel', 'common', 5),
  f('herring', 'Herring', 'common', 4),
  f('smelt', 'Smelt', 'common', 3),
  f('capelin', 'Capelin', 'common', 4),
  f('pilchard', 'Pilchard', 'common', 3),
  f('sprat', 'Sprat', 'common', 2),
  f('sand_eel', 'Sand Eel', 'common', 3),
  f('silverside', 'Silverside', 'common', 4),
  f('minnow', 'Minnow', 'common', 2),
  f('dace', 'Dace', 'common', 3),
  f('bleak', 'Bleak', 'common', 2),
  f('gudgeon', 'Gudgeon', 'common', 3),
  f('bluegill', 'Bluegill', 'common', 5),
  f('sunfish', 'Sunfish', 'common', 5),
  f('perch', 'Perch', 'common', 6),
  f('crappie', 'Crappie', 'common', 5),
  f('bream', 'Bream', 'common', 6),
  f('roach', 'Roach', 'common', 4),
  f('chub', 'Chub', 'common', 4),
  f('whitebait', 'Whitebait', 'common', 4),
  f('kelp_bass', 'Kelp Bass', 'common', 7),
  f('sea_bream', 'Sea Bream', 'common', 6),
  f('mullet', 'Mullet', 'common', 5),
  f('croaker', 'Croaker', 'common', 5),
  f('spot', 'Spot', 'common', 4),
  f('pinfish', 'Pinfish', 'common', 3),
  f('tomcod', 'Tomcod', 'common', 5),
  f('sand_smelt', 'Sand Smelt', 'common', 3),
  f('alewife', 'Alewife', 'common', 4),
  f('threadfin', 'Threadfin', 'common', 4),
  f('menhaden', 'Menhaden', 'common', 5),
  f('hake', 'Hake', 'common', 6),
  f('pollock', 'Pollock', 'common', 7),
  f('whiting', 'Whiting', 'common', 5),
  f('bluefish', 'Bluefish', 'common', 7),
  f('skipjack', 'Skipjack', 'common', 8),
  f('bonito', 'Bonito', 'common', 7),
  f('dolly_varden', 'Dolly Varden', 'common', 6),

  // ── Uncommon (25) ──
  f('moonfish', 'Moonfish', 'uncommon', 12),
  f('rainbow_trout', 'Rainbow Trout', 'uncommon', 15),
  f('sea_bass', 'Sea Bass', 'uncommon', 18),
  f('snapper', 'Snapper', 'uncommon', 20),
  f('grouper', 'Grouper', 'uncommon', 22),
  f('cod', 'Cod', 'uncommon', 15),
  f('haddock', 'Haddock', 'uncommon', 14),
  f('halibut', 'Halibut', 'uncommon', 25),
  f('flounder', 'Flounder', 'uncommon', 12),
  f('sole', 'Sole', 'uncommon', 14),
  f('turbot', 'Turbot', 'uncommon', 18),
  f('plaice', 'Plaice', 'uncommon', 12),
  f('skate', 'Skate', 'uncommon', 16),
  f('ray', 'Ray', 'uncommon', 15),
  f('eel', 'Eel', 'uncommon', 13),
  f('conger', 'Conger Eel', 'uncommon', 15),
  f('pike', 'Pike', 'uncommon', 18),
  f('walleye', 'Walleye', 'uncommon', 16),
  f('mahi_mahi', 'Mahi Mahi', 'uncommon', 20),
  f('wahoo', 'Wahoo', 'uncommon', 22),
  f('tuna', 'Tuna', 'uncommon', 25),
  f('barracuda', 'Barracuda', 'uncommon', 18),
  f('tarpon', 'Tarpon', 'uncommon', 20),
  f('bonefish', 'Bonefish', 'uncommon', 15),
  f('permit', 'Permit', 'uncommon', 17),

  // ── Rare (20) ──
  f('ghost_eel', 'Ghost Eel', 'rare', 35),
  f('phantom_pike', 'Phantom Pike', 'rare', 40),
  f('mist_wraith_eel', 'Mist Wraith Eel', 'rare', 38),
  f('shadow_bass', 'Shadow Bass', 'rare', 35),
  f('twilight_salmon', 'Twilight Salmon', 'rare', 42),
  f('moonbeam_carp', 'Moonbeam Carp', 'rare', 45),
  f('stargazer', 'Stargazer', 'rare', 40),
  f('lantern_fish', 'Lantern Fish', 'rare', 45),
  f('anglerfish', 'Anglerfish', 'rare', 50),
  f('lionfish', 'Lionfish', 'rare', 42),
  f('stonefish', 'Stonefish', 'rare', 45),
  f('pufferfish', 'Pufferfish', 'rare', 38),
  f('moray_eel', 'Moray Eel', 'rare', 40),
  f('octopus', 'Octopus', 'rare', 45),
  f('squid', 'Squid', 'rare', 35),
  f('cuttlefish', 'Cuttlefish', 'rare', 48),
  f('nautilus', 'Nautilus', 'rare', 55),
  f('sea_spider', 'Sea Spider', 'rare', 30),
  f('horseshoe_crab', 'Horseshoe Crab', 'rare', 32),
  f('lobster', 'Lobster', 'rare', 50),

  // ── Epic (10) ──
  f('abyssal_lantern', 'Abyssal Lantern', 'epic', 100),
  f('crystal_anglerfish', 'Crystal Anglerfish', 'epic', 120),
  f('void_serpent', 'Void Serpent', 'epic', 130),
  f('spectral_krakenling', 'Spectral Krakenling', 'epic', 140),
  f('midnight_marlin', 'Midnight Marlin', 'epic', 110),
  f('ember_fish', 'Ember Fish', 'epic', 90),
  f('frost_pike', 'Frost Pike', 'epic', 95),
  f('storm_eel', 'Storm Eel', 'epic', 105),
  f('voidfin', 'Voidfin', 'epic', 125),
  f('coral_crown', 'Coral Crown Fish', 'epic', 150),

  // ── Legendary (5) ──
  f('leviathan_spawn', 'Leviathan Spawn', 'legendary', 500),
  f('ancient_krakenling', 'Ancient Krakenling', 'legendary', 700),
  f('tidal_titan', 'Tidal Titan', 'legendary', 600),
  f('abyssal_sovereign', 'Abyssal Sovereign', 'legendary', 800),
  f('the_old_one', 'The Old One', 'legendary', 1000),
];

// Weighted random fish selection
export function rollFish() {
  const totalWeight = Object.values(FISH_RARITY).reduce((a, b) => a + b.weight, 0);
  let roll = Math.random() * totalWeight;
  let selectedRarity = 'common';
  for (const [rarity, info] of Object.entries(FISH_RARITY)) {
    roll -= info.weight;
    if (roll <= 0) { selectedRarity = rarity; break; }
  }
  const pool = FISH_TABLE.filter(fish => fish.rarity === selectedRarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getFishInfo(id) {
  return FISH_TABLE.find(fish => fish.id === id);
}

export function getRarityInfo(rarity) {
  return FISH_RARITY[rarity];
}

// Get sell price for any fish id (fallback for non-fish items)
export function getFishSellPrice(id) {
  const fish = getFishInfo(id);
  return fish ? fish.value : 0;
}

// Get display info for any item id (fish or regular)
export function getFishDisplay(id) {
  const fish = getFishInfo(id);
  if (fish) {
    const r = FISH_RARITY[fish.rarity];
    return { name: fish.name, icon: r.icon, color: r.color, rarity: fish.rarity, rarityName: r.name };
  }
  return null;
}