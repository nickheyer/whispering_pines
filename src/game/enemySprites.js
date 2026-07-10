// Enemy sprite drawing - extracted from sprites.js
function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}
function shade(hex, amt) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.min(255, r + amt));
  const ng = Math.max(0, Math.min(255, g + amt));
  const nb = Math.max(0, Math.min(255, b + amt));
  return '#' + nr.toString(16).padStart(2, '0') + ng.toString(16).padStart(2, '0') + nb.toString(16).padStart(2, '0');
}
function drawShadow(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + s / 2, y + s * 0.85, s * 0.3, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEnemySprite(ctx, ox, oy, enemy, frame) {
  const s = ctx.canvas.width;
  const x = ox, y = oy;
  const flash = enemy.hitFlash > 0;
  const c = flash ? '#ffffff' : enemy.color;
  const dark = flash ? '#dddddd' : enemy.dark;
  const bob = [0, -1, 0, -1][frame % 4];
  const t = enemy.typeId;
  drawShadow(ctx, x, y, s);

  if (t === 'bat') {
    const wf = Math.sin(frame * 0.8) * s * 0.12;
    px(ctx, x + s*0.05, y + s*0.3 + bob, s*0.2, s*0.35, dark); // wings adjusted
    px(ctx, x + s*0.05, y + s*0.3 + bob - wf, s*0.2, s*0.35, dark);
    px(ctx, x + s*0.75, y + s*0.3 + bob - wf, s*0.2, s*0.35, dark);
    px(ctx, x + s*0.3, y + s*0.35 + bob, s*0.4, s*0.3, c);
    px(ctx, x + s*0.35, y + s*0.55 + bob, s*0.3, s*0.1, dark);
    px(ctx, x + s*0.38, y + s*0.22 + bob, s*0.06, s*0.06, '#ff3a2a');
    px(ctx, x + s*0.56, y + s*0.22 + bob, s*0.06, s*0.06, '#ff3a2a');
  } else
  if (t === 'slime') {
    px(ctx, x + s*0.15, y + s*0.5 + bob, s*0.7, s*0.35, c);
    px(ctx, x + s*0.2, y + s*0.45 + bob, s*0.6, s*0.12, dark);
    px(ctx, x + s*0.25, y + s*0.5 + bob, s*0.15, s*0.08, shade(c, 30));
    px(ctx, x + s*0.38, y + s*0.58 + bob, s*0.07, s*0.07, '#1a1a1a');
    px(ctx, x + s*0.55, y + s*0.58 + bob, s*0.07, s*0.07, '#1a1a1a');
  } else
  if (t === 'spider') {
    px(ctx, x + s*0.1, y + s*0.35 + bob, s*0.12, s*0.3, dark);
    px(ctx, x + s*0.78, y + s*0.35 + bob, s*0.12, s*0.3, dark);
    px(ctx, x + s*0.05, y + s*0.45 + bob, s*0.12, s*0.25, dark);
    px(ctx, x + s*0.83, y + s*0.45 + bob, s*0.12, s*0.25, dark);
    px(ctx, x + s*0.28, y + s*0.3 + bob, s*0.44, s*0.35, c);
    px(ctx, x + s*0.35, y + s*0.2 + bob, s*0.3, s*0.15, dark);
    px(ctx, x + s*0.38, y + s*0.38 + bob, s*0.06, s*0.06, '#ff3a2a');
    px(ctx, x + s*0.56, y + s*0.38 + bob, s*0.06, s*0.06, '#ff3a2a');
  } else
  if (t === 'rat') {
    const wig = Math.sin(frame * 0.6) * s * 0.02;
    px(ctx, x + s*0.2, y + s*0.5 + bob, s*0.5, s*0.28, c);
    px(ctx, x + s*0.22, y + s*0.48 + bob, s*0.46, s*0.1, dark);
    px(ctx, x + s*0.6, y + s*0.48 + bob, s*0.22, s*0.2, c);
    px(ctx, x + s*0.75, y + s*0.45 + bob, s*0.1, s*0.1, shade(c, 15));
    px(ctx, x + s*0.62, y + s*0.4 + bob, s*0.07, s*0.08, dark);
    px(ctx, x + s*0.74, y + s*0.4 + bob, s*0.07, s*0.08, dark);
    px(ctx, x + s*0.72, y + s*0.5 + bob, s*0.5, s*0.05, '#ff3a2a');
    px(ctx, x + s*0.05 + wig, y + s*0.55 + bob, s*0.18, s*0.04, dark);
    px(ctx, x + s*0.01 + wig, y + s*0.57 + bob, s*0.06, s*0.06, dark);
    px(ctx, x + s*0.25, y + s*0.72 + bob, s*0.08, s*0.1, dark);
    px(ctx, x + s*0.5, y + s*0.72 + bob, s*0.08, s*0.1, dark);
  } else
  if (t === 'cave_newt' || t === 'ember_salamander') {
    const wig = Math.sin(frame * 0.4) * s * 0.03;
    px(ctx, x + s*0.0 + wig, y + s*0.55 + bob, s*0.2, s*0.06, c);
    px(ctx, x + s*0.15 + wig, y + s*0.52 + bob, s*0.15, s*0.08, c);
    px(ctx, x + s*0.25, y + s*0.45 + bob, s*0.35, s*0.22, c);
    px(ctx, x + s*0.27, y + s*0.43 + bob, s*0.31, s*0.08, dark);
    px(ctx, x + s*0.55, y + s*0.46 + bob, s*0.18, s*0.16, c);
    px(ctx, x + s*0.68, y + s*0.48 + bob, s*0.08, s*0.08, shade(c, 15));
    px(ctx, x + s*0.62, y + s*0.48 + bob, s*0.05, s*0.05, '#ffcc00');
    px(ctx, x + s*0.3, y + s*0.64 + bob, s*0.06, s*0.1, dark);
    px(ctx, x + s*0.48, y + s*0.64 + bob, s*0.06, s*0.1, dark);
    if (t === 'ember_salamander') {
      px(ctx, x + s*0.35, y + s*0.3 + bob, s*0.08, s*0.12, '#ff6a1a');
      px(ctx, x + s*0.45, y + s*0.25 + bob, s*0.06, s*0.14, '#ffaa30');
    }
  } else
  if (t === 'rock_crab' || t === 'magma_crab') {
    px(ctx, x + s*0.02, y + s*0.4 + bob, s*0.16, s*0.14, c);
    px(ctx, x + s*0.82, y + s*0.4 + bob, s*0.16, s*0.14, c);
    px(ctx, x + s*0.0, y + s*0.35 + bob, s*0.1, s*0.08, dark);
    px(ctx, x + s*0.9, y + s*0.35 + bob, s*0.1, s*0.08, dark);
    px(ctx, x + s*0.2, y + s*0.35 + bob, s*0.6, s*0.32, c);
    px(ctx, x + s*0.22, y + s*0.33 + bob, s*0.56, s*0.1, dark);
    px(ctx, x + s*0.25, y + s*0.55 + bob, s*0.5, s*0.1, shade(c, -20));
    px(ctx, x + s*0.35, y + s*0.25 + bob, s*0.04, s*0.1, dark);
    px(ctx, x + s*0.61, y + s*0.25 + bob, s*0.04, s*0.1, dark);
    px(ctx, x + s*0.35, y + s*0.22 + bob, s*0.06, s*0.06, '#fff');
    px(ctx, x + s*0.61, y + s*0.22 + bob, s*0.06, s*0.06, '#fff');
    px(ctx, x + s*0.36, y + s*0.23 + bob, s*0.03, s*0.03, '#111');
    px(ctx, x + s*0.62, y + s*0.23 + bob, s*0.03, s*0.03, '#111');
    px(ctx, x + s*0.18, y + s*0.65 + bob, s*.04, s*0.12, dark);
    px(ctx, x + s*0.32, y + s*0.65 + bob, s*0.04, s*0.12, dark);
    px(ctx, x + s*0.64, y + s*0.65 + bob, s*0.04, s*0.12, dark);
    px(ctx, x + s*0.78, y + s*0.65 + bob, s*0.04, s*0.12, dark);
    if (t === 'magma_crab') {
      px(ctx, x + s*0.35, y + s*0.45 + bob, s*0.04, s*0.15, '#ff6a1a');
      px(ctx, x + s*0.55, y + s*0.45 + bob, s*0.04, s*0.15, '#ff6a1a');
    }
  } else
  if (t === 'glow_worm' || t === 'lava_leech') {
    const wig = Math.sin(frame * 0.3) * s * 0.04;
    for (let i = 0; i < 5; i++) {
      const sx = x + s*(0.1 + i*0.16);
      const sy = y + s*0.5 + bob + (i%2 ? wig : -wig);
      const sz = s*(0.18 - i*0.015);
      px(ctx, sx, sy, sz, s*0.22, i%2 ? c : dark);
    }
    px(ctx, x + s*0.72, y + s*0.45 + bob, s*0.16, s*0.18, c);
    if (t === 'glow_worm') {
      px(ctx, x + s*0.7, y + s*0.3 + bob, s*0.2, s*0.2, 'rgba(170,255,170,0.3)');
      px(ctx, x + s*0.75, y + s*0.48 + bob, s*0.08, s*0.08, '#aaffaa');
    } else {
      px(ctx, x + s*0.75, y + s*0.48 + bob, s*0.08, s*0.08, '#ff4a0a');
    }
    px(ctx, x + s*0.78, y + s*0.5 + bob, s*0.05, s*0.05, '#111');
  } else
  if (t === 'moss_lurker') {
    px(ctx, x + s*0.1, y + s*0.55 + bob, s*0.8, s*0.2, c);
    px(ctx, x + s*0.12, y + s*0.53 + bob, s*0.76, s*0.06, dark);
    px(ctx, x + s*0.2, y + s*0.5 + bob, s*0.08, s*0.06, dark);
    px(ctx, x + s*0.45, y + s*0.48 + bob, s*0.07, s*0.06, dark);
    px(ctx, x + s*0.68, y + s*0.5 + bob, s*0.08, s*0.06, dark);
    px(ctx, x + s*0.5, y + s*0.55 + bob, s*0.06, s*0.05, '#ffcc00');
    px(ctx, x + s*0.65, y + s*0.55 + bob, s*0.06, s*0.05, '#ffcc00');
    px(ctx, x + s*0.15, y + s*0.72 + bob, s*0.05, s*0.08, dark);
    px(ctx, x + s*0.4, y + s*0.72 + bob, s*0.05, s*0.08, dark);
    px(ctx, x + s*0.6, y + s*0.72 + bob, s*0.05, s*0.08, dark);
    px(ctx, x + s*0.8, y + s*0.72 + bob, s*0.05, s*0.08, dark);
  } else
  if (t === 'tunnel_mole') {
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.4, c);
    px(ctx, x + s*0.27, y + s*0.33 + bob, s*0.46, s*0.12, dark);
    px(ctx, x + s*0.65, y + s*0.5 + bob, s*0.15, s*0.12, dark);
    px(ctx, x + s*0.75, y + s*0.52 + bob, s*0.06, s*0.06, '#1a1a1a');
    px(ctx, x + s*0.55, y + s*0.42 + bob, s*0.08, s*0.02, dark);
    px(ctx, x + s*.2, y + s*0.65 + bob, s*0.12, s*0.1, dark);
    px(ctx, x + s*0.6, y + s*0.65 + bob, s*0.12, s*0.1, dark);
  } else
  if (t === 'gem_beetle') {
    px(ctx, x + s*0.25, y + s*0.3 + bob, s*0.5, s*0.4, c);
    px(ctx, x + s*0.27, y + s*0.28 + bob, s*0.46, s*0.1, dark);
    px(ctx, x + s*0.48, y + s*0.3 + bob, s*0.04, s*0.4, dark);
    px(ctx, x + s*0.35, y + s*0.35 + bob, s*0.1, s*0.08, 'rgba(255,255,255,0.3)');
    px(ctx, x + s*0.4, y + s*0.18 + bob, s*0.2, s*0.14, dark);
    px(ctx, x + s*0.43, y + s*0.6 + bob, s*0.06, s*0.06, '#fff');
    px(ctx, x + s*0.51, y + s*0.16 + bob, s*0.06, s*0.06, '#fff');
    px(ctx, x + s*0.42, y + s*.1 + bob, s*0.04, s*0.08, dark);
    px(ctx, x + s*0.54, y + s*0.1 + bob, s*0.04, s*0.08, dark);
    px(ctx, x + s*0.2, y + s*0.7 + bob, s*0.04, s*0.1, dark);
    px(ctx, x + s*0.35, y + s*0.7 + bob, s*0.04, s*0.1, dark);
    px(ctx, x + s*0.55, y + s*0.7 + bob, s*0.04, s*0.1, dark);
    px(ctx, x + s*0.7, y + s*0.7 + bob, s*0.04, s*0.1, dark);
  } else
  if (t === 'centipede') {
    const wig = Math.sin(frame * 0.5) * s * 0.04;
    for (let i = 0; i < 5; i++) {
      const sx = x + s*(0.15 + i*0.14) + (i%2 ? wig : -wig);
      const sy = y + s*0.45 + bob;
      const sz = s*(0.16 - i*0.01);
      px(ctx, sx, sy, sz, s*0.2, i%2 ? c : dark);
      px(ctx, sx, sy + s*0.18, s*0.03, s*0.08, dark);
      px(ctx, sx + sz - s*0.03, sy + s*0.18, s*0.03, s*0.08, dark);
    }
    px(ctx, x + s*0.72 + wig, y + s*0.4 + bob, s*0.14, s*0.18, c);
    px(ctx, x + s*0.82 + wig, y + s*0.36 + bob, s*0.04, s*0.08, dark);
    px(ctx, x + s*0.82 + wig, y + s*0.5 + bob, s*0.04, s*0.08, dark);
    px(ctx, x + s*0.76 + wig, y + s*0.44 + bob, s*0.05, s*0.05, '#ff3a2a');
  } else
  if (t === 'mushroom_zombie') {
    px(ctx, x + s*0.3, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.35, c);
    px(ctx, x + s*0.28, y + s*0.38 + bob, s*0.44, s*0.12, dark);
    px(ctx, x + s*0.28, y + s*0.1 + bob, s*0.44, s*0.22, '#b06050');
    px(ctx, x + s*0.3, y + s*0.08 + bob, s*0.4, s*0.16, '#c47060');
    px(ctx, x + s*0.35, y + s*0.14 + bob, s*0.06, s*0.06, '#e0d0b0');
    px(ctx, x + s*0.52, y + s*0.18 + bob, s*0.05, s*0.05, '#e0d0b0');
    px(ctx, x + s*0.4, y + s*0.3 + bob, s*0.2, s*0.08, '#d4c4a0');
    px(ctx, x + s*0.38, y + s*0.3 + bob, s*0.06, s*0.05, '#5aff5a');
    px(ctx, x + s*0.54, y + s*0.3 + bob, s*0.06, s*0.05, '#5aff5a');
  } else
  if (t === 'bone_serpent') {
    const wave = Math.sin(frame * 0.4) * s * 0.06;
    for (let i = 0; i < 6; i++) {
      const sx = x + s*(0.15 + i*0.12);
     const sy = y + s*0.5 + bob + Math.sin(frame*0.3 + i*0.8) * s*0.05;
      px(ctx, sx, sy, s*0.1, s*0.12, i%2 ? c : dark);
      px(ctx, sx - s*0.02, sy + s*0.1, s*0.04, s*0.06, dark);
      px(ctx, sx + s*0.08, sy + s*0.1, s*0.04, s*0.06, dark);
    }
    px(ctx, x + s*0.78 + wave, y + s*0.42 + bob, s*0.16, s*0.18, c);
    px(ctx, x + s*0.82 + wave, y + s*0.44 + bob, s*0.08, s*0.1, dark);
    px(ctx, x + s*0.88 + wave, y + s*0.5 + bob, s*0.06, s*0.04, dark);
    px(ctx, x + s*0.82 + wave, y + s*0.46 + bob, s*0.03, s*0.03, '#ff3a2a');
  } else
  if (t === 'echo_bat') {
    const wf = Math.sin(frame * 1.0) * s * 0.15;
    px(ctx, x + s*0.0, y + s*0.3 + bob - wf, s*0.2, s*0.12, dark);
    px(ctx, x + s*0.15, y + s*0.2 + bob - wf, s*0.15, s*0.12, dark);
    px(ctx, x + s*0.8, y + s*0.3 + bob - wf, s*0.2, s*0.12, dark);
    px(ctx, x + s*0.7, y + s*0.2 + bob - wf, s*0.15, s*0.12, dark);
    px(ctx, x + s*0.3, y + s*0.35 + bob, s*0.4, s*0.35, c);
    px(ctx, x + s*0.32, y + s*0.33 + bob, s*0.36, s*0.12, dark);
    px(ctx, x + s*0.35, y + s*0.15 + bob, s*0.3, s*0.22, dark);
    px(ctx, x + s*0.36, y + s*0.05 + bob, s*0.08, s*0.12, dark);
    px(ctx, x + s*0.56, y + s*0.05 + bob, s*0.08, s*0.12, dark);
    px(ctx, x + s*0.4, y + s*0.22 + bob, s*0.06, s*0.06, '#ff2020');
    px(ctx, x + s*0.54, y + s*0.22 + bob, s*0.06, s*0.06, '#ff2020');
  } else
  if (t === 'web_weaver') {
    const wf = Math.sin(frame * 0.6) * s * 0.04;
    px(ctx, x + s*0.05, y + s*0.3 + bob + wf, s*0.12, s*0.3, dark);
    px(ctx, x + s*0.83, y + s*0.3 + bob + wf, s*0.12, s*0.3, dark);
    px(ctx, x + s*0.0, y + s*0.45 + bob - wf, s*0.12, s*0.25, dark);
    px(ctx, x + s*0.88, y + s*0.45 + bob - wf, s*0.12, s*0.25, dark);
    px(ctx, x + s*0.15, y + s*0.35 + bob, s*0.5, s*0.35, c);
    px(ctx, x + s*0.3, y + s*0.4 + bob, s*0.2, s*0.02, dark);
    px(ctx, x + s*0.38, y + s*0.35 + bob, s*0.04, s*0.25, dark);
    px(ctx, x + s*0.55, y + s*0.3 + bob, s*0.22, s*0.2, dark);
    px(ctx, x + s*0.58, y + s*0.33 + bob, s*0.04, s*0.04, '#ff2020');
    px(ctx, x + s*0.66, y + s*0.33 + bob, s*0.04, s*0.04, '#ff2020');
    px(ctx, x + s*0.58, y + s*0.4 + bob, s*0.04, s*.04, '#ff2020');
    px(ctx, x + s*0.66, y + s*0.4 + bob, s*0.04, s*0.04, '#ff2020');
  } else
  if (t === 'cave_troll' || t === 'blood_beast' || t === 'ancient_guardian') {
    px(ctx, x + s*0.08, y + s*0.25 + bob, s*0.84, s*0.55, c);
    px(ctx, x + s*0.12, y + s*0.28 + bob, s*0.76, s*0.2, dark);
    px(ctx, x + s*0.15, y + s*0.45 + bob, s*0.25, s*0.15, shade(c, -20));
    px(ctx, x + s*0.55, y + s*0.5 + bob, s*0.2, s*0.12, shade(c, -20));
    px(ctx, x + s*0.35, y + s*0.08 + bob, s*0.3, s*0.22, c);
    px(ctx, x + s*0.37, y + s*0.1 + bob, s*0.26, s*0.16, dark);
    px(ctx, x + s*0.38, y + s*0.26 + bob, s*0.04, s*0.06, '#d4d4c4');
    px(ctx, x + s*0.58, y + s*0.26 + bob, s*0.04, s*0.06, '#d4d4c4');
    px(ctx, x + s*0.4, y + s*0.16 + bob, s*0.06, s*0.06, '#ff3a2a');
    px(ctx, x + s*0.54, y + s*0.16 + bob, s*0.06, s*0.06, '#ff3a2a');
    px(ctx, x + s*0.02, y + s*0.4 + bob, s*0.1, s*0.3, c);
    px(ctx, x + s*0.88, y + s*0.4 + bob, s*0.1, s*0.3, c);
    if (t === 'blood_beast') {
      px(ctx, x + s*0.2, y + s*0.35 + bob, s*0.04, s*0.2, '#6a1818');
      px(ctx, x + s*0.6, y + s*0.5 + bob, s*0.04, s*0.2, '#6a1818');
    }
    if (t === 'ancient_guardian') {
      px(ctx, x + s*0.3, y + s*0.5 + bob, s*0.04, s*0.04, '#4a9ac8');
      px(ctx, x + s*0.66, y + s*0.5 + bob, s*0.4, s*0.04, '#4a9ac8');
    }
  } else
  if (t === 'golem' || t === 'abyssal') {
    px(ctx, x + s*0.1, y + s*0.1 + bob, s*0.8, s*0.8, c);
    px(ctx, x + s*0.15, y + s*0.15 + bob, s*0.7, s*0.15, dark);
    px(ctx, x + s*0.2, y + s*0.3 + bob, s*0.2, s*0.15, shade(c, -20));
    px(ctx, x + s*0.55, y + s*0.35 + bob, s*0.15, s*0.1, shade(c, -20));
    px(ctx, x + s*0.2, y + s*0.6 + bob, s*0.6, s*0.08, dark);
    px(ctx, x + s*0.35, y + s*0.2 + bob, s*0.08, s*0.08, '#ff3a2a');
    px(ctx, x + s*0.57, y + s*0.2 + bob, s*0.08, s*0.08, '#ff3a2a');
    if (t === 'abyssal') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        px(ctx, x + s*0.5 + Math.cos(a)*s*0.4, y + s*0.7 + Math.sin(a)*s*0.3, s*0.06, s*0.15, dark);
      }
      const eyes = [[0.35, 0.3], [0.55, 0.25], [0.45, 0.4], [0.6, 0.35], [0.3, 0.45]];
      for (const [ex, ey] of eyes) px(ctx, x + s*ex, y + s*ey + bob, s*0.04, s*0.04, '#ff0000');
    }
  } else
  if (t === 'venom_toad') {
    px(ctx, x + s*0.1, y + s*0.4 + bob, s*0.8, s*0.35, c);
    px(ctx, x + s*0.12, y + s*0.38 + bob, s*0.76, s*0.12, dark);
    px(ctx, x + s*0.2, y + s*0.42 + bob, s*0.08, s*0.06, dark);
    px(ctx, x + s*0.5, y + s*0.4 + bob, s*0.07, s*0.05, dark);
    px(ctx, x + s*0.7, y + s*0.44 + bob, s*0.08, s*0.06, dark);
    px(ctx, x + s*0.18, y + s*0.3 + bob, s*0.12, s*0.12, c);
    px(ctx, x + s*0.7, y + s*0.3 + bob, s*0.12, s*0.12, c);
    px(ctx, x + s*0.2, y + s*0.32 + bob, s*0.06, s*0.06, '#ffcc00');
    px(ctx, x + s*0.72, y + s*0.32 + bob, s*0.06, s*0.06, '#ffcc00');
    px(ctx, x + s*0.25, y + s*0.6 + bob, s*0.5, s*0.04, dark);
  } else
  if (t === 'rust_serpent') {
    for (let i = 0; i < 7; i++) {
      const sx = x + s*(0.05 + i*0.13);
      const sy = y + s*0.5 + bob + Math.sin(frame*0.3 + i*0.8) * s*0.08;
      px(ctx, sx, sy, s*0.14, s*0.16, i%2 ? c : dark);
    }
    px(ctx, x + s*0.78, y + s*0.45 + bob, s*0.6, s*0.14, c);
    px(ctx, x + s*0.82, y + s*0.48 + bob, s*0.06, s*0.06, '#ff3a2a');
    px(ctx, x + s*0.2, y + s*0.42 + bob, s*0.04, s*0.04, dark);
    px(ctx, x + s*0.4, y + s*0.42 + bob, s*0.04, s*0.04, dark);
    px(ctx, x + s*0.6, y + s*0.42 + bob, s*0.04, s*0.04, dark);
  } else
  if (t === 'skeleton') {
    px(ctx, x + s*0.3, y + s*0.5 + bob, s*0.15, s*0.25, c);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.15, s*0.25, c);
    px(ctx, x + s*0.3, y + s*0.35 + bob, s*0.4, s*0.3, c);
    for (let i = 0; i < 4; i++) {
      px(ctx, x + s*0.3, y + s*(0.38 + i*0.07) + bob, s*0.4, s*0.02, dark);
    }
    px(ctx, x + s*0.32, y + s*0.1 + bob, s*0.36, s*0.28, c);
    px(ctx, x + s*0.38, y + s*0.2 + bob, s*0.08, s*0.08, '#000');
    px(ctx, x + s*0.54, y + s*0.2 + bob, s*0.08, s*0.08, '#000');
    for (let i = 0; i < 4; i++) {
      px(ctx, x + s*(0.36 + i*0.08), y + s*0.34 + bob, s*0.03, s*0.04, dark);
    }
    px(ctx, x + s*0.15, y + s*0.4 + bob, s*0.08, s*0.2, c);
    px(ctx, x + s*0.1, y + s*0.2 + bob, s*0.04, s*0.2, dark);
  } else
  if (t === 'ghoul') {
    px(ctx, x + s*0.3, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.3, y + s*0.35 + bob, s*0.4, s*0.35, c);
    px(ctx, x + s*0.32, y + s*0.33 + bob, s*0.36, s*0.1, dark);
    px(ctx, x + s*0.34, y + s*0.1 + bob, s*0.32, s*0.28, c);
    px(ctx, x + s*0.4, y + s*0.2 + bob, s*0.07, s*0.07, '#000');
    px(ctx, x + s*0.53, y + s*0.2 + bob, s*0.07, s*0.07, '#000');
    px(ctx, x + s*0.41, y + s*0.21 + bob, s*0.03, s*0.03, '#ff3a2a');
    px(ctx, x + s*0.54, y + s*0.21 + bob, s*0.03, s*0.03, '#ff3a2a');
    px(ctx, x + s*0.15, y + s*0.4 + bob, s*0.1, s*0.25, c);
    for (let i = 0; i < 3; i++) {
      px(ctx, x + s*0.1, y + s*(0.6 + i*0.04) + bob, s*0.04, s*0.06, dark);
    }
    px(ctx, x + s*0.75, y + s*0.4 + bob, s*0.1, s*0.25, c);
    for (let i = 0; i < 3; i++) {
      px(ctx, x + s*0.86, y + s*(0.6 + i*0.04) + bob, s*0.04, s*0.06, dark);
    }
    for (let i = 0; i < 4; i++) {
      px(ctx, x + s*(0.4 + i*0.06), y + s*0.34 + bob, s*0.03, s*0.04, '#ddd');
    }
  } else
  if (t === 'wraith' || t === 'crystal_wraith') {
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.35, c);
    px(ctx, x + s*0.27, y + s*0.33 + bob, s*0.46, s*0.1, dark);
    px(ctx, x + s*0.22, y + s*0.5 + bob, s*0.12, s*0.15, c);
    px(ctx, x + s*0.4, y + s*0.68 + bob, s*0.1, s*0.1, c);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.12, s*0.15, c);
    px(ctx, x + s*0.3, y + s*0.1 + bob, s*0.4, s*0.28, c);
    px(ctx, x + s*.38, y + s*0.2 + bob, s*0.08, s*0.08, '#000');
    px(ctx, x + s*0.54, y + s*0.2 + bob, s*0.08, s*0.08, '#000');
    if (t === 'crystal_wraith') {
      px(ctx, x + s*0.2, y + s*0.4 + bob, s*0.06, s*0.12, '#8ac4e8');
      px(ctx, x + s*0.4, y + s*0.4 + bob, s*0.06, s*0.12, '#8ac4e8');
      px(ctx, x + s*0.35, y + s*0.15 + bob, s*0.1, s*0.1, 'rgba(120,200,240,0.3)');
    } else {
      px(ctx, x + s*0.4, y + s*0.22 + bob, s*0.03, s*0.03, dark);
      px(ctx, x + s*0.56, y + s*0.22 + bob, s*0.03, s*0.03, dark);
    }
    px(ctx, x + s*0.2, y + s*0.3 + bob, s*0.6, s*0.1, 'rgba(255,255,255,0.05)');
  } else
  if (t === 'dust_mummy') {
    px(ctx, x + s*0.3, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.35, c);
    for (let i = 0; i < 4; i++) {
      px(ctx, x + s*0.25, y + s*(0.38 + i*0.08) + bob, s*0.5, s*0.03, dark);
    }
    px(ctx, x + s*0.32, y + s*0.12 + bob, s*0.36, s*0.26, c);
    px(ctx, x + s*0.34, y + s*0.14 + bob, s*0.32, s*0.04, dark);
    px(ctx, x + s*0.4, y + s*0.22 + bob, s*0.06, s*0.06, '#00e040');
    px(ctx, x + s*0.54, y + s*0.22 + bob, s*0.06, s*0.06, '#00e040');
  } else
  if (t === 'fossil_spirit') {
    const wig = Math.sin(frame * 0.3) * s * 0.03;
    for (let i = 0; i < 6; i++) {
      px(ctx, x + s*(0.1 + i*0.13) + wig, y + s*0.5 + bob, s*0.1, s*0.14, c);
    }
    for (let i = 0; i < 5; i++) {
      const sx = x + s*(0.12 + i*0.13) + wig;
      px(ctx, sx, y + s*0.62 + bob, s*0.06, s*0.08, dark);
      px(ctx, sx + s*0.08, y + s*0.62 + bob, s*0.06, s*0.08, dark);
    }
    px(ctx, x + s*0.72 + wig, y + s*0.42 + bob, s*0.18, s*0.2, c);
    px(ctx, x + s*0.76 + wig, y + s*0.46 + bob, s*0.06, s*0.06, '#000');
    px(ctx, x + s*0.84 + wig, y + s*0.46 + bob, s*0.06, s*0.06, '#000');
  } else
  if (t === 'stalactite_horror') {
    px(ctx, x + s*0.3, y + s*0.0 + bob, s*0.4, s*0.1, dark);
    px(ctx, x + s*0.32, y + s*0.08 + bob, s*0.36, s*0.15, c);
    px(ctx, x + s*0.35, y + s*0.2 + bob, s*0.3, s*0.2, c);
    px(ctx, x + s*0.38, y + s*0.38 + bob, s*0.24, s*0.2, c);
    px(ctx, x + s*0.41, y + s*0.55 + bob, s*0.18, s*0.15, c);
    px(ctx, x + s*0.44, y + s*0.68 + bob, s*0.12, s*0.1, dark);
    px(ctx, x + s*0.46, y + s*0.76 + bob, s*.08, s*0.06, dark);
    px(ctx, x + s*0.4, y + s*0.15 + bob, s*0.06, s*0.6, dark);
    px(ctx, x + s*0.55, y + s*0.3 + bob, s*0.05, s*0.05, dark);
    px(ctx, x + s*0.45, y + s*0.25 + bob, s*0.06, s*0.06, '#ff3a2a');
  } else
  if (t === 'cavern_fish') {
    const wig = Math.sin(frame * 0.5) * s * 0.03;
    px(ctx, x + s*0.05 + wig, y + s*0.4 + bob, s*0.12, s*0.2, dark);
    px(ctx, x + s*0.05 + wig, y + s*0.45 + bob, s*0.12, s*0.1, c);
    px(ctx, x + s*0.15, y + s*0.4 + bob, s*0.5, s*0.25, c);
    px(ctx, x + s*0.22, y + s*0.38 + bob, s*0.46, s*0.08, dark);
    px(ctx, x + s*0.6, y + s*0.42 + bob, s*0.2, s*0.2, c);
    px(ctx, x + s*0.68, y + s*0.48 + bob, s*0.05, s*0.05, dark);
    px(ctx, x + s*0.72, y + s*0.55 + bob, s*0.03, s*0.04, '#ddd');
    px(ctx, x + s*0.77, y + s*0.55 + bob, s*0.03, s*0.04, '#ddd');
    px(ctx, x + s*0.82, y + s*0.55 + bob, s*0.03, s*0.04, '#ddd');
    px(ctx, x + s*0.4, y + s*0.3 + bob, s*0.1, s*0.1, dark);
  } else
  if (t === 'amber_golem') {
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.4, c);
    px(ctx, x + s*0.27, y + s*0.33 + bob, s*.46, s*0.2, dark);
    px(ctx, x + s*0.3, y + s*0.4 + bob, s*0.4, s*0.3, 'rgba(255,180,60,0.)');
    px(ctx, x + s*0.4, y + s*0.5 + bob, s*0.08, s*0.06, dark);
    px(ctx, x + s*0.36, y + s*0.48 + bob, s*0.04, s*0.04, dark);
    px(ctx, x + s*0.32, y + s*0.1 + bob, s*0.36, s*0.26, c);
    px(ctx, x + s*0.35, y + s*0.12 + bob, s*0.3, s*0.08, 'rgba(255,80,60,0.15)');
    px(ctx, x + s*0.4, y + s*0.2 + bob, s*0.06, s*0.06, '#ffcc40');
    px(ctx, x + s*0.54, y + s*0.2 + bob, s*0.06, s*0.06, '#ffcc40');
    px(ctx, x + s*0.28, y + s*0.72 + bob, s*0.12, s*0.12, c);
    px(ctx, x + s*0.6, y + s*0.72 + bob, s*0.12, s*0.12, c);
  } else
  if (t === 'grave_crawler') {
    const wig = Math.sin(frame * 0.4) * s * 0.03;
    for (let i = 0; i < 6; i++) {
      const sx = x + s*(0.05 + i*0.12);
      const sy = y + s*0.5 + bob + (i%2 ? wig : -wig);
      px(ctx, sx, sy, s*0.12, s*0.16, i%2 ? c : dark);
      px(ctx, sx, sy + s*0.15, s*0.03, s*.08, c);
      px(ctx, sx + s*0.08, sy + s*0.15, s*0.03, s*0.08, c);
    }
    px(ctx, x + s*0.72, y + s*0.42 + bob, s*0.2, s*0.22, '#d0d0c0');
    px(ctx, x + s*0.6, y + s*0.47 + bob, s*0.06, s*0.06, '#000');
    px(ctx, x + s*0.84, y + s*0.47 + bob, s*0.06, s*0.06, '#000');
  } else
  if (t === 'ash_wraith') {
    px(ctx, x + s*0.3, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.25, y + s*0.3 + bob, s*0.5, s*0.4, c);
    px(ctx, x + s*0.27, y + s*0.28 + bob, s*0.46, s*0.1, dark);
    px(ctx, x + s*0.22, y + s*0.65 + bob, s*0.12, s*0.12, c);
    px(ctx, x + s*0.4, y + s*0.68 + bob, s*0.1, s*0.1, c);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.12, s*0.12, c);
    px(ctx, x + s*0.3, y + s*0.1 + bob, s*0.4, s*0.28, c);
    px(ctx, x + s*0.38, y + s*0.2 + bob, s*0.08, s*0.08, '#000');
    px(ctx, x + s*0.54, y + s*0.2 + bob, s*.08, s*0.08, '#000');
    px(ctx, x + s*0.4, y + s*0.22 + bob, s*0.04, s*0.04, '#ff6a1a');
    px(ctx, x + s*0.56, y + s*0.22 + bob, s*0.04, s*0.04, '#ff6a1a');
    px(ctx, x + s*0.15, y + s*0.15 + bob, s*0.04, s*0.04, 'rgba(120,110,100,0.5)');
    px(ctx, x + s*0.8, y + s*0.25 + bob, s*0.04, s*0.04, 'rgba(120,110,100,0.5)');
  } else
  if (t === 'frost_sprite') {
    const wf = Math.sin(frame * 0.8) * s * 0.05;
    px(ctx, x + s*0.1, y + s*0.3 + bob - wf, s*0.2, s*0.15, 'rgba(170,221,255,0.5)');
    px(ctx, x + s*0.7, y + s*0.3 + bob - wf, s*0.2, s*0.15, 'rgba(170,221,255,0.5)');
    px(ctx, x + s*0.35, y + s*0.4 + bob, s*0.3, s*0.3, c);
    px(ctx, x + s*0.38, y + s*0.2 + bob, s*0.24, s*0.22, c);
    px(ctx, x + s*0.45, y + s*0.1 + bob, s*0.1, s*0.1, '#fff');
    px(ctx, x + s*0.42, y + s*0.28 + bob, s*0.05, s*0.05, '#0080ff');
    px(ctx, x + s*0.53, y + s*0.28 + bob, s*0.05, s*0.05, '#0080ff');
  } else
  if (t === 'glacier_beast' || t === 'rime_stalker' || t === 'ice_lurker') {
    px(ctx, x + s*0.15, y + s*0.3 + bob, s*0.7, s*0.45, c);
    px(ctx, x + s*0.17, y + s*0.28 + bob, s*0.66, s*0.12, dark);
    px(ctx, x + s*0.25, y + s*0.2 + bob, s*0.08, s*0.12, '#cceeff');
    px(ctx, x + s*0.45, y + s*0.15 + bob, s*0.08, s*0.15, '#cceeff');
    px(ctx, x + s*0.65, y + s*0.2 + bob, s*0.08, s*0.12, '#cceeff');
    px(ctx, x + s*0.3, y + s*0.1 + bob, s*0.4, s*0.25, c);
    px(ctx, x + s*0.2, y + s*0.08 + bob, s*0.36, s*0.08, dark);
    px(ctx, x + s*0.38, y + s*0.18 + bob, s*0.06, s*0.06, '#0080ff');
    px(ctx, x + s*.56, y + s*0.18 + bob, s*0.06, s*0.06, '#0080ff');
    px(ctx, x + s*0.38, y + s*0.3 + bob, s*0.04, s*0.08, '#fff');
    px(ctx, x + s*0.58, y + s*0.3 + bob, s*0.04, s*0.08, '#fff');
    px(ctx, x + s*0.2, y + s*0.72 + bob, s*0.12, s*0.15, dark);
    px(ctx, x + s*0.68, y + s*0.72 + bob, s*0.12, s*0.15, dark);
    if (t === 'rime_stalker') {
      px(ctx, x + s*0.05, y + s*0.75 + bob, s*0.1, s*0.04, 'rgba(200,230,255,0.3)');
      px(ctx, x + s*0.85, y + s*0.75 + bob, s*0.1, s*0.04, 'rgba(200,230,255,0.3)');
    }
  } else
  if (t === 'dark_knight') {
    px(ctx, x + s*0.3, y + s*0.65 + bob, s*0.15, s*0.25, c);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.15, s*0.25, c);
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.35, c);
    px(ctx, x + s*0.27, y + s*0.33 + bob, s*0.46, s*0.12, dark);
    px(ctx, x + s*0.35, y + s*0.4 + bob, s*0.3, s*0.2, shade(c, -30));
    px(ctx, x + s*0.18, y + s*0.3 + bob, s*0.12, s*0.12, dark);
    px(ctx, x + s*0.7, y + s*0.3 + bob, s*0.12, s*0.12, dark);
    px(ctx, x + s*0.2, y + s*0.25 + bob, s*0.06, s*0.08, dark);
    px(ctx, x + s*0.74, y + s*0.25 + bob, s*0.06, s*0.08, dark);
    px(ctx, x + s*0.3, y + s*0.08 + bob, s*0.4, s*0.28, c);
    px(ctx, x + s*0.28, y + s*0.0 + bob, s*0.1, s*0.1, dark);
    px(ctx, x + s*0.62, y + s*0.0 + bob, s*0.1, s*0.1, dark);
    px(ctx, x + s*0.34, y + s*0.2 + bob, s*0.32, s*0.04, '#1a1a1a');
    px(ctx, x + s*.38, y + s*0.21 + bob, s*0.06, s*0.02, '#ff3a2a');
    px(ctx, x + s*0.52, y + s*0.21 + bob, s*0.06, s*0.02, '#ff3a2a');
    px(ctx, x + s*0.78, y + s*0.1 + bob, s*0.06, s*0.4, dark);
    px(ctx, x + s*0.74, y + s*0.45 + bob, s*0.14, s*0.04, dark);
  } else
  if (t === 'obsidian_gargoyle') {
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.4, c);
    px(ctx, x + s*0.27, y + s*0.33 + bob, s*0.46, s*0.12, dark);
    px(ctx, x + s*0.05, y + s*0.25 + bob, s*0.22, s*0.2, dark);
    px(ctx, x + s*0.73, y + s*0.25 + bob, s*0.2, s*0.2, dark);
    px(ctx, x + s*0.32, y + s*0.1 + bob, s*0.36, s*0.28, c);
    px(ctx, x + s*0.32, y + s*0.02 + bob, s*0.08, s*0.1, dark);
    px(ctx, x + s*0.6, y + s*0.02 + bob, s*0.08, s*0.1, dark);
    px(ctx, x + s*0.4, y + s*0.2 + bob, s*0.06, s*.06, '#ff2020');
    px(ctx, x + s*0.54, y + s*0.2 + bob, s*0.06, s*0.06, '#ff2020');
    px(ctx, x + s*0.2, y + s*0.0 + bob, s*0.06, s*0.1, dark);
    px(ctx, x + s*0.4, y + s*0.7 + bob, s*0.06, s*0.1, dark);
    px(ctx, x + s*0.55, y + s*0.7 + bob, s*0.06, s*0.1, dark);
    px(ctx, x + s*0.74, y + s*0.7 + bob, s*0.06, s*0.1, dark);
  } else
  if (t === 'inferno_knight') {
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.4, c);
    px(ctx, x + s*0.27, y + s*0.33 + bob, s*0.46, s*0.12, dark);
    px(ctx, x + s*0.2, y + s*0.2 + bob, s*0.08, s*0.16, '#ff6a1a');
    px(ctx, x + s*0.45, y + s*0.5 + bob, s*0.08, s*0.2, '#ffa040');
    px(ctx, x + s*0.68, y + s*0.2 + bob, s*0.08, s*0.16, '#ff6a1a');
    px(ctx, x + s*0.3, y + s*0.08 + bob, s*0.4, s*0.3, dark);
    px(ctx, x + s*0.34, y + s*0.2 + bob, s*0.32, s*0.04, '#ff4a0a');
    px(ctx, x + s*0.38, y + s*0.21 + bob, s*0.06, s*0.02, '#ff8a0a');
    px(ctx, x + s*0.52, y + s*0.21 + bob, s*0.06, s*0.02, '#ff8a0a');
    px(ctx, x + s*0.75, y + s*0.1 + bob, s*0.06, s*0.4, dark);
    px(ctx, x + s*0.74, y + s*0.1 + bob, s*0.08, s*0.15, '#ff6a1a');
    px(ctx, x + s*0.28, y + s*0.72 + bob, s*0.14, s*0.15, c);
    px(ctx, x + s*0.58, y + s*0.72 + bob, s*0.14, s*0.15, c);
  } else
  if (t === 'fire_imp') {
    px(ctx, x + s*0.35, y + s*0.4 + bob, s*0.3, s*0.35, c);
    px(ctx, x + s*0.37, y + s*0.38 + bob, s*0.6, s*0.1, dark);
    px(ctx, x + s*0.38, y + s*0.15 + bob, s*0.24, s*0.25, c);
    px(ctx, x + s*0.38, y + s*0.08 + bob, s*0.08, s*0.1, dark);
    px(ctx, x + s*0.54, y + s*0.08 + bob, s*0.08, s*0.1, dark);
    px(ctx, x + s*0.42, y + s*0.25 + bob, s*0.05, s*0.05, '#ffcc00');
    px(ctx, x + s*0.53, y + s*0.25 + bob, s*0.05, s*0.05, '#ffcc00');
    px(ctx, x + s*0.42, y + s*0.33 + bob, s*0.16, s*0.03, dark);
    px(ctx, x + s*0.3, y + s*0.5 + bob, s*0.06, s*0.1, '#ff6600');
    px(ctx, x + s*0.64, y + s*0.5 + bob, s*0.06, s*0.1, '#ff6600');
    px(ctx, x + s*0.38, y + s*0.72 + bob, s*0.1, s*0.12, c);
    px(ctx, x + s*0.52, y + s*0.72 + bob, s*0.1, s*0.12, c);
  } else
  if (t === 'demon') {
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.4, c);
    px(ctx, x + s*.27, y + s*0.33 + bob, s*0.46, s*0.12, dark);
    px(ctx, x + s*0.05, y + s*0.2 + bob, s*0.22, s*0.3, dark);
    px(ctx, x + s*0.73, y + s*0.2 + bob, s*0.22, s*0.3, dark);
    px(ctx, x + s*0.3, y + s*0.1 + bob, s*0.4, s*0.28, c);
    px(ctx, x + s*0.28, y + s*0.0 + bob, s*0.1, s*0.12, dark);
    px(ctx, x + s*0.62, y + s*0.0 + bob, s*0.1, s*0.12, dark);
    px(ctx, x + s*0.48, y + s*0.1 + bob, s*0.04, s*0.2, '#000');
    px(ctx, x + s*0.38, y + s*0.2 + bob, s*0.06, s*0.06, '#ffcc00');
    px(ctx, x + s*0.56, y + s*0.2 + bob, s*0.06, s*0.06, '#ffcc00');
    px(ctx, x + s*0.35, y + s*0.3 + bob, s*0.3, s*0.04, '#000');
    px(ctx, x + s*0.3, y + s*0.72 + bob, s*0.14, s*0.15, c);
    px(ctx, x + s*0.56, y + s*0.72 + bob, s*0.14, s*0.15, c);
  } else
  if (t === 'forgotten_one' || t === 'shadow' || t === 'void_warden') {
    px(ctx, x + s*0.2, y + s*0.1 + bob, s*0.6, s*0.7, c);
    px(ctx, x + s*0.22, y + s*0.08 + bob, s*0.56, s*.15, dark);
    px(ctx, x + s*0.18, y + s*0.7 + bob, s*0.1, s*0.15, c);
    px(ctx, x + s*0.35, y + s*0.72 + bob, s*0.1, s*0.13, c);
    px(ctx, x + s*0.5, y + s*0.7 + bob, s*0.1, s*0.15, c);
    px(ctx, x + s*0.5, y + s*0.72 + bob, s*0.1, s*0.13, c);
    px(ctx, x + s*0.3, y + s*0.12 + bob, s*0.4, s*0.22, '#000');
    if (t === 'shadow') {
      px(ctx, x + s*0.4, y + s*0.2 + bob, s*0.06, s*0.06, '#cc00ff');
      px(ctx, x + s*0.54, y + s*0.2 + bob, s*0.06, s*0.06, '#cc00ff');
      px(ctx, x + s*0.1, y + s*0.3 + bob, s*0.8, s*0.5, 'rgba(0,0,0,0.2)');
    } else if (t === 'void_warden') {
      px(ctx, x + s*0.4, y + s*0.2 + bob, s*0.06, s*0.06, '#400060');
      px(ctx, x + s*0.54, y + s*0.2 + bob, s*0.06, s*0.06, '#400060');
    } else {
      px(ctx, x + s*0.45, y + s*0.22 + bob, s*0.04, s*0.04, dark);
    }
  } else
  if (t === 'eldritch_titan') {
    px(ctx, x + s*0.1, y + s*0.15 + bob, s*0.8, s*0.65, c);
    px(ctx, x + s*0.12, y + s*0.13 + bob, s*0.76, s*0.15, dark);
    px(ctx, x + s*0.35, y + s*.3 + bob, s*0.3, s*0.2, dark);
    px(ctx, x + s*0.4, y + s*0.35 + bob, s*0.2, s*0.1, shade(c, 20));
    px(ctx, x + s*0.28, y + s*0.0 + bob, s*0.44, s*0.18, c);
    px(ctx, x + s*0.38, y + s*0.05 + bob, s*0.08, s*0.08, '#ff00ff');
    px(ctx, x + s*0.54, y + s*0.05 + bob, s*0.08, s*0.08, '#ff00ff');
    px(ctx, x + s*0.46, y + s*0.02 + bob, s*0.04, s*0.04, '#00ffff');
    px(ctx, x + s*0.0, y + s*0.2 + bob, s*0.12, s*0.5, c);
    px(ctx, x + s*0.88, y + s*0.2 + bob, s*0.12, s*0.5, c);
  } else
  if (t === 'nightmare_spawn') {
    px(ctx, x + s*0.15, y + s*0.3 + bob, s*0.7, s*0.5, c);
    px(ctx, x + s*0.17, y + s*0.28 + bob, s*0.66, s*0.12, dark);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const lx = x + s*0.5 + Math.cos(a)*s*0.35;
      const ly = y + s*0.5 + bob + Math.sin(a)*s*0.3;
      px(ctx, lx, ly, s*0.06, s*0.1, c);
    }
    px(ctx, x + s*0.35, y + s*0.45 + bob, s*0.3, s*0.15, '#000');
    for (let i = 0; i < 5; i++) {
      px(ctx, x + s*(0.37 + i*0.06), y + s*0.5 + bob, s*0.03, s*0.06, '#fff');
    }
    px(ctx, x + s*0.55, y + s*0.2 + bob, s*0.1, s*0.1, '#ff00ff');
    px(ctx, x + s*0.57, y + s*0.22 + bob, s*0.05, s*0.05, '#000');
  } else
  if (t === 'abyssal_warden') {
    // towering void-armored warden
    drawShadow(ctx, x, y, s);
    // void aura
    px(ctx, x + s*0.1, y + s*0.1 + bob, s*0.8, s*0.8, 'rgba(20,0,40,0.3)');
    // robed armored body
    px(ctx, x + s*0.2, y + s*0.2 + bob, s*0.6, s*0.6, c);
    px(ctx, x + s*0.22, y + s*0.18 + bob, s*0.56, s*0.12, dark);
    // void rift energy
    px(ctx, x + s*0.15, y + s*0.4 + bob, s*0.04, s*0.2, '#6a0aaa');
    px(ctx, x + s*0.8, y + s*0.4 + bob, s*0.04, s*0.2, '#6a0aaa');
    // shoulders
    px(ctx, x + s*0.12, y + s*0.25 + bob, s*0.14, s*0.14, dark);
    px(ctx, x + s*0.74, y + s*0.25 + bob, s*0.14, s*0.14, dark);
    // helmet
    px(ctx, x + s*0.3, y + s*0.05 + bob, s*0.4, s*0.2, c);
    // dark void inside helmet
    px(ctx, x + s*0.35, y + s*0.1 + bob, s*0.3, s*0.12, '#000');
    // burning purple eyes
    px(ctx, x + s*0.4, y + s*0.14 + bob, s*0.06, s*0.06, '#aa00ff');
    px(ctx, x + s*0.54, y + s*0.14 + bob, s*0.06, s*0.06, '#aa00ff');
    px(ctx, x + s*0.41, y + s*0.15 + bob, s*0.03, s*0.03, '#fff');
    px(ctx, x + s*0.55, y + s*0.15 + bob, s*0.03, s*0.03, '#fff');
    // tendrils
    for (let i = 0; i < 5; i++) {
      px(ctx, x + s*(0.2 + i*0.15), y + s*0.75 + bob, s*0.04, s*0.15, dark);
    }
    // reality cracks
    px(ctx, x + s*0.05, y + s*0.5 + bob, s*0.03, s*0.15, '#cc44ff');
    px(ctx, x + s*0.92, y + s*0.5 + bob, s*0.03, s*0.15, '#cc44ff');
  } else
  if (t === 'depth_leviathan') {
    // massive void serpent
    drawShadow(ctx, x, y, s);
    // void aura
    px(ctx, x + s*0.0, y + s*0.2 + bob, s*1.0, s*0.6, 'rgba(10,0,20,0.3)');
    // serpentine body — thick
    for (let i = 0; i < 7; i++) {
      const sx = x + s*(0.1 + i*0.12);
      const sy = y + s*0.5 + bob + Math.sin(frame*0.3 + i*0.7) * s*0.12;
      px(ctx, sx, sy, s*0.16, s*0.2, i%2 ? c : dark);
    }
    // massive head
    px(ctx, x + s*0.78, y + s*0.42 + bob, s*0.2, s*0.2, c);
    px(ctx, x + s*0.82, y + s*0.44 + bob, s*0.16, s*0.16, dark);
    // multiple glowing eyes
    px(ctx, x + s*0.84, y + s*0.48 + bob, s*0.06, s*0.06, '#ff1010');
    px(ctx, x + s*0.78, y + s*0.45 + bob, s*0.04, s*0.04, '#ff2020');
    px(ctx, x + s*0.88, y + s*0.52 + bob, s*0.04, s*0.04, '#ff2020');
    px(ctx, x + s*0.85, y + s*0.49 + bob, s*0.02, s*0.02, '#fff');
    // enormous maw
    px(ctx, x + s*0.9, y + s*0.52 + bob, s*0.1, s*0.06, '#0a0000');
    // teeth
    for (let i = 0; i < 4; i++) {
      px(ctx, x + s*(0.91 + i*0.02), y + s*0.52 + bob, s*0.02, s*0.04, '#fff');
    }
    // dorsal spines
    for (let i = 0; i < 5; i++) {
      px(ctx, x + s*(0.15 + i*0.13), y + s*0.35 + bob, s*0.04, s*0.1, dark);
    }
    // tentacles from body
    for (let i = 0; i < 4; i++) {
      px(ctx, x + s*(0.2 + i*0.18), y + s*0.7 + bob, s*0.03, s*0.12, c);
    }
  } else
  {
    // generic fallback
    px(ctx, x + s*0.3, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.55, y + s*0.65 + bob, s*0.15, s*0.25, dark);
    px(ctx, x + s*0.25, y + s*0.35 + bob, s*0.5, s*0.35, c);
    px(ctx, x + s*0.28, y + s*0.38 + bob, s*0.44, s*0.12, dark);
    px(ctx, x + s*0.3, y + s*0.12 + bob, s*0.4, s*0.28, c);
    px(ctx, x + s*0.38, y + s*0.22 + bob, s*0.07, s*0.07, '#ff3a2a');
    px(ctx, x + s*0.55, y + s*0.22 + bob, s*0.07, s*0.07, '#ff3a2a');
  }
}