// Chill zone — playful reset screen (user-activated from care)
// Depends on: drawing.js, audio.js, game state

function initTimeout() {
  game.timeout.timer = 0;
}

function updateTimeout(dt) {
  setBgMusicTheme('care');
  game.timeout.timer += dt;
}

function drawTimeout() {
  setBgMusicTheme('care');
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#a8e0b8');
  grad.addColorStop(0.55, '#8fd4a0');
  grad.addColorStop(1, '#6ab86a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 12; i++) {
    const bx = (i * 137 + 20) % W;
    const by = 80 + (i * 73) % (H * 0.35);
    ctx.beginPath();
    ctx.ellipse(bx, by, 18 + (i % 3) * 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#a86e3e';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Chill zone', W / 2, 72);
  ctx.fillStyle = '#555';
  ctx.font = '15px sans-serif';
  ctx.fillText('A little reset — no worries!', W / 2, 102);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('Your kitty is taking a breather. Food, water, and potty are right here.', W / 2, 128);

  const cx = W / 2, cy = H * 0.48;
  ctx.font = '40px sans-serif';
  ctx.fillText('😿', cx, cy - 95);

  if (game.currentCat !== null) {
    drawCat(cx, cy, game.currentCat, game.currentStage, 1, game.time, false, false);
  }

  ctx.fillStyle = '#f5f0e6';
  drawRoundRect(cx - 120, H * 0.62, 60, 22, 6);
  ctx.fill();
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍖', cx - 90, H * 0.62 + 16);
  ctx.fillStyle = '#b8e0ff';
  drawRoundRect(cx - 40, H * 0.62, 50, 22, 6);
  ctx.fill();
  ctx.fillText('💧', cx - 18, H * 0.62 + 16);
  ctx.fillStyle = '#e8dcc8';
  drawRoundRect(cx + 40, H * 0.62, 56, 22, 6);
  ctx.fill();
  ctx.fillText('📦', cx + 68, H * 0.62 + 16);

  drawButton(W / 2 - 90, H - 95, 180, 48, 'Back home', '#6c5ce7', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 90, H - 95, 180, 48)) {
    sfxClick();
    game.screen = 'care';
  }

  drawFloats(0);
}
