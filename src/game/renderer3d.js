// Full 3D renderer using Three.js — replaces the 2D canvas rendering.
// World is built from tile grid as 3D geometry; characters are billboard sprites.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { T, COLORS, TILE_PX } from './constants';
import { drawPlayer, drawFritz, drawNPC, drawGhost, drawEnemy, drawGroundItem, drawShamanBoss, setLanternOn } from './sprites';
import { spawnCritters, updateCritters, drawCritter } from './critters';
import { getSeasonalFoliage } from './seasons';
import { buildIslandScenery } from './islandScenery';

// All decorative vegetation is static — no sway/bob when the player walks through
const INTERACTIVE_TILES = new Set();

function C(hex) { return new THREE.Color(hex); }

// Lighting/fog palette — allocated once; _updateLighting/_updateFog lerp
// these every frame and must never allocate
const LIGHT_PALETTE = {
  ambDay: C(0x7a8abb), ambNight: C(0x161638), twilightAmb: C(0x8a4a6a),
  sunDay: C(0xfff0d0), sunNight: C(0x3a5599), golden: C(0xff8a3a), twilightSun: C(0xcc6a8a),
  bloodAmb: C(0x8a2a1a), bloodSun: C(0xff3a1a), glowAmb: C(0x2a5a4a),
  fogDayIn: C(0x4a3828), fogDayOut: C(0x8a8878), fogNightIn: C(0x1a1018), fogNightOut: C(0x181820),
  bloodFog: C(0x6a1a1a), snowFog: C(0xc0d0e0),
};

// Ground color beneath each tile type
function groundColorFor(tile, interior) {
  const base = interior ? COLORS.floor[0] : COLORS.grass[0];
  switch (tile) {
    case T.GRASS: case T.FLOWER: case T.MUSHROOM: case T.PEBBLE:
    case T.TILLED: case T.BIG_TREE: return '#3a2818';
    case T.PLANT_POT: case T.LANTERN_FLOOR: case T.PUMPKIN: case T.CANDLES:
      return COLORS.grass[0];
    case T.DARK_GRASS: case T.MOSS: return COLORS.darkGrass[0];
    case T.SAND: case T.DOCK: case T.BRIDGE: return COLORS.sand[0];
    case T.WATER: case T.LILY: return '#0a1830';
    case T.DEEP_WATER: return '#050d18';
    case T.PATH: case T.SIGN: return COLORS.path[0];
    case T.FLOOR: case T.WALL: case T.DOOR: case T.ROOF: case T.BED: case T.TABLE:
    case T.CHAIR: case T.CHEST: case T.STOVE: case T.WINDOW: case T.BOOKSHELF:
    case T.PAINTING: case T.CRATE: case T.BARREL: case T.ANVIL: case T.WORKBENCH: case T.BENCH:
    case T.POSTER: case T.PICTURE_FRAME: case T.TALL_PLANT: case T.HANGING_PLANT:
    case T.FLOWER_VASE: case T.FIREPLACE: case T.FLOOR_LAMP: case T.WALL_CLOCK:
    case T.MIRROR: case T.BOOK_STACK: case T.TRAPDOOR:
      return COLORS.floor[0];
    case T.STONE: case T.DARK_DIRT: case T.ROCK: case T.CRYSTAL: case T.STATUE:
    case T.BONE_PILE: case T.SKULL_TOTEM: case T.GRAVE_CROSS: case T.SPIDER_WEB: case T.WITCH_TOME: case T.HANGING_MOSS:
    case T.STAIRS_DOWN: case T.STAIRS_UP: case T.GROTTO_CHEST: case T.LIGHTHOUSE_KEY_CHEST: case T.CAVE:
      return COLORS.stone[0];
    case T.COBBLE: return COLORS.stone[0];
    case T.RUIN: case T.GRAVE: case T.GRAVESTONE: case T.BONE_PILE: case T.SKULL_TOTEM:
    case T.HANGING_MOSS: case T.GRAVE_CROSS: case T.SPIDER_WEB: case T.WITCH_TOME: return COLORS.darkGrass[0];
    default: return base;
  }
}

export class Renderer3D {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x1a1a2e);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);

    this.ambient = new THREE.AmbientLight(0x6677aa, 0.6);
    this.scene.add(this.ambient);
    // Hemisphere light — sky warmth above, ground coolness below, for natural fill
    this.hemi = new THREE.HemisphereLight(0xb8aadd, 0x3a4a2a, 0.4);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffeecc, 0.7);
    this.sun.position.set(10, 25, 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 60;
    this.sun.shadow.camera.left = -25;
    this.sun.shadow.camera.right = 25;
    this.sun.shadow.camera.top = 25;
    this.sun.shadow.camera.bottom = -25;
    this.sun.shadow.radius = 6;
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.playerLight = new THREE.PointLight(0xffaa44, 0, 8, 0);
    this.scene.add(this.playerLight);

    this.scene.fog = new THREE.Fog(0x8a8878, 8, 35);

    // ── Post-processing — bloom for glowing lights, fireflies, and emissive elements ──
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth || 800, window.innerHeight || 600),
      0.65,  // strength — moderate glow
      0.5,   // radius — soft spread
      0.82   // threshold — only bright/emissive elements bloom
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    this.worldGroup = new THREE.Group();
    this.entityGroup = new THREE.Group();
    this.fxGroup = new THREE.Group();
    this.sceneryGroup = new THREE.Group();
    this.scene.add(this.worldGroup, this.entityGroup, this.fxGroup, this.sceneryGroup);

    this.zoneW = 0; this.zoneH = 0; this.zoneInterior = false;
    this.entities = {};
    this.rainPoints = null;
    this.fireflies = [];
    this.voidWisps = [];
    this.dustMotes = null;
    this.clock = 0;
    this.interactiveTiles = [];
    this.critters = [];
    this._lastFrame = performance.now();
    this._tmpVec = new THREE.Vector3();

    // ── 3D fishing line — drawn from pole tip into the water when fishing ──
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xddddcc, transparent: true, opacity: 0.7 });
    this._fishingLine = new THREE.Line(lineGeo, lineMat);
    this._fishingLine.visible = false;
    this._fishingLine.frustumCulled = false;
    this.entityGroup.add(this._fishingLine);
    // ── Bobber — small dot where the line meets the water ──
    this._bobber = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0xff4422 })
    );
    this._bobber.visible = false;
    this.entityGroup.add(this._bobber);
  }

  resize(w, h) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.composer) this.composer.setSize(w, h);
  }

  // ── Full teardown — call when the game unmounts, or every menu→play cycle
  // leaks a scene, composer, and WebGL context ──
  dispose() {
    [this.worldGroup, this.entityGroup, this.fxGroup, this.sceneryGroup].forEach(g => {
      while (g.children.length) { const o = g.children[0]; g.remove(o); this._dispose(o); }
    });
    if (this._shadowGeo) { this._shadowGeo._shared = false; this._shadowGeo.dispose(); this._shadowGeo = null; }
    if (this._shadowMat) { this._shadowMat._shared = false; this._shadowMat.dispose(); this._shadowMat = null; }
    if (this.composer && this.composer.dispose) this.composer.dispose();
    this.renderer.dispose();
    if (this.renderer.forceContextLoss) this.renderer.forceContextLoss();
  }

  // ── World building ──
  buildWorld(tiles, crops, zone, season) {
    this.zoneW = zone.w; this.zoneH = zone.h;
    this.zoneInterior = !!zone.def.interior;
    this.season = season || 'autumn';
    this.foliage = getSeasonalFoliage(this.season);
    this.grottoFloor = zone.grottoFloor || 0;
    [this.worldGroup, this.entityGroup, this.fxGroup, this.sceneryGroup].forEach(g => {
      while (g.children.length) { const o = g.children[0]; g.remove(o); this._dispose(o); }
    });
    this.tileObjects = {};
    this.interactiveTiles = [];
    this._tiles = tiles;
    this._buildGround(tiles);
    this._buildWater(tiles);
    for (let y = 0; y < zone.h; y++)
      for (let x = 0; x < zone.w; x++)
        this._buildTileObjectTracked(tiles[y][x], x + 0.5, y + 0.5);
    this._buildRoofs(tiles);
    this._buildCrops(crops);
    this.critters = spawnCritters(zone, tiles);
    this._buildEntities(zone);
    this._buildWeatherFx(zone);
    // ── Island border scenery — mountains, hills, coves, lighthouse ──
    if (!this.zoneInterior) {
      buildIslandScenery(this.sceneryGroup, zone.w, zone.h, zone.id);
    }
    // Cast + receive real shadows on all world geometry
    this.worldGroup.traverse(obj => { if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; } });
  }

  _addBlobShadow(scale = 1) {
    if (!this._shadowGeo) {
      this._shadowGeo = new THREE.CircleGeometry(0.4, 16);
      this._shadowGeo.rotateX(-Math.PI / 2);
      this._shadowGeo._shared = true;
    }
    if (!this._shadowMat) {
      this._shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
      this._shadowMat._shared = true;
    }
    const m = new THREE.Mesh(this._shadowGeo, this._shadowMat);
    m.scale.setScalar(scale);
    m.renderOrder = -1;
    return m;
  }

  _dispose(obj) {
    // resources flagged _shared (e.g. the blob-shadow geo/mat) outlive any
    // single object — never dispose them here
    if (obj.geometry && !obj.geometry._shared) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (m._shared) continue;
        if (m.map) m.map.dispose();
        m.dispose();
      }
    }
    if (obj.children) obj.children.forEach(c => this._dispose(c));
  }

  // Wraps _buildTileObject with position tracking so tiles can be updated at runtime
  _buildTileObjectTracked(tile, x, z) {
    const fx = Math.floor(x), fz = Math.floor(z);
    const key = `${fx},${fz}`;
    if (this.tileObjects[key]) {
      const old = this.tileObjects[key];
      this.worldGroup.remove(old);
      this._dispose(old);
      delete this.tileObjects[key];
    }
    const group = new THREE.Group();
    const saved = this.worldGroup;
    this.worldGroup = group;
    this._buildTileObject(tile, x, z);
    this.worldGroup = saved;
    if (group.children.length > 0) {
      this.worldGroup.add(group);
      this.tileObjects[key] = group;
      group.traverse(obj => { if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; } });
    }
    // Track interactive tiles (bushes, grass, flowers) so they can sway when the player walks through
    if (INTERACTIVE_TILES.has(tile)) {
      this.interactiveTiles.push({ x: fx + 0.5, z: fz + 0.5, tile, group, sway: 0, phase: (fx * 37 + fz * 53) * 0.1 });
    }
  }

  // Called by engine when a tile changes at runtime (building, chopping, gathering, etc.)
  updateTile(x, y, tile) {
    if (this._tiles && y >= 0 && y < this._tiles.length && x >= 0 && x < (this._tiles[y]?.length || 0)) {
      this._tiles[y][x] = tile;
      // Remove stale interactive tile entry for this position
      this.interactiveTiles = this.interactiveTiles.filter(t => !(Math.floor(t.x) === x && Math.floor(t.z) === y));
      this._buildTileObjectTracked(tile, x + 0.5, y + 0.5);
      // fences draw their rails from neighbour state — rebuild adjacent
      // fences so connections appear (and disappear) immediately
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (ny >= 0 && ny < this._tiles.length && nx >= 0 && nx < (this._tiles[ny]?.length || 0) && this._tiles[ny][nx] === T.FENCE) {
          this._buildTileObjectTracked(T.FENCE, nx + 0.5, ny + 0.5);
        }
      }
    }
  }

  // Check if a tile is part of a building structure (wall, roof, door, window)
  _isBuildingTile(tx, tz) {
    if (!this._tiles) return false;
    if (tx < 0 || tz < 0 || tz >= this.zoneH || tx >= this.zoneW) return false;
    const t = this._tiles[tz][tx];
    return t === T.WALL || t === T.ROOF || t === T.DOOR || t === T.WINDOW ||
           t === T.PAINTING || t === T.POSTER || t === T.PICTURE_FRAME ||
           t === T.WALL_CLOCK || t === T.MIRROR || t === T.TRAPDOOR;
  }

  _buildGround(tiles) {
    const w = this.zoneW, h = this.zoneH;
    const scale = 6;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale; canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const base = groundColorFor(tiles[y][x], this.zoneInterior);
        ctx.fillStyle = base;
        ctx.fillRect(x * scale, y * scale, scale, scale);
        // Seasonal grass tint — shifts the ground palette with the season
        if (this.foliage && (tiles[y][x] === T.GRASS || tiles[y][x] === T.DARK_GRASS)) {
          const tc = new THREE.Color(this.foliage.grassTint);
          ctx.fillStyle = `rgba(${tc.r*255|0},${tc.g*255|0},${tc.b*255|0},0.12)`;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
        // Multi-layer organic noise — richer, more natural terrain variation
        const n = (x * 37 + y * 53) % 11;
        const n2 = (x * 73 + y * 19) % 7;
        const n3 = (x * 17 + y * 41) % 5;
        // large subtle patches
        if (n < 3) { ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(x * scale, y * scale, scale, Math.floor(scale / 2)); }
        else if (n > 8) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x * scale, y * scale + Math.floor(scale / 2), scale, Math.floor(scale / 2)); }
        // medium variation
        if (n3 === 0) { ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(x * scale + (n % 3), y * scale + (n2 % 3), 2, 2); }
        else if (n3 === 4) { ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x * scale + 1, y * scale + 1, 2, 2); }
        // fine speckle texture
        const specks = scale;
        for (let s = 0; s < specks; s++) {
          const sx = x * scale + Math.floor((n * 7 + s * 13) % scale);
          const sy = y * scale + Math.floor((n2 * 11 + s * 17) % scale);
          if ((n + s) % 4 === 0) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(sx, sy, 1, 1); }
          else if ((n2 + s) % 5 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(sx, sy, 1, 1); }
        }
        // grass tuft marks on grass tiles
        if (tiles[y][x] === T.GRASS || tiles[y][x] === T.DARK_GRASS) {
          if (n % 3 === 0) {
            ctx.fillStyle = tiles[y][x] === T.DARK_GRASS ? 'rgba(40,60,40,0.4)' : 'rgba(50,75,50,0.3)';
            ctx.fillRect(x * scale + 1, y * scale + scale - 2, 1, 2);
            ctx.fillRect(x * scale + 3, y * scale + scale - 3, 1, 3);
          }
        }
        // Grotto biome ground tint — each depth range has a distinct color theme
        if (this.grottoFloor > 0 && tiles[y][x] === T.FLOOR) {
          const biomeTints = {
            1: 'rgba(40,80,40,0.18)', 2: 'rgba(40,80,120,0.18)', 3: 'rgba(70,50,30,0.18)',
            4: 'rgba(160,200,230,0.18)', 5: 'rgba(120,30,15,0.20)', 6: 'rgba(50,15,60,0.25)',
          };
          const biomeIdx = this.grottoFloor <= 9 ? 1 : this.grottoFloor <= 19 ? 2 : this.grottoFloor <= 29 ? 3 :
                           this.grottoFloor <= 39 ? 4 : this.grottoFloor <= 49 ? 5 : 6;
          ctx.fillStyle = biomeTints[biomeIdx];
          ctx.fillRect(x * scale, y * scale, scale, scale);
          // biome-specific speckle texture
          if (n % 4 === 0) {
            ctx.fillStyle = biomeIdx === 4 ? 'rgba(200,230,250,0.3)' : biomeIdx === 5 ? 'rgba(255,100,30,0.2)' : 'rgba(0,0,0,0.1)';
            ctx.fillRect(x * scale + (n % 4), y * scale + (n2 % 4), 1, 1);
          }
        }
        // path cracks
        if (tiles[y][x] === T.PATH) {
          if (n % 4 === 0) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x * scale + 2, y * scale, 1, scale); }
        }
        // sand grain texture
        if (tiles[y][x] === T.SAND) {
          if (n2 % 3 === 0) { ctx.fillStyle = 'rgba(180,160,120,0.3)'; ctx.fillRect(x * scale + (n % scale), y * scale + (n2 % scale), 1, 1); }
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
    const geo = new THREE.PlaneGeometry(w, h); geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0.0 }));
    mesh.position.set(w / 2, 0, h / 2);
    mesh.receiveShadow = true;
    this.worldGroup.add(mesh);
  }

  _buildWater(tiles) {
    // Collect individual water tile positions — only build water where water tiles exist
    const waterTiles = [];
    for (let y = 0; y < this.zoneH; y++)
      for (let x = 0; x < this.zoneW; x++)
        if ([T.WATER, T.DEEP_WATER, T.LILY].includes(tiles[y][x]))
          waterTiles.push({ x, y, deep: tiles[y][x] === T.DEEP_WATER });
    if (waterTiles.length === 0) return;

    // Build a merged geometry of individual quads — one per water tile
    // Each quad is subdivided 2x2 so waves look smooth
    const segs = 2;
    const vertsPerTile = (segs + 1) * (segs + 1);
    const trisPerTile = segs * segs * 2;
    const positions = new Float32Array(waterTiles.length * vertsPerTile * 3);
    const indices = new Uint16Array(waterTiles.length * trisPerTile * 3);
    this._waterTileData = []; // track world positions for wave animation

    let vi = 0, ii = 0;
    for (const wt of waterTiles) {
      const baseIdx = vi / 3;
      for (let sy = 0; sy <= segs; sy++) {
        for (let sx = 0; sx <= segs; sx++) {
          const fx = wt.x + sx / segs;
          const fz = wt.y + sy / segs;
          positions[vi++] = fx;
          positions[vi++] = 0; // Y set per-frame by wave animation
          positions[vi++] = fz;
        }
      }
      for (let sy = 0; sy < segs; sy++) {
        for (let sx = 0; sx < segs; sx++) {
          const a = baseIdx + sy * (segs + 1) + sx;
          const b = a + 1;
          const c = a + (segs + 1);
          const d = c + 1;
          indices[ii++] = a; indices[ii++] = c; indices[ii++] = b;
          indices[ii++] = b; indices[ii++] = c; indices[ii++] = d;
        }
      }
      this._waterTileData.push({ x: wt.x + 0.5, z: wt.y + 0.5, deep: wt.deep });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    this._waterGeo = geo;

    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a4a6a, transparent: true, opacity: 0.72,
      emissive: 0x0a2a48, emissiveIntensity: 0.25,
      roughness: 0.12, metalness: 0.15,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -0.02, 0);
    mesh.receiveShadow = true;
    this.worldGroup.add(mesh);

    // ── Water depth layer — a dark subsurface plane below the water ──
    // The gap between the surface and this layer creates the illusion of depth.
    const depthMat = new THREE.MeshStandardMaterial({
      color: 0x06121e, emissive: 0x020812, emissiveIntensity: 0.3,
      roughness: 0.8, metalness: 0.0,
      flatShading: false,
    });
    const depthMesh = new THREE.Mesh(geo, depthMat);
    depthMesh.position.set(0, -0.22, 0);
    this.worldGroup.add(depthMesh);

    // ── Underwater caustic shimmer — faint lighter band at mid-depth ──
    const causticMat = new THREE.MeshBasicMaterial({
      color: 0x1a3a52, transparent: true, opacity: 0.25, depthWrite: false,
    });
    const causticMesh = new THREE.Mesh(geo, causticMat);
    causticMesh.position.set(0, -0.12, 0);
    this.worldGroup.add(causticMesh);

    // ── Shoreline bank — a raised, darker "wet ground" strip on the land side ──
    // Gives a clear, stable visual boundary so water doesn't look like it's floating
    const bankTiles = [];
    for (let y = 0; y < this.zoneH; y++) {
      for (let x = 0; x < this.zoneW; x++) {
        const t = tiles[y][x];
        if ([T.WATER, T.DEEP_WATER, T.LILY].includes(t)) continue;
        const adjWater =
          (tiles[y][x - 1] !== undefined && [T.WATER, T.DEEP_WATER, T.LILY].includes(tiles[y][x - 1])) ||
          (tiles[y][x + 1] !== undefined && [T.WATER, T.DEEP_WATER, T.LILY].includes(tiles[y][x + 1])) ||
          (tiles[y - 1] && [T.WATER, T.DEEP_WATER, T.LILY].includes(tiles[y - 1][x])) ||
          (tiles[y + 1] && [T.WATER, T.DEEP_WATER, T.LILY].includes(tiles[y + 1][x]));
        if (adjWater) bankTiles.push({ x, y });
      }
    }
    if (bankTiles.length > 0) {
      const bVerts = bankTiles.length * 4 * 3;
      const bIdx = bankTiles.length * 2 * 3;
      const bPos = new Float32Array(bVerts);
      const bInd = new Uint16Array(bIdx);
      let bi = 0, bj = 0;
      for (let k = 0; k < bankTiles.length; k++) {
        const bt = bankTiles[k];
        bPos[bi++] = bt.x;     bPos[bi++] = 0; bPos[bi++] = bt.y;
        bPos[bi++] = bt.x + 1; bPos[bi++] = 0; bPos[bi++] = bt.y;
        bPos[bi++] = bt.x + 1; bPos[bi++] = 0; bPos[bi++] = bt.y + 1;
        bPos[bi++] = bt.x;     bPos[bi++] = 0; bPos[bi++] = bt.y + 1;
        const b = k * 4;
        bInd[bj++] = b; bInd[bj++] = b + 1; bInd[bj++] = b + 2;
        bInd[bj++] = b; bInd[bj++] = b + 2; bInd[bj++] = b + 3;
      }
      const bankGeo = new THREE.BufferGeometry();
      bankGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
      bankGeo.setIndex(new THREE.BufferAttribute(bInd, 1));
      const bankMesh = new THREE.Mesh(bankGeo, new THREE.MeshStandardMaterial({
        color: 0x3a4a3a, transparent: true, opacity: 0.7, depthWrite: false,
      }));
      bankMesh.position.y = 0.015;
      this.worldGroup.add(bankMesh);
    }
  }

  _mat(color, emissive) {
    const opts = { color: C(color), roughness: 0.85, metalness: 0.05 };
    if (emissive) { opts.emissive = C(emissive); opts.emissiveIntensity = 0.6; }
    return new THREE.MeshStandardMaterial(opts);
  }

  _box(x, y, z, w, h, d, color, dark, emissive) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this._mat(dark || color, emissive));
    mesh.position.set(x, y, z);
    this.worldGroup.add(mesh);
    return mesh;
  }

  // Depth-shaded box: top face brightest, sides medium, front/back darker — gives solid 3D weight
  _shadedBox(x, y, z, w, h, d, baseColor, amt = 0.18) {
    const b = C(baseColor);
    const mats = [
      this._mat(new THREE.Color(b).offsetHSL(0, 0, -amt * 0.6)),       // +X right
      this._mat(new THREE.Color(b).offsetHSL(0, 0, -amt)),              // -X left
      this._mat(new THREE.Color(b).offsetHSL(0, 0, amt)),                // +Y top (brightest)
      this._mat(new THREE.Color(b).offsetHSL(0, 0, -amt * 1.8)),        // -Y bottom (darkest)
      this._mat(new THREE.Color(b).offsetHSL(0, 0, -amt * 0.3)),         // +Z front
      this._mat(new THREE.Color(b).offsetHSL(0, 0, -amt * 0.8)),        // -Z back
    ];
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
    mesh.position.set(x, y, z);
    this.worldGroup.add(mesh);
    return mesh;
  }

  // Triangular-prism pitched roof — two slopes meeting at a ridge
  _addPitchedRoof(x, z, w = 1.0, h = 0.5, d = 1.0, yBase = 0) {
    const hw = w / 2, hd = d / 2;
    const positions = new Float32Array([
      // left slope (2 tris)
      -hw, 0, -hd,  -hw, 0, hd,  0, h, hd,
      -hw, 0, -hd,   0, h, hd,  0, h, -hd,
      // right slope (2 tris)
       hw, 0, -hd,   0, h, hd,  -hw, 0, hd,
       hw, 0, -hd,   0, h, -hd,  0, h, hd,
      // front gable (2 tris)
      -hw, 0, hd,   0, h, hd,   hw, 0, hd,
      // back gable (2 tris)
       hw, 0, -hd,  0, h, -hd,  -hw, 0, -hd,
    ]);
    const normals = new Float32Array(positions.length);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    const mat = this._mat(COLORS.roof[0]);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, yBase, z);
    this.worldGroup.add(mesh);
    return mesh;
  }

  // Clean wall background for wall-mounted items (paintings, clocks, etc.)
  _addWallBg(x, z) {
    const tx = Math.floor(x), tz = Math.floor(z);
    const hasS = this._isBuildingTile(tx, tz + 1);
    const hasN = this._isBuildingTile(tx, tz - 1);
    const wallBottom = hasS ? 0.14 : 0.16;
    const wallTop = hasN ? 1.18 : 1.16;
    const wallH = wallTop - wallBottom;
    this._shadedBox(x, wallBottom + wallH / 2, z, 1.0, wallH, 1.0, COLORS.wall[0], 0.16);
    if (!this._isBuildingTile(tx - 1, tz))
      this._shadedBox(x - 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 1.0, COLORS.wall[2], 0.18);
    if (!this._isBuildingTile(tx + 1, tz))
      this._shadedBox(x + 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 1.0, COLORS.wall[2], 0.18);
    if (!hasN) this._shadedBox(x, 1.2, z, 1.06, 0.08, 1.06, COLORS.wall[2], 0.12);
  }

  _light(x, y, z, color, intensity, dist) {
    const light = new THREE.PointLight(color, intensity, dist);
    light.position.set(x, y, z);
    this.worldGroup.add(light);
  }

  _buildTileObject(tile, x, z) {
    switch (tile) {
      case T.WALL: {
        const tx = Math.floor(x), tz = Math.floor(z);
        const hasN = this._isBuildingTile(tx, tz - 1);
        const hasS = this._isBuildingTile(tx, tz + 1);
        const hasE = this._isBuildingTile(tx + 1, tz);
        const hasW = this._isBuildingTile(tx - 1, tz);

        // Stone foundation — only at the base (no building tile below)
        if (!hasS) {
          this._shadedBox(x, 0.06, z, 1.02, 0.14, 1.02, COLORS.stone[0], 0.1);
          this._shadedBox(x, 0.14, z, 1.02, 0.02, 1.02, '#4a4a52', 0.15);
        }

        // Wall body — clean clapboard siding, seamless between tiles
        const wallBottom = hasS ? 0.14 : 0.16;
        const wallTop = hasN ? 1.18 : 1.16;
        const wallH = wallTop - wallBottom;
        this._shadedBox(x, wallBottom + wallH / 2, z, 1.0, wallH, 1.0, COLORS.wall[0], 0.16);

        // Horizontal siding courses — 3 evenly spaced, subtle
        this._shadedBox(x, wallBottom + wallH * 0.25, z, 1.005, 0.015, 1.005, COLORS.wall[2], 0.2);
        this._shadedBox(x, wallBottom + wallH * 0.55, z, 1.005, 0.015, 1.005, COLORS.wall[2], 0.2);
        this._shadedBox(x, wallBottom + wallH * 0.82, z, 1.005, 0.015, 1.005, COLORS.wall[2], 0.2);

        // Corner posts — ONLY at actual building corners (outer edge)
        if (!hasW) {
          this._shadedBox(x - 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 1.0, COLORS.wall[2], 0.18);
          this._shadedBox(x - 0.48, wallBottom + wallH / 2, z, 0.03, wallH, 1.0, '#2a1a0a', 0.2);
        }
        if (!hasE) {
          this._shadedBox(x + 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 1.0, COLORS.wall[2], 0.18);
          this._shadedBox(x + 0.48, wallBottom + wallH / 2, z, 0.03, wallH, 1.0, '#2a1a0a', 0.2);
        }

        // Top cap beam — only at the top edge (no wall above)
        if (!hasN) {
          this._shadedBox(x, 1.2, z, 1.06, 0.08, 1.06, COLORS.wall[2], 0.12);
        }

        // Ivy vines — only on exterior walls facing south (bottom edge), sparse
        if (!hasS && !this.zoneInterior) {
          const wallSeed = Math.floor(x * 37 + z * 53);
          if (wallSeed % 5 === 0) {
            const vineMat = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, flatShading: true });
            for (let i = 0; i < 3; i++) {
              const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), vineMat);
              leaf.position.set(x - 0.25 + i * 0.22, 0.3 + i * 0.1, z + 0.02);
              leaf.scale.set(1, 1.3, 0.4);
              this.worldGroup.add(leaf);
            }
          }
        }
        break;
      }
      case T.DOOR: {
        if (this.zoneInterior) this._addInteriorDoor(x, z);
        else this._addPortalDoor(x, z);
        break;
      }
      case T.WINDOW: {
        // Wall background — clean, matching WALL rendering
        const tx = Math.floor(x), tz = Math.floor(z);
        const hasS = this._isBuildingTile(tx, tz + 1);
        const hasN = this._isBuildingTile(tx, tz - 1);
        const wallBottom = hasS ? 0.14 : 0.16;
        const wallTop = hasN ? 1.18 : 1.16;
        const wallH = wallTop - wallBottom;
        this._shadedBox(x, wallBottom + wallH / 2, z, 1.0, wallH, 1.0, COLORS.wall[0], 0.16);
        // siding lines (skip center where window is)
        this._shadedBox(x, wallBottom + wallH * 0.82, z, 1.005, 0.015, 1.005, COLORS.wall[2], 0.2);
        // corner posts only on edges
        if (!this._isBuildingTile(tx - 1, tz))
          this._shadedBox(x - 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 1.0, COLORS.wall[2], 0.18);
        if (!this._isBuildingTile(tx + 1, tz))
          this._shadedBox(x + 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 1.0, COLORS.wall[2], 0.18);
        // Window frame — recessed
        this._shadedBox(x, 0.65, z, 0.3, 0.55, 0.06, '#3a2a1a', 0.14);
        // Glass pane with warm glow
        this._box(x, 0.62, z, 0.2, 0.42, 0.03, '#6a8aaa', '#2a3a5a', '#9ac0e0');
        // Cross mullions
        this._shadedBox(x, 0.63, z, 0.02, 0.42, 0.04, '#3a2a1a', 0.12);
        this._shadedBox(x, 0.63, z, 0.2, 0.02, 0.04, '#3a2a1a', 0.12);
        // Shutters
        this._shadedBox(x - 0.22, 0.66, z, 0.06, 0.5, 0.05, '#2a1a0a', 0.16);
        this._shadedBox(x + 0.22, 0.66, z, 0.06, 0.5, 0.05, '#2a1a0a', 0.16);
        if (!hasN) this._shadedBox(x, 1.2, z, 1.06, 0.08, 1.06, COLORS.wall[2], 0.12);
        break;
      }
      case T.ROOF: break; // Rendered seamlessly in _buildRoofs pass
      case T.FENCE: {
        const ft = Math.floor(x), fz = Math.floor(z);
        const fProps = (tx2, tz2) => { if (tx2 < 0 || tz2 < 0 || tz2 >= this.zoneH || tx2 >= this.zoneW) return false; const t = this._tiles[tz2][tx2]; return t === T.FENCE; };
        const fn = fProps(ft, fz - 1), fs = fProps(ft, fz + 1), fe = fProps(ft + 1, fz), fw = fProps(ft - 1, fz);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3018 });
        const railMat = new THREE.MeshStandardMaterial({ color: 0x3a2010 });
        // central post only when this tile stands alone or at a junction
        if (!fn && !fs && !fe && !fw) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), postMat);
          post.position.set(x, 0.25, z); this.worldGroup.add(post);
        }
        // rails extending toward each connected neighbor
        if (fs) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.5), railMat); r.position.set(x, 0.42, z + 0.25); this.worldGroup.add(r); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.5), railMat); r2.position.set(x, 0.22, z + 0.25); this.worldGroup.add(r2); }
        if (fn) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.5), railMat); r.position.set(x, 0.42, z - 0.25); this.worldGroup.add(r); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.5), railMat); r2.position.set(x, 0.22, z - 0.25); this.worldGroup.add(r2); }
        if (fe) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.06), railMat); r.position.set(x + 0.25, 0.42, z); this.worldGroup.add(r); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.06), railMat); r2.position.set(x + 0.25, 0.22, z); this.worldGroup.add(r2); }
        if (fw) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.06), railMat); r.position.set(x - 0.25, 0.42, z); this.worldGroup.add(r); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.06), railMat); r2.position.set(x - 0.25, 0.22, z); this.worldGroup.add(r2); }
        // end posts only at true run ends — along the fence's axis, not the open sides
        const hasHoriz = fe || fw;
        const hasVert = fn || fs;
        if (hasHoriz) {
          if (!fe) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), postMat); post.position.set(x + 0.42, 0.25, z); this.worldGroup.add(post); }
          if (!fw) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), postMat); post.position.set(x - 0.42, 0.25, z); this.worldGroup.add(post); }
        } else if (hasVert) {
          if (!fs) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), postMat); post.position.set(x, 0.25, z + 0.42); this.worldGroup.add(post); }
          if (!fn) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), postMat); post.position.set(x, 0.25, z - 0.42); this.worldGroup.add(post); }
        }
        break;
      }
      case T.TREE: this._addTree(x, z, 0x3a2a1a, 0x2a3a2a, 1.0); break;
      case T.TWISTED_TREE: this._addTree(x, z, 0x2a1f14, 0x15281a, 0.9, true); break;
      case T.PINE: this._addPine(x, z); break;
      case T.OAK: this._addTree(x, z, 0x3a2a1a, 0x2a4228, 1.2); break;
      case T.BIRCH: this._addTree(x, z, 0xd4d4c8, 0x8a9a4a, 1.0, false, true); break;
      case T.WILLOW: this._addTree(x, z, 0x3a2a1a, 0x4a6a3a, 1.1, false, false, true); break;
      case T.DEAD_TREE: this._addDeadTree(x, z); break;
      case T.BIG_TREE: this._addBigTree(x, z); break;
      case T.ROCK: this._addRock(x, z, 1); break;
      case T.STONE_CIRCLE: this._addRock(x, z, 0.5); break;
      case T.RUIN: this._shadedBox(x, 0.2, z, 0.6, 0.4, 0.6, COLORS.ruin[0], 0.18); break;
      case T.CAVE: this._shadedBox(x, 0.5, z, 1, 1, 0.8, '#1a1a22', 0.12); break;
      case T.BED: {
        this._shadedBox(x, 0.1, z, 0.8, 0.16, 0.9, '#3a2410', 0.14); // frame base
        this._shadedBox(x, 0.22, z, 0.72, 0.14, 0.82, '#5a3a2a', 0.14); // mattress
        this._shadedBox(x, 0.08, z, 0.8, 0.4, 0.1, '#4a2a18', 0.14); // headboard
        this._box(x, 0.32, z + 0.25, 0.5, 0.06, 0.2, '#e0d8c4'); // pillow
        this._shadedBox(x, 0.28, z - 0.15, 0.7, 0.06, 0.35, '#5a3a4a', 0.14); // blanket
        break;
      }
      case T.TABLE: {
        this._shadedBox(x, 0.35, z, 0.7, 0.08, 0.7, '#6a4a2a', 0.16); // top
        this._shadedBox(x - 0.25, 0.2, z, 0.06, 0.32, 0.06, '#4a3018', 0.14); // legs
        this._shadedBox(x + 0.25, 0.2, z, 0.06, 0.32, 0.06, '#4a3018', 0.14);
        break;
      }
      case T.CHAIR: {
        this._shadedBox(x, 0.25, z, 0.36, 0.06, 0.36, '#5a3a1a', 0.16); // seat
        this._shadedBox(x, 0.45, z, 0.04, 0.3, 0.36, '#3a1a08', 0.14); // backrest
        this._shadedBox(x - 0.14, 0.12, z, 0.04, 0.22, 0.04, '#3a1a08', 0.14); // legs
        this._shadedBox(x + 0.14, 0.12, z, 0.04, 0.22, 0.04, '#3a1a08', 0.14);
        break;
      }
      case T.CHEST: {
        this._shadedBox(x, 0.2, z, 0.6, 0.32, 0.5, '#5a3a1a', 0.16); // body
        this._shadedBox(x, 0.4, z, 0.62, 0.12, 0.52, '#6a4a2a', 0.14); // lid
        break;
      }
      case T.STOVE: {
        this._shadedBox(x, 0.3, z, 0.5, 0.6, 0.5, '#3a3a3e', 0.14); // body
        this._shadedBox(x, 0.62, z, 0.52, 0.06, 0.52, '#2a2a2e', 0.12); // top plate
        this._box(x, 0.5, z, 0.5, 0.6, 0.5, '#3a3a3e', '#2a2a2e', '#ff6600'); // glow overlay
        this._light(x, 0.5, z, 0xff8a3a, 1.5, 3);
        break;
      }
      case T.BOOKSHELF: {
        this._shadedBox(x, 0.5, z, 0.7, 1.0, 0.3, '#4a3018', 0.16); // frame
        for (let i = 0; i < 3; i++) this._shadedBox(x, 0.15 + i * 0.3, z, 0.68, 0.02, 0.28, '#5a4230', 0.12); // shelves
        break;
      }
      case T.WORKBENCH: {
        this._shadedBox(x, 0.35, z, 0.7, 0.1, 0.5, '#6a4a2a', 0.16); // top
        this._shadedBox(x - 0.28, 0.18, z, 0.06, 0.32, 0.46, '#4a3018', 0.14); // legs
        this._shadedBox(x + 0.28, 0.18, z, 0.06, 0.32, 0.46, '#4a3018', 0.14);
        break;
      }
      case T.CRATE: this._addCrate(x, z); break;
      case T.BARREL: this._addBarrel(x, z); break;
      case T.ANVIL: this._addAnvil(x, z); break;
      case T.BENCH: {
        this._shadedBox(x, 0.22, z, 0.7, 0.06, 0.3, '#5a3a1a', 0.16); // seat
        this._shadedBox(x, 0.4, z, 0.04, 0.3, 0.3, '#3a1a08', 0.14); // backrest
        this._shadedBox(x - 0.28, 0.1, z, 0.05, 0.18, 0.28, '#3a1a08', 0.14); // legs
        this._shadedBox(x + 0.28, 0.1, z, 0.05, 0.18, 0.28, '#3a1a08', 0.14);
        break;
      }
      case T.PAINTING: this._shadedBox(x, 0.6, z, 0.3, 0.4, 0.05, '#4a3018', 0.16); break;
      case T.WELL: this._addWell(x, z); break;
      case T.LANTERN_POST: this._addLanternPost(x, z); break;
      case T.LANTERN_FLOOR: this._light(x, 0.1, z, 0xffb04a, 1.5, 4); break;
      case T.CAMPFIRE: this._addCampfire(x, z); break;
      case T.SIGN: this._addSign(x, z); break;
      case T.CRYSTAL: this._addCrystal(x, z); break;
      case T.STATUE: this._addStatue(x, z); break;
      case T.TENTACLE_STATUE: this._addTentacleStatue(x, z); break;
      case T.GRAVE: this._addGraveMound(x, z); break;
      case T.GRAVESTONE: this._addGravestone(x, z); break;
      case T.STAIRS_DOWN: this._addStairs(x, z, true); break;
      case T.STAIRS_UP: this._addStairs(x, z, false); break;
      case T.GROTTO_CHEST: {
        this._shadedBox(x, 0.2, z, 0.6, 0.32, 0.5, '#5a3a1a', 0.16);
        this._shadedBox(x, 0.4, z, 0.62, 0.12, 0.52, '#6a4a2a', 0.14);
        this._light(x, 0.4, z, 0xd4a838, 1.0, 3);
        break;
      }
      case T.LIGHTHOUSE_KEY_CHEST: {
        // Large golden chest with a strong amber glow — impossible to miss
        this._shadedBox(x, 0.15, z, 0.8, 0.45, 0.65, '#d4a020', 0.18);
        this._shadedBox(x, 0.55, z, 0.82, 0.18, 0.67, '#f0c030', 0.16);
        this._box(x, 0.68, z, 0.1, 0.1, 0.1, '#f0e040', '#c0a020', '#fff060');
        this._light(x, 0.5, z, 0xffcc44, 4.0, 8);
        this._light(x, 0.5, z, 0xff8800, 2.0, 5);
        break;
      }
      case T.PUMPKIN: this._addPumpkin(x, z); break;
      case T.CANDLES: this._addCandles(x, z); break;
      case T.PLANT_POT: this._addCyl(x, z, 0.2, 0.15, 0.3, 0x8a6a4a); break;
      case T.BUSH: this._addBush(x, z, 0x2a3a2a); break;
      case T.BERRY_BUSH: this._addBush(x, z, 0x2a3a2a, 0xd44040); break;
      case T.STUMP: this._addCyl(x, z, 0.2, 0.25, 0.3, 0x3a2a1a); break;
      case T.FALLEN_LOG: this._box(x, 0.1, z, 0.8, 0.2, 0.25, COLORS.trunk[0], COLORS.trunk[1]); break;
      case T.FLOWER: this._addFlower(x, z); break;
      case T.MUSHROOM: this._addMushroom(x, z); break;
      case T.PEBBLE: this._addSphere(x, z, 0.08, 0, 0x8a8a8e); break;
      case T.FERN: this._addCone(x, z, 0.15, 0.3, 0x3a6a3a, true); break;
      case T.TALL_GRASS: for (let i = 0; i < 3; i++) this._addCyl(x + (Math.random()-0.5)*0.3, z + (Math.random()-0.5)*0.3, 0.01, 0.02, 0.25, 0x6a9a4a); break;
      case T.WITCH_TOME: this._addWitchTome(x, z); break;
      case T.BONE_PILE: this._addBonePile(x, z); break;
      case T.SKULL_TOTEM: this._addSkullTotem(x, z); break;
      case T.HANGING_MOSS: this._addHangingMoss(x, z); break;
      case T.GRAVE_CROSS: this._addGraveCross(x, z); break;
      case T.SPIDER_WEB: this._addSpiderWeb(x, z); break;
      // ── Cabin decoration tiles ──
      case T.POSTER: {
        this._addWallBg(x, z); this._shadedBox(x, 0.7, z, 0.35, 0.45, 0.04, '#2a1a0a', 0.14);
        this._box(x, 0.72, z, 0.3, 0.38, 0.02, '#5a4a8a', '#3a2a6a', '#7a6aaa'); break;
      }
      case T.PICTURE_FRAME: {
        this._addWallBg(x, z); this._shadedBox(x, 0.65, z, 0.28, 0.35, 0.06, '#3a2a1a', 0.14);
        this._shadedBox(x, 0.67, z, 0.22, 0.28, 0.03, '#d4a04a', 0.1);
        this._box(x, 0.68, z, 0.18, 0.22, 0.02, '#4a6a8a', '#2a4a6a', '#6a8aaa'); break;
      }
      case T.TALL_PLANT: {
        this._addCyl(x, z, 0.18, 0.14, 0.35, 0x8a6a4a);
        const tpStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.8, 4), new THREE.MeshStandardMaterial({ color: 0x4a7a3a }));
        tpStem.position.set(x, 0.75, z); this.worldGroup.add(tpStem);
        for (let i = 0; i < 5; i++) {
          const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), new THREE.MeshStandardMaterial({ color: 0x3a6a3a, flatShading: true }));
          leaf.position.set(x + (Math.random() - 0.5) * 0.2, 0.9 + i * 0.12, z + (Math.random() - 0.5) * 0.2);
          leaf.scale.set(1, 0.6, 1); this.worldGroup.add(leaf);
        }
        break;
      }
      case T.HANGING_PLANT: {
        this._box(x, 0.9, z, 0.02, 0.2, 0.02, '#4a4a4e');
        const hpPot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }));
        hpPot.position.set(x, 0.8, z); this.worldGroup.add(hpPot);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), new THREE.MeshStandardMaterial({ color: 0x4a7a3a, flatShading: true }));
          leaf.position.set(x + Math.cos(a) * 0.15, 0.7, z + Math.sin(a) * 0.15);
          leaf.scale.set(1, 0.8, 1); this.worldGroup.add(leaf);
        }
        break;
      }
      case T.FLOWER_VASE: {
        this._addCyl(x, z, 0.1, 0.06, 0.25, 0x6a8aaa);
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2;
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 3), new THREE.MeshStandardMaterial({ color: 0x5a8a4a }));
          stem.position.set(x + Math.cos(a) * 0.04, 0.35, z + Math.sin(a) * 0.04); this.worldGroup.add(stem);
          const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), new THREE.MeshStandardMaterial({ color: [0xd4a5c0, 0xc4b04a, 0xa0a0d4][i] }));
          bloom.position.set(x + Math.cos(a) * 0.04, 0.45, z + Math.sin(a) * 0.04); this.worldGroup.add(bloom);
        }
        break;
      }
      case T.FIREPLACE: {
        this._shadedBox(x, 0.5, z, 0.9, 1.0, 0.5, '#5a5a5e', 0.14);
        this._shadedBox(x, 0.9, z, 0.92, 0.2, 0.52, '#4a4a4e', 0.12);
        this._box(x, 0.35, z, 0.5, 0.4, 0.3, '#1a1a1e');
        this._box(x, 0.4, z, 0.35, 0.25, 0.2, '#ff6600', '#ff4400', '#ffaa30');
        this._light(x, 0.5, z, 0xff8a30, 2.5, 5);
        this._shadedBox(x, 1.1, z, 0.3, 0.5, 0.3, '#4a4a4e', 0.12);
        break;
      }
      case T.FLOOR_LAMP: {
        this._addCyl(x, z, 0.12, 0.15, 0.05, 0x3a2a1a);
        this._addCyl(x, z, 0.02, 0.02, 0.7, 0x4a3828);
        const flShade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffb060, emissiveIntensity: 0.4 }));
        flShade.position.set(x, 0.8, z); this.worldGroup.add(flShade);
        this._light(x, 0.85, z, 0xffd080, 1.5, 4);
        break;
      }
      case T.WALL_CLOCK: {
        this._addWallBg(x, z);
        const wcBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0x4a3a2a }));
        wcBody.rotation.x = Math.PI / 2; wcBody.position.set(x, 0.8, z + 0.02); this.worldGroup.add(wcBody);
        const wcFace = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), new THREE.MeshStandardMaterial({ color: 0xe0d0a0 }));
        wcFace.rotation.x = Math.PI / 2; wcFace.position.set(x, 0.8, z + 0.04); this.worldGroup.add(wcFace);
        break;
      }
      case T.MIRROR: {
        this._addWallBg(x, z);
        this._shadedBox(x, 0.7, z, 0.3, 0.5, 0.05, '#3a2a1a', 0.14);
        this._box(x, 0.72, z, 0.22, 0.4, 0.02, '#a0c0d0', '#6080a0', '#c0e0f0');
        break;
      }
      case T.BOOK_STACK: {
        const bookCols = ['#8a3a2a', '#3a5a4a', '#5a4a8a'];
        for (let i = 0; i < 3; i++)
          this._shadedBox(x, 0.03 + i * 0.06, z, 0.4, 0.05, 0.3, bookCols[i], 0.14);
        break;
      }
      case T.TRAPDOOR: {
        this._shadedBox(x, 0.02, z, 0.85, 0.04, 0.85, '#2a1e14', 0.16);
        this._shadedBox(x, 0.04, z, 0.7, 0.02, 0.7, '#3a2a1a', 0.14);
        // iron ring handle
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 4, 8), new THREE.MeshStandardMaterial({ color: 0x3a3a3e }));
        ring.position.set(x, 0.06, z); ring.rotation.x = -Math.PI / 2;
        this.worldGroup.add(ring);
        break;
      }
    }
  }

  // ── Seamless roof pass: one pitched roof per building ──
  _buildRoofs(tiles) {
    const w = this.zoneW, h = this.zoneH;
    const visited = new Set();

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (tiles[y][x] !== T.ROOF) continue;
        const key = `${x},${y}`;
        if (visited.has(key)) continue;

        // Flood-fill to find the building's bounding box
        let minX = x, maxX = x, minY = y, maxY = y;
        const queue = [[x, y]];
        while (queue.length > 0) {
          const [cx, cy] = queue.pop();
          const k = `${cx},${cy}`;
          if (visited.has(k)) continue;
          if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
          const t = tiles[cy][cx];
          if (t !== T.WALL && t !== T.ROOF && t !== T.DOOR && t !== T.WINDOW) continue;
          visited.add(k);
          minX = Math.min(minX, cx); maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy); maxY = Math.max(maxY, cy);
          queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }

        const bw = maxX - minX + 1;
        const bd = maxY - minY + 1;
        const bcx = (minX + maxX) / 2 + 0.5;
        const bcz = (minY + maxY) / 2 + 0.5;
        const roofY = 1.22;

        // Flat eave overhang — slightly wider than the building
        this._shadedBox(bcx, roofY, bcz, bw + 0.4, 0.05, bd + 0.4, COLORS.roof[2], 0.12);

        // Pitched roof — seamless across the entire building
        const ridgeH = Math.min(0.7, Math.max(bw, bd) * 0.18);
        this._addBuildingRoof(bcx, bcz, bw, bd, roofY + 0.03, ridgeH);

        // Ridge cap beam
        const ridgeAlongX = bw >= bd;
        if (ridgeAlongX) {
          this._shadedBox(bcx, roofY + 0.03 + ridgeH, bcz, bw + 0.1, 0.04, 0.12, COLORS.roof[2], 0.1);
        } else {
          this._shadedBox(bcx, roofY + 0.03 + ridgeH, bcz, 0.12, 0.04, bd + 0.1, COLORS.roof[2], 0.1);
        }

        // Chimney — on a corner, sparse
        const cSeed = Math.floor(bcx * 37 + bcz * 53);
        if (cSeed % 3 === 0) {
          const chimX = bcx + bw / 2 - 0.3;
          const chimZ = bcz - bd / 2 + 0.3;
          this._shadedBox(chimX, roofY + 0.4, chimZ, 0.18, 0.5, 0.18, '#5a5a5e', 0.14);
          this._shadedBox(chimX, roofY + 0.63, chimZ, 0.2, 0.04, 0.2, '#4a4a4e', 0.12);
        }
      }
    }
  }

  _addBuildingRoof(cx, cz, w, d, yBase, ridgeH) {
    const hw = w / 2, hd = d / 2;
    const alongX = w >= d;
    let positions;
    if (alongX) {
      // Ridge along X: slopes face north and south
      positions = new Float32Array([
        -hw, 0, hd,  hw, 0, hd,  hw, ridgeH, 0,
        -hw, 0, hd,  hw, ridgeH, 0,  -hw, ridgeH, 0,
        -hw, 0, -hd,  hw, ridgeH, 0,  hw, 0, -hd,
        -hw, 0, -hd,  -hw, ridgeH, 0,  hw, ridgeH, 0,
        -hw, 0, hd,  -hw, ridgeH, 0,  -hw, 0, -hd,
        hw, 0, hd,  hw, 0, -hd,  hw, ridgeH, 0,
      ]);
    } else {
      // Ridge along Z: slopes face east and west
      positions = new Float32Array([
        hw, 0, -hd,  0, ridgeH, -hd,  0, ridgeH, hd,
        hw, 0, -hd,  0, ridgeH, hd,  hw, 0, hd,
        -hw, 0, -hd,  0, ridgeH, hd,  0, ridgeH, -hd,
        -hw, 0, -hd,  -hw, 0, hd,  0, ridgeH, hd,
        -hw, 0, hd,  hw, 0, hd,  0, ridgeH, hd,
        -hw, 0, -hd,  0, ridgeH, -hd,  hw, 0, -hd,
      ]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: C(COLORS.roof[0]), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, yBase, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.worldGroup.add(mesh);
  }

  // Building door — proper wooden door set into the wall
  _addBuildingDoor(x, z) {
    const tx = Math.floor(x), tz = Math.floor(z);
    const hasN = this._isBuildingTile(tx, tz - 1);
    const hasS = this._isBuildingTile(tx, tz + 1);

    // Stone foundation — only on the exterior side
    if (!hasS) {
      this._shadedBox(x, 0.06, z, 1.02, 0.14, 1.02, COLORS.stone[0], 0.1);
      this._shadedBox(x, 0.14, z, 1.02, 0.02, 1.02, '#4a4a52', 0.15);
    }

    // Wall body behind the door — full siding
    const wallBottom = hasS ? 0.14 : 0.16;
    const wallTop = hasN ? 1.18 : 1.16;
    const wallH = wallTop - wallBottom;
    this._shadedBox(x, wallBottom + wallH / 2, z, 1.0, wallH, 0.4, COLORS.wall[0], 0.16);
    // Siding courses
    this._shadedBox(x, wallBottom + wallH * 0.25, z, 1.005, 0.015, 0.41, COLORS.wall[2], 0.2);
    this._shadedBox(x, wallBottom + wallH * 0.82, z, 1.005, 0.015, 0.41, COLORS.wall[2], 0.2);
    // Corner posts at edges
    if (!this._isBuildingTile(tx - 1, tz))
      this._shadedBox(x - 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 0.4, COLORS.wall[2], 0.18);
    if (!this._isBuildingTile(tx + 1, tz))
      this._shadedBox(x + 0.46, wallBottom + wallH / 2, z, 0.08, wallH, 0.4, COLORS.wall[2], 0.18);

    // Door frame — dark wood, raised from wall surface
    const frameY = wallBottom + 0.48;
    this._shadedBox(x - 0.28, frameY, z + 0.04, 0.06, 0.95, 0.06, COLORS.wall[2], 0.14);
    this._shadedBox(x + 0.28, frameY, z + 0.04, 0.06, 0.95, 0.06, COLORS.wall[2], 0.14);
    this._shadedBox(x, wallBottom + 0.96, z + 0.04, 0.62, 0.06, 0.06, COLORS.wall[2], 0.12);

    // Door slab — two vertical planks
    const slabY = wallBottom + 0.44;
    this._shadedBox(x - 0.12, slabY, z + 0.06, 0.22, 0.8, 0.04, '#4a2a12', 0.12);
    this._shadedBox(x + 0.12, slabY, z + 0.06, 0.22, 0.8, 0.04, '#4a2a12', 0.12);

    // Iron hinges
    this._shadedBox(x - 0.22, slabY + 0.25, z + 0.08, 0.05, 0.05, 0.02, '#3a3a3e', 0.1);
    this._shadedBox(x - 0.22, slabY - 0.2, z + 0.08, 0.05, 0.05, 0.02, '#3a3a3e', 0.1);

    // Door handle
    this._shadedBox(x + 0.2, slabY, z + 0.08, 0.03, 0.03, 0.03, '#8a7a4a', 0.08);

    // Warm light from threshold
    this._light(x, 0.4, z, 0xffaa44, 0.5, 2);

    // Top cap beam
    if (!hasN) {
      this._shadedBox(x, 1.2, z, 1.06, 0.08, 1.06, COLORS.wall[2], 0.12);
    }
  }

  // Interior door — proper wooden door with iron hinges and warm light
  _addInteriorDoor(x, z) {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a12 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a6a6e });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3e });

    // stone arch base — steps
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9), stoneMat);
    step.position.set(0, 0.04, 0); g.add(step);

    // door frame pillars (left & right)
    const frameDepth = 0.18;
    const lp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, frameDepth), frameMat);
    lp.position.set(-0.38, 0.6, 0); g.add(lp);
    const rp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, frameDepth), frameMat);
    rp.position.set(0.38, 0.6, 0); g.add(rp);

    // arched lintel — curved top using a thin box + half-cylinder
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.12, frameDepth), frameMat);
    lintel.position.set(0, 1.2, 0); g.add(lintel);
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 8, 1, false, 0, Math.PI), frameMat);
    arch.rotation.z = Math.PI / 2; arch.rotation.y = Math.PI / 2;
    arch.position.set(0, 1.26, 0); g.add(arch);

    // door slab — two planks with a gap line
    const slabL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.05, 0.06), woodMat);
    slabL.position.set(-0.08, 0.58, 0); g.add(slabL);
    const slabR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.05, 0.06), woodMat);
    slabR.position.set(0.08, 0.58, 0); g.add(slabR);

    // iron hinges
    const hingeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.12, 4);
    const hl = new THREE.Mesh(hingeGeo, ironMat); hl.rotation.z = Math.PI / 2; hl.position.set(-0.34, 0.85, 0.04); g.add(hl);
    const hl2 = new THREE.Mesh(hingeGeo, ironMat); hl2.rotation.z = Math.PI / 2; hl2.position.set(-0.34, 0.35, 0.04); g.add(hl2);

    // iron ring handle
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.015, 4, 8), ironMat);
    ring.position.set(0.02, 0.58, 0.07); ring.rotation.x = Math.PI / 2; g.add(ring);

    // warm light spilling from the threshold
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.1), new THREE.MeshBasicMaterial({ color: 0xffb04a, transparent: true, opacity: 0.3 }));
    glow.position.set(0, 0.06, 0); glow.rotation.x = -Math.PI / 2; g.add(glow);

    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
    this._light(x, 0.6, z, 0xffaa44, 0.8, 3);
  }

  // Exterior door — routes between building doors and standalone portals
  _addPortalDoor(x, z) {
    const tx = Math.floor(x), tz = Math.floor(z);
    const isBuildingDoor = this._isBuildingTile(tx - 1, tz) || this._isBuildingTile(tx + 1, tz) ||
                           this._isBuildingTile(tx, tz - 1) || this._isBuildingTile(tx, tz + 1);
    if (isBuildingDoor) {
      this._addBuildingDoor(x, z);
    } else {
      this._addPortalArch(x, z);
    }
  }

  // Standalone portal — stone archway with mist (for zone transitions)
  _addPortalArch(x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5a64, flatShading: true });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a, flatShading: true });
    const mistMat = new THREE.MeshBasicMaterial({ color: 0xa0b0d0, transparent: true, opacity: 0.25 });

    // stone pillar bases (left & right)
    const lp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), stoneMat);
    lp.position.set(-0.35, 0.7, 0); g.add(lp);
    const rp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), stoneMat);
    rp.position.set(0.35, 0.7, 0); g.add(rp);

    // moss on pillars
    const ml = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 4), mossMat);
    ml.position.set(-0.35, 1.1, 0.12); ml.scale.y = 0.4; g.add(ml);
    const mr = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 4), mossMat);
    mr.position.set(0.35, 0.8, 0.1); mr.scale.y = 0.4; g.add(mr);

    // arched top — half-cylinder lintel
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 8, 1, false, 0, Math.PI), stoneMat);
    arch.rotation.z = Math.PI / 2; arch.rotation.y = Math.PI / 2;
    arch.position.set(0, 1.4, 0); g.add(arch);

    // mist threshold — semi-transparent plane at ground level
    const mist = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), mistMat);
    mist.rotation.x = -Math.PI / 2; mist.position.y = 0.03; g.add(mist);

    // glowing waypoint light
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.6 }));
    orb.position.set(0, 0.7, 0); g.add(orb);

    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
    this._light(x, 0.7, z, 0x6a8acc, 0.6, 3);
  }

  _addCyl(x, z, r1, r2, h, color) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 8), new THREE.MeshStandardMaterial({ color }));
    mesh.position.set(x, h / 2, z);
    this.worldGroup.add(mesh);
  }

  _addSphere(x, z, r, yOffset, color, emissive) {
    const geo = new THREE.SphereGeometry(r, 8, 6);
    if (yOffset === 0x2a) geo.scale(1, 0.8, 1); // pumpkin
    const opts = { color };
    if (emissive) { opts.emissive = emissive; opts.emissiveIntensity = 0.3; }
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial(opts));
    mesh.position.set(x, (yOffset === 0x2a ? r * 0.8 : r) + 0.05, z);
    this.worldGroup.add(mesh);
  }

  _addCone(x, z, r, h, color, flip) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), new THREE.MeshStandardMaterial({ color }));
    mesh.position.set(x, flip ? h - 0.15 : h / 2, z);
    if (flip) mesh.rotation.z = Math.PI;
    this.worldGroup.add(mesh);
  }

  _addTree(x, z, trunkCol, canopyCol, scale, twisted, birch, willow) {
    // Apply seasonal foliage to deciduous trees (birch & willow keep their look)
    if (this.foliage && !birch && !willow) canopyCol = this.foliage.treeCanopy;
    const g = new THREE.Group();
    const trunkH = 1.2 * scale;
    const trunkR = 0.1 * scale;
    const trunkMat = new THREE.MeshStandardMaterial({ color: trunkCol });
    // root flare at base — thick roots spreading into the ground
    const rootMat = new THREE.MeshStandardMaterial({ color: trunkCol, flatShading: true });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.25 * scale, 4), rootMat);
      root.position.set(Math.cos(a) * 0.1 * scale, 0.05, Math.sin(a) * 0.1 * scale);
      root.rotation.z = Math.cos(a) * 0.5; root.rotation.x = Math.sin(a) * 0.5;
      g.add(root);
    }
    // thick tapered trunk with visible height
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.7, trunkR * 1.3, trunkH, 8), trunkMat);
    trunk.position.y = trunkH / 2; g.add(trunk);
    // bark ridges — vertical detail strips
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.025 * scale, trunkH * 0.85, 0.035 * scale), trunkMat);
      ridge.position.set(Math.cos(a) * trunkR * 0.9, trunkH / 2, Math.sin(a) * trunkR * 0.9);
      g.add(ridge);
    }
    if (twisted) {
      trunk.rotation.y = (x * 37 + z * 53) % 6;
      trunk.rotation.z = 0.15;
    }
    // multi-layered canopy — dense, volumetric with depth shading
    const baseCol = new THREE.Color(canopyCol);
    const lightCol = new THREE.Color(canopyCol).offsetHSL(0, 0, 0.08);
    const darkCol = new THREE.Color(canopyCol).offsetHSL(0, 0, -0.1);
    const canopyMat = new THREE.MeshStandardMaterial({ color: baseCol, flatShading: true });
    const lightCanopyMat = new THREE.MeshStandardMaterial({ color: lightCol, flatShading: true });
    const darkCanopyMat = new THREE.MeshStandardMaterial({ color: darkCol, flatShading: true });
    const cy0 = trunkH;
    // lower wide canopy — 3 lobes for organic shape
    const c1a = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 * scale, 0), canopyMat);
    c1a.position.set(0, cy0 + 0.15, 0); c1a.scale.set(1, 0.75, 1); g.add(c1a);
    const c1b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 * scale, 0), lightCanopyMat);
    c1b.position.set(0.25 * scale, cy0 + 0.2, 0.15 * scale); c1b.scale.set(1, 0.8, 1); g.add(c1b);
    const c1c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28 * scale, 0), darkCanopyMat);
    c1c.position.set(-0.2 * scale, cy0 + 0.1, -0.18 * scale); c1c.scale.set(1, 0.85, 1); g.add(c1c);
    // mid canopy — offset, brighter top
    const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 * scale, 0), lightCanopyMat);
    c2.position.set(0.12 * scale, cy0 + 0.5, 0.08 * scale); c2.scale.set(1, 0.8, 1); g.add(c2);
    const c2b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 * scale, 0), canopyMat);
    c2b.position.set(-0.15 * scale, cy0 + 0.45, 0.2 * scale); c2b.scale.set(1, 0.85, 1); g.add(c2b);
    // top canopy — smaller, highest, catching sunlight
    const c3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 * scale, 0), lightCanopyMat);
    c3.position.set(-0.05 * scale, cy0 + 0.85, -0.05 * scale); c3.scale.set(1, 0.85, 1); g.add(c3);
    if (birch) {
      // birch bark markings — dark horizontal slashes
      for (let i = 0; i < 4; i++) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(trunkR * 1.5, 0.025, 0.02), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
        mark.position.set(0, 0.25 + i * 0.3, trunkR);
        g.add(mark);
      }
    }
    if (willow) {
      // drooping willow branches — longer, more numerous
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.8 * scale, 3), canopyMat);
        drop.position.set(Math.cos(a) * 0.4 * scale, cy0 + 0.15, Math.sin(a) * 0.4 * scale);
        drop.rotation.z = Math.cos(a) * 0.6; drop.rotation.x = Math.sin(a) * 0.6; g.add(drop);
      }
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addBigTree(x, z) {
    const g = new THREE.Group();
    const scale = 2.6;
    const trunkCol = 0x2a1a10;
    const canopyCol = this.foliage ? this.foliage.treeCanopy : 0x2a3a2a;
    const trunkH = 2.8;
    const trunkR = 0.22 * scale;
    const trunkMat = new THREE.MeshStandardMaterial({ color: trunkCol, flatShading: true });
    // massive root flare — thick roots spreading wide into the ground
    const rootMat = new THREE.MeshStandardMaterial({ color: trunkCol, flatShading: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.14 * scale, 0.6 * scale, 5), rootMat);
      root.position.set(Math.cos(a) * 0.2 * scale, 0.08, Math.sin(a) * 0.2 * scale);
      root.rotation.z = Math.cos(a) * 0.6; root.rotation.x = Math.sin(a) * 0.6;
      g.add(root);
    }
    // massive tapered trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.6, trunkR * 1.2, trunkH, 10), trunkMat);
    trunk.position.y = trunkH / 2; g.add(trunk);
    // bark ridges
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, trunkH * 0.9, 0.06 * scale), trunkMat);
      ridge.position.set(Math.cos(a) * trunkR * 0.85, trunkH / 2, Math.sin(a) * trunkR * 0.85);
      g.add(ridge);
    }
    // gnarled burls on the trunk
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      const burl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08 * scale, 0), trunkMat);
      burl.position.set(Math.cos(a) * trunkR * 0.9, 0.5 + i * 0.5, Math.sin(a) * trunkR * 0.9);
      g.add(burl);
    }
    // huge multi-layered canopy
    const baseCol = new THREE.Color(canopyCol);
    const lightCol = new THREE.Color(canopyCol).offsetHSL(0, 0, 0.08);
    const darkCol = new THREE.Color(canopyCol).offsetHSL(0, 0, -0.12);
    const canopyMat = new THREE.MeshStandardMaterial({ color: baseCol, flatShading: true });
    const lightCanopyMat = new THREE.MeshStandardMaterial({ color: lightCol, flatShading: true });
    const darkCanopyMat = new THREE.MeshStandardMaterial({ color: darkCol, flatShading: true });
    const cy0 = trunkH;
    // lower wide canopy — 5 large lobes
    const c1a = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 * scale, 0), canopyMat);
    c1a.position.set(0, cy0 + 0.2, 0); c1a.scale.set(1, 0.75, 1); g.add(c1a);
    const c1b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45 * scale, 0), lightCanopyMat);
    c1b.position.set(0.35 * scale, cy0 + 0.3, 0.2 * scale); c1b.scale.set(1, 0.8, 1); g.add(c1b);
    const c1c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 * scale, 0), darkCanopyMat);
    c1c.position.set(-0.3 * scale, cy0 + 0.15, -0.25 * scale); c1c.scale.set(1, 0.85, 1); g.add(c1c);
    const c1d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35 * scale, 0), canopyMat);
    c1d.position.set(0.15 * scale, cy0 + 0.1, -0.3 * scale); c1d.scale.set(1, 0.8, 1); g.add(c1d);
    const c1e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 * scale, 0), darkCanopyMat);
    c1e.position.set(-0.25 * scale, cy0 + 0.35, 0.2 * scale); c1e.scale.set(1, 0.8, 1); g.add(c1e);
    // mid canopy
    const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * scale, 0), lightCanopyMat);
    c2.position.set(0.15 * scale, cy0 + 0.7, 0.1 * scale); c2.scale.set(1, 0.8, 1); g.add(c2);
    const c2b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35 * scale, 0), canopyMat);
    c2b.position.set(-0.2 * scale, cy0 + 0.6, 0.25 * scale); c2b.scale.set(1, 0.85, 1); g.add(c2b);
    // top canopy
    const c3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 * scale, 0), lightCanopyMat);
    c3.position.set(-0.05 * scale, cy0 + 1.15, -0.05 * scale); c3.scale.set(1, 0.85, 1); g.add(c3);
    const c3b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 * scale, 0), canopyMat);
    c3b.position.set(0.1 * scale, cy0 + 1.4, 0.05 * scale); c3b.scale.set(1, 0.85, 1); g.add(c3b);
    // hanging moss from lower branches
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const moss = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.005, 0.5 * scale, 3), mossMat);
      moss.position.set(Math.cos(a) * 0.5 * scale, cy0 + 0.2, Math.sin(a) * 0.5 * scale);
      g.add(moss);
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addPine(x, z) {
    const g = new THREE.Group();
    const trunkH = 0.6;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, trunkH, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
    trunk.position.y = trunkH / 2; g.add(trunk);
    // tall layered pine cones — dense, towering with depth shading
    const pineBase = this.foliage ? this.foliage.pineCanopy : 0x1a3020;
    const pineLight = this.foliage ? this.foliage.pineCanopyLight : 0x2a4a34;
    const pineDark = new THREE.Color(pineBase).offsetHSL(0, 0, -0.08).getHex();
    const coneMatDark = new THREE.MeshStandardMaterial({ color: pineDark, flatShading: true });
    const coneMatMid = new THREE.MeshStandardMaterial({ color: pineBase, flatShading: true });
    const coneMatLight = new THREE.MeshStandardMaterial({ color: pineLight, flatShading: true });
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const mat = i % 2 === 0 ? coneMatMid : (i < 2 ? coneMatDark : coneMatLight);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42 - i * 0.07, 0.55, 7), mat);
      cone.position.y = trunkH + 0.15 + i * 0.3; g.add(cone);
      // small branch tufts at each layer
      if (i < layers - 1) {
        for (let b = 0; b < 3; b++) {
          const a = (b / 3) * Math.PI * 2 + i;
          const tuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), coneMatLight);
          tuft.position.set(Math.cos(a) * (0.35 - i * 0.06), trunkH + 0.15 + i * 0.3, Math.sin(a) * (0.35 - i * 0.06));
          tuft.scale.set(1, 0.6, 1);
          g.add(tuft);
        }
      }
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addDeadTree(x, z) {
    const g = new THREE.Group();
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x4a4038, flatShading: true });
    const darkBarkMat = new THREE.MeshStandardMaterial({ color: 0x2a2218, flatShading: true });
    const trunkH = 1.3;
    // root flare
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.2, 4), darkBarkMat);
      root.position.set(Math.cos(a) * 0.08, 0.04, Math.sin(a) * 0.08);
      root.rotation.z = Math.cos(a) * 0.4; root.rotation.x = Math.sin(a) * 0.4;
      g.add(root);
    }
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, trunkH, 6), barkMat);
    trunk.position.y = trunkH / 2;
    trunk.rotation.z = 0.05; trunk.rotation.y = (x * 37 + z * 53) % 6;
    g.add(trunk);
    // bark cracks — dark vertical strips
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + x;
      const crack = new THREE.Mesh(new THREE.BoxGeometry(0.02, trunkH * 0.7, 0.03), darkBarkMat);
      crack.position.set(Math.cos(a) * 0.08, trunkH / 2, Math.sin(a) * 0.08);
      g.add(crack);
    }
    // gnarled branches reaching outward and upward — two-tier for density
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const bLen = 0.45 + (i % 2) * 0.15;
      const bMat = i % 2 === 0 ? barkMat : darkBarkMat;
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, bLen, 4), bMat);
      const bx = Math.cos(a) * 0.18;
      const bz = Math.sin(a) * 0.18;
      b.position.set(bx, trunkH - 0.1 + bLen * 0.3, bz);
      b.rotation.z = Math.cos(a) * 0.8; b.rotation.x = Math.sin(a) * 0.8;
      g.add(b);
      // small twig offshoots — more numerous
      const twigs = i % 2 === 0 ? 2 : 1;
      for (let t = 0; t < twigs; t++) {
        const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.015, 0.18 + t * 0.05, 3), barkMat);
        twig.position.set(bx * (1.4 + t * 0.2), trunkH + bLen * (0.5 + t * 0.1), bz * (1.4 + t * 0.2));
        twig.rotation.z = Math.cos(a + 0.5 + t) * 1.0; twig.rotation.x = Math.sin(a + 0.5 + t) * 1.0;
        g.add(twig);
      }
    }
    // a few dead leaves clinging on
    if ((x * 37 + z * 53) % 3 === 0) {
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, flatShading: true });
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), leafMat);
        leaf.position.set((Math.random() - 0.5) * 0.4, trunkH + 0.1 + Math.random() * 0.3, (Math.random() - 0.5) * 0.4);
        g.add(leaf);
      }
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addRock(x, z, scale) {
    const g = new THREE.Group();
    // Clearly angular stone — tall, sharp octahedron facets (unmistakably rock, not bush)
    const mat = new THREE.MeshStandardMaterial({ color: 0x6a6a72, flatShading: true, roughness: 0.85 });
    const lightMat = new THREE.MeshStandardMaterial({ color: 0x8a8a92, flatShading: true, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a3a44, flatShading: true, roughness: 0.9 });
    const fissureMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, flatShading: true });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, flatShading: true });
    const r = 0.38 * scale;
    // main boulder — tall, sharp, narrow (taller than wide = clearly stone)
    const main = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), mat);
    main.position.set(0, r * 0.75, 0);
    main.scale.set(0.8, 1.15, 0.75);
    main.rotation.y = (x * 37 + z * 53) % 6;
    main.rotation.x = ((x * 13) % 10) * 0.05;
    g.add(main);
    // lighter top facet — catches light, sharp peak
    const top = new THREE.Mesh(new THREE.OctahedronGeometry(r * 0.6, 0), lightMat);
    top.position.set(r * 0.08, r * 1.2, -r * 0.05);
    top.scale.set(0.7, 0.7, 0.65);
    g.add(top);
    // dark fissure — vertical crack line, clearly rocky texture
    const fissure = new THREE.Mesh(new THREE.BoxGeometry(0.03, r * 1.4, 0.02), fissureMat);
    fissure.position.set(r * 0.2, r * 0.7, r * 0.15);
    fissure.rotation.y = 0.4;
    g.add(fissure);
    // secondary smaller rocks clustered around base — angular shards
    const seed = (x * 37 + z * 53);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + seed * 0.1;
      const sr = r * (0.3 + (seed * (i + 1) % 5) * 0.05);
      const small = new THREE.Mesh(new THREE.TetrahedronGeometry(sr, 0), i === 1 ? darkMat : mat);
      small.position.set(Math.cos(a) * r * 0.85, sr * 0.4, Math.sin(a) * r * 0.85);
      small.scale.set(1, 0.8, 1);
      small.rotation.set(seed % 3, (seed * (i + 3)) % 6, seed * 0.2);
      g.add(small);
    }
    // moss patches on the boulder — sparse, organic
    if (seed % 3 === 0) {
      for (let i = 0; i < 2; i++) {
        const moss = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 0.2, 0), mossMat);
        moss.position.set(Math.cos(seed + i * 2) * r * 0.45, r * 0.3, Math.sin(seed + i * 2) * r * 0.45);
        moss.scale.set(1, 0.3, 1);
        g.add(moss);
      }
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addWell(x, z) {
    const g = new THREE.Group();
    // stone base with depth
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x6a6a6e, flatShading: true });
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a54, flatShading: true });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.4, 8), baseMat);
    base.position.y = 0.2; g.add(base);
    // rim stones — individual visible stones
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), darkStoneMat);
      stone.position.set(Math.cos(a) * 0.34, 0.38, Math.sin(a) * 0.34);
      stone.scale.set(1, 0.6, 1);
      g.add(stone);
    }
    // dark water inside
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.28, 8), new THREE.MeshStandardMaterial({ color: 0x1a2a3a, transparent: true, opacity: 0.8 }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0.35; g.add(water);
    // wooden posts
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3018 });
    for (let i = 0; i < 2; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 4), woodMat);
      post.position.set(i === 0 ? -0.3 : 0.3, 0.7, 0); g.add(post);
    }
    // crossbeam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), woodMat);
    beam.position.set(0, 0.95, 0); g.add(beam);
    // roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 4), new THREE.MeshStandardMaterial({ color: 0x3a2a1e, flatShading: true }));
    roof.position.y = 1.1; roof.rotation.y = Math.PI / 4; g.add(roof);
    // bucket on a rope
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 3), new THREE.MeshStandardMaterial({ color: 0x6a5a3a }));
    rope.position.set(0, 0.7, 0); g.add(rope);
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 5), woodMat);
    bucket.position.set(0, 0.55, 0); g.add(bucket);
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addLanternPost(x, z) {
    const g = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x4a3018 }));
    post.position.y = 0.4; g.add(post);
    // decorative hook at top
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 4, 6, Math.PI), new THREE.MeshStandardMaterial({ color: 0x3a3a3e }));
    hook.position.y = 0.78; hook.rotation.x = Math.PI / 2; g.add(hook);
    // lantern housing
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
    housing.position.y = 0.82; g.add(housing);
    // glowing core
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshStandardMaterial({ color: 0xffd06a, emissive: 0xff9a3a, emissiveIntensity: 0.7 }));
    lantern.position.y = 0.85; g.add(lantern);
    // glow halo
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb04a, transparent: true, opacity: 0.2 }));
    halo.position.y = 0.85; g.add(halo);
    g.position.set(x, 0, z); this.worldGroup.add(g);
    this._light(x, 0.85, z, 0xffb04a, 1.8, 5);
  }

  _addCampfire(x, z) {
    const g = new THREE.Group();
    // stone ring around the fire
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5a64, flatShading: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), stoneMat);
      stone.position.set(Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3);
      stone.scale.set(1, 0.6, 1);
      g.add(stone);
    }
    // logs — crossed and charred
    const logMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
    const charMat = new THREE.MeshStandardMaterial({ color: 0x1a1208 });
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 4), i === 0 ? charMat : logMat);
      log.position.y = 0.05 + i * 0.03; log.rotation.z = Math.PI / 2; log.rotation.y = (i / 3) * Math.PI; g.add(log);
    }
    // flame — layered cones for depth
    const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 5), new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.8 }));
    flameOuter.position.y = 0.25; g.add(flameOuter);
    const flameInner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 5), new THREE.MeshStandardMaterial({ color: 0xffdd00, emissive: 0xffaa00, emissiveIntensity: 0.9 }));
    flameInner.position.y = 0.22; g.add(flameInner);
    // ember glow at base
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
    ember.position.y = 0.08; g.add(ember);
    g.position.set(x, 0, z); this.worldGroup.add(g);
    this._light(x, 0.3, z, 0xff6600, 2.5, 6);
  }

  _addTentacleStatue(x, z) {
    const g = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a52, flatShading: true });
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x2a2a32, flatShading: true });
    const mossStoneMat = new THREE.MeshStandardMaterial({ color: 0x3a4838, flatShading: true });
    const tentMat = new THREE.MeshStandardMaterial({ color: 0x2a4a3e, emissive: 0x0a4a2e, emissiveIntensity: 0.35, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x66ffcc });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x44ddaa, transparent: true, opacity: 0.85 });

    // ── Massive multi-tiered altar base — wide and ancient ──
    const base0 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.2, 10), stoneMat);
    base0.position.y = 0.1; g.add(base0);
    // cracked edge chunks
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.25), darkStoneMat);
      chunk.position.set(Math.cos(a) * 1.85, 0.1, Math.sin(a) * 1.85);
      chunk.rotation.y = a;
      g.add(chunk);
    }
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.3, 10), darkStoneMat);
    base1.position.y = 0.35; g.add(base1);
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.25, 10), mossStoneMat);
    base2.position.y = 0.62; g.add(base2);
    const base3 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.2, 10), stoneMat);
    base3.position.y = 0.84; g.add(base3);
    // glowing runes carved into the mid-tier pedestal — large, visible from afar
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rune = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), runeMat);
      rune.position.set(Math.cos(a) * 1.28, 0.35, Math.sin(a) * 1.28);
      rune.lookAt(0, 0.35, 0);
      g.add(rune);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5;
      const rune = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), runeMat);
      rune.position.set(Math.cos(a) * 0.92, 0.62, Math.sin(a) * 0.92);
      rune.lookAt(0, 0.62, 0);
      g.add(rune);
    }

    // ── Central body — massive bulbous stone head ──
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), darkStoneMat);
    body.position.y = 1.35; body.scale.set(1.1, 0.9, 1); g.add(body);
    // second head segment — narrower, taller
    const body2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), darkStoneMat);
    body2.position.y = 1.9; body2.scale.set(1, 1.1, 1); g.add(body2);
    // maw — dark gaping hole, large and menacing
    const maw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    maw.position.set(0, 1.4, 0.55); g.add(maw);
    // teeth around the maw
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 0.8 - Math.PI * 0.4;
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), stoneMat);
      tooth.position.set(Math.cos(a) * 0.14, 1.4 + Math.sin(a) * 0.08, 0.6);
      tooth.rotation.x = -0.3;
      g.add(tooth);
    }

    // moss patches — creeping over the ancient stone
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, flatShading: true });
    for (let i = 0; i < 8; i++) {
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 4), mossMat);
      const a = (i / 8) * Math.PI * 2 + 0.7;
      const r = 0.5 + (i % 3) * 0.2;
      moss.position.set(Math.cos(a) * r, 0.95 + (i % 3) * 0.15, Math.sin(a) * r);
      moss.scale.set(1, 0.35, 1); g.add(moss);
    }

    // ── Large tentacles — 6 massive, reaching high and curving outward ──
    const numTentacles = 6;
    for (let i = 0; i < numTentacles; i++) {
      const angle = (i / numTentacles) * Math.PI * 2;
      const tg = new THREE.Group();
      let curR = 0.22;
      const segLen = 0.5;
      let parent = tg;
      for (let s = 0; s < 6; s++) {
        const segGroup = new THREE.Group();
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(curR, curR * 1.3, segLen, 7), tentMat);
        seg.position.y = segLen / 2;
        segGroup.add(seg);
        // sucker dots along the segment
        for (let d = 0; d < 3; d++) {
          const sucker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 3), eyeMat);
          sucker.position.set(curR * 0.85, segLen * (0.2 + d * 0.25), 0);
          segGroup.add(sucker);
        }
        const tilt = 0.12 + s * 0.1;
        segGroup.position.y = s === 0 ? 0 : segLen;
        segGroup.rotation.z = Math.cos(angle) * tilt;
        segGroup.rotation.x = Math.sin(angle) * tilt;
        segGroup.rotation.y = s * 0.08;
        parent.add(segGroup);
        parent = segGroup;
        curR *= 0.82;
      }
      // position tentacle group at the body's base, radiating outward
      tg.position.set(Math.cos(angle) * 0.3, 1.0, Math.sin(angle) * 0.3);
      g.add(tg);
    }

    // ── Glowing eyes — large, watching from high up ──
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), eyeMat);
    eye1.position.set(0.28, 1.55, 0.55); g.add(eye1);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), eyeMat);
    eye2.position.set(-0.28, 1.55, 0.55); g.add(eye2);
    // eye glow halos
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x66ffcc, transparent: true, opacity: 0.3 });
    const halo1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), haloMat);
    halo1.position.set(0.28, 1.55, 0.55); g.add(halo1);
    const halo2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), haloMat);
    halo2.position.set(-0.28, 1.55, 0.55); g.add(halo2);

    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
    this._light(x, 1.6, z, 0x44ccaa, 2.5, 10);
    this._light(x, 0.4, z, 0x2a8866, 1.5, 8);
  }

  _addCrystal(x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a9ac8, emissive: 0x2a6a8a, emissiveIntensity: 0.5 });
    const main = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 4), mat);
    main.position.y = 0.3; g.add(main);
    const shard1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 4), mat);
    shard1.position.set(0.15, 0.2, 0.05); g.add(shard1);
    const shard2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 4), mat);
    shard2.position.set(-0.12, 0.15, -0.08); g.add(shard2);
    // glowing base
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshBasicMaterial({ color: 0x6ac8f0, transparent: true, opacity: 0.3 }));
    base.position.y = 0.05; g.add(base);
    // Emissive glow sprite — no real PointLight (adding/removing dynamic lights
    // triggers a shader recompile and freezes the frame when mining crystals)
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x6ac8f0, transparent: true, opacity: 0.15, depthWrite: false })
    );
    glow.position.y = 0.3; g.add(glow);
    g.position.set(x, 0, z); this.worldGroup.add(g);
  }

  _addBush(x, z, col, berryCol) {
    if (this.foliage) col = this.foliage.bushColor;
    const lightCol = this.foliage ? this.foliage.bushLight : new THREE.Color(col).offsetHSL(0, 0, 0.1);
    const g = new THREE.Group();
    // Leafy bush — wide, flat, round dodecahedron lobes (clearly vegetation, not stone)
    const bushMat = new THREE.MeshStandardMaterial({ color: col, flatShading: true, roughness: 0.9 });
    const lightMat = new THREE.MeshStandardMaterial({ color: lightCol, flatShading: true, roughness: 0.9 });
    const main = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), bushMat);
    main.position.y = 0.2; main.scale.set(1.25, 0.65, 1.25); g.add(main);
    const lobe1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), lightMat);
    lobe1.position.set(0.22, 0.18, 0.12); lobe1.scale.set(1.1, 0.7, 1.1); g.add(lobe1);
    const lobe2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), bushMat);
    lobe2.position.set(-0.2, 0.16, -0.14); lobe2.scale.set(1.1, 0.75, 1.1); g.add(lobe2);
    const lobe3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), lightMat);
    lobe3.position.set(0.05, 0.26, -0.18); lobe3.scale.set(1, 0.7, 1); g.add(lobe3);
    // bright leaf highlights — small flat chips on top to catch light
    const leafMat = new THREE.MeshStandardMaterial({ color: lightCol, flatShading: true, roughness: 0.7 });
    const seed = (x * 37 + z * 53);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + seed * 0.3;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 4), leafMat);
      leaf.position.set(Math.cos(a) * 0.22, 0.28, Math.sin(a) * 0.22);
      leaf.rotation.z = Math.PI;
      g.add(leaf);
    }
    if (berryCol) {
      for (let i = 0; i < 6; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 3), new THREE.MeshStandardMaterial({ color: berryCol, emissive: berryCol, emissiveIntensity: 0.25 }));
        b.position.set((Math.random()-0.5)*0.5, 0.16 + Math.random()*0.2, (Math.random()-0.5)*0.5); g.add(b);
      }
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addFlower(x, z) {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.18, 3), new THREE.MeshStandardMaterial({ color: 0x4a7a3a }));
    stem.position.y = 0.09; g.add(stem);
    // leaf on stem
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), new THREE.MeshStandardMaterial({ color: 0x4a7a3a, flatShading: true }));
    leaf.position.set(0.03, 0.08, 0); leaf.scale.set(1, 0.4, 0.6); g.add(leaf);
    // bloom — multi-petal
    const cols = [0xd4a5c0, 0xc4b04a, 0xa0a0d4, 0xe4c4a0, 0xd4a4a4];
    const petalCol = cols[Math.floor((x + z) * 7) % cols.length];
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 4), new THREE.MeshStandardMaterial({ color: 0xe4c84a }));
    center.position.y = 0.18; g.add(center);
    // petals around center
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), new THREE.MeshStandardMaterial({ color: petalCol }));
      petal.position.set(Math.cos(a) * 0.04, 0.18, Math.sin(a) * 0.04);
      petal.scale.set(1, 0.5, 1);
      g.add(petal);
    }
    g.position.set(x, 0, z); this.worldGroup.add(g);
  }

  _addMushroom(x, z) {
    const g = new THREE.Group();
    // slightly tapered stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.12, 5), new THREE.MeshStandardMaterial({ color: 0xe8d8b8 }));
    stem.position.y = 0.06; g.add(stem);
    // cap — domed, with depth
    const capMat = new THREE.MeshStandardMaterial({ color: 0xb0605a, flatShading: true });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    cap.position.y = 0.12; g.add(cap);
    // cap underside — darker gills
    const gills = new THREE.Mesh(new THREE.CircleGeometry(0.05, 7), new THREE.MeshStandardMaterial({ color: 0x8a4a44 }));
    gills.rotation.x = Math.PI / 2; gills.position.y = 0.11; g.add(gills);
    // white spots on cap — classic toadstool
    const spotMat = new THREE.MeshBasicMaterial({ color: 0xf0e8d0 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + x;
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 3), spotMat);
      spot.position.set(Math.cos(a) * 0.03, 0.14, Math.sin(a) * 0.03);
      g.add(spot);
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.worldGroup.add(g);
  }

  _addStairs(x, z, down) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: down ? 0x2a2a32 : 0x5a5a62 });
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.2), mat);
      step.position.y = down ? (0.5 - i * 0.12) : (i * 0.12);
      step.position.z = (i - 1.5) * 0.2; g.add(step);
    }
    g.position.set(x, 0, z); this.worldGroup.add(g);
  }

  // ── Entity billboards ──
  _createSprite(sw, sh, canvasScale = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = TILE_PX * canvasScale; canvas.height = TILE_PX * canvasScale;
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(sw, sh, 1);
    sprite.userData = { canvas, ctx, texture };
    return sprite;
  }

  _updateSprite(sprite, drawFn, key) {
    // when a key is given, skip the canvas redraw if nothing visible changed
    if (key !== undefined && sprite.userData.lastKey === key) return;
    sprite.userData.lastKey = key;
    const { canvas, ctx, texture } = sprite.userData;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFn(ctx);
    texture.needsUpdate = true;
  }

  // ── Sprite pools — reuse sprites frame to frame instead of building a new
  // canvas+texture+material+sprite per entity per frame (the old way leaked
  // GPU textures at ~60×entityCount/sec in combat) ──
  _poolEntry(pool, i, withShadow) {
    if (!pool[i]) {
      const sprite = this._createSprite(1, 1);
      this.entityGroup.add(sprite);
      const entry = { sprite, shadow: null };
      if (withShadow) { entry.shadow = this._addBlobShadow(0.5); this.entityGroup.add(entry.shadow); }
      pool[i] = entry;
    }
    const entry = pool[i];
    entry.sprite.visible = true;
    if (entry.shadow) entry.shadow.visible = true;
    return entry;
  }

  _hidePoolTail(pool, count) {
    for (let i = count; i < pool.length; i++) {
      pool[i].sprite.visible = false;
      if (pool[i].shadow) pool[i].shadow.visible = false;
    }
  }

  _buildEntities(zone) {
    this.entities.player = this._createSprite(1.8, 2.2, 3);
    this.entities.player.position.y = 0.5;
    this.entityGroup.add(this.entities.player);
    this.entities.playerShadow = this._addBlobShadow(0.5);
    this.entityGroup.add(this.entities.playerShadow);

    this.entities.fritz = this._createSprite(0.7, 0.7);
    this.entities.fritz.position.y = 0.35;
    this.entityGroup.add(this.entities.fritz);
    this.entities.fritzShadow = this._addBlobShadow(0.32);
    this.entityGroup.add(this.entities.fritzShadow);

    // Nikki companion — follows the player if romanced
    this.entities.nikkiCompanion = this._createSprite(0.8, 1.0);
    this.entities.nikkiCompanion.position.y = 0.5;
    this.entities.nikkiCompanion.visible = false;
    this.entityGroup.add(this.entities.nikkiCompanion);
    this.entities.nikkiCompanionShadow = this._addBlobShadow(0.42);
    this.entities.nikkiCompanionShadow.visible = false;
    this.entityGroup.add(this.entities.nikkiCompanionShadow);

    this.entities.npcs = zone.npcs.map(npc => {
      const sp = this._createSprite(0.8, 1.0);
      sp.position.set(npc.x + 0.5, 0.5, npc.y + 0.5);
      this.entityGroup.add(sp);
      const sh = this._addBlobShadow(0.42);
      sh.position.set(npc.x + 0.5, 0.02, npc.y + 0.5);
      this.entityGroup.add(sh);
      return { npc, sprite: sp, shadow: sh };
    });

    this.entities.objects = zone.objects.map(obj => {
      const sp = this._createSprite(0.7, 0.7);
      sp.position.set(obj.x + 0.5, 0.02, obj.y + 0.5);
      this.entityGroup.add(sp);
      const sh = this._addBlobShadow(0.3);
      sh.position.set(obj.x + 0.5, 0.02, obj.y + 0.5);
      this.entityGroup.add(sh);
      return { obj, sprite: sp, shadow: sh };
    });

    this.entities.enemies = [];
    this.entities.ghosts = [];
    this.entities.particles = [];

    // Critter sprites — squirrels, rabbits, birds, deer, foxes, crows
    this.entities.critters = this.critters.map(c => {
      const sizeMap = { deer: [1.1, 1.2], crow: [0.65, 0.65], fox: [0.75, 0.65] };
      const [sw, sh] = sizeMap[c.type] || [0.5, 0.5];
      const sp = this._createSprite(sw, sh);
      sp.position.set(c.x, 0.25, c.z);
      this.entityGroup.add(sp);
      const shadowScale = c.type === 'deer' ? 0.35 : 0.2;
      const blobSh = this._addBlobShadow(shadowScale);
      blobSh.position.set(c.x, 0.02, c.z);
      this.entityGroup.add(blobSh);
      return { critter: c, sprite: sp, shadow: blobSh };
    });
  }

  _buildWeatherFx(zone) {
    const rainCount = 300;
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i*3] = Math.random() * 30 - 5;
      positions[i*3+1] = Math.random() * 12;
      positions[i*3+2] = Math.random() * 30 - 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainPoints = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x88aaff, size: 0.08, transparent: true, opacity: 0.6 }));
    this.rainPoints.visible = false;
    this.fxGroup.add(this.rainPoints);

    // Snow particles for silent snow weather
    const snowCount = 250;
    const snowPos = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      snowPos[i*3] = Math.random() * 30 - 5;
      snowPos[i*3+1] = Math.random() * 12;
      snowPos[i*3+2] = Math.random() * 30 - 5;
    }
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    this.snowPoints = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.85 }));
    this.snowPoints.visible = false;
    this.fxGroup.add(this.snowPoints);

    // Glowing fog orbs — floating teal-green wisps for glowing fog weather
    this.glowOrbs = [];
    for (let i = 0; i < 10; i++) {
      const sp = this._createSprite(0.35, 0.35);
      sp.position.set(Math.random() * this.zoneW, 0.5 + Math.random() * 2, Math.random() * this.zoneH);
      sp.userData.phase = Math.random() * Math.PI * 2;
      sp.visible = false;
      this.glowOrbs.push(sp);
      this.fxGroup.add(sp);
    }

    // reset per zone — stale sprites were disposed with the old fxGroup
    this.fireflies = [];
    if (zone.def.fireflies) {
      for (let i = 0; i < 15; i++) {
        const sp = this._createSprite(0.1, 0.1);
        sp.position.set(Math.random() * this.zoneW, 0.3 + Math.random() * 1.5, Math.random() * this.zoneH);
        sp.userData.phase = Math.random() * Math.PI * 2;
        sp.userData.speed = 0.3 + Math.random() * 0.4;
        sp.visible = false;
        this.fireflies.push(sp);
        this.fxGroup.add(sp);
      }
    }

    // ── Void border wisps — ethereal spirits floating around and beyond the map edges ──
    this.voidWisps = [];
    const wispCount = 28;
    for (let i = 0; i < wispCount; i++) {
      const sp = this._createSprite(0.22, 0.22);
      const angle = (i / wispCount) * Math.PI * 2 + Math.random() * 0.4;
      const offset = 3 + Math.random() * 6;
      const hx = this.zoneW / 2, hz = this.zoneH / 2;
      sp.position.set(
        hx + Math.cos(angle) * (Math.max(hx, hz) + offset),
        0.3 + Math.random() * 2.5,
        hz + Math.sin(angle) * (Math.max(hx, hz) + offset)
      );
      sp.userData.phase = Math.random() * Math.PI * 2;
      sp.userData.speed = 0.15 + Math.random() * 0.2;
      sp.userData.baseY = sp.position.y;
      this.voidWisps.push(sp);
      this.fxGroup.add(sp);
    }

    // ── Floating dust motes — fine particles that follow the player everywhere ──
    const moteCount = 70;
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePos[i*3]   = Math.random() * 28 - 4;
      motePos[i*3+1] = 0.2 + Math.random() * 3;
      motePos[i*3+2] = Math.random() * 28 - 4;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    this.dustMotes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
      color: 0xb0a0d0, size: 0.045, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.fxGroup.add(this.dustMotes);
  }

  // ── Main render ──
  render(state, zone, tiles, crops, ghosts, enemies, particles, atm, actionState, footprints, fishingState) {
    const s = state;
    const isNight = atm.isNight(s.time);
    this.lanternOn = !!state.lanternOn;
    setLanternOn(this.lanternOn);

    // Frame delta — all easing/animation below scales by real time so
    // 120Hz displays don't run double-speed
    const now = performance.now();
    const dt = Math.min((now - (this._lastFrame || now)) / 1000, 0.05);
    this._lastFrame = now;

    // Camera follows player — centered behind, elevated for visibility
    const px = s.player.x, pz = s.player.y;
    const camY = this.zoneInterior ? 5.0 : 6.2;
    this._tmpVec.set(px, camY, pz + 5.2);
    this.camera.position.lerp(this._tmpVec, 1 - Math.exp(-26 * dt));
    this.camera.lookAt(px, 0.6, pz - 1.0);

    // Sun follows player so the shadow camera always covers the visible area
    this.sun.position.set(px + 10, 25, pz + 10);
    this.sun.target.position.set(px, 0, pz);
    this.sun.target.updateMatrixWorld();

    this._updateLighting(s.time, s.weather, isNight, zone);
    this._updateFog(s.weather, zone, isNight);

    // Dynamic bloom — stronger at night so lanterns and fireflies glow; subtle by day
    if (this.bloomPass) {
      const targetBloom = isNight ? 0.85 : 0.35;
      this.bloomPass.strength += (targetBloom - this.bloomPass.strength) * (1 - Math.exp(-1.8 * dt));
    }

    this.playerLight.position.set(px, 1.5, pz);
    // Lantern tool: bright warm light that reaches further — lights up dark areas
    if (this.lanternOn) {
      this.playerLight.intensity = 6;
      this.playerLight.distance = 14;
      this.playerLight.decay = 1.5;
      this.playerLight.color.set(0xffaa44);
    } else {
      this.playerLight.intensity = isNight ? 3 : 0;
      this.playerLight.distance = 8;
      this.playerLight.decay = 1.5;
      this.playerLight.color.set(0xffaa44);
    }

    // Sway interactive vegetation near the player — bushes rustle, grass bends
    this._updateInteractiveTiles(s.player.x, s.player.y, s.player.moving, dt);

    // Update critters — they flee when the player gets close
    if (this.critters.length > 0) {
      this._critterFlees = updateCritters(this.critters, s.player.x, s.player.y, dt, tiles, this.zoneW, this.zoneH);
      this._updateCritterSprites();
    }

    this._updateEntities(s, ghosts, enemies, actionState, particles, footprints, fishingState);
    this._updateFx(s, zone, isNight);

    // Animate water surface — gentle ripple, only on water tile vertices
    if (this._waterGeo) {
      const pos = this._waterGeo.attributes.position;
      for (let i = 0; i < pos.array.length; i += 3) {
        const wx = pos.array[i];
        const wz = pos.array[i + 2];
        pos.array[i + 1] = Math.sin(this.clock * 1.5 + wx * 0.8) * 0.015 + Math.cos(this.clock * 1.2 + wz * 0.6) * 0.01;
      }
      pos.needsUpdate = true;
      this._waterGeo.computeVertexNormals();
    }

    // ── 3D fishing line — extends from the player's pole tip into the water ──
    if (fishingState) {
      const dir = s.player.dir;
      // pole tip — above and in front of the player, offset in facing direction
      const dirVec = [
        { x: 0, z: 0.5 },    // dir 0 (down/south)
        { x: 0, z: -0.5 },   // dir 1 (up/north)
        { x: -0.5, z: 0 },   // dir 2 (left)
        { x: 0.5, z: 0 },    // dir 3 (right)
      ][dir];
      const tipY = 0.55;
      const tipX = px + dirVec.x;
      const tipZ = pz + dirVec.z;
      // line endpoint — drops into the water tile the player is facing
      const waterX = px + dirVec.x * 2.2;
      const waterZ = pz + dirVec.z * 2.2;
      const waterY = -0.05;
      // gentle wobble on the line during minigame
      const wobble = fishingState.phase === 'minigame' ? Math.sin(this.clock * 8) * 0.06 : 0;
      const lp = this._fishingLine.geometry.attributes.position;
      lp.array[0] = tipX; lp.array[1] = tipY; lp.array[2] = tipZ;
      lp.array[3] = waterX + wobble; lp.array[4] = waterY; lp.array[5] = waterZ;
      lp.needsUpdate = true;
      this._fishingLine.visible = true;
      // bobber bobs on the water surface
      this._bobber.position.set(waterX, waterY + 0.04 + Math.sin(this.clock * 2) * 0.02, waterZ);
      this._bobber.visible = true;
    } else {
      this._fishingLine.visible = false;
      this._bobber.visible = false;
    }

    // Animate lighthouse beacon — irregular flicker + sweeping rotating beam
    if (this.sceneryGroup.children.length > 0) {
      this.sceneryGroup.traverse(obj => {
        const ud = obj.userData;
        if (!ud || !ud.beacon) return;
        // Irregular, eerie flicker — layered sines + random sputter
        const base = 0.55 + Math.sin(this.clock * 2.3) * 0.2 + Math.sin(this.clock * 7.1) * 0.1;
        const sputter = Math.random() < 0.04 ? 0.2 : 1.0; // occasional dip
        const flicker = Math.max(0.15, Math.min(1.0, base * sputter));
        ud.beacon.material.opacity = flicker;
        if (ud.halo) ud.halo.material.opacity = 0.1 + flicker * 0.18;
        if (ud.light) ud.light.intensity = (ud.light.userData.baseIntensity || ud.light.intensity) * (0.6 + flicker * 0.6);
        // Rotating sweeping beam — slow, eerie revolution
        if (ud.beamPivot) {
          ud.beamPivot.rotation.y = this.clock * 0.5;
          if (ud.beam) ud.beam.material.opacity = 0.06 + flicker * 0.1;
        }
      });
    }

    this.composer.render();
    this.clock += dt;
  }

  _updateLighting(time, weather, isNight, zone) {
    const dayFactor = Math.max(0, Math.sin((time - 360) / 720 * Math.PI));
    // golden hour warmth at dawn/dusk — more pronounced and cinematic
    const golden = Math.max(0, 1 - Math.abs(dayFactor - 0.35) * 2.5);
    // dawn/dusk factor — warm amber tones during transition hours
    const dawn = Math.max(0, 1 - Math.abs(time - 390) / 90);
    const dusk = Math.max(0, 1 - Math.abs(time - 1110) / 120);
    const twilight = Math.max(dawn, dusk);
    if (zone.def.interior) {
      // Interiors: warm cozy amber day, eerie candlelit night
      this.ambient.color.setHex(isNight ? 0x3a2218 : 0x6a5438);
      this.ambient.intensity = isNight ? 0.4 : 0.65;
      this.sun.color.setHex(isNight ? 0x6a4a2e : 0xffe8c4);
      this.sun.intensity = isNight ? 0.25 : 0.45;
      this.hemi.color.setHex(0xffaa66);
      this.hemi.groundColor.setHex(0x3a2818);
      this.hemi.intensity = 0.25;
    } else {
      // Exterior: richer day/night transitions with golden hour
      this.ambient.color.copy(LIGHT_PALETTE.ambNight).lerp(LIGHT_PALETTE.ambDay, dayFactor);
      // twilight adds warm purple-pink to ambient
      this.ambient.color.lerp(LIGHT_PALETTE.twilightAmb, twilight * 0.4);
      this.ambient.intensity = 0.28 + dayFactor * 0.38;
      this.sun.color.copy(LIGHT_PALETTE.sunNight).lerp(LIGHT_PALETTE.sunDay, dayFactor);
      // golden hour — deep amber warmth
      this.sun.color.lerp(LIGHT_PALETTE.golden, golden * 0.55);
      // twilight — soft pink-purple
      this.sun.color.lerp(LIGHT_PALETTE.twilightSun, twilight * 0.3);
      this.sun.intensity = 0.12 + dayFactor * 0.65;
      this.hemi.color.setHex(0x9988bb);
      this.hemi.groundColor.setHex(0x3a2a1a);
      this.hemi.intensity = 0.25 + dayFactor * 0.3;
    }
    // Special weather lighting — blood moon washes everything in red
    if (!zone.def.interior) {
      if (weather === 'blood_moon') {
        this.ambient.color.lerp(LIGHT_PALETTE.bloodAmb, 0.35);
        this.sun.color.lerp(LIGHT_PALETTE.bloodSun, 0.5);
        this.sun.intensity = Math.max(0.15, this.sun.intensity);
      }
      if (weather === 'glowing_fog') {
        this.ambient.color.lerp(LIGHT_PALETTE.glowAmb, 0.2);
      }
    }
  }

  _updateFog(weather, zone, isNight) {
    // Cozy-creepy palette: warm amber day, deep purple night, misty blue twilight
    const fogDay = zone.def.interior ? LIGHT_PALETTE.fogDayIn : LIGHT_PALETTE.fogDayOut;
    const fogNight = zone.def.interior ? LIGHT_PALETTE.fogNightIn : LIGHT_PALETTE.fogNightOut;
    this.scene.fog.color.copy(fogNight).lerp(fogDay, isNight ? 0.2 : 1);
    let density = zone.def.fog || 0;
    if (weather === 'fog') density = Math.max(density, 0.6);
    if (weather === 'heavy_fog') density = 0.9;
    // Closer fog for the lower third-person camera — more atmospheric immersion
    this.scene.fog.near = 8 - density * 4;
    this.scene.fog.far = 35 - density * 18;
    // Special weather fog effects
    if (weather === 'glowing_fog') {
      this.scene.fog.color.lerp(new THREE.Color(0x2a6a5a), 0.35);
      density = Math.max(density, 0.7);
      this.scene.fog.near = 8 - density * 4;
      this.scene.fog.far = 35 - density * 18;
    }
    if (weather === 'blood_moon') {
      this.scene.fog.color.lerp(LIGHT_PALETTE.bloodFog, 0.4);
    }
    if (weather === 'silent_snow') {
      this.scene.fog.color.lerp(LIGHT_PALETTE.snowFog, 0.25);
    }
    this.renderer.setClearColor(0x000000);
  }

  _updateEntities(s, ghosts, enemies, actionState, particles, footprints, fishingState) {
    // Player
    const pSp = this.entities.player;
    pSp.position.x = s.player.x; pSp.position.z = s.player.y;
    this.entities.playerShadow.position.set(s.player.x, 0.02, s.player.y);
    this._updateSprite(pSp, (ctx) => drawPlayer(ctx, TILE_PX * 1.5, TILE_PX * 1.5, s.player.dir, Math.floor(s.player.anim), s.player.moving ? 'walk' : 'idle', s.character, actionState, s.equippedHat, fishingState, s.equippedWeapon));

    // Fritz
    const fSp = this.entities.fritz;
    fSp.position.x = s.fritz.x; fSp.position.z = s.fritz.y;
    this.entities.fritzShadow.position.set(s.fritz.x, 0.02, s.fritz.y);
    this._updateSprite(fSp, (ctx) => drawFritz(ctx, 0, 0, s.fritz.dir, s.fritz.state, Math.floor(s.fritz.anim), s.character?.pet || 'fritz'));

    const frame = Math.floor(performance.now() / 300) % 4;

    // Romance companion — follows the player if romanced
    const nSp = this.entities.nikkiCompanion;
    if (s.romanceCompanion) {
      const nc = s.romanceCompanion;
      nSp.position.x = nc.x; nSp.position.z = nc.y;
      nSp.visible = true;
      this.entities.nikkiCompanionShadow.position.set(nc.x, 0.02, nc.y);
      this.entities.nikkiCompanionShadow.visible = true;
      this._updateSprite(nSp, (ctx) => drawNPC(ctx, 0, 0, nc.color || '#c46a8a', nc.dir || 0, frame, nc.npcId || 'nikki'));
    } else {
      nSp.visible = false;
      this.entities.nikkiCompanionShadow.visible = false;
    }

    // NPCs
    for (const { npc, sprite, shadow } of this.entities.npcs) { const inside = npc._wander && npc._wander.state === 'inside'; sprite.visible = shadow.visible = !inside; if (!inside) { sprite.position.set(npc.x + 0.5, 0.5, npc.y + 0.5); shadow.position.set(npc.x + 0.5, 0.02, npc.y + 0.5); this._updateSprite(sprite, (ctx) => drawNPC(ctx, 0, 0, npc.color, npc.dir || 0, frame, npc.id)); } }

    // Ground objects
    for (const { obj, sprite, shadow } of this.entities.objects) {
      sprite.visible = !obj.collected;
      if (shadow) shadow.visible = !obj.collected;
      if (sprite.visible) this._updateSprite(sprite, (ctx) => drawGroundItem(ctx, obj.type, 0, 0));
    }

    // Enemies — pooled sprites, canvas redrawn only when the pose changes
    const enemyCount = enemies ? enemies.length : 0;
    for (let i = 0; i < enemyCount; i++) {
      const e = enemies[i];
      const entry = this._poolEntry(this.entities.enemies, i, true);
      const sp = entry.sprite;
      const isBigBoss = e.isBoss && e.typeId !== 'undead_shaman';
      sp.scale.set(isBigBoss ? 1.4 : 0.8, isBigBoss ? 1.6 : 0.9, 1);
      sp.position.set(e.x, isBigBoss ? 0.8 : 0.45, e.y);
      entry.shadow.position.set(e.x, 0.02, e.y);
      const eFrame = Math.floor(e.anim);
      const key = `${e.typeId}|${eFrame % 4}|${e.hitFlash > 0 ? 1 : 0}|${e.phase || 0}`;
      this._updateSprite(sp, (ctx) => {
        if (e.isBoss && e.typeId === 'undead_shaman') drawShamanBoss(ctx, 0, 0, e, eFrame);
        else drawEnemy(ctx, 0, 0, e, eFrame);
      }, key);
    }
    this._hidePoolTail(this.entities.enemies, enemyCount);

    // Ghosts — pooled; opacity lives on the material only (drawing at full
    // alpha avoids the old alpha² double-fade), canvas redraws every frame
    // because drawGhost animates from the wall clock
    const ghostCount = ghosts ? ghosts.length : 0;
    for (let i = 0; i < ghostCount; i++) {
      const g = ghosts[i];
      const entry = this._poolEntry(this.entities.ghosts, i, false);
      const sp = entry.sprite;
      const isTentacle = g.type === 'tentacle';
      sp.scale.set(isTentacle ? 1.6 : 0.7, isTentacle ? 2.0 : 0.9, 1);
      sp.position.set(g.x, isTentacle ? 1.0 : 0.5, g.y);
      sp.material.opacity = g.alpha * 0.7;
      this._updateSprite(sp, (ctx) => drawGhost(ctx, 0, 0, 1, g.type, g.phase || 0));
    }
    this._hidePoolTail(this.entities.ghosts, ghostCount);

    // Particles — pooled
    const partCount = particles ? particles.length : 0;
    for (let i = 0; i < partCount; i++) {
      const part = particles[i];
      const entry = this._poolEntry(this.entities.particles, i, false);
      const sp = entry.sprite;
      if (part.pickup) {
        sp.scale.set(0.28, 0.28, 1);
        sp.position.set(part.x, 0.3 + (part.height || 0), part.y);
        sp.material.opacity = Math.max(0, Math.min(1, part.life / part.maxLife));
        this._updateSprite(sp, (ctx) => {
          const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2;
          if (part.itemType === 'wood') {
            // mini log
            ctx.fillStyle = '#5a3a1a'; ctx.fillRect(cx - 10, cy - 5, 20, 10);
            ctx.fillStyle = '#7a5a3a'; ctx.fillRect(cx - 10, cy - 5, 20, 3);
            ctx.fillStyle = '#3a2010'; ctx.fillRect(cx - 10, cy + 3, 20, 2);
            ctx.fillStyle = '#4a2a1a';
            ctx.beginPath(); ctx.arc(cx - 9, cy, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 9, cy, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#6a4a2a';
            ctx.beginPath(); ctx.arc(cx - 9, cy, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 9, cy, 1.5, 0, Math.PI * 2); ctx.fill();
          } else if (part.itemType === 'stone') {
            // mini rock
            ctx.fillStyle = '#5a5a64';
            ctx.beginPath(); ctx.arc(cx, cy + 1, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8a8a94';
            ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#48484e';
            ctx.beginPath(); ctx.arc(cx + 3, cy + 3, 2.5, 0, Math.PI * 2); ctx.fill();
          } else if (part.itemType === 'mushroom') {
            ctx.fillStyle = '#e0d0b0'; ctx.fillRect(cx - 2, cy, 4, 6);
            ctx.fillStyle = '#b0605a';
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e0d0b0';
            ctx.beginPath(); ctx.arc(cx - 2, cy - 1, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 2, cy + 1, 1, 0, Math.PI * 2); ctx.fill();
          } else if (part.itemType === 'berry') {
            ctx.fillStyle = '#3a5a3a'; ctx.fillRect(cx - 1, cy - 2, 2, 8);
            ctx.fillStyle = '#d44040';
            ctx.beginPath(); ctx.arc(cx - 3, cy + 3, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 3, cy + 4, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy + 1, 3, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillStyle = part.color || '#aaa';
            ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
          }
        }, `pk|${part.itemType || ''}|${part.color || ''}`);
      } else {
        sp.scale.set(0.15, 0.15, 1);
        // sparks arc upward: map the particle's upward drift (spawned with
        // negative map-Y velocity) onto world height at its spawn row
        const rise = part.y0 !== undefined ? Math.max(0, part.y0 - part.y) : 0;
        sp.position.set(part.x, 0.25 + rise, part.y0 !== undefined ? part.y0 : part.y);
        sp.material.opacity = Math.max(0, part.life / part.maxLife);
        this._updateSprite(sp, (ctx) => {
          const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2;
          ctx.fillStyle = part.color;
          if (part.heart) {
            const hs = 4 + (part.size || 2);
            ctx.beginPath();
            ctx.arc(cx - hs * 0.35, cy - hs * 0.25, hs * 0.42, 0, Math.PI * 2);
            ctx.arc(cx + hs * 0.35, cy - hs * 0.25, hs * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx - hs * 0.72, cy - hs * 0.05);
            ctx.lineTo(cx + hs * 0.72, cy - hs * 0.05);
            ctx.lineTo(cx, cy + hs * 0.85);
            ctx.closePath(); ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(cx, cy, 3 + (part.size || 2), 0, Math.PI * 2); ctx.fill();
          }
        }, `dt|${part.color}|${part.heart ? 1 : 0}|${Math.round(part.size || 2)}`);
      }
    }
    this._hidePoolTail(this.entities.particles, partCount);
  }

  _updateInteractiveTiles(px, pz, moving, dt) {
    for (const t of this.interactiveTiles) {
      const dx = t.x - px, dz = t.z - pz;
      const dist = Math.hypot(dx, dz);
      // player proximity sway — bushes rustle and grass bends only when you walk through
      if (dist < 1.2) {
        const intensity = (1.2 - dist) / 1.2;
        t.targetIntensity = intensity * (moving ? 0.35 : 0.12);
        t.targetAngle = Math.atan2(dz, dx);
      } else {
        t.targetIntensity = 0;
      }
      // smooth interpolation toward target
      t.sway = (t.sway || 0) + ((t.targetIntensity || 0) - (t.sway || 0)) * Math.min(1, dt * 8);
      if (t.group && t.sway > 0.001) {
        const angle = t.targetAngle || 0;
        t.group.rotation.z = -Math.cos(angle) * t.sway;
        t.group.rotation.x = Math.sin(angle) * t.sway;
      } else if (t.group) {
        // reset to neutral when no sway — no constant bobbing
        t.group.rotation.z = 0;
        t.group.rotation.x = 0;
      }
    }
  }

  _updateCritterSprites() {
    if (!this.entities.critters) return;
    for (const { critter: c, sprite, shadow } of this.entities.critters) {
      sprite.position.x = c.x;
      sprite.position.z = c.z;
      const flyY = c.type === 'bird' && c.state === 'flee' ? 0.5 + Math.abs(Math.sin(c.anim)) * 0.3 : 0.15;
      sprite.position.y = flyY;
      if (shadow) {
        shadow.position.set(c.x, 0.02, c.z);
        shadow.visible = !(c.type === 'bird' && c.state === 'flee');
      }
      this._updateSprite(sprite, (ctx) => drawCritter(ctx, c.type, c.anim, c.state));
    }
  }

  _updateFx(s, zone, isNight) {
    // Rain
    if (this.rainPoints) {
      const showRain = ['rain', 'storm', 'drizzle'].includes(s.weather) && !zone.def.interior;
      this.rainPoints.visible = showRain;
      if (showRain) {
        this.rainPoints.position.x = s.player.x - 10;
        this.rainPoints.position.z = s.player.y - 10;
        const pos = this.rainPoints.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          pos.array[i*3+1] -= 0.3;
          if (pos.array[i*3+1] < 0) pos.array[i*3+1] = 12;
        }
        pos.needsUpdate = true;
      }
    }

    // Snow — silent, drifting flakes
    if (this.snowPoints) {
      const showSnow = s.weather === 'silent_snow' && !zone.def.interior;
      this.snowPoints.visible = showSnow;
      if (showSnow) {
        this.snowPoints.position.x = s.player.x - 10;
        this.snowPoints.position.z = s.player.y - 10;
        const pos = this.snowPoints.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          pos.array[i*3+1] -= 0.06;
          pos.array[i*3] += Math.sin(this.clock + i * 0.5) * 0.008;
          if (pos.array[i*3+1] < 0) {
            pos.array[i*3+1] = 12;
            pos.array[i*3] = Math.random() * 30 - 5;
          }
        }
        pos.needsUpdate = true;
      }
    }

    // Glowing fog orbs — floating teal-green wisps
    if (this.glowOrbs) {
      for (const sp of this.glowOrbs) {
        sp.visible = s.weather === 'glowing_fog' && !zone.def.interior;
        if (sp.visible) {
          sp.userData.phase += 0.008;
          sp.position.x += Math.sin(sp.userData.phase) * 0.008;
          sp.position.z += Math.cos(sp.userData.phase * 1.3) * 0.008;
          sp.position.y += Math.sin(sp.userData.phase * 2) * 0.004;
          const { ctx, texture } = sp.userData;
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          const glow = 0.4 + Math.sin(sp.userData.phase * 3) * 0.2;
          const grad = ctx.createRadialGradient(ctx.canvas.width/2, ctx.canvas.height/2, 0, ctx.canvas.width/2, ctx.canvas.height/2, 20);
          grad.addColorStop(0, `rgba(100,255,180,${glow})`);
          grad.addColorStop(0.5, `rgba(80,200,160,${glow*0.5})`);
          grad.addColorStop(1, 'rgba(60,180,140,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          texture.needsUpdate = true;
        }
      }
    }

    // Fireflies
    for (const sp of this.fireflies) {
      sp.visible = isNight && !zone.def.interior;
      if (sp.visible) {
        sp.userData.phase += sp.userData.speed * 0.02;
        sp.position.x += Math.sin(sp.userData.phase) * 0.02;
        sp.position.z += Math.cos(sp.userData.phase * 1.3) * 0.02;
        sp.position.y += Math.sin(sp.userData.phase * 2) * 0.01;
        const { ctx, texture } = sp.userData;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const glow = 0.5 + Math.sin(sp.userData.phase * 3) * 0.3;
        ctx.fillStyle = `rgba(180,255,160,${glow})`;
        ctx.beginPath(); ctx.arc(ctx.canvas.width/2, ctx.canvas.height/2, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(220,255,200,${glow})`;
        ctx.beginPath(); ctx.arc(ctx.canvas.width/2, ctx.canvas.height/2, 2, 0, Math.PI*2); ctx.fill();
        texture.needsUpdate = true;
      }
    }

    // Void wisps — floating ethereal spirits at the map border
    for (const sp of this.voidWisps) {
      sp.visible = true;
      sp.userData.phase += sp.userData.speed * 0.015;
      sp.position.y = sp.userData.baseY + Math.sin(sp.userData.phase * 2) * 0.4;
      sp.position.x += Math.sin(sp.userData.phase) * 0.004;
      sp.position.z += Math.cos(sp.userData.phase * 1.3) * 0.004;
      const { ctx, texture } = sp.userData;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const glow = 0.22 + Math.sin(sp.userData.phase * 3) * 0.14;
      const grad = ctx.createRadialGradient(ctx.canvas.width/2, ctx.canvas.height/2, 0, ctx.canvas.width/2, ctx.canvas.height/2, 14);
      grad.addColorStop(0, `rgba(180,170,230,${glow})`);
      grad.addColorStop(0.4, `rgba(140,120,190,${glow * 0.4})`);
      grad.addColorStop(1, 'rgba(100,80,160,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      texture.needsUpdate = true;
    }

    // Dust motes — follow the player, drift gently
    if (this.dustMotes) {
      this.dustMotes.position.x = s.player.x - 10;
      this.dustMotes.position.z = s.player.y - 10;
      const pos = this.dustMotes.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i*3+1] -= 0.004;
        pos.array[i*3]   += Math.sin(this.clock * 0.5 + i) * 0.002;
        if (pos.array[i*3+1] < 0.1) pos.array[i*3+1] = 3;
      }
      pos.needsUpdate = true;
    }
  }
}