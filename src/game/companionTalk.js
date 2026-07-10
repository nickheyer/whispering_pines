// Companion interaction — pet Fritz and talk to romanced companions (T key).
import { getRomanceNpc } from './romance';

export function installCompanionTalk(Game) {
  Game.prototype.talkToCompanion = function () {
    const p = this.state.player;
    // Talk to romance companion if they're following you (checked first so T always talks)
    if (this.state.romanceCompanion) {
      const n = this.state.romanceCompanion;
      const ndist = Math.hypot(n.x - p.x, n.y - p.y);
      if (ndist < 3.0) {
        const rNpc = getRomanceNpc(n.npcId);
        this.talkToNPC({ id: n.npcId, name: rNpc?.name || n.name || 'Companion', color: rNpc?.color || n.color || '#888', romanceable: true });
        return;
      }
    }
    // Pet Fritz
    const f = this.state.fritz;
    const fdist = Math.hypot(f.x - p.x, f.y - p.y);
    if (fdist < 3.0 && this.fritzPetCd <= 0) {
      this.petFritz();
      return;
    }
    this.showToast('Get closer to your companion to interact (T)', 2000);
  };
}