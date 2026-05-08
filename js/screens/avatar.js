// Avatar creator — skin, hair, eyes (gender comes from avatarname)
// Depends on: game state, drawing utils

const AVATAR_SKIN = ['#f5d0b5', '#c68642', '#8d5524', '#4a3020'];
const AVATAR_HAIR = ['#2a2a2a', '#8b4513', '#d4a020', '#e8e0f0'];
const AVATAR_EYES = ['#2244aa', '#228844', '#663399'];

function drawAvatar() {
  setBgMusicTheme('select');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();

  const g = game.playerAvatar || {};
  if (g.skin === undefined) g.skin = 0;
  if (g.hair === undefined) g.hair = 0;
  if (g.eyes === undefined) g.eyes = 0;
  game.playerAvatar = g;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#2d3a5a');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  const label = g.gender === 'boy' ? 'Hey there, ' + (g.name || 'boy') + '!' : 'Hey there, ' + (g.name || 'girl') + '!';
  ctx.fillText(label, W / 2, 48);

  const cx = W / 2, cy = 200;
  ctx.save();
  ctx.translate(cx, cy);

  // Hair (behind head)
  ctx.fillStyle = AVATAR_HAIR[g.hair % AVATAR_HAIR.length];
  if (g.gender === 'girl') {
    ctx.beginPath();
    ctx.arc(0, -18, 48, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-42, 10, 14, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(42, 10, 14, 32, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, -18, 48, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = AVATAR_SKIN[g.skin % AVATAR_SKIN.length];
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (two, with white sclera)
  ctx.fillStyle = '#fff';
  drawEllipse(-18, -5, 10, 12);
  drawEllipse(18, -5, 10, 12);
  ctx.fill();
  ctx.fillStyle = AVATAR_EYES[g.eyes % AVATAR_EYES.length];
  drawEllipse(-18, -5, 5, 6);
  drawEllipse(18, -5, 5, 6);
  ctx.fill();
  ctx.fillStyle = '#111';
  drawEllipse(-18, -5, 2.5, 3);
  drawEllipse(18, -5, 2.5, 3);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#ffb0a0';
  drawEllipse(0, 10, 5, 4);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#c08070';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 8, 14, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.restore();

  const rowY = 340;
  const pick = (label, colors, key, y) => {
    ctx.fillStyle = '#aaa';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, 80, y);
    for (let i = 0; i < colors.length; i++) {
      const bx = 180 + i * 72;
      const sel = g[key] % colors.length === i;
      ctx.fillStyle = colors[i];
      drawRoundRect(bx, y - 18, 44, 36, 8);
      ctx.fill();
      if (sel) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        drawRoundRect(bx - 2, y - 20, 48, 40, 9);
        ctx.stroke();
      }
      if (mouse.clicked && hitBox(mouse.x, mouse.y, bx, y - 18, 44, 36)) {
        sfxClick();
        g[key] = i;
      }
    }
  };
  pick('Skin', AVATAR_SKIN, 'skin', rowY);
  pick('Hair', AVATAR_HAIR, 'hair', rowY + 56);
  pick('Eyes', AVATAR_EYES, 'eyes', rowY + 112);

  drawButton(W / 2 - 100, H - 100, 200, 48, 'Continue', '#6c5ce7', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 100, H - 100, 200, 48)) {
    sfxClick();
    game._freshSelect = true;
    game.screen = 'select';
  }

  drawButton(20, H - 48, 100, 36, 'Back', '#636e72', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 48, 100, 36)) {
    sfxClick();
    game.screen = 'avatarname';
  }
}
