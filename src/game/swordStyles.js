// Sword blade rendering — varies by equipped weapon tier.
// Each function draws in local space from the handle end (ey, 0=handle end).

export function drawSwordBlade(ctx, s, ey, hDark, hc, weapon) {
  const bladeLen = s * 0.32;
  if (weapon === 'vampiric_sword') {
    // crimson serrated blade with dark aura
    ctx.fillStyle = '#3a0a0a';
    ctx.fillRect(-s * 0.05, ey, s * 0.10, bladeLen);
    ctx.fillStyle = '#8a1a2a';
    ctx.fillRect(-s * 0.04, ey, s * 0.08, bladeLen);
    ctx.fillStyle = '#c4404a';
    ctx.fillRect(-s * 0.015, ey, s * 0.02, bladeLen);
    // serrated edge — jagged teeth
    ctx.fillStyle = '#6a0a1a';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-s * 0.05, ey + i * s * 0.06, s * 0.02, s * 0.03);
      ctx.fillRect(s * 0.03, ey + i * s * 0.06 + s * 0.03, s * 0.02, s * 0.03);
    }
    // hooked tip
    ctx.fillStyle = '#3a0a0a';
    ctx.beginPath();
    ctx.moveTo(-s * 0.04, ey + bladeLen);
    ctx.lineTo(s * 0.06, ey + bladeLen + s * 0.04);
    ctx.lineTo(0, ey + bladeLen + s * 0.10);
    ctx.closePath();
    ctx.fill();
    // crossguard — dark iron with ruby
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(-s * 0.12, ey - s * 0.02, s * 0.24, s * 0.05);
    ctx.fillStyle = '#cc1a3a';
    ctx.fillRect(-s * 0.02, ey - s * 0.01, s * 0.04, s * 0.03);
    // pommel
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(-s * 0.035, -s * 0.05, s * 0.07, s * 0.05);
  } else if (weapon === 'ancient_blade') {
    // ornate golden blade with glowing runes
    ctx.fillStyle = '#5a4a1a';
    ctx.fillRect(-s * 0.05, ey, s * 0.10, bladeLen);
    ctx.fillStyle = '#d4a838';
    ctx.fillRect(-s * 0.04, ey, s * 0.08, bladeLen);
    ctx.fillStyle = '#f4e068';
    ctx.fillRect(-s * 0.015, ey, s * 0.02, bladeLen);
    // glowing runes
    ctx.fillStyle = '#aaffcc';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-s * 0.03, ey + s * 0.05 + i * s * 0.08, s * 0.01, s * 0.03);
      ctx.fillRect(s * 0.02, ey + s * 0.05 + i * s * 0.08, s * 0.01, s * 0.03);
    }
    // wavy tip
    ctx.fillStyle = '#d4a838';
    ctx.beginPath();
    ctx.moveTo(-s * 0.04, ey + bladeLen);
    ctx.quadraticCurveTo(s * 0.02, ey + bladeLen + s * 0.04, 0, ey + bladeLen + s * 0.10);
    ctx.quadraticCurveTo(-s * 0.02, ey + bladeLen + s * 0.04, -s * 0.04, ey + bladeLen);
    ctx.fill();
    // ornate crossguard
    ctx.fillStyle = '#c49a28';
    ctx.fillRect(-s * 0.12, ey - s * 0.02, s * 0.24, s * 0.05);
    ctx.fillStyle = '#f4c46a';
    ctx.fillRect(-s * 0.12, ey - s * 0.02, s * 0.24, s * 0.012);
    // pommel with gem
    ctx.fillStyle = '#c49a28';
    ctx.fillRect(-s * 0.035, -s * 0.05, s * 0.07, s * 0.05);
    ctx.fillStyle = '#aaffcc';
    ctx.fillRect(-s * 0.015, -s * 0.04, s * 0.03, s * 0.03);
  } else if (weapon === 'steel_sword') {
    // bright steel blade with wider fuller
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(-s * 0.045, ey, s * 0.09, bladeLen + s * 0.02);
    ctx.fillStyle = '#b0b0c4';
    ctx.fillRect(-s * 0.035, ey, s * 0.07, bladeLen + s * 0.02);
    ctx.fillStyle = '#e0e0f0';
    ctx.fillRect(-s * 0.015, ey, s * 0.025, bladeLen + s * 0.02);
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(-s * 0.008, ey + s * 0.02, s * 0.01, bladeLen - s * 0.06);
    // reinforced tip
    ctx.fillStyle = '#6a6a7a';
    ctx.beginPath();
    ctx.moveTo(-s * 0.035, ey + bladeLen + s * 0.02);
    ctx.lineTo(s * 0.035, ey + bladeLen + s * 0.02);
    ctx.lineTo(0, ey + bladeLen + s * 0.10);
    ctx.closePath();
    ctx.fill();
    // silver crossguard
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(-s * 0.11, ey - s * 0.02, s * 0.22, s * 0.045);
    ctx.fillStyle = '#c0c0d0';
    ctx.fillRect(-s * 0.11, ey - s * 0.02, s * 0.22, s * 0.012);
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(-s * 0.035, -s * 0.05, s * 0.07, s * 0.05);
  } else {
    // default iron sword — basic blade
    ctx.fillStyle = hDark;
    ctx.fillRect(-s * 0.045, ey, s * 0.09, bladeLen);
    ctx.fillStyle = hc;
    ctx.fillRect(-s * 0.035, ey, s * 0.07, bladeLen);
    ctx.fillStyle = '#e8e8f0';
    ctx.fillRect(-s * 0.015, ey, s * 0.025, bladeLen);
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(-s * 0.008, ey + s * 0.02, s * 0.008, bladeLen - s * 0.08);
    // pointed tip
    ctx.fillStyle = hDark;
    ctx.beginPath();
    ctx.moveTo(-s * 0.035, ey + bladeLen);
    ctx.lineTo(s * 0.035, ey + bladeLen);
    ctx.lineTo(0, ey + bladeLen + s * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hc;
    ctx.beginPath();
    ctx.moveTo(-s * 0.025, ey + bladeLen);
    ctx.lineTo(s * 0.025, ey + bladeLen);
    ctx.lineTo(0, ey + bladeLen + s * 0.06);
    ctx.closePath();
    ctx.fill();
    // crossguard
    ctx.fillStyle = '#d4a04a';
    ctx.fillRect(-s * 0.1, ey - s * 0.02, s * 0.2, s * 0.04);
    ctx.fillStyle = '#f4c46a';
    ctx.fillRect(-s * 0.1, ey - s * 0.02, s * 0.2, s * 0.012);
    // pommel
    ctx.fillStyle = '#d4a04a';
    ctx.fillRect(-s * 0.03, -s * 0.05, s * 0.06, s * 0.05);
    ctx.fillStyle = '#f4c46a';
    ctx.fillRect(-s * 0.02, -s * 0.04, s * 0.02, s * 0.03);
  }
}