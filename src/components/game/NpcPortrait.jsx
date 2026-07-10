import React, { useRef, useEffect } from 'react';

// Highly detailed NPC portraits drawn procedurally on canvas.
// Patricia, Nikki, and Luna are rendered as strikingly attractive.
const PORTRAITS = {
  patricia: drawPatricia,
  nikki: drawNikki,
  luna: drawLuna,
  rowan: drawRowan,
  willow: drawWillow,
  finn: drawFinn,
  dante: drawDante,
  mabel: drawMabel,
  mayor: drawMayor,
  bartender: drawBartender,
  fishmonger: drawFishmonger,
  wren: drawWren,
};

export default function NpcPortrait({ npcId, size = 128 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    const fn = PORTRAITS[npcId] || drawGeneric;
    fn(ctx, size);
  }, [npcId, size]);
  return <canvas ref={canvasRef} width={size} height={size} className="rounded-lg flex-shrink-0" style={{ width: size, height: size }} />;
}

// ── helpers ──
function bg(ctx, s, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, s, s); }
function radial(ctx, s, c1, c2) {
  const g = ctx.createRadialGradient(s/2, s*0.3, s*0.05, s/2, s*0.5, s*0.7);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
}

// ── PATRICIA — wild beauty, flowing purple hair, mesmerizing eyes ──
function drawPatricia(ctx, s) {
  radial(ctx, s, '#4a2a5a', '#1a0a22');
  // flowing wild purple hair
  ctx.fillStyle = '#6a3a8a';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.45, s*0.42, s*0.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#7a4a9a';
  ctx.beginPath();
  ctx.moveTo(s*0.12, s*0.3); ctx.quadraticCurveTo(s*0.1, s*0.7, s*0.2, s*0.95);
  ctx.lineTo(s*0.3, s*0.95); ctx.quadraticCurveTo(s*0.2, s*0.6, s*0.25, s*0.35); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*0.88, s*0.3); ctx.quadraticCurveTo(s*0.9, s*0.7, s*0.8, s*0.95);
  ctx.lineTo(s*0.7, s*0.95); ctx.quadraticCurveTo(s*0.8, s*0.6, s*0.75, s*0.35); ctx.fill();
  // face — beautiful heart shape
  ctx.fillStyle = '#e8c8a8';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.5, s*0.22, s*0.26, 0, 0, Math.PI*2); ctx.fill();
  // cheek blush
  ctx.fillStyle = 'rgba(200,100,130,0.35)';
  ctx.beginPath(); ctx.ellipse(s*0.4, s*0.56, s*0.05, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.6, s*0.56, s*0.05, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  // striking violet eyes
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s*0.42, s*0.48, s*0.04, s*0.05, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.58, s*0.48, s*0.04, s*0.05, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8a3acc';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.49, s*0.025, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.49, s*0.025, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a0a2a';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.49, s*0.012, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.49, s*0.012, 0, Math.PI*2); ctx.fill();
  // long lashes
  ctx.strokeStyle = '#1a0a2a'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(s*(0.39+i*0.01), s*0.44); ctx.lineTo(s*(0.38+i*0.01), s*0.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*(0.61-i*0.01), s*0.44); ctx.lineTo(s*(0.62-i*0.01), s*0.42); ctx.stroke();
  }
  // delicate nose
  ctx.strokeStyle = 'rgba(160,100,80,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(s*0.5, s*0.52); ctx.lineTo(s*0.49, s*0.56); ctx.stroke();
  // full lips — bold red
  ctx.fillStyle = '#c0405a';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.62, s*0.06, s*0.035, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e0506a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.61, s*0.04, s*0.015, 0, 0, Math.PI*2); ctx.fill();
  // hair strands framing face
  ctx.strokeStyle = '#5a2a7a'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(s*(0.3+i*0.02), s*0.3); ctx.quadraticCurveTo(s*(0.28+i*0.02), s*0.5, s*(0.3+i*0.02), s*0.65); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*(0.7-i*0.02), s*0.3); ctx.quadraticCurveTo(s*(0.72-i*0.02), s*0.5, s*(0.7-i*0.02), s*0.65); ctx.stroke();
  }
  // glowing firefly lights around her
  ctx.fillStyle = 'rgba(180,200,100,0.8)';
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    ctx.beginPath(); ctx.arc(s*0.5+Math.cos(a)*s*0.4, s*0.4+Math.sin(a)*s*0.3, 2, 0, Math.PI*2); ctx.fill();
  }
}

// ── NIKKI — dangerously beautiful, pale, dark hair, intense gaze ──
function drawNikki(ctx, s) {
  radial(ctx, s, '#2a1a2a', '#0a0508');
  // long straight black hair
  ctx.fillStyle = '#1a0a1a';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.5, s*0.4, s*0.52, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillRect(s*0.15, s*0.4, s*0.1, s*0.55);
  ctx.fillRect(s*0.75, s*0.4, s*0.1, s*0.55);
  // pale flawless face
  ctx.fillStyle = '#f0dccc';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.5, s*0.21, s*0.26, 0, 0, Math.PI*2); ctx.fill();
  // dark eye makeup
  ctx.fillStyle = 'rgba(80,40,60,0.3)';
  ctx.beginPath(); ctx.ellipse(s*0.42, s*0.49, s*0.05, s*0.025, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.58, s*0.49, s*0.05, s*0.025, 0, 0, Math.PI*2); ctx.fill();
  // intense pink-red eyes
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s*0.42, s*0.49, s*0.035, s*0.045, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.58, s*0.49, s*0.035, s*0.045, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d0406a';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.5, s*0.022, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.5, s*0.022, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a0a1a';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.5, s*0.011, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.5, s*0.011, 0, Math.PI*2); ctx.fill();
  // eye highlight
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(s*0.425, s*0.49, s*0.008, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.585, s*0.49, s*0.008, 0, Math.PI*2); ctx.fill();
  // delicate nose
  ctx.strokeStyle = 'rgba(180,140,130,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(s*0.5, s*0.53); ctx.lineTo(s*0.49, s*0.57); ctx.stroke();
  // soft pink lips — slight knowing smile
  ctx.fillStyle = '#c0607a';
  ctx.beginPath();
  ctx.moveTo(s*0.45, s*0.62); ctx.quadraticCurveTo(s*0.5, s*0.64, s*0.55, s*0.62);
  ctx.quadraticCurveTo(s*0.5, s*0.645, s*0.45, s*0.62); ctx.fill();
  // dark hair framing — a strand across face
  ctx.strokeStyle = '#0a0510'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(s*0.3, s*0.25); ctx.quadraticCurveTo(s*0.4, s*0.5, s*0.35, s*0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.7, s*0.25); ctx.quadraticCurveTo(s*0.6, s*0.5, s*0.65, s*0.7); ctx.stroke();
  // red ribbon in hair
  ctx.fillStyle = '#c0405a';
  ctx.beginPath(); ctx.moveTo(s*0.35, s*0.2); ctx.lineTo(s*0.3, s*0.15); ctx.lineTo(s*0.4, s*0.18); ctx.lineTo(s*0.42, s*0.25); ctx.fill();
  // eerie glow behind her
  ctx.fillStyle = 'rgba(200,80,120,0.15)';
  ctx.beginPath(); ctx.arc(s*0.5, s*0.4, s*0.35, 0, Math.PI*2); ctx.fill();
}

// ── LUNA — ethereal crystal witch, silver-violet hair, luminous ──
function drawLuna(ctx, s) {
  radial(ctx, s, '#2a2a5a', '#0a0a2a');
  // crescent moon glow behind
  ctx.fillStyle = 'rgba(180,180,255,0.2)';
  ctx.beginPath(); ctx.arc(s*0.5, s*0.4, s*0.38, 0, Math.PI*2); ctx.fill();
  // flowing silver-violet hair
  ctx.fillStyle = '#9a8aba';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.45, s*0.42, s*0.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#aaa0ca';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(s*(0.2+i*0.04), s*0.3); ctx.quadraticCurveTo(s*(0.18+i*0.04), s*0.6, s*(0.22+i*0.04), s*0.9); ctx.lineTo(s*(0.27+i*0.04), s*0.9); ctx.quadraticCurveTo(s*(0.25+i*0.04), s*0.6, s*(0.27+i*0.04), s*0.3); ctx.fill();
  }
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(s*(0.8-i*0.04), s*0.3); ctx.quadraticCurveTo(s*(0.82-i*0.04), s*0.6, s*(0.78-i*0.04), s*0.9); ctx.lineTo(s*(0.73-i*0.04), s*0.9); ctx.quadraticCurveTo(s*(0.75-i*0.04), s*0.6, s*(0.73-i*0.04), s*0.3); ctx.fill();
  }
  // ethereal pale face
  ctx.fillStyle = '#e8dcea';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.5, s*0.21, s*0.26, 0, 0, Math.PI*2); ctx.fill();
  // luminous amethyst eyes — glowing
  ctx.fillStyle = 'rgba(170,130,255,0.3)';
  ctx.beginPath(); ctx.ellipse(s*0.42, s*0.48, s*0.05, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.58, s*0.48, s*0.05, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c8a0ff';
  ctx.beginPath(); ctx.ellipse(s*0.42, s*0.49, s*0.035, s*0.045, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.58, s*0.49, s*0.035, s*0.045, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#6a3aaa';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.49, s*0.02, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.49, s*0.02, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(s*0.425, s*0.485, s*0.009, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.585, s*0.485, s*0.009, 0, Math.PI*2); ctx.fill();
  // delicate brows
  ctx.strokeStyle = '#8a7aaa'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(s*0.38, s*0.44); ctx.quadraticCurveTo(s*0.42, s*0.43, s*0.46, s*0.44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.54, s*0.44); ctx.quadraticCurveTo(s*0.58, s*0.43, s*0.62, s*0.44); ctx.stroke();
  // tiny nose
  ctx.strokeStyle = 'rgba(160,140,160,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(s*0.5, s*0.53); ctx.lineTo(s*0.49, s*0.56); ctx.stroke();
  // soft mauve lips
  ctx.fillStyle = '#b0809a';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.62, s*0.055, s*0.03, 0, 0, Math.PI*2); ctx.fill();
  // crystal circlet on forehead
  ctx.fillStyle = '#a080ff';
  ctx.beginPath(); ctx.moveTo(s*0.46, s*0.38); ctx.lineTo(s*0.5, s*0.34); ctx.lineTo(s*0.54, s*0.38); ctx.fill();
  ctx.fillStyle = '#e0c0ff';
  ctx.beginPath(); ctx.arc(s*0.5, s*0.37, s*0.012, 0, Math.PI*2); ctx.fill();
  // floating crystal sparkles
  ctx.fillStyle = 'rgba(200,170,255,0.9)';
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const r = s*0.38 + (i%2)*s*0.05;
    ctx.beginPath(); ctx.arc(s*0.5+Math.cos(a)*r, s*0.4+Math.sin(a)*s*0.3, 1.5, 0, Math.PI*2); ctx.fill();
  }
}

// ── Generic/fallback portrait ──
function drawGeneric(ctx, s, skin='#e0b890', hair='#5a3a1a', shirt='#4a6a8a') {
  radial(ctx, s, '#3a3a4a', '#1a1a2a');
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.4, s*0.28, s*0.25, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.5, s*0.2, s*0.24, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(s*0.43, s*0.49, s*0.025, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.57, s*0.49, s*0.025, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(s*0.43, s*0.49, s*0.012, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.57, s*0.49, s*0.012, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#aa5a5a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.6, s*0.05, s*0.025, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = shirt;
  ctx.fillRect(s*0.3, s*0.7, s*0.4, s*0.3);
}

function drawRowan(ctx, s) {
  drawGeneric(ctx, s, '#d4a878', '#3a2a1a', '#5a4a3a');
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(s*0.38, s*0.72, s*0.06, s*0.04);
  ctx.fillRect(s*0.56, s*0.72, s*0.06, s*0.04);
}

function drawWillow(ctx, s) {
  radial(ctx, s, '#3a5a3a', '#1a2a1a');
  ctx.fillStyle = '#4a6a3a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.4, s*0.3, s*0.22, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e8c8a8';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.5, s*0.2, s*0.24, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(s*0.43, s*0.49, s*0.028, s*0.035, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.57, s*0.49, s*0.028, s*0.035, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4a8a3a';
  ctx.beginPath(); ctx.arc(s*0.43, s*0.49, s*0.015, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.57, s*0.49, s*0.015, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#b0706a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.6, s*0.05, s*0.025, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#6a9a4a';
  ctx.fillRect(s*0.3, s*0.7, s*0.4, s*0.3);
  ctx.fillStyle = '#8aba5a';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.38, s*0.02, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.36, s*0.02, 0, Math.PI*2); ctx.fill();
}

function drawFinn(ctx, s) {
  radial(ctx, s, '#2a4a6a', '#0a1a2a');
  ctx.fillStyle = '#5a3a2a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.38, s*0.28, s*0.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d8a878';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.5, s*0.2, s*0.24, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(s*0.43, s*0.49, s*0.028, s*0.035, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.57, s*0.49, s*0.028, s*0.035, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a6a8a';
  ctx.beginPath(); ctx.arc(s*0.43, s*0.49, s*0.015, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.57, s*0.49, s*0.015, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#aa7a5a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.6, s*0.055, s*0.025, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4a7aaa';
  ctx.fillRect(s*0.3, s*0.7, s*0.4, s*0.3);
}

function drawDante(ctx, s) {
  radial(ctx, s, '#5a3a3a', '#2a1a1a');
  ctx.fillStyle = '#2a1a1a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.4, s*0.28, s*0.24, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d8a888';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.5, s*0.2, s*0.25, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(s*0.43, s*0.49, s*0.028, s*0.035, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.57, s*0.49, s*0.028, s*0.035, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a2a2a';
  ctx.beginPath(); ctx.arc(s*0.43, s*0.49, s*0.015, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.57, s*0.49, s*0.015, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8a4a4a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.6, s*0.05, s*0.025, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#6a4a3a';
  ctx.fillRect(s*0.3, s*0.7, s*0.4, s*0.3);
  // paint smudge
  ctx.fillStyle = '#cc6a4a';
  ctx.fillRect(s*0.4, s*0.65, s*0.08, s*0.015);
}

function drawMayor(ctx, s) { drawGeneric(ctx, s, '#d4b090', '#6a6a7a', '#4a5a7a'); ctx.fillStyle = '#2a2a4a'; ctx.fillRect(s*0.42, s*0.58, s*0.16, s*0.02); }
function drawBartender(ctx, s) { drawGeneric(ctx, s, '#d4a878', '#4a3a2a', '#6a5a3a'); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(s*0.4, s*0.58, s*0.2, s*0.04); }
function drawWren(ctx, s) { drawGeneric(ctx, s, '#c8a878', '#4a5a3a', '#5a7a4a'); }

// ── MABEL — warm general-store matron, spectacles, brown hair bun ──
function drawMabel(ctx, s) {
  radial(ctx, s, '#5a4a3a', '#2a1a0a');
  // hair bun behind head
  ctx.fillStyle = '#5a3a2a';
  ctx.beginPath(); ctx.ellipse(s*0.5, s*0.3, s*0.18, s*0.14, 0, 0, Math.PI*2); ctx.fill();
  // hair framing face
  ctx.fillStyle = '#6a4a3a';
  ctx.beginPath();
  ctx.moveTo(s*0.2, s*0.35); ctx.quadraticCurveTo(s*0.18, s*0.55, s*0.25, s*0.7);
  ctx.lineTo(s*0.32, s*0.7); ctx.quadraticCurveTo(s*0.28, s*0.5, s*0.3, s*0.38); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*0.8, s*0.35); ctx.quadraticCurveTo(s*0.82, s*0.55, s*0.75, s*0.7);
  ctx.lineTo(s*0.68, s*0.7); ctx.quadraticCurveTo(s*0.72, s*0.5, s*0.7, s*0.38); ctx.fill();
  // warm round face
  ctx.fillStyle = '#e4c8a0';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.5, s*0.23, s*0.26, 0, 0, Math.PI*2); ctx.fill();
  // rosy cheeks
  ctx.fillStyle = 'rgba(200,120,100,0.35)';
  ctx.beginPath(); ctx.ellipse(s*0.38, s*0.57, s*0.06, s*0.045, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.62, s*0.57, s*0.06, s*0.045, 0, 0, Math.PI*2); ctx.fill();
  // spectacles — round wire-frame
  ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(s*0.4, s*0.48, s*0.07, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(s*0.6, s*0.48, s*0.07, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.47, s*0.48); ctx.lineTo(s*0.53, s*0.48); ctx.stroke();
  // eyes behind glasses
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(s*0.4, s*0.48, s*0.038, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.6, s*0.48, s*0.038, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.beginPath(); ctx.arc(s*0.4, s*0.49, s*0.022, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.6, s*0.49, s*0.022, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(s*0.4, s*0.49, s*0.011, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.6, s*0.49, s*0.011, 0, Math.PI*2); ctx.fill();
  // warm smile
  ctx.fillStyle = '#c0605a';
  ctx.beginPath();
  ctx.moveTo(s*0.44, s*0.63); ctx.quadraticCurveTo(s*0.5, s*0.68, s*0.56, s*0.63);
  ctx.quadraticCurveTo(s*0.5, s*0.65, s*0.44, s*0.63); ctx.fill();
  // nose
  ctx.strokeStyle = 'rgba(160,100,70,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(s*0.5, s*0.53); ctx.lineTo(s*0.49, s*0.58); ctx.stroke();
  // shawl collar
  ctx.fillStyle = '#8a5a5a';
  ctx.beginPath();
  ctx.moveTo(s*0.25, s*0.75); ctx.quadraticCurveTo(s*0.5, s*0.8, s*0.75, s*0.75);
  ctx.lineTo(s*0.75, s); ctx.lineTo(s*0.25, s); ctx.fill();
  ctx.fillStyle = '#6a4a4a';
  ctx.fillRect(s*0.25, s*0.78, s*0.5, s*0.04);
  // small pendant
  ctx.fillStyle = '#d4a04a';
  ctx.beginPath(); ctx.arc(s*0.5, s*0.8, s*0.025, 0, Math.PI*2); ctx.fill();
}

// ── BAIT BETTY — weathered fisherwoman, sun-weathered skin, sea-blue cap ──
function drawFishmonger(ctx, s) {
  radial(ctx, s, '#2a4a5a', '#0a1a2a');
  // sea spray glow
  ctx.fillStyle = 'rgba(120,180,220,0.15)';
  ctx.beginPath(); ctx.arc(s*0.5, s*0.4, s*0.4, 0, Math.PI*2); ctx.fill();
  // windblown hair under cap
  ctx.fillStyle = '#4a3a2a';
  ctx.beginPath();
  ctx.moveTo(s*0.2, s*0.38); ctx.quadraticCurveTo(s*0.15, s*0.55, s*0.22, s*0.72);
  ctx.lineTo(s*0.3, s*0.72); ctx.quadraticCurveTo(s*0.24, s*0.5, s*0.3, s*0.4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*0.8, s*0.38); ctx.quadraticCurveTo(s*0.85, s*0.55, s*0.78, s*0.72);
  ctx.lineTo(s*0.7, s*0.72); ctx.quadraticCurveTo(s*0.76, s*0.5, s*0.7, s*0.4); ctx.fill();
  // weathered sun-baked face
  ctx.fillStyle = '#d8a878';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.5, s*0.22, s*0.25, 0, 0, Math.PI*2); ctx.fill();
  // freckles
  ctx.fillStyle = 'rgba(120,70,40,0.5)';
  for (let i = 0; i < 12; i++) {
    const fx = s*(0.32 + Math.random()*0.36);
    const fy = s*(0.44 + Math.random()*0.15);
    ctx.beginPath(); ctx.arc(fx, fy, 1, 0, Math.PI*2); ctx.fill();
  }
  // sunburn on cheeks
  ctx.fillStyle = 'rgba(180,90,60,0.3)';
  ctx.beginPath(); ctx.ellipse(s*0.37, s*0.56, s*0.05, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.63, s*0.56, s*0.05, s*0.04, 0, 0, Math.PI*2); ctx.fill();
  // sea-blue knit cap
  ctx.fillStyle = '#3a7aaa';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.32, s*0.28, s*0.16, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(s*0.22, s*0.3, s*0.56, s*0.06);
  ctx.fillStyle = '#4a8aba';
  ctx.beginPath();
  ctx.ellipse(s*0.5, s*0.3, s*0.28, s*0.1, 0, Math.PI, 0); ctx.fill();
  // cap pompom
  ctx.fillStyle = '#d4c4a4';
  ctx.beginPath(); ctx.arc(s*0.5, s*0.2, s*0.04, 0, Math.PI*2); ctx.fill();
  // bright sea-green eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(s*0.42, s*0.48, s*0.038, s*0.042, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.58, s*0.48, s*0.038, s*0.042, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3aaa8a';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.49, s*0.022, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.49, s*0.022, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0a2a2a';
  ctx.beginPath(); ctx.arc(s*0.42, s*0.49, s*0.011, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(s*0.58, s*0.49, s*0.011, 0, Math.PI*2); ctx.fill();
  // crinkled smile — weathered
  ctx.strokeStyle = '#8a5a3a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(s*0.43, s*0.63); ctx.quadraticCurveTo(s*0.5, s*0.67, s*0.57, s*0.63); ctx.stroke();
  // laugh lines
  ctx.strokeStyle = 'rgba(140,80,50,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(s*0.36, s*0.55); ctx.lineTo(s*0.34, s*0.62); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.64, s*0.55); ctx.lineTo(s*0.66, s*0.62); ctx.stroke();
  // nose
  ctx.strokeStyle = 'rgba(160,100,70,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(s*0.5, s*0.53); ctx.lineTo(s*0.49, s*0.58); ctx.stroke();
  // rain slicker collar
  ctx.fillStyle = '#d4a030';
  ctx.beginPath();
  ctx.moveTo(s*0.22, s*0.75); ctx.quadraticCurveTo(s*0.5, s*0.82, s*0.78, s*0.75);
  ctx.lineTo(s*0.78, s); ctx.lineTo(s*0.22, s); ctx.fill();
  ctx.fillStyle = '#e4b440';
  ctx.fillRect(s*0.22, s*0.78, s*0.56, s*0.03);
  // fish hook on lapel
  ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(s*0.35, s*0.85, s*0.02, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.35, s*0.83); ctx.lineTo(s*0.35, s*0.88); ctx.stroke();
}