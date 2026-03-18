// screens/select.js — Cat selection screen
// Depends on: game state, drawing utils, drawCat, drawHomeBg, sfx, initCatAI

function drawSelect() {
  drawHomeBg();

  ctx.fillStyle = '#6a4';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#384';
  ctx.lineWidth = 4;
  ctx.strokeText('Choose Your Cat!', W / 2, 60);
  ctx.fillText('Choose Your Cat!', W / 2, 60);

  // Cat grid (2 rows of 3)
  const cols = 3, rows = 2;
  const cardW = 180, cardH = 180;
  const startX = (W - cols * cardW - (cols - 1) * 20) / 2;
  const startY = 90;

  for (let i = 0; i < CAT_BREEDS.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cx = startX + col * (cardW + 20);
    const cy = startY + row * (cardH + 15);

    const hover = hitBox(mouse.x, mouse.y, cx, cy, cardW, cardH);

    // Card
    ctx.fillStyle = hover ? '#fff8f0' : '#fff5e8';
    ctx.strokeStyle = hover ? '#f4a442' : '#ddd';
    ctx.lineWidth = hover ? 3 : 2;
    drawRoundRect(cx, cy, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    // Cat
    drawCat(cx + cardW / 2, cy + cardH / 2 - 10, i, 0, 1, game.time, false);

    // Name
    ctx.fillStyle = '#555';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(CAT_BREEDS[i].name, cx + cardW / 2, cy + cardH - 15);

    // Click to select
    if (mouse.clicked && hover) {
      sfxMeow();
      game.currentCat = i;
      game.currentStage = 0;
      resetCare();
      initCatAI();
      game.screen = 'care';
    }
  }
}
