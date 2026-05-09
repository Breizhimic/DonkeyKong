/* ============================
   DONKEY KONG — collision.js
   AABB collision detection
   ============================ */

const Collision = (() => {

  /**
   * Simple AABB overlap test.
   */
  function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw &&
           ax + aw > bx &&
           ay < by + bh &&
           ay + ah > by;
  }

  /**
   * Check if player is ABOVE a barrel and falling (jump-over).
   * Returns true if the player cleared the barrel from above.
   */
  function playerJumpedBarrel(player, barrel) {
    const pp = player.getPos();
    const bx = barrel.x, by = barrel.y;
    const bw = Barrels.getW(), bh = Barrels.getH();

    // Player foot must be above barrel mid
    const playerFoot = pp.y + pp.h;
    const barrelMid  = by + bh / 2;

    // Horizontally aligned
    const hOverlap = overlaps(pp.x, pp.y, pp.w, pp.h, bx - 4, by, bw + 8, bh + 10);
    if (!hOverlap) return false;

    // Player is going down or crossing
    return playerFoot <= barrelMid + 8;
  }

  /**
   * Check barrel-player collision (hit).
   */
  function barrelHitsPlayer(player, barrel) {
    const pp = player.getPos();
    const bx = barrel.x, by = barrel.y;
    const bw = Barrels.getW(), bh = Barrels.getH();

    // Shrink hitboxes slightly for fairness
    return overlaps(
      pp.x + 3, pp.y + 3, pp.w - 6, pp.h - 6,
      bx + 2, by + 2, bw - 4, bh - 4
    );
  }

  /**
   * Check if player reached the princess.
   */
  function playerReachedPrincess(player, princess) {
    const pp = player.getPos();
    return overlaps(pp.x, pp.y, pp.w, pp.h,
                    princess.x - 10, princess.y - 10,
                    princess.w + 20, princess.h + 20);
  }

  return { overlaps, playerJumpedBarrel, barrelHitsPlayer, playerReachedPrincess };
})();
