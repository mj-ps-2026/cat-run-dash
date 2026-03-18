// screens/collection.js — Cat collection screen
// Depends on: game state, drawing utils, drawCat, sfx

function drawCollection() {
  setBgMusicTheme('collection');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#2d1b69');
  grad.addColorStop(1, '#1a1a4e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffcc44';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Your Cat Collection', W / 2, 45);

  ctx.fillStyle = '#b8a0dd';
  ctx.font = '13px sans-serif';
  ctx.fillText('Click a cat to show or hide them in your house!', W / 2, 68);

  if (game.cats.length === 0) {
    ctx.fillStyle = '#aaa';
    ctx.font = '18px sans-serif';
    ctx.fillText('No cats yet! Go raise one!', W / 2, H / 2);
  } else {
    const cols = 4;
    const cardW = 155, cardH = 155;
    const gap = 12;
    const totalCols = Math.min(game.cats.length, cols);
    const startX = (W - totalCols * cardW - (totalCols - 1) * gap) / 2;

    game.cats.forEach((cat, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const cx = startX + col * (cardW + gap);
      const cy = 85 + row * (cardH + gap);

      const inHouse = game.houseCats.includes(i);
      const hover = hitBox(mouse.x, mouse.y, cx, cy, cardW, cardH);

      // Card bg
      ctx.fillStyle = inHouse ? 'rgba(100,255,100,0.15)' : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = inHouse ? '#6c6' : (hover ? '#886' : 'rgba(255,255,255,0.1)');
      ctx.lineWidth = inHouse ? 2.5 : 1.5;
      drawRoundRect(cx, cy, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      // Cat drawing
      drawCat(cx + cardW / 2, cy + cardH / 2 - 12, cat.breed, cat.stage, 1, game.time + i * 0.7, false);

      // Name
      ctx.fillStyle = '#eee';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(CAT_BREEDS[cat.breed].name, cx + cardW / 2, cy + cardH - 30);

      // House status badge
      if (inHouse) {
        ctx.fillStyle = '#6c6';
        ctx.font = '11px sans-serif';
        ctx.fillText('🏠 In House', cx + cardW / 2, cy + cardH - 14);
      } else {
        ctx.fillStyle = '#888';
        ctx.font = '11px sans-serif';
        ctx.fillText('Click to show', cx + cardW / 2, cy + cardH - 14);
      }

      // Hover highlight
      if (hover) {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        drawRoundRect(cx - 1, cy - 1, cardW + 2, cardH + 2, 13);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Click to toggle house visibility
      if (mouse.clicked && hover) {
        sfxClick();
        if (inHouse) {
          game.houseCats = game.houseCats.filter(idx => idx !== i);
        } else {
          game.houseCats.push(i);
        }
      }
    });
  }

  // Count
  if (game.cats.length > 0) {
    ctx.fillStyle = '#a98cd8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    const inHouseCount = game.houseCats.length;
    ctx.fillText(`${game.cats.length} cat${game.cats.length !== 1 ? 's' : ''} collected  |  ${inHouseCount} in house`, W / 2, H - 75);
  }

  // Back button
  drawButton(W / 2 - 60, H - 55, 120, 40, 'Back', '#636e72', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 60, H - 55, 120, 40)) {
    sfxClick();
    game.screen = game.currentCat !== null ? 'care' : 'title';
  }
}
