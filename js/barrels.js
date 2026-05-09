/* ============================
   DONKEY KONG — barrels.js
   Barrel spawning, physics, rendering
   ============================ */

const Barrels = (() => {
  let barrels = [];
  let spawnTimer = 0;
  let spawnRate  = 2000; // ms
  let level      = 1;
  let kongX      = 60;
  let kongY      = 175;

  const W = 20, H = 18;

  function init(lvlNum, kx, ky, rate) {
    barrels   = [];
    spawnTimer = 0;
    level     = lvlNum;
    kongX     = kx;
    kongY     = ky;
    spawnRate = rate;
  }

  function update(dt, dtMs) {
    spawnTimer += dtMs;
    // Limit max barrels on screen to avoid accumulation
    if (spawnTimer >= spawnRate && barrels.length < 8) {
      spawnTimer = 0;
      spawnBarrel();
    } else if (barrels.length >= 8) {
      spawnTimer = 0; // reset so it tries again after barrels clear
    }

    const spd = Physics.barrelSpeed(level);

    for (let i = barrels.length - 1; i >= 0; i--) {
      const b = barrels[i];
      if (b.dead) { barrels.splice(i, 1); continue; }

      // Check if on platform surface (pass width for accurate gap detection)
      const surf = Platforms.getBarrelSurface(b.x + W / 2, b.y, H, W);
      if (surf) {
        b.onGround = true;
        b.y  = surf.y;
        b.vy = 0;
        // Roll — slope influences direction naturally
        b.vx = b.dir * (spd + (surf.slope || 0) * 100);
        b.vx = Math.max(-260, Math.min(260, b.vx));
      } else {
        b.onGround = false;
        Physics.applyGravity(b, dt);
        // Keep horizontal velocity while airborne
      }

      // Move
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Rotation
      b.rot += (b.vx / 60) * dt * 3;

      // Wall behavior: DO NOT bounce — let barrel fall off edge
      // If barrel reaches canvas wall and there's no platform to fall onto,
      // flip direction (happens at very edge of levels with no gap near wall)
      if (b.x < 0) {
        b.x = 0;
        // Only bounce if onGround (on a platform that extends to the wall)
        // otherwise it should already be falling
        if (b.onGround) b.dir = 1;
      }
      if (b.x + W > 400) {
        b.x = 400 - W;
        if (b.onGround) b.dir = -1;
      }

      // Fell off screen
      if (b.y > 550) {
        barrels.splice(i, 1);
      }
    }
  }

  function spawnBarrel() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    barrels.push({
      x: kongX + (dir > 0 ? 10 : -10),
      y: kongY - 5,
      vx: 0, vy: 0,
      dir,
      rot: 0,
      onGround: false,
      dead: false,
      jumped: false,
      id: Math.random(),
    });
    Kong.triggerThrow();
    Audio.SFX.barrelLaunch();
  }

  function draw(ctx) {
    barrels.forEach(b => {
      ctx.save();
      ctx.translate(b.x + W / 2, b.y + H / 2);
      ctx.rotate(b.rot);

      // Barrel body
      ctx.shadowColor = '#FF8C00';
      ctx.shadowBlur  = 12;

      // Body fill (dark wood)
      ctx.fillStyle = '#8B4513';
      roundRect(ctx, -W / 2, -H / 2, W, H, 4);
      ctx.fill();

      // Orange highlight band (center)
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(-W / 2 + 2, -3, W - 4, 6);

      // Metal hoops
      ctx.fillStyle = '#888';
      ctx.fillRect(-W / 2, -H / 2 + 3, W, 2);
      ctx.fillRect(-W / 2, H / 2 - 5, W, 2);

      // Top/bottom caps
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(-W / 2 + 1, -H / 2, W - 2, 3);
      ctx.fillRect(-W / 2 + 1, H / 2 - 3, W - 2, 3);

      // Glow dot
      ctx.fillStyle = 'rgba(255,200,50,0.8)';
      ctx.beginPath();
      ctx.arc(2, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function getBarrels() { return barrels; }
  function removeBarrel(id) {
    const i = barrels.findIndex(b => b.id === id);
    if (i !== -1) barrels.splice(i, 1);
  }

  function clear() {
    barrels = [];
    spawnTimer = 0;
  }

  function setKongPos(kx, ky) {
    kongX = kx;
    kongY = ky;
  }

  function getW() { return W; }
  function getH() { return H; }

  return { init, update, draw, getBarrels, removeBarrel, setKongPos, clear, getW, getH };
})();