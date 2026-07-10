// Enhances ground objects (clues, antiques, evidence, notes, lore) with a
// pulsing glow halo and gentle bob animation so they're easy to spot from afar.
import * as THREE from 'three';

// RGB triplet string for the glow color of each object type
function objGlowRGB(type) {
  if (type === 'note' || type === 'clue') return '255,220,120';       // warm gold
  if (type === 'antique') return '255,180,80';                         // amber
  if (type && type.startsWith('evidence_')) return '120,220,255';     // cyan investigation
  if (type === 'lore') return '200,140,255';                           // purple
  if (type === 'footprints') return '120,160,200';                     // cool blue
  return '255,220,120';                                                // default gold
}

export function installObjectVisuals(Renderer3D) {
  // After _buildEntities creates object sprites, enlarge them, lift them off
  // the ground, and attach a pulsing glow halo to each.
  const origBuild = Renderer3D.prototype._buildEntities;
  Renderer3D.prototype._buildEntities = function (zone) {
    origBuild.call(this, zone);
    for (const entry of this.entities.objects) {
      const { obj, sprite } = entry;
      sprite.scale.set(0.85, 0.85, 1);
      sprite.position.y = 0.35;
      const glow = this._createSprite(1.6, 1.6);
      glow.position.set(obj.x + 0.5, 0.4, obj.y + 0.5);
      glow.material.blending = THREE.AdditiveBlending;
      glow.material.depthWrite = false;
      this.entityGroup.add(glow);
      entry.glow = glow;
    }
  };

  // After _updateEntities redraws objects, add a gentle bob and pulse the glow.
  const origUpdate = Renderer3D.prototype._updateEntities;
  Renderer3D.prototype._updateEntities = function (s, ghosts, enemies, actionState, particles, footprints, fishingState) {
    origUpdate.call(this, s, ghosts, enemies, actionState, particles, footprints, fishingState);
    for (const entry of this.entities.objects) {
      const { obj, sprite, glow } = entry;
      if (!sprite.visible) continue;
      const t = this.clock + (obj.x + obj.y) * 0.7;
      const bob = 0.35 + Math.sin(t * 2.5) * 0.05;
      sprite.position.y = bob;
      if (glow) {
        glow.position.y = bob + 0.1;
        const pulse = 0.45 + Math.sin(t * 3.2) * 0.3;
        const rgb = objGlowRGB(obj.type);
        const { ctx, texture } = glow.userData;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const grad = ctx.createRadialGradient(
          ctx.canvas.width / 2, ctx.canvas.height / 2, 0,
          ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 2
        );
        grad.addColorStop(0, `rgba(${rgb},${0.4 * pulse})`);
        grad.addColorStop(0.35, `rgba(${rgb},${0.15 * pulse})`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        texture.needsUpdate = true;
      }
    }
  };
}