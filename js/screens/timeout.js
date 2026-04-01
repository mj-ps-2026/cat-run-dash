// Chill zone — bedroom slice of the house; cat AI runs with bedroom-only targets
// Depends on: drawing.js, furniture.js, catai.js, game state

function initTimeout() {
  game.timeout = game.timeout || {};
  game.timeout.savedScroll = game.homeScrollX || 0;
  game.timeout.timer = 0;
  const mid = HOME_ROOM_W + HOME_ROOM_W / 2 - W / 2;
  game.homeScrollX = Math.max(0, Math.min(HOME_TOTAL_W - W, mid));
  const r0 = HOME_ROOM_W + 35;
  const r1 = HOME_ROOM_W * 2 - 35;
  const ai = game.catAI;
  ai.x = Math.max(r0, Math.min(r1, ai.x));
  ai.y = Math.max(260, Math.min(H * 0.63, ai.y));
  ai.targetX = Math.max(r0, Math.min(r1, ai.targetX));
  ai.targetY = Math.max(260, Math.min(H * 0.63, ai.targetY));
}

function updateTimeout(dt) {
  setBgMusicTheme('care');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  game.timeout.timer += dt;
  updateCatAI(dt);
}

function drawTimeout() {
  setBgMusicTheme('care');
  const sx = game.homeScrollX || 0;
  const mx = mouse.x, my = mouse.y;
  const wx = mx + sx;

  ctx.save();
  ctx.translate(-sx, 0);
  drawHomeBg();
  drawFurniture();
  drawCatBehavior();
  ctx.restore();

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  drawRoundRect(12, 12, W - 24, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Chill zone — bedroom', 22, 38);

  ctx.fillStyle = '#f5f0e6';
  drawRoundRect(W / 2 - 130, H * 0.58, 60, 22, 6);
  ctx.fill();
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍖', W / 2 - 100, H * 0.58 + 16);
  ctx.fillStyle = '#b8e0ff';
  drawRoundRect(W / 2 - 50, H * 0.58, 50, 22, 6);
  ctx.fill();
  ctx.fillText('💧', W / 2 - 28, H * 0.58 + 16);
  ctx.fillStyle = '#e8dcc8';
  drawRoundRect(W / 2 + 30, H * 0.58, 56, 22, 6);
  ctx.fill();
  ctx.fillText('📦', W / 2 + 58, H * 0.58 + 16);

  ctx.fillStyle = '#555';
  ctx.font = '13px sans-serif';
  ctx.fillText('Food, water & potty nearby — your cat can still wander here.', W / 2, H * 0.54);

  drawButton(W / 2 - 90, H - 95, 180, 48, 'Back home', '#6c5ce7', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 90, H - 95, 180, 48)) {
    sfxClick();
    game.homeScrollX = game.timeout.savedScroll || 0;
    game.screen = 'care';
  }

  drawFloats(sx);
}
