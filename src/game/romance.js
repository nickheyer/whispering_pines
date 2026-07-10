// Romanceable NPCs — 5 new townsfolk with affection, gifts, and relationship levels
import { ITEMS } from './constants';

// Romance levels and thresholds
export const ROMANCE_LEVELS = [
  { min: 0, name: 'Stranger', color: '#888888', icon: '○' },
  { min: 10, name: 'Acquaintance', color: '#8aaa8a', icon: '◐' },
  { min: 25, name: 'Friend', color: '#6a9a5a', icon: '◑' },
  { min: 50, name: 'Close Friend', color: '#c4a44a', icon: '●' },
  { min: 80, name: 'Smitten', color: '#e07060', icon: '♥' },
  { min: 120, name: 'Beloved', color: '#e04050', icon: '❤' },
];

export const ROMANCE_THRESHOLD_CONFESSION = 120;

export function getRomanceLevel(points) {
  let level = ROMANCE_LEVELS[0];
  for (const l of ROMANCE_LEVELS) {
    if (points >= l.min) level = l;
  }
  return level;
}

export function getNextLevelPoints(points) {
  for (const l of ROMANCE_LEVELS) {
    if (points < l.min) return l.min;
  }
  return null;
}

// The 5 romanceable NPCs — each has a home zone in town
export const ROMANCE_NPCS = [
  {
    id: 'rowan',
    name: 'Rowan Ashby',
    pronoun: 'he/him',
    color: '#7a5a3a',
    accent: '#c47a2a',
    homeZone: 'cottage_rowan',
    houseLabel: "Rowan's Workshop",
    personality: 'brooding, skilled, quietly kind',
    lovedGifts: ['wood', 'antique', 'crystal'],
    likedGifts: ['stone', 'fiber', 'mushroom'],
    dialogue: {
      stranger: [
        "...You're the one who washed up on the shore. I heard. Don't expect a welcome party from me.",
        "I work with wood. It doesn't talk back. Unlike most people in this town.",
        "You're staring. If you want something, say it.",
      ],
      acquaintance: [
        "You're still here. Most drifters don't last a week on this island.",
        "I carved this — it's nothing. Just passing time.",
        "The grain of the wood tells you everything. Where it grew, what it survived. People are the same, if you look closely.",
      ],
      friend: [
        "I don't usually let people into my workshop. But you... you're different. Careful with your hands.",
        "I lost someone too. The island takes. But it gives, sometimes, in strange ways.",
        "You know, I haven't minded your company these past weeks. Don't tell anyone.",
      ],
      close: [
        "I made this for you. It's a carving of your cat. I... noticed you talk to it. I thought you might like it.",
        "When I'm with you, the island feels smaller. Less... hungry. I don't know how else to say it.",
        "I'm not good at this. But I want you to know — you matter to me. More than the wood, more than the silence.",
      ],
      smitten: [
        "I wake up and the first thing I think is whether you'll come by today. That terrifies me. And thrills me.",
        "I carved your name into the doorframe. Old sailors' tradition. It means... you're anchored here. With me.",
        "Stay tonight. I'll make tea. We'll watch the fog roll in. That's all. That's everything.",
      ],
      beloved: [
        "I never thought I'd feel this way again. You brought me back from the dead, you know. The living kind of dead.",
        "Every morning I see you, I think: the island gave me something it can't take back. Not this time.",
      ],
    },
    giftReaction: {
      loved: "This... how did you know? I've been looking for exactly this. Thank you. Truly.",
      liked: "Thoughtful. I appreciate it.",
      neutral: "Thank you. I'll find a use for it.",
    },
    confessionResponse: "You... you feel it too? I've been carving your name into everything I touch, trying not to say it out loud. Yes. A thousand times, yes. Stay with me. On this island, in this workshop, in this life. I'm yours.",
  },
  {
    id: 'willow',
    name: 'Willow Green',
    pronoun: 'she/her',
    color: '#6a9a5a',
    accent: '#4a8a3a',
    homeZone: 'cottage_willow',
    houseLabel: "Willow's Garden",
    personality: 'gentle, warm, nurturing',
    lovedGifts: ['mushroom', 'berry', 'herb', 'pumpkin'],
    likedGifts: ['fiber', 'seed_pumpkin', 'flower'],
    dialogue: {
      stranger: [
        "Oh! You must be the shipwreck survivor. Everyone's been talking about you. Are you hurt? Do you need tea?",
        "I grow things — herbs, vegetables, remedies. The soil on this island is strange. Things grow fast. Too fast, sometimes.",
        "You look tired. Here, take this herb. It'll help you sleep. No charge — we look after each other here.",
      ],
      acquaintance: [
        "You came back! I made too much tea again. Sit, sit. Tell me about the shore — I've never seen it myself.",
        "My garden grows in moonlight. I don't know why. The plants just... prefer it. Like some people prefer the dark.",
        "I lost my family to the island's fog. But the garden keeps me grounded. Roots, you know? Roots keep you here.",
      ],
      friend: [
        "I saved the best seeds for you. Plant them near your cabin. They'll grow. They always do, for people I care about.",
        "You have good hands. Gentle hands. The kind that things grow toward. I notice these things.",
        "I put a flower in your pack when you weren't looking. Did you find it? I hoped it would make you smile.",
      ],
      close: [
        "I grew this rose for you. It took three seasons and every bit of patience I had. It only blooms for people I... well. You know.",
        "When the fog rolls in, I worry about you. Out there, alone. I wish you'd stay closer. Stay with me.",
        "My heart grows toward you the way my garden grows toward the moon. I can't stop it. I don't want to.",
      ],
      smitten: [
        "I dreamt about you. We were in the garden, and everything was in bloom, and you said you'd never leave. I woke up crying.",
        "I planted a tree for you. By the well. It'll grow tall and strong, and when you see it, you'll know — someone here loves you.",
        "Stay for dinner. Stay for the garden. Stay for me. Please?",
      ],
      beloved: [
        "Every seed I plant now, I plant for us. A garden that will feed us both, for all the years the island gives us.",
        "You are my sunlight. My garden was just waiting for you to walk into it.",
      ],
    },
    giftReaction: {
      loved: "Oh! Oh, this is... you shouldn't have. But I'm so glad you did. This is perfect.",
      liked: "How lovely. You have a kind heart. I'll treasure this.",
      neutral: "Thank you. That's very thoughtful of you.",
    },
    confessionResponse: "My heart is blooming. I've been tending these feelings like my garden, watering them with every visit, and now — now they're in full flower. Yes. I feel the same. I've felt it since you first walked through my door. Stay. Grow with me.",
  },
  {
    id: 'finn',
    name: "Finn O'Reilly",
    pronoun: 'he/him',
    color: '#4a7aaa',
    accent: '#3a6a9a',
    homeZone: 'cottage_finn',
    houseLabel: "Finn's Boathouse",
    personality: 'cheerful, adventurous, loyal',
    lovedGifts: ['fish_common', 'fish_rare', 'fish_legend', 'bait'],
    likedGifts: ['wood', 'fiber', 'crystal'],
    dialogue: {
      stranger: [
        "Ahoy, stranger! Heard you washed up on the shore — quite the entrance! Name's Finn. I fish these waters.",
        "The sea's in my blood. Three generations of O'Reillys on this island, all fishermen. The fish know our boat.",
        "You ever need a catch, come find me. I'll show you the good spots. We look after our own here!",
      ],
      acquaintance: [
        "Back again! I like that. A face that keeps coming back — that's someone worth knowing.",
        "Caught a beauty this morning. Moonfish — rare this time of year. The sea's generous when she wants to be.",
        "My da used to say: the ocean tests you, but she rewards the patient. Same with people, I think.",
      ],
      friend: [
        "I've been saving my best lure for you. It's got a red feather — your color, I thought. Come fishing with me sometime?",
        "You know what I like about you? You listen. Most people just wait for their turn to talk. You actually listen.",
        "I told my da about you — well, I talked to his grave. He'd have liked you. He always said I'd know the right one when they came along.",
      ],
      close: [
        "I caught a fish today and my first thought was 'I have to show them.' That's when I knew. This isn't just friendship anymore.",
        "I built you a boat. Well, half a boat. Okay, it's a plank with a nail in it. But it's the thought that counts, right? The thought is: I want to spend my days on the water with you.",
        "My heart races like a sail in a gale when you walk up. I've faced storms that felt calmer than this.",
      ],
      smitten: [
        "I wake up before dawn now, just to watch the sun come up and think of you. The sea and the sunrise — that used to be enough. Now I need you too.",
        "I carved our initials in the dock. FP + yours. The tide'll wash it away eventually, but for now, it's there. A promise.",
        "Marry me. I mean — not yet. I mean — fish with me forever. Same thing, really.",
      ],
      beloved: [
        "Every dawn on the water, I think of you. Every catch, I wish you were there to see it. You're my compass now. My North Star.",
        "The sea gave me everything — my livelihood, my history, my da. But she never gave me this. This is all you.",
      ],
    },
    giftReaction: {
      loved: "Ha! You got me a fish? Nobody's ever given me a fish before — I'm usually the one giving them! This is grand. This is really grand.",
      liked: "Ah, nice one! You've got good taste. I'll put this to good use.",
      neutral: "Cheers! Appreciate it.",
    },
    confessionResponse: "Well, blow me down! You — really? You feel the same? I've been walking on water ever since I met you, and I thought it was just the sea legs! Ha! No, but truly — truly. I'm yours. Hook, line, and sinker. You've caught me good.",
  },
  {
    id: 'luna',
    name: 'Luna Nightshade',
    pronoun: 'she/her',
    color: '#8a6aaa',
    accent: '#6a4a8a',
    homeZone: 'cottage_luna',
    houseLabel: "Luna's Tower",
    personality: 'eccentric, mysterious, brilliant',
    lovedGifts: ['crystal', 'antique', 'witch_tome', 'amulet'],
    likedGifts: ['mushroom', 'berry', 'herb'],
    dialogue: {
      stranger: [
        "The stars told me someone new would arrive. They didn't mention the cat. Interesting. Very interesting.",
        "I study the heavens. The patterns. This island sits on a convergence — old magic, older than the stars. I've been mapping it for years.",
        "You have an unusual aura. Touched by the sea, marked by the island. I see things others can't. And you... glow, faintly. Strange.",
      ],
      acquaintance: [
        "You came back. The stars said you would. They're rarely wrong — though they do have a sense of humor.",
        "I've been reading your fortune in the tea leaves. Don't worry — I won't tell you what they say. Some things are better lived than known.",
        "The island dreams, you know. I hear it at night. It's dreaming about you. I wonder what that means.",
      ],
      friend: [
        "I read your stars last night. I won't tell you what they said — but I will say I spent the rest of the evening smiling.",
        "I've been mapping the constellations above your cabin. There's a new pattern I haven't seen before. I named it after you. It has your shape.",
        "The crystals hum when you're near. They don't do that for anyone else. I've been studying it. I think... the island recognizes you. So do I.",
      ],
      close: [
        "I cast a love charm last full moon. Not on you — that would be unethical. But I think the universe cast one anyway. On both of us.",
        "I've lived alone in this tower for so long, I forgot what it felt like to want someone to climb the stairs. Now I wait for your footsteps every day.",
        "My magic is strongest at midnight. But when you're here, every hour feels like midnight — charged, secret, infinite. You are my most powerful spell.",
      ],
      smitten: [
        "I saw our futures in the crystal ball. They're tangled together like roots. I've never seen that before. I've never wanted to.",
        "I enchanted a candle to burn only when I think of you. It hasn't gone out in three days. I've had to buy more candles.",
        "The stars are aligning. Not metaphorically — literally. There's a conjunction forming that occurs once every thousand years. It peaks when I'm with you. The universe is telling us something. I'm listening.",
      ],
      beloved: [
        "I've mapped a thousand stars, and each one leads me back to you. You are my true north, my midnight sun, my entire celestial chart.",
        "The island's curse, the convergence, the old magic — none of it frightens me anymore. Because whatever power shaped this place also shaped the path that led you to my door.",
      ],
    },
    giftReaction: {
      loved: "The crystals are resonating! You — you found this for me? The energy is extraordinary. I can feel it singing. Thank you. Thank you so deeply.",
      liked: "How curious. Yes, this has a lovely energy to it. I can use this. Thank you.",
      neutral: "Mm. Yes. I'll find a use for this. Thank you.",
    },
    confessionResponse: "I saw this in the stars — I saw it the moment you first walked through my door, glowing with that strange sea-light. I've been waiting for you to see it too. The conjunction, the crystals, the dreams — they all pointed here. To us. Yes. A thousand times, yes. You are my destiny, written in starlight.",
  },
  {
    id: 'dante',
    name: 'Dante Moreau',
    pronoun: 'he/him',
    color: '#aa5a4a',
    accent: '#8a3a2a',
    homeZone: 'cottage_dante',
    houseLabel: "Dante's Studio",
    personality: 'melancholic, artistic, passionate',
    lovedGifts: ['antique', 'crystal', 'witch_tome', 'amulet'],
    likedGifts: ['wood', 'fiber', 'berry', 'pumpkin'],
    dialogue: {
      stranger: [
        "...Sorry. I was lost in the canvas. You're the one from the shore? They say you survived the wreck. The sea is a cruel muse.",
        "I paint. The island, mostly. Its moods. You'd be surprised how many moods a rock in the ocean can have.",
        "This town is full of ghosts. Not literal ones — well, some are literal — but the metaphorical kind. We're all haunted here. You'll see.",
      ],
      acquaintance: [
        "You came back. People usually don't, after they see the paintings. Too much, they say. Too dark. But you came back.",
        "I started a new piece. It's the shore at midnight. There's a figure in the fog — I don't know who. It might be you. The painting decided, not me.",
        "I had a life before this island. A gallery. Critics who used words like 'promise' and 'potential.' The island ate all that. Now I just paint what I see. What I feel.",
      ],
      friend: [
        "I painted you last night. Not from memory — from how you feel to me. The canvas came out... warm. I've never painted warm before. I didn't know I could.",
        "You sit still when you listen. Most people fidget, look away. You sit like a painting — present, patient. I could sketch you for hours.",
        "I used to paint to remember. Now I think I paint to forget — everything except the moments that matter. You're becoming one of those moments.",
      ],
      close: [
        "I finished your portrait. I can't stop looking at it. I painted your eyes last, and when I added the final brushstroke, the whole canvas came alive. I think I painted my own heart into it by accident.",
        "I've been writing poetry. About you. I don't write poetry — I paint. But words started coming, and they were all your name, rearranged into metaphors.",
        "I'm afraid. Not of the island, not of the fog, not of the ghosts. I'm afraid of how much I want you to be here when I wake up. That kind of wanting — it's the thing the island takes. I'm risking it anyway.",
      ],
      smitten: [
        "I dreamt I painted you into existence, and you stepped off the canvas and said 'I'm real now, because of you.' I woke up reaching for you.",
        "I've started signing my paintings with your initial next to mine. D.M. + yours. The gallery of my heart, and you're the only exhibit.",
        "Stay. Not forever — I know the island doesn't allow forever. But tonight. Tomorrow. As many midnights as we can steal. I'll paint the dawn with your silhouette in it.",
      ],
      beloved: [
        "Every stroke I make now is a love letter. Every canvas, a confession. You've turned my entire body of work into a single, unending declaration. I love you. The painting is finished.",
        "They'll find our story in the brushstrokes someday. Two figures, leaning together, made of the same colors. That's how I want to be remembered.",
      ],
    },
    giftReaction: {
      loved: "You... you found this? The patina, the history in it — I can see entire paintings in this object. You've given me a muse. Thank you. Deeply.",
      liked: "Ah, this has character. Texture. I can work with this. Thank you.",
      neutral: "Thank you. I appreciate the gesture.",
    },
    confessionResponse: "I've been trying to paint this moment for weeks — the exact shade of your eyes when you look at me, the precise angle of light. But no canvas can hold it. No pigment matches. Because this isn't a painting. This is real. You're real. And you're standing in my studio, saying the words I've been mixing colors to express. Yes. I love you. I've been loving you in oils and words and midnight silences since the day you walked in. Stay. Be my masterpiece. Be my ordinary, extraordinary, every day.",
  },
  {
    id: 'nikki',
    name: 'Nikki',
    pronoun: 'she/her',
    color: '#c46a8a',
    accent: '#a44a6a',
    homeZone: null,
    houseLabel: 'the island paths',
    personality: 'obsessive, devoted, dangerously loving',
    confessionThreshold: 1, // she's already obsessed — one gift is enough
    lovedGifts: ['clue', 'antique', 'amulet'],
    likedGifts: ['mushroom', 'berry', 'herb'],
    dialogue: {
      stranger: [
        "Oh... you're here. I saw you come ashore. I've been watching.",
        "You don't remember me, do you? That's okay. I remember you.",
        "I followed you from the shore. You walk just like before. Exactly like before.",
        "Where are you going? Can I come? I'm good at being quiet.",
      ],
      acquaintance: [
        "I found where you sleep. The cabin is cozy, isn't it? I sat in your chair.",
        "Your cat doesn't like me. Cats are like that. They sense things.",
        "I've been watching you talk to the others. They don't understand you like I do.",
        "You smell like the sea and pine. I kept a cloth you dropped. I sleep with it.",
      ],
      friend: [
        "I followed you to the grotto. I counted your steps. 847. I memorized them.",
        "I carved your name into every tree on the path. So you'd always find your way back to me.",
        "You smiled at me today. Really smiled. I'll remember it forever. I'll carve it into wood.",
        "I told the island about you. It listens to me. It agrees that you belong here.",
      ],
      close: [
        "You're planning something. I can see it in your eyes. But whatever it is... I'll be there. I'll always be there.",
        "I don't like sharing you with the others. But I'll wait. I'm good at waiting. I've waited lifetimes.",
        "When you sleep, I sit outside your door. Not in a creepy way. In a... protective way. I keep you safe.",
        "I had a dream about us. We were on the shore, and the fog lifted, and you said my name like it was the only word that mattered.",
      ],
      smitten: [
        "I won't let you leave. The island is ours. I'll make you stay. Not by force — by love. By being everything you need.",
        "I've memorized every line of your face. Every scar. Every freckle. I could draw you in the dark. I have.",
        "Stay with me. Not just tonight. Every night. I'll follow you into the dark, into the grotto, into the fog. Everywhere.",
        "I love you so much it scares me. I've never been scared of anything. Just that. Losing you.",
      ],
      beloved: [
        "You chose me. You actually chose me. I'm yours now. Completely. Irrevocably. I'll be your shadow until the island swallows us both.",
        "Every step you take, I'll be there. Every breath, I'll count. You're mine, and I'm yours, and the island can go to hell.",
      ],
    },
    giftReaction: {
      loved: "You... you got this for me? I'll keep it forever. I'll sleep with it. I'll never let it go.",
      liked: "Thank you. I'll cherish it. Everything you give me, I keep. Everything.",
      neutral: "Oh. Thank you. I'll put it with the rest of your things. I have a collection.",
    },
    confessionResponse: "You... you love me? YOU love ME? I knew it. I KNEW IT. I've been waiting, watching, and you finally see. Yes. Yes, a thousand times. I'll never leave your side. Not ever. Not for anything. I'll follow you everywhere. I'll be your shadow, your companion, your everything. The island gave you to me. Finally. FINALLY.",
  },
];

export function getRomanceNpc(id) {
  return ROMANCE_NPCS.find(n => n.id === id);
}

export function getRomanceDialogue(npc, romanceState) {
  const points = romanceState?.points || 0;
  const level = getRomanceLevel(points);
  let stage;
  if (level.name === 'Stranger') stage = 'stranger';
  else if (level.name === 'Acquaintance') stage = 'acquaintance';
  else if (level.name === 'Friend') stage = 'friend';
  else if (level.name === 'Close Friend') stage = 'close';
  else if (level.name === 'Smitten') stage = 'smitten';
  else stage = 'beloved';
  const lines = npc.dialogue[stage];
  const seen = romanceState?.talkCount || 0;
  return lines[Math.min(seen % lines.length, lines.length - 1)];
}

export function getGiftReaction(npc, itemId) {
  if (npc.lovedGifts.includes(itemId)) return { type: 'loved', text: npc.giftReaction.loved, points: 15 };
  if (npc.likedGifts.includes(itemId)) return { type: 'liked', text: npc.giftReaction.liked, points: 8 };
  return { type: 'neutral', text: npc.giftReaction.neutral, points: 3 };
}