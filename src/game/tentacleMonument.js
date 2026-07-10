// Replaces the tentacle statue with a towering, dramatic monument —
// massive curving tentacles, pulsing glow, and imposing scale.
import * as THREE from 'three';

export function installTentacleMonument(Renderer3D) {
  Renderer3D.prototype._addTentacleStatue = function (x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x4a4a52, flatShading: true });
    const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x2a2a32, flatShading: true });
    const mossStoneMat = new THREE.MeshLambertMaterial({ color: 0x3a4838, flatShading: true });
    const tentMat = new THREE.MeshLambertMaterial({ color: 0x2a4a3e, emissive: 0x0a4a2e, emissiveIntensity: 0.35, flatShading: true });
    const darkTentMat = new THREE.MeshLambertMaterial({ color: 0x1a3a2e, emissive: 0x084a2e, emissiveIntensity: 0.25, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x66ffcc });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x44ddaa, transparent: true, opacity: 0.85 });

    // ── Massive multi-tiered altar base — wide and ancient ──
    const base0 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.3, 12), stoneMat);
    base0.position.y = 0.15; g.add(base0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.3), darkStoneMat);
      chunk.position.set(Math.cos(a) * 2.3, 0.15, Math.sin(a) * 2.3);
      chunk.rotation.y = a;
      g.add(chunk);
    }
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.35, 12), darkStoneMat);
    base1.position.y = 0.47; g.add(base1);
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.3, 12), mossStoneMat);
    base2.position.y = 0.8; g.add(base2);
    const base3 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.25, 12), stoneMat);
    base3.position.y = 1.07; g.add(base3);

    // glowing runes carved into the tiers
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const rune = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.025), runeMat);
      rune.position.set(Math.cos(a) * 1.55, 0.47, Math.sin(a) * 1.55);
      rune.lookAt(0, 0.47, 0);
      g.add(rune);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.5;
      const rune = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.02), runeMat);
      rune.position.set(Math.cos(a) * 1.1, 0.8, Math.sin(a) * 1.1);
      rune.lookAt(0, 0.8, 0);
      g.add(rune);
    }

    // ── Central body — massive bulbous stone head, towering ──
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 1), darkStoneMat);
    body.position.y = 2.8; body.scale.set(1.1, 0.9, 1); g.add(body);
    const body2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), darkStoneMat);
    body2.position.y = 4.0; body2.scale.set(1, 1.1, 1); g.add(body2);
    const body3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), darkStoneMat);
    body3.position.y = 5.0; g.add(body3);
    const body4 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), darkStoneMat);
    body4.position.y = 5.7; g.add(body4);

    // maw — dark gaping hole
    const maw = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    maw.position.set(0, 3.0, 1.0); g.add(maw);
    // teeth around the maw
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 0.8 - Math.PI * 0.4;
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), stoneMat);
      tooth.position.set(Math.cos(a) * 0.26, 3.0 + Math.sin(a) * 0.15, 1.1);
      tooth.rotation.x = -0.3;
      g.add(tooth);
    }

    // moss patches — creeping over the ancient stone
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x3a5a2a, flatShading: true });
    for (let i = 0; i < 12; i++) {
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.18, 5, 4), mossMat);
      const a = (i / 12) * Math.PI * 2 + 0.7;
      const r = 0.8 + (i % 3) * 0.3;
      moss.position.set(Math.cos(a) * r, 1.8 + (i % 3) * 0.3, Math.sin(a) * r);
      moss.scale.set(1, 0.35, 1); g.add(moss);
    }

    // ── 8 massive tentacles — reaching high and curving dramatically ──
    const numTentacles = 8;
    for (let i = 0; i < numTentacles; i++) {
      const angle = (i / numTentacles) * Math.PI * 2;
      const tg = new THREE.Group();
      let curR = 0.4;
      const segLen = 0.95;
      let parent = tg;
      const useDark = i % 2 === 0;
      const mat = useDark ? darkTentMat : tentMat;
      for (let s = 0; s < 11; s++) {
        const segGroup = new THREE.Group();
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(curR, curR * 1.3, segLen, 8), mat);
        seg.position.y = segLen / 2;
        segGroup.add(seg);
        // sucker dots
        for (let d = 0; d < 3; d++) {
          const sucker = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 3), eyeMat);
          sucker.position.set(curR * 0.85, segLen * (0.2 + d * 0.25), 0);
          segGroup.add(sucker);
        }
        // increasing curve — tentacles sweep outward then bend skyward
        const tilt = 0.08 + s * 0.10;
        const outwardCurve = s < 3 ? 0.12 : -0.06;
        segGroup.position.y = s === 0 ? 0 : segLen;
        segGroup.rotation.z = Math.cos(angle) * tilt + outwardCurve;
        segGroup.rotation.x = Math.sin(angle) * tilt;
        segGroup.rotation.y = s * 0.08;
        parent.add(segGroup);
        parent = segGroup;
        curR *= 0.85;
      }
      // position tentacle group radiating from the body
      tg.position.set(Math.cos(angle) * 0.5, 2.3, Math.sin(angle) * 0.5);
      g.add(tg);
    }

    // ── Glowing eyes — large, watching from high up ──
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), eyeMat);
    eye1.position.set(0.5, 3.2, 1.0); g.add(eye1);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 4), eyeMat);
    eye2.position.set(-0.5, 3.2, 1.0); g.add(eye2);
    // eye glow halos
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x66ffcc, transparent: true, opacity: 0.35 });
    const halo1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), haloMat);
    halo1.position.set(0.5, 3.2, 1.0); g.add(halo1);
    const halo2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), haloMat);
    halo2.position.set(-0.5, 3.2, 1.0); g.add(halo2);

    // ── Central top spire — a final tentacle reaching straight up ──
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.35, 2.0, 7), tentMat);
    spire.position.y = 6.3; g.add(spire);
    const spire2 = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.16, 1.2, 7), tentMat);
    spire2.position.y = 7.9; g.add(spire2);
    const spireTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 7), tentMat);
    spireTip.position.y = 8.8; g.add(spireTip);

    g.position.set(x, 0, z);
    g.userData.isMonument = true;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);

    // dramatic lighting — visible from across town
    this._light(x, 4.0, z, 0x44ccaa, 4.5, 18);
    this._light(x, 1.0, z, 0x2a8866, 2.5, 12);
    this._light(x, 7.0, z, 0x66ffcc, 2.0, 10);
    this._light(x, 9.0, z, 0x44ffaa, 1.0, 6);
  };
}