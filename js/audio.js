// ============================================================
// CAT RUN DASH - Audio (Procedural)
// Extracted from index.html
// ============================================================

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, dur, type = 'sine', vol = 0.15) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

function sfxClick() { playSound(600, 0.1, 'sine', 0.1); }
function sfxComplete() { playSound(523, 0.1); setTimeout(() => playSound(659, 0.1), 100); setTimeout(() => playSound(784, 0.15), 200); }
function sfxGrow() { playSound(400, 0.15); setTimeout(() => playSound(500, 0.15), 100); setTimeout(() => playSound(600, 0.15), 200); setTimeout(() => playSound(800, 0.25), 300); }
function sfxDash() { playSound(300, 0.15, 'sawtooth', 0.08); playSound(600, 0.1, 'sine', 0.05); }
function sfxScrape() { playSound(200, 0.3, 'sawtooth', 0.12); playSound(150, 0.2, 'square', 0.06); }
function sfxWin() { [523,587,659,784,880].forEach((f,i) => setTimeout(() => playSound(f, 0.2), i * 120)); }
function sfxLose() { [400,350,300,200].forEach((f,i) => setTimeout(() => playSound(f, 0.25, 'sawtooth', 0.1), i * 200)); }
function sfxMeow() { playSound(700, 0.12); setTimeout(() => playSound(900, 0.18), 80); }
function sfxGather() { playSound(800, 0.08); setTimeout(() => playSound(1000, 0.1), 60); }
function sfxBuy() { playSound(500, 0.1); setTimeout(() => playSound(700, 0.12), 80); setTimeout(() => playSound(900, 0.1), 160); }
function sfxEquip() { playSound(600, 0.08); setTimeout(() => playSound(800, 0.1), 60); }
function sfxNope() { playSound(200, 0.15, 'square', 0.08); }

// ============================================================
// BACKGROUND MUSIC — scene-specific, long procedural loops (no audio files)
// ============================================================
const bgMusic = { enabled: true, playing: false, beat: 0, interval: null, theme: 'care' };

const BG_NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00, C5: 523.25,
};

function normalize(arr) { return arr.map(n => n === '—' ? null : n); }

function expand32to64(mel32, bass32) {
  const m = normalize(mel32);
  const b = normalize(bass32);
  const mel = m.slice();
  const bass = b.slice();
  for (let i = 0; i < 24; i++) { mel.push(m[i]); bass.push(b[i]); }
  for (let i = 24; i < 32; i++) {
    mel.push(i === 28 ? (m[i] === 'G4' ? 'A4' : m[i]) : m[i]);
    bass.push(b[i]);
  }
  return { mel, bass };
}

const BG_THEMES = (() => {
  const T = (bpm, mel32, bass32) => {
    const { mel, bass } = expand32to64(mel32, bass32);
    return { bpm, mel, bass, msPerBeat: 60000 / bpm };
  };
  // 32-beat phrase (8 per line). Use '—' for rest.
  const titleMel = ['G4','—','E4','—', 'A4','—','G4','—', 'E4','G4','—','—', 'D4','—','—','—', 'G4','—','E4','G4', 'A4','—','—','—', 'E4','—','D4','—', '—','—','—','—'];
  const titleBass= ['C3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'A3','—','—','—', 'G3','—','—','—', 'C3','—','—','—'];
  const careMel = ['G4','—','E4','G4', 'A4','—','G4','—', 'E4','G4','A4','G4', 'E4','—','D4','—', 'G4','—','E4','—', 'A4','G4','—','—', 'E4','—','D4','E4', 'G4','—','—','—'];
  const careBass= ['C3','—','—','—', 'G3','—','—','—', 'A3','—','—','—', 'G3','—','D3','—', 'C3','—','—','—', 'G3','—','—','—', 'E3','—','—','—', 'G3','—','D3','—'];
  const walkMel = ['E4','G4','A4','G4', 'E4','—','D4','—', 'G4','—','A4','—', 'G4','E4','—','—', 'C5','—','A4','G4', 'E4','G4','—','—', 'D4','E4','G4','—', '—','—','—','—'];
  const walkBass= ['C3','—','G3','—', 'C3','—','—','—', 'G3','—','—','—', 'C3','—','G3','—', 'A3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'G3','—','—','—'];
  const chaseMel=['E4','G4','E4','—', 'A4','G4','—','E4', 'D4','E4','G4','A4', 'G4','—','—','—', 'C5','A4','G4','E4', 'G4','—','A4','—', 'E4','D4','—','—', 'G4','—','—','—'];
  const chaseBass=['C3','—','—','—', 'G3','—','—','—', 'A3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'G3','—','—','—', 'A3','—','G3','—', '—','—','—','—'];
  const storeMel= ['G4','A4','C5','A4', 'G4','—','E4','—', 'A4','G4','E4','G4', '—','—','D4','—', 'G4','—','A4','—', 'G4','E4','—','—', 'E4','G4','A4','—', 'G4','—','—','—'];
  const storeBass=['C3','—','—','—', 'G3','—','—','—', 'A3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'G3','—','—','—', 'E3','—','—','—', 'G3','—','—','—'];
  const selectMel = ['E4','—','G4','—', 'A4','G4','—','—', 'E4','—','D4','—', '—','—','—','—', 'G4','E4','—','G4', 'A4','—','—','—', 'E4','G4','D4','—', '—','—','—','—'];
  const selectBass= ['C3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'A3','—','—','—', 'G3','—','—','—', '—','—','—','—'];
  const collMel = ['G4','—','E4','G4', 'A4','—','—','—', 'E4','G4','A4','—', 'G4','E4','D4','—', '—','—','—','—', 'A4','G4','E4','—', 'G4','—','D4','—', '—','—','—','—'];
  const collBass= ['C3','—','—','—', 'G3','—','—','—', 'A3','—','—','—', 'G3','—','—','—', 'C3','—','—','—', 'G3','—','—','—', 'A3','—','—','—', 'G3','—','—','—'];
  const calmMel = ['E4','—','G4','—', 'A4','—','G4','E4', 'D4','—','E4','—', 'G4','—','—','—', 'C4','—','E4','G4', 'A4','—','G4','—', 'E4','—','D4','—', 'C4','—','—','—'];
  const calmBass= ['C3','—','—','—', 'G3','—','—','—', 'A3','—','—','—', 'G3','—','D3','—', 'C3','—','—','—', 'G3','—','—','—', 'E3','—','—','—', 'G3','—','—','—'];
  return {
    title:   T(88,  titleMel,  titleBass),
    select:  T(96,  selectMel, selectBass),
    care:    T(100, careMel,   careBass),
    care_calm: T(78, calmMel, calmBass),
    walk:    T(108, walkMel,   walkBass),
    chase:   T(128, chaseMel,  chaseBass),
    store:   T(112, storeMel,  storeBass),
    collection: T(94, collMel, collBass),
  };
})();

function playMusicNote(freq, dur, vol, type) {
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol * 0.7, audioCtx.currentTime + dur * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

function setBgMusicTheme(screen) {
  let s = screen || game.screen;
  if (s === 'care' && typeof game !== 'undefined' && game.careMusicCalm) s = 'care_calm';
  if (s === 'timeout' && typeof game !== 'undefined' && game.careMusicCalm) s = 'care_calm';
  if (!BG_THEMES[s] || bgMusic.theme === s) return;
  bgMusic.theme = s;
  bgMusic.beat = 0;
  if (bgMusic.playing && bgMusic.interval) {
    clearInterval(bgMusic.interval);
    const th = BG_THEMES[s];
    bgMusic.interval = setInterval(runBgMusicBeat, th.msPerBeat);
  }
}

function getMusicTempoMultiplier() {
  if (typeof getPawMood !== 'function') return 1.0;
  return 0.88 + getPawMood() * 0.32;
}

function runBgMusicBeat() {
  if (!bgMusic.enabled) return;
  const th = BG_THEMES[bgMusic.theme] || BG_THEMES.care;
  const beatSec = th.msPerBeat / 1000;
  const b = bgMusic.beat % th.mel.length;
  const mel = th.mel[b];
  if (mel) {
    let f = BG_NOTES[mel];
    if ((bgMusic.theme === 'care' || bgMusic.theme === 'care_calm') && typeof getPawMood === 'function') {
      const m = getPawMood();
      if (m < 0.22) f *= 0.93;
      else if (m > 0.68) f *= 1.045;
    }
    playMusicNote(f, beatSec * 0.9, 0.042, 'sine');
  }
  const bass = th.bass[b];
  if (bass) playMusicNote(BG_NOTES[bass], beatSec * 1.6, 0.028, 'triangle');
  bgMusic.beat++;
  // Dynamically adjust interval speed based on mood
  const tempoMult = getMusicTempoMultiplier();
  const newMs = th.msPerBeat / tempoMult;
  if (bgMusic._lastMs !== newMs && bgMusic.interval) {
    clearInterval(bgMusic.interval);
    bgMusic._lastMs = newMs;
    bgMusic.interval = setInterval(runBgMusicBeat, newMs);
  }
}

function startBgMusic() {
  if (bgMusic.playing || !bgMusic.enabled) return;
  bgMusic.playing = true;
  const th = BG_THEMES[bgMusic.theme] || BG_THEMES.care;
  runBgMusicBeat();
  bgMusic.interval = setInterval(runBgMusicBeat, th.msPerBeat);
}

function stopBgMusic() {
  if (bgMusic.interval) { clearInterval(bgMusic.interval); bgMusic.interval = null; }
  bgMusic.playing = false;
  bgMusic._lastMs = undefined;
}

/** Stop timers and suspend the audio graph (tab hidden, navigating away, or window closing). */
function suspendAudioEngine() {
  stopBgMusic();
  try {
    if (audioCtx.state === 'running') audioCtx.suspend();
  } catch (e) {}
}

/** Resume context and restart BGM if the player left music enabled. */
function resumeAudioEngineIfAppropriate() {
  if (!bgMusic.enabled) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) {}
  startBgMusic();
}

(function setupAudioLifecycle() {
  if (typeof window === 'undefined') return;
  window.addEventListener('pagehide', () => suspendAudioEngine());
  window.addEventListener('beforeunload', () => suspendAudioEngine());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspendAudioEngine();
    else resumeAudioEngineIfAppropriate();
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) resumeAudioEngineIfAppropriate();
  });
})();

function toggleBgMusic() {
  bgMusic.enabled = !bgMusic.enabled;
  if (bgMusic.enabled) { startBgMusic(); } else { stopBgMusic(); }
}

function applyCareMusicTheme() {
  if (game.screen !== 'care' && game.screen !== 'timeout') return;
  const want = game.careMusicCalm ? 'care_calm' : 'care';
  if (bgMusic.theme === want) return;
  bgMusic.theme = want;
  bgMusic.beat = 0;
  if (bgMusic.playing && bgMusic.interval) {
    clearInterval(bgMusic.interval);
    const th = BG_THEMES[want];
    bgMusic.interval = setInterval(runBgMusicBeat, th.msPerBeat);
  }
}
