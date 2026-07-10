// Smoke and Stack — two mysterious dark-skinned strangers who roll into Pinebrook.
// Smoke is a vampire. They sell guns and dark artifacts.
// Appears mid-cycle 2 as a random event; returns in cycle 3.

export const STRANGER_NPCS = [
  {
    id: 'smoke', x: 20, y: 17, name: 'Smoke', color: '#3a2828', shop: true, shopType: 'stranger', stranger: true,
    lines: [
      '...You smell different. Like the sea, but older.',
      'Stack and I don\'t stay long. Towns like this... they notice things eventually.',
      'Guns? Yeah. We got guns. They kill things real good.',
      'Stack says I talk too much. Stack\'s usually right.',
      'You ever seen a sunset that looks like blood? That\'s my favorite kind.',
    ],
  },
  {
    id: 'stack', x: 24, y: 17, name: 'Stack', color: '#2a2020', shop: true, shopType: 'stranger', stranger: true,
    lines: [
      '...',
      'You want to buy? Buy. You don\'t? Don\'t waste my time.',
      'Smoke\'s the chatty one. I just count the coins.',
      'That cat of yours... it sees things. Smart cat. Most animals know what I am.',
      'We\'ll be moving on soon enough. This island... it doesn\'t like visitors who don\'t belong.',
    ],
  },
];

// Check if strangers should be spawned in town right now
export function shouldSpawnStrangers(state) {
  if (!state.flags) return false;
  const cycle = state.storyCycle || 1;
  // Cycle 2: they arrived (random event)
  if (cycle === 2 && state.flags.strangersArrived) return true;
  // Cycle 3: they return if they appeared in cycle 2
  if (cycle === 3 && state.flags.strangersArrivedCycle2) return true;
  return false;
}

// Roll for stranger arrival during cycle 2 (called from endDay)
export function rollStrangerArrival(state) {
  if (!state.flags) state.flags = {};
  const cycle = state.storyCycle || 1;
  // Only in cycle 2, day 7+, and they haven't arrived yet
  if (cycle !== 2) return false;
  if (state.flags.strangersArrived) return false;
  if (state.day < 7) return false;
  // ~12% chance per day once conditions met
  if (Math.random() < 0.12) {
    state.flags.strangersArrived = true;
    state.flags.strangersArrivedCycle2 = true;
    return true;
  }
  return false;
}

// Get the shop items available from Smoke and Stack
export function getStrangerShopItems(state) {
  const cycle = state.storyCycle || 1;
  const items = [];

  // Guns — always available if not yet bought (cycle 2 or 3)
  if (!state.flags?.boughtHandgun) {
    items.push({
      id: 'handgun_1911', name: '1911 Handgun', icon: '🔫', price: 1000,
      category: 'weapons', desc: 'Kills monsters real good. +60 Attack',
    });
  }
  if (!state.flags?.boughtTommyGun) {
    items.push({
      id: 'tommy_gun', name: 'Tommy Gun', icon: '🔫', price: 2500,
      category: 'weapons', desc: 'Mows down monsters. +120 Attack',
    });
  }

  // Cycle 3: if both guns were bought in cycle 2, offer special items
  const boughtBothInCycle2 = state.flags?.boughtTommyGun && state.flags?.boughtHandgun && state.flags?.strangersArrivedCycle2;
  if (cycle >= 3 && boughtBothInCycle2) {
    if (!state.flags?.vampireBloodTaken) {
      items.push({
        id: 'vampire_blood', name: 'Vampire Blood', icon: '🧛', price: 0,
        category: 'potion', desc: 'All stats +25%. Fish rarity & value doubled. Free.',
      });
    }
    if (!state.flags?.boughtVampiricSword) {
      items.push({
        id: 'vampiric_sword', name: 'Vampiric Sword', icon: '🗡️', price: 5000,
        category: 'weapons', desc: 'Devastates bosses. +80 Attack, 5× boss damage.',
      });
    }
  }

  return items;
}