// Installs the interact method and related wrappers on the Game class.
// Extracted from engine.js to keep file size manageable, with enhancements:
// - All seed types plantable (not just pumpkin)
// - Footprints disappear after examination (clue moves to journal)
// - Trees & rocks scheduled for regrowth after chopping/mining
// - Chicken coops / cow pastures come with animals that auto-produce
// - Crop visual updates via renderer3d.updateCrop
import { T, TILE_PROPS, ITEMS, SEEDS, BUILDABLES } from './constants';
import { canAccessSpookyShores } from './story';
import { HOLLOWAY_EVIDENCE } from './story';

export function installInteract(Game) {
  const origSetTileOverride = Game.prototype.setTileOverride;
  Game.prototype.setTileOverride = function (x, y, tile, extra) {
    origSetTileOverride.call(this, x, y, tile, extra);
    const ov = { tile, ...(extra || {}) };
    if (this.renderer3d) {
      if (ov.crop !== undefined) this.renderer3d.updateCrop(x, y, ov);
      else this.renderer3d.removeCrop(x, y);
    }
  };

  const origTryPlace = Game.prototype.tryPlace;
  Game.prototype.tryPlace = function () {
    const p = this.state.player;
    const fx = Math.floor(p.x + (p.dir === 3 ? 1 : p.dir === 2 ? -1 : 0));
    const fy = Math.floor(p.y + (p.dir === 0 ? 1 : p.dir === 1 ? -1 : 0));
    const buildableId = this.buildMode;
    origTryPlace.call(this);
    const newTile = this.getTile(fx, fy);
    const b = BUILDABLES.find(bb => bb.id === buildableId);
    if (b && newTile === b.tile) {
      if (!this.state.flags) this.state.flags = {};
      if (buildableId === 'chicken_coop') {
        this.state.flags.hasChickens = true;
        this.state.flags.chickenCount = (this.state.flags.chickenCount || 0) + 2;
        this.showToast('🐔 2 chickens now call this coop home! They\'ll lay eggs every 2 days.', 5000);
      }
      if (buildableId === 'cow') {
        this.state.flags.hasCows = true;
        this.state.flags.cowCount = (this.state.flags.cowCount || 0) + 2;
        this.showToast('🐮 2 cows now graze this pasture! They\'ll produce milk every 2 days.', 5000);
      }
    }
  };

  const origPickup = Game.prototype.pickupBuildable;
  Game.prototype.pickupBuildable = function (fx, fy, buildable) {
    origPickup.call(this, fx, fy, buildable);
    if (!this.state.flags) this.state.flags = {};
    if (buildable.id === 'chicken_coop') {
      this.state.flags.chickenCount = Math.max(0, (this.state.flags.chickenCount || 0) - 2);
      if (this.state.flags.chickenCount === 0) this.state.flags.hasChickens = false;
    }
    if (buildable.id === 'cow') {
      this.state.flags.cowCount = Math.max(0, (this.state.flags.cowCount || 0) - 2);
      if (this.state.flags.cowCount === 0) this.state.flags.hasCows = false;
    }
  };

  // ── Schedule regrowth for a chopped tree or mined rock ──
  function scheduleRegrow(engine, x, y, tile, days) {
    if (!engine.state.zones[engine.state.zone]) return;
    if (!engine.state.zones[engine.state.zone].regrow) engine.state.zones[engine.state.zone].regrow = [];
    engine.state.zones[engine.state.zone].regrow.push({ x, y, tile, day: engine.state.day + days });
  }

  Game.prototype.interact = function (canPet = true, isTool = true) {
    const p = this.state.player;
    const tool = this.getTool();
    const fx = Math.floor(p.x + (p.dir === 3 ? 1 : p.dir === 2 ? -1 : 0));
    const fy = Math.floor(p.y + (p.dir === 0 ? 1 : p.dir === 1 ? -1 : 0));
    const tile = this.getTile(fx, fy);
    const props = TILE_PROPS[tile] || {};

    // door interaction — E only (not Space/tool)
    if (tile === T.DOOR && this.doorCooldown <= 0 && !isTool) {
      const door = this.zone.doors.find(d => d.x === fx && d.y === fy);
      if (door) {
        if (door.to === 'lighthouse' && !this.canEnterLighthouse()) {
          this.showToast('The gate is rusted shut. Something is missing — the island is not yet ready for you.', 5000);
          return;
        }
        if (door.to === 'saloon' && !(this.state.flags && this.state.flags.saloonRestored)) {
          this.showToast('The saloon is boarded shut. Talk to Old Gus about restoring it.', 5000);
          return;
        }
        if (door.to === 'spooky_shores' && !canAccessSpookyShores(this.state)) {
          this.showToast('A wall of fog blocks the path. Perhaps in another cycle...', 5000);
          return;
        }
        if (door.to === 'nikki_basement') {
          if (!(this.state.flags && this.state.flags.nikkiKidnapped) || this.state.flags.nikkiRescued) {
            this.showToast('A frost seals the hatch. It hums with grief — but there is no one left to free down there.', 5000);
            return;
          }
          if (!(this.state.flags && this.state.flags.nikkiKidnapClue)) {
            this.showToast('A frost-sealed hatch, whispered over by the wind. Something is wrong in town — someone is missing. Find them first.', 5000);
            return;
          }
        }
        this.transitionZone(door.to, door.targetX, door.targetY);
        return;
      }
    }

    if (this.actionState) return;

    if (this.buildMode) { this.tryPlace(); return; }
    if (this.fishingState) return;

    // ── Axe a placed buildable: knock it down and refund materials ──
    if (isTool && tool.id === 'axe') {
      const placedBuildable = BUILDABLES.find(bb => bb.tile === tile);
      if (placedBuildable) {
        const bx = fx, by = fy;
        this.triggerAction('axe', () => {
          this.pickupBuildable(bx, by, placedBuildable);
        });
        return;
      }
    }

    if (this.state.zone === 'town' && this.state.flags && this.state.flags.patriciaPartyToday && !this.state.flags.patriciaPartyAttended) {
      const distToStatue = Math.hypot(this.state.player.x - 22.5, this.state.player.y - 17.5);
      if (distToStatue < 5) { this.attendPatriciaParty(); return; }
    }

    if (isTool && this.enemies && this.enemies.length > 0) {
      // Find the closest enemy within sword reach — prefer enemies in front, but always
      // pick the nearest by distance so swings connect with whatever is closest to the blade
      let enemy = null;
      let bestDist = Infinity;
      for (const e of this.enemies) {
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist < 2.0 && dist < bestDist) { bestDist = dist; enemy = e; }
      }
      if (enemy) {
        if (tool.id === 'sword') {
          this.triggerAction('sword', () => {
            this.attackEnemy(enemy);
            this.spawnImpactParticles(enemy.x, enemy.y, 'sword');
          });
          return;
        }
        this.showToast('Select Sword to fight! (slot 7)');
      }
    }

    const npc = this.zone.npcs.find(n => !(n._wander && n._wander.state === 'inside') && Math.abs(n.x - fx) < 1.2 && Math.abs(n.y - fy) < 1.2);
    if (npc && !isTool) {
      if (npc.shop) {
        if (npc.shopType === 'stranger') { this.onState({ openStrangerShop: true }); this.audio.playSfx('pickup'); return; }
        this.onState({ openShop: true, shopType: npc.shopType || 'general' }); this.audio.playSfx('pickup'); return;
      }
      this.talkToNPC(npc); return;
    }

    // ── Grotto stairs / waystone / portal — generous proximity check ──
    // Check a 2-tile radius around the player so the "sweet spot" is easy to hit.
    if (!isTool || props.interact) {
      const px = Math.floor(p.x), py = Math.floor(p.y);
      let found = null;
      let foundTx = -1, foundTy = -1;
      for (let dy = -1; dy <= 1 && !found; dy++) {
        for (let dx = -1; dx <= 1 && !found; dx++) {
          if (dx === 0 && dy === 0) continue;
          const t = this.getTile(px + dx, py + dy);
          const tp = TILE_PROPS[t];
          if (tp && (tp.interact === 'descend' || tp.interact === 'ascend' || tp.interact === 'waystone' || tp.interact === 'surface_portal' || tp.interact === 'grotto_prize')) {
            found = tp.interact;
            foundTx = px + dx;
            foundTy = py + dy;
          }
        }
      }
      // Also check the facing tile (already computed above) — this catches tiles 2 away
      if (!found && props.interact === 'descend') { found = 'descend'; foundTx = fx; foundTy = fy; }
      if (!found && props.interact === 'ascend') { found = 'ascend'; foundTx = fx; foundTy = fy; }
      if (!found && props.interact === 'waystone') { found = 'waystone'; foundTx = fx; foundTy = fy; }
      if (!found && props.interact === 'surface_portal') { found = 'surface_portal'; foundTx = fx; foundTy = fy; }
      if (!found && props.interact === 'grotto_prize') { found = 'grotto_prize'; foundTx = fx; foundTy = fy; }
      if (!found && props.interact === 'lighthouse_key') { found = 'lighthouse_key'; foundTx = fx; foundTy = fy; }
      if (found === 'descend') { this.descendGrotto(); return; }
      if (found === 'ascend') { this.ascendGrotto(); return; }
      if (found === 'waystone') { this.onState({ openWaystone: true }); this.audio.playSfx('pickup'); return; }
      if (found === 'surface_portal') { this.exitToSurface(); return; }
      if (found === 'lighthouse_key') { this.collectLighthouseKey(); return; }
      if (found === 'grotto_prize') {
        this.collectGrottoPrize();
        return;
      }
    }
    // ── Animal production — eggs & milk are produced automatically every 2 days ──
    if (props.interact === 'collect_eggs') {
      this.showToast('🐔 Your chickens lay eggs automatically — check your inventory every 2 days!', 4000);
      return;
    }
    if (props.interact === 'collect_milk') {
      this.showToast('🐮 Your cows produce milk automatically — check your inventory every 2 days!', 4000);
      return;
    }

    if (props.interact === 'sleep') { this.sleep(); return; }
    if (props.interact === 'storage') { this.onState({ openStorage: true }); this.audio.playSfx('pickup'); return; }
    if (props.interact === 'craft') { this.onState({ openCraft: true }); return; }
    if (props.interact === 'witch_tome') { this.interactWitchTome(); return; }
    if (props.interact === 'mayor_basement') { this.enterMayorsBasement(); return; }

    if (tile === T.CRYSTAL && this.state.zone === 'lighthouse') { this.triggerLighthouseEnding(); return; }

    // ── Objects take priority over resource gathering on the same tile ──
    const hasObj = this.zone.objects.find(o => !o.collected && Math.abs(o.x - fx) < 1 && Math.abs(o.y - fy) < 1);

    // gather resources — tool action, Space only (skip if an object is here)
    if (isTool && props.gather && !hasObj) {
      if ((props.gather === 'stone' || props.gather === 'crystal') && tool.id !== 'pickaxe') { this.showToast('Select Pickaxe to mine (slot 6)'); }
      else {
        const gatherType = props.gather;
        const gx = fx, gy = fy;
        const origTile = tile;
        const inGrotto = this.zone.id === 'grotto';
        const floor = this.state.grottoFloor || 0;
        this.triggerAction(tool.id, () => {
          this.addItem(gatherType, 1);
          this.setTileOverride(gx, gy, T.GRASS);
          if (!inGrotto) scheduleRegrow(this, gx, gy, origTile, 4);
          this.audio.playSfx('pickup');
          this.spawnImpactParticles(gx + 0.5, gy + 0.5, tool.id);
          this.spawnPickupParticles(gx + 0.5, gy + 0.5, gatherType, 1);
          this.gainXp(2);
          if (inGrotto && floor > 0) {
            const gemRoll = Math.random();
            let gem = null;
            if (floor >= 40 && gemRoll < 0.04) gem = 'diamond';
            else if (floor >= 25 && gemRoll < 0.07) gem = 'emerald';
            else if (floor >= 15 && gemRoll < 0.10) gem = 'sapphire';
            else if (floor >= 10 && gemRoll < 0.12) gem = 'ruby';
            else if (floor >= 5 && gemRoll < 0.15) gem = 'amethyst';
            else if (floor >= 3 && gemRoll < 0.18) gem = 'gold_ore';
            else if (gemRoll < 0.20) { this.addItem('iron', 1); this.showToast('Found iron ore!'); this.spawnPickupParticles(gx + 0.5, gy + 0.5, 'iron', 1); }
            if (gem) {
              this.addItem(gem, 1);
              this.showToast(`✦ Found ${ITEMS[gem].name}! ✦`, 4000);
              this.audio.playSfx('bell');
              this.spawnPickupParticles(gx + 0.5, gy + 0.5, gem, 1);
              this.gainXp(5);
            }
          }
          this.showToast(`Gathered ${ITEMS[gatherType].name}`);
          this.pushState();
        });
        return;
      }
    }
    // chop tree — tool action, Space only — trees regrow after 3 days (skip if an object is here)
    if (isTool && !hasObj && (tile === T.TREE || tile === T.TWISTED_TREE || tile === T.PINE || tile === T.OAK || tile === T.BIRCH || tile === T.WILLOW || tile === T.DEAD_TREE || tile === T.BIG_TREE)) {
      if (tool.id !== 'axe') { this.showToast('Select Axe to chop trees (slot 2)'); }
      else if (tile === T.BIG_TREE) {
        // Big trees require 3 hits — track progress per tile
        const tKey = `${this.state.zone},${fx},${fy}`;
        if (!this.treeChops) this.treeChops = {};
        this.treeChops[tKey] = (this.treeChops[tKey] || 0) + 1;
        const hits = this.treeChops[tKey];
        const maxHits = 3;
        const tx = fx, ty = fy;
        if (hits < maxHits) {
          this.triggerAction('axe', () => {
            this.audio.playSfx('chop');
            this.showToast(`Chop... (${hits}/${maxHits})`, 1500);
            p.energy -= 3;
            this.spawnImpactParticles(tx + 0.5, ty + 0.3, 'axe');
            this.pushState();
          });
        } else {
          delete this.treeChops[tKey];
          this.triggerAction('axe', () => {
            this.addItem('wood', 6);
            this.setTileOverride(tx, ty, T.GRASS);
            scheduleRegrow(this, tx, ty, T.BIG_TREE, 6);
            this.audio.playSfx('chop');
            this.showToast('+6 Wood! The ancient tree falls.', 3000);
            p.energy -= 5;
            this.spawnImpactParticles(tx + 0.5, ty + 0.3, 'axe');
            this.spawnPickupParticles(tx + 0.5, ty + 0.3, 'wood', 6);
            this.gainXp(8);
            this.pushState();
          });
        }
        return;
      }
      else {
        const tx = fx, ty = fy;
        const origTreeTile = tile;
        this.triggerAction('axe', () => {
          this.addItem('wood', 2);
          this.setTileOverride(tx, ty, T.GRASS);
          scheduleRegrow(this, tx, ty, origTreeTile, 3);
          this.audio.playSfx('chop');
          this.showToast('+2 Wood');
          p.energy -= 3;
          this.spawnImpactParticles(tx + 0.5, ty + 0.3, 'axe');
          this.spawnPickupParticles(tx + 0.5, ty + 0.3, 'wood', 2);
          this.gainXp(3);
          this.pushState();
        });
        return;
      }
    }
    // facing water — fishing rod fishes, watering can refills — tool action, Space only
    if (isTool && props.water) {
      if (tool.id === 'watering_can') {
        this.triggerAction('watering_can', () => {
          this.state.flags.waterFull = true;
          this.showToast('Refilled watering can');
          this.spawnImpactParticles(fx + 0.5, fy + 0.5, 'watering_can');
          this.audio.playSfx('pickup');
          this.pushState();
        });
        return;
      }
      if (tool.id === 'fishing_rod') {
        // On an island — any exterior water or deep grotto water has fish
        const isGrottoDeep = this.zone.id === 'grotto' && (this.state.grottoFloor || 0) >= 20;
        const canFish = !this.zone.def.interior || isGrottoDeep;
        if (!canFish) {
          this.showToast('The water is still here... no fish.');
        } else {
          this.triggerAction('fishing_rod', () => {
            this.startFishing();
            this.spawnImpactParticles(fx + 0.5, fy + 0.5, 'fishing_rod');
            this.pushState();
          });
          return;
        }
      } else {
        this.showToast('Select Fishing Rod (slot 5) to fish, or Watering Can (slot 4) to refill');
      }
    }
    // till grass — tool action, Space only
    if (isTool && tool.id === 'hoe' && (tile === T.GRASS || tile === T.DARK_GRASS)) {
      const tx = fx, ty = fy;
      this.triggerAction('hoe', () => {
        this.setTileOverride(tx, ty, T.TILLED);
        this.audio.playSfx('chop');
        this.showToast('Tilled soil');
        p.energy -= 2;
        this.spawnImpactParticles(tx + 0.5, ty + 0.5, 'hoe');
        this.gainXp(1);
        this.pushState();
      });
      return;
    }
    // plant on tilled — support ALL seed types
    if (tile === T.TILLED) {
      const key = `${fx},${fy}`;
      const ov = this.crops[key];
      if (!ov || ov.crop === undefined) {
        // find the first seed the player has
        const seed = SEEDS.find(s => this.hasItem(s.id, 1));
        if (seed) {
          this.removeItem(seed.id, 1);
          this.setTileOverride(fx, fy, T.TILLED, { crop: seed.crop, cropStage: 0, watered: false });
          this.showToast(`Planted ${ITEMS[seed.crop]?.name || seed.crop} seed`);
          this.audio.playSfx('pickup');
        } else this.showToast('No seeds! Buy some at the General Store.');
        return;
      } else if (ov.cropStage >= 2) {
        // harvest — crop goes to inventory for use or sale
        const yieldCount = 2;
        this.addItem(ov.crop, yieldCount);
        this.setTileOverride(fx, fy, T.TILLED);
        this.audio.playSfx('pickup');
        this.showToast(`Harvested ${ITEMS[ov.crop]?.name || ov.crop}! ×${yieldCount}`);
        this.spawnPickupParticles(fx + 0.5, fy + 0.3, ov.crop, yieldCount);
        this.gainXp(3);
        this.pushState();
        return;
      } else if (!ov.watered) {
        if (!isTool) return;
        if (tool.id === 'watering_can') {
          const tx = fx, ty = fy;
          this.triggerAction('watering_can', () => {
            ov.watered = true;
            this.saveTileOverride(tx, ty, ov);
            if (this.renderer3d) this.renderer3d.updateCrop(tx, ty, ov);
            this.showToast('Watered');
            this.spawnImpactParticles(tx + 0.5, ty + 0.3, 'watering_can');
            this.pushState();
          });
          return;
        }
        this.showToast('Select Watering Can (slot 4)');
      } else {
        return;
      }
    }
    // water refill at a well (non-tool press — any water tile also refills via the tool block above)
    if (tile === T.WELL) {
      this.state.flags.waterFull = true;
      this.showToast('Refilled watering can');
      return;
    }
    // collect ground objects
    const obj = this.zone.objects.find(o => !o.collected && Math.abs(o.x - fx) < 1 && Math.abs(o.y - fy) < 1);
    if (obj) {
      // ── Quest: footprints — disappear after examination (clue moves to journal) ──
      if (obj.type === 'footprints') {
        if (!this.state.flags) this.state.flags = {};
        if (!this.state.flags.questFootprints) {
          this.state.flags.questFootprints = true;
          this.state.journal.push({ day: this.state.day, text: obj.text, type: 'clue' });
          this.showToast(obj.text, 6000);
        } else {
          this.showToast(obj.text, 5000);
        }
        // footprint disappears from the floor — it's now in your journal
        obj.collected = true;
        this.state.zones[this.state.zone].objects[`${obj.x},${obj.y}`] = true;
        this.audio.playSfx('pickup');
        this.pushState();
        return;
      }
      // ── Quest: hidden note (requires seeing the footprints first) ──
      if (obj.type === 'note') {
        if (!this.state.flags || !this.state.flags.questFootprints) {
          this.showToast('A waterlogged note is wedged under a stone here... but it means nothing to you yet. Something near the cabin might shed light.', 5000);
          return;
        }
        obj.collected = true;
        this.state.zones[this.state.zone].objects[`${obj.x},${obj.y}`] = true;
        if (!this.state.flags) this.state.flags = {};
        this.state.flags.questNoteFound = true;
        this.addItem('clue', 1);
        this.state.journal.push({ day: this.state.day, text: obj.text, type: 'mystery' });
        this.state.journal.push({ day: this.state.day, text: 'QUEST: Someone signing as "P" knows about the shore figure. Gather evidence in the woods, then confront the ghost at the shipwreck at night.', type: 'clue' });
        this.showToast('✦ Found a hidden note! A new mystery begins... (Journal updated)', 6000);
        this.audio.playSfx('bell');
        this.pushState();
        return;
      }
      // ── Captain Holloway evidence — examined once, then disappears (journal keeps it) ──
      if (obj.type && obj.type.startsWith('evidence_')) {
        if (!this.state.flags) this.state.flags = {};
        const evidenceId = obj.type;
        const evidenceDef = HOLLOWAY_EVIDENCE.find(e => e.id === evidenceId);
        if (!evidenceDef) {
          this.showToast('You examine it, but find nothing of note.', 3000);
          obj.collected = true;
          this.state.zones[this.state.zone].objects[`${obj.x},${obj.y}`] = true;
          this.pushState();
          return;
        }
        if (this.state.flags[evidenceId]) {
          this.showToast(evidenceDef.text, 5000);
        } else {
          this.state.flags[evidenceId] = true;
          this.state.journal.push({ day: this.state.day, text: `EVIDENCE: ${evidenceDef.name} — ${evidenceDef.text}`, type: 'clue' });
          this.showToast(`✦ Evidence found: ${evidenceDef.name}!`, 4000);
          this.audio.playSfx('bell');
          const allFound = HOLLOWAY_EVIDENCE.every(e => this.state.flags[e.id]);
          if (allFound) {
            this.state.journal.push({ day: this.state.day, text: 'You have gathered all four pieces of evidence. The ghost at the shipwreck shore can be confronted. Go at night, near the wreck.', type: 'clue' });
            this.showToast('✦ All evidence gathered! Confront the ghost at the shore at night! ✦', 6000);
            this.audio.playSfx('bell');
          }
        }
        // examined — remove from the map (the journal remembers it)
        obj.collected = true;
        this.state.zones[this.state.zone].objects[`${obj.x},${obj.y}`] = true;
        this.audio.playSfx('pickup');
        this.pushState();
        return;
      }
      // ── Lore objects — examined once, then disappears (journal keeps it) ──
      if (obj.type === 'lore') {
        if (!this.state.flags) this.state.flags = {};
        if (this.state.zone === 'mayors_basement') this.state.flags.mayorSecretDiscovered = true;
        const loreKey = `lore_${this.state.zone}_${obj.x}_${obj.y}`;
        if (!this.state.flags[loreKey]) {
          this.state.flags[loreKey] = true;
          this.state.journal.push({ day: this.state.day, text: `DISCOVERY: ${obj.text}`, type: 'mystery' });
          this.showToast(obj.text, 8000);
          this.audio.playSfx('bell');
        } else {
          this.showToast(obj.text, 6000);
        }
        // examined — remove from the map (the journal remembers it)
        obj.collected = true;
        this.state.zones[this.state.zone].objects[`${obj.x},${obj.y}`] = true;
        this.pushState();
        return;
      }
      obj.collected = true;
      this.state.zones[this.state.zone].objects[`${obj.x},${obj.y}`] = true;
      if (obj.type === 'antique') { this.addItem('antique', 1); this.showToast('Found an antique!'); }
      else if (obj.type === 'clue') {
        this.addItem('clue', 1);
        this.state.journal.push({ day: this.state.day, text: obj.text, type: 'clue' });
        this.showToast('Found a clue! (Journal updated)');
        this.audio.playSfx('bell');
      }
      this.audio.playSfx('pickup');
      return;
    }

    // fallback: play a tool swing for visual feedback even with no target — Space only
    if (isTool && tool.id !== 'hands' && tool.id !== 'lantern') {
      this.triggerAction(tool.id, null);
    }
    // ── Lantern: toggle a warm light glow around the player instead of swinging ──
    if (isTool && tool.id === 'lantern') {
      this.toggleLantern();
    }
  };

}