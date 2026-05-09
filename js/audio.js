/* ============================
   DONKEY KONG — audio.js
   Web Audio API — 8-bit Arcade
   ============================ */

const Audio = (() => {
  let ctx = null;
  let muted = false;
  let masterGain = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.4;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Beep: frequency, duration, type, volume, decay
  function beep(freq, dur = 0.1, type = 'square', vol = 0.3, decay = 0.1) {
    if (muted) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur + decay);
  }

  function sweep(f1, f2, dur = 0.15, type = 'square', vol = 0.3) {
    if (muted) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    osc.type = type;
    osc.frequency.setValueAtTime(f1, c.currentTime);
    osc.frequency.linearRampToValueAtTime(f2, c.currentTime + dur);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur + 0.05);
  }

  function noise(dur = 0.1, vol = 0.15) {
    if (muted) return;
    const c = getCtx();
    const bufSize = c.sampleRate * dur;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    const gain = c.createGain();
    src.buffer = buf;
    src.connect(gain);
    gain.connect(masterGain);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.start();
    src.stop(c.currentTime + dur);
  }

  // Sound effects
  const SFX = {
    jump() {
      sweep(200, 600, 0.12, 'square', 0.35);
    },
    land() {
      sweep(120, 60, 0.08, 'square', 0.25);
      noise(0.05, 0.1);
    },
    barrelLaunch() {
      sweep(300, 150, 0.15, 'sawtooth', 0.3);
      noise(0.08, 0.1);
    },
    barrelJump() {
      // Ascending arpeggio
      const times = [0, 0.06, 0.12, 0.18];
      const freqs = [400, 600, 800, 1000];
      times.forEach((t, i) => {
        setTimeout(() => beep(freqs[i], 0.08, 'square', 0.4), t * 1000);
      });
    },
    barrelExplode() {
      noise(0.25, 0.3);
      setTimeout(() => sweep(200, 50, 0.2, 'sawtooth', 0.3), 50);
    },
    death() {
      // Descending chromatic
      const freqs = [440, 415, 392, 370, 349, 330, 311, 294, 277, 262, 247];
      freqs.forEach((f, i) => {
        setTimeout(() => beep(f, 0.09, 'square', 0.35), i * 70);
      });
    },
    levelComplete() {
      const melody = [523, 659, 784, 1047];
      melody.forEach((f, i) => {
        setTimeout(() => beep(f, 0.15, 'square', 0.4), i * 120);
      });
      setTimeout(() => beep(1047, 0.4, 'square', 0.45), 480);
    },
    gameOver() {
      const freqs = [330, 294, 262, 220, 196, 165];
      freqs.forEach((f, i) => {
        setTimeout(() => beep(f, 0.15, 'sawtooth', 0.35), i * 150);
      });
    },
    kongRoar() {
      sweep(80, 200, 0.1, 'sawtooth', 0.5);
      setTimeout(() => sweep(200, 80, 0.2, 'sawtooth', 0.4), 100);
      setTimeout(() => sweep(80, 300, 0.15, 'sawtooth', 0.35), 300);
      noise(0.3, 0.2);
    },
    pickupCollect() {
      beep(880, 0.05, 'square', 0.3);
      setTimeout(() => beep(1100, 0.08, 'square', 0.35), 60);
    },
    combo() {
      const c = getCtx();
      [523, 659, 784, 1047, 1319].forEach((f, i) => {
        setTimeout(() => beep(f, 0.07, 'square', 0.4), i * 50);
      });
    },
    walk() {
      beep(80, 0.04, 'square', 0.08);
    },
    climb() {
      beep(100 + Math.random() * 20, 0.04, 'square', 0.06);
    }
  };

  // Background music loop
  let musicInterval = null;
  let musicStep = 0;
  const MUSIC_NOTES = [
    262, 330, 392, 523, 392, 330,
    262, 294, 330, 440, 330, 294,
    262, 330, 392, 523, 659, 784,
    659, 523, 392, 330, 294, 262
  ];

  function startMusic(speed = 1) {
    stopMusic();
    const bpm = 160 * speed;
    const interval = (60 / bpm) * 1000 * 0.5;
    musicStep = 0;
    musicInterval = setInterval(() => {
      if (!muted) {
        const f = MUSIC_NOTES[musicStep % MUSIC_NOTES.length];
        beep(f, 0.12, 'square', 0.15);
        // Bass note every 4 steps
        if (musicStep % 4 === 0) {
          beep(f / 2, 0.1, 'triangle', 0.1);
        }
      }
      musicStep++;
    }, interval);
  }

  function stopMusic() {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  }

  function setMuted(m) { muted = m; if (m) stopMusic(); }
  function toggleMute() { setMuted(!muted); return muted; }
  function isMuted() { return muted; }

  return { SFX, startMusic, stopMusic, toggleMute, isMuted, setMuted };
})();
