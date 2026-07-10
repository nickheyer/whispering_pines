// Romance companion — any romanced NPC follows the player everywhere.
// Installs as a method on the Game class, called each update tick.
// Mirrors Fritz's follow logic but trails on the opposite side.

export function installNikkiCompanion(Game) {
  Game.prototype.updateNikkiCompanion = function (dt) {
    if (!this.state || !this.state.romanceCompanion) return;
    const p = this.state.player;
    const n = this.state.romanceCompanion;

    // Kidnapping — companion is taken, stops following
    if (this.state.flags && this.state.flags.nikkiKidnapped && !this.state.flags.nikkiRescued) {
      this.state.romanceCompanion = null;
      return;
    }

    // Sit beside the player while fishing — like Fritz does
    if (this.fishingState) {
      n.state = 'idle';
      n.x = p.x + (p.dir === 3 ? -0.8 : p.dir === 2 ? 0.8 : 0.6);
      n.y = p.y + 0.4;
      n.dir = p.dir;
      n.anim += dt * 2;
      return;
    }

    // Follow — stay behind the player, offset diagonally so they don't overlap Fritz
    const pdirOffset = [
      { x: 0.5, y: -1.2 },  // dir 0 (down) → behind-left
      { x: -0.5, y: 1.2 },  // dir 1 (up) → behind-right
      { x: 1.2, y: 0.5 },   // dir 2 (left) → behind-left
      { x: -1.2, y: -0.5 }, // dir 3 (right) → behind-right
    ];
    const behind = pdirOffset[p.dir];
    const desiredX = p.x + behind.x;
    const desiredY = p.y + behind.y;
    const ddx = desiredX - n.x, ddy = desiredY - n.y;
    const d = Math.hypot(ddx, ddy);
    if (d > 0.3) {
      n.state = 'follow';
      // catch-up: move faster the further away the companion is
      const speed = 2.2 + Math.min(d, 6) * 1.2;
      n.x += (ddx / d) * speed * dt;
      n.y += (ddy / d) * speed * dt;
      n.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 3 : 2) : (ddy > 0 ? 0 : 1);
      n.anim += dt * 8;
    } else {
      n.state = p.moving ? 'follow' : 'idle';
      n.anim += dt * 2;
    }
  };
}