// Installs the consumeItem method on the Game class.
// Eating food / drinking restores both HP and energy.
// Fish can be eaten — HP/energy scales with rarity.
import { CONSUMABLES } from './constants';
import { getFishInfo } from './fish';

export function installConsumables(Game) {
  Game.prototype.consumeItem = function (itemId) {
    let def = CONSUMABLES[itemId];
    // ── Fish are consumable — HP/energy based on rarity ──
    if (!def) {
      const fish = getFishInfo(itemId);
      if (fish) {
        const rarityStats = {
          common: { hp: 8, energy: 10 },
          uncommon: { hp: 15, energy: 18 },
          rare: { hp: 25, energy: 30 },
          epic: { hp: 40, energy: 45 },
          legendary: { hp: 60, energy: 70 },
        };
        const stats = rarityStats[fish.rarity] || { hp: 8, energy: 10 };
        def = { hp: stats.hp, energy: stats.energy, name: fish.name, verb: 'Ate' };
      }
    }
    if (!def) return;
    if (!this.hasItem(itemId, 1)) return;
    this.removeItem(itemId, 1);
    if (def.hp) {
      this.state.player.hp = Math.min(this.state.player.maxHp, (this.state.player.hp || 0) + def.hp);
    }
    if (def.energy) {
      this.state.player.energy = Math.min(100, (this.state.player.energy || 0) + def.energy);
    }
    this.audio.playSfx('pickup');
    const parts = [];
    if (def.hp) parts.push(`+${def.hp} HP`);
    if (def.energy) parts.push(`+${def.energy} Energy`);
    this.showToast(`${def.verb} ${def.name}. ${parts.join(' · ')}`, 2500);
    this.pushState();
  };
}