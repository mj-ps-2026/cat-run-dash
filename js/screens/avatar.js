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

  const skinColor = AVATAR_SKIN[g.skin % AVATAR_SKIN.length];
  const hairColor = AVATAR_HAIR[g.hair % AVATAR_HAIR.length];

  // Shoulders / torso
  ctx.fillStyle = g.gender === 'girl' ? '#6a5a8a' : '#4a7aaa';
  ctx.beginPath();
  ctx.moveTo(-56, 58);
  ctx.quadraticCurveTo(-46, 52, -24, 52);
  ctx.lineTo(24, 52);
  ctx.quadraticCurveTo(46, 52, 56, 58);
  ctx.lineTo(56, 96);
  ctx.lineTo(-56, 96);
  ctx.closePath();
  ctx.fill();
  // Collar line
  ctx.strokeStyle = g.gender === 'girl' ? '#5a4a7a' : '#3a6a9a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-20, 52);
  ctx.quadraticCurveTo(0, 60, 20, 52);
  ctx.stroke();

  // Neck
  ctx.fillStyle = skinColor;
  ctx.fillRect(-11, 44, 22, 14);

  // Hair (behind head)
  ctx.fillStyle = hairColor;
  // Main hair volume — larger arc across top
  ctx.beginPath();
  ctx.arc(0, -24, 58, Math.PI * 1.08, Math.PI * 1.92);
  ctx.fill();
  if (g.gender === 'girl') {
    // Long side locks
    ctx.beginPath();
    ctx.ellipse(-46, 6, 15, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(46, 6, 15, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bangs
    ctx.beginPath();
    ctx.ellipse(-10, -42, 20, 10, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -44, 18, 9, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Extra fringe
    ctx.beginPath();
    ctx.ellipse(-28, -38, 12, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Shorter side hair
    ctx.beginPath();
    ctx.ellipse(-44, -2, 12, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(44, -2, 12, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fringe sweep
    ctx.beginPath();
    ctx.ellipse(4, -40, 22, 8, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ears
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.moveTo(-46, -16);
  ctx.lineTo(-42, -32);
  ctx.lineTo(-36, -16);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(46, -16);
  ctx.lineTo(42, -32);
  ctx.lineTo(36, -16);
  ctx.closePath();
  ctx.fill();
  // Inner ear
  ctx.fillStyle = '#f0bcbc';
  ctx.beginPath();
  ctx.moveTo(-44, -18);
  ctx.lineTo(-42, -28);
  ctx.lineTo(-38, -18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(44, -18);
  ctx.lineTo(42, -28);
  ctx.lineTo(38, -18);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = hairColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-18, -18, 11, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(18, -18, 11, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Eyes — each drawn separately (drawEllipse resets path via beginPath)
  // White sclera
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-18, -5, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, -5, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Iris
  ctx.fillStyle = AVATAR_EYES[g.eyes % AVATAR_EYES.length];
  ctx.beginPath();
  ctx.ellipse(-18, -5, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, -5, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(-18, -4, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, -4, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Catchlight
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-16, -8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, -8, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyelashes (girl only)
  if (g.gender === 'girl') {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    [-18, 18].forEach(ex => {
      for (let li = 0; li < 3; li++) {
        ctx.beginPath();
        ctx.moveTo(ex - 2 + li * 2, -17);
        ctx.lineTo(ex - 1 + li * 2, -21 - li);
        ctx.stroke();
      }
    });
  }

  // Blush
  ctx.fillStyle = 'rgba(255, 150, 150, 0.22)';
  ctx.beginPath();
  ctx.ellipse(-30, 8, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(30, 8, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#e8a090';
  ctx.beginPath();
  ctx.ellipse(0, 10, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nostrils
  ctx.fillStyle = '#c08070';
  ctx.beginPath();
  ctx.ellipse(-2.5, 11, 1.5, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(2.5, 11, 1.5, 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  // Upper lip
  ctx.fillStyle = '#d4707a';
  ctx.beginPath();
  ctx.moveTo(-10, 19);
  ctx.quadraticCurveTo(-4, 16, 0, 19);
  ctx.quadraticCurveTo(4, 16, 10, 19);
  ctx.quadraticCurveTo(0, 22, -10, 19);
  ctx.fill();
  // Lower lip
  ctx.fillStyle = '#e0808a';
  ctx.beginPath();
  ctx.ellipse(0, 23, 8, 4, 0, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Lip line
  ctx.strokeStyle = '#c0606a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-10, 19);
  ctx.quadraticCurveTo(0, 16, 10, 19);
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
