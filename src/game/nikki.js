// Nikki — obsessed stalker who appears from Cycle 2 onward.
// In Cycle 2 she is the jealous watcher: any partner you romance and confess
// to will, two days later, vanish into her basement. A side quest triggers to
// find them — in a coffin, with Nikki standing over them.
// In Cycle 3 her obsession has fully bloomed into the escalating stalker lines.

import { getRomanceNpc } from './romance';

// Cycle 3 — escalating, dangerous obsession
export const NIKKI_NPC = {
  id: 'nikki',
  name: 'Nikki',
  color: '#c46a8a',
  lines: [
    'Oh... you\'re here. I saw you come ashore. I\'ve been watching.',
    'You don\'t remember me, do you? That\'s okay. I remember you.',
    'I followed you from the shore. You walk just like before. Exactly like before.',
    'Where are you going? Can I come? I\'m good at being quiet.',
    'I found where you sleep. The cabin is cozy, isn\'t it? I sat in your chair.',
    'Your cat doesn\'t like me. Cats are like that. They sense things.',
    'You\'ve been talking to other people. Why? They don\'t understand you like I do.',
    'I followed you to the grotto. I counted your steps. 847. I memorized them.',
    'You smell like the sea and pine. I kept a cloth you dropped. I sleep with it.',
    'Don\'t go to the lighthouse. Don\'t break the cycle. If you leave, I—',
    'I carved your name into every tree on the path. So you\'d always find your way back to me.',
    'You\'re planning something. I can see it in your eyes. You\'re trying to leave me here.',
    'I won\'t let you leave. The island is ours. I\'ll make you stay.',
    'I told the island about you. It agrees. You belong here. With me. Forever.',
    '...Why are you looking at me like that? I\'m not crazy. I just love you. That\'s all.',
  ],
};

// Cycle 2 — jealous, watchful, foreshadows the kidnapping
const NIKKI_LINES_CYCLE2 = [
  'Oh. You\'re talking to them. That\'s... fine. I\'m fine.',
  'I\'ve seen you with them. You smile at them. You don\'t smile at me like that.',
  'Who are they? They don\'t know you. Not like I do.',
  'I watched you give them a gift. I kept the wrapping. I sleep with it now.',
  'You spend so much time with them. Don\'t you have time for me anymore?',
  'I followed them home. Their cottage is nice. Cozy. I sat outside it until dawn.',
  'Do you love them? You shouldn\'t. You don\'t even know them. Not really.',
  'I carved your name and theirs into the same tree. Then I scratched theirs out.',
  'They\'ll leave you. Everyone leaves, eventually. I won\'t. I\'ll never leave you.',
  'You\'ll see. You\'ll see they\'re not right for you. I\'ll show you. Soon.',
];

export function shouldSpawnNikki(state, zoneId) {
  if ((state.storyCycle || 1) < 2) return false;
  const validZones = ['cabin_woods', 'town', 'shore', 'haunted_forest'];
  return validZones.includes(zoneId);
}

export function getNikkiPlacement(zoneId) {
  const positions = {
    cabin_woods: { x: 15, y: 20 },
    town: { x: 18, y: 15 },
    shore: { x: 10, y: 20 },
    haunted_forest: { x: 23, y: 20 },
  };
  return positions[zoneId] || null;
}

// Pick Nikki's dialogue line based on the current cycle and how many times
// the player has spoken to her.
export function getNikkiDialogue(state, talkCount) {
  const cycle = state.storyCycle || 1;
  const lines = cycle >= 3 ? NIKKI_NPC.lines : NIKKI_LINES_CYCLE2;
  return lines[Math.min(talkCount % lines.length, lines.length - 1)];
}

// ── The Kidnapping ────────────────────────────────────────
// In Cycle 2, two days after a romance confession, Nikki takes the partner.
// Returns the id of the partner who should be kidnapped, or null.
export function checkNikkiKidnapping(state) {
  if ((state.storyCycle || 1) !== 2) return null;
  if (!state.romance) return null;
  if (!state.flags) state.flags = {};
  if (state.flags.nikkiKidnapped || state.flags.nikkiRescued) return null;

  let chosen = null;
  let earliestDay = Infinity;
  for (const npcId of Object.keys(state.romance)) {
    if (npcId === 'nikki') continue; // Nikki can't kidnap herself
    const rs = state.romance[npcId];
    if (!rs || !rs.confessed) continue;
    const confessedDay = rs.confessedDay;
    if (confessedDay === undefined) continue;
    if (state.day - confessedDay < 2) continue;
    // kidnap the one who's been waiting longest
    if (confessedDay < earliestDay) {
      earliestDay = confessedDay;
      chosen = npcId;
    }
  }
  return chosen;
}

// ── Nikki's Basement NPCs ──────────────────────────────────
// Nikki stands guard over a coffin; the kidnapped partner lies inside it.
export function getNikkiBasementNpcs(state) {
  const npcs = [];
  const victimId = state.flags && state.flags.nikkiKidnapped;
  const rescued = !!(state.flags && state.flags.nikkiRescued);
  // Nikki flees after the confrontation — only present before rescue
  if (!rescued) {
    npcs.push({
      id: 'nikki_basement',
      name: 'Nikki',
      color: NIKKI_NPC.color,
      x: 9, y: 6,
      basement: true,
    });
  }
  // The victim stays in the coffin until spoken to after rescue
  if (victimId) {
    const victim = getRomanceNpc(victimId);
    if (victim) {
      npcs.push({
        id: victimId,
        name: victim.name,
        color: victim.color,
        x: 6, y: 6,
        romanceable: true,
        kidnapped: !rescued,
        rescued: rescued,
      });
    }
  }
  return npcs;
}

// The line Nikki speaks when confronted in her basement.
export const NIKKI_BASEMENT_LINE =
  '"Don\'t you love me?"\n\nNikki stands over the coffin, candles flickering around her. Her eyes are red and wet. ' +
  '"I kept them safe for you. I kept them here, so they couldn\'t take you from me. ' +
  'I dressed the wound every day. I sang to them. I was so good." Her voice breaks. ' +
  '"You\'re not smiling. Why aren\'t smiling? I did this for US." She steps back from the coffin, ' +
  'hands trembling — then turns and flees into the dark, sobbing your name.';