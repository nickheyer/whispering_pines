// Atmospheric effects: day/night color grading, fog, fireflies, rain, leaves, lantern glow
import { SEASON_LEAVES } from './constants';
import { WEATHER_TYPES } from './weather';

export class Atmosphere {
  constructor() {
    this.fireflies = [];
    this.raindrops = [];
    this.leaves = [];
    this.fogPuffs = [];
    this.butterflies = [];
    this.t = 0;
    this.lightning = 0;
    this.lightningCd = 4;
    this.showerX = 0;
    this.initParticles();
  }

  initParticles() {
    for (let i = 0; i < 90; i++) {
      this.fireflies.push({
        x: Math.random(), y: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.05,
        bright: 0.5 + Math.random() * 0.5,
        hue: Math.random() > 0.7 ? 'amber' : 'green',
      });
    }
    for (let i = 0; i < 200; i++) {
      this.raindrops.push({
        x: Math.random(), y: Math.random(),
        speed: 0.8 + Math.random() * 0.6,
        len: 8 + Math.random() * 10,
      });
    }
    for (let i = 0; i < 40; i++) {
      this.leaves.push({
        x: Math.random(), y: Math.random(),
        vx: -0.02 + Math.random() * 0.01,
        vy: 0.02 + Math.random() * 0.03,
        rot: Math.random() * Math.PI * 2,
        size: 3 + Math.random() * 3,
      });
    }
    for (let i = 0; i < 12; i++) {
      this.fogPuffs.push({
        x: Math.random(), y: Math.random(),
        size: 80 + Math.random() * 120,
        drift: 0.01 + Math.random() * 0.02,
      });
    }
    const bColors = ['#e4a4c4', '#c4e4a4', '#a4c4e4', '#e4c4a4', '#d4b4e4'];
    for (let i = 0; i < 14; i++) {
      this.butterflies.push({
        x: Math.random(), y: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.004,
        color: bColors[Math.floor(Math.random() * bColors.length)],
        size: 2 + Math.random() * 2,
        dirX: Math.random() > 0.5 ? 1 : -1,
        dirY: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  update(dt) {
    this.t += dt;
  }

  // advance weather-driven state (lightning flashes, shower drift)
  tickWeather(dt, weather) {
    const w = WEATHER_TYPES[weather];
    if (w && w.lightning) {
      this.lightningCd -= dt;
      if (this.lightningCd <= 0) {
        this.lightning = 0.55;
        this.lightningCd = 3 + Math.random() * 8;
      }
    }
    if (this.lightning > 0) this.lightning -= dt * 2.5;
    this.showerX += dt * 0.04;
    if (this.showerX > 1.3) this.showerX = -0.3;
  }

  // returns {color: 'rgba(r,g,b,a)', darkness: 0..1}
  // Uses smoothstep easing between color/darkness keyframes so dawn and dusk
  // ease in and out continuously — no abrupt "corner" jumps at phase boundaries.
  dayNight(timeMinutes) {
    const t = timeMinutes;
    // ── Keyframes: [minute, darkness, [r,g,b,a]] ──
    // Colors blend smoothly: deep night blue → dawn amber/pink → clear day →
    // dusk orange/purple → deep night blue.
    const nightCol = [30, 30, 70, 0.5];
    const dawnCol = [120, 70, 60, 0.18];
    const dawnPeakCol = [180, 110, 70, 0.12];
    const dayCol = [0, 0, 0, 0];
    const duskPeakCol = [150, 70, 40, 0.14];
    const duskCol = [60, 35, 75, 0.22];
    const keys = [
      [0,   0.62, nightCol],
      [300, 0.62, nightCol],
      [360, 0.42, dawnCol],
      [405, 0.14, dawnPeakCol],
      [450, 0.05, dayCol],
      [1050, 0.05, dayCol],
      [1095, 0.18, duskPeakCol],
      [1140, 0.40, duskCol],
      [1170, 0.62, nightCol],
      [1440, 0.62, nightCol],
    ];
    // find the surrounding keyframes
    let i = 0;
    while (i < keys.length - 1 && keys[i + 1][0] <= t) i++;
    const k0 = keys[i], k1 = keys[Math.min(i + 1, keys.length - 1)];
    const span = k1[0] - k0[0];
    const raw = span > 0 ? (t - k0[0]) / span : 0;
    // smoothstep — eases in/out so the rate of change is continuous
    const k = raw * raw * (3 - 2 * raw);
    const darkness = k0[1] + (k1[1] - k0[1]) * k;
    const r = k0[2][0] + (k1[2][0] - k0[2][0]) * k;
    const g = k0[2][1] + (k1[2][1] - k0[2][1]) * k;
    const b = k0[2][2] + (k1[2][2] - k0[2][2]) * k;
    const a = k0[2][3] + (k1[2][3] - k0[2][3]) * k;
    return { darkness, tint: `rgba(${r|0},${g|0},${b|0},${a})` };
  }

  isNight(timeMinutes) {
    return timeMinutes < 330 || timeMinutes > 1170;
  }

  renderFog(ctx, vw, vh, intensity, isNight) {
    ctx.save();
    const col = isNight ? 'rgba(80,70,120,' : 'rgba(120,110,150,';
    for (const p of this.fogPuffs) {
      p.x += p.drift * 0.001;
      if (p.x > 1.2) p.x = -0.2;
      const fx = p.x * vw;
      const fy = p.y * vh + Math.sin(this.t * 0.0003 + p.x * 10) * 20;
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, p.size);
      grad.addColorStop(0, col + (intensity * 0.25) + ')');
      grad.addColorStop(1, col + '0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderFireflies(ctx, vw, vh, isNight) {
    if (!isNight) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const f of this.fireflies) {
      f.phase += f.speed * 0.05;
      f.x += Math.sin(f.phase * 0.3) * 0.001;
      f.y += Math.cos(f.phase * 0.2) * 0.0008;
      if (f.x < 0) f.x = 1; if (f.x > 1) f.x = 0;
      if (f.y < 0) f.y = 1; if (f.y > 1) f.y = 0;
      const glow = (Math.sin(f.phase) * 0.5 + 0.5) * f.bright;
      const fx = f.x * vw, fy = f.y * vh;
      const isAmber = f.hue === 'amber';
      const glowCol = isAmber ? `255,200,100` : `200,230,120`;
      const dotCol = isAmber ? `255,220,150` : `220,255,150`;
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, isAmber ? 16 : 12);
      grad.addColorStop(0, `rgba(${glowCol},${glow})`);
      grad.addColorStop(1, `rgba(${glowCol},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, isAmber ? 16 : 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${dotCol},${glow})`;
      ctx.fillRect(fx - 1, fy - 1, 2, 2);
    }
    ctx.restore();
  }

  renderButterflies(ctx, vw, vh, isNight) {
    if (isNight) return;
    ctx.save();
    for (const b of this.butterflies) {
      b.phase += b.speed;
      b.x += Math.sin(b.phase * 0.7) * 0.0015 * b.dirX;
      b.y += Math.cos(b.phase * 0.4) * 0.001 * b.dirY;
      if (b.x < 0) b.x = 1; if (b.x > 1) b.x = 0;
      if (b.y < 0) b.y = 1; if (b.y > 1) b.y = 0;
      const bx = b.x * vw, by = b.y * vh + Math.sin(b.phase * 3) * 8;
      const wing = Math.abs(Math.sin(b.phase * 12));
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(bx - b.size * wing - 0.5, by - 1.5, b.size * wing + 1, 3);
      ctx.fillRect(bx, by - 1.5, b.size * wing + 1, 3);
      ctx.fillStyle = '#3a2a1a';
      ctx.globalAlpha = 0.9;
      ctx.fillRect(bx - 0.5, by - 1, 1.5, 3);
    }
    ctx.restore();
  }

  renderRain(ctx, vw, vh) {
    ctx.save();
    ctx.strokeStyle = 'rgba(150,170,200,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of this.raindrops) {
      d.y += d.speed * 0.02;
      d.x -= d.speed * 0.005;
      if (d.y > 1) { d.y = -0.05; d.x = Math.random(); }
      if (d.x < 0) d.x = 1;
      ctx.moveTo(d.x * vw, d.y * vh);
      ctx.lineTo(d.x * vw - 2, d.y * vh + d.len);
    }
    ctx.stroke();
    ctx.restore();
  }

  // localized drizzle — a narrow rain band drifting across the screen
  renderShower(ctx, vw, vh) {
    ctx.save();
    const bandW = vw * 0.38;
    const bx = this.showerX * vw;
    ctx.beginPath();
    ctx.rect(bx, 0, bandW, vh);
    ctx.clip();
    ctx.strokeStyle = 'rgba(150,170,200,0.32)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of this.raindrops) {
      d.y += d.speed * 0.018;
      d.x -= d.speed * 0.004;
      if (d.y > 1) { d.y = -0.05; d.x = Math.random(); }
      if (d.x < 0) d.x = 1;
      ctx.moveTo(d.x * vw, d.y * vh);
      ctx.lineTo(d.x * vw - 2, d.y * vh + d.len);
    }
    ctx.stroke();
    ctx.restore();
  }

  // heavy storm rain — thick, fast, slanted
  renderStorm(ctx, vw, vh) {
    ctx.save();
    ctx.strokeStyle = 'rgba(140,160,195,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const d of this.raindrops) {
      d.y += d.speed * 0.032;
      d.x -= d.speed * 0.011;
      if (d.y > 1) { d.y = -0.05; d.x = Math.random(); }
      if (d.x < 0) d.x = 1;
      ctx.moveTo(d.x * vw, d.y * vh);
      ctx.lineTo(d.x * vw - 4, d.y * vh + d.len * 1.3);
    }
    ctx.stroke();
    ctx.restore();
  }

  // dense fog — extra puffs + a visibility veil that smothers the woods
  renderHeavyFog(ctx, vw, vh, isNight) {
    ctx.save();
    const col = isNight ? 'rgba(55,45,95,' : 'rgba(95,90,135,';
    // full-screen mist veil
    ctx.fillStyle = col + '0.14)';
    ctx.fillRect(0, 0, vw, vh);
    // extra large slow-drifting puffs
    for (let i = 0; i < 26; i++) {
      const fx = ((i * 0.043 + this.t * 0.00003) % 1.2 - 0.1) * vw;
      const fy = ((i * 0.071) % 1) * vh + Math.sin(this.t * 0.0002 + i) * 30;
      const size = 110 + (i % 5) * 45;
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, size);
      grad.addColorStop(0, col + '0.20)');
      grad.addColorStop(1, col + '0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // weather mood color wash + lightning flash overlay
  renderWeatherTint(ctx, vw, vh, weather, isNight) {
    const w = WEATHER_TYPES[weather];
    if (!w) return;
    const moods = {
      cozy: null,
      mellow: 'rgba(120,130,150,0.06)',
      somber: 'rgba(90,100,120,0.10)',
      eerie: 'rgba(110,100,150,0.10)',
      dread: 'rgba(75,65,105,0.16)',
      unease: 'rgba(70,60,100,0.12)',
    };
    const tint = moods[w.mood];
    if (tint) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, vw, vh);
    }
    // lightning flash
    if (this.lightning > 0) {
      ctx.fillStyle = `rgba(200,210,255,${Math.min(0.6, this.lightning)})`;
      ctx.fillRect(0, 0, vw, vh);
    }
  }

  renderLeaves(ctx, vw, vh, season) {
    const col = SEASON_LEAVES[season] || SEASON_LEAVES.autumn;
    ctx.save();
    ctx.fillStyle = col;
    for (const l of this.leaves) {
      l.x += l.vx * 0.01;
      l.y += l.vy * 0.01;
      l.rot += 0.02;
      if (l.y > 1) { l.y = -0.05; l.x = Math.random(); }
      if (l.x < 0) l.x = 1;
      ctx.save();
      ctx.translate(l.x * vw, l.y * vh);
      ctx.rotate(l.rot);
      ctx.globalAlpha = 0.7;
      ctx.fillRect(-l.size / 2, -l.size / 4, l.size, l.size / 2);
      ctx.restore();
    }
    ctx.restore();
  }

  // lantern glow at night for light-emitting tiles
  renderLightGlow(ctx, lights, camX, camY, TILE_PX, isNight) {
    if (!isNight) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const L of lights) {
      const sx = L.x * TILE_PX - camX + TILE_PX / 2;
      const sy = L.y * TILE_PX - camY + TILE_PX / 2;
      const flick = 0.82 + Math.sin(this.t * 0.01 + L.x * 3) * 0.12 + Math.sin(this.t * 0.03 + L.y) * 0.06;
      const rad = (L.big ? 100 : 65) * flick;
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
      grad.addColorStop(0, `rgba(255,190,90,${0.55 * flick})`);
      grad.addColorStop(0.4, `rgba(255,150,50,${0.25 * flick})`);
      grad.addColorStop(1, 'rgba(255,130,40,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderOverlay(ctx, vw, vh, timeMinutes) {
    const dn = this.dayNight(timeMinutes);
    if (dn.tint && dn.tint !== 'rgba(0,0,0,0)') {
      ctx.fillStyle = dn.tint;
      ctx.fillRect(0, 0, vw, vh);
    }
    // darkness vignette
    if (dn.darkness > 0.1) {
      const grad = ctx.createRadialGradient(vw / 2, vh / 2, vh * 0.3, vw / 2, vh / 2, vh * 0.8);
      grad.addColorStop(0, `rgba(0,0,0,0)`);
      grad.addColorStop(1, `rgba(0,0,10,${dn.darkness})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vw, vh);
    }
  }

  // player's lantern / carried light at night
  renderPlayerLight(ctx, sx, sy, isNight) {
    if (!isNight) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const flick = 0.9 + Math.sin(this.t * 0.012) * 0.1;
    const rad = 90 * flick;
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
    grad.addColorStop(0, `rgba(255,190,100,${0.35 * flick})`);
    grad.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Interior ambiance — cozy warm by day, eerie dim purple by night, with dust motes
  renderInteriorAmbiance(ctx, vw, vh, timeMinutes) {
    const isNight = this.isNight(timeMinutes);
    ctx.save();
    if (isNight) {
      // eerie: dim the room, cold purple tint, but lanterns/stoves still glow
      ctx.fillStyle = 'rgba(20,15,45,0.38)';
      ctx.fillRect(0, 0, vw, vh);
      // subtle vignette — darker in corners
      const grad = ctx.createRadialGradient(vw / 2, vh / 2, vh * 0.2, vw / 2, vh / 2, vh * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(10,5,25,0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vw, vh);
    } else {
      // cozy: warm amber wash, gently dimmed — a firelit room even in daylight
      ctx.fillStyle = 'rgba(60,40,15,0.14)';
      ctx.fillRect(0, 0, vw, vh);
      // soft warm center glow
      const grad = ctx.createRadialGradient(vw / 2, vh / 2, 0, vw / 2, vh / 2, vh * 0.6);
      grad.addColorStop(0, 'rgba(255,200,120,0.06)');
      grad.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vw, vh);
    }
    ctx.restore();

    // dust motes — slow drifting specks visible in warm interior light
    ctx.save();
    const moteCount = isNight ? 6 : 14;
    for (let i = 0; i < moteCount; i++) {
      const mx = ((i * 0.137 + this.t * 0.00003 * (1 + i % 3)) % 1) * vw;
      const my = ((i * 0.211 + this.t * 0.00002 * (1 + i % 2)) % 1) * vh + Math.sin(this.t * 0.0008 + i) * 12;
      const a = isNight ? 0.08 : 0.16;
      ctx.fillStyle = `rgba(255,230,170,${a})`;
      ctx.fillRect(mx, my, 1.5, 1.5);
    }
    ctx.restore();
  }
}