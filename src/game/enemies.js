// Grotto enemy definitions, spawning, and scaling

export const ENEMY_TYPES = [
  { id: 'slime', name: 'Cave Slime', baseHp: 12, baseAtk: 3, xp: 8, color: '#5a8a4a', dark: '#3a6a2a', speed: 0.8, minFloor: 1,
    desc: 'A gelatinous blob that oozes through the caverns. Slow but persistent — it dissolves anything it touches.' },
  { id: 'bat', name: 'Cave Bat', baseHp: 8, baseAtk: 4, xp: 10, color: '#5a4a6a', dark: '#3a2a4a', speed: 1.8, minFloor: 1,
    desc: 'A screeching bat that swoops from the darkness. Fast and erratic, but fragile.' },
  { id: 'rat', name: 'Drowned Rat', baseHp: 10, baseAtk: 3, xp: 7, color: '#6a5a4a', dark: '#4a3a2a', speed: 1.2, minFloor: 1,
    desc: 'A waterlogged rodent, swollen and furious. It nests in the damp corners of the upper grotto.' },
  { id: 'cave_newt', name: 'Pale Newt', baseHp: 9, baseAtk: 4, xp: 9, color: '#8a9a7a', dark: '#5a6a4a', speed: 1.0, minFloor: 2,
    desc: 'A translucent amphibian that clings to wet cavern walls. Its skin secretes a mild hallucinogen.' },
  { id: 'rock_crab', name: 'Rock Crab', baseHp: 15, baseAtk: 4, xp: 11, color: '#7a6a5a', dark: '#5a4a3a', speed: 0.9, minFloor: 3,
    desc: 'A crustacean with a shell like granite. It scuttles sideways and pinches with claws strong enough to bend iron.' },
  { id: 'glow_worm', name: 'Glow Worm', baseHp: 7, baseAtk: 5, xp: 10, color: '#aaffaa', dark: '#4a8a4a', speed: 0.6, minFloor: 4,
    desc: 'A bioluminescent worm that dangles from ceilings. Its light mesmerizes prey before it strikes.' },
  { id: 'centipede', name: 'Cave Centipede', baseHp: 14, baseAtk: 5, xp: 12, color: '#8a6a3a', dark: '#5a4a1a', speed: 1.6, minFloor: 5,
    desc: 'A many-legged horror that skitters across the walls. Its bite injects a paralyzing venom.' },
  { id: 'moss_lurker', name: 'Moss Lurker', baseHp: 18, baseAtk: 5, xp: 13, color: '#3a5a2a', dark: '#2a3a1a', speed: 0.7, minFloor: 6,
    desc: 'A flat, camouflaged predator that blends perfectly into mossy floors. You never see it until it has you.' },
  { id: 'tunnel_mole', name: 'Burrow Mole', baseHp: 20, baseAtk: 4, xp: 12, color: '#5a4a3a', dark: '#3a2a1a', speed: 1.1, minFloor: 7,
    desc: 'A blind, furless mole the size of a dog. It tunnels through rock as if it were soft earth.' },
  { id: 'mushroom_zombie', name: 'Spore Walker', baseHp: 22, baseAtk: 5, xp: 16, color: '#7a5a4a', dark: '#4a3a2a', speed: 0.7, minFloor: 8,
    desc: 'A corpse overtaken by parasitic fungi. It shambles endlessly, releasing toxic spores with every step.' },
  { id: 'echo_bat', name: 'Echo Bat', baseHp: 12, baseAtk: 7, xp: 18, color: '#4a3a5a', dark: '#2a1a3a', speed: 2.0, minFloor: 9,
    desc: 'A larger cousin of the cave bat. Its screech disorients explorers, making them easy prey in the dark.' },
  { id: 'spider', name: 'Cave Spider', baseHp: 16, baseAtk: 5, xp: 15, color: '#3a2a3a', dark: '#2a1a2a', speed: 1.4, minFloor: 10,
    desc: 'A hairy, multi-eyed predator that drops from the ceiling. Its webs can trap even the strongest explorer.' },
  { id: 'gem_beetle', name: 'Gem Beetle', baseHp: 18, baseAtk: 6, xp: 19, color: '#aa6aaa', dark: '#6a3a6a', speed: 1.3, minFloor: 11,
    desc: 'An iridescent beetle with a carapace of living crystal. Its mandibles can chew through steel.' },
  { id: 'crystal_wraith', name: 'Crystal Wraith', baseHp: 20, baseAtk: 7, xp: 20, color: '#5a8aaa', dark: '#3a5a7a', speed: 1.1, minFloor: 12,
    desc: 'A spirit bound to the crystal formations. It phases through solid rock and attacks with shards of light.' },
  { id: 'stalactite_horror', name: 'Stalactite Horror', baseHp: 24, baseAtk: 6, xp: 22, color: '#6a7a8a', dark: '#4a5a6a', speed: 0.5, minFloor: 13,
    desc: 'A creature that disguises itself as a hanging stalactite. It drops onto prey and impales with rocky spikes.' },
  { id: 'fossil_spirit', name: 'Fossil Spirit', baseHp: 22, baseAtk: 8, xp: 24, color: '#c4b48a', dark: '#8a7a5a', speed: 1.0, minFloor: 14,
    desc: 'The ghost of a prehistoric creature, trapped in stone for millennia. It attacks with the rage of extinction.' },
  { id: 'skeleton', name: 'Skeleton', baseHp: 25, baseAtk: 7, xp: 25, color: '#d0d0c0', dark: '#a0a090', speed: 0.9, minFloor: 15,
    desc: 'The animated bones of a long-dead explorer. It wields a rusted blade and feels no pain.' },
  { id: 'cavern_fish', name: 'Cavern Fish', baseHp: 20, baseAtk: 8, xp: 23, color: '#4a8a9a', dark: '#2a5a6a', speed: 1.7, minFloor: 16,
    desc: 'A blind, eyeless fish that swims through flooded tunnels. Its teeth are needle-thin and infinitely sharp.' },
  { id: 'amber_golem', name: 'Amber Golem', baseHp: 35, baseAtk: 7, xp: 28, color: '#c48a2a', dark: '#8a5a1a', speed: 0.5, minFloor: 17,
    desc: 'A humanoid figure frozen in ancient amber, now animate. Things preserved inside it twitch and writhe.' },
  { id: 'cave_troll', name: 'Cave Troll', baseHp: 40, baseAtk: 8, xp: 30, color: '#6a7a5a', dark: '#4a5a3a', speed: 0.6, minFloor: 18,
    desc: 'A massive, hunched brute that lurks in the deeper caverns. Slow, but one blow can shatter stone.' },
  { id: 'web_weaver', name: 'Web Weaver', baseHp: 28, baseAtk: 9, xp: 29, color: '#5a5a3a', dark: '#3a3a1a', speed: 1.2, minFloor: 19,
    desc: 'A giant arachnid that spins webs across entire tunnels. It cocoons its prey alive and saves them for later.' },
  { id: 'dust_mummy', name: 'Dust Mummy', baseHp: 32, baseAtk: 8, xp: 30, color: '#c4b48a', dark: '#8a7a4a', speed: 0.7, minFloor: 20,
    desc: 'A desiccated corpse wrapped in rotted linen. Its touch withers flesh and its breath is a cloud of grave-dust.' },
  { id: 'grave_crawler', name: 'Grave Crawler', baseHp: 26, baseAtk: 10, xp: 31, color: '#5a3a2a', dark: '#3a1a0a', speed: 1.5, minFloor: 21,
    desc: 'A centipede-like horror that feasts on the dead. It burrows through bone piles and erupts without warning.' },
  { id: 'bone_serpent', name: 'Bone Serpent', baseHp: 30, baseAtk: 9, xp: 28, color: '#d4d4c4', dark: '#a0a090', speed: 1.3, minFloor: 22,
    desc: 'A sinuous, skeletal snake that slithers through the bone-strewn depths. Its jaws can crush armor.' },
  { id: 'venom_toad', name: 'Venom Toad', baseHp: 34, baseAtk: 9, xp: 32, color: '#8aaa3a', dark: '#5a7a1a', speed: 0.8, minFloor: 23,
    desc: 'A bloated toad the size of a barrel. Its skin weeps a caustic poison that eats through armor and flesh alike.' },
  { id: 'rust_serpent', name: 'Rust Serpent', baseHp: 28, baseAtk: 11, xp: 33, color: '#8a5a3a', dark: '#5a3a1a', speed: 1.4, minFloor: 24,
    desc: 'A metallic snake that feeds on iron and blood. Its scales are oxidized blades — every coil cuts.' },
  { id: 'ghoul', name: 'Ghoul', baseHp: 35, baseAtk: 9, xp: 35, color: '#7a8a6a', dark: '#5a6a4a', speed: 1.0, minFloor: 25,
    desc: 'A flesh-hungry undead, gaunt and ravenous. It was once human, but the grotto\'s hunger changed it.' },
  { id: 'ember_salamander', name: 'Ember Salamander', baseHp: 30, baseAtk: 12, xp: 36, color: '#d46a2a', dark: '#9a3a1a', speed: 1.2, minFloor: 26,
    desc: 'A lizard wreathed in eternal flame. It leaves scorched footprints and ignites the air around it.' },
  { id: 'ash_wraith', name: 'Ash Wraith', baseHp: 33, baseAtk: 11, xp: 38, color: '#6a6a5a', dark: '#4a4a3a', speed: 1.3, minFloor: 28,
    desc: 'A spirit born from cremated remains. It suffocates victims by filling their lungs with ash and soot.' },
  { id: 'frost_sprite', name: 'Frost Sprite', baseHp: 26, baseAtk: 13, xp: 37, color: '#aaddff', dark: '#5a9abb', speed: 1.6, minFloor: 29,
    desc: 'A tiny, malicious fae made of living ice. It freezes moisture in the air into needle-sharp projectiles.' },
  { id: 'fire_imp', name: 'Fire Imp', baseHp: 28, baseAtk: 11, xp: 32, color: '#d44a2a', dark: '#9a2a1a', speed: 1.5, minFloor: 30,
    desc: 'A cackling demon of flame that thrives in the volcanic depths. It hurls embers and laughs as they burn.' },
  { id: 'ice_lurker', name: 'Ice Lurker', baseHp: 38, baseAtk: 10, xp: 35, color: '#8ac4e0', dark: '#4a8aaa', speed: 0.9, minFloor: 32,
    desc: 'A frozen horror that dwells in the deepest cold. Its touch numbs the soul and slows the body.' },
  { id: 'glacier_beast', name: 'Glacier Beast', baseHp: 50, baseAtk: 11, xp: 40, color: '#5a8aca', dark: '#3a5a9a', speed: 0.6, minFloor: 33,
    desc: 'A hulking creature of ice and frozen flesh. Its footsteps crack the floor and its breath freezes stone.' },
  { id: 'rime_stalker', name: 'Rime Stalker', baseHp: 42, baseAtk: 13, xp: 42, color: '#9ac4e0', dark: '#5a8aaa', speed: 1.4, minFloor: 35,
    desc: 'A predator adapted to the frozen depths. It moves silently across ice, leaving no tracks — only frostbite.' },
  { id: 'dark_knight', name: 'Dark Knight', baseHp: 45, baseAtk: 12, xp: 42, color: '#3a3a4e', dark: '#1a1a2e', speed: 0.8, minFloor: 38,
    desc: 'An armored warrior, corrupted by the abyss. Its rusted plate armor deflects blows that would fell lesser foes.' },
  { id: 'magma_crab', name: 'Magma Crab', baseHp: 55, baseAtk: 13, xp: 45, color: '#d44a1a', dark: '#9a2a0a', speed: 0.7, minFloor: 40,
    desc: 'A crustacean with a shell of cooled obsidian and claws of molten rock. The floor sizzles where it walks.' },
  { id: 'obsidian_gargoyle', name: 'Obsidian Gargoyle', baseHp: 48, baseAtk: 15, xp: 48, color: '#2a2a4a', dark: '#1a1a2a', speed: 0.9, minFloor: 42,
    desc: 'A statue given cruel life. Its obsidian hide is sharp as glass, and it is still when watched — moving only in darkness.' },
  { id: 'wraith', name: 'Wraith', baseHp: 45, baseAtk: 12, xp: 50, color: '#8a7aaa', dark: '#6a5a8a', speed: 1.3, minFloor: 45,
    desc: 'A vengeful spirit, torn between worlds. It drains the warmth from the air and the life from the living.' },
  { id: 'lava_leech', name: 'Lava Leech', baseHp: 40, baseAtk: 16, xp: 47, color: '#d42a2a', dark: '#9a1a1a', speed: 1.0, minFloor: 48,
    desc: 'A giant leech that swims through magma. It latches onto prey and pumps them full of molten venom.' },
  { id: 'inferno_knight', name: 'Inferno Knight', baseHp: 65, baseAtk: 17, xp: 60, color: '#aa3a1a', dark: '#7a1a0a', speed: 0.8, minFloor: 52,
    desc: 'A suit of armor animated by pure flame. Where it walks, the stone melts. Its sword burns with eternal fire.' },
  { id: 'blood_beast', name: 'Blood Beast', baseHp: 60, baseAtk: 14, xp: 55, color: '#a02828', dark: '#6a1818', speed: 1.0, minFloor: 55,
    desc: 'A pulsating mass of muscle and sinew. It feeds on wounds — yours — and grows stronger with every drop spilled.' },
  { id: 'void_warden', name: 'Void Warden', baseHp: 75, baseAtk: 16, xp: 65, color: '#4a2a5a', dark: '#2a0a3a', speed: 1.0, minFloor: 65,
    desc: 'A guardian of the abyssal void. Its eyes are black holes that drink light and hope alike.' },
  { id: 'nightmare_spawn', name: 'Nightmare Spawn', baseHp: 70, baseAtk: 19, xp: 70, color: '#5a1a5a', dark: '#2a0a2a', speed: 1.3, minFloor: 70,
    desc: 'A creature born from the dreams of the mad. Its form is wrong — too many limbs, too few eyes, and a mouth that should not be.' },
  { id: 'forgotten_one', name: 'The Forgotten', baseHp: 85, baseAtk: 18, xp: 75, color: '#3a4a5a', dark: '#1a2a3a', speed: 0.8, minFloor: 80,
    desc: 'A being that existed before the island, before the grotto, before memory. It has been erased from every history — except this one.' },
  { id: 'golem', name: 'Stone Golem', baseHp: 90, baseAtk: 15, xp: 80, color: '#8a7a6a', dark: '#6a5a4a', speed: 0.5, minFloor: 100,
    desc: 'A towering construct of living stone, carved by hands long turned to dust. It guards the grotto\'s deepest secrets.' },
  { id: 'ancient_guardian', name: 'Ancient Guardian', baseHp: 110, baseAtk: 17, xp: 90, color: '#9a8a7a', dark: '#5a4a3a', speed: 0.6, minFloor: 140,
    desc: 'An eternal sentinel, older than the island itself. It remembers things the grotto has forgotten — and will outlast you.' },
  { id: 'demon', name: 'Cave Demon', baseHp: 70, baseAtk: 18, xp: 100, color: '#aa3a3a', dark: '#8a2a2a', speed: 1.2, minFloor: 175,
    desc: 'A horned fiend of the deep. Its grin splits its face in half, and its laughter echoes long after it dies.' },
  { id: 'eldritch_titan', name: 'Eldritch Titan', baseHp: 150, baseAtk: 22, xp: 150, color: '#2a4a3a', dark: '#0a2a1a', speed: 0.7, minFloor: 200,
    desc: 'A colossus from beyond the stars. Its body defies geometry — looking at it too long makes your eyes bleed.' },
  { id: 'shadow', name: 'Shadow Lord', baseHp: 130, baseAtk: 25, xp: 200, color: '#4a3a5a', dark: '#2a1a3a', speed: 1.1, minFloor: 300,
    desc: 'A lord of the deepest dark. It wears the grotto like a cloak and commands every shadow within it.' },
  { id: 'abyssal', name: 'Abyssal Horror', baseHp: 220, baseAtk: 35, xp: 350, color: '#2a1a3a', dark: '#1a0a2a', speed: 1.0, minFloor: 500,
    desc: 'Something that should not exist. Its form shifts between shapes, each worse than the last. It is the grotto\'s true master.' },
];

// ── Boss: Undead Shaman ──
export const BOSS_TYPES = [
  {
    id: 'the_island',
    name: 'The Island',
    baseHp: 999,
    baseAtk: 0,
    xp: 0,
    color: '#0a0512',
    dark: '#000000',
    speed: 0,
    isBoss: true,
    desc: 'The island\'s true form — a writhing mass of tentacles and shadow with glowing red eyes. A Lovecraftian horror older than memory, wearing the land like a cloak. You cannot fight it. You can only name it.',
    phases: [],
  },
  {
    id: 'undead_shaman',
    name: 'The Undead Shaman',
    baseHp: 180,
    baseAtk: 14,
    xp: 200,
    color: '#4a3a5a',
    dark: '#2a1a3a',
    speed: 0.7,
    isBoss: true,
    summonMinions: true,
    minionType: 'ghoul',
    minionCount: 3,
    desc: 'The island\'s former healer, twisted by the curse into an undying guardian. It holds the Witch\'s Tome and will not surrender it willingly.',
    phases: [
      { hpThreshold: 1.0, atkMult: 1.0, speedMult: 1.0, name: 'The shaman raises its staff, bones rattling.' },
      { hpThreshold: 0.5, atkMult: 1.4, speedMult: 1.3, name: 'The shaman\'s eyes blaze green! Dark energy surges!' },
      { hpThreshold: 0.25, atkMult: 1.8, speedMult: 1.6, name: 'The shaman screams in ancient tongues! The crypt shakes!' },
    ],
  },
  {
    id: 'abyssal_warden',
    name: 'The Abyssal Warden',
    baseHp: 350,
    baseAtk: 20,
    xp: 400,
    color: '#2a1a4a',
    dark: '#1a0a2a',
    speed: 0.8,
    isBoss: true,
    summonMinions: true,
    minionType: 'void_warden',
    minionCount: 2,
    desc: 'A towering guardian that stands at the threshold of the abyssal depths. Its form shifts between dimensions, and its gaze freezes the soul.',
    phases: [
      { hpThreshold: 1.0, atkMult: 1.0, speedMult: 1.0, name: 'The Warden materializes, reality bending around it.' },
      { hpThreshold: 0.5, atkMult: 1.3, speedMult: 1.2, name: 'The Warden tears open rifts in the void! Shadows swarm!' },
      { hpThreshold: 0.25, atkMult: 1.6, speedMult: 1.5, name: 'The Warden\'s form destabilizes! The cavern collapses inward!' },
    ],
  },
  {
    id: 'depth_leviathan',
    name: 'The Depth Leviathan',
    baseHp: 600,
    baseAtk: 28,
    xp: 800,
    color: '#0a2a3a',
    dark: '#051a2a',
    speed: 0.9,
    isBoss: true,
    summonMinions: true,
    minionType: 'abyssal',
    minionCount: 2,
    desc: 'A primordial horror that has slumbered in the deepest void since before the island existed. Its mere presence warps reality, and its awakening shakes the foundations of the world.',
    phases: [
      { hpThreshold: 1.0, atkMult: 1.0, speedMult: 1.0, name: 'The Leviathan stirs. The void trembles.' },
      { hpThreshold: 0.66, atkMult: 1.3, speedMult: 1.2, name: 'The Leviathan roars! Tentacles erupt from the walls!' },
      { hpThreshold: 0.33, atkMult: 1.7, speedMult: 1.5, name: 'The Leviathan enters a frenzy! Reality fractures!' },
      { hpThreshold: 0.15, atkMult: 2.2, speedMult: 1.8, name: 'The Leviathan is dying — and it wants to take you with it!' },
    ],
  },
];

export function getBossType(id) {
  return BOSS_TYPES.find(b => b.id === id);
}

export function getEnemyType(id) {
  return ENEMY_TYPES.find(t => t.id === id);
}

export function spawnBoss(bossId, tiles, w, h, playerX, playerY) {
  const type = getBossType(bossId);
  if (!type) return null;
  // place boss in center of room, but ensure the spawn tile is walkable
  let bx = Math.floor(w / 2);
  let by = Math.floor(h / 2);
  // spiral search for a non-solid tile (avoid getting stuck on chests/decor)
  if (tiles && tiles[by] && tiles[by][bx] !== undefined && tiles[by][bx] === 7) {
    // center is floor — good to go
  } else {
    for (let r = 1; r < Math.max(w, h); r++) {
      let found = false;
      for (let dy = -r; dy <= r && !found; dy++) {
        for (let dx = -r; dx <= r && !found; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const cx = bx + dx, cy = by + dy;
          if (cx < 1 || cy < 1 || cx >= w - 1 || cy >= h - 1) continue;
          if (tiles && tiles[cy] && tiles[cy][cx] === 7) { bx = cx; by = cy; found = true; }
        }
      }
      if (found) break;
    }
  }
  const hp = type.baseHp;
  return {
    typeId: type.id,
    name: type.name,
    color: type.color,
    dark: type.dark,
    x: bx + 0.5, y: by + 0.5,
    hp, maxHp: hp,
    atk: type.baseAtk,
    speed: type.speed,
    xp: type.xp,
    anim: 0,
    dir: 0,
    attackCd: 0,
    hitFlash: 0,
    wanderDir: 0,
    wanderTimer: 0,
    isBoss: true,
    phase: 0,
    summonCd: 8,
  };
}

export function spawnEnemies(floor, tiles, w, h, playerX, playerY) {
  // Floor 50 & 100 — boss floors: spawn a single boss instead of regular enemies
  if (floor === 50 || floor === 100) {
    const bossId = floor === 50 ? 'abyssal_warden' : 'depth_leviathan';
    const boss = spawnBoss(bossId, tiles, w, h, playerX, playerY);
    return boss ? [boss] : [];
  }
  const available = ENEMY_TYPES.filter(e => e.minFloor <= floor);
  const count = Math.min(4 + Math.floor(floor / 8), 18);
  const enemies = [];
  let attempts = 0;
  // Wider pool: last 8 available types, shuffled — more visual variety per floor
  const pool = available.slice(-8);
  const shuffledPool = pool.slice().sort(() => Math.random() - 0.5);
  while (enemies.length < count && attempts < count * 20) {
    attempts++;
    // Cycle through the shuffled pool so every type gets a chance to appear
    const type = shuffledPool[enemies.length % shuffledPool.length];
    const x = 2 + Math.random() * (w - 4);
    const y = 2 + Math.random() * (h - 4);
    // don't spawn on solid tiles
    if (tiles && tiles[Math.floor(y)] && tiles[Math.floor(y)][Math.floor(x)] !== undefined) {
      const t = tiles[Math.floor(y)][Math.floor(x)];
      // floor tile = 7 in the T enum; grotto floors are T.FLOOR
      if (t !== 7) continue;
    }
    // don't spawn too close to player entry
    if (playerX !== undefined && Math.hypot(x - playerX, y - playerY) < 4) continue;
    const hpScale = 1 + floor * 0.12;
    const atkScale = 1 + floor * 0.06;
    const hp = Math.floor(type.baseHp * hpScale);
    enemies.push({
      typeId: type.id,
      name: type.name,
      color: type.color,
      dark: type.dark,
      x, y,
      hp,
      maxHp: hp,
      atk: Math.floor(type.baseAtk * atkScale),
      speed: type.speed,
      xp: type.xp + Math.floor(floor * 0.5),
      anim: Math.random() * 10,
      dir: 0,
      attackCd: 0,
      hitFlash: 0,
      wanderDir: Math.random() * Math.PI * 2,
      wanderTimer: 0,
    });
  }
  return enemies;
}

// Grotto floor biomes — each depth range has a distinct visual theme
export const GROTTO_BIOMES = [
  { id: 'moss', name: 'Mossy Caverns', minFloor: 1, maxFloor: 9,
    tint: 'rgba(40,80,40,0.18)',
    desc: 'Damp, moss-draped tunnels where pale fungi glow in the dark.' },
  { id: 'crystal', name: 'Crystal Caves', minFloor: 10, maxFloor: 19,
    tint: 'rgba(40,80,120,0.18)',
    desc: 'Glittering geodes and luminescent crystal formations pierce the walls.' },
  { id: 'bone', name: 'Bone Crypts', minFloor: 20, maxFloor: 29,
    tint: 'rgba(70,50,30,0.18)',
    desc: 'The remains of countless explorers litter these ossuary tunnels.' },
  { id: 'frost', name: 'Frozen Depths', minFloor: 30, maxFloor: 39,
    tint: 'rgba(160,200,230,0.18)',
    desc: 'Ice coats every surface. Your breath crystallizes before your eyes.' },
  { id: 'lava', name: 'Ember Pits', minFloor: 40, maxFloor: 49,
    tint: 'rgba(120,30,15,0.20)',
    desc: 'Cracks in the floor glow with molten heat. The air shimmers and burns.' },
  { id: 'abyss', name: 'Abyssal Depths', minFloor: 50, maxFloor: 9999,
    tint: 'rgba(50,15,60,0.25)',
    desc: 'The deepest dark. Something ancient stirs in the void below.' },
];

export function getGrottoBiome(floor) {
  return GROTTO_BIOMES.find(b => floor >= b.minFloor && floor <= b.maxFloor) || GROTTO_BIOMES[0];
}