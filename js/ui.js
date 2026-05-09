/* ============================
   DONKEY KONG — ui.js
   HUD, score popups, screen transitions
   ============================ */

const UI = (() => {
  const scoreEl  = document.getElementById('hud-score');
  const bestEl   = document.getElementById('hud-best');
  const levelEl  = document.getElementById('hud-level');
  const timeEl   = document.getElementById('hud-time');
  const livesEl  = document.getElementById('hud-lives');
  const comboEl  = document.getElementById('hud-combo');
  const popupsEl = document.getElementById('score-popups');
  const transEl  = document.getElementById('level-transition');
  const transTextEl = document.getElementById('level-transition-text');

  let canvas = null;

  function setCanvas(c) { canvas = c; }

  function pad(n, len = 6) {
    return String(Math.floor(n)).padStart(len, '0');
  }

  function updateScore(score, best) {
    scoreEl.textContent = pad(score);
    bestEl.textContent  = pad(best);
  }

  function updateLevel(lvl) {
    levelEl.textContent = lvl;
  }

  function updateTime(sec) {
    timeEl.textContent = Math.max(0, Math.ceil(sec));
    if (sec <= 10) {
      timeEl.style.color = '#FF006E';
      timeEl.style.textShadow = '0 0 10px #FF006E, 0 0 20px #FF006E';
    } else {
      timeEl.style.color = '';
      timeEl.style.textShadow = '';
    }
  }

  function updateLives(lives) {
    livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
  }

  function updateCombo(combo) {
    if (combo > 1) {
      comboEl.textContent = `x${combo}`;
      comboEl.style.color = '#ff006e';
      comboEl.style.textShadow = '0 0 10px #ff006e, 0 0 20px #ff006e';
      comboEl.style.fontSize   = '13px';
    } else {
      comboEl.textContent = 'x1';
      comboEl.style.color = '';
      comboEl.style.textShadow = '';
      comboEl.style.fontSize   = '';
    }
  }

  function flashScore(el) {
    el.classList.remove('hud-flash');
    void el.offsetWidth;
    el.classList.add('hud-flash');
    el.addEventListener('animationend', () => el.classList.remove('hud-flash'), { once: true });
  }

  /**
   * Show a floating score popup on the canvas.
   * canvasX/Y: position in canvas space
   */
  function showScorePopup(canvasX, canvasY, text, type = '') {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width  / canvas.width;
    const scaleY = rect.height / canvas.height;

    const popup = document.createElement('div');
    popup.className = `score-popup ${type}`;
    popup.textContent = text;
    popup.style.left = `${canvasX * scaleX - 20}px`;
    popup.style.top  = `${canvasY * scaleY}px`;
    popupsEl.appendChild(popup);
    setTimeout(() => popup.remove(), 1300);
  }

  function clearPopups() {
    popupsEl.innerHTML = '';
  }

  function showLevelTransition(lvlNum, cb) {
    transTextEl.textContent = `LEVEL ${lvlNum}`;
    transEl.classList.add('show');
    setTimeout(() => {
      transEl.classList.remove('show');
      if (cb) cb();
    }, 2500);
  }

  function screenShake() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;
    wrapper.classList.remove('screen-shake');
    void wrapper.offsetWidth;
    wrapper.classList.add('screen-shake');
    wrapper.addEventListener('animationend', () => wrapper.classList.remove('screen-shake'), { once: true });
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    // Pause btn
    const pauseBtn = document.getElementById('btn-pause');
    if (id === 'game-screen') pauseBtn.style.display = 'flex';
    else pauseBtn.style.display = 'none';
  }

  function fillLevelComplete(score, timeBonus, jumped, combo, total) {
    document.getElementById('stat-score').textContent = score;
    document.getElementById('stat-time').textContent  = '+' + timeBonus;
    document.getElementById('stat-jumped').textContent = jumped;
    document.getElementById('stat-combo').textContent  = 'x' + combo;
    document.getElementById('stat-total').textContent  = total;
  }

  function fillGameOver(score, best, level, jumped) {
    document.getElementById('go-score').textContent  = pad(score);
    document.getElementById('go-best').textContent   = pad(best);
    document.getElementById('go-level').textContent  = level;
    document.getElementById('go-jumped').textContent = jumped;
    document.getElementById('menu-best-score').textContent = pad(best);
  }

  return {
    setCanvas, updateScore, updateLevel, updateTime,
    updateLives, updateCombo, flashScore,
    showScorePopup, clearPopups,
    showLevelTransition, screenShake, showScreen,
    fillLevelComplete, fillGameOver,
  };
})();
