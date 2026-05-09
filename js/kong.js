/* ============================
   DONKEY KONG — kong.js
   Donkey Kong AI & rendering
   ============================ */

const Kong = (() => {
  let x, y, w = 52, h = 52;
  let animT = 0;
  let throwAnim = 0;
  let roarTimer = 0;
  let moveTimer = 0;
  let dirX = 1;
  let platformX = 20, platformW = 340; // Kong's patrol range
  let roaring = false;

  const ROAR_INTERVAL = 5000;
  const MOVE_INTERVAL = 1500;
  const PATROL_SPEED  = 30;

  function init(kx, ky, platX, platW) {
    x = kx; y = ky;
    platformX = platX || 20;
    platformW = platW || 340;
    animT = 0; throwAnim = 0; roarTimer = 0; moveTimer = 0;
    roaring = false; dirX = -1;
  }

  function update(dt, dtMs) {
    animT += dt;

    // Patrol
    moveTimer += dtMs;
    if (moveTimer > MOVE_INTERVAL) {
      moveTimer = 0;
      if (Math.random() < 0.6) {
        dirX = Math.random() < 0.5 ? 1 : -1;
      }
    }
    x += dirX * PATROL_SPEED * dt;
    // Clamp to platform
    if (x < platformX)        { x = platformX; dirX =  1; }
    if (x + w > platformX + platformW) { x = platformX + platformW - w; dirX = -1; }

    // Roar periodically
    roarTimer += dtMs;
    if (roarTimer > ROAR_INTERVAL) {
      roarTimer = 0;
      roaring = true;
      Audio.SFX.kongRoar();
      setTimeout(() => { roaring = false; }, 800);
    }

    // Throw anim countdown
    if (throwAnim > 0) throwAnim -= dt;
  }

  function triggerThrow() {
    throwAnim = 0.5;
  }

  function draw(ctx) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    const bounce = roaring ? Math.sin(animT * 20) * 4 : Math.sin(animT * 4) * 2;
    ctx.translate(0, bounce);

    if (dirX < 0) ctx.scale(-1, 1);

    // Glow
    ctx.shadowColor = '#FF8C00';
    ctx.shadowBlur  = roaring ? 25 : 12;

    // Body
    drawBody(ctx);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawBody(ctx) {
    const halfW = w / 2, halfH = h / 2;
    const throwOffset = throwAnim > 0 ? -8 : 0;

    // === LEGS ===
    ctx.fillStyle = '#3D1A05';
    // Left leg
    ctx.fillRect(-14, halfH - 14, 10, 16);
    // Right leg
    ctx.fillRect(4, halfH - 14, 10, 16);

    // === BODY ===
    ctx.fillStyle = '#5C2E0B';
    // Main torso
    ctx.beginPath();
    ctx.ellipse(0, 4, 20, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest highlight
    ctx.fillStyle = '#7A3D12';
    ctx.beginPath();
    ctx.ellipse(-1, 0, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // === ARMS ===
    ctx.fillStyle = '#5C2E0B';
    const armSwing = Math.sin(animT * 6) * 5;
    // Left arm
    ctx.fillRect(-halfW - 4, -8 + armSwing, 14, 10);
    // Right arm (throw pos)
    ctx.fillRect(halfW - 10, -8 + throwOffset - armSwing, 14, 10);

    // Fists
    ctx.fillStyle = '#3D1A05';
    ctx.beginPath();
    ctx.arc(-halfW - 1, -3 + armSwing, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(halfW + 3, -3 + throwOffset - armSwing, 6, 0, Math.PI * 2);
    ctx.fill();

    // === HEAD ===
    ctx.fillStyle = '#5C2E0B';
    ctx.beginPath();
    ctx.ellipse(0, -halfH + 10, 17, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face highlight
    ctx.fillStyle = '#7A3D12';
    ctx.beginPath();
    ctx.ellipse(1, -halfH + 14, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brow ridge
    ctx.fillStyle = '#3D1A05';
    ctx.fillRect(-12, -halfH + 4, 24, 5);

    // Eyes
    ctx.fillStyle = '#FF4500';
    ctx.shadowColor = '#FF4500'; ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-6, -halfH + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -halfH + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupils
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-5, -halfH + 10, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -halfH + 10, 1, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = '#2a0f02';
    ctx.beginPath();
    ctx.arc(-3, -halfH + 17, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -halfH + 17, 2, 0, Math.PI * 2);
    ctx.fill();

    // ROAR mouth
    if (roaring) {
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.ellipse(0, -halfH + 22, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      // Teeth
      ctx.fillRect(-6, -halfH + 18, 4, 4);
      ctx.fillRect(2, -halfH + 18, 4, 4);
    } else {
      // Neutral mouth
      ctx.fillStyle = '#2a0f02';
      ctx.fillRect(-5, -halfH + 20, 10, 3);
    }

    // Ears
    ctx.fillStyle = '#5C2E0B';
    ctx.beginPath();
    ctx.arc(-15, -halfH + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -halfH + 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function getPos()  { return { x, y, w, h }; }
  function getCenter() { return { x: x + w / 2, y: y + h / 2 }; }

  return { init, update, triggerThrow, draw, getPos, getCenter };
})();
