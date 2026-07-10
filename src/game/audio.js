// Procedural ambient audio via Web Audio API — cozy piano/music box + rain/wind
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.rainNode = null;
    this.started = false;
    this.mood = 'cozy'; // cozy | unease
    this.melodyTimer = 0;
    this.scale = [0, 2, 3, 5, 7, 8, 10, 12]; // minor scale
    this.baseNote = 220; // A3
  }

  async start() {
    if (this.started) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.ctx.destination);
      this.started = true;
      this.startRain();
      this.scheduleMelody();
    } catch (e) {
      // audio not available
    }
  }

  setMood(mood) {
    this.mood = mood;
    this.scale = mood === 'unease'
      ? [0, 1, 3, 6, 7, 8, 10, 12]
      : [0, 2, 3, 5, 7, 8, 10, 12];
  }

  setRain(active) {
    if (!this.rainNode) return;
    this.rainNode.gain.setTargetAtTime(active ? 0.08 : 0, this.ctx.currentTime, 0.5);
  }

  startRain() {
    // white noise buffer for rain
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.04;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    noise.start();
    this.rainNode = gain;
  }

  scheduleMelody() {
    if (!this.started) return;
    const play = () => {
      if (!this.started) return;
      this.playNote();
      const interval = 2500 + Math.random() * 4000;
      this.melodyTimer = setTimeout(play, interval);
    };
    this.melodyTimer = setTimeout(play, 1500);
  }

  playNote() {
    if (!this.ctx) return;
    const degree = this.scale[Math.floor(Math.random() * this.scale.length)];
    const octave = Math.random() > 0.5 ? 0 : 12;
    const freq = this.baseNote * Math.pow(2, (degree + octave) / 12);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = this.mood === 'unease' ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 2.6);
    // occasional harmonic
    if (Math.random() > 0.6) {
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 1.5;
      const g2 = this.ctx.createGain();
      g2.gain.setValueAtTime(0, now);
      g2.gain.linearRampToValueAtTime(0.05, now + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 2);
      osc2.connect(g2); g2.connect(this.master);
      osc2.start(now); osc2.stop(now + 2.1);
    }
  }

  playSfx(type) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.master);
    switch (type) {
      case 'step_grass':
        osc.type = 'sine'; osc.frequency.value = 130;
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.09);
        // rustle layer
        {
          const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.06, this.ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.sin(i / d.length * Math.PI);
          const n = this.ctx.createBufferSource(); n.buffer = buf;
          const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000;
          const g2 = this.ctx.createGain();
          g2.gain.setValueAtTime(0.04, now); g2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          n.connect(f); f.connect(g2); g2.connect(this.master);
          n.start(now); n.stop(now + 0.07);
        }
        break;
      case 'step_sand':
        // soft filtered noise crunch
        {
          const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.12, this.ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i / d.length);
          const n = this.ctx.createBufferSource(); n.buffer = buf;
          const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
          const g2 = this.ctx.createGain();
          g2.gain.setValueAtTime(0.07, now); g2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          n.connect(f); f.connect(g2); g2.connect(this.master);
          n.start(now); n.stop(now + 0.13);
        }
        break;
      case 'step_wood':
        osc.type = 'triangle'; osc.frequency.value = 200;
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.11);
        // hollow resonance layer
        {
          const o2 = this.ctx.createOscillator();
          o2.type = 'sine'; o2.frequency.value = 90;
          const g2 = this.ctx.createGain();
          g2.gain.setValueAtTime(0.05, now); g2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          o2.connect(g2); g2.connect(this.master);
          o2.start(now); o2.stop(now + 0.13);
        }
        break;
      case 'step_stone':
        osc.type = 'square'; osc.frequency.value = 160;
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now); osc.stop(now + 0.07);
        break;
      case 'chop':
        osc.type = 'square'; osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.21); break;
      case 'splash':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now); osc.stop(now + 0.36); break;
      case 'catch':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.31); break;
      case 'pickup':
        osc.type = 'square'; osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.21); break;
      case 'hiss':
        osc.type = 'sawtooth'; osc.frequency.value = 3000;
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now); osc.stop(now + 0.41); break;
      case 'bell':
        osc.type = 'sine'; osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.start(now); osc.stop(now + 1.6);
        const o2 = this.ctx.createOscillator();
        o2.type = 'sine'; o2.frequency.value = 990;
        const g2 = this.ctx.createGain(); g2.gain.setValueAtTime(0.05, now);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        o2.connect(g2); g2.connect(this.master); o2.start(now); o2.stop(now + 1.3);
        break;
      default: break;
    }
  }

  // Ambient creature sounds — played when critters flee from the player.
  // volume is 0..1 based on distance (closer = louder).
  playCritterSound(type, volume = 0.5) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const vol = Math.max(0.05, Math.min(0.6, volume * 0.5));

    if (type === 'deer') {
      // Snort — short low burst, alarmed
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain); gain.connect(this.master);
      osc.start(now); osc.stop(now + 0.26);
      // hoofbeats — quick double thud
      for (let i = 0; i < 2; i++) {
        const t = now + i * 0.1;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine'; o.frequency.value = 80;
        g.gain.setValueAtTime(vol * 0.5, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + 0.09);
      }
    } else if (type === 'fox') {
      // Yip — sharp high bark
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.5, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain); gain.connect(this.master);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'crow') {
      // Caw — harsh descending squawk
      for (let i = 0; i < 2; i++) {
        const t = now + i * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.6, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain); gain.connect(this.master);
        osc.start(t); osc.stop(t + 0.13);
      }
      // wing flutter — rapid noise burst
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI * 8);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 2000;
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(vol * 0.3, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      noise.connect(filter); filter.connect(ng); ng.connect(this.master);
      noise.start(now); noise.stop(now + 0.21);
    } else if (type === 'bird') {
      // Chirp flap — ascending twitter + wing beats
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + i * 200, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain); gain.connect(this.master);
        osc.start(t); osc.stop(t + 0.07);
      }
    } else if (type === 'squirrel') {
      // Chitter — rapid high-pitched clicking
      for (let i = 0; i < 5; i++) {
        const t = now + i * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 1500 + (i % 2) * 300;
        gain.gain.setValueAtTime(vol * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(gain); gain.connect(this.master);
        osc.start(t); osc.stop(t + 0.04);
      }
    } else if (type === 'rabbit') {
      // Thump — soft foot stomp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 90;
      gain.gain.setValueAtTime(vol * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain); gain.connect(this.master);
      osc.start(now); osc.stop(now + 0.11);
    }
  }

  stop() {
    if (this.melodyTimer) clearTimeout(this.melodyTimer);
    if (this.ctx) { try { this.ctx.close(); } catch (e) {} }
    this.started = false;
  }
}