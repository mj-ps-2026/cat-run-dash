// Trip map — car ride then destination minigame
// Depends on: game state, walk/chase/backyard inits

const TRAVEL_SPOTS = [
  { id: 'park', name: 'Sunny Park', color: '#7a9a5a', blurb: 'Open walk — gather flowers', go: 'walk' },
  { id: 'woods', name: 'Pine Trail', color: '#5a7a4a', blurb: 'Maze walk', go: 'walk' },
  { id: 'dash', name: 'Dog Dash', color: '#c07050', blurb: 'Run the alley chase', go: 'chase' },
  { id: 'yard', name: 'Backyard', color: '#90c878', blurb: 'Trees & critters', go: 'backyard' },
];

function updateTravel(dt) {
  setBgMusicTheme('store');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();

  const tr = game.travel;
  if (tr.phase === 'drive') {
    tr.timer -= dt;
    if (tr.timer <= 0) {
      const dest = tr.dest;
      tr.phase = 'map';
      tr.dest = null;
      tr.timer = 0;
      if (dest && dest.go === 'walk') {
        initWalk();
        game.screen = 'walk';
      } else if (dest && dest.go === 'chase') {
        initChase();
        game.screen = 'chase';
      } else if (dest && dest.go === 'backyard') {
        initBackyard();
        game.screen = 'backyard';
      } else {
        game.screen = 'care';
      }
    }
  }
}

function drawTravel() {
  const tr = game.travel;
  ctx.fillStyle = '#e8ecf4';
  ctx.fillRect(0, 0, W, H);

  if (tr.phase === 'drive' && tr.dest) {
    const t = 1 - Math.max(0, tr.timer) / 2.2;
    ctx.fillStyle = '#87a8d8';
    ctx.fillRect(0, 0, W, H * 0.55);
    ctx.fillStyle = '#5a5';
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    ctx.fillStyle = '#444';
    drawRoundRect(120 + t * 520, H * 0.52, 88, 36, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚗', 160 + t * 520, H * 0.54);
    ctx.fillStyle = '#333';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Heading to ${tr.dest.name}…`, W / 2, H * 0.28);
    drawFloats(0);
    return;
  }

  ctx.fillStyle = '#2d3a5a';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Trip map', W / 2, 44);

  const startX = 60, startY = 100, gap = 118;
  TRAVEL_SPOTS.forEach((spot, i) => {
    const x = startX + (i % 2) * 360;
    const y = startY + Math.floor(i / 2) * gap;
    const hov = hitBox(mouse.x, mouse.y, x, y, 300, 100);
    ctx.fillStyle = hov ? lighten(spot.color, 25) : spot.color;
    drawRoundRect(x, y, 300, 100, 12);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    drawRoundRect(x, y, 300, 100, 12);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(spot.name, x + 16, y + 36);
    ctx.font = '13px sans-serif';
    ctx.fillText(spot.blurb, x + 16, y + 62);
    if (mouse.clicked && hov) {
      sfxClick();
      tr.phase = 'drive';
      tr.dest = spot;
      tr.timer = 2.2;
    }
  });

  drawButton(20, H - 52, 120, 40, 'Back', '#636e72', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 52, 120, 40)) {
    sfxClick();
    tr.phase = 'map';
    game.screen = 'care';
  }

  drawFloats(0);
}
