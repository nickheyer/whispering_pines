// Farm & outdoor structure rendering — patched into Renderer3D at runtime
// Keeps renderer3d.js under the line limit while adding rich 3D farm structures
import * as THREE from 'three';
import { T } from './constants';

export function installFarmStructures(rendererClass) {
  const proto = rendererClass.prototype;
  const orig = proto._buildTileObject;

  proto._buildTileObject = function(tile, x, z) {
    switch (tile) {
      case T.FENCE_GATE: {
        this._shadedBox(x - 0.4, 0.3, z, 0.1, 0.6, 0.1, '#4a3018', 0.15);
        this._shadedBox(x + 0.4, 0.3, z, 0.1, 0.6, 0.1, '#4a3018', 0.15);
        this._shadedBox(x, 0.42, z, 0.75, 0.05, 0.06, '#3a2010', 0.12);
        this._shadedBox(x, 0.15, z, 0.75, 0.05, 0.06, '#3a2010', 0.12);
        this._shadedBox(x, 0.28, z, 0.02, 0.3, 0.04, '#3a2010', 0.12);
        break;
      }
      case T.SCARECROW: {
        const scG = new THREE.Group();
        const scPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.06), new THREE.MeshLambertMaterial({ color: 0x4a3018 }));
        scPost.position.y = 0.65; scG.add(scPost);
        const scBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.05), new THREE.MeshLambertMaterial({ color: 0x4a3018 }));
        scBar.position.y = 0.85; scG.add(scBar);
        const scBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.4, 6), new THREE.MeshLambertMaterial({ color: 0x6a4a2a, flatShading: true }));
        scBody.position.y = 0.7; scG.add(scBody);
        const scHead = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), new THREE.MeshLambertMaterial({ color: 0xd4842a, emissive: 0x441100, emissiveIntensity: 0.2, flatShading: true }));
        scHead.position.y = 1.05; scHead.scale.set(1, 0.9, 1); scG.add(scHead);
        const scEyeMat = new THREE.MeshBasicMaterial({ color: 0xffaa30 });
        const se1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 0), scEyeMat); se1.position.set(-0.04, 1.07, 0.1); scG.add(se1);
        const se2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 0), scEyeMat); se2.position.set(0.04, 1.07, 0.1); scG.add(se2);
        const scHatMat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a });
        const scHatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), scHatMat);
        scHatBrim.position.y = 1.17; scG.add(scHatBrim);
        const scHatTop = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 6), scHatMat);
        scHatTop.position.y = 1.27; scG.add(scHatTop);
        const scStrawMat = new THREE.MeshLambertMaterial({ color: 0xc4a44a, flatShading: true });
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.15, 3), scStrawMat);
          straw.position.set(Math.cos(a) * 0.13, 0.92, Math.sin(a) * 0.13);
          straw.rotation.z = Math.cos(a) * 0.4; scG.add(straw);
        }
        scG.position.set(x, 0, z);
        scG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(scG);
        break;
      }
      case T.HAY_BALE: {
        const hbG = new THREE.Group();
        const hayMat = new THREE.MeshLambertMaterial({ color: 0xc4a44a, flatShading: true });
        const hayDarkMat = new THREE.MeshLambertMaterial({ color: 0xa48a3a, flatShading: true });
        const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 8), hayMat);
        bale.rotation.z = Math.PI / 2; bale.position.y = 0.32; bale.scale.set(1, 1, 0.75); hbG.add(bale);
        for (let i = 0; i < 4; i++) {
          const line = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.015, 0.5), hayDarkMat);
          line.position.set(0, 0.15 + i * 0.1, 0); hbG.add(line);
        }
        for (let i = 0; i < 4; i++) {
          const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 3), hayMat);
          tuft.position.set((Math.random()-0.5)*0.3, 0.6, (Math.random()-0.5)*0.2);
          hbG.add(tuft);
        }
        hbG.position.set(x, 0, z);
        hbG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(hbG);
        break;
      }
      case T.CHICKEN_COOP: {
        const ccG = new THREE.Group();
        const ccBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.7), new THREE.MeshLambertMaterial({ color: 0x4a3018, flatShading: true }));
        ccBase.position.y = 0.08; ccG.add(ccBase);
        const ccBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.6), new THREE.MeshLambertMaterial({ color: 0x6a4a2a, flatShading: true }));
        ccBody.position.y = 0.35; ccG.add(ccBody);
        const ccDoor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.02), new THREE.MeshBasicMaterial({ color: 0x0a0804 }));
        ccDoor.position.set(0, 0.3, 0.31); ccG.add(ccDoor);
        const ccRamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.18), new THREE.MeshLambertMaterial({ color: 0x4a3018 }));
        ccRamp.position.set(0, 0.1, 0.4); ccRamp.rotation.x = -0.4; ccG.add(ccRamp);
        const ccWin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), new THREE.MeshLambertMaterial({ color: 0x4a6a8a, emissive: 0x2a3a5a, emissiveIntensity: 0.2 }));
        ccWin.position.set(-0.2, 0.4, 0.31); ccG.add(ccWin);
        const ccRoof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.25, 4), new THREE.MeshLambertMaterial({ color: 0x3a2a1e, flatShading: true }));
        ccRoof.position.y = 0.65; ccRoof.rotation.y = Math.PI / 4; ccG.add(ccRoof);
        const ccPerch = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), new THREE.MeshLambertMaterial({ color: 0x3a2010 }));
        ccPerch.position.set(0.3, 0.2, 0); ccPerch.rotation.z = Math.PI / 2; ccG.add(ccPerch);
        ccG.position.set(x, 0, z);
        ccG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(ccG);
        break;
      }
      case T.FEED_TROUGH: {
        const ftG = new THREE.Group();
        const ftWoodMat = new THREE.MeshLambertMaterial({ color: 0x4a3018, flatShading: true });
        const ftBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.3), ftWoodMat);
        ftBody.position.y = 0.15; ftG.add(ftBody);
        const ftHollow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.2), new THREE.MeshBasicMaterial({ color: 0x1a1008 }));
        ftHollow.position.y = 0.18; ftG.add(ftHollow);
        const ftGrain = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.16), new THREE.MeshLambertMaterial({ color: 0xc4a44a }));
        ftGrain.position.y = 0.19; ftG.add(ftGrain);
        for (let i = 0; i < 4; i++) {
          const lx = (i % 2 === 0 ? -1 : 1) * 0.25;
          const lz = (i < 2 ? -1 : 1) * 0.12;
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), ftWoodMat);
          leg.position.set(lx, 0.05, lz); ftG.add(leg);
        }
        ftG.position.set(x, 0, z);
        ftG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(ftG);
        break;
      }
      case T.WINDMILL: {
        const wmG = new THREE.Group();
        const wmBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), new THREE.MeshLambertMaterial({ color: 0x6a6a6e, flatShading: true }));
        wmBase.position.y = 0.25; wmG.add(wmBase);
        const wmTower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.3, 8), new THREE.MeshLambertMaterial({ color: 0x8a7a6a, flatShading: true }));
        wmTower.position.y = 1.25; wmG.add(wmTower);
        const wmCap = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.22, 8), new THREE.MeshLambertMaterial({ color: 0x5a3a2a, flatShading: true }));
        wmCap.position.y = 2.0; wmG.add(wmCap);
        const wmHub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), new THREE.MeshLambertMaterial({ color: 0x3a2a1a }));
        wmHub.rotation.x = Math.PI / 2; wmHub.position.set(0, 1.7, 0.32); wmG.add(wmHub);
        const wmBladeMat = new THREE.MeshLambertMaterial({ color: 0xe0d0b0, flatShading: true });
        for (let i = 0; i < 4; i++) {
          const wrapper = new THREE.Group();
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.12), wmBladeMat);
          blade.position.y = 0.28; wrapper.add(blade);
          const bCross = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.1), wmBladeMat);
          bCross.position.y = 0.35; wrapper.add(bCross);
          wrapper.rotation.z = (i / 4) * Math.PI * 2;
          wrapper.position.set(0, 1.7, 0.36);
          wmG.add(wrapper);
        }
        wmG.position.set(x, 0, z);
        wmG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(wmG);
        this._light(x, 1.7, z, 0xffd080, 0.3, 3);
        break;
      }
      case T.STONE_WALL: {
        const swG = new THREE.Group();
        const swMat = new THREE.MeshLambertMaterial({ color: 0x6a6a6e, flatShading: true });
        const swDarkMat = new THREE.MeshLambertMaterial({ color: 0x4a4a54, flatShading: true });
        const swBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.3), swMat);
        swBase.position.y = 0.15; swG.add(swBase);
        const swTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.3), swDarkMat);
        swTop.position.y = 0.38; swG.add(swTop);
        const swCap = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.04, 0.32), swMat);
        swCap.position.y = 0.47; swG.add(swCap);
        const swMossMat = new THREE.MeshLambertMaterial({ color: 0x3a5a2a, flatShading: true });
        for (let i = 0; i < 2; i++) {
          const moss = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), swMossMat);
          moss.position.set((i === 0 ? -0.2 : 0.15), 0.1, 0.15); moss.scale.set(1, 0.3, 1); swG.add(moss);
        }
        swG.position.set(x, 0, z);
        swG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(swG);
        break;
      }
      case T.FLOWER_BOX: {
        const fbG = new THREE.Group();
        const fbWoodMat = new THREE.MeshLambertMaterial({ color: 0x4a3018, flatShading: true });
        const fbBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), fbWoodMat);
        fbBox.position.y = 0.08; fbG.add(fbBox);
        const fbSoil = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.18), new THREE.MeshLambertMaterial({ color: 0x3a2818 }));
        fbSoil.position.y = 0.16; fbG.add(fbSoil);
        const fbCols = [0xd4a5c0, 0xc4b04a, 0xa0a0d4, 0xe4c4a0];
        for (let i = 0; i < 4; i++) {
          const fbx = -0.15 + i * 0.1;
          const fbStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.15, 3), new THREE.MeshLambertMaterial({ color: 0x4a7a3a }));
          fbStem.position.set(fbx, 0.25, 0); fbG.add(fbStem);
          const fbBloom = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), new THREE.MeshLambertMaterial({ color: fbCols[i % fbCols.length] }));
          fbBloom.position.set(fbx, 0.33, 0); fbG.add(fbBloom);
        }
        fbG.position.set(x, 0, z);
        fbG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(fbG);
        break;
      }
      case T.COW: {
        const cowG = new THREE.Group();
        const cowMat = new THREE.MeshLambertMaterial({ color: 0x6a5a4a, flatShading: true });
        const cowDarkMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a, flatShading: true });
        const cowSpotMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1a, flatShading: true });
        const pinkMat = new THREE.MeshLambertMaterial({ color: 0xd4a0a0 });
        // body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.8), cowMat);
        body.position.y = 0.45; cowG.add(body);
        // spots
        const spot1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), cowSpotMat);
        spot1.position.set(0.12, 0.55, 0.1); spot1.scale.set(1, 0.4, 1); cowG.add(spot1);
        const spot2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.10, 0), cowSpotMat);
        spot2.position.set(-0.08, 0.52, -0.15); spot2.scale.set(1, 0.3, 1); cowG.add(spot2);
        // head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.25), cowMat);
        head.position.set(0, 0.45, 0.5); cowG.add(head);
        // snout
        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), pinkMat);
        snout.position.set(0, 0.40, 0.64); cowG.add(snout);
        // nostrils
        const n1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.015, 0), new THREE.MeshBasicMaterial({ color: 0x4a2a2a }));
        n1.position.set(-0.04, 0.40, 0.68); cowG.add(n1);
        const n2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.015, 0), new THREE.MeshBasicMaterial({ color: 0x4a2a2a }));
        n2.position.set(0.04, 0.40, 0.68); cowG.add(n2);
        // eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        const e1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), eyeMat);
        e1.position.set(-0.08, 0.52, 0.61); cowG.add(e1);
        const e2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), eyeMat);
        e2.position.set(0.08, 0.52, 0.61); cowG.add(e2);
        // horns
        const hornMat = new THREE.MeshLambertMaterial({ color: 0xd4c4a0 });
        const h1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), hornMat);
        h1.position.set(-0.1, 0.62, 0.48); cowG.add(h1);
        const h2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), hornMat);
        h2.position.set(0.1, 0.62, 0.48); cowG.add(h2);
        // ears
        const ear1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.06), cowDarkMat);
        ear1.position.set(-0.16, 0.55, 0.48); cowG.add(ear1);
        const ear2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.06), cowDarkMat);
        ear2.position.set(0.16, 0.55, 0.48); cowG.add(ear2);
        // legs
        const legMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a, flatShading: true });
        const legPos = [[-0.15, 0.25], [0.15, 0.25], [-0.15, -0.25], [0.15, -0.25]];
        for (const [lx, lz] of legPos) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.1), legMat);
          leg.position.set(lx, 0.14, lz); cowG.add(leg);
        }
        // udder
        const udder = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), pinkMat);
        udder.position.set(0, 0.30, -0.1); udder.scale.set(1, 0.6, 1.2); cowG.add(udder);
        // tail
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 4), cowDarkMat);
        tail.position.set(0, 0.4, -0.45); tail.rotation.x = 0.5; cowG.add(tail);
        const tailTuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), cowDarkMat);
        tailTuft.position.set(0, 0.26, -0.55); cowG.add(tailTuft);
        cowG.position.set(x, 0, z);
        cowG.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.worldGroup.add(cowG);
        break;
      }
      default:
        return orig.call(this, tile, x, z);
    }
  };
}