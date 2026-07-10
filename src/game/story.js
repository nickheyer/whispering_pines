// Story system — mystery villains, cycle logic, island truth
// Scooby-Doo style: villains in disguise, clues that connect, island is alive

import { T } from './constants';

export const GROTTO_BOTTOM = 50;

// ── Mystery Villains ──────────────────────────────────────
// Each villain appears in a zone, leaves clues, and can be confronted.
// When unmasked, they reveal a fragment of the island's truth.
export const VILLAINS = [
  {
    id: 'captain_holloway',
    name: 'The Ghost of Captain Holloway',
    zone: 'shore',
    disguise: 'A spectral figure haunts the shipwreck at night, wailing about "what lies beneath."',
    reveal: 'It was Old Marlow all along — dressed in tattered sails, moaning through a conch shell. He wanted to scare people away from the shore.',
    truth: '"The wreck wasn\'t an accident," Marlow admits. "Something pulled us in. The island wanted us here."',
    clue: 'A foghorn hidden in the wreckage. Someone wanted the shore kept empty.',
    triggers: {
      night: true,
      zone: 'shore',
      minDay: 3,
      questFlag: 'questNoteFound',
      nearTile: T.SHIPWRECK,
      nearRadius: 8,
      weather: ['fog', 'heavy_fog', 'rain', 'storm', 'clear'],
      spawnChance: 0.004,
      cooldownDay: 1,
    },
  },
  {
    id: 'bell_ringer',
    name: 'The Midnight Bell Ringer',
    zone: 'cabin_woods',
    disguise: 'Bells toll from nowhere at midnight. Cold chills follow whoever hears them.',
    reveal: 'It was Hattie, the cemetery keeper. She rigged the old chapel bells with fishing line, pulling them from her cottage.',
    truth: '"The bells were a warning," Hattie whispers. "The island stirs at midnight. I needed everyone to stay inside."',
    clue: 'A spool of fishing line leading from the chapel to Hattie\'s garden shed.',
    triggers: {
      night: true,
      timeRange: [1140, 1380],
      zone: 'cabin_woods',
      minDay: 4,
      requireVillainUnmasked: 'captain_holloway',
      weather: ['clear', 'fog', 'heavy_fog'],
      spawnChance: 0.006,
      cooldownDay: 2,
    },
  },
  {
    id: 'shadow_stalker',
    name: 'The Shadow in the Woods',
    zone: 'haunted_forest',
    disguise: 'A dark figure follows travelers through the forest, never close enough to catch.',
    reveal: 'It was the Mayor\'s brother, Edgar — believed dead for twenty years. He\'d been living in the grotto, watching everyone.',
    truth: '"I saw what the island does," Edgar rasps. "It takes your wanting and makes you need. I hid underground to escape its voice."',
    clue: 'A worn journal found in a hollow tree: entries about "the hunger beneath the soil."',
    triggers: {
      night: true,
      zone: 'haunted_forest',
      minDay: 5,
      requireVillainUnmasked: 'bell_ringer',
      nearTile: T.STONE_CIRCLE,
      nearRadius: 10,
      weather: ['heavy_fog', 'storm', 'fog'],
      spawnChance: 0.005,
      cooldownDay: 2,
    },
  },
  {
    id: 'drowned_woman',
    name: 'The Drowned Woman',
    zone: 'town',
    disguise: 'A pale woman appears at the fishing pond at dusk, reaching from the water.',
    reveal: 'It was Patricia — wading in the shallows with a lantern, projecting her silhouette through the mist.',
    truth: '"I wanted people to fear the water," Patricia confesses. "The pond connects to the grotto springs. The island drinks through the water."',
    clue: 'A lantern and white sheet hidden behind the fish market.',
    triggers: {
      timeRange: [1020, 1230],
      zone: 'town',
      minDay: 6,
      requireVillainUnmasked: 'shadow_stalker',
      nearTile: T.TENTACLE_STATUE,
      nearRadius: 12,
      weather: ['rain', 'drizzle', 'storm', 'fog', 'clear'],
      spawnChance: 0.005,
      cooldownDay: 2,
    },
  },
];

// ── Captain Holloway: Evidence & Logic Confrontation ────
// Physical evidence found in the Whispering Woods. Each piece debunks
// one layer of the ghost's disguise during the non-violent confrontation.
export const HOLLOWAY_EVIDENCE = [
  { id: 'evidence_sailcloth', name: 'Tattered Sail Cloth', icon: '🧵', text: 'A scrap of canvas from the shipwreck, torn and weathered. Someone wrapped themselves in it.' },
  { id: 'evidence_fogoil', name: 'Fog Oil Bottle', icon: '🧴', text: 'An empty glass bottle, slick with an oily residue. It once held the substance that makes fog cling unnaturally close.' },
  { id: 'evidence_conch', name: 'Conch Shell', icon: '🐚', text: 'A large spiral shell found by the fishing pond. Blow through it, and it produces a low, mournful wail — identical to the ghost\'s cry.' },
  { id: 'evidence_boot', name: 'Worn Boot', icon: '🥾', text: 'A single boot hidden in the reeds. Its heel has a distinctive crescent-shaped mark — the same shape pressed into every footprint on the shore.' },
];

// Multi-step confrontation: each step has the ghost's claim, the correct
// evidence to debunk it, and the player's logical argument.
export const HOLLOWAY_CONFRONTATION = [
  {
    ghostLine: '"I am the spirit of Captain Holloway! The cold sea dragged me under, and now I walk this shore in death! FLEE, mortal — before I drag you down too!"',
    correctEvidence: 'evidence_sailcloth',
    response: '"A spirit, you say? Then explain this." You hold up the tattered cloth. "This is sail canvas from the wreck — and it matches your shroud exactly. You\'re no ghost. You\'re wrapped in salvage."',
    ghostRetort: 'The figure recoils. "That — that proves nothing! The fog is my domain! I command the mist!"',
    wrongResponse: 'The ghost laughs, a hollow sound. "You have nothing that touches me, mortal." You\'ll need the right evidence to break through.',
  },
  {
    ghostLine: '"The fog obeys me! I conjure the mist that hides the drowned! No living hand could shape it!"',
    correctEvidence: 'evidence_fogoil',
    response: '"You didn\'t conjure anything." You hold up the empty bottle. "This is a fog oil flask — I found it discarded near the shore, still slick with residue. You poured it out and walked away."',
    ghostRetort: 'The ghost\'s form wavers. "The — the wailing! My voice is the cry of the drowned — no living throat could make such a sound!"',
    wrongResponse: '"Fog comes and goes," the ghost sneers. "You cannot prove I had anything to do with it." Your evidence doesn\'t fit here.',
  },
  {
    ghostLine: '"My wailing is the song of the drowned! No living throat could produce such a sound! Hear me and despair!"',
    correctEvidence: 'evidence_conch',
    response: '"It\'s a conch shell." You hold it up. "I found this by the fishing pond. Blow through it — and it makes the exact same mournful wail. Anyone could do it. You\'ve been blowing a shell in the dark."',
    ghostRetort: 'The figure staggers. "The footprints! You cannot explain the footprints!"',
    wrongResponse: 'The ghost waves dismissively. "A sound in the night. That is all. You have nothing." This isn\'t the right proof for this claim.',
  },
  {
    ghostLine: '"The footprints in the mud! Barefoot, with toes far too long — left by the dead, not the living! You cannot explain them!"',
    correctEvidence: 'evidence_boot',
    response: '"Barefoot?" You hold up the boot. "These boots have a crescent heel mark. I compared it to every footprint on the shore — same shape, same spacing, same stride. You walked those shores in boots, then smeared the prints to make the toes look long. You\'re no ghost. You\'re a man in old clothes."',
    ghostRetort: '',
    wrongResponse: 'The ghost\'s laughter is hollow, but you sense desperation beneath it. "The dead leave no boot prints," it mocks. You need different evidence.',
  },
];

// ── Island Truth Fragments ───────────────────────────────
// Revealed progressively as villains are unmasked
export const TRUTH_FRAGMENTS = [
  'The island drew the ship here. The wreck was not chance.',
  'The bells were warnings. Someone knew the island stirs at night.',
  'The island feeds underground. The grotto is its throat.',
  'The water connects everything. The island drinks through the springs.',
  'The island is alive. It feeds on desperation — and it is never satisfied.',
];

// ── The Island Speaks (lighthouse ending) ─────────────────
export function getIslandMonologue(cycle) {
  if (cycle < 3) {
    return [
      'So. You found the light.',
      'I wondered when you would come. They always do, eventually.',
      'You think you\'ve solved it, don\'t you? The bells. The shadows. The ghosts.',
      'They were people. Frightened people. I gave them their fears, and they wore them like masks.',
      'But the masks were never the mystery, little survivor.',
      'I am the mystery.',
      'I am the soil beneath your feet. The fog in your lungs. The warmth of your cabin fire.',
      'I have been here since before the first tree fell. I am patient.',
      'You are desperate to leave. I can taste it. It is... delicious.',
      'But I am not done with you yet.',
      'Sleep now. Forget. You will wake on the shore, as if none of this happened.',
      'But I will remember. I always remember.',
    ];
  }
  // Cycle 3 — the deception
  return [
    'So. You found the light again.',
    'Third time now. You\'ve been so... persistent.',
    'I wiped your memory twice. Twice you crawled back to my heart.',
    'But something is different this time, isn\'t it?',
    'You... you brought something with you. Something I couldn\'t take.',
    'Wait. What are you—',
    'No. NO. You remembered. You wrote it down. You told the others.',
    'The saloon. The store. Patricia. Hattie. They all remember now too.',
    'You didn\'t come back to solve the mystery. You came back to break it.',
    'I am old. I am patient. But I am not... invincible.',
    'The light you carry — it isn\'t the lighthouse light.',
    'It\'s their light. Everyone you unmasked. Everyone you saved.',
    'They\'re standing with you. And they are not afraid anymore.',
    '...I have never felt fear. Until now.',
    'Go. The fog will lift. The springs will go still. The grotto will close.',
    'I release them. I release you.',
    'Perhaps... perhaps I was the one who was trapped here all along.',
    'Goodbye, little survivor. Thank you for setting me free.',
  ];
}

// ── Cycle Configuration ──────────────────────────────────
export const CYCLE_CONFIG = {
  1: {
    cabinName: 'The Cabin',
    cabinZone: 'home',
    intro: 'You wash ashore next to the wreck of your ship. A cat waits on the beach, watching you.',
    villianCount: 4,
  },
  2: {
    cabinName: 'The Haunted Manor',
    cabinZone: 'home',
    intro: 'You wash ashore next to the wreck of your ship. A cat waits on the beach, watching you. ...This feels familiar, but you can\'t say why.',
    villianCount: 4,
  },
  3: {
    cabinName: 'The Haunted Manor',
    cabinZone: 'home',
    intro: 'You wash ashore next to the wreck of your ship. A cat watches you. And this time... you remember.',
    villianCount: 4,
  },
};

// ── Check if player can trigger lighthouse ending ────────
export function canTriggerEnding(state, unmaskedCount) {
  const hasKey = state.flags && state.flags.lighthouseKey;
  const allUnmasked = unmaskedCount >= 4;
  // Cycle 3 true ending requires the Witch's Tome from Spooky Shores
  const hasTome = state.flags && state.flags.witchTomeFound;
  const cycle = state.storyCycle || 1;
  if (cycle >= 3) return allUnmasked && hasKey && hasTome;
  return allUnmasked && hasKey;
}

// ── Spooky Shores: accessible only on cycle 3 ──
export function canAccessSpookyShores(state) {
  return (state.storyCycle || 1) >= 3;
}

// ── Pet swap: Hanzo available on cycle 3 ──
export function canChooseHanzo(state) {
  return (state.storyCycle || 1) >= 3;
}

// ── True ending: reading the Witch's Tome at the lighthouse crystal ──
export function getTrueEndingMonologue() {
  return [
    'You open the Witch\'s Tome. The pages are alive — they turn themselves.',
    'The words burn into your mind. Old words. Older than the island.',
    '"To bind a thing that calls itself a place, speak its true name at the highest light."',
    'You look up at the lighthouse crystal. It pulses, waiting.',
    'You speak the name. The name the tome gave you.',
    'The crystal shatters. Light pours out — not amber, not blue, but white.',
    'White as bone. White as dawn.',
    'The island SCREAMS.',
    'Not the wind. Not the grotto. The island itself — the thing beneath the soil, the hunger in the springs.',
    'You feel it recoil. You feel it shrink. You feel it... diminish.',
    '"You..." the island whispers. "You found it. The one book I could not bury."',
    '"I ate the witches. I drank their covens. But one wrote it down before I took her."',
    '"And you... you carried it back. Three times you came. Three times I wiped your mind."',
    '"But the cat remembered. The cat was never mine. Animals don\'t dream my dreams."',
    'The fog is shredding. For the first time, you see stars.',
    'The grotto springs go still. The twisted trees straighten, just a little.',
    'The island is not dead. But the thing inside it — the hunger — is gone.',
    '"Go now," the island says. Its voice is thin. Tired. Old.',
    '"The sea is calm. The horizon is kind. Take your cat. Go home."',
    '"And if you ever think of this place again... remember me as I was before the hunger came."',
    '"Remember me as a forest. A shore. A place where someone once built a cabin and lit a fire."',
    'The lighthouse light goes out. For the first time in a hundred years, that is not a sad thing.',
    'You walk down to the shore. The tide is gentle. Your ship — or what\'s left of it — bobs in the shallows.',
    'Fritz — or Void, or Hanzo — sits beside you. Waiting.',
    'You set sail as the sun rises. The island grows small behind you.',
    'It does not follow.',
    'For the first time in three lifetimes, you are free.',
  ];
}