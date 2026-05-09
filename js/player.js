/* ============================
   DONKEY KONG — player.js
   Jumpman — Input, Physics, Rendering
   ============================ */

const Player = (() => {
  const W = 18, H = 24;

  let x, y, vx = 0, vy = 0;
  let onGround = false;
  let onLadder = false;
  let currentLadder = null;
  let facingRight = true;
  let state = 'idle';   // idle | walk | climb | jump | fall | dead
  let animT = 0;
  let walkFrame = 0;
  let walkTimer = 0;
  let jumpHoldMs = 0;
  let jumpPressed = false;
  let deadTimer = 0;

  // Invincibility frames after respawn
  let invincible = false;
  let invTimer = 0;
  const INV_DURATION = 1.5; // seconds

  // Keys
  const keys = { left: false, right: false, up: false, down: false, jump: false };
  let jumpJustPressed = false;
  let jumpWasDown = false;

  function init(startX, startY) {
    x = startX; y = startY;
    vx = 0; vy = 0;
    onGround = false; onLadder = false;
    state = 'idle'; animT = 0; walkFrame = 0;
    deadTimer = 0;
    invincible = true; invTimer = 0;
    currentLadder = null;
    Object.keys(keys).forEach(k => keys[k] = false);
  }

  function setKey(k, v) {
    if (k === 'jump') {
      if (v && !jumpWasDown) jumpJustPressed = true;
      jumpWasDown = v;
    }
    keys[k] = v;
  }

  function update(dt) {
    if (state === 'dead') {
      deadTimer += dt;
      return;
    }

    animT += dt;

    // Invincibility
    if (invincible) {
      invTimer += dt;
      if (invTimer >= INV_DURATION) { invincible = false; invTimer = 0; }
    }

    const ladder = Platforms.getOverlappingLadder({ x, y, w: W, h: H });

    // ── Jump input ──────────────────────────
    if (jumpJustPressed && (onGround || onLadder)) {
      jumpJustPressed = false;
      vy = Physics.calcJumpVelocity(0); // short hop only — can't skip floors
      vx = (keys.right ? 1 : keys.left ? -1 : 0) * Physics.WALK_SPEED;
      onGround = false;
      onLadder = false;
      currentLadder = null;
      state = 'jump';
      Particles.jumpEffect(x + W / 2, y + H);
      Audio.SFX.jump();
    }
    jumpJustPressed = false;

    // ── Ladder ──────────────────────────────
    if (ladder) {
      if (keys.up || keys.down) {
        onLadder = true;
        currentLadder = ladder;
        vx = 0;
        vy = keys.up ? -Physics.CLIMB_SPEED : Physics.CLIMB_SPEED;
        onGround = false;
        state = 'climb';
        if (animT - walkTimer > 0.15) { walkTimer = animT; walkFrame = 1 - walkFrame; Audio.SFX.climb(); }
      } else if (onLadder) {
        vy = 0;
      }
    } else if (!ladder) {
      onLadder = false;
      currentLadder = null;
    }

    // ── Horizontal movement ──────────────────
    if (!onLadder) {
      if (keys.left)  { vx = -Physics.WALK_SPEED; facingRight = false; }
      else if (keys.right) { vx = Physics.WALK_SPEED; facingRight = true; }
      else            { vx = 0; }
    }

    // ── Apply gravity ────────────────────────
    if (!onLadder) {
      vy += Physics.GRAVITY * dt;
      if (vy > Physics.MAX_FALL_SPEED) vy = Physics.MAX_FALL_SPEED;
    }

    // ── Integrate ────────────────────────────
    x += vx * dt;
    y += vy * dt;

    // ── Platform landing ─────────────────────
    const landing = Platforms.getLandingPlatform({ x, y, w: W, h: H, vy });
    if (landing && !onLadder) {
      y = landing.surfaceY - H;
      vy = 0;
      onGround = true;
      if (state === 'jump' || state === 'fall') Audio.SFX.land();
    } else {
      if (!onLadder) onGround = false;
    }

    // Also check standing on ground still
    if (onGround) {
      const surf = Platforms.getSurface({ x, y, w: W, h: H, vy: 1 });
      if (surf !== null) {
        y = surf - H;
        vy = 0;
      } else {
        onGround = false; // walked off edge
      }
    }

    // ── Bounds ──────────────────────────────
    if (x < 0) x = 0;
    if (x + W > 400) x = 400 - W;

    // Fell off screen
    if (y > 550) {
      state = 'dead';
    }

    // ── State ───────────────────────────────
    if (state !== 'dead') {
      if (vy < -5 && !onLadder) state = 'jump';
      else if (!onGround && !onLadder && vy > 5) state = 'fall';
      else if (onLadder) state = 'climb';
      else if (vx !== 0) {
        state = 'walk';
        if (animT - walkTimer > 0.12) {
          walkTimer = animT;
          walkFrame = (walkFrame + 1) % 3;
          if (walkFrame === 0) Particles.dustEffect(x + W / 2, y + H);
        }
      } else {
        state = 'idle';
      }
    }
  }

  function draw(ctx) {
    if (state === 'dead') return;

    // Flicker when invincible
    if (invincible && Math.floor(animT * 10) % 2 === 0) return;

    ctx.save();
    ctx.translate(x + W / 2, y + H / 2);
    if (!facingRight) ctx.scale(-1, 1);

    // Glow
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur  = state === 'jump' ? 18 : 8;

    drawPixelJumpman(ctx, state, walkFrame, animT);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawPixelJumpman(ctx, state, frame, t) {
    const hW = W / 2, hH = H / 2;
    const jumpOff = state === 'jump' ? -3 : 0;
    const climbY  = state === 'climb' ? Math.sin(t * 10) * 2 : 0;

    // === HAT ===
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(-7, -hH + jumpOff - 1, 14, 6);     // brim
    ctx.fillRect(-5, -hH + jumpOff - 7, 10, 7);      // top

    // === HAIR / FACE ===
    ctx.fillStyle = '#FFCBA4';
    ctx.fillRect(-6, -hH + jumpOff + 4, 12, 8);      // face

    // === MUSTACHE ===
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-5, -hH + jumpOff + 8, 10, 3);

    // === EYES ===
    ctx.fillStyle = '#000';
    ctx.fillRect(-4, -hH + jumpOff + 5, 2, 2);
    ctx.fillRect(2, -hH + jumpOff + 5, 2, 2);

    // === OVERALLS (blue) ===
    ctx.fillStyle = '#3355FF';
    ctx.fillRect(-7, -hH + jumpOff + 11, 14, 10);

    // === SHIRT (red) ===
    ctx.fillStyle = '#FF2020';
    ctx.fillRect(-6, -hH + jumpOff + 10, 12, 4);

    // === ARMS ===
    ctx.fillStyle = '#FF2020';
    const armY = -hH + jumpOff + 11;
    if (state === 'walk') {
      const armSwing = [0, 4, -4][frame];
      ctx.fillRect(-hW - 2, armY + armSwing, 5, 7);
      ctx.fillRect(hW - 3, armY - armSwing, 5, 7);
    } else if (state === 'jump') {
      ctx.fillRect(-hW - 2, armY - 3, 5, 7);
      ctx.fillRect(hW - 3, armY - 3, 5, 7);
    } else {
      ctx.fillRect(-hW - 1, armY, 5, 7);
      ctx.fillRect(hW - 4, armY, 5, 7);
    }

    // === GLOVES (white) ===
    ctx.fillStyle = '#fff';
    if (state === 'walk') {
      const armSwing = [0, 4, -4][frame];
      ctx.fillRect(-hW - 2, armY + armSwing + 6, 5, 4);
      ctx.fillRect(hW - 3, armY - armSwing + 6, 5, 4);
    } else {
      ctx.fillRect(-hW - 2, armY + 6, 5, 4);
      ctx.fillRect(hW - 3, armY + 6, 5, 4);
    }

    // === LEGS ===
    ctx.fillStyle = '#3355FF';
    if (state === 'walk') {
      const legSwing = [0, 5, -5][frame];
      ctx.fillRect(-6, hH - 10 + jumpOff, 5, 10 + legSwing / 2);
      ctx.fillRect(1,  hH - 10 + jumpOff, 5, 10 - legSwing / 2);
    } else if (state === 'climb') {
      const cs = Math.sin(t * 10) * 4;
      ctx.fillRect(-6, hH - 10, 5, 10 + cs);
      ctx.fillRect(1,  hH - 10, 5, 10 - cs);
    } else if (state === 'jump') {
      ctx.fillRect(-6, hH - 8, 5, 8);
      ctx.fillRect(1,  hH - 8, 5, 8);
    } else {
      ctx.fillRect(-6, hH - 10, 5, 10);
      ctx.fillRect(1,  hH - 10, 5, 10);
    }

    // === BOOTS (brown) ===
    ctx.fillStyle = '#8B4513';
    if (state === 'walk') {
      const legSwing = [0, 5, -5][frame];
      ctx.fillRect(-7, hH - 4 + jumpOff + legSwing / 2, 6, 4);
      ctx.fillRect(1,  hH - 4 + jumpOff - legSwing / 2, 6, 4);
    } else {
      ctx.fillRect(-7, hH - 4 + jumpOff, 6, 4);
      ctx.fillRect(1,  hH - 4 + jumpOff, 6, 4);
    }
  }

  function kill() {
    if (state === 'dead' || invincible) return false;
    state = 'dead';
    deadTimer = 0;
    Particles.deathEffect(x + W / 2, y + H / 2);
    Audio.SFX.death();
    return true;
  }

  function respawn(sx, sy) {
    x = sx; y = sy;
    vx = 0; vy = 0;
    state = 'idle';
    onGround = false; onLadder = false;
    deadTimer = 0;
    invincible = true; invTimer = 0;
  }

  function isInvincible() { return invincible; }
  function isDead() { return state === 'dead'; }
  function getDeadTimer() { return deadTimer; }
  function getPos() { return { x, y, w: W, h: H }; }
  function getState() { return state; }
  function onGroundState() { return onGround; }
  function onLadderState() { return onLadder; }

  return {
    init, setKey, update, draw,
    kill, respawn,
    isInvincible, isDead, getDeadTimer,
    getPos, getState, onGroundState, onLadderState,
    W, H,
  };
})();