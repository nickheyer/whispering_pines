// Extra 3D structures — shipwreck, waystone, surface portal
// Patched into Renderer3D at runtime to keep renderer3d.js under the line limit.
import * as THREE from 'three';
import { T } from './constants';

export function installExtraStructures(renderer) {
  const proto = Object.getPrototypeOf(renderer);
  const orig = proto._buildTileObject;

  proto._buildTileObject = function(tile, x, z) {
    switch (tile) {
      case T.SHIPWRECK: return this._addShipwreck(x, z);
      case T.WAYSTONE: return this._addWaystone(x, z);
      case T.SURFACE_PORTAL: return this._addSurfacePortal(x, z);
      default: return orig.call(this, tile, x, z);
    }
  };

  proto._addShipwreck = function(x, z) {
    const g = new THREE.Group();
    const hullMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1a, flatShading: true });
    const darkHullMat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a, flatShading: true });
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x5a4a3a, flatShading: true });
    // hull — tilted, half-buried
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.3, 2.2, 8, 1, false, 0, Math.PI * 2, Math.PI * 0.2), hullMat);
    hull.rotation.z = 0.4; hull.position.set(0, 0.4, 0); g.add(hull);
    const hullBot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.25, 2.0, 8, 1, false, 0, Math.PI * 2, Math.PI * 0.3), darkHullMat);
    hullBot.rotation.z = 0.4; hullBot.position.set(0, 0.25, 0); g.add(hullBot);
    // broken deck planks
    for (let i = 0; i < 4; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.8), deckMat);
      plank.position.set(-0.4 + i * 0.25, 0.55, -0.3 + i * 0.1);
      plank.rotation.y = 0.3; g.add(plank);
    }
    // broken mast — leaning
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6), hullMat);
    mast.position.set(0.3, 1.0, 0.2); mast.rotation.z = -0.8; g.add(mast);
    // tattered sail
    const sailMat = new THREE.MeshLambertMaterial({ color: 0xc4b49a, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), sailMat);
    sail.position.set(0.7, 1.3, 0.2); sail.rotation.z = -0.5; sail.rotation.y = 0.3; g.add(sail);
    // scattered debris
    const debrisMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a, flatShading: true });
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.4), debrisMat);
      d.position.set(-0.8 + i * 0.6, 0.05, 0.8 - i * 0.2);
      d.rotation.y = Math.random() * Math.PI; g.add(d);
    }
    // barrel near wreck
    const barrelBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.25, 6), new THREE.MeshLambertMaterial({ color: 0x6a4a2a }));
    barrelBody.position.set(-0.9, 0.12, -0.5); g.add(barrelBody);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addWaystone = function(x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x5a6a8a, emissive: 0x2a3a5a, emissiveIntensity: 0.3, flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x3a4a6a, flatShading: true });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x6aaaff, transparent: true, opacity: 0.85 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.15, 8), darkMat);
    base.position.y = 0.075; g.add(base);
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 7), stoneMat);
    stone.position.y = 0.75; g.add(stone);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 4, 12), runeMat);
    ring.position.y = 0.9; ring.rotation.x = Math.PI / 2; g.add(ring);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0x88ccff }));
    orb.position.y = 1.4; g.add(orb);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
    this._light(x, 1.0, z, 0x6aaaff, 1.5, 5);
  };

  proto._addSurfacePortal = function(x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x4a4a54, flatShading: true });
    const mistMat = new THREE.MeshBasicMaterial({ color: 0xa0d0ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const lp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), stoneMat);
    lp.position.set(-0.35, 0.7, 0); g.add(lp);
    const rp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), stoneMat);
    rp.position.set(0.35, 0.7, 0); g.add(rp);
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.15, 8, 1, false, 0, Math.PI), stoneMat);
    arch.rotation.z = Math.PI / 2; arch.position.y = 1.4; g.add(arch);
    const mist = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 1.3), mistMat);
    mist.position.set(0, 0.65, 0); g.add(mist);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x88ddff }));
    orb.position.set(0, 0.7, 0); g.add(orb);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
    this._light(x, 0.7, z, 0x88ddff, 1.0, 4);
  };
}