/* ============================
   DONKEY KONG — game.js
   Main game loop & orchestration
   ============================ */

const Game = (() => {
  // Canvas
  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');

  // Canvas dimensions (logical)
  const CW = 400, CH = 520;
  canvas.width  = CW;
  canvas.height = CH;

  // State
  let running    = false;
  let paused     = false;
  let state      = 'menu'; // menu | playing | dead | levelcomplete | gameover
  let lastTime   = 0;
  let frameId    = null;

  // Game state
  let score      = 0;
  let bestScore  = parseInt(localStorage.getItem('dk_best') || '0');
  let lives      = 3;
  let levelNum   = 1;
  let levelData  = null;
  let levelTimer = 120; // seconds
  let barrelsJumped = 0;
  let totalBarrelsJumped = 0;
  let combo      = 1;
  let bestCombo  = 1;
  let comboTimer = 0;
  let pickupSpawnTimer = 0;

  // Princess state
  let princess = { x: 0, y: 0, w: 20, h: 24, animT: 0 };

  // Background stars
  let stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({ x: Math.random() * CW, y: Math.random() * CH, r: Math.random() * 1.5 + 0.3, blink: Math.random() * Math.PI * 2 });
  }

  /* ── INIT ──────────────────────────────── */
  function init() {
    UI.setCanvas(canvas);
    setupInput();
    setupButtons();
    UI.fillGameOver(0, bestScore, 1, 0);
    document.getElementById('menu-best-score').textContent = String(bestScore).padStart(6, '0');
    requestAnimationFrame(loop);
  }

  /* ── INPUT ─────────────────────────────── */
  function setupInput() {
    const keyMap = {
      // Flèches
      'ArrowLeft':  'left',
      'ArrowRight': 'right',
      'ArrowUp':    'up',
      'ArrowDown':  'down',
      // AZERTY (e.key = caractère affiché sur la touche)
      'q': 'left',  'Q': 'left',
      'd': 'right', 'D': 'right',
      'z': 'up',    'Z': 'up',
      's': 'down',  'S': 'down',
      ' ': 'jump',  // Espace
    };

    document.addEventListener('keydown', e => {
      const k = keyMap[e.key];
      if (k) { e.preventDefault(); Player.setKey(k, true); }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') togglePause();
    });
    document.addEventListener('keyup', e => {
      const k = keyMap[e.key];
      if (k) Player.setKey(k, false);
    });

    // Mobile D-Pad
    const mobileMap = {
      'btn-up': 'up', 'btn-down': 'down',
      'btn-left': 'left', 'btn-right': 'right',
      'btn-jump': 'jump',
    };
    Object.entries(mobileMap).forEach(([id, k]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const down = e => { e.preventDefault(); Player.setKey(k, true); };
      const up   = e => { e.preventDefault(); Player.setKey(k, false); };
      btn.addEventListener('touchstart', down, { passive: false });
      btn.addEventListener('touchend',   up,   { passive: false });
      btn.addEventListener('mousedown',  down);
      btn.addEventListener('mouseup',    up);
      btn.addEventListener('mouseleave', up);
    });
  }

  function setupButtons() {
    document.getElementById('btn-start').addEventListener('click', () => startGame());
    document.getElementById('btn-howto').addEventListener('click', () => UI.showScreen('howto-screen'));
    document.getElementById('btn-back').addEventListener('click',  () => UI.showScreen('menu-screen'));
    document.getElementById('btn-pause').addEventListener('click', togglePause);
    document.getElementById('btn-resume').addEventListener('click', togglePause);
    document.getElementById('btn-restart').addEventListener('click', () => { hidePause(); restartLevel(); });
    document.getElementById('btn-menu-from-pause').addEventListener('click', () => { hidePause(); goToMenu(); });
    document.getElementById('btn-next-level').addEventListener('click', nextLevel);
    document.getElementById('btn-try-again').addEventListener('click', () => startGame());
    document.getElementById('btn-menu-from-go').addEventListener('click', goToMenu);
  }

  /* ── GAME FLOW ─────────────────────────── */
  function startGame() {
    score = 0; lives = 3; levelNum = 1;
    totalBarrelsJumped = 0; bestCombo = 1;
    loadLevel();
    UI.showScreen('game-screen');
    state = 'playing';
    running = true;
    Audio.startMusic(1);
  }

  function loadLevel() {
    levelData = LevelData.get(levelNum - 1);
    Platforms.load(levelData);

    const kp = levelData.kongPos;
    const pp = levelData.playerStart;
    const pr = levelData.princessPos;

    Kong.init(kp.x - 26, kp.y - 14, levelData.platforms[4]?.x || 20, levelData.platforms[4]?.w || 340);
    Barrels.init(levelNum, kp.x, kp.y, levelData.barrelSpawnRate);
    Player.init(pp.x, pp.y);
    Particles.clear();
    Pickups.clear();

    princess = { x: pr.x, y: pr.y - 30, w: 22, h: 30, animT: 0 };

    levelTimer = 120;
    barrelsJumped = 0;
    combo = 1; bestCombo = 1; comboTimer = 0;
    pickupSpawnTimer = 0;

    UI.updateScore(score, bestScore);
    UI.updateLevel(levelNum);
    UI.updateLives(lives);
    UI.updateCombo(1);
    UI.clearPopups();
  }

  function restartLevel() {
    Barrels.clear();
    Particles.clear();
    Pickups.clear();
    Player.init(levelData.playerStart.x, levelData.playerStart.y);
    levelTimer = 120;
    barrelsJumped = 0;
    combo = 1; comboTimer = 0;
    state = 'playing';
    Audio.startMusic(1 + (levelNum - 1) * 0.08);
  }

  function nextLevel() {
    levelNum++;
    UI.showScreen('game-screen');
    state = 'transition';
    Audio.startMusic(1 + (levelNum - 1) * 0.08);
    UI.showLevelTransition(levelNum, () => {
      loadLevel();
      state = 'playing';
    });
  }

  function goToMenu() {
    state = 'menu';
    running = false;
    Audio.stopMusic();
    Barrels.clear(); Particles.clear(); Pickups.clear();
    UI.showScreen('menu-screen');
  }

  function togglePause() {
    if (state !== 'playing' && state !== 'paused') return;
    if (state === 'playing') {
      state = 'paused';
      Audio.stopMusic();
      UI.showScreen('pause-screen');
    } else {
      hidePause();
    }
  }

  function hidePause() {
    state = 'playing';
    UI.showScreen('game-screen');
    Audio.startMusic(1 + (levelNum - 1) * 0.08);
  }

  /* ── MAIN LOOP ─────────────────────────── */
  function loop(ts) {
    frameId = requestAnimationFrame(loop);
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    if (state === 'playing') {
      update(dt);
    }
    draw();
  }

  /* ── UPDATE ────────────────────────────── */
  function update(dt) {
    // Level timer
    levelTimer -= dt;
    UI.updateTime(levelTimer);
    if (levelTimer <= 0) {
      playerDied();
      return;
    }

    // Kong
    Kong.update(dt, dt * 1000);
    const kPos = Kong.getPos();
    // Update barrel spawn origin to follow Kong
    Barrels.setKongPos(kPos.x + kPos.w / 2, kPos.y + kPos.h);

    // Barrels
    Barrels.update(dt, dt * 1000);

    // Player
    Player.update(dt);

    if (Player.isDead()) {
      if (Player.getDeadTimer() > 1.5) {
        playerDied();
      }
      return;
    }

    // Combo timer decay
    comboTimer += dt;
    if (comboTimer > 3) {
      combo = 1;
      UI.updateCombo(combo);
    }

    // Pickup spawn
    pickupSpawnTimer += dt;
    if (pickupSpawnTimer > 8) {
      pickupSpawnTimer = 0;
      Pickups.spawnRandom(Platforms.getPlatforms());
    }

    // Pickup collection
    const collected = Pickups.checkCollect(Player.getPos());
    collected.forEach(t => {
      score += t.pts;
      if (t.timeBonus) levelTimer += t.timeBonus;
      const pp = Player.getPos();
      UI.showScorePopup(pp.x, pp.y - 10, t.label === '+TIME' ? '+30s' : `+${t.pts}`, 'big');
      UI.updateScore(score, bestScore);
    });

    // Barrel collisions
    const barrels = Barrels.getBarrels();
    for (const b of barrels) {
      if (b.dead) continue;

      // Jump over barrel
      if (!b.jumped && Collision.playerJumpedBarrel(Player, b)) {
        b.jumped = true;
        b.dead = true;
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        comboTimer = 0;
        barrelsJumped++;
        totalBarrelsJumped++;

        const pts = combo >= 3 ? 1000 : 500;
        score += pts;

        const pp = Player.getPos();
        const label = combo >= 3 ? `COMBO x${combo}! +${pts}` : `+${pts}`;
        const type  = combo >= 3 ? 'combo' : '';
        UI.showScorePopup(pp.x, pp.y - 20, label, type);
        UI.updateScore(score, bestScore);
        UI.updateCombo(combo);
        Particles.barrelExplode(b.x + Barrels.getW() / 2, b.y);
        Audio.SFX.barrelJump();
        if (combo >= 3) Audio.SFX.combo();
        Barrels.removeBarrel(b.id);
        break;
      }

      // Barrel hits player
      if (!b.jumped && Collision.barrelHitsPlayer(Player, b)) {
        const killed = Player.kill();
        if (killed) {
          UI.screenShake();
          break;
        }
      }
    }

    // Princess check
    if (Collision.playerReachedPrincess(Player, princess)) {
      onLevelComplete();
      return;
    }

    // Particles & pickups
    Particles.update(dt);
    Pickups.update(dt);
    princess.animT += dt;
  }

  function playerDied() {
    lives--;
    UI.updateLives(lives);
    if (lives <= 0) {
      onGameOver();
    } else {
      state = 'playing';
      Player.respawn(levelData.playerStart.x, levelData.playerStart.y);
      Barrels.clear();
      levelTimer = 120;
    }
  }

  function onLevelComplete() {
    state = 'levelcomplete';
    const timeBonus = Math.floor(levelTimer) * 10;
    score += timeBonus + 5000;
    if (score > bestScore) { bestScore = score; localStorage.setItem('dk_best', bestScore); }

    Audio.SFX.levelComplete();
    Particles.levelCompleteEffect(princess.x, princess.y);

    UI.fillLevelComplete(score - timeBonus - 5000, timeBonus, barrelsJumped, bestCombo, score);
    setTimeout(() => UI.showScreen('levelcomplete-screen'), 800);
  }

  function onGameOver() {
    state = 'gameover';
    if (score > bestScore) { bestScore = score; localStorage.setItem('dk_best', bestScore); }
    Audio.SFX.gameOver();
    Audio.stopMusic();
    UI.fillGameOver(score, bestScore, levelNum, totalBarrelsJumped);
    setTimeout(() => UI.showScreen('gameover-screen'), 1000);
  }

  /* ── DRAW ──────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, CW, CH);

    // Background
    drawBackground();

    if (state === 'menu' || state === 'gameover' || state === 'levelcomplete') {
      return;
    }

    // Game elements
    Platforms.draw(ctx);
    drawPrincess();
    Pickups.draw(ctx);
    Kong.draw(ctx);
    Barrels.draw(ctx);
    Particles.draw(ctx);
    Player.draw(ctx);

    // Scan line effect on canvas too
    drawCanvasScanlines();
  }

  function drawBackground() {
    // Gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, CH);
    const lvlBg = levelData ? levelData.bgColor : '#0d1030';
    bg.addColorStop(0, '#0a0e27');
    bg.addColorStop(1, lvlBg);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CW, CH);

    // Stars
    const t = Date.now() / 1000;
    stars.forEach(s => {
      const alpha = 0.3 + 0.3 * Math.sin(t * 0.8 + s.blink);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawPrincess() {
    const t = princess.animT;
    const bobY = Math.sin(t * 3) * 3;
    const px = princess.x, py = princess.y + bobY;

    ctx.save();
    ctx.shadowColor = '#FF69B4';
    ctx.shadowBlur  = 15;

    // Body
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(px - 8, py, 16, 20);

    // Crown
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 10;
    ctx.fillRect(px - 7, py - 8, 14, 5);
    ctx.fillRect(px - 5, py - 13, 4, 6);
    ctx.fillRect(px,     py - 13, 4, 6);
    ctx.fillRect(px + 3, py - 11, 4, 4);
    ctx.shadowBlur = 0;

    // Hair
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(px - 7, py - 3, 14, 4);

    // Face
    ctx.fillStyle = '#FFCBA4';
    ctx.fillRect(px - 5, py - 3, 10, 8);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(px - 3, py, 2, 2);
    ctx.fillRect(px + 1, py, 2, 2);

    // Arms (wave)
    ctx.fillStyle = '#FF69B4';
    const waveL = Math.sin(t * 5) * 6;
    ctx.fillRect(px - 13, py + 3 + waveL, 5, 8);
    ctx.fillRect(px + 8,  py + 3 - waveL, 5, 8);

    // Dress bottom
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.moveTo(px - 9, py + 19);
    ctx.lineTo(px + 9, py + 19);
    ctx.lineTo(px + 13, py + 30);
    ctx.lineTo(px - 13, py + 30);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // "HELP!" text above princess
    ctx.fillStyle = '#fff';
    ctx.font = '5px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('HELP!', px, py - 18 + Math.sin(t * 4) * 2);
  }

  function drawCanvasScanlines() {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 0; y < CH; y += 4) {
      ctx.fillRect(0, y, CW, 2);
    }
  }

  return { init };
})();

// Kick off
document.addEventListener('DOMContentLoaded', () => Game.init());