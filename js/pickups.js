/* ============================
   DONKEY KONG — pickups.js
   Bonus items: banana, cherry, etc.
   ============================ */

const Pickups = (() => {
  let items = [];

  const TYPES = [
    { emoji: '🍌', label: 'BANANA',  pts: 100,  color: '#FFD700' },
    { emoji: '🍒', label: 'CHERRY',  pts: 200,  color: '#DC143C' },
    { emoji: '🍑', label: 'PEACH',   pts: 300,  color: '#FFCBA4' },
    { emoji: '💎', label: 'DIAMOND', pts: 500,  color: '#00d4ff' },
    { emoji: '👑', label: 'CROWN',   pts: 1000, color: '#FFD700', rare: true },
    { emoji: '⏱️', label: '+TIME',   pts: 0,    color: '#00FF88', timeBonus: 30 },
  ];

  function spawnRandom(platforms) {
    if (items.length >= 5) return;
    const plats = platforms.filter(p => p.w > 60);
    if (!plats.length) return;
    const p = plats[Math.floor(Math.random() * plats.length)];

    const localX = 20 + Math.random() * (p.w - 40);
    const slope  = p.slope || 0;
    const ix     = p.x + localX;
    const iy     = p.y + slope * localX - 20;

    // Skip gap
    if (p.hasGap && localX >= p.gapStart && localX < p.gapStart + p.gapW) return;

    const pool = TYPES.filter(t => !t.rare || Math.random() < 0.15);
    const type = pool[Math.floor(Math.random() * pool.length)];

    items.push({ x: ix, y: iy, type, w: 20, h: 20, bobT: Math.random() * Math.PI * 2, collected: false });
  }

  function update(dt) {
    items.forEach(it => {
      it.bobT += dt * 3;
      it.displayY = it.y + Math.sin(it.bobT) * 4;
    });
    // Remove collected
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].collected) items.splice(i, 1);
    }
  }

  function draw(ctx) {
    items.forEach(it => {
      ctx.save();
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Glow
      ctx.shadowColor = it.type.color;
      ctx.shadowBlur = 10;
      ctx.fillText(it.type.emoji, it.x, it.displayY);
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  function checkCollect(player) {
    const collected = [];
    items.forEach(it => {
      if (it.collected) return;
      const dx = (player.x + player.w / 2) - it.x;
      const dy = (player.y + player.h / 2) - it.displayY;
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) {
        it.collected = true;
        collected.push(it.type);
        Particles.pickupEffect(it.x, it.displayY);
        Audio.SFX.pickupCollect();
      }
    });
    return collected;
  }

  function clear() { items = []; }
  function getItems() { return items; }

  return { spawnRandom, update, draw, checkCollect, clear, getItems };
})();
