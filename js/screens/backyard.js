// Backyard — door from care; same pointer nav as walk; optional time-limited egg hunt
// Depends on: drawing.js, config (isEggHuntEventActive), game state, input

function initBackyard() {
  const b = game.backyard;
  b.px = W / 2;
  b.py = H * 0.48;
  b.targetX = b.px;
  b.targetY = b.py;
  b.eggs = [];
  b.eggHuntComplete = false;

  if (typeof isEggHuntEventActive === 'function' && isEggHuntEventActive() && !game.eggHuntRewardClaimed) {
    for (let i = 0; i < 10; i++) {
      b.eggs.push({
        x: 70 + Math.random() * (W - 140),
        y: 100 + Math.random() * (H - 220),
        collected: false,
        bob: Math.random() * Math.PI * 2,
      });
    }
  }
}

function updateBackyard(dt) {
  setBgMusicTheme('walk');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();

  const b = game.backyard;
  const moodBonus = 1.0 + getPawMood() * 0.3;
  const speed = 150 * moodBonus;
  const catRad = 10;

  const homeHit = hitBox(mouse.x, mouse.y, W - 130, 10, 120, 35);
  if (mouse.clicked && !homeHit) {
    b.targetX = mouse.x;
    b.targetY = mouse.y;
  }
  if (mouse.down && !homeHit) {
    if (touchCtrl.isTouch) {
      if (touchCtrl.uiId !== null) {
        b.targetX = mouse.x;
        b.targetY = mouse.y;
      }
    } else {
      b.targetX = mouse.x;
      b.targetY = mouse.y;
    }
  }

  const pointerMovesCat = mouse.down && (!touchCtrl.isTouch || touchCtrl.uiId !== null) && !homeHit;

  let kbDx = 0, kbDy = 0;
  if (keys['ArrowLeft'] || keys['KeyA']) kbDx -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) kbDx += 1;
  if (keys['ArrowUp'] || keys['KeyW']) kbDy -= 1;
  if (keys['ArrowDown'] || keys['KeyS']) kbDy += 1;
  if (kbDx || kbDy) {
    const mag = Math.sqrt(kbDx * kbDx + kbDy * kbDy);
    b.px += (kbDx / mag) * speed * dt;
    b.py += (kbDy / mag) * speed * dt;
    b.targetX = b.px;
    b.targetY = b.py;
  } else {
    const tdx = b.targetX - b.px;
    const tdy = b.targetY - b.py;
    const tdist = Math.hypot(tdx, tdy);
    if (tdist > 5 && pointerMovesCat) {
      b.px += (tdx / tdist) * speed * dt;
      b.py += (tdy / tdist) * speed * dt;
    }
  }

  b.px = Math.max(18, Math.min(W - 18, b.px));
  b.py = Math.max(55, Math.min(H - 20, b.py));

  b.eggs.forEach(egg => {
    if (egg.collected) return;
    egg.bob = (egg.bob || 0) + dt * 2.5;
    if (Math.hypot(b.px - egg.x, b.py - egg.y) < 30) {
      egg.collected = true;
      sfxClick();
      addFloat(egg.x, egg.y - 28, 'Egg!', '#fa0');
    }
  });

  const left = b.eggs.filter(e => !e.collected).length;
  if (b.eggs.length > 0 && left === 0 && !b.eggHuntComplete) {
    b.eggHuntComplete = true;
    if (typeof isEggHuntEventActive === 'function' && isEggHuntEventActive() && !game.eggHuntRewardClaimed) {
      game.eggHuntRewardClaimed = true;
      game.money += 75;
      sfxBuy();
      addFloat(W / 2, H * 0.35, 'Egg hunt complete! +$75', '#fa0', { screen: true });
    }
  }

  if (mouse.clicked && homeHit) {
    sfxClick();
    game.screen = 'care';
  }
}

function drawBackyard() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#87c9ff');
  grad.addColorStop(0.45, '#b8e8c8');
  grad.addColorStop(1, '#5a9a4a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 18; i++) {
    const tx = (i * 113 + 30) % W;
    const ty = 120 + (i * 67) % (H * 0.45);
    ctx.fillStyle = 'rgba(40, 90, 40, 0.45)';
    ctx.fillRect(tx - 4, ty - 40, 10, 50);
    ctx.fillStyle = `rgba(${50 + (i % 3) * 20}, ${120 + (i % 4) * 15}, 60, 0.85)`;
    ctx.beginPath();
    ctx.arc(tx, ty - 45, 28 + (i % 4) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 8; i++) {
    const cx = (i * 211 + 40) % (W - 40);
    const cy = 40 + (i * 97) % 80;
    drawEllipse(cx, cy, 40 + i * 5, 18);
    ctx.fill();
  }

  const b = game.backyard;
  b.eggs.forEach(egg => {
    if (egg.collected) return;
    const bob = Math.sin(egg.bob || 0) * 4;
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥚', egg.x, egg.y + bob + 8);
  });

  if (game.currentCat !== null) {
    drawCat(b.px, b.py, game.currentCat, game.currentStage, 1, game.time, true);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  drawRoundRect(12, 12, W - 24, 38, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  let sub = 'Trees & fresh air — no dogs, no gathering.';
  if (typeof isEggHuntEventActive === 'function' && isEggHuntEventActive() && !game.eggHuntRewardClaimed && b.eggs.length > 0) {
    const left = b.eggs.filter(e => !e.collected).length;
    sub = `Egg hunt! Find all ${b.eggs.length} eggs (${left} left). One-time bonus when complete.`;
  } else if (game.eggHuntRewardClaimed) {
    sub = 'Egg hunt already completed this year — enjoy the yard!';
  }
  ctx.font = '13px sans-serif';
  ctx.fillText(sub, 22, 36);

  drawButton(W - 130, 10, 120, 35, 'Go Home', '#6c5ce7', true);
  drawFloats(0);
}
