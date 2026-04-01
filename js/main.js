// main.js — Game loop and startup
// Loaded LAST; depends on all other scripts being loaded first

let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
  lastTime = timestamp;
  game.time += dt;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Update & Draw based on screen
  switch (game.screen) {
    case 'title':
      updateTitle(dt);
      drawTitle();
      break;
    case 'select':
      drawSelect();
      break;
    case 'care':
      updateCare(dt);
      drawCare();
      break;
    case 'walk':
      updateWalk(dt);
      drawWalk();
      break;
    case 'backyard':
      updateBackyard(dt);
      drawBackyard();
      break;
    case 'timeout':
      updateTimeout(dt);
      drawTimeout();
      break;
    case 'dressing':
      drawDressing();
      break;
    case 'chase':
      updateChase(dt);
      drawChase();
      break;
    case 'store':
      drawStore();
      break;
    case 'collection':
      drawCollection();
      break;
  }

  updateFloats(dt);

  // Reset click
  mouse.clicked = false;

  requestAnimationFrame(gameLoop);
}

// Load saved game and start autosave
loadGame();
setInterval(saveGame, 5000);

requestAnimationFrame(gameLoop);
