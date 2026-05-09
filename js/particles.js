/* ============================
   DONKEY KONG — particles.js
   Particle System
   ============================ */

const Particles = (() => {
  let particles = [];

  function emit(x, y, opts = {}) {
    const count = opts.count || 8;
    const colors = opts.colors || ['#FF8C00', '#FFD700', '#FF4500'];
    const speedMin = opts.speedMin || 60;
    const speedMax = opts.speedMax || 200;
    const life     = opts.life || 0.7;
    const size     = opts.size || 4;
    const gravity  = opts.gravity !== undefined ? opts.gravity : 300;
    const shape    = opts.shape || 'rect';

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        life, maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: size * (0.6 + Math.random() * 0.8),
        gravity,
        shape,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
      });
    }
  }

  function barrelExplode(x, y) {
    emit(x, y, {
      count: 14,
      colors: ['#FF8C00', '#FFD700', '#FF4500', '#FFF'],
      speedMin: 80, speedMax: 280,
      life: 0.8, size: 5,
      shape: 'rect',
    });
    // Sparks
    emit(x, y, {
      count: 10,
      colors: ['#FFFFFF', '#FFD700'],
      speedMin: 120, speedMax: 350,
      life: 0.4, size: 2,
      gravity: 500,
      shape: 'circle',
    });
  }

  function jumpEffect(x, y) {
    emit(x, y, {
      count: 6,
      colors: ['#00d4ff', '#FFFFFF', '#ffbe0b'],
      speedMin: 30, speedMax: 120,
      life: 0.4, size: 3,
      gravity: 200,
      shape: 'circle',
    });
  }

  function deathEffect(x, y) {
    emit(x, y, {
      count: 16,
      colors: ['#FF0000', '#FF69B4', '#FFFF00', '#FFF'],
      speedMin: 60, speedMax: 300,
      life: 1.0, size: 5,
      gravity: 400,
      shape: 'star',
    });
  }

  function levelCompleteEffect(x, y) {
    const colors = ['#FFD700','#FF69B4','#00d4ff','#00FF00','#FF8C00'];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        emit(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 100, {
          count: 12, colors,
          speedMin: 80, speedMax: 250,
          life: 1.2, size: 5,
          shape: 'rect',
        });
      }, i * 200);
    }
  }

  function dustEffect(x, y) {
    emit(x, y, {
      count: 3,
      colors: ['rgba(200,150,80,0.6)', 'rgba(255,200,100,0.4)'],
      speedMin: 20, speedMax: 60,
      life: 0.3, size: 3,
      gravity: 50,
      shape: 'circle',
    });
  }

  function pickupEffect(x, y) {
    emit(x, y, {
      count: 8,
      colors: ['#FFD700', '#FFF', '#00FF88'],
      speedMin: 40, speedMax: 180,
      life: 0.6, size: 4,
      gravity: 150,
      shape: 'star',
    });
  }

  function update(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.rot += p.rotSpeed * dt;
      // Friction
      p.vx *= (1 - 1.5 * dt);
    }
  }

  function draw(ctx) {
    particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, 0, 0, p.size / 2, p.size, 4);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function drawStar(ctx, cx, cy, innerR, outerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.closePath();
  }

  function clear() { particles = []; }

  return { emit, barrelExplode, jumpEffect, deathEffect, levelCompleteEffect, dustEffect, pickupEffect, update, draw, clear };
})();
