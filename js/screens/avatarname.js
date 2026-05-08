// avatarname.js — Gender & name screen before avatar customization
// Depends on: game state, drawing utils

(function bindAvatarNameKeys() {
  if (typeof window === 'undefined' || window._avatarnameKeyBound) return;
  window._avatarnameKeyBound = true;
  window.addEventListener('keydown', e => {
    if (typeof game === 'undefined' || game.screen !== 'avatarname') return;
    const g = game.playerAvatar || {};
    if (e.key === 'Backspace') {
      g.name = (g.name || '').slice(0, -1);
      e.preventDefault();
    } else if (e.key.length === 1 && (g.name || '').length < 18) {
      g.name = (g.name || '') + e.key;
    }
  });
})();

function drawAvatarName() {
  setBgMusicTheme('select');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();

  const g = game.playerAvatar || {};
  if (!g.gender) g.gender = 'girl';
  if (!g.name) g.name = '';
  game.playerAvatar = g;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#2d3a5a');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Who are you?', W / 2, 48);

  ctx.fillStyle = '#bbb';
  ctx.font = '16px sans-serif';
  ctx.fillText('Type your name (keyboard or tap below)', W / 2, 90);

  ctx.fillStyle = '#fff';
  drawRoundRect(W / 2 - 180, 108, 360, 44, 10);
  ctx.fill();
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  drawRoundRect(W / 2 - 180, 108, 360, 44, 10);
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(g.name || '…', W / 2, 138);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let li = 0; li < letters.length; li++) {
    const col = li % 13;
    const row = Math.floor(li / 13);
    const bx = 70 + col * 52;
    const by = 175 + row * 36;
    drawButton(bx, by, 46, 30, letters[li], '#889', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, bx, by, 46, 30) && (g.name || '').length < 18) {
      sfxClick();
      g.name = (g.name || '') + letters[li];
      mouse.clicked = false;
    }
  }

  drawButton(70, 255, 80, 32, 'Space', '#889', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 70, 255, 80, 32)) {
    sfxClick();
    g.name = (g.name || '') + ' ';
    mouse.clicked = false;
  }
  drawButton(160, 255, 90, 32, '← Del', '#c07050', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 160, 255, 90, 32)) {
    sfxClick();
    g.name = (g.name || '').slice(0, -1);
    mouse.clicked = false;
  }

  ctx.fillStyle = '#bbb';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Gender', W / 2, 318);
  drawButton(W / 2 - 120, 330, 100, 42, 'Boy', g.gender === 'boy' ? '#4a8' : '#889', true);
  drawButton(W / 2 + 20, 330, 100, 42, 'Girl', g.gender === 'girl' ? '#d48' : '#889', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 120, 330, 100, 42)) {
    sfxClick(); g.gender = 'boy'; mouse.clicked = false;
  }
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 + 20, 330, 100, 42)) {
    sfxClick(); g.gender = 'girl'; mouse.clicked = false;
  }

  drawButton(W / 2 - 90, H - 100, 180, 48, 'Continue', '#6c5ce7', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 90, H - 100, 180, 48)) {
    sfxClick();
    if (!g.name || !g.name.trim()) g.name = 'Player';
    game.screen = 'avatar';
    mouse.clicked = false;
  }

  drawButton(20, H - 48, 100, 36, 'Back', '#636e72', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 48, 100, 36)) {
    sfxClick();
    game.screen = 'title';
  }
}
