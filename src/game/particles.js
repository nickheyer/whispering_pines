// Particle effect spawners — extracted from engine.js to keep file size manageable.
import { ITEMS } from './constants';

export function installParticles(Game) {
  Game.prototype.spawnHeartParticles = function (x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.3,
        y: y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -1.2 - Math.random() * 0.6,
        life: 1.0 + Math.random() * 0.5,
        maxLife: 1.5,
        color: '#e0506a',
        size: 3 + Math.random() * 2,
        heart: true,
      });
    }
  };

  Game.prototype.spawnImpactParticles = function (x, y, toolId) {
    const palettes = {
      axe: ['#8a5a3a', '#6a4a2a', '#4a3a1a', '#3a2818'],
      sword: ['#e8e8f0', '#c4c4d4', '#ffffff', '#a0a0b0'],
      hoe: ['#4a3828', '#3a2818', '#6a4a2a', '#5a3820'],
      pickaxe: ['#6a6a74', '#8a8a94', '#4a4a4e', '#9a9aa4'],
      watering_can: ['#6ab4e0', '#8ac4e8', '#4a9ac8', '#a0d0f0'],
      shovel: ['#4a3828', '#3a2818', '#6a4a2a'],
      fishing_rod: ['#6ab4e0', '#8ac4e8', '#a0d0f0'],
      hammer: ['#9a7a5a', '#7a5a3a', '#aa8a6a'],
      hands: ['#8a8a94', '#a4a4ae'],
    };
    const cols = palettes[toolId] || ['#ffffff'];
    const count = toolId === 'sword' ? 6 : 10;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.5;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 1.5,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        color: cols[Math.floor(Math.random() * cols.length)],
        size: 2 + Math.random() * 3,
      });
    }
  };

  Game.prototype.spawnPickupParticles = function (x, y, itemType, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.3,
        y: y + (Math.random() - 0.5) * 0.3,
        height: 0,
        vx: Math.cos(ang) * (0.4 + Math.random() * 0.3),
        vz: Math.sin(ang) * (0.4 + Math.random() * 0.3),
        vh: 2.5 + Math.random() * 1.5,
        life: 4.0,
        maxLife: 4.0,
        color: ITEMS[itemType]?.color || '#8a5a3a',
        size: 5,
        pickup: true,
        itemType,
        delay: 0.25 + Math.random() * 0.2,
        collected: false,
      });
    }
  };
}