// Action-prompt computation — extracted from engine.js to manage file size.
// Installed onto the Game prototype via installActionPrompt(Game).
import { T, TILE_PROPS, FISHING_ZONES, ITEMS, BUILDABLES } from './constants';

export function installActionPrompt(Game) {
  Game.prototype.updateActionPrompt = function () {
    if (this.actionState) { this.actionPrompt = null; return; }
    const p = this.state.player;
    const tool = this.getTool();
    const fx = Math.floor(p.x + (p.dir === 3 ? 1 : p.dir === 2 ? -1 : 0));
    const fy = Math.floor(p.y + (p.dir === 0 ? 1 : p.dir === 1 ? -1 : 0));
    const tile = this.getTile(fx, fy);
    const props = TILE_PROPS[tile] || {};
    const npc = this.zone.npcs.find(n => Math.abs(n.x - fx) < 1.2 && Math.abs(n.y - fy) < 1.2);
    const f = this.state.fritz;
    const fdx = f.x - p.x;
    const fdy = f.y - p.y;
    const fdist = Math.hypot(fdx, fdy);
    const fritzClose = fdist < 1.8;
    let facingFritz = false;
    if (fritzClose) {
      if (p.dir === 0 && fdy > 0.15) facingFritz = true;
      else if (p.dir === 1 && fdy < -0.15) facingFritz = true;
      else if (p.dir === 2 && fdx < -0.15) facingFritz = true;
      else if (p.dir === 3 && fdx > 0.15) facingFritz = true;
    }
    let prompt = null;
    if (this.buildMode) {
      const placedB = BUILDABLES.find(b => b.tile === tile);
      prompt = placedB ? `Pick up ${placedB.name} (E)` : 'Place here (E)';
    }
    else if (fritzClose && facingFritz && this.fritzPetCd <= 0) {
      const petName = this.state.character?.pet === 'void' ? 'Void' : this.state.character?.pet === 'hanzo' ? 'Hanzo' : 'Fritz';
      prompt = `Pet ${petName} (T)`;
    }
    else if (this.state.romanceCompanion) {
      const n = this.state.romanceCompanion;
      const ndx = n.x - p.x, ndy = n.y - p.y;
      const ndist = Math.hypot(ndx, ndy);
      let facingNikki = false;
      if (p.dir === 0 && ndy > 0.15) facingNikki = true;
      else if (p.dir === 1 && ndy < -0.15) facingNikki = true;
      else if (p.dir === 2 && ndx < -0.15) facingNikki = true;
      else if (p.dir === 3 && ndx > 0.15) facingNikki = true;
      if (ndist < 1.8 && facingNikki) prompt = `Talk to ${n.name || 'companion'} (T)`;
    }
    else if (this.enemies && this.enemies.length > 0) {
      const enemy = this.enemies.find(e => Math.abs(e.x - fx) < 1.8 && Math.abs(e.y - fy) < 1.8);
      if (enemy) prompt = tool.id === 'sword' ? `Attack ${enemy.name}! (Space)` : 'Select Sword to fight';
    }
    else if (this.fishingState) {
      if (this.fishingState.phase === 'minigame') prompt = null;
      else if (this.fishingState.phase === 'cast') prompt = 'Casting...';
      else prompt = 'Waiting for a bite...';
    }
    else if (tile === T.DOOR) {
      const door = this.zone.doors.find(d => d.x === fx && d.y === fy);
      if (door && door.to === 'lighthouse' && !this.canEnterLighthouse()) prompt = '🔒 Locked';
      else if (door && door.to === 'saloon' && !(this.state.flags && this.state.flags.saloonRestored)) prompt = '🔒 Boarded shut';
      else if (door && door.to === 'spooky_shores' && (this.state.storyCycle || 1) < 3) prompt = '🔒 Shrouded in fog';
      else if (door && door.to === 'nikki_basement') {
        const kidnapped = this.state.flags && this.state.flags.nikkiKidnapped && !this.state.flags.nikkiRescued;
        prompt = kidnapped ? 'Descend into the cellar (E)' : '🔒 Frost-sealed hatch';
      }
      else prompt = 'Enter (E)';
    }
    else if (npc) prompt = npc.shop ? `Shop with ${npc.name}` : `Talk to ${npc.name}`;
    else if (props.interact === 'descend') prompt = 'Descend (E)';
    else if (props.interact === 'ascend') prompt = 'Ascend (E)';
    else if (props.interact === 'waystone') prompt = 'Waystone — Fast Travel (E)';
    else if (props.interact === 'surface_portal') prompt = 'Step through portal (E)';
    else if (props.interact === 'grotto_prize') prompt = 'Open chest (E)';
    // ── Grotto stairs/portal proximity check — show prompt when adjacent in any direction ──
    if (!prompt) {
      const px = Math.floor(p.x), py = Math.floor(p.y);
      for (let dy = -1; dy <= 1 && !prompt; dy++) {
        for (let dx = -1; dx <= 1 && !prompt; dx++) {
          if (dx === 0 && dy === 0) continue;
          const t = this.getTile(px + dx, py + dy);
          const tp = TILE_PROPS[t];
          if (!tp) continue;
          if (tp.interact === 'descend') prompt = 'Descend (E)';
          else if (tp.interact === 'ascend') prompt = 'Ascend (E)';
          else if (tp.interact === 'waystone') prompt = 'Waystone — Fast Travel (E)';
          else if (tp.interact === 'surface_portal') prompt = 'Step through portal (E)';
          else if (tp.interact === 'grotto_prize') prompt = 'Open chest (E)';
        }
      }
    }
    // ── Secret button — Grotto Floor 1 back-left corner (E only) ──
    if (!prompt && this.state.zone === 'grotto' && (this.state.grottoFloor || 0) === 1) {
      const distToSecret = Math.hypot(p.x - 2.5, p.y - 2.5);
      if (distToSecret < 3.0) prompt = '✦ Investigate (E)';
    }
    else if (props.interact === 'sleep') prompt = 'Sleep (E)';
    else if (props.interact === 'storage') prompt = 'Open chest';
    else if (props.interact === 'collect_eggs') {
      const key = `${this.state.zone},${fx},${fy}`;
      const ready = !!(this.state.animalProduce && this.state.animalProduce[key]);
      prompt = ready ? 'Collect eggs (E)' : 'No eggs yet (E)';
    }
    else if (props.interact === 'collect_milk') {
      const key = `${this.state.zone},${fx},${fy}`;
      const ready = !!(this.state.animalProduce && this.state.animalProduce[key]);
      prompt = ready ? 'Collect milk (E)' : 'No milk yet (E)';
    }
    else if (props.interact === 'craft') prompt = 'Craft';
    else if (props.interact === 'mayor_basement') {
      const cycle = this.state.storyCycle || 1;
      const day = this.state.day;
      prompt = (cycle > 1 || day >= 7) ? 'Descend (E)' : 'Sealed hatch (E)';
    }
    else if (props.gather && !this.zone.objects.find(o => !o.collected && Math.abs(o.x - fx) < 1 && Math.abs(o.y - fy) < 1)) prompt = ((props.gather === 'stone' || props.gather === 'crystal') && tool.id !== 'pickaxe') ? 'Select Pickaxe' : `Gather ${ITEMS[props.gather].name} (Space)`;
    else if (tile === T.TREE || tile === T.TWISTED_TREE || tile === T.PINE || tile === T.OAK || tile === T.BIRCH || tile === T.WILLOW || tile === T.DEAD_TREE || tile === T.BIG_TREE) prompt = tool.id === 'axe' ? (tile === T.BIG_TREE ? 'Chop giant tree (Space)' : 'Chop (Space)') : 'Select Axe';
    else if (BUILDABLES.find(bb => bb.tile === tile)) {
      const b = BUILDABLES.find(bb => bb.tile === tile);
      prompt = tool.id === 'axe' ? `Chop ${b.name} (Space)` : 'Select Axe to demolish';
    }
    else if (props.water) {
      const isGrottoDeep = this.zone.id === 'grotto' && (this.state.grottoFloor || 0) >= 20;
      if (!FISHING_ZONES.includes(this.zone.id) && !isGrottoDeep) prompt = 'No fish here';
      else prompt = tool.id === 'fishing_rod' ? 'Fish (Space)' : 'Select Fishing Rod';
    }
    else if (tile === T.GRASS || tile === T.DARK_GRASS) { if (tool.id === 'hoe') prompt = 'Till (Space)'; }
    else if (tile === T.TILLED) {
      const ov = this.crops[`${fx},${fy}`];
      if (!ov || ov.crop === undefined) prompt = 'Plant (E)';
      else if (ov.cropStage >= 2) prompt = 'Harvest (E)';
      else if (!ov.watered) prompt = tool.id === 'watering_can' ? 'Water (Space)' : 'Select Watering Can';
    }
    else if (tile === T.WELL) prompt = 'Refill (E)';
    else if (tool.id === 'lantern' && !this.state.lanternOn) prompt = 'Light lantern (Space)';
    else if (tool.id === 'lantern' && this.state.lanternOn) prompt = 'Dim lantern (Space)';
    const obj = this.zone.objects.find(o => !o.collected && Math.abs(o.x - fx) < 1 && Math.abs(o.y - fy) < 1);
    if (obj && !prompt) {
      if (obj.type === 'footprints') prompt = 'Examine footprints (E)';
      else if (obj.type === 'note') prompt = 'Read note (E)';
      else if (obj.type === 'evidence_sailcloth') prompt = 'Examine sail cloth (E)';
      else if (obj.type === 'evidence_conch') prompt = 'Examine conch shell (E)';
      else if (obj.type === 'evidence_boot') prompt = 'Examine boot (E)';
      else if (obj.type === 'evidence_fogoil') prompt = 'Examine bottle (E)';
      else prompt = 'Examine (E)';
    }
    if (!prompt && this.state.zone === 'town' && this.state.flags && this.state.flags.patriciaPartyToday && !this.state.flags.patriciaPartyAttended) {
      const distToStatue = Math.hypot(this.state.player.x - 22.5, this.state.player.y - 17.5);
      if (distToStatue < 5) prompt = '🎉 Join the party (E)';
    }
    this.actionPrompt = prompt;
  };
}