// Side-view (profile) body rendering for the player character.
// Called by drawPlayer in sprites.js when dir is 2 (left) or 3 (right).
// Draws the body turned to face the walking direction. Tool / fishing-pole
// rendering is handled separately by drawToolInHand / drawFishingPole (already
// direction-aware), so this function draws only the body, head, and hat.

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
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

export function drawPlayerSide(ctx, x, y, s, dir, frame, action, char, bob, leanX, leanY, phase, equippedHat) {
  const time = performance.now() / 1000;

  const shirt = char?.shirt || '#4a6a8a';
  const shirtDark = shade(shirt, -25);
  const pants = char?.pants || '#2e2e3e';
  const skin = char?.skin || '#e0b890';
  const skinShade = shade(skin, -20);
  const hair = char?.hair || '#5a3a1a';
  const hairDark = shade(hair, -25);
  const isGirl = char?.gender === 'girl';

  const facingRight = dir === 3;

  // Mirror the canvas for left-facing so we only need one set of coordinates.
  ctx.save();
  if (facingRight) {
    ctx.translate(x, y);
  } else {
    ctx.translate(x + s, y);
    ctx.scale(-1, 1);
  }

  // leanX already encodes the facing direction (positive = right for dir 3,
  // negative = left for dir 2). After mirroring we always draw right-facing,
  // so use abs(leanX) as the forward lean.
  const leanFwd = Math.abs(leanX);

  // ---- legs: front leg leads, back leg trails ----
  const legBrace = phase >= 0 ? [-0.03, 0.01, 0.05, 0.01][phase] : 0;
  const legOff = legBrace * s;
  const walkOff = action === 'walk' ? [0, s * 0.07, 0, -s * 0.07][frame % 4] : 0;

  if (isGirl) {
    // dress skirt — flares from waist, covers upper legs in profile
    px(ctx, s * 0.30 + leanFwd * 0.3, s * 0.56 + bob, s * 0.36, s * 0.22, shirt);
    px(ctx, s * 0.28 + leanFwd * 0.3, s * 0.72 + bob, s * 0.40, s * 0.06, shirtDark);
    // lower legs below the dress
    px(ctx, s * 0.34 - legOff, s * 0.78 + bob, s * 0.12, s * 0.12, shade(pants, -10));
    px(ctx, s * 0.34 - legOff, s * 0.88 + bob, s * 0.12, s * 0.06, '#1a1a1e');
    px(ctx, s * 0.50 + legOff + walkOff, s * 0.78 + bob, s * 0.12, s * 0.12, pants);
    px(ctx, s * 0.50 + legOff + walkOff, s * 0.88 + bob, s * 0.12, s * 0.06, '#1a1a1e');
  } else {
    // back leg (trailing — behind the body)
    px(ctx, s * 0.34 - legOff, s * 0.70 + bob, s * 0.12, s * 0.22, shade(pants, -10));
    px(ctx, s * 0.34 - legOff, s * 0.88 + bob, s * 0.12, s * 0.06, '#1a1a1e');
    // front leg (leading — in front of the body, shifts with walk cycle)
    px(ctx, s * 0.50 + legOff + walkOff, s * 0.70 + bob, s * 0.12, s * 0.22, pants);
    px(ctx, s * 0.50 + legOff + walkOff, s * 0.88 + bob, s * 0.12, s * 0.06, '#1a1a1e');
  }

  // ---- torso: narrower in profile, leans forward ----
  px(ctx, s * 0.36 + leanFwd * 0.5, s * 0.40 + bob, s * 0.30, s * 0.35, shirt);
  px(ctx, s * 0.36 + leanFwd * 0.5, s * 0.65 + bob, s * 0.30, s * 0.06, shirtDark);

  // backpack — visible on the back (left side when facing right)
  px(ctx, s * 0.26 + leanFwd * 0.3, s * 0.42 + bob, s * 0.10, s * 0.20, '#4a3a28');
  px(ctx, s * 0.28 + leanFwd * 0.3, s * 0.40 + bob, s * 0.08, s * 0.04, '#3a2a1a');
  // backpack strap across chest
  px(ctx, s * 0.40 + leanFwd * 0.5, s * 0.40 + bob, s * 0.16, s * 0.03, '#3a2a1a');

  // belt with buckle
  px(ctx, s * 0.36 + leanFwd * 0.5, s * 0.62 + bob, s * 0.30, s * 0.05, shade(pants, -15));
  px(ctx, s * 0.46 + leanFwd * 0.5, s * 0.63 + bob, s * 0.05, s * 0.03, '#8a7a4a');

  // ---- arm: front arm reaches forward with tool ----
  const armEngage = phase >= 0 ? [0.3, 0.6, 1.0, 0.5][phase] : 0;
  const armReach = armEngage * s * 0.08;
  px(ctx, s * 0.54 + leanFwd * 0.5 + armReach, s * 0.42 + bob, s * 0.09, s * 0.22, shirt);
  px(ctx, s * 0.54 + leanFwd * 0.5 + armReach, s * 0.62 + bob, s * 0.09, s * 0.06, skin);

  // ---- head: profile facing right ----
  px(ctx, s * 0.38 + leanFwd, s * 0.12 + bob, s * 0.34, s * 0.32, skin);
  px(ctx, s * 0.38 + leanFwd, s * 0.38 + bob, s * 0.34, s * 0.06, skinShade);
  // nose — small bump on the front of the face
  px(ctx, s * 0.70 + leanFwd, s * 0.24 + bob, s * 0.05, s * 0.05, skinShade);

  // ---- hair: covers top, flows backward ----
  const hairLen = isGirl ? 0.18 : 0.12;
  px(ctx, s * 0.36 + leanFwd, s * 0.08 + bob, s * 0.38, s * hairLen, hair);
  px(ctx, s * 0.36 + leanFwd, s * 0.06 + bob, s * 0.38, s * 0.04, hairDark);
  // hair flowing toward the back
  if (isGirl) {
    // long hair flowing down the back past shoulders
    px(ctx, s * 0.24 + leanFwd, s * 0.12 + bob, s * 0.14, s * 0.36, hair);
    px(ctx, s * 0.22 + leanFwd, s * 0.10 + bob, s * 0.06, s * 0.04, hairDark);
    px(ctx, s * 0.26 + leanFwd, s * 0.44 + bob, s * 0.10, s * 0.06, hairDark);
  } else {
    px(ctx, s * 0.30 + leanFwd, s * 0.16 + bob, s * 0.10, s * 0.14, hair);
  }

  // ---- eye: single eye on the facing side ----
  const blink = Math.sin(time * 0.5) > 0.96;
  if (blink) {
    px(ctx, s * 0.60 + leanFwd, s * 0.26 + bob, s * 0.05, s * 0.02, '#2a2a2a');
  } else {
    px(ctx, s * 0.60 + leanFwd, s * 0.24 + bob, s * 0.05, s * 0.05, '#2a2a2a');
  }

  // ---- deer antler crown: side view ----
  if (equippedHat === 'deer_antler_crown') {
    px(ctx, s * 0.36 + leanFwd, s * 0.04 + bob, s * 0.38, s * 0.05, '#6a4a2a');
    px(ctx, s * 0.36 + leanFwd, s * 0.04 + bob, s * 0.38, s * 0.02, '#9a7a4a');
    // front antler
    px(ctx, s * 0.58 + leanFwd, s * 0.0 + bob, s * 0.04, s * 0.10, '#8a7a5a');
    px(ctx, s * 0.62 + leanFwd, s * 0.02 + bob, s * 0.04, s * 0.04, '#8a7a5a');
    // back antler
    px(ctx, s * 0.40 + leanFwd, s * 0.0 + bob, s * 0.04, s * 0.08, '#8a7a5a');
    px(ctx, s * 0.36 + leanFwd, s * 0.02 + bob, s * 0.04, s * 0.04, '#8a7a5a');
  }

  ctx.restore();
}