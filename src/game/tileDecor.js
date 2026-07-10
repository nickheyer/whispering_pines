// Spooky decor tiles, tilled soil rendering, and crop growth visuals.
// Extracted from renderer3d.js to keep file size manageable.
import * as THREE from 'three';
import { T, cropVisualStage } from './constants';

export function installTileDecor(rendererClass) {
  const proto = rendererClass.prototype;

  // ── Wrap _buildTileObject to add TILLED soil rendering ──
  const origBuildTile = proto._buildTileObject;
  proto._buildTileObject = function (tile, x, z) {
    if (tile === T.TILLED) {
      this._shadedBox(x, 0.02, z, 0.98, 0.06, 0.98, '#3a2818', 0.1);
      this._shadedBox(x, 0.05, z, 0.98, 0.02, 0.98, '#2a1808', 0.12);
      this._shadedBox(x - 0.28, 0.06, z, 0.14, 0.04, 0.96, '#4a3220', 0.1);
      this._shadedBox(x + 0.28, 0.06, z, 0.14, 0.04, 0.96, '#4a3220', 0.1);
      return;
    }
    return origBuildTile.call(this, tile, x, z);
  };

  // ── Crop rendering — plants grow on tilled soil in 3 stages ──
  proto._buildCrops = function (crops) {
    this.cropObjects = {};
    if (!crops) return;
    for (const key in crops) {
      const [cx, cy] = key.split(',').map(Number);
      const ov = crops[key];
      if (ov.crop !== undefined) {
        const obj = this._buildCrop(cx + 0.5, cy + 0.5, ov.crop, cropVisualStage(ov), ov.watered);
        if (obj) { this.worldGroup.add(obj); this.cropObjects[key] = obj; }
      }
    }
  };

  proto._buildCrop = function (x, z, cropType, stage, watered) {
    const g = new THREE.Group();
    const cropColors = {
      pumpkin: 0xd4842a, corn: 0xd4a838, potato: 0xb08a50, tomato: 0xc43030,
      blueberry: 0x3a4a8a, apple: 0xc02020, peach: 0xe08860, blackberry: 0x2a1a3a,
      raspberry: 0xa02040, lemon: 0xd4c830, lime: 0x8ac030, avocado: 0x4a6a30,
    };
    const fruitColor = cropColors[cropType] || 0x6a9a4a;
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x4a7a3a, flatShading: true });
    const darkStemMat = new THREE.MeshLambertMaterial({ color: 0x2a5a1a, flatShading: true });
    const fruitMat = new THREE.MeshLambertMaterial({ color: fruitColor, emissive: fruitColor, emissiveIntensity: 0.12, flatShading: true });

    if (stage === 0) {
      const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4), stemMat);
      sprout.position.set(x, 0.08, z); g.add(sprout);
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), stemMat);
      leaf.position.set(x + 0.05, 0.1, z); leaf.scale.set(1, 0.4, 1); g.add(leaf);
    } else if (stage === 1) {
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), stemMat);
      bush.position.set(x, 0.2, z); bush.scale.set(1, 0.7, 1); g.add(bush);
      const l1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), darkStemMat);
      l1.position.set(x + 0.1, 0.25, z + 0.05); l1.scale.set(1, 0.6, 1); g.add(l1);
      const l2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), stemMat);
      l2.position.set(x - 0.08, 0.22, z - 0.06); l2.scale.set(1, 0.5, 1); g.add(l2);
    } else {
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), stemMat);
      bush.position.set(x, 0.3, z); bush.scale.set(1, 0.7, 1); g.add(bush);
      const top = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), darkStemMat);
      top.position.set(x, 0.45, z); top.scale.set(1, 0.6, 1); g.add(top);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const fruit = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), fruitMat);
        fruit.position.set(x + Math.cos(a) * 0.22, 0.28, z + Math.sin(a) * 0.22);
        g.add(fruit);
      }
    }
    if (watered) {
      const wet = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9),
        new THREE.MeshLambertMaterial({ color: 0x1a0e08, transparent: true, opacity: 0.5, depthWrite: false }));
      wet.rotation.x = -Math.PI / 2; wet.position.set(x, 0.035, z); g.add(wet);
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  };

  proto.updateCrop = function (x, y, cropData) {
    const key = `${x},${y}`;
    if (this.cropObjects && this.cropObjects[key]) {
      this.worldGroup.remove(this.cropObjects[key]); this._dispose(this.cropObjects[key]); delete this.cropObjects[key];
    }
    if (!this.cropObjects) this.cropObjects = {};
    const obj = this._buildCrop(x + 0.5, y + 0.5, cropData.crop, cropVisualStage(cropData), cropData.watered);
    if (obj) { this.worldGroup.add(obj); this.cropObjects[key] = obj; }
  };

  proto.removeCrop = function (x, y) {
    const key = `${x},${y}`;
    if (this.cropObjects && this.cropObjects[key]) {
      this.worldGroup.remove(this.cropObjects[key]); this._dispose(this.cropObjects[key]); delete this.cropObjects[key];
    }
  };

  // ═══════════════════════════════════════════════════════════
  // SPOOKY & DECOR TILE METHODS — moved from renderer3d.js
  // ═══════════════════════════════════════════════════════════

  proto._addWitchTome = function (x, z) {
    const g = new THREE.Group();
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.3, 6), new THREE.MeshLambertMaterial({ color: 0x3a3a42 }));
    ped.position.y = 0.15; g.add(ped);
    const tome = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.2), new THREE.MeshLambertMaterial({ color: 0x4a1a30, emissive: 0x6a1a2a, emissiveIntensity: 0.4 }));
    tome.position.y = 0.34; g.add(tome);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g); this._light(x, 0.4, z, 0xc43a5a, 1.5, 4);
  };

  proto._addBonePile = function (x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xd4d4c4, flatShading: true });
    for (let i = 0; i < 4; i++) {
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3 + Math.random() * 0.15, 4), mat);
      bone.position.set((Math.random() - 0.5) * 0.4, 0.05 + Math.random() * 0.1, (Math.random() - 0.5) * 0.4);
      bone.rotation.z = (Math.random() - 0.5) * 1.5; bone.rotation.y = Math.random() * Math.PI;
      g.add(bone);
    }
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), mat);
    skull.position.set(0, 0.15, 0); skull.scale.set(1, 0.8, 1); g.add(skull);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addSkullTotem = function (x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xb4b4a4, flatShading: true });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2, 5), new THREE.MeshLambertMaterial({ color: 0x4a3a2a }));
    pole.position.y = 0.6; g.add(pole);
    for (let i = 0; i < 3; i++) {
      const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), mat);
      skull.position.y = 0.8 + i * 0.18; skull.scale.set(1, 0.85, 1); skull.rotation.y = i * 0.7; g.add(skull);
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g); this._light(x, 1.2, z, 0x4a9a4a, 0.8, 4);
  };

  proto._addHangingMoss = function (x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x3a5a2a, flatShading: true });
    for (let i = 0; i < 3; i++) {
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.005, 0.3, 3), mat);
      strand.position.set((Math.random() - 0.5) * 0.3, 0.35, (Math.random() - 0.5) * 0.3); g.add(strand);
    }
    g.position.set(x, 0, z); this.worldGroup.add(g);
  };

  proto._addGraveCross = function (x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x4a3828, flatShading: true });
    const vert = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), mat);
    vert.position.y = 0.35; g.add(vert);
    const horiz = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.08), mat);
    horiz.position.y = 0.5; g.add(horiz);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addSpiderWeb = function (x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xd4d4d0, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.3, 3), mat);
      strand.position.set(0, 0.15, 0); strand.rotation.z = (i / 4) * Math.PI;
      strand.lookAt(Math.cos(i), 0.15, Math.sin(i)); g.add(strand);
    }
    g.position.set(x, 0, z); this.worldGroup.add(g);
  };

  proto._addStatue = function (x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x7a7678, flatShading: true });
    const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x5a5658, flatShading: true });
    const lightStoneMat = new THREE.MeshLambertMaterial({ color: 0x9a9698, flatShading: true });
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.15, 8), darkStoneMat);
    base1.position.y = 0.075; g.add(base1);
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 8), stoneMat);
    base2.position.y = 0.21; g.add(base2);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.5, 7), stoneMat);
    body.position.y = 0.52; g.add(body);
    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.2), stoneMat);
    shoulders.position.y = 0.78; g.add(shoulders);
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), lightStoneMat);
    head.position.y = 0.92; g.add(head);
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.25, 7), darkStoneMat);
    hood.position.y = 0.95; g.add(hood);
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 5), stoneMat);
    armL.position.set(-0.18, 0.6, 0.05); armL.rotation.z = 0.5; g.add(armL);
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 5), stoneMat);
    armR.position.set(0.18, 0.6, 0.05); armR.rotation.z = -0.5; g.add(armR);
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x3a5a2a, flatShading: true });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const moss = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), mossMat);
      moss.position.set(Math.cos(a) * 0.3, 0.08, Math.sin(a) * 0.3);
      moss.scale.set(1, 0.3, 1); g.add(moss);
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g); this._light(x, 0.8, z, 0x88ccff, 0.8, 5);
  };

  proto._addGraveMound = function (x, z) {
    const g = new THREE.Group();
    const dirtMat = new THREE.MeshLambertMaterial({ color: 0x4a3a28, flatShading: true });
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x3a4a2a, flatShading: true });
    const mound = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), dirtMat);
    mound.position.set(0, 0.1, 0); mound.scale.set(1.3, 0.6, 0.8); g.add(mound);
    const grass = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), grassMat);
    grass.position.set(0, 0.14, 0); grass.scale.set(1.2, 0.4, 0.7); g.add(grass);
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), new THREE.MeshLambertMaterial({ color: 0x6a6a6e, flatShading: true }));
    stone.position.set(0.05, 0.2, 0); stone.scale.set(0.8, 1.2, 0.5); g.add(stone);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.15, 3), new THREE.MeshLambertMaterial({ color: 0x4a3a2a }));
    stem.position.set(-0.1, 0.18, 0.05); g.add(stem);
    const bloom = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), new THREE.MeshLambertMaterial({ color: 0x8a6a5a }));
    bloom.position.set(-0.1, 0.26, 0.05); g.add(bloom);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addGravestone = function (x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x6a6a6e, flatShading: true });
    const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x4a4a54, flatShading: true });
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x3a5a2a, flatShading: true });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.2), darkStoneMat);
    base.position.y = 0.05; g.add(base);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.12), stoneMat);
    slab.position.y = 0.35; g.add(slab);
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 8, 1, false, 0, Math.PI), stoneMat);
    arch.rotation.z = Math.PI / 2; arch.position.y = 0.6; g.add(arch);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.02), darkStoneMat);
    crossV.position.set(0, 0.38, 0.07); g.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), darkStoneMat);
    crossH.position.set(0, 0.42, 0.07); g.add(crossH);
    const moss1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), mossMat);
    moss1.position.set(-0.1, 0.15, 0.06); moss1.scale.set(1, 0.5, 0.5); g.add(moss1);
    const moss2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mossMat);
    moss2.position.set(0.08, 0.1, 0.05); moss2.scale.set(1, 0.4, 0.5); g.add(moss2);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addPumpkin = function (x, z) {
    const g = new THREE.Group();
    const pumpkinMat = new THREE.MeshLambertMaterial({ color: 0xd4842a, emissive: 0x441100, emissiveIntensity: 0.3, flatShading: true });
    const darkPumpMat = new THREE.MeshLambertMaterial({ color: 0xa4621a, flatShading: true });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), pumpkinMat);
    body.position.y = 0.22; body.scale.set(1, 0.85, 1); g.add(body);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const rib = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), darkPumpMat);
      rib.position.set(Math.cos(a) * 0.18, 0.22, Math.sin(a) * 0.18);
      rib.scale.set(0.3, 0.8, 0.3); g.add(rib);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.1, 5), new THREE.MeshLambertMaterial({ color: 0x3a5a2a }));
    stem.position.y = 0.42; g.add(stem);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa30 });
    const eyeL = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), glowMat);
    eyeL.position.set(-0.08, 0.28, 0.24); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), glowMat);
    eyeR.position.set(0.08, 0.28, 0.24); g.add(eyeR);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), glowMat);
    mouth.position.set(0, 0.14, 0.24); g.add(mouth);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g); this._light(x, 0.3, z, 0xff8a2a, 0.8, 3);
  };

  proto._addCandles = function (x, z) {
    const g = new THREE.Group();
    const waxMat = new THREE.MeshLambertMaterial({ color: 0xe0d0b0 });
    const wickMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    for (let i = 0; i < 3; i++) {
      const cx = (i - 1) * 0.12;
      const h = 0.2 + (i % 2) * 0.05;
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, h, 5), waxMat);
      candle.position.set(cx, h / 2, 0); g.add(candle);
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 3), wickMat);
      wick.position.set(cx, h + 0.015, 0); g.add(wick);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), new THREE.MeshLambertMaterial({ color: 0xffd060, emissive: 0xff9a20, emissiveIntensity: 0.8 }));
      flame.position.set(cx, h + 0.06, 0); g.add(flame);
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g); this._light(x, 0.35, z, 0xffd060, 0.6, 2);
  };

  proto._addCrate = function (x, z) {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6a4a2a, flatShading: true });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x4a3018, flatShading: true });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), woodMat);
    body.position.y = 0.3; g.add(body);
    for (let i = 0; i < 3; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.02, 0.56), darkWoodMat);
      line.position.set(0, 0.12 + i * 0.18, 0); g.add(line);
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const corner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.56, 0.06), darkWoodMat);
      corner.position.set(Math.cos(a) * 0.28, 0.3, Math.sin(a) * 0.28); g.add(corner);
    }
    const studMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3e });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const stud = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 0), studMat);
      stud.position.set(Math.cos(a) * 0.22, 0.55, Math.sin(a) * 0.22); g.add(stud);
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addBarrel = function (x, z) {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6a4a2a, flatShading: true });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x4a3018 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3e });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.55, 10), woodMat);
    body.position.y = 0.3; g.add(body);
    const topRim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 4, 10), metalMat);
    topRim.rotation.x = Math.PI / 2; topRim.position.y = 0.55; g.add(topRim);
    const botRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 4, 10), metalMat);
    botRim.rotation.x = Math.PI / 2; botRim.position.y = 0.05; g.add(botRim);
    const midRim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.02, 4, 10), metalMat);
    midRim.rotation.x = Math.PI / 2; midRim.position.y = 0.3; g.add(midRim);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.05), darkWoodMat);
      line.position.set(Math.cos(a) * 0.25, 0.3, Math.sin(a) * 0.25);
      line.lookAt(Math.cos(a) * 2, 0.3, Math.sin(a) * 2); g.add(line);
    }
    const lid = new THREE.Mesh(new THREE.CircleGeometry(0.25, 10), darkWoodMat);
    lid.rotation.x = -Math.PI / 2; lid.position.y = 0.56; g.add(lid);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addAnvil = function (x, z) {
    const g = new THREE.Group();
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3e, flatShading: true });
    const darkIronMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2e, flatShading: true });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), darkIronMat);
    base.position.y = 0.075; g.add(base);
    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.15), ironMat);
    waist.position.y = 0.2; g.add(waist);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.25), ironMat);
    top.position.y = 0.29; g.add(top);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 5), ironMat);
    horn.rotation.z = -Math.PI / 2; horn.position.set(0.25, 0.29, 0); g.add(horn);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 4), darkIronMat);
    hole.position.set(-0.1, 0.31, 0); g.add(hole);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };

  proto._addSign = function (x, z) {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4a3018 });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x2a1808 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.8, 6), darkWoodMat);
    post.position.y = 0.4; g.add(post);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.06), woodMat);
    board.position.y = 0.7; g.add(board);
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 0.07), darkWoodMat);
    line.position.y = 0.7; g.add(line);
    const nailMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3e });
    for (let i = 0; i < 4; i++) {
      const nx = (i % 2 === 0 ? -1 : 1) * 0.17;
      const ny = 0.62 + (i < 2 ? 0 : 0.16);
      const nail = new THREE.Mesh(new THREE.IcosahedronGeometry(0.015, 0), nailMat);
      nail.position.set(nx, ny, 0.04); g.add(nail);
    }
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 6), darkWoodMat);
    cap.position.y = 0.84; g.add(cap);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  };
}