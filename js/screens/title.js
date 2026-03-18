// screens/title.js — Title screen update and draw
// Depends on: game state, drawing utils, drawCat, sfx functions

function updateTitle(dt) {
  game.titleBounce += dt;
}

function drawTitle() {
  setBgMusicTheme('title');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#2d1b69');
  grad.addColorStop(0.5, '#44268a');
  grad.addColorStop(1, '#1a1a4e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 50; i++) {
    const sx = (i * 167 + 13) % W;
    const sy = (i * 97 + 43) % (H * 0.6);
    const twinkle = Math.sin(game.time * 2 + i) * 0.5 + 0.5;
    ctx.globalAlpha = twinkle * 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 + twinkle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Title
  const titleY = 150 + Math.sin(game.titleBounce * 1.5) * 10;
  ctx.fillStyle = '#ffcc44';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#aa6600';
  ctx.lineWidth = 6;
  ctx.strokeText('CAT RUN DASH', W / 2, titleY);
  ctx.fillText('CAT RUN DASH', W / 2, titleY);

  // Subtitle
  ctx.fillStyle = '#ddb8ff';
  ctx.font = '20px sans-serif';
  ctx.fillText('Raise your cat. Outrun the dogs!', W / 2, titleY + 45);

  // Cat silhouettes
  const catY = 340;
  for (let i = 0; i < 3; i++) {
    const cx = 260 + i * 140;
    const bob = Math.sin(game.titleBounce * 2 + i * 1.2) * 8;
    drawCat(cx, catY + bob, i * 2, 3, i === 1 ? -1 : 1, game.titleBounce);
  }

  // Play button
  drawButton(W / 2 - 90, 440, 180, 55, 'PLAY', '#e84393', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 90, 440, 180, 55)) {
    sfxClick();
    audioCtx.resume();
    game.screen = 'select';
  }

  // Cat collection count
  if (game.cats.length > 0) {
    ctx.fillStyle = '#aaa';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Cats collected: ${game.cats.length}`, W / 2, 520);

    drawButton(W / 2 - 70, 535, 140, 35, 'View Cats', '#6c5ce7', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 70, 535, 140, 35)) {
      sfxClick();
      game.screen = 'collection';
    }
  }
}
