// Backyard — door from care; walk nav; egg hunt; critters; stray cat
// Depends on: drawing.js, config (isEggHuntEventActive), game state, input

const EGG_LOOTS = ['coin', 'coin', 'treat', 'empty', 'sparkle'];
const EGG_COLORS = ['#ffecd2', '#ffd4e5', '#c8e6ff', '#d4ffd4', '#fff4a8', '#e8d4ff'];

function initBackyard() {
  const b = game.backyard;
  b.px = W / 2;
  b.py = H * 0.48;
  b.targetX = b.px;
  b.targetY = b.py;
  b.eggs = [];
  b.eggHuntComplete = false;
  b.critters = [];
  b.stray = null;

  for (let i = 0; i < 6; i++) {
    b.critters.push({
      x: 80 + Math.random() * (W - 160),
      y: 120 + Math.random() * (H - 240),
      vx: (Math.random() - 0.5) * 70,
      vy: (Math.random() - 0.5) * 40,
      kind: Math.random() < 0.5 ? 'bird' : 'bug',
      caught: false,
    });
  }

  b.stray = {
    x: W * 0.25 + Math.random() * 80,
    y: H * 0.42,
    tx: W * 0.35,
    ty: H * 0.45,
    petCooldown: 0,
  };

  if (typeof isEggHuntEventActive === 'function' && isEggHuntEventActive() && !game.eggHuntRewardClaimed) {
    for (let i = 0; i < 10; i++) {
      b.eggs.push({
        x: 70 + Math.random() * (W - 140),
        y: 100 + Math.random() * (H - 220),
        collected: false,
        bob: Math.random() * Math.PI * 2,
        color: EGG_COLORS[i % EGG_COLORS.length],
        loot: EGG_LOOTS[Math.floor(Math.random() * EGG_LOOTS.length)],
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

  if (b.stray) {
    const st = b.stray;
    if (st.petCooldown > 0) st.petCooldown -= dt;
    const sd = Math.hypot(st.tx - st.x, st.ty - st.y);
    if (sd > 8) {
      st.x += ((st.tx - st.x) / sd) * 40 * dt;
      st.y += ((st.ty - st.y) / sd) * 40 * dt;
    } else {
      st.tx = 120 + Math.random() * (W - 240);
      st.ty = 100 + Math.random() * (H - 280);
    }
    if (mouse.clicked && !homeHit && st.petCooldown <= 0 && Math.hypot(b.px - st.x, b.py - st.y) < 38) {
      st.petCooldown = 2;
      sfxMeow();
      game.money += 2;
      addFloat(st.x, st.y - 28, 'Stray loves pets! +$2', '#fa0');
    }
  }

  b.critters.forEach(c => {
    if (c.caught) return;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    if (c.x < 40 || c.x > W - 40) c.vx *= -1;
    if (c.y < 90 || c.y > H - 100) c.vy *= -1;
    if (c.kind === 'bird') c.y += Math.sin(game.time * 3 + c.x * 0.01) * 12 * dt;

    if (Math.hypot(b.px - c.x, b.py - c.y) < 36) {
      c.caught = true;
      sfxGather();
      const prev = game.care.feed;
      game.care.feed = Math.min(MAX_PER_ACTIVITY, game.care.feed + 1);
      if (game.care.feed > prev) {
        addFloat(c.x, c.y - 24, c.kind === 'bird' ? 'Caught bird! +1 feed' : 'Got a bug! +1 feed', '#4a9');
        checkGrowth();
      } else {
        addFloat(c.x, c.y - 24, 'Full — nice catch!', '#8a8');
      }
    }
  });

  b.eggs.forEach(egg => {
    if (egg.collected) return;
    egg.bob = (egg.bob || 0) + dt * 2.5;
    if (Math.hypot(b.px - egg.x, b.py - egg.y) < 30) {
      egg.collected = true;
      sfxClick();
      if (egg.loot === 'coin') {
        game.money += 4;
        addFloat(egg.x, egg.y - 28, 'Egg: +$4', '#fb0');
      } else if (egg.loot === 'treat') {
        const prev = game.care.feed;
        game.care.feed = Math.min(MAX_PER_ACTIVITY, game.care.feed + 2);
        addFloat(egg.x, egg.y - 28, 'Treat inside! +' + (game.care.feed - prev) + ' feed', '#f87');
        checkGrowth();
      } else if (egg.loot === 'sparkle') {
        addFloat(egg.x, egg.y - 28, 'Sparkler! ✨', '#daf');
      } else {
        addFloat(egg.x, egg.y - 28, 'Empty shell', '#aaa');
      }
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
  b.critters.forEach(c => {
    if (c.caught) return;
    ctx.font = c.kind === 'bird' ? '20px sans-serif' : '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.kind === 'bird' ? '🐦' : '🦗', c.x, c.y + 6);
  });

  b.eggs.forEach(egg => {
    if (egg.collected) return;
    const bob = Math.sin(egg.bob || 0) * 4;
    ctx.save();
    ctx.translate(egg.x, egg.y + bob);
    ctx.fillStyle = egg.color || '#fff8e8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });

  if (b.stray && game.currentCat !== null) {
    drawCat(b.stray.x, b.stray.y, 0, 1, 1, game.time, true);
  }

  if (game.currentCat !== null) {
    drawCat(b.px, b.py, game.currentCat, game.currentStage, 1, game.time, true);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  drawRoundRect(12, 12, W - 24, 38, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  let sub = 'Trees & fresh air — chase birds & bugs for +feed. Pet the stray for a coin.';
  if (typeof isEggHuntEventActive === 'function' && isEggHuntEventActive() && !game.eggHuntRewardClaimed && b.eggs.length > 0) {
    const left = b.eggs.filter(e => !e.collected).length;
    sub = `Egg hunt! Colored eggs hide treats or coins (${left} left). Finish for a bonus.`;
  } else if (game.eggHuntRewardClaimed) {
    sub = 'Egg hunt done this season — critters & stray still visit!';
  }
  ctx.font = '13px sans-serif';
  ctx.fillText(sub, 22, 36);

  drawButton(W - 130, 10, 120, 35, 'Go Home', '#6c5ce7', true);
  drawFloats(0);
}
