import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoiseOverlay from '@/components/game/NoiseOverlay';

const SCENES = [
  { duration: 4, text: 'The sea was calm, and the horizon was kind. My cat dozed on the deck beside me. I thought I heard singing from the waves...' },
  { duration: 3.5, text: 'Then the fog came rolling in, thick and wrong. It didn\'t drift — it reached.' },
  { duration: 4, text: 'We struck something in the dark. The hull screamed. Or maybe that was me.' },
  { duration: 3.5, text: 'The water pulled me under. I saw lights below — green, cold, hungry.' },
  { duration: 4, text: 'When I opened my eyes, I was on a shore I had never seen. Beside me, my cat coughed up seawater — we had washed ashore together.' },
  { duration: 3.5, text: 'Behind the beach, the woods were dark. Something in the trees was watching too.' },
];

export default function IntroCinematic({ onComplete }) {
  const canvasRef = useRef(null);
  const [scene, setScene] = useState(0);
  const [done, setDone] = useState(false);
  const sceneRef = useRef(0);

  useEffect(() => {
    if (done) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; };
    resize();
    const startTime = performance.now();
    const totalDur = SCENES.reduce((a, s) => a + s.duration, 0);
    let raf;
    const loop = (t) => {
      const elapsed = (t - startTime) / 1000;
      if (elapsed >= totalDur) { setDone(true); return; }
      let acc = 0, si = 0;
      for (let i = 0; i < SCENES.length; i++) {
        if (elapsed < acc + SCENES[i].duration) { si = i; break; }
        acc += SCENES[i].duration;
      }
      if (si !== sceneRef.current) { sceneRef.current = si; setScene(si); }
      const ctx = canvas.getContext('2d');
      drawScene(ctx, canvas.width / dpr, canvas.height / dpr, dpr, si, (elapsed - acc) / SCENES[si].duration, elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  if (done) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at center, #1a2230 0%, #0a0e16 60%, #050709 100%)' }}>
        <NoiseOverlay opacity={0.08} />
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full"
            style={{ background: i % 3 === 0 ? 'rgba(255,200,100,0.8)' : 'rgba(220,255,150,0.8)', left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}
            animate={{ opacity: [0,1,0], scale: [0.5,1.5,0.5], y: [0,-30,10,0] }}
            transition={{ duration: 4+Math.random()*4, repeat: Infinity, delay: Math.random()*3 }} />
        ))}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }}
          className="relative z-10 text-center px-6">
          <h1 className="text-amber-100 font-serif text-4xl md:text-6xl font-bold mb-8 tracking-tight">Whispering Pines</h1>
          <button onClick={onComplete}
            className="bg-amber-700 hover:bg-amber-600 text-amber-50 font-semibold px-10 py-3 rounded-lg shadow-lg shadow-amber-900/50 transition-all hover:scale-105 active:scale-95 border border-amber-400/30">
            Begin
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <NoiseOverlay opacity={0.07} />
      <button onClick={() => setDone(true)}
        className="absolute top-4 right-4 z-10 text-amber-100/40 hover:text-amber-100/80 text-xs font-mono px-3 py-1.5 rounded border border-amber-100/20 hover:border-amber-100/40 transition">
        Skip Intro »
      </button>
      <AnimatePresence mode="wait">
        <motion.div key={scene}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-16 left-0 right-0 text-center px-8 z-10 pointer-events-none">
          <p className="text-amber-100/80 text-base md:text-lg italic font-serif max-w-xl mx-auto">{SCENES[scene].text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {SCENES.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition ${i <= scene ? 'bg-amber-400' : 'bg-amber-100/20'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Scene drawing ───
function drawScene(ctx, w, h, dpr, scene, p, t) {
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  if (scene === 0) drawCalm(ctx, w, h, p, t);
  else if (scene === 1) drawFog(ctx, w, h, p, t);
  else if (scene === 2) drawStorm(ctx, w, h, p, t);
  else if (scene === 3) drawUnderwater(ctx, w, h, p, t);
  else if (scene === 4) drawShore(ctx, w, h, p, t);
  else drawWoods(ctx, w, h, p, t);
  ctx.restore();
}

function drawShip(ctx, cx, cy, scale, sailColor, tilt) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.rotate(tilt || 0);
  // hull
  ctx.fillStyle = '#3a2818';
  ctx.beginPath();
  ctx.moveTo(-45, 0); ctx.lineTo(45, 0); ctx.lineTo(38, 18); ctx.lineTo(-38, 18);
  ctx.closePath(); ctx.fill();
  // hull highlight
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(-40, 1, 80, 3);
  // deck
  ctx.fillStyle = '#4a3828';
  ctx.fillRect(-38, -4, 76, 5);
  // mast
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(-2, -72, 4, 70);
  // sail
  ctx.fillStyle = sailColor;
  ctx.beginPath();
  ctx.moveTo(2, -66); ctx.lineTo(30, -54); ctx.lineTo(30, -12); ctx.lineTo(2, -8);
  ctx.closePath(); ctx.fill();
  // sail shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(2, -66, 7, 58);
  // flag
  ctx.fillStyle = '#8a3a2a';
  ctx.fillRect(-2, -74, 14, 4);
  ctx.restore();
}

// Fritz the cat sitting on the deck — same transform as the ship
function drawShipCompanion(ctx, cx, cy, scale, tilt) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.rotate(tilt || 0);
  // cat sitting on the deck, left of the mast
  const ccx = -14, ccy = -11;
  ctx.fillStyle = '#d4842a'; ctx.fillRect(ccx - 5, ccy, 10, 7);     // body
  ctx.fillStyle = '#d4842a'; ctx.fillRect(ccx + 3, ccy - 4, 6, 5);  // head
  ctx.fillStyle = '#2a1a1a'; ctx.fillRect(ccx + 4, ccy - 3, 1, 1);  // eye
  ctx.fillStyle = '#2a1a1a'; ctx.fillRect(ccx + 7, ccy - 3, 1, 1);  // eye
  ctx.fillStyle = '#a4601a'; ctx.fillRect(ccx - 8, ccy + 1, 4, 4);  // tail
  ctx.fillStyle = '#e8a44a'; ctx.fillRect(ccx - 4, ccy + 1, 3, 2);  // belly highlight
  ctx.restore();
}

function drawShipHalf(ctx, cx, cy, scale, tilt, left) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.rotate(tilt);
  ctx.fillStyle = '#3a2818';
  ctx.beginPath();
  if (left) { ctx.moveTo(-45, 0); ctx.lineTo(0, 0); ctx.lineTo(-5, 18); ctx.lineTo(-38, 18); }
  else { ctx.moveTo(0, 0); ctx.lineTo(45, 0); ctx.lineTo(38, 18); ctx.lineTo(5, 18); }
  ctx.closePath(); ctx.fill();
  if (!left) { ctx.fillStyle = '#5a4030'; ctx.fillRect(-5, -50, 4, 48); ctx.fillStyle = '#c4b494'; ctx.beginPath(); ctx.moveTo(-1, -48); ctx.lineTo(15, -40); ctx.lineTo(-1, -10); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

function drawLightning(ctx, x, y, length) {
  ctx.strokeStyle = '#ddeeff';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#aaccff';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(x, y);
  let cx = x, cy = y;
  for (let i = 0; i < 6; i++) {
    cx += (Math.random() - 0.5) * 30;
    cy += length / 6;
    ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawCalm(ctx, w, h, p, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#1a1a3a'); sky.addColorStop(0.35, '#5a4a6a');
  sky.addColorStop(0.6, '#c48a4a'); sky.addColorStop(1, '#8a6a4a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  const sx = w * (0.65 - p * 0.1), sy = h * 0.45;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 80);
  sg.addColorStop(0, 'rgba(255,220,160,0.5)'); sg.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffd4a4'; ctx.beginPath(); ctx.arc(sx, sy, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a4a6a'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
  ctx.fillStyle = 'rgba(255,200,120,0.12)'; ctx.fillRect(sx - 14, h * 0.6, 28, h * 0.4);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const wy = h * 0.6 + i * 12;
    ctx.moveTo(0, wy);
    for (let x = 0; x <= w; x += 5) ctx.lineTo(x, wy + Math.sin(x * 0.02 + t + i) * 2);
    ctx.stroke();
  }
  const shipX = w * (0.1 + p * 0.6);
  const shipY = h * 0.6 - 8 + Math.sin(t * 0.8) * 2;
  const shipTilt = Math.sin(t * 0.4) * 0.015;
  drawShip(ctx, shipX, shipY, 0.8, '#e4d4b4', shipTilt);
  drawShipCompanion(ctx, shipX, shipY, 0.8, shipTilt);
  // waterline — hull sits in the water, not floating above it
  ctx.fillStyle = 'rgba(42,74,106,0.5)';
  ctx.fillRect(shipX - 42, h * 0.6, 84, 14);
}

function drawFog(ctx, w, h, p, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#1a1a2a'); sky.addColorStop(0.5, '#4a4a5a'); sky.addColorStop(1, '#5a5a6a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2a3a4a'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
  ctx.globalAlpha = 1 - p * 0.8;
  const fogShipX = w * 0.7 + p * w * 0.08;
  const fogShipY = h * 0.6 - 8;
  const fogTilt = Math.sin(t * 0.5) * 0.03;
  drawShip(ctx, fogShipX, fogShipY, 0.8, '#b4a484', fogTilt);
  drawShipCompanion(ctx, fogShipX, fogShipY, 0.8, fogTilt);
  ctx.globalAlpha = 1;
  // waterline
  ctx.fillStyle = 'rgba(42,58,74,0.5)';
  ctx.fillRect(fogShipX - 42, h * 0.6, 84, 14);
  ctx.fillStyle = `rgba(160,150,180,${p * 0.4})`; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = `rgba(180,170,200,${p * 0.08})`;
    const fy = h * (0.25 + i * 0.12) + Math.sin(t * 0.5 + i) * 10;
    ctx.fillRect(0, fy, w, 35);
  }
}

function drawStorm(ctx, w, h, p, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0a0a1a'); sky.addColorStop(0.5, '#1a1a2a'); sky.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  const flash = (Math.sin(t * 4) > 0.96) || (Math.sin(t * 7 + 1) > 0.97);
  if (flash) {
    ctx.fillStyle = 'rgba(200,220,255,0.25)'; ctx.fillRect(0, 0, w, h);
    drawLightning(ctx, w * 0.35 + Math.sin(t) * w * 0.08, 0, h * 0.55);
  }
  ctx.fillStyle = '#1a2a3a'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
  ctx.strokeStyle = 'rgba(180,200,220,0.12)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    const wy = h * 0.6 + i * 10;
    ctx.moveTo(0, wy);
    for (let x = 0; x <= w; x += 4) ctx.lineTo(x, wy + Math.sin(x * 0.03 + t * 2 + i) * 8);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(150,170,200,0.25)'; ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const rx = (i * 37 + t * 250) % w;
    const ry = (i * 53 + t * 500) % h;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 18); ctx.stroke();
  }
  const shipX = w * 0.5;
  const shipY = h * 0.6 - 8 + Math.sin(t * 1.5) * 8;
  const tilt = Math.sin(t) * 0.15 + p * 0.25;
  if (p > 0.5) {
    ctx.globalAlpha = 1 - (p - 0.5) * 0.4;
    drawShipHalf(ctx, shipX - 25 - p * 30, shipY + (p - 0.5) * 20, 0.8, tilt, true);
    drawShipHalf(ctx, shipX + 25 + p * 30, shipY + (p - 0.5) * 15, 0.8, -tilt, false);
    ctx.globalAlpha = 1;
  } else {
    drawShip(ctx, shipX, shipY, 0.8, '#c4b494', tilt);
    drawShipCompanion(ctx, shipX, shipY, 0.8, tilt);
    // waterline
    ctx.fillStyle = 'rgba(26,42,58,0.5)';
    ctx.fillRect(shipX - 42, h * 0.6, 84, 14);
  }
}

function drawShore(ctx, w, h, p, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, '#1a2a3a'); sky.addColorStop(0.4, '#4a5a6a');
  sky.addColorStop(0.7, '#8a7a6a'); sky.addColorStop(1, '#c4a474');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.7);
  ctx.fillStyle = 'rgba(255,200,140,0.3)';
  ctx.beginPath(); ctx.arc(w * 0.7, h * 0.55, 45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b09a72'; ctx.fillRect(0, h * 0.7, w, h * 0.3);
  ctx.fillStyle = '#9a8460';
  for (let i = 0; i < 40; i++) ctx.fillRect((i * 47) % w, h * 0.7 + (i * 31 % (h * 0.3)), 3, 2);
  ctx.fillStyle = '#3a5a7a';
  ctx.beginPath(); ctx.moveTo(0, h * 0.7);
  for (let x = 0; x <= w; x += 4) ctx.lineTo(x, h * 0.7 + Math.sin(x * 0.02 + t * 0.5) * 3);
  ctx.lineTo(w, h * 0.72); ctx.lineTo(0, h * 0.72); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.moveTo(0, h * 0.71);
  for (let x = 0; x <= w; x += 4) ctx.lineTo(x, h * 0.71 + Math.sin(x * 0.03 + t) * 2);
  ctx.lineTo(w, h * 0.73); ctx.lineTo(0, h * 0.73); ctx.closePath(); ctx.fill();
  // shipwreck debris
  ctx.save(); ctx.translate(w * 0.12, h * 0.74); ctx.rotate(0.2);
  ctx.fillStyle = '#3a2818'; ctx.fillRect(-20, -3, 40, 7); ctx.restore();
  ctx.save(); ctx.translate(w * 0.82, h * 0.72); ctx.rotate(-0.35);
  ctx.fillStyle = '#3a2818'; ctx.fillRect(-18, -3, 36, 7); ctx.restore();
  // washed-up figure
  const fx = w * 0.42, fy = h * 0.82;
  ctx.save(); ctx.translate(fx, fy); ctx.rotate(0.15);
  ctx.fillStyle = '#4a6a8a'; ctx.fillRect(-8, -4, 16, 10);
  ctx.fillStyle = '#2e2e3e'; ctx.fillRect(-6, 6, 12, 8);
  ctx.fillStyle = '#e0b890'; ctx.fillRect(-4, -10, 8, 8);
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-5, -12, 10, 4);
  ctx.restore();
  // Fritz the cat — washed ashore beside the player, dripping wet
  const cx = w * 0.49, cy = h * 0.83;
  ctx.fillStyle = '#d4842a'; ctx.fillRect(cx - 6, cy - 3, 12, 6);
  ctx.fillStyle = '#d4842a'; ctx.fillRect(cx + 4, cy - 6, 5, 5);
  ctx.fillStyle = '#2a1a1a'; ctx.fillRect(cx + 5, cy - 5, 1, 1); ctx.fillRect(cx + 7, cy - 5, 1, 1);
  ctx.fillStyle = '#a4601a'; ctx.fillRect(cx - 8, cy - 1, 3, 4);
  // wet fur sheen
  ctx.fillStyle = 'rgba(60,90,110,0.35)';
  ctx.fillRect(cx - 6, cy - 3, 12, 6);
  ctx.fillRect(cx + 4, cy - 6, 5, 5);
}

// ── Scene 4: Underwater — green lights, drowning, sinking ──
function drawUnderwater(ctx, w, h, p, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0a1a2a'); grad.addColorStop(0.5, '#0a2a2a'); grad.addColorStop(1, '#051a1a');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  // sinking figure
  const fy = h * (0.2 + p * 0.5);
  ctx.save();
  ctx.translate(w * 0.5, fy);
  ctx.rotate(Math.sin(t * 0.5) * 0.3 + p * 0.5);
  ctx.fillStyle = '#4a6a8a'; ctx.fillRect(-8, -4, 16, 10);
  ctx.fillStyle = '#2e2e3e'; ctx.fillRect(-6, 6, 12, 8);
  ctx.fillStyle = '#e0b890'; ctx.fillRect(-4, -10, 8, 8);
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-5, -12, 10, 4);
  // air bubbles rising
  ctx.fillStyle = 'rgba(180,220,200,0.4)';
  ctx.beginPath(); ctx.arc(3, -16, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(-2, -22, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // green hungry lights below
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const lx = w * (0.2 + i * 0.15) + Math.sin(t * 0.8 + i) * 20;
    const ly = h * (0.7 + (i % 2) * 0.15) + Math.cos(t + i) * 10;
    const lr = 30 + Math.sin(t * 2 + i) * 10;
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
    lg.addColorStop(0, `rgba(80,255,120,${0.4 - p * 0.2})`);
    lg.addColorStop(1, 'rgba(40,120,60,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // floating particles
  ctx.fillStyle = 'rgba(100,140,120,0.3)';
  for (let i = 0; i < 30; i++) {
    const px2 = (i * 47 + t * 15) % w;
    const py2 = (i * 31 + t * 8) % h;
    ctx.fillRect(px2, py2, 2, 2);
  }
  // ── dark tentacles reaching up from the depths ──
  const numTentacles = 5;
  for (let i = 0; i < numTentacles; i++) {
    const baseX = w * (0.1 + i * 0.2) + Math.sin(t * 0.3 + i) * 15;
    const reach = p * h * 0.35 + Math.sin(t * 0.6 + i * 1.3) * 20;
    const segments = 8;
    let prevX = baseX, prevY = h;
    ctx.strokeStyle = 'rgba(8,6,12,0.85)';
    ctx.lineCap = 'round';
    for (let s = 1; s <= segments; s++) {
      const prog = s / segments;
      const wave = Math.sin(t * 0.8 + i + prog * 3) * (12 + prog * 25);
      const curX = baseX + wave * prog;
      const curY = h - reach * prog;
      const thickness = (16 - prog * 13) * (0.8 + p * 0.4);
      ctx.lineWidth = Math.max(1.5, thickness);
      ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(curX, curY); ctx.stroke();
      prevX = curX; prevY = curY;
    }
    // tapered tip — a small sucker-dotted knob
    ctx.fillStyle = 'rgba(4,3,6,0.9)';
    ctx.beginPath(); ctx.arc(prevX, prevY, Math.max(2, 4 * (1 - p * 0.3)), 0, Math.PI*2); ctx.fill();
  }
  // darkness closing in
  ctx.fillStyle = `rgba(0,0,0,${p * 0.5})`;
  ctx.fillRect(0, 0, w, h);
}

// ── Scene 5: Dark woods — eyes watching from the trees ──
function drawWoods(ctx, w, h, p, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0a0a0a'); grad.addColorStop(0.6, '#0a1a0a'); grad.addColorStop(1, '#15281a');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  // ground
  ctx.fillStyle = '#1a2a1a'; ctx.fillRect(0, h * 0.7, w, h * 0.3);
  // ── layered pine tree silhouettes ──
  // back layer — distant, hazy trees
  ctx.fillStyle = 'rgba(20,35,25,0.7)';
  for (let i = 0; i < 8; i++) {
    const tx = (i * 97 + 20) % w;
    const th = h * (0.32 + (i % 3) * 0.06);
    drawPineTree(ctx, tx, h * 0.72, 14, th, 'rgba(18,30,22,0.85)');
  }
  // mid layer — taller, darker pines
  ctx.fillStyle = '#0a1208';
  for (let i = 0; i < 6; i++) {
    const tx = (i * 83 + 40) % w;
    const th = h * (0.45 + (i % 4) * 0.07);
    drawPineTree(ctx, tx, h * 0.74, 18, th, '#080f06');
  }
  // foreground — large gnarled trees with visible trunks and branches
  for (let i = 0; i < 4; i++) {
    const tx = w * (0.12 + i * 0.27) + Math.sin(i) * 30;
    const th = h * (0.5 + (i % 2) * 0.12);
    drawGnarledTree(ctx, tx, h * 0.95, 16, th, '#050a05');
  }
  // fog wisps
  ctx.fillStyle = 'rgba(80,90,80,0.15)';
  for (let i = 0; i < 4; i++) {
    const fy = h * (0.4 + i * 0.1) + Math.sin(t * 0.5 + i) * 8;
    ctx.fillRect(0, fy, w, 20);
  }
  // glowing eyes in the trees
  const eyePairs = [
    [0.15, 0.3], [0.35, 0.25], [0.6, 0.35], [0.8, 0.3], [0.5, 0.2]
  ];
  for (let i = 0; i < eyePairs.length; i++) {
    const ex = w * eyePairs[i][0];
    const ey = h * eyePairs[i][1];
    const blink = Math.sin(t * 2 + i * 1.7) > -0.3 ? 1 : 0.1;
    ctx.fillStyle = `rgba(255,80,40,${0.6 * blink})`;
    ctx.shadowColor = '#ff5a2a'; ctx.shadowBlur = 8;
    ctx.fillRect(ex - 4, ey, 3, 3);
    ctx.fillRect(ex + 2, ey, 3, 3);
    ctx.shadowBlur = 0;
  }
  // player silhouette walking into the woods
  const px2 = w * (0.3 + p * 0.3);
  const py2 = h * 0.82;
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(px2 - 4, py2 - 8, 8, 12);
  ctx.fillRect(px2 - 3, py2 + 4, 6, 8);
  // cat following
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(px2 - 14, py2 + 4, 6, 4);
  ctx.fillRect(px2 - 11, py2 + 2, 4, 4);
}

// ── A layered pine tree — triangular tiers narrowing toward the top ──
function drawPineTree(ctx, cx, baseY, trunkW, height, color) {
  ctx.fillStyle = color;
  // trunk
  ctx.fillRect(cx - trunkW / 4, baseY - height * 0.15, trunkW / 2, height * 0.15);
  // tiered triangular canopy — 4 overlapping triangles
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const tierTop = i / tiers;
    const tierBottom = (i + 1) / tiers;
    const yTop = baseY - height * tierBottom - height * 0.08;
    const yBot = baseY - height * tierTop;
    const widthAtBottom = trunkW * (3.5 - i * 0.4);
    ctx.beginPath();
    ctx.moveTo(cx, yTop);
    ctx.lineTo(cx - widthAtBottom / 2, yBot);
    ctx.lineTo(cx + widthAtBottom / 2, yBot);
    ctx.closePath();
    ctx.fill();
  }
}

// ── A gnarled tree — thick trunk, spreading branches, sparse canopy ──
function drawGnarledTree(ctx, cx, baseY, trunkW, height, color) {
  ctx.fillStyle = color;
  // tapering trunk — wider at base
  const trunkTop = baseY - height * 0.65;
  ctx.beginPath();
  ctx.moveTo(cx - trunkW * 0.6, baseY);
  ctx.lineTo(cx - trunkW * 0.3, trunkTop);
  ctx.lineTo(cx + trunkW * 0.3, trunkTop);
  ctx.lineTo(cx + trunkW * 0.6, baseY);
  ctx.closePath(); ctx.fill();
  // main branches splitting off near the top
  const branchY = baseY - height * 0.6;
  drawBranch(ctx, cx - trunkW * 0.2, branchY, -0.6, height * 0.35, trunkW * 0.25, color);
  drawBranch(ctx, cx + trunkW * 0.2, branchY, 0.6, height * 0.4, trunkW * 0.28, color);
  drawBranch(ctx, cx - trunkW * 0.1, branchY - height * 0.1, -0.2, height * 0.3, trunkW * 0.2, color);
  drawBranch(ctx, cx + trunkW * 0.15, branchY - height * 0.05, 0.3, height * 0.32, trunkW * 0.22, color);
  // sparse dark canopy — clusters of irregular blobs
  ctx.fillStyle = color;
  const canopyCenters = [
    [cx, trunkTop - height * 0.05],
    [cx - height * 0.12, branchY],
    [cx + height * 0.14, branchY - height * 0.02],
    [cx - height * 0.05, branchY - height * 0.15],
    [cx + height * 0.08, branchY - height * 0.18],
  ];
  for (const [bx, by] of canopyCenters) {
    const r = height * (0.08 + Math.abs(Math.sin(bx)) * 0.04);
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Recursive-ish branch: a tapered line with a couple of sub-branches
function drawBranch(ctx, x, y, angle, length, width, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = width;
  const ex = x + Math.cos(angle - Math.PI / 2) * length;
  const ey = y + Math.sin(angle - Math.PI / 2) * length;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
  // one sub-branch
  ctx.lineWidth = Math.max(1, width * 0.5);
  const subAngle = angle - 0.4;
  const subLen = length * 0.5;
  const sx = ex + Math.cos(subAngle - Math.PI / 2) * subLen;
  const sy = ey + Math.sin(subAngle - Math.PI / 2) * subLen;
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(sx, sy); ctx.stroke();
}