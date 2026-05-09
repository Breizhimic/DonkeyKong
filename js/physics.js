/* ============================
   DONKEY KONG — physics.js
   Gravity, Jump, Velocity
   ============================ */

const Physics = (() => {
  const GRAVITY      = 1100;  // px/s²  (canvas units, scaled)
  const WALK_SPEED   = 130;   // px/s
  const CLIMB_SPEED  = 120;   // px/s
  const JUMP_MIN     = 260;   // px/s  (tap) — saute ~34px max
  const JUMP_MAX     = 320;   // px/s  (hold) — saute ~52px max, pas assez pour un étage (68px)
  const BARREL_SPEED_BASE = 140; // px/s (scales with level)
  const MAX_FALL_SPEED = 900; // terminal velocity

  /**
   * Apply gravity to an entity each frame.
   * @param {object} ent  - must have .vy
   * @param {number} dt   - delta time in seconds
   */
  function applyGravity(ent, dt) {
    ent.vy += GRAVITY * dt;
    if (ent.vy > MAX_FALL_SPEED) ent.vy = MAX_FALL_SPEED;
  }

  /**
   * Integrate position from velocity.
   */
  function integrate(ent, dt) {
    ent.x += ent.vx * dt;
    ent.y += ent.vy * dt;
  }

  /**
   * Calculate jump velocity based on how long the button is held.
   * holdMs: milliseconds button was held (capped at 300ms)
   */
  function calcJumpVelocity(holdMs = 0) {
    const t = Math.min(holdMs, 300) / 300; // 0–1
    return -(JUMP_MIN + (JUMP_MAX - JUMP_MIN) * t);
  }

  /**
   * Barrel horizontal speed based on level.
   */
  function barrelSpeed(level) {
    const spd = BARREL_SPEED_BASE + (level - 1) * 18;
    return Math.min(spd, 220); // cap — évite tunneling dans les trous
  }

  return {
    GRAVITY,
    WALK_SPEED,
    CLIMB_SPEED,
    JUMP_MIN,
    JUMP_MAX,
    BARREL_SPEED_BASE,
    MAX_FALL_SPEED,
    applyGravity,
    integrate,
    calcJumpVelocity,
    barrelSpeed,
  };
})();