// Procedural creature sprite art for fish and monsters
import { FISH_RARITY, getFishInfo } from './fish';
import { ENEMY_TYPES, BOSS_TYPES } from './enemies';

// ── Fish archetype mapping ──
const FISH_ARCH = {
  sardine:'fish_small', anchovy:'fish_small', smelt:'fish_small', sprat:'fish_small',
  sand_eel:'fish_small', silverside:'fish_small', minnow:'fish_small', dace:'fish_small',
  bleak:'fish_small', gudgeon:'fish_small', whitebait:'fish_small', capelin:'fish_small',
  pilchard:'fish_small', spot:'fish_small', pinfish:'fish_small', sand_smelt:'fish_small',
  mackerel:'fish_medium', herring:'fish_medium', perch:'fish_medium', bluegill:'fish_medium',
  sunfish:'fish_medium', crappie:'fish_medium', bream:'fish_medium', roach:'fish_medium',
  chub:'fish_medium', kelp_bass:'fish_medium', sea_bream:'fish_medium', mullet:'fish_medium',
  croaker:'fish_medium', tomcod:'fish_medium', alewife:'fish_medium', threadfin:'fish_medium',
  menhaden:'fish_medium', hake:'fish_medium', pollock:'fish_medium', whiting:'fish_medium',
  bluefish:'fish_medium', bonito:'fish_medium', dolly_varden:'fish_medium',
  moonfish:'fish_large', rainbow_trout:'fish_large', sea_bass:'fish_large', snapper:'fish_large',
  grouper:'fish_large', cod:'fish_large', haddock:'fish_large',
  mahi_mahi:'fish_large', wahoo:'fish_large', tuna:'fish_large', barracuda:'fish_large',
  tarpon:'fish_large', bonefish:'fish_large', permit:'fish_large', skipjack:'fish_large',
  twilight_salmon:'fish_large', moonbeam_carp:'fish_large', phantom_pike:'fish_large',
  ember_fish:'fish_large', frost_pike:'fish_large', coral_crown:'fish_large',
  midnight_marlin:'fish_large',
  halibut:'flatfish', flounder:'flatfish', sole:'flatfish', turbot:'flatfish', plaice:'flatfish',
  skate:'ray', ray:'ray',
  eel:'eel', conger:'eel', ghost_eel:'eel', moray_eel:'eel', storm_eel:'eel', mist_wraith_eel:'eel',
  octopus:'octopus', squid:'squid', cuttlefish:'cuttlefish',
  spectral_krakenling:'kraken', ancient_krakenling:'kraken',
  lobster:'lobster', horseshoe_crab:'horseshoe',
  anglerfish:'anglerfish', crystal_anglerfish:'anglerfish', abyssal_lantern:'anglerfish',
  lantern_fish:'anglerfish', stargazer:'fish_medium',
  pufferfish:'puffer', stonefish:'puffer',
  lionfish:'lionfish', nautilus:'nautilus', sea_spider:'sea_spider',
  void_serpent:'serpent', voidfin:'serpent',
  shadow_bass:'fish_medium',
  leviathan_spawn:'leviathan', tidal_titan:'leviathan', abyssal_sovereign:'leviathan', the_old_one:'leviathan',
};

// ── Monster archetype mapping ──
const MONSTER_ARCH = {
  slime:'slime', bat:'bat', rat:'rat', cave_newt:'newt', rock_crab:'crab',
  glow_worm:'worm', centipede:'centipede', moss_lurker:'flat_predator',
  tunnel_mole:'mole', mushroom_zombie:'zombie', echo_bat:'echo_bat',
  spider:'spider', gem_beetle:'beetle', crystal_wraith:'crystal-wraith',
  stalactite_horror:'stalactite', fossil_spirit:'fossil', skeleton:'skeleton',
  cavern_fish:'cavern_fish', amber_golem:'amber-golem', cave_troll:'troll',
  web_weaver:'web-weaver', dust_mummy:'mummy', grave_crawler:'grave-crawler',
  bone_serpent:'bone_serpent', venom_toad:'toad', rust_serpent:'serpent',
  ghoul:'ghoul', ember_salamander:'salamander', ash_wraith:'ash-wraith',
  frost_sprite:'frost_sprite', fire_imp:'imp', ice_lurker:'ice-lurker',
  glacier_beast:'glacier-beast', rime_stalker:'rime-stalker', dark_knight:'dark-knight',
  magma_crab:'magma-crab', obsidian_gargoyle:'gargoyle', wraith:'wraith',
  lava_leech:'leech', inferno_knight:'inferno-knight', blood_beast:'blood_beast',
  void_warden:'void_guardian', nightmare_spawn:'nightmare',
  forgotten_one:'forgotten', golem:'golem', ancient_guardian:'guardian',
  demon:'demon', eldritch_titan:'titan', shadow:'shadow_lord',
  abyssal:'abyssal', undead_shaman:'shaman', the_island:'island',
  abyssal_warden:'abyssal_warden', depth_leviathan:'depth_leviathan',
};

// ── Color overrides for specific fish archetypes ──
const FISH_COLORS = {
  fish_small: ['#a8c0d0', '#7a9ab0'], fish_medium: ['#5a8a6a', '#3a6a4a'], fish_large: ['#4a7a9a', '#2a5a7a'],
  flatfish: ['#b0a880', '#807850'], ray: ['#6a7a8a', '#4a5a6a'], eel: ['#3a4a3a', '#2a3a2a'],
  octopus: ['#c45a5a', '#8a3a3a'], squid: ['#d0c0c0', '#9a8a8a'], cuttlefish: ['#c0a8a0', '#8a7060'],
  kraken: ['#5a3a5a', '#3a1a3a'], lobster: ['#c44a2a', '#8a2a1a'], horseshoe: ['#4a6a8a', '#2a4a6a'],
  anglerfish: ['#2a2a3a', '#1a1a2a'], puffer: ['#d4b04a', '#9a8030'], lionfish: ['#e04a2a', '#c4301a'],
  nautilus: ['#e0d0c0', '#a09080'], sea_spider: ['#8a5a4a', '#5a3a2a'], serpent: ['#3a2a5a', '#2a1a3a'],
  leviathan: ['#1a1a3a', '#0a0a2a'], cavern_fish: '#4a8a9a',
};

// ── Helper drawing functions ──
function ell(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function ellR(ctx, x, y, rx, ry, rot, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}
function circ(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function shape(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

// ── Fish drawing functions ──
function drawFishGeneric(ctx, s, col, dark, scale = 1) {
  const cx = s * 0.45, cy = s * 0.5;
  // tail
  shape(ctx, [[cx - 8*scale, cy], [cx - 16*scale, cy - 8*scale], [cx - 16*scale, cy + 8*scale]], col);
  shape(ctx, [[cx - 8*scale, cy], [cx - 14*scale, cy - 5*scale], [cx - 14*scale, cy + 5*scale]], dark);
  // body
  ell(ctx, cx, cy, 12*scale, 7*scale, col);
  ell(ctx, cx, cy, 12*scale, 7*scale, col);
  // belly
  ell(ctx, cx, cy + 2*scale, 9*scale, 3*scale, dark);
  // eye
  circ(ctx, cx + 7*scale, cy - 2*scale, 1.5, '#fff');
  circ(ctx, cx + 7.5*scale, cy - 2*scale, 1, '#111');
  // fin
  shape(ctx, [[cx, cy - 5*scale], [cx + 3*scale, cy - 11*scale], [cx + 6*scale, cy - 5*scale]], dark);
}

function drawFishSmall(ctx, s, col, dark) { drawFishGeneric(ctx, s, col, dark, 0.7); }
function drawFishMedium(ctx, s, col, dark) { drawFishGeneric(ctx, s, col, dark, 1.0); }
function drawFishLarge(ctx, s, col, dark) { drawFishGeneric(ctx, s, col, dark, 1.3); }

function drawFlatfish(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  ell(ctx, cx, cy, 16, 8, col);
  ell(ctx, cx, cy+2, 14, 5, dark);
  // tail
  shape(ctx, [[cx-14, cy], [cx-20, cy-4], [cx-20, cy+4]], dark);
  // eyes (both on top side - flatfish)
  circ(ctx, cx+8, cy-2, 1.5, '#fff'); circ(ctx, cx+8.5, cy-2, 1, '#111');
  circ(ctx, cx+3, cy-2, 1.2, '#fff'); circ(ctx, cx+3.5, cy-2, 0.8, '#111');
}

function drawRay(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // diamond body
  shape(ctx, [[cx, cy-10], [cx+16, cy], [cx, cy+8], [cx-16, cy]], col);
  shape(ctx, [[cx, cy-6], [cx+12, cy], [cx, cy+5], [cx-12, cy]], dark);
  // tail
  ctx.strokeStyle = dark; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx-16, cy); ctx.lineTo(cx-24, cy+2); ctx.stroke();
  // eyes
  circ(ctx, cx+6, cy-2, 1.5, '#fff'); circ(ctx, cx+6.5, cy-2, 1, '#111');
  circ(ctx, cx-6, cy-2, 1.5, '#fff'); circ(ctx, cx-5.5, cy-2, 1, '#111');
}

function drawEel(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // sinuous body
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx+18, cy-2);
  ctx.bezierCurveTo(cx+10, cy-8, cx-5, cy-8, cx-15, cy-2);
  ctx.bezierCurveTo(cx-18, cy, cx-18, cy+2, cx-15, cy+4);
  ctx.bezierCurveTo(cx-5, cy+8, cx+10, cy+8, cx+18, cy+2);
  ctx.closePath(); ctx.fill();
  // belly shading
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(cx+18, cy+2);
  ctx.bezierCurveTo(cx+10, cy+6, cx-5, cy+6, cx-15, cy+4);
  ctx.bezierCurveTo(cx-10, cy+6, cx, cy+7, cx+18, cy+2);
  ctx.closePath(); ctx.fill();
  // dorsal fin
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(cx+10, cy-5); ctx.lineTo(cx, cy-10); ctx.lineTo(cx-8, cy-5); ctx.closePath(); ctx.fill();
  // eye
  circ(ctx, cx+14, cy-2, 1.5, '#fff'); circ(ctx, cx+14.5, cy-2, 1, '#111');
  // mouth
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx+18, cy+1); ctx.lineTo(cx+14, cy+2); ctx.stroke();
}

function drawSquid(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.42;
  // mantle (torpedo body)
  shape(ctx, [[cx, cy-12], [cx+7, cy-2], [cx+6, cy+4], [cx-6, cy+4], [cx-7, cy-2]], col);
  // fins
  shape(ctx, [[cx-7, cy-2], [cx-12, cy+2], [cx-6, cy+4]], dark);
  shape(ctx, [[cx+7, cy-2], [cx+12, cy+2], [cx+6, cy+4]], dark);
  // eye
  circ(ctx, cx+3, cy-1, 2, '#fff'); circ(ctx, cx+3.5, cy-1, 1.3, '#111');
  // tentacles
  ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  const tentX = [cx-5, cx-2.5, cx, cx+2.5, cx+5];
  for (const tx of tentX) {
    ctx.beginPath();
    ctx.moveTo(tx, cy+4);
    ctx.quadraticCurveTo(tx+2, cy+12, tx+1, cy+18);
    ctx.stroke();
  }
  // two longer feeding tentacles
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx-4, cy+4); ctx.quadraticCurveTo(cx-8, cy+12, cx-6, cy+20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+4, cy+4); ctx.quadraticCurveTo(cx+8, cy+12, cx+6, cy+20); ctx.stroke();
}

function drawOctopus(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.38;
  // head
  circ(ctx, cx, cy, 9, col);
  circ(ctx, cx, cy-1, 8, col);
  // eyes
  circ(ctx, cx-3, cy-1, 2.5, '#fff'); circ(ctx, cx-3, cy-1, 1.5, '#111');
  circ(ctx, cx+3, cy-1, 2.5, '#fff'); circ(ctx, cx+3, cy-1, 1.5, '#111');
  // tentacles
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const arms = [-6, -4, -2, 0, 2, 4, 6];
  for (const off of arms) {
    const tx = cx + off;
    ctx.beginPath();
    ctx.moveTo(tx, cy+6);
    ctx.quadraticCurveTo(tx+off*0.5, cy+14, tx+off*1.2, cy+18);
    ctx.stroke();
  }
}

function drawCuttlefish(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.4;
  // broad body
  ell(ctx, cx, cy, 9, 11, col);
  // fins along sides
  shape(ctx, [[cx-9, cy-4], [cx-13, cy], [cx-9, cy+4]], dark);
  shape(ctx, [[cx+9, cy-4], [cx+13, cy], [cx+9, cy+4]], dark);
  // eyes
  circ(ctx, cx-3, cy-2, 2, '#fff'); circ(ctx, cx-3, cy-2, 1.3, '#111');
  circ(ctx, cx+3, cy-2, 2, '#fff'); circ(ctx, cx+3, cy-2, 1.3, '#111');
  // tentacles
  ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (let i = -3; i <= 3; i += 1.5) {
    ctx.beginPath();
    ctx.moveTo(cx+i, cy+8);
    ctx.quadraticCurveTo(cx+i+1, cy+14, cx+i+2, cy+18);
    ctx.stroke();
  }
}

function drawKraken(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.38;
  // big head
  circ(ctx, cx, cy, 11, col);
  circ(ctx, cx, cy-1, 10, col);
  // glowing eyes
  circ(ctx, cx-4, cy-1, 2.5, '#e04040'); circ(ctx, cx-4, cy-1, 1.5, '#fff');
  circ(ctx, cx+4, cy-1, 2.5, '#e04040'); circ(ctx, cx+4, cy-1, 1.5, '#fff');
  // thick tentacles
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = -8; i <= 8; i += 3) {
    ctx.beginPath();
    ctx.moveTo(cx+i, cy+7);
    ctx.quadraticCurveTo(cx+i*1.5, cy+14, cx+i*2+1, cy+20);
    ctx.stroke();
  }
  // suckers
  ctx.fillStyle = dark;
  for (let i = -6; i <= 6; i += 3) {
    circ(ctx, cx+i*1.8+1, cy+18, 1.5, dark);
  }
}

function drawLobster(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // claws
  shape(ctx, [[cx-6, cy-2], [cx-14, cy-4], [cx-14, cy+2], [cx-6, cy+2]], col);
  shape(ctx, [[cx+6, cy-2], [cx+14, cy-4], [cx+14, cy+2], [cx+6, cy+2]], col);
  circ(ctx, cx-13, cy-1, 3, dark); circ(ctx, cx+13, cy-1, 3, dark);
  // body segments
  ell(ctx, cx, cy, 5, 7, col);
  // head
  circ(ctx, cx, cy-6, 4, col);
  // antennae
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-2, cy-9); ctx.lineTo(cx-8, cy-14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+2, cy-9); ctx.lineTo(cx+8, cy-14); ctx.stroke();
  // eyes
  circ(ctx, cx-2, cy-7, 1, '#111'); circ(ctx, cx+2, cy-7, 1, '#111');
  // tail segments
  for (let i = 0; i < 3; i++) {
    ell(ctx, cx, cy+5+i*3, 4-i*0.5, 2.5, dark);
  }
  // tail fan
  shape(ctx, [[cx, cy+15], [cx-4, cy+18], [cx, cy+16], [cx+4, cy+18]], col);
}

function drawHorseshoe(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.45;
  // dome shell
  ell(ctx, cx, cy, 12, 8, col);
  ell(ctx, cx, cy-1, 11, 7, col);
  // shell ridge
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, 8, Math.PI*0.1, Math.PI*0.9); ctx.stroke();
  // tail
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy+6); ctx.lineTo(cx+2, cy+18); ctx.stroke();
  // legs
  ctx.strokeStyle = dark; ctx.lineWidth = 2;
  for (let i = -3; i <= 3; i += 1.5) {
    ctx.beginPath(); ctx.moveTo(cx+i, cy+5); ctx.lineTo(cx+i*1.5, cy+10); ctx.stroke();
  }
}

function drawAnglerfish(ctx, s, col, dark) {
  const cx = s*0.42, cy = s*0.5;
  // lure stalk + glow
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-2, cy-8); ctx.quadraticCurveTo(cx-6, cy-14, cx-4, cy-16); ctx.stroke();
  circ(ctx, cx-4, cy-16, 3, '#ffd040'); circ(ctx, cx-4, cy-16, 1.5, '#ffea80');
  // body — big head, wide mouth
  shape(ctx, [
    [cx-10, cy-4], [cx+8, cy-7], [cx+12, cy], [cx+10, cy+5],
    [cx-8, cy+6], [cx-12, cy+2]
  ], col);
  // mouth interior
  shape(ctx, [[cx+2, cy-2], [cx+11, cy], [cx+9, cy+3], [cx+2, cy+3]], dark);
  // teeth
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) {
    shape(ctx, [[cx+3+i*2, cy-2], [cx+4+i*2, cy+1], [cx+5+i*2, cy-2]], '#fff');
  }
  // eye
  circ(ctx, cx+2, cy-4, 2, '#fff'); circ(ctx, cx+2.5, cy-4, 1.3, '#111');
  // tail
  shape(ctx, [[cx-10, cy], [cx-16, cy-5], [cx-16, cy+5]], dark);
}

function drawPuffer(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // round body
  circ(ctx, cx, cy, 10, col);
  circ(ctx, cx, cy+1, 9, dark);
  circ(ctx, cx, cy, 8, col);
  // spikes
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI*2; a += Math.PI/8) {
    const x1 = cx + Math.cos(a)*10, y1 = cy + Math.sin(a)*10;
    const x2 = cx + Math.cos(a)*14, y2 = cy + Math.sin(a)*14;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  // eye
  circ(ctx, cx+5, cy-3, 2, '#fff'); circ(ctx, cx+5.5, cy-3, 1.3, '#111');
  // mouth
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx+8, cy+1, 2, 0, Math.PI); ctx.stroke();
}

function drawLionfish(ctx, s, col, dark) {
  const cx = s*0.45, cy = s*0.5;
  // body
  ell(ctx, cx, cy, 8, 6, col);
  ell(ctx, cx, cy+2, 7, 3, dark);
  // striped pattern
  ctx.strokeStyle = dark; ctx.lineWidth = 2;
  for (let i = -4; i <= 4; i += 3) {
    ctx.beginPath(); ctx.moveTo(cx+i, cy-5); ctx.lineTo(cx+i, cy+5); ctx.stroke();
  }
  // spiky fins
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let a = -1.2; a <= 1.2; a += 0.4) {
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*8, cy+Math.sin(a)*6);
    ctx.lineTo(cx+Math.cos(a)*14, cy+Math.sin(a)*12);
    ctx.stroke();
  }
  // tail
  shape(ctx, [[cx-7, cy], [cx-13, cy-4], [cx-13, cy+4]], dark);
  // eye
  circ(ctx, cx+5, cy-2, 1.5, '#fff'); circ(ctx, cx+5.5, cy-2, 1, '#111');
}

function drawNautilus(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // spiral shell
  ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let r = 3; r <= 13; r += 0.5) {
    const a = r * 0.8;
    const x = cx + Math.cos(a) * r * 0.7;
    const y = cy + Math.sin(a) * r * 0.7;
    if (r === 3) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // shell fill
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let r = 2; r <= 14; r += 0.3) {
    const a = r * 0.8;
    const x = cx + Math.cos(a) * r * 0.7;
    const y = cy + Math.sin(a) * r * 0.7;
    if (r === 2) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.fill();
  // shell stripes
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let r = 4; r <= 13; r += 3) {
    ctx.beginPath();
    for (let rr = r; rr <= r+2; rr += 0.3) {
      const a = rr * 0.8;
      const x = cx + Math.cos(a) * rr * 0.7;
      const y = cy + Math.sin(a) * rr * 0.7;
      if (rr === r) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // tentacles
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (let i = -3; i <= 3; i += 1.5) {
    ctx.beginPath(); ctx.moveTo(cx+i, cy+8); ctx.lineTo(cx+i*1.5, cy+14); ctx.stroke();
  }
}

function drawSeaSpider(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // tiny body
  circ(ctx, cx, cy, 3, col);
  // long legs
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a)*6, cy + Math.sin(a)*6);
    ctx.lineTo(cx + Math.cos(a)*14, cy + Math.sin(a)*14 + (i%2 ? 2 : -2));
    ctx.stroke();
  }
  // proboscis
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy+6); ctx.stroke();
}

function drawSerpent(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // serpentine body
  ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx+16, cy);
  ctx.bezierCurveTo(cx+8, cy-10, cx-4, cy+10, cx-12, cy-2);
  ctx.stroke();
  ctx.strokeStyle = dark; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx+16, cy+1);
  ctx.bezierCurveTo(cx+8, cy-9, cx-4, cy+11, cx-12, cy-1);
  ctx.stroke();
  // head
  circ(ctx, cx+16, cy, 4, col);
  // eye
  circ(ctx, cx+17, cy-1, 1.5, '#ff4040');
  // mouth/fangs
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx+19, cy+1); ctx.lineTo(cx+21, cy+3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+19, cy+3); ctx.lineTo(cx+21, cy+5); ctx.stroke();
  // fins
  ctx.fillStyle = dark;
  for (let i = 0; i < 3; i++) {
    const t = i / 3;
    const fx = cx + 8 - t*16, fy = cy - 4 + t*8;
    shape(ctx, [[fx, fy], [fx+3, fy-6], [fx-2, fy-4]], dark);
  }
}

function drawLeviathan(ctx, s, col, dark) {
  const cx = s*0.45, cy = s*0.5;
  // massive serpentine body
  ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx+14, cy+2);
  ctx.bezierCurveTo(cx+4, cy-12, cx-8, cy+12, cx-16, cy-4);
  ctx.stroke();
  ctx.strokeStyle = dark; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx+14, cy+3);
  ctx.bezierCurveTo(cx+4, cy-11, cx-8, cy+13, cx-16, cy-3);
  ctx.stroke();
  // head
  ell(ctx, cx+14, cy+2, 6, 5, col);
  // glowing eyes
  circ(ctx, cx+16, cy, 2, '#ff2020'); circ(ctx, cx+16, cy, 1, '#fff');
  // maw
  ctx.fillStyle = '#1a0a0a';
  shape(ctx, [[cx+17, cy+3], [cx+22, cy+2], [cx+22, cy+6], [cx+17, cy+5]], '#1a0a0a');
  // teeth
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 3; i++) shape(ctx, [[cx+18+i*1.5, cy+3], [cx+19+i*1.5, cy+5], [cx+20+i*1.5, cy+3]], '#fff');
  // dorsal spines
  ctx.fillStyle = dark;
  for (let i = 0; i < 4; i++) {
    const t = i / 4;
    const fx = cx + 6 - t*14, fy = cy - 4 + t*8;
    shape(ctx, [[fx, fy], [fx+4, fy-8], [fx-1, fy-6]], dark);
  }
}

function drawCavernFish(ctx, s, col, dark) {
  const cx = s*0.45, cy = s*0.5;
  // pale, eyeless fish
  shape(ctx, [[cx-8, cy], [cx-14, cy-7], [cx-14, cy+7]], col);
  ell(ctx, cx, cy, 11, 6, col);
  ell(ctx, cx, cy+2, 9, 3, dark);
  // no eyes — just pale indentations
  circ(ctx, cx+6, cy-1, 1.5, dark);
  // needle teeth
  ctx.fillStyle = '#ddd';
  for (let i = 0; i < 4; i++) shape(ctx, [[cx+8+i, cy+2], [cx+9+i, cy+4], [cx+10+i, cy+2]], '#ddd');
  // fins
  shape(ctx, [[cx, cy-5], [cx+3, cy-10], [cx+6, cy-5]], dark);
}

// ── Monster drawing functions ──
function drawSlime(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.55;
  // blobby body
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx-12, cy+6);
  ctx.bezierCurveTo(cx-14, cy-4, cx-8, cy-12, cx, cy-12);
  ctx.bezierCurveTo(cx+8, cy-12, cx+14, cy-4, cx+12, cy+6);
  ctx.bezierCurveTo(cx+12, cy+10, cx-12, cy+10, cx-12, cy+6);
  ctx.closePath(); ctx.fill();
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ell(ctx, cx-4, cy-6, 3, 4, 'rgba(255,255,255,0.25)');
  // eyes
  circ(ctx, cx-4, cy-1, 2, '#fff'); circ(ctx, cx-3.5, cy-1, 1.2, '#111');
  circ(ctx, cx+4, cy-1, 2, '#fff'); circ(ctx, cx+4.5, cy-1, 1.2, '#111');
}

function drawBat(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.45;
  // wings
  shape(ctx, [[cx-2, cy], [cx-12, cy-6], [cx-16, cy+2], [cx-6, cy+4]], col);
  shape(ctx, [[cx+2, cy], [cx+12, cy-6], [cx+16, cy+2], [cx+6, cy+4]], col);
  // body
  ell(ctx, cx, cy+2, 4, 6, dark);
  // head
  circ(ctx, cx, cy-3, 4, dark);
  // ears
  shape(ctx, [[cx-3, cy-5], [cx-4, cy-9], [cx-1, cy-6]], dark);
  shape(ctx, [[cx+3, cy-5], [cx+4, cy-9], [cx+1, cy-6]], dark);
  // eyes
  circ(ctx, cx-2, cy-3, 1.2, '#ff4040'); circ(ctx, cx+2, cy-3, 1.2, '#ff4040');
}

function drawRat(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // body
  ell(ctx, cx, cy+2, 8, 6, col);
  // head
  ell(ctx, cx+6, cy, 5, 4, col);
  // ears
  circ(ctx, cx+4, cy-4, 2.5, dark); circ(ctx, cx+9, cy-4, 2.5, dark);
  // eye
  circ(ctx, cx+8, cy-1, 1, '#ff4040');
  // nose
  circ(ctx, cx+11, cy+1, 1.5, dark);
  // tail
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-6, cy+4); ctx.quadraticCurveTo(cx-14, cy+8, cx-16, cy+2); ctx.stroke();
  // legs
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-2, cy+7); ctx.lineTo(cx-4, cy+10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+4, cy+7); ctx.lineTo(cx+2, cy+10); ctx.stroke();
}

function drawNewt(ctx, s, col, dark) {
  const cx = s*0.45, cy = s*0.5;
  // tail
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-6, cy+2); ctx.quadraticCurveTo(cx-14, cy, cx-18, cy+8); ctx.stroke();
  // body
  ell(ctx, cx, cy, 6, 4, col);
  // head
  ell(ctx, cx+6, cy-1, 4, 3, col);
  // legs
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-2, cy+3); ctx.lineTo(cx-4, cy+7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+3, cy+3); ctx.lineTo(cx+1, cy+7); ctx.stroke();
  // eye
  circ(ctx, cx+8, cy-2, 1.5, '#fff'); circ(ctx, cx+8.5, cy-2, 1, '#111');
}

function drawCrab(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // claws
  circ(ctx, cx-12, cy-2, 4, col); circ(ctx, cx+12, cy-2, 4, col);
  shape(ctx, [[cx-12, cy-5], [cx-16, cy-7], [cx-14, cy-1]], col);
  shape(ctx, [[cx+12, cy-5], [cx+16, cy-7], [cx+14, cy-1]], col);
  // body shell
  ell(ctx, cx, cy, 8, 6, col);
  ell(ctx, cx, cy-1, 7, 4, dark);
  // eyes on stalks
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-3, cy-4); ctx.lineTo(cx-4, cy-8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+3, cy-4); ctx.lineTo(cx+4, cy-8); ctx.stroke();
  circ(ctx, cx-4, cy-8, 1.5, '#fff'); circ(ctx, cx-4, cy-8, 1, '#111');
  circ(ctx, cx+4, cy-8, 1.5, '#fff'); circ(ctx, cx+4, cy-8, 1, '#111');
  // legs
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    if (i === 0) continue;
    ctx.beginPath(); ctx.moveTo(cx+i*2, cy+4); ctx.lineTo(cx+i*3, cy+10); ctx.stroke();
  }
}

function drawWorm(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // segmented body
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx+14, cy-6);
  ctx.bezierCurveTo(cx+8, cy-2, cx-4, cy+8, cx-14, cy-2);
  ctx.stroke();
  // segments
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  for (let i = -10; i <= 12; i += 4) {
    const t = (i+14)/28;
    const x = cx+14 - t*28;
    const y = cy-6 + t*8 + Math.sin(t*Math.PI)*4;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.stroke();
  }
  // glow
  circ(ctx, cx+14, cy-6, 3, col);
  ctx.fillStyle = 'rgba(170,255,170,0.3)';
  ctx.beginPath(); ctx.arc(cx+14, cy-6, 6, 0, Math.PI*2); ctx.fill();
}

function drawCentipede(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // body segments
  ctx.fillStyle = col;
  for (let i = -14; i <= 12; i += 4) {
    circ(ctx, cx+i, cy+Math.sin(i*0.3)*3, 3, col);
  }
  // legs
  ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.lineCap = 'round';
  for (let i = -12; i <= 10; i += 4) {
    const y = cy + Math.sin(i*0.3)*3;
    ctx.beginPath(); ctx.moveTo(cx+i, y+2); ctx.lineTo(cx+i-1, y+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+i, y+2); ctx.lineTo(cx+i+1, y+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+i, y-2); ctx.lineTo(cx+i-1, y-8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+i, y-2); ctx.lineTo(cx+i+1, y-8); ctx.stroke();
  }
  // head
  circ(ctx, cx+14, cy+Math.sin(4.2)*3, 3.5, dark);
  // mandibles
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx+17, cy+1); ctx.lineTo(cx+20, cy+3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+17, cy-1); ctx.lineTo(cx+20, cy-3); ctx.stroke();
}

function drawFlatPredator(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.55;
  // flat camouflaged body
  shape(ctx, [[cx-14, cy+2], [cx-8, cy-4], [cx+8, cy-4], [cx+14, cy+2], [cx+8, cy+6], [cx-8, cy+6]], col);
  // mossy texture
  ctx.fillStyle = dark;
  for (let i = 0; i < 8; i++) {
    circ(ctx, cx-10+i*3, cy-2+(i%2)*4, 1.5, dark);
  }
  // eyes
  circ(ctx, cx+6, cy-1, 1.5, '#ffcc00'); circ(ctx, cx-6, cy-1, 1.5, '#ffcc00');
}

function drawMole(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // body
  ell(ctx, cx, cy+2, 8, 7, col);
  // head
  circ(ctx, cx+6, cy, 5, col);
  // snout
  shape(ctx, [[cx+9, cy-2], [cx+14, cy], [cx+9, cy+2]], dark);
  circ(ctx, cx+14, cy, 1.5, dark); // nose
  // closed eyes (blind)
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx+5, cy-3); ctx.lineTo(cx+8, cy-3); ctx.stroke();
  // claw
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx+2, cy+5); ctx.lineTo(cx, cy+10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+5, cy+6); ctx.lineTo(cx+4, cy+11); ctx.stroke();
}

function drawZombie(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // mushroom cap on head
  circ(ctx, cx, cy-10, 6, '#c44a4a'); circ(ctx, cx, cy-10, 5, '#e06a6a');
  // spots
  circ(ctx, cx-2, cy-11, 1, '#fff'); circ(ctx, cx+2, cy-9, 1.5, '#fff');
  // body
  shape(ctx, [[cx-5, cy-4], [cx+5, cy-4], [cx+6, cy+8], [cx-6, cy+8]], col);
  // arms
  shape(ctx, [[cx-5, cy], [cx-10, cy+2], [cx-10, cy+5], [cx-5, cy+4]], col);
  shape(ctx, [[cx+5, cy], [cx+10, cy+4], [cx+10, cy+7], [cx+5, cy+4]], col);
  // head
  circ(ctx, cx, cy-3, 4, col);
  // eyes
  circ(ctx, cx-2, cy-4, 1, '#ff4040'); circ(ctx, cx+2, cy-4, 1, '#ff4040');
  // spores
  ctx.fillStyle = 'rgba(180,180,100,0.4)';
  for (let i = 0; i < 4; i++) circ(ctx, cx+(i-2)*4, cy-14+i*2, 1.5, 'rgba(180,180,100,0.4)');
}

function drawSpider(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // legs
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a1 = -1.2 + i*0.3, a2 = 1.2 - i*0.3;
    // left legs
    ctx.beginPath();
    ctx.moveTo(cx-3, cy);
    ctx.lineTo(cx-8, cy-6+i*2);
    ctx.lineTo(cx-14, cy-4+i*3);
    ctx.stroke();
    // right legs
    ctx.beginPath();
    ctx.moveTo(cx+3, cy);
    ctx.lineTo(cx+8, cy-6+i*2);
    ctx.lineTo(cx+14, cy-4+i*3);
    ctx.stroke();
  }
  // abdomen
  ell(ctx, cx-3, cy+1, 5, 5, col);
  // head
  circ(ctx, cx+4, cy, 3.5, col);
  // eyes (multiple)
  circ(ctx, cx+5, cy-1, 0.8, '#ff4040'); circ(ctx, cx+6, cy, 0.8, '#ff4040');
  circ(ctx, cx+5, cy+1, 0.8, '#ff4040'); circ(ctx, cx+3, cy-1, 0.8, '#ff4040');
}

function drawBeetle(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // shell
  ell(ctx, cx, cy, 8, 10, col);
  // shell split line
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, cy-9); ctx.lineTo(cx, cy+9); ctx.stroke();
  // iridescent shine
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ell(ctx, cx-3, cy-3, 2, 3, 'rgba(255,255,255,0.3)');
  // head
  circ(ctx, cx, cy-10, 3.5, dark);
  // eyes
  circ(ctx, cx-2, cy-11, 1, '#fff'); circ(ctx, cx+2, cy-11, 1, '#fff');
  // mandibles
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-1, cy-12); ctx.lineTo(cx-3, cy-15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+1, cy-12); ctx.lineTo(cx+3, cy-15); ctx.stroke();
  // legs
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(cx-7, cy+i*3); ctx.lineTo(cx-12, cy+i*4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+7, cy+i*3); ctx.lineTo(cx+12, cy+i*4); ctx.stroke();
  }
}

function drawWraith(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.42;
  // ghostly body — wispy bottom
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx-7, cy-2);
  ctx.bezierCurveTo(cx-8, cy-12, cx+8, cy-12, cx+7, cy-2);
  ctx.bezierCurveTo(cx+8, cy+6, cx+4, cy+12, cx+5, cy+16);
  ctx.lineTo(cx+2, cy+14); ctx.lineTo(cx, cy+17); ctx.lineTo(cx-2, cy+14);
  ctx.lineTo(cx-5, cy+16); ctx.bezierCurveTo(cx-4, cy+12, cx-8, cy+6, cx-7, cy-2);
  ctx.closePath(); ctx.fill();
  // transparency glow
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  circ(ctx, cx, cy, 8, 'rgba(255,255,255,0.1)');
  // eyes — dark voids
  circ(ctx, cx-3, cy-3, 2, '#000'); circ(ctx, cx+3, cy-3, 2, '#000');
  // glowing pupils
  circ(ctx, cx-3, cy-3, 0.8, dark); circ(ctx, cx+3, cy-3, 0.8, dark);
}

function drawStalactite(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // hanging body
  shape(ctx, [[cx-5, 2], [cx+5, 2], [cx+3, cy], [cx+1, cy+8], [cx, cy+12], [cx-1, cy+8], [cx-3, cy]], col);
  // rocky texture
  ctx.fillStyle = dark;
  circ(ctx, cx-2, cy-4, 1.5, dark); circ(ctx, cx+2, cy, 1.5, dark);
  // eye
  circ(ctx, cx, cy-2, 1.5, '#ff4040');
  // drip
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, cy+12); ctx.lineTo(cx, cy+16); ctx.stroke();
}

function drawFossil(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // skeletal creature shape
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  // spine
  ctx.beginPath(); ctx.moveTo(cx+14, cy); ctx.bezierCurveTo(cx+4, cy-8, cx-8, cy+8, cx-14, cy-2); ctx.stroke();
  // ribs
  ctx.lineWidth = 1.5;
  for (let i = -10; i <= 10; i += 4) {
    const t = (i+14)/28;
    const x = cx+14 - t*28;
    const y = cy + Math.sin(t*Math.PI)*6 - 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x-2, y+5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+2, y+5); ctx.stroke();
  }
  // skull
  circ(ctx, cx+14, cy, 3, col);
  circ(ctx, cx+15, cy-1, 1, dark); // eye socket
}

function drawSkeleton(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // skull
  circ(ctx, cx, cy-8, 5, col);
  // eye sockets
  circ(ctx, cx-2, cy-8, 1.5, '#000'); circ(ctx, cx+2, cy-8, 1.5, '#000');
  // jaw/teeth
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx+i, cy-5); ctx.lineTo(cx+i, cy-3); ctx.stroke(); }
  // ribcage
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy-3); ctx.lineTo(cx, cy+10); ctx.stroke(); // spine
  for (let i = 0; i < 4; i++) {
    const y = cy-1+i*3;
    ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx-5, y+1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx+5, y+1); ctx.stroke();
  }
  // arm with sword
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx-8, cy+3); ctx.stroke();
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-8, cy+3); ctx.lineTo(cx-12, cy-4); ctx.stroke();
  // legs
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy+10); ctx.lineTo(cx-3, cy+16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy+10); ctx.lineTo(cx+3, cy+16); ctx.stroke();
}

function drawGolem(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // body — rocky blocks
  shape(ctx, [[cx-7, cy-2], [cx+7, cy-2], [cx+8, cy+8], [cx-8, cy+8]], col);
  // cracks
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-4, cy); ctx.lineTo(cx-2, cy+4); ctx.lineTo(cx-5, cy+6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+3, cy+1); ctx.lineTo(cx+5, cy+5); ctx.stroke();
  // head
  shape(ctx, [[cx-4, cy-10], [cx+4, cy-10], [cx+5, cy-3], [cx-5, cy-3]], col);
  // eyes — glowing
  circ(ctx, cx-2, cy-7, 1.5, '#ffcc00'); circ(ctx, cx+2, cy-7, 1.5, '#ffcc00');
  // arms
  shape(ctx, [[cx-7, cy], [cx-12, cy+2], [cx-12, cy+7], [cx-7, cy+6]], col);
  shape(ctx, [[cx+7, cy], [cx+12, cy+2], [cx+12, cy+7], [cx+7, cy+6]], col);
  // legs
  shape(ctx, [[cx-6, cy+8], [cx-2, cy+8], [cx-3, cy+16], [cx-7, cy+16]], col);
  shape(ctx, [[cx+2, cy+8], [cx+6, cy+8], [cx+7, cy+16], [cx+3, cy+16]], col);
}

function drawTroll(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // hulking body
  shape(ctx, [[cx-9, cy-2], [cx+9, cy-2], [cx+10, cy+10], [cx-10, cy+10]], col);
  // head
  circ(ctx, cx, cy-6, 6, col);
  // eyes
  circ(ctx, cx-3, cy-7, 1.5, '#fff'); circ(ctx, cx-3, cy-7, 1, '#111');
  circ(ctx, cx+3, cy-7, 1.5, '#fff'); circ(ctx, cx+3, cy-7, 1, '#111');
  // tusks
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-2, cy-3); ctx.lineTo(cx-3, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+2, cy-3); ctx.lineTo(cx+3, cy); ctx.stroke();
  // arms
  shape(ctx, [[cx-9, cy], [cx-14, cy+4], [cx-14, cy+10], [cx-9, cy+8]], col);
  shape(ctx, [[cx+9, cy], [cx+14, cy+4], [cx+14, cy+10], [cx+9, cy+8]], col);
  // club
  shape(ctx, [[cx-14, cy+4], [cx-18, cy], [cx-19, cy+8], [cx-14, cy+10]], dark);
}

function drawMummy(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // body
  shape(ctx, [[cx-6, cy-4], [cx+6, cy-4], [cx+7, cy+10], [cx-7, cy+10]], col);
  // head
  circ(ctx, cx, cy-6, 5, col);
  // bandage wraps
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let i = -3; i <= 8; i += 3) {
    ctx.beginPath(); ctx.moveTo(cx-7, cy+i); ctx.lineTo(cx+7, cy+i); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(cx-5, cy-9); ctx.lineTo(cx+5, cy-9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-5, cy-3); ctx.lineTo(cx+5, cy-3); ctx.stroke();
  // glowing eyes
  circ(ctx, cx-2, cy-6, 1, '#00e040'); circ(ctx, cx+2, cy-6, 1, '#00e040');
}

function drawBoneSerpent(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // skeletal snake body
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx+14, cy);
  ctx.bezierCurveTo(cx+6, cy-10, cx-4, cy+10, cx-14, cy);
  ctx.stroke();
  // vertebrae
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let t = 0.1; t < 1; t += 0.15) {
    const x = cx+14 - t*28;
    const y = cy + Math.sin(t*Math.PI)*10 - 5;
    ctx.beginPath(); ctx.moveTo(x-2, y-3); ctx.lineTo(x+2, y+3); ctx.stroke();
  }
  // skull
  circ(ctx, cx+14, cy, 4, col);
  circ(ctx, cx+15, cy-1, 1.5, '#000'); // eye socket
  // fangs
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx+17, cy+1); ctx.lineTo(cx+19, cy+3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+17, cy+3); ctx.lineTo(cx+19, cy+5); ctx.stroke();
}

function drawToad(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.55;
  // body
  ell(ctx, cx, cy, 11, 8, col);
  ell(ctx, cx, cy+2, 10, 6, dark);
  // warts
  circ(ctx, cx-5, cy-3, 2, dark); circ(ctx, cx+4, cy-4, 1.5, dark); circ(ctx, cx+6, cy+1, 2, dark);
  // eyes
  circ(ctx, cx-6, cy-6, 3, col); circ(ctx, cx+6, cy-6, 3, col);
  circ(ctx, cx-6, cy-6, 1.5, '#ffcc00'); circ(ctx, cx+6, cy-6, 1.5, '#ffcc00');
  // mouth
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy+2, 5, 0.2, Math.PI-0.2); ctx.stroke();
}

function drawSerpentM(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // metallic snake
  ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx+16, cy);
  ctx.bezierCurveTo(cx+8, cy-12, cx-4, cy+12, cx-14, cy-2);
  ctx.stroke();
  // blade scales
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let t = 0.1; t < 1; t += 0.1) {
    const x = cx+16 - t*30;
    const y = cy + Math.sin(t*Math.PI)*12 - 6;
    ctx.beginPath(); ctx.moveTo(x-2, y); ctx.lineTo(x+2, y-3); ctx.stroke();
  }
  // head
  ell(ctx, cx+16, cy, 4, 3, col);
  circ(ctx, cx+17, cy-1, 1.5, '#ff4040');
}

function drawGhoul(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // gaunt body
  shape(ctx, [[cx-5, cy-3], [cx+5, cy-3], [cx+6, cy+10], [cx-6, cy+10]], col);
  // head — gaunt
  ell(ctx, cx, cy-6, 4, 5, col);
  // sunken eyes
  circ(ctx, cx-2, cy-6, 1.5, '#000'); circ(ctx, cx+2, cy-6, 1.5, '#000');
  circ(ctx, cx-2, cy-6, 0.7, '#ff4040'); circ(ctx, cx+2, cy-6, 0.7, '#ff4040');
  // claws
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-5, cy); ctx.lineTo(cx-10, cy+5); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(cx-10, cy+5); ctx.lineTo(cx-12+i, cy+8); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(cx+5, cy); ctx.lineTo(cx+10, cy+5); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(cx+10, cy+5); ctx.lineTo(cx+12-i, cy+8); ctx.stroke();
  }
  // mouth — teeth
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx+i, cy-3); ctx.lineTo(cx+i, cy-1); ctx.stroke(); }
}

function drawSalamander(ctx, s, col, dark) {
  const cx = s*0.45, cy = s*0.5;
  // tail
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-4, cy+2); ctx.quadraticCurveTo(cx-14, cy, cx-18, cy+6); ctx.stroke();
  // body
  ell(ctx, cx, cy, 6, 4, col);
  ell(ctx, cx+6, cy-1, 4, 3, col);
  // flames
  ctx.fillStyle = '#ff6a2a';
  shape(ctx, [[cx-2, cy-4], [cx-4, cy-10], [cx, cy-6]], '#ff6a2a');
  shape(ctx, [[cx+2, cy-5], [cx, cy-12], [cx+4, cy-7]], '#ffa040');
  shape(ctx, [[cx+8, cy-4], [cx+6, cy-10], [cx+10, cy-6]], '#ff6a2a');
  // legs
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-2, cy+3); ctx.lineTo(cx-4, cy+7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+4, cy+3); ctx.lineTo(cx+2, cy+7); ctx.stroke();
  // eye
  circ(ctx, cx+8, cy-2, 1.5, '#fff'); circ(ctx, cx+8.5, cy-2, 1, '#111');
}

function drawFrostSprite(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // icy body
  shape(ctx, [[cx, cy-10], [cx+6, cy-2], [cx+4, cy+8], [cx-4, cy+8], [cx-6, cy-2]], col);
  // ice crystals
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  shape(ctx, [[cx, cy-12], [cx-2, cy-8], [cx+2, cy-8]], '#fff');
  // wings
  ctx.fillStyle = 'rgba(170,221,255,0.5)';
  ell(ctx, cx-8, cy-2, 5, 4, 'rgba(170,221,255,0.5)');
  ell(ctx, cx+8, cy-2, 5, 4, 'rgba(170,221,255,0.5)');
  // eyes
  circ(ctx, cx-2, cy-2, 1, '#0080ff'); circ(ctx, cx+2, cy-2, 1, '#0080ff');
}

function drawImp(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // body
  ell(ctx, cx, cy+2, 6, 7, col);
  // head
  circ(ctx, cx, cy-5, 5, col);
  // horns
  shape(ctx, [[cx-3, cy-8], [cx-5, cy-12], [cx-1, cy-9]], dark);
  shape(ctx, [[cx+3, cy-8], [cx+5, cy-12], [cx+1, cy-9]], dark);
  // eyes
  circ(ctx, cx-2, cy-5, 1.5, '#ffcc00'); circ(ctx, cx+2, cy-5, 1.5, '#ffcc00');
  // grin
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy-3, 2, 0, Math.PI); ctx.stroke();
  // flame
  ctx.fillStyle = '#ff6a2a';
  shape(ctx, [[cx-6, cy+4], [cx-8, cy+8], [cx-4, cy+6]], '#ff6a2a');
  shape(ctx, [[cx+6, cy+4], [cx+8, cy+8], [cx+4, cy+6]], '#ff6a2a');
}

function drawIceBeast(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // hulking body
  shape(ctx, [[cx-8, cy-2], [cx+8, cy-2], [cx+10, cy+10], [cx-10, cy+10]], col);
  // ice crystals on back
  shape(ctx, [[cx-5, cy-2], [cx-7, cy-8], [cx-3, cy-4]], '#cceeff');
  shape(ctx, [[cx, cy-2], [cx-2, cy-10], [cx+2, cy-4]], '#cceeff');
  shape(ctx, [[cx+5, cy-2], [cx+3, cy-8], [cx+7, cy-4]], '#cceeff');
  // head
  circ(ctx, cx, cy-5, 5, col);
  // eyes
  circ(ctx, cx-2, cy-5, 1.5, '#0080ff'); circ(ctx, cx+2, cy-5, 1.5, '#0080ff');
  // fangs
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-2, cy-2); ctx.lineTo(cx-3, cy+1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+2, cy-2); ctx.lineTo(cx+3, cy+1); ctx.stroke();
}

function drawKnight(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // armor body
  shape(ctx, [[cx-6, cy-3], [cx+6, cy-3], [cx+7, cy+8], [cx-7, cy+8]], col);
  // helmet
  shape(ctx, [[cx-4, cy-12], [cx+4, cy-12], [cx+5, cy-5], [cx-5, cy-5]], col);
  // visor slit
  ctx.fillStyle = dark;
  ctx.fillRect(cx-4, cy-9, 8, 1.5);
  // glowing eyes in slit
  circ(ctx, cx-2, cy-8.5, 0.8, '#ff2020'); circ(ctx, cx+2, cy-8.5, 0.8, '#ff2020');
  // shoulder pauldrons
  circ(ctx, cx-7, cy-2, 3, dark); circ(ctx, cx+7, cy-2, 3, dark);
  // sword
  ctx.strokeStyle = dark; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx+8, cy+2); ctx.lineTo(cx+14, cy-8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+6, cy+4); ctx.lineTo(cx+10, cy+4); ctx.stroke(); // guard
  // legs
  shape(ctx, [[cx-5, cy+8], [cx-1, cy+8], [cx-2, cy+16], [cx-6, cy+16]], col);
  shape(ctx, [[cx+1, cy+8], [cx+5, cy+8], [cx+6, cy+16], [cx+2, cy+16]], col);
}

function drawGargoyle(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // crouching body
  shape(ctx, [[cx-7, cy], [cx+7, cy], [cx+8, cy+8], [cx-8, cy+8]], col);
  // head
  circ(ctx, cx, cy-4, 5, col);
  // horns
  shape(ctx, [[cx-3, cy-7], [cx-5, cy-12], [cx-1, cy-8]], dark);
  shape(ctx, [[cx+3, cy-7], [cx+5, cy-12], [cx+1, cy-8]], dark);
  // wings
  shape(ctx, [[cx-7, cy], [cx-14, cy-6], [cx-10, cy+4]], dark);
  shape(ctx, [[cx+7, cy], [cx+14, cy-6], [cx+10, cy+4]], dark);
  // eyes
  circ(ctx, cx-2, cy-4, 1.5, '#ff2020'); circ(ctx, cx+2, cy-4, 1.5, '#ff2020');
  // claws
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(cx-6+i*2, cy+8); ctx.lineTo(cx-7+i*2, cy+11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+2+i*2, cy+8); ctx.lineTo(cx+1+i*2, cy+11); ctx.stroke();
  }
}

function drawLeech(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // segmented body
  ell(ctx, cx, cy, 6, 10, col);
  // segments
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let i = -8; i <= 8; i += 4) {
    ctx.beginPath(); ctx.moveTo(cx-6, cy+i); ctx.lineTo(cx+6, cy+i); ctx.stroke();
  }
  // sucker mouth
  circ(ctx, cx, cy-10, 4, dark);
  circ(ctx, cx, cy-10, 2, '#1a0a0a');
  // teeth
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) shape(ctx, [[cx-3+i*2, cy-11], [cx-2+i*2, cy-9], [cx-1+i*2, cy-11]], '#fff');
  // tail sucker
  circ(ctx, cx, cy+10, 3, dark);
}

function drawBloodBeast(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // pulsating mass
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx-10, cy);
  for (let a = 0; a < Math.PI*2; a += 0.3) {
    const r = 10 + Math.sin(a*4)*3;
    ctx.lineTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r);
  }
  ctx.closePath(); ctx.fill();
  // darker veins
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx+Math.cos(a)*8, cy+Math.sin(a)*8);
    ctx.stroke();
  }
  // eye
  circ(ctx, cx, cy, 3, '#fff'); circ(ctx, cx, cy, 2, '#000'); circ(ctx, cx, cy, 1, '#ff0000');
}

function drawVoidGuardian(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // hooded figure
  shape(ctx, [[cx-8, cy+10], [cx-7, cy-4], [cx-4, cy-10], [cx+4, cy-10], [cx+7, cy-4], [cx+8, cy+10]], col);
  // dark void inside hood
  circ(ctx, cx, cy-4, 4, '#000');
  // black hole eyes
  circ(ctx, cx-2, cy-4, 1.5, '#400060'); circ(ctx, cx+2, cy-4, 1.5, '#400060');
  // tendrils
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (let i = -6; i <= 6; i += 3) {
    ctx.beginPath(); ctx.moveTo(cx+i, cy+8); ctx.quadraticCurveTo(cx+i*1.5, cy+14, cx+i*2, cy+18); ctx.stroke();
  }
}

function drawNightmare(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // wrong body — asymmetrical
  shape(ctx, [[cx-8, cy-2], [cx+6, cy-4], [cx+10, cy+6], [cx-6, cy+8]], col);
  // too many limbs
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx+Math.cos(a)*5, cy+Math.sin(a)*5);
    ctx.lineTo(cx+Math.cos(a)*12, cy+Math.sin(a)*12);
    ctx.stroke();
  }
  // mouth that should not be
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 6, 4, 0, 0, Math.PI*2);
  ctx.fill();
  // teeth
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2;
    shape(ctx, [[cx+Math.cos(a)*5, cy+Math.sin(a)*3], [cx+Math.cos(a)*7, cy+Math.sin(a)*5], [cx+Math.cos(a+0.3)*5, cy+Math.sin(a+0.3)*3]], '#fff');
  }
  // one eye — wrong
  circ(ctx, cx+3, cy-8, 2, '#ff00ff'); circ(ctx, cx+3, cy-8, 1, '#000');
}

function drawForgotten(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // ancient humanoid
  shape(ctx, [[cx-6, cy-3], [cx+6, cy-3], [cx+7, cy+10], [cx-7, cy+10]], col);
  // head — featureless
  circ(ctx, cx, cy-7, 5, col);
  // faint rune
  circ(ctx, cx, cy-7, 1, dark);
  // tattered cloak edges
  ctx.fillStyle = dark;
  shape(ctx, [[cx-7, cy+4], [cx-10, cy+12], [cx-5, cy+10]], dark);
  shape(ctx, [[cx+7, cy+4], [cx+10, cy+12], [cx+5, cy+10]], dark);
  // ancient glow
  ctx.fillStyle = 'rgba(100,150,200,0.2)';
  circ(ctx, cx, cy-7, 8, 'rgba(100,150,200,0.2)');
}

function drawGuardian(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // towering sentinel
  shape(ctx, [[cx-8, cy-10], [cx+8, cy-10], [cx+9, cy+12], [cx-9, cy+12]], col);
  // ancient inscriptions
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i += 4) {
    ctx.beginPath(); ctx.moveTo(cx+i, cy-8); ctx.lineTo(cx+i+1, cy+8); ctx.stroke();
  }
  // head
  shape(ctx, [[cx-5, cy-16], [cx+5, cy-16], [cx+4, cy-10], [cx-4, cy-10]], col);
  // eyes — eternal
  circ(ctx, cx-2, cy-13, 1.5, '#ffd040'); circ(ctx, cx+2, cy-13, 1.5, '#ffd040');
}

function drawDemon(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // body
  shape(ctx, [[cx-7, cy-3], [cx+7, cy-3], [cx+8, cy+10], [cx-8, cy+10]], col);
  // head
  circ(ctx, cx, cy-6, 5, col);
  // horns — big
  shape(ctx, [[cx-3, cy-8], [cx-7, cy-15], [cx-1, cy-10]], dark);
  shape(ctx, [[cx+3, cy-8], [cx+7, cy-15], [cx+1, cy-10]], dark);
  // grin split face
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy-10); ctx.lineTo(cx, cy-2); ctx.stroke();
  // eyes
  circ(ctx, cx-3, cy-6, 1.5, '#ffcc00'); circ(ctx, cx+3, cy-6, 1.5, '#ffcc00');
  // wide grin
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy-3, 3, 0.1, Math.PI-0.1); ctx.stroke();
  // wings
  shape(ctx, [[cx-7, cy], [cx-14, cy-4], [cx-12, cy+6]], dark);
  shape(ctx, [[cx+7, cy], [cx+14, cy-4], [cx+12, cy+6]], dark);
}

function drawTitan(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // massive colossus
  shape(ctx, [[cx-10, cy-8], [cx+10, cy-8], [cx+12, cy+12], [cx-12, cy+12]], col);
  // geometric patterns
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  shape(ctx, [[cx, cy-4], [cx+5, cy], [cx, cy+4], [cx-5, cy]], 'rgba(0,0,0,0)');
  ctx.strokeRect(cx-4, cy-2, 8, 6);
  // head
  shape(ctx, [[cx-6, cy-16], [cx+6, cy-16], [cx+5, cy-8], [cx-5, cy-8]], col);
  // eyes — impossible geometry
  circ(ctx, cx-3, cy-12, 1.5, '#ff00ff'); circ(ctx, cx+3, cy-12, 1.5, '#ff00ff');
  circ(ctx, cx, cy-14, 1, '#00ffff');
  // arms
  shape(ctx, [[cx-10, cy-6], [cx-16, cy], [cx-16, cy+10], [cx-10, cy+8]], col);
  shape(ctx, [[cx+10, cy-6], [cx+16, cy], [cx+16, cy+10], [cx+10, cy+8]], col);
}

function drawShadowLord(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // cloaked figure
  shape(ctx, [[cx-9, cy+12], [cx-8, cy-4], [cx-5, cy-12], [cx+5, cy-12], [cx+8, cy-4], [cx+9, cy+12]], col);
  // shadow aura
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  circ(ctx, cx, cy, 12, 'rgba(0,0,0,0.4)');
  // face — void
  circ(ctx, cx, cy-6, 4, '#000');
  // piercing eyes
  circ(ctx, cx-2, cy-6, 1.5, '#cc00ff'); circ(ctx, cx+2, cy-6, 1.5, '#cc00ff');
  // crown of shadow
  ctx.fillStyle = dark;
  shape(ctx, [[cx-4, cy-12], [cx-3, cy-16], [cx-1, cy-13], [cx, cy-17], [cx+1, cy-13], [cx+3, cy-16], [cx+4, cy-12]], dark);
}

function drawAbyssal(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // shifting mass
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let a = 0; a < Math.PI*2; a += 0.2) {
    const r = 10 + Math.sin(a*6)*4 + Math.cos(a*3)*2;
    const x = cx+Math.cos(a)*r, y = cy+Math.sin(a)*r;
    if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  // tentacles
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i/8)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*10, cy+Math.sin(a)*10);
    ctx.lineTo(cx+Math.cos(a)*16, cy+Math.sin(a)*16);
    ctx.stroke();
  }
  // multiple eyes
  const eyes = [[-4,-2], [3,-3], [1,3], [-3,4], [5,1], [-5,1]];
  for (const [ex, ey] of eyes) {
    circ(ctx, cx+ex, cy+ey, 1.5, '#ff0000');
    circ(ctx, cx+ex, cy+ey, 0.8, '#000');
  }
}

function drawShaman(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // robed body
  shape(ctx, [[cx-8, cy+12], [cx-6, cy-4], [cx-3, cy-8], [cx+3, cy-8], [cx+6, cy-4], [cx+8, cy+12]], col);
  // skull head
  circ(ctx, cx, cy-6, 5, '#d0d0c0');
  // eye sockets — green glow
  circ(ctx, cx-2, cy-6, 1.5, '#000'); circ(ctx, cx-2, cy-6, 0.8, '#00ff40');
  circ(ctx, cx+2, cy-6, 1.5, '#000'); circ(ctx, cx+2, cy-6, 0.8, '#00ff40');
  // jaw
  shape(ctx, [[cx-3, cy-3], [cx+3, cy-3], [cx+2, cy], [cx-2, cy]], '#d0d0c0');
  // staff
  ctx.strokeStyle = dark; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx+10, cy-12); ctx.lineTo(cx+8, cy+12); ctx.stroke();
  // crystal on staff
  circ(ctx, cx+10, cy-12, 3, '#00ff40');
  ctx.fillStyle = 'rgba(0,255,64,0.3)';
  circ(ctx, cx+10, cy-12, 5, 'rgba(0,255,64,0.3)');
  // bone rattle
  ctx.strokeStyle = '#d0d0c0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-8, cy+2); ctx.lineTo(cx-10, cy+6); ctx.stroke();
}

function drawIsland(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // writhing mass
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let a = 0; a < Math.PI*2; a += 0.15) {
    const r = 12 + Math.sin(a*8)*5;
    const x = cx+Math.cos(a)*r, y = cy+Math.sin(a)*r;
    if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  // tentacles
  ctx.strokeStyle = dark; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = (i/10)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*12, cy+Math.sin(a)*12);
    ctx.quadraticCurveTo(cx+Math.cos(a)*18, cy+Math.sin(a)*18, cx+Math.cos(a+0.3)*20, cy+Math.sin(a+0.3)*20);
    ctx.stroke();
  }
  // many red eyes
  const eyes = [[-6,-3], [4,-5], [1,2], [-3,5], [6,3], [-7,1], [0,-7], [7,-1], [-1,6]];
  for (const [ex, ey] of eyes) {
    circ(ctx, cx+ex, cy+ey, 1.5, '#ff2020');
    circ(ctx, cx+ex, cy+ey, 0.8, '#fff');
  }
}

// ── Variant monster drawings — distinct visuals for shared archetypes ──

function drawEchoBat(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.42;
  // larger, more menacing wings — jagged edges
  shape(ctx, [[cx-2, cy], [cx-14, cy-8], [cx-18, cy+1], [cx-12, cy+2], [cx-6, cy+5]], col);
  shape(ctx, [[cx+2, cy], [cx+14, cy-8], [cx+18, cy+1], [cx+12, cy+2], [cx+6, cy+5]], col);
  // body — bigger, furrier
  ell(ctx, cx, cy+3, 5, 7, dark);
  // head
  circ(ctx, cx, cy-3, 5, dark);
  // large ears — pointed
  shape(ctx, [[cx-4, cy-5], [cx-6, cy-11], [cx-1, cy-6]], dark);
  shape(ctx, [[cx+4, cy-5], [cx+6, cy-11], [cx+1, cy-6]], dark);
  // glowing eyes — bigger, angrier
  circ(ctx, cx-3, cy-3, 1.8, '#ff2020'); circ(ctx, cx+3, cy-3, 1.8, '#ff2020');
  circ(ctx, cx-3, cy-3, 0.8, '#fff'); circ(ctx, cx+3, cy-3, 0.8, '#fff');
  // fangs
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-2, cy); ctx.lineTo(cx-3, cy+3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+2, cy); ctx.lineTo(cx+3, cy+3); ctx.stroke();
  // sonar rings — echo waves
  ctx.strokeStyle = 'rgba(180,120,220,0.35)'; ctx.lineWidth = 1;
  for (let r = 6; r <= 14; r += 4) {
    ctx.beginPath(); ctx.arc(cx, cy-2, r, -0.6, 0.6); ctx.stroke();
  }
}

function drawMagmaCrab(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // obsidian shell — dark, jagged
  shape(ctx, [[cx-10, cy-2], [cx-8, cy-6], [cx, cy-8], [cx+8, cy-6], [cx+10, cy-2], [cx+8, cy+6], [cx-8, cy+6]], col);
  // glowing magma cracks
  ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-6, cy-4); ctx.lineTo(cx-2, cy); ctx.lineTo(cx-4, cy+4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+6, cy-4); ctx.lineTo(cx+2, cy); ctx.lineTo(cx+4, cy+4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy-6); ctx.lineTo(cx, cy+4); ctx.stroke();
  // inner glow
  ctx.fillStyle = 'rgba(255,80,20,0.3)';
  circ(ctx, cx, cy, 6, 'rgba(255,80,20,0.3)');
  // massive claws — glowing edges
  circ(ctx, cx-13, cy-1, 5, col); circ(ctx, cx+13, cy-1, 5, col);
  shape(ctx, [[cx-13, cy-5], [cx-18, cy-8], [cx-16, cy-1]], col);
  shape(ctx, [[cx+13, cy-5], [cx+18, cy-8], [cx+16, cy-1]], col);
  // claw magma glow
  circ(ctx, cx-15, cy-2, 2, '#ff8a3a'); circ(ctx, cx+15, cy-2, 2, '#ff8a3a');
  // eyes — burning
  circ(ctx, cx-3, cy-5, 1.5, '#ff4a0a'); circ(ctx, cx+3, cy-5, 1.5, '#ff4a0a');
  // legs — molten tips
  ctx.strokeStyle = dark; ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    ctx.beginPath(); ctx.moveTo(cx+i*2, cy+5); ctx.lineTo(cx+i*3, cy+11); ctx.stroke();
  }
}

function drawGraveCrawler(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // bony segments — skull-like body parts
  ctx.fillStyle = col;
  for (let i = -14; i <= 10; i += 3.5) {
    const y = cy + Math.sin(i*0.3)*3;
    // bone segment — elongated
    ell(ctx, cx+i, y, 2.5, 2, col);
  }
  // ribs along body
  ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.lineCap = 'round';
  for (let i = -12; i <= 8; i += 3.5) {
    const y = cy + Math.sin(i*0.3)*3;
    ctx.beginPath(); ctx.moveTo(cx+i, y-2); ctx.lineTo(cx+i-1, y-5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+i, y+2); ctx.lineTo(cx+i+1, y+5); ctx.stroke();
  }
  // legs — bone-thin, many
  ctx.strokeStyle = col; ctx.lineWidth = 1;
  for (let i = -10; i <= 8; i += 3.5) {
    const y = cy + Math.sin(i*0.3)*3;
    ctx.beginPath(); ctx.moveTo(cx+i, y+2); ctx.lineTo(cx+i-1, y+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+i, y-2); ctx.lineTo(cx+i+1, y-8); ctx.stroke();
  }
  // skull head — distinctive
  circ(ctx, cx+13, cy+Math.sin(4.2)*3, 4, '#d0d0c0');
  circ(ctx, cx+13, cy+Math.sin(4.2)*3-1, 3.5, '#e0e0d0');
  // eye sockets
  circ(ctx, cx+12, cy+Math.sin(4.2)*3-1, 1.2, '#000');
  circ(ctx, cx+14.5, cy+Math.sin(4.2)*3-1, 1.2, '#000');
  // mandibles — bone
  ctx.strokeStyle = '#d0d0c0'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx+16, cy+Math.sin(4.2)*3); ctx.lineTo(cx+19, cy+Math.sin(4.2)*3+2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+16, cy+Math.sin(4.2)*3+1); ctx.lineTo(cx+19, cy+Math.sin(4.2)*3+3); ctx.stroke();
}

function drawWebWeaver(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // legs — longer, more menacing
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a1 = -1.3 + i*0.35, a2 = 1.3 - i*0.35;
    ctx.beginPath();
    ctx.moveTo(cx-3, cy);
    ctx.lineTo(cx-10, cy-8+i*2);
    ctx.lineTo(cx-16, cy-6+i*3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx+3, cy);
    ctx.lineTo(cx+10, cy-8+i*2);
    ctx.lineTo(cx+16, cy-6+i*3);
    ctx.stroke();
  }
  // large abdomen — with web pattern
  ell(ctx, cx-4, cy+2, 7, 6, col);
  // web pattern on abdomen
  ctx.strokeStyle = dark; ctx.lineWidth = 0.8;
  for (let a = 0; a < Math.PI*2; a += Math.PI/4) {
    ctx.beginPath(); ctx.moveTo(cx-4, cy+2);
    ctx.lineTo(cx-4+Math.cos(a)*6, cy+2+Math.sin(a)*5); ctx.stroke();
  }
  for (let r = 2; r <= 6; r += 2) {
    ctx.beginPath();
    ctx.ellipse(cx-4, cy+2, r*0.9, r*0.75, 0, 0, Math.PI*2); ctx.stroke();
  }
  // head — smaller than abdomen
  circ(ctx, cx+5, cy, 3.5, col);
  // multiple eyes — red, arranged in rows
  circ(ctx, cx+4, cy-1.5, 0.8, '#ff2020'); circ(ctx, cx+6, cy-1.5, 0.8, '#ff2020');
  circ(ctx, cx+4, cy+0.5, 0.8, '#ff2020'); circ(ctx, cx+6, cy+0.5, 0.8, '#ff2020');
  circ(ctx, cx+5, cy-2.5, 0.6, '#ff4040');
  // fangs — visible, dripping
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx+5, cy+2); ctx.lineTo(cx+4, cy+5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+6, cy+2); ctx.lineTo(cx+7, cy+5); ctx.stroke();
}

function drawCrystalWraith(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.42;
  // angular crystal body — shard-like, not wispy
  shape(ctx, [
    [cx, cy-14], [cx+5, cy-6], [cx+7, cy+2], [cx+4, cy+10], [cx+2, cy+16],
    [cx-2, cy+16], [cx-4, cy+10], [cx-7, cy+2], [cx-5, cy-6]
  ], col);
  // crystal facets — bright edges
  ctx.strokeStyle = '#a0d0ff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, cy-14); ctx.lineTo(cx, cy+16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-5, cy-6); ctx.lineTo(cx+5, cy-6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-7, cy+2); ctx.lineTo(cx+7, cy+2); ctx.stroke();
  // glowing crystal shards floating around
  ctx.fillStyle = 'rgba(120,200,255,0.5)';
  shape(ctx, [[cx-9, cy-8], [cx-12, cy-6], [cx-9, cy-4]], 'rgba(120,200,255,0.5)');
  shape(ctx, [[cx+9, cy-8], [cx+12, cy-6], [cx+9, cy-4]], 'rgba(120,200,255,0.5)');
  shape(ctx, [[cx-8, cy+8], [cx-11, cy+10], [cx-8, cy+12]], 'rgba(120,200,255,0.5)');
  shape(ctx, [[cx+8, cy+8], [cx+11, cy+10], [cx+8, cy+12]], 'rgba(120,200,255,0.5)');
  // eyes — crystal glow
  circ(ctx, cx-2.5, cy-4, 1.5, '#80c0ff'); circ(ctx, cx+2.5, cy-4, 1.5, '#80c0ff');
  circ(ctx, cx-2.5, cy-4, 0.7, '#fff'); circ(ctx, cx+2.5, cy-4, 0.7, '#fff');
}

function drawAshWraith(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.42;
  // dark, smoky body — more dispersed than classic wraith
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx-8, cy-2);
  ctx.bezierCurveTo(cx-10, cy-14, cx+10, cy-14, cx+8, cy-2);
  ctx.bezierCurveTo(cx+10, cy+8, cx+6, cy+14, cx+7, cy+18);
  ctx.lineTo(cx+3, cy+15); ctx.lineTo(cx, cy+19); ctx.lineTo(cx-3, cy+15);
  ctx.lineTo(cx-7, cy+18); ctx.bezierCurveTo(cx-6, cy+14, cx-10, cy+8, cx-8, cy-2);
  ctx.closePath(); ctx.fill();
  // ash particles — scattered around body
  ctx.fillStyle = 'rgba(120,110,100,0.5)';
  for (let i = 0; i < 8; i++) {
    const a = (i/8)*Math.PI*2;
    const r = 10 + Math.random()*4;
    circ(ctx, cx+Math.cos(a)*r, cy+Math.sin(a)*r, 1.5, 'rgba(120,110,100,0.5)');
  }
  // dark smoke wisps
  ctx.strokeStyle = 'rgba(60,50,40,0.4)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const x = cx + (i-1.5)*5;
    ctx.beginPath();
    ctx.moveTo(x, cy-8);
    ctx.quadraticCurveTo(x+3, cy-14, x-1, cy-18);
    ctx.stroke();
  }
  // eyes — burning orange embers in the dark
  circ(ctx, cx-3, cy-4, 2, '#000');
  circ(ctx, cx+3, cy-4, 2, '#000');
  circ(ctx, cx-3, cy-4, 1, '#ff6a1a'); circ(ctx, cx+3, cy-4, 1, '#ff6a1a');
}

function drawAmberGolem(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // translucent amber body
  shape(ctx, [[cx-7, cy-2], [cx+7, cy-2], [cx+8, cy+8], [cx-8, cy+8]], col);
  // amber glow — warm, translucent
  ctx.fillStyle = 'rgba(255,180,60,0.25)';
  ell(ctx, cx, cy+3, 6, 5, 'rgba(255,180,60,0.25)');
  // trapped creatures inside — silhouette of a bug
  ctx.fillStyle = dark;
  ell(ctx, cx-3, cy+2, 2, 1.5, dark);
  ctx.strokeStyle = dark; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(cx-3, cy+2); ctx.lineTo(cx-6, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-3, cy+2); ctx.lineTo(cx, cy+4); ctx.stroke();
  // another trapped thing
  circ(ctx, cx+4, cy+4, 1.2, dark);
  // amber cracks
  ctx.strokeStyle = dark; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-5, cy); ctx.lineTo(cx-3, cy+4); ctx.lineTo(cx-6, cy+6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+4, cy-1); ctx.lineTo(cx+6, cy+5); ctx.stroke();
  // head
  shape(ctx, [[cx-4, cy-10], [cx+4, cy-10], [cx+5, cy-3], [cx-5, cy-3]], col);
  ctx.fillStyle = 'rgba(255,180,60,0.2)';
  ell(ctx, cx, cy-6, 4, 3, 'rgba(255,180,60,0.2)');
  // eyes — warm glow
  circ(ctx, cx-2, cy-7, 1.5, '#ffcc40'); circ(ctx, cx+2, cy-7, 1.5, '#ffcc40');
  // arms
  shape(ctx, [[cx-7, cy], [cx-12, cy+2], [cx-12, cy+7], [cx-7, cy+6]], col);
  shape(ctx, [[cx+7, cy], [cx+12, cy+2], [cx+12, cy+7], [cx+7, cy+6]], col);
  // legs
  shape(ctx, [[cx-6, cy+8], [cx-2, cy+8], [cx-3, cy+16], [cx-7, cy+16]], col);
  shape(ctx, [[cx+2, cy+8], [cx+6, cy+8], [cx+7, cy+16], [cx+3, cy+16]], col);
}

function drawIceLurker(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // lean, predatory body — hunched
  shape(ctx, [[cx-9, cy], [cx+7, cy-2], [cx+9, cy+8], [cx-7, cy+10]], col);
  // ice spikes — fewer, sharper
  shape(ctx, [[cx-4, cy-2], [cx-6, cy-7], [cx-2, cy-3]], '#cceeff');
  shape(ctx, [[cx+2, cy-2], [cx, cy-9], [cx+4, cy-3]], '#cceeff');
  // head — narrow, wolf-like
  ell(ctx, cx+8, cy-3, 5, 4, col);
  // snout
  shape(ctx, [[cx+11, cy-4], [cx+15, cy-2], [cx+11, cy]], col);
  // eye — single, cold
  circ(ctx, cx+8, cy-4, 1.5, '#40a0ff'); circ(ctx, cx+8, cy-4, 0.7, '#fff');
  // fangs — icicle
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx+13, cy); ctx.lineTo(cx+14, cy+3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+11, cy); ctx.lineTo(cx+12, cy+3); ctx.stroke();
  // claws
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(cx-6+i*2, cy+9); ctx.lineTo(cx-7+i*2, cy+12); ctx.stroke();
  }
  // tail — icy
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-9, cy+5); ctx.quadraticCurveTo(cx-14, cy+2, cx-16, cy+8); ctx.stroke();
}

function drawGlacierBeast(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // massive, bulky body — bigger than ice_lurker
  shape(ctx, [[cx-11, cy-2], [cx+11, cy-2], [cx+13, cy+12], [cx-13, cy+12]], col);
  // thick ice crystal formations — large, blocky
  shape(ctx, [[cx-7, cy-2], [cx-10, cy-10], [cx-4, cy-4]], '#bbeeff');
  shape(ctx, [[cx-1, cy-2], [cx-3, cy-12], [cx+3, cy-4]], '#bbeeff');
  shape(ctx, [[cx+7, cy-2], [cx+4, cy-10], [cx+10, cy-4]], '#bbeeff');
  // frost cracks
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(cx-8, cy+2); ctx.lineTo(cx-4, cy+8); ctx.lineTo(cx-7, cy+10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+8, cy+2); ctx.lineTo(cx+4, cy+8); ctx.lineTo(cx+7, cy+10); ctx.stroke();
  // large head
  circ(ctx, cx, cy-5, 6, col);
  // ice horns
  shape(ctx, [[cx-4, cy-9], [cx-7, cy-14], [cx-2, cy-10]], '#bbeeff');
  shape(ctx, [[cx+4, cy-9], [cx+7, cy-14], [cx+2, cy-10]], '#bbeeff');
  // eyes — deep blue, big
  circ(ctx, cx-3, cy-5, 2, '#0080dd'); circ(ctx, cx+3, cy-5, 2, '#0080dd');
  circ(ctx, cx-3, cy-5, 1, '#fff'); circ(ctx, cx+3, cy-5, 1, '#fff');
  // big tusks
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-3, cy-1); ctx.lineTo(cx-5, cy+4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+3, cy-1); ctx.lineTo(cx+5, cy+4); ctx.stroke();
}

function drawRimeStalker(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // sleek, agile body — narrower
  shape(ctx, [[cx-8, cy+1], [cx+8, cy-1], [cx+9, cy+8], [cx-7, cy+9]], col);
  // sharp ice spikes along back — in a row
  for (let i = -4; i <= 4; i += 2) {
    shape(ctx, [[cx+i, cy-2], [cx+i-1, cy-7], [cx+i+1, cy-7]], '#ddffff');
  }
  // head — sleek, pointed
  ell(ctx, cx+8, cy-2, 4, 3.5, col);
  // ears — pointed ice
  shape(ctx, [[cx+6, cy-5], [cx+5, cy-9], [cx+8, cy-5]], '#cceeff');
  shape(ctx, [[cx+10, cy-5], [cx+11, cy-9], [cx+8, cy-5]], '#cceeff');
  // eyes — sharp, piercing
  circ(ctx, cx+7, cy-3, 1.2, '#80f0ff'); circ(ctx, cx+9, cy-3, 1.2, '#80f0ff');
  // legs — lean, with ice claw tips
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx-5, cy+8); ctx.lineTo(cx-6, cy+14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-1, cy+8); ctx.lineTo(cx-2, cy+14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+3, cy+8); ctx.lineTo(cx+2, cy+14); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-6, cy+14); ctx.lineTo(cx-7, cy+16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-2, cy+14); ctx.lineTo(cx-3, cy+16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+2, cy+14); ctx.lineTo(cx+1, cy+16); ctx.stroke();
  // frost trail
  ctx.fillStyle = 'rgba(200,230,255,0.3)';
  for (let i = 0; i < 4; i++) circ(ctx, cx-10-i*2, cy+6, 1.5, 'rgba(200,230,255,0.3)');
}

function drawDarkKnight(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // dark armor body — heavier, spiked
  shape(ctx, [[cx-7, cy-3], [cx+7, cy-3], [cx+8, cy+8], [cx-8, cy+8]], col);
  // spike pauldrons
  shape(ctx, [[cx-7, cy-3], [cx-10, cy-8], [cx-9, cy-2]], dark);
  shape(ctx, [[cx+7, cy-3], [cx+10, cy-8], [cx+9, cy-2]], dark);
  // chest spike
  shape(ctx, [[cx-2, cy-1], [cx, cy-5], [cx+2, cy-1]], dark);
  // helmet — dark, with horns
  shape(ctx, [[cx-4, cy-12], [cx+4, cy-12], [cx+5, cy-5], [cx-5, cy-5]], col);
  // helmet horns
  shape(ctx, [[cx-4, cy-11], [cx-8, cy-15], [cx-3, cy-13]], dark);
  shape(ctx, [[cx+4, cy-11], [cx+8, cy-15], [cx+3, cy-13]], dark);
  // visor slit
  ctx.fillStyle = dark;
  ctx.fillRect(cx-4, cy-9, 8, 1.5);
  // eyes — cold, dim red
  circ(ctx, cx-2, cy-8.5, 0.8, '#aa1010'); circ(ctx, cx+2, cy-8.5, 0.8, '#aa1010');
  // dark energy aura
  ctx.fillStyle = 'rgba(40,20,60,0.2)';
  circ(ctx, cx, cy, 10, 'rgba(40,20,60,0.2)');
  // sword — dark blade
  ctx.strokeStyle = dark; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx+8, cy+2); ctx.lineTo(cx+15, cy-10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+6, cy+4); ctx.lineTo(cx+10, cy+4); ctx.stroke();
  // legs
  shape(ctx, [[cx-5, cy+8], [cx-1, cy+8], [cx-2, cy+16], [cx-6, cy+16]], col);
  shape(ctx, [[cx+1, cy+8], [cx+5, cy+8], [cx+6, cy+16], [cx+2, cy+16]], col);
}

function drawInfernoKnight(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // flaming armor body
  shape(ctx, [[cx-7, cy-3], [cx+7, cy-3], [cx+8, cy+8], [cx-8, cy+8]], col);
  // fire engulfing the armor
  ctx.fillStyle = '#ff6a1a';
  shape(ctx, [[cx-7, cy-3], [cx-9, cy-8], [cx-6, cy-2]], '#ff6a1a');
  shape(ctx, [[cx+7, cy-3], [cx+9, cy-8], [cx+6, cy-2]], '#ff6a1a');
  shape(ctx, [[cx-3, cy-3], [cx-2, cy-9], [cx, cy-2]], '#ffa040');
  shape(ctx, [[cx+3, cy-3], [cx+2, cy-9], [cx, cy-2]], '#ffa040');
  // flames licking up from body
  ctx.strokeStyle = '#ff4a0a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx+i*3, cy-3);
    ctx.quadraticCurveTo(cx+i*3+2, cy-10, cx+i*3-1, cy-14);
    ctx.stroke();
  }
  // helmet — blackened by heat
  shape(ctx, [[cx-4, cy-12], [cx+4, cy-12], [cx+5, cy-5], [cx-5, cy-5]], dark);
  // visor — glowing with fire
  ctx.fillStyle = '#ff4a0a';
  ctx.fillRect(cx-4, cy-9, 8, 2);
  // eyes — blazing
  circ(ctx, cx-2, cy-8, 1.5, '#ff8a0a'); circ(ctx, cx+2, cy-8, 1.5, '#ff8a0a');
  circ(ctx, cx-2, cy-8, 0.8, '#fff'); circ(ctx, cx+2, cy-8, 0.8, '#fff');
  // flaming sword
  ctx.strokeStyle = dark; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx+8, cy+2); ctx.lineTo(cx+16, cy-10); ctx.stroke();
  // flame on blade
  ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx+10, cy); ctx.lineTo(cx+13, cy-6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+12, cy-2); ctx.lineTo(cx+15, cy-8); ctx.stroke();
  // guard
  ctx.strokeStyle = dark; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx+6, cy+4); ctx.lineTo(cx+10, cy+4); ctx.stroke();
  // legs
  shape(ctx, [[cx-5, cy+8], [cx-1, cy+8], [cx-2, cy+16], [cx-6, cy+16]], col);
  shape(ctx, [[cx+1, cy+8], [cx+5, cy+8], [cx+6, cy+16], [cx+2, cy+16]], col);
  // heat glow
  ctx.fillStyle = 'rgba(255,80,20,0.15)';
  circ(ctx, cx, cy, 12, 'rgba(255,80,20,0.15)');
}

function drawAbyssalWarden(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.45;
  // towering armored body — dark void armor
  shape(ctx, [[cx-9, cy+10], [cx-8, cy-6], [cx-5, cy-12], [cx+5, cy-12], [cx+8, cy-6], [cx+9, cy+10]], col);
  // dark rift energy crackling around body
  ctx.strokeStyle = '#6a0aaa'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(cx-8+i*5, cy+8);
    ctx.quadraticCurveTo(cx-10+i*5, cy, cx-6+i*5, cy-8);
    ctx.stroke();
  }
  // void rifts — dark portals
  ctx.fillStyle = 'rgba(20,0,40,0.5)';
  circ(ctx, cx-10, cy+2, 4, 'rgba(20,0,40,0.5)');
  circ(ctx, cx+10, cy+2, 4, 'rgba(20,0,40,0.5)');
  // armored shoulders
  circ(ctx, cx-9, cy-4, 4, dark); circ(ctx, cx+9, cy-4, 4, dark);
  // helmet — angular void helm
  shape(ctx, [[cx-5, cy-14], [cx+5, cy-14], [cx+6, cy-6], [cx-6, cy-6]], col);
  // dark void inside helmet
  circ(ctx, cx, cy-10, 3.5, '#000');
  // burning purple eyes
  circ(ctx, cx-2, cy-10, 1.5, '#aa00ff'); circ(ctx, cx+2, cy-10, 1.5, '#aa00ff');
  circ(ctx, cx-2, cy-10, 0.7, '#fff'); circ(ctx, cx+2, cy-10, 0.7, '#fff');
  // tendrils of void
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = -7; i <= 7; i += 3) {
    ctx.beginPath(); ctx.moveTo(cx+i, cy+8);
    ctx.quadraticCurveTo(cx+i*1.5, cy+14, cx+i*2, cy+20);
    ctx.stroke();
  }
  // reality fracture — crack in space
  ctx.strokeStyle = '#cc44ff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-14, cy-2); ctx.lineTo(cx-10, cy+4); ctx.lineTo(cx-12, cy+8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+14, cy-2); ctx.lineTo(cx+10, cy+4); ctx.lineTo(cx+12, cy+8); ctx.stroke();
}

function drawDepthLeviathan(ctx, s, col, dark) {
  const cx = s*0.5, cy = s*0.5;
  // massive serpentine void body
  ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx+16, cy+4);
  ctx.bezierCurveTo(cx+6, cy-16, cx-10, cy+16, cx-18, cy-6);
  ctx.stroke();
  ctx.strokeStyle = dark; ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx+16, cy+5);
  ctx.bezierCurveTo(cx+6, cy-15, cx-10, cy+17, cx-18, cy-5);
  ctx.stroke();
  // void energy coursing through body
  ctx.strokeStyle = '#2a0a4a'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx+16, cy+4);
  ctx.bezierCurveTo(cx+6, cy-16, cx-10, cy+16, cx-18, cy-6);
  ctx.stroke();
  // massive head
  ell(ctx, cx+16, cy+4, 8, 7, col);
  // multiple glowing eyes — cluster
  circ(ctx, cx+18, cy, 2.5, '#ff1010'); circ(ctx, cx+18, cy, 1.2, '#fff');
  circ(ctx, cx+14, cy-2, 1.5, '#ff2020'); circ(ctx, cx+20, cy+2, 1.5, '#ff2020');
  circ(ctx, cx+16, cy+6, 1.2, '#ff3030');
  // enormous maw
  ctx.fillStyle = '#0a0000';
  shape(ctx, [[cx+19, cy+4], [cx+26, cy+2], [cx+26, cy+8], [cx+19, cy+8]], '#0a0000');
  // rows of teeth
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) shape(ctx, [[cx+20+i*1.5, cy+4], [cx+21+i*1.5, cy+7], [cx+22+i*1.5, cy+4]], '#fff');
  // dorsal spines — massive
  ctx.fillStyle = dark;
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    const fx = cx + 8 - t*18;
    const fy = cy - 6 + t*12;
    shape(ctx, [[fx, fy], [fx+5, fy-10], [fx-1, fy-8]], dark);
  }
  // tentacles erupting from body
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const bx = cx + 4 - t*16;
    const by = cy + 2 + (i%2 ? 6 : -6);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx+4, by+8, bx+2, by+16);
    ctx.stroke();
  }
  // void aura
  ctx.fillStyle = 'rgba(10,0,20,0.3)';
  circ(ctx, cx, cy, 18, 'rgba(10,0,20,0.3)');
}

// ── Dispatcher ──
const FISH_DRAWERS = {
  fish_small: (ctx,s,col,dark) => drawFishSmall(ctx,s,col,dark),
  fish_medium: (ctx,s,col,dark) => drawFishMedium(ctx,s,col,dark),
  fish_large: (ctx,s,col,dark) => drawFishLarge(ctx,s,col,dark),
  flatfish: drawFlatfish, ray: drawRay, eel: drawEel,
  squid: drawSquid, octopus: drawOctopus, cuttlefish: drawCuttlefish,
  kraken: drawKraken, lobster: drawLobster, horseshoe: drawHorseshoe,
  anglerfish: drawAnglerfish, puffer: drawPuffer, lionfish: drawLionfish,
  nautilus: drawNautilus, sea_spider: drawSeaSpider, serpent: drawSerpent,
  leviathan: drawLeviathan, cavern_fish: drawCavernFish,
};

const MONSTER_DRAWERS = {
  slime: drawSlime, bat: drawBat, rat: drawRat, newt: drawNewt, crab: drawCrab,
  worm: drawWorm, centipede: drawCentipede, flat_predator: drawFlatPredator,
  mole: drawMole, zombie: drawZombie, spider: drawSpider, beetle: drawBeetle,
  wraith: drawWraith, stalactite: drawStalactite, fossil: drawFossil,
  skeleton: drawSkeleton, golem: drawGolem, troll: drawTroll, mummy: drawMummy,
  bone_serpent: drawBoneSerpent, toad: drawToad, serpent: drawSerpentM,
  ghoul: drawGhoul, salamander: drawSalamander, frost_sprite: drawFrostSprite,
  imp: drawImp, ice_beast: drawIceBeast, knight: drawKnight, gargoyle: drawGargoyle,
  leech: drawLeech, blood_beast: drawBloodBeast, void_guardian: drawVoidGuardian,
  nightmare: drawNightmare, forgotten: drawForgotten, guardian: drawGuardian,
  demon: drawDemon, titan: drawTitan, shadow_lord: drawShadowLord,
  abyssal: drawAbyssal, shaman: drawShaman, island: drawIsland,
  abyssal_warden: drawAbyssalWarden, depth_leviathan: drawDepthLeviathan,
  // Variant drawings — distinct silhouettes for previously-duplicate monsters
  'echo-bat': drawEchoBat, 'magma-crab': drawMagmaCrab, 'grave-crawler': drawGraveCrawler,
  'web-weaver': drawWebWeaver, 'crystal-wraith': drawCrystalWraith, 'ash-wraith': drawAshWraith,
  'amber-golem': drawAmberGolem, 'ice-lurker': drawIceLurker, 'glacier-beast': drawGlacierBeast,
  'rime-stalker': drawRimeStalker, 'dark-knight': drawDarkKnight, 'inferno-knight': drawInfernoKnight,
};

export function getFishArchetype(id) {
  return FISH_ARCH[id] || 'fish_medium';
}

export function getMonsterArchetype(id) {
  return MONSTER_ARCH[id] || 'slime';
}

export function getFishColors(id) {
  const fish = getFishInfo(id);
  if (!fish) return { col: '#888', dark: '#555' };
  const r = FISH_RARITY[fish.rarity];
  const arch = FISH_ARCH[id] || 'fish_medium';
  const override = FISH_COLORS[arch];
  if (override) {
    return Array.isArray(override) ? { col: override[0], dark: override[1] } : { col: override, dark: r.color };
  }
  return { col: r.color, dark: shade(r.color, -0.3) };
}

export function getMonsterColors(id) {
  const type = ENEMY_TYPES.find(e => e.id === id) || BOSS_TYPES.find(b => b.id === id);
  if (!type) return { col: '#888', dark: '#555' };
  return { col: type.color, dark: type.dark || shade(type.color, -0.3) };
}

function shade(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function drawCreature(ctx, category, id, size) {
  const s = size;
  if (category === 'fish') {
    const { col, dark } = getFishColors(id);
    const arch = FISH_ARCH[id] || 'fish_medium';
    const drawer = FISH_DRAWERS[arch] || drawFishMedium;
    drawer(ctx, s, col, dark);
  } else if (category === 'monster') {
    const { col, dark } = getMonsterColors(id);
    const arch = MONSTER_ARCH[id] || 'slime';
    const drawer = MONSTER_DRAWERS[arch] || drawSlime;
    drawer(ctx, s, col, dark);
  }
}