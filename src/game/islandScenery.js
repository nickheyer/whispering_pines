// Island border scenery — fills the void beyond map edges with ocean, mountains,
// hills, beach coves, and zone-specific landmarks (lighthouse) to sell the
// feeling that you're on a real island surrounded by sea.
import * as THREE from 'three';

function disposeGroup(group) {
  group.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose()) : obj.material.dispose();
    }
  });
}

function addMountain(group, x, z, r, h) {
  const g = new THREE.Group();
  // main peak — faceted cone
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x4a4a52, flatShading: true });
  const peak = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), rockMat);
  peak.position.y = h / 2;
  peak.rotation.y = Math.random() * Math.PI;
  g.add(peak);
  // snow cap
  const snowMat = new THREE.MeshLambertMaterial({ color: 0xd8d8e0, flatShading: true });
  const snow = new THREE.Mesh(new THREE.ConeGeometry(r * 0.45, h * 0.35, 5), snowMat);
  snow.position.y = h - h * 0.18;
  snow.rotation.y = peak.rotation.y;
  g.add(snow);
  // secondary smaller peak beside it
  if (Math.random() > 0.4) {
    const peak2 = new THREE.Mesh(new THREE.ConeGeometry(r * 0.6, h * 0.7, 5), rockMat);
    peak2.position.set(r * 0.6, h * 0.35, -r * 0.3);
    g.add(peak2);
  }
  g.position.set(x, 0, z);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.add(g);
}

function addHill(group, x, z) {
  const g = new THREE.Group();
  const hillMat = new THREE.MeshLambertMaterial({ color: 0x3a5a3a, flatShading: true });
  const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + Math.random() * 1.5, 0), hillMat);
  hill.position.y = 0.6;
  hill.scale.set(1.4, 0.6, 1.2);
  hill.rotation.y = Math.random() * Math.PI;
  g.add(hill);
  // a few trees on the hill
  const treeMat = new THREE.MeshLambertMaterial({ color: 0x2a3a24, flatShading: true });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const tree = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 5), treeMat);
    tree.position.set(Math.cos(a) * 0.8, 1.0, Math.sin(a) * 0.8);
    g.add(tree);
  }
  g.position.set(x, 0, z);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.add(g);
}

function addBeachCove(group, x, z, angle) {
  const g = new THREE.Group();
  // sandy crescent — a flattened sandy disc
  const sandMat = new THREE.MeshLambertMaterial({ color: 0xc4ad7e, transparent: true, opacity: 0.85 });
  const sand = new THREE.Mesh(new THREE.CircleGeometry(2.5 + Math.random() * 1.5, 8), sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = -0.02;
  g.add(sand);
  // a few rocks at the cove edge
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x5a5a64, flatShading: true });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.2, 0), rockMat);
    rock.position.set(Math.cos(a) * 2.2, 0.1, Math.sin(a) * 2.2);
    rock.scale.set(1, 0.6, 1);
    g.add(rock);
  }
  g.position.set(x, 0, z);
  g.lookAt(0, 0, 0);
  group.add(g);
}

function addLighthouse(group, x, z, isClose) {
  const g = new THREE.Group();
  const towerMat = new THREE.MeshLambertMaterial({ color: 0xe8e0d4 });
  const stripeMat = new THREE.MeshLambertMaterial({ color: 0x8a3a2a });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1e });
  const baseR = isClose ? 0.5 : 0.35;
  const towerH = isClose ? 6 : 4.5;

  // stone base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 1.4, baseR * 1.6, 0.6, 8), darkMat);
  base.position.y = 0.3; g.add(base);
  // tapered tower — white with red stripes
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.7, baseR * 1.1, towerH, 10), towerMat);
  tower.position.y = 0.6 + towerH / 2; g.add(tower);
  // red stripes
  for (let i = 0; i < 3; i++) {
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.8, baseR * 1.0, 0.4, 10), stripeMat);
    stripe.position.y = 1.2 + i * (towerH / 3.5);
    g.add(stripe);
  }
  // gallery platform
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.9, baseR * 0.9, 0.2, 8), darkMat);
  gallery.position.y = 0.6 + towerH + 0.1; g.add(gallery);
  // lamp room
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.6, baseR * 0.7, 0.6, 8), darkMat);
  lamp.position.y = 0.6 + towerH + 0.5; g.add(lamp);
  // glowing light — the beacon
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffe080, transparent: true, opacity: 0.9 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(baseR * 0.5, 8, 6), beaconMat);
  beacon.position.y = 0.6 + towerH + 0.55; g.add(beacon);
  // light halo
  const halo = new THREE.Mesh(new THREE.SphereGeometry(baseR * 1.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0.25 }));
  halo.position.y = 0.6 + towerH + 0.55; g.add(halo);
  // pointed roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(baseR * 0.75, 0.5, 8), darkMat);
  roof.position.y = 0.6 + towerH + 0.95; g.add(roof);

  // actual point light for night visibility
  const light = new THREE.PointLight(0xffd060, isClose ? 2.0 : 0.8, isClose ? 15 : 10);
  light.position.y = 0.6 + towerH + 0.55;
  g.add(light);

  // ── Sweeping beam — a long translucent cone that rotates around the tower ──
  // Oriented horizontally: a cone whose axis points outward along +Z.
  const beamLen = isClose ? 18 : 14;
  const beamGeo = new THREE.ConeGeometry(baseR * 1.8, beamLen, 12, 1, true);
  // Rotate so the cone lies on its side, apex at the lamp, opening outward along +Z
  beamGeo.rotateX(Math.PI / 2);
  beamGeo.translate(0, 0, beamLen / 2);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffe080,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 0.6 + towerH + 0.55;
  // a pivot group so the beam rotates around the tower's vertical axis
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 0.6 + towerH + 0.55;
  beam.position.y = 0;
  beamPivot.add(beam);
  g.add(beamPivot);

  // store refs for animation
  g.userData.beacon = beacon;
  g.userData.halo = halo;
  g.userData.light = light;
  g.userData.beam = beam;
  g.userData.beamPivot = beamPivot;

  g.position.set(x, 0, z);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  group.add(g);
}

// Main entry — builds scenery around the current zone and returns the group
export function buildIslandScenery(group, zoneW, zoneH, zoneId) {
  const cx = zoneW / 2, cz = zoneH / 2;
  const maxR = Math.max(zoneW, zoneH);

  // ── Distant ocean plane — fills the void with water ──
  const oceanGeo = new THREE.PlaneGeometry(maxR * 8, maxR * 8, 1, 1);
  oceanGeo.rotateX(-Math.PI / 2);
  const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshLambertMaterial({ color: 0x1a3850 }));
  ocean.position.set(cx, -0.06, cz);
  group.add(ocean);

  // ── Mountain ring — distant peaks surrounding the island ──
  const mountainCount = 20;
  for (let i = 0; i < mountainCount; i++) {
    const angle = (i / mountainCount) * Math.PI * 2 + Math.random() * 0.2;
    const dist = maxR * 0.75 + Math.random() * maxR * 0.4;
    const mx = cx + Math.cos(angle) * dist;
    const mz = cz + Math.sin(angle) * dist;
    const h = 5 + Math.random() * 7;
    const r = 2.5 + Math.random() * 3;
    addMountain(group, mx, mz, r, h);
  }

  // ── Rolling hills — closer, greener, with trees ──
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + 0.4;
    const dist = maxR * 0.6 + Math.random() * maxR * 0.15;
    addHill(group, cx + Math.cos(angle) * dist, cz + Math.sin(angle) * dist);
  }

  // ── Beach coves — sandy crescents at the water's edge ──
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + 0.7;
    const dist = maxR * 0.55;
    addBeachCove(group, cx + Math.cos(angle) * dist, cz + Math.sin(angle) * dist, angle);
  }

  // ── Lighthouse — visible from the haunted forest on the LEFT (negative X) ──
  if (zoneId === 'haunted_forest') {
    addLighthouse(group, -6, cz, true);
  } else if (zoneId === 'shore' || zoneId === 'spooky_shores') {
    addLighthouse(group, cx + maxR * 0.45, cz + maxR * 0.35, false);
  } else if (zoneId === 'lighthouse') {
    // already in the lighthouse zone — no distant one
  }

  return group;
}