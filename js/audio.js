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
// BACKGROUND MUSIC
// ============================================================
const bgMusic = { enabled: true, playing: false, beat: 0, interval: null };

const BG_NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00, C5: 523.25,
};

// 16-beat loop, pentatonic — 250 ms per beat (~120 BPM)
const BG_MELODY = [
  'G4', null, 'E4', 'G4',  'A4', null, 'G4', null,
  'E4', 'G4', 'A4', 'G4',  'E4', null, 'D4', null,
];
const BG_BASS = [
  'C3', null, null, null,  'G3', null, null, null,
  'A3', null, null, null,  'G3', null, 'D3', null,
];

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

function startBgMusic() {
  if (bgMusic.playing || !bgMusic.enabled) return;
  bgMusic.playing = true;
  bgMusic.interval = setInterval(() => {
    if (!bgMusic.enabled) return;
    const b = bgMusic.beat % BG_MELODY.length;
    const mel = BG_MELODY[b];
    if (mel) playMusicNote(BG_NOTES[mel], 0.28, 0.042, 'sine');
    const bass = BG_BASS[b];
    if (bass) playMusicNote(BG_NOTES[bass], 0.5, 0.028, 'triangle');
    bgMusic.beat++;
  }, 250);
}

function stopBgMusic() {
  if (bgMusic.interval) { clearInterval(bgMusic.interval); bgMusic.interval = null; }
  bgMusic.playing = false;
}

function toggleBgMusic() {
  bgMusic.enabled = !bgMusic.enabled;
  if (bgMusic.enabled) { startBgMusic(); } else { stopBgMusic(); }
}
