// Build placement preview — a pulsing ghost marker showing where an item will be placed.
import * as THREE from 'three';
import { T, TILE_PROPS, BUILDABLES } from './constants';

// Installs build-preview logic: computes target tile each frame (on Game)
// and renders a pulsing ghost marker (on Renderer3D).
export function installBuildPreview(Game, Renderer3D) {
  // ── Engine side: compute preview tile each frame ──
  const origUpdate = Game.prototype.update;
  Game.prototype.update = function (dt) {
    origUpdate.call(this, dt);
    if (this.buildMode) {
      const p = this.state.player;
      const fx = Math.floor(p.x + (p.dir === 3 ? 1 : p.dir === 2 ? -1 : 0));
      const fy = Math.floor(p.y + (p.dir === 0 ? 1 : p.dir === 1 ? -1 : 0));
      const b = BUILDABLES.find(bb => bb.id === this.buildMode);
      let canPlace = false;
      if (b) {
        // Placed buildables can be picked up
        const cur = this.getTile(fx, fy);
        const curProps = TILE_PROPS[cur] || {};
        const isPickup = BUILDABLES.some(bb => bb.tile === cur);
        const validTile = isPickup || !(curProps.solid || curProps.water);
        const hasMats = Object.entries(b.cost).every(([item, c]) => this.hasItem(item, c));
        canPlace = validTile && (isPickup || hasMats);
      }
      this.state._buildPreviewTile = { x: fx, y: fy, canPlace };
    } else if (this.state._buildPreviewTile) {
      this.state._buildPreviewTile = null;
    }
  };

  const origRender = Renderer3D.prototype.render;

  // Ensure the preview mesh group exists
  Renderer3D.prototype._ensureBuildPreview = function () {
    if (this._buildPreview) return;
    const group = new THREE.Group();

    // Translucent box — represents the tile footprint
    const boxGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0x66ff88,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 0.45;
    group.add(box);
    this._buildPreviewBox = box;

    // Wireframe outline
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x88ffaa, transparent: true, opacity: 0.7 });
    const wire = new THREE.LineSegments(edges, lineMat);
    wire.position.y = 0.45;
    group.add(wire);
    this._buildPreviewWire = wire;

    // Ground ring
    const ringGeo = new THREE.RingGeometry(0.5, 0.62, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x88ffaa, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);
    this._buildPreviewRing = ring;

    group.visible = false;
    this.scene.add(group);
    this._buildPreview = group;
  };

  // Update the preview position and visibility based on engine build state
  Renderer3D.prototype._updateBuildPreview = function (state) {
    this._ensureBuildPreview();
    const group = this._buildPreview;

    if (!state._buildPreviewTile) {
      group.visible = false;
      return;
    }

    const { x, y, canPlace } = state._buildPreviewTile;
    group.position.set(x + 0.5, 0, y + 0.5);
    group.visible = true;

    // Color: green if placeable, red if blocked
    const color = canPlace ? 0x66ff88 : 0xff4444;
    this._buildPreviewBox.material.color.setHex(color);
    this._buildPreviewWire.material.color.setHex(color);
    this._buildPreviewRing.material.color.setHex(color);

    // Pulse
    const pulse = 0.7 + Math.sin(this.clock * 6) * 0.3;
    this._buildPreviewBox.material.opacity = 0.15 + pulse * 0.2;
    this._buildPreviewRing.material.opacity = 0.3 + pulse * 0.3;
  };

  Renderer3D.prototype.render = function (state, zone, tiles, crops, ghosts, enemies, particles, atm, actionState, footprints, fishingState) {
    this._updateBuildPreview(state);
    return origRender.call(this, state, zone, tiles, crops, ghosts, enemies, particles, atm, actionState, footprints, fishingState);
  };

  // ── Pick up a placed buildable: refund materials, restore the tile ──
  Game.prototype.pickupBuildable = function (fx, fy, buildable) {
    for (const item in buildable.cost) {
      this.addItem(item, buildable.cost[item]);
    }
    const baseTile = this.zone.def.interior ? T.FLOOR : T.GRASS;
    this.setTileOverride(fx, fy, baseTile);
    this.audio.playSfx('chop');
    this.spawnImpactParticles(fx + 0.5, fy + 0.3, 'hammer');
    this.showToast(`Picked up ${buildable.name} — materials refunded!`, 3000);
    this.pushState();
    this.save();
  };
}