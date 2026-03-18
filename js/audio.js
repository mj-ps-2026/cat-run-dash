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

// Each theme: bpm, 32-beat phrase (repeated with variation = 64-beat loop). '—' = null.
// Build 64-beat pattern: phrase + phrase with last bar different for variety.
function expand32to64(mel32, bass32) {
  const mel = mel32.slice();
  const bass = bass32.slice();
  for (let i = 0; i < 8; i++) {
    mel.push(mel[i] === '—' ? null : mel[i]);
    bass.push(bass[i] === '—' ? null : bass[i]);
  }
  for (let i = 8; i < 16; i++) {
    mel.push(mel[i]);
    bass.push(bass[i]);
  }
  for (let i = 16; i < 24; i++) {
    mel.push(mel[i] === '—' ? null : mel[i]);
    bass.push(bass[i] === '—' ? null : bass[i]);
  }
  for (let i = 24; i < 32; i++) {
    mel.push(i === 28 ? (mel[i] === 'G4' ? 'A4' : mel[i]) : mel[i]);
    bass.push(bass[i]);
  }
  return { mel: mel.map(n => n === '—' ? null : n), bass: bass.map(n => n === '—' ? null : n) };
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
  return {
    title:   T(88,  titleMel,  titleBass),
    select:  T(96,  selectMel, selectBass),
    care:    T(100, careMel,   careBass),
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
  const s = screen || game.screen;
  if (!BG_THEMES[s]) return;
  bgMusic.theme = s;
  if (bgMusic.playing && bgMusic.interval) {
    clearInterval(bgMusic.interval);
    const th = BG_THEMES[bgMusic.theme];
    bgMusic.interval = setInterval(runBgMusicBeat, th.msPerBeat);
  }
}

function runBgMusicBeat() {
  if (!bgMusic.enabled) return;
  const th = BG_THEMES[bgMusic.theme] || BG_THEMES.care;
  const b = bgMusic.beat % th.mel.length;
  const mel = th.mel[b];
  if (mel) playMusicNote(BG_NOTES[mel], th.msPerBeat * 0.0012, 0.042, 'sine');
  const bass = th.bass[b];
  if (bass) playMusicNote(BG_NOTES[bass], th.msPerBeat * 0.002, 0.028, 'triangle');
  bgMusic.beat++;
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
}

function toggleBgMusic() {
  bgMusic.enabled = !bgMusic.enabled;
  if (bgMusic.enabled) { startBgMusic(); } else { stopBgMusic(); }
}
