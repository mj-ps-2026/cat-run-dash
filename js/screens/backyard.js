// Backyard — door from care; walk nav; egg hunt; critters; stray cat
// Depends on: drawing.js, config (isEggHuntEventActive), game state, input

const EGG_LOOTS = ['coin', 'coin', 'treat', 'empty', 'sparkle'];
const EGG_COLORS = ['#ffecd2', '#ffd4e5', '#c8e6ff', '#d4ffd4', '#fff4a8', '#e8d4ff'];

const BY_SCRATCH_RANGE = 78;
const BY_SCRATCH_COOLDOWN = 1.35;
const BY_DASH_COOLDOWN = 1.35;
const BY_SCRATCH_BTN_X = 10, BY_SCRATCH_BTN_Y = H - 50, BY_SCRATCH_BTN_W = 120, BY_SCRATCH_BTN_H = 44;

function drawCritterSprite(x, y, kind, t, face) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  const wob = Math.sin(t * 14) * 1.2;
  if (kind === 'bird') {
    ctx.fillStyle = '#6a8a5a';
    drawEllipse(0, wob, 10, 7);
    ctx.fill();
    ctx.fillStyle = '#c8a060';
    ctx.beginPath();
    ctx.ellipse(-9, wob - 2, 7, 4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(9, wob - 2, 7, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    drawEllipse(5, wob - 3, 2.5, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#4a4a3a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(4, wob); ctx.lineTo(14, wob + 1);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#7a9a50';
    drawEllipse(0, wob, 11, 7);
    ctx.fill();
    ctx.fillStyle = '#5a4030';
    drawEllipse(0, wob + 2, 7, 5);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, wob - 5); ctx.lineTo(-7, wob - 11);
    ctx.moveTo(5, wob - 5); ctx.lineTo(7, wob - 11);
    ctx.stroke();
    ctx.fillStyle = '#222';
    drawEllipse(4, wob - 2, 2, 2);
    ctx.fill();
  }
  ctx.restore();
}

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
  b.dashCooldown = 0;
  b.dashing = false;
  b.dashTimer = 0;
  b.scratchCooldown = 0;
  b.scratchFlash = 0;
  b.particles = [];

  for (let i = 0; i < 6; i++) {
    b.critters.push({
      x: 80 + Math.random() * (W - 160),
      y: 120 + Math.random() * (H - 240),
      vx: (Math.random() - 0.5) * 85,
      vy: (Math.random() - 0.5) * 48,
      kind: Math.random() < 0.5 ? 'bird' : 'bug',
      caught: false,
      phase: Math.random() * Math.PI * 2,
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
  let speed = 150 * moodBonus;
  if (b.dashing) speed *= 2.35;

  const homeHit = hitBox(mouse.x, mouse.y, W - 130, 10, 120, 35);
  const scratchBtnHit = hitBox(mouse.x, mouse.y, BY_SCRATCH_BTN_X, BY_SCRATCH_BTN_Y, BY_SCRATCH_BTN_W, BY_SCRATCH_BTN_H);

  b.dashCooldown = Math.max(0, (b.dashCooldown || 0) - dt);
  b.scratchCooldown = Math.max(0, (b.scratchCooldown || 0) - dt);
  if (b.scratchFlash > 0) b.scratchFlash -= dt;
  if (b.dashing) {
    b.dashTimer -= dt;
    if (b.dashTimer <= 0) b.dashing = false;
  }

  if ((keys['Space'] || keys['ShiftLeft']) && b.dashCooldown <= 0 && !b.dashing) {
    b.dashing = true;
    b.dashTimer = 0.32;
    b.dashCooldown = BY_DASH_COOLDOWN;
    sfxDash();
  }

  const scratchKeys = keys['KeyF'] || keys['KeyE'];
  const scratchClick = mouse.clicked && scratchBtnHit;
  if (b.scratchCooldown <= 0 && (scratchKeys || scratchClick)) {
    let hitAny = false;
    b.critters.forEach(c => {
      if (c.caught) return;
      const d = Math.hypot(c.x - b.px, c.y - b.py);
      if (d < BY_SCRATCH_RANGE) {
        hitAny = true;
        const nx = d < 1e-3 ? 1 : (c.x - b.px) / d;
        const ny = d < 1e-3 ? 0 : (c.y - b.py) / d;
        c.x += nx * 55;
        c.y += ny * 55;
        c.vx += nx * 120;
        c.vy += ny * 90;
      }
    });
    spawnParticles(b.particles, b.px, b.py, hitAny ? 10 : 4, '#ffcc44', 50);
    b.scratchCooldown = BY_SCRATCH_COOLDOWN;
    b.scratchFlash = 0.26;
    sfxScrape();
    addFloat(b.px, b.py - 38, hitAny ? '💅 Gotcha!' : '💅 Swipe!', hitAny ? '#fa0' : '#88a');
  }

  if (mouse.clicked && !homeHit && !scratchBtnHit) {
    b.targetX = mouse.x;
    b.targetY = mouse.y;
  }
  if (mouse.down && !homeHit && !scratchBtnHit) {
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

  const pointerMovesCat = mouse.down && (!touchCtrl.isTouch || touchCtrl.uiId !== null) && !homeHit && !scratchBtnHit;

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

  b.particles = b.particles.filter(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    return p.life > 0;
  });

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
    c.phase += dt * 8;
    const dx = c.x - b.px;
    const dy = c.y - b.py;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < 160) {
      const flee = 220 * (1 - dist / 160);
      c.vx += (dx / dist) * flee * dt;
      c.vy += (dy / dist) * flee * dt;
    }
    const cap = c.kind === 'bird' ? 195 : 165;
    const vm = Math.hypot(c.vx, c.vy);
    if (vm > cap) {
      c.vx = (c.vx / vm) * cap;
      c.vy = (c.vy / vm) * cap;
    }
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    if (c.x < 40 || c.x > W - 40) c.vx *= -0.85;
    if (c.y < 90 || c.y > H - 100) c.vy *= -0.85;
    if (c.kind === 'bird') c.y += Math.sin(game.time * 3 + c.x * 0.01) * 10 * dt;

    if (Math.hypot(b.px - c.x, b.py - c.y) < 34) {
      c.caught = true;
      sfxGather();
      sfxComplete();
      spawnParticles(b.particles, c.x, c.y, 18, '#6c6', 70);
      spawnParticles(b.particles, c.x, c.y - 8, 12, '#ffcc44', 55);
      const prev = game.care.feed;
      game.care.feed = Math.min(MAX_PER_ACTIVITY, game.care.feed + 1);
      if (game.care.feed > prev) {
        addFloat(c.x, c.y - 32, c.kind === 'bird' ? 'Nice! +1 feed 🎉' : 'Bug nabbed! +1 feed 🎉', '#4a9');
        checkGrowth();
      } else {
        addFloat(c.x, c.y - 32, 'Full — woo! ✨', '#8a8');
      }
    }
  });

  b.eggs.forEach(egg => {
    if (egg.collected) return;
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
  const currentCat = getCurrentCat();
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
  b.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, p.life * 3);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  b.critters.forEach(c => {
    if (c.caught) return;
    const face = c.vx >= 0 ? 1 : -1;
    drawCritterSprite(c.x, c.y, c.kind, c.phase, face);
  });

  b.eggs.forEach(egg => {
    if (egg.collected) return;
    const bob = Math.sin(egg.bob || 0) * 3;
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

  if (b.stray && currentCat) {
    drawCat(b.stray.x, b.stray.y, 0, 1, 1, game.time, true);
  }

  if (currentCat) {
    drawCat(b.px, b.py, currentCat.breed, currentCat.stage, 1, game.time, true, false, currentCat.equipped, currentCat.look);
  }

  if (b.scratchFlash > 0) {
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.px, b.py, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  drawRoundRect(12, 12, W - 24, 38, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  let sub = 'Trees & fresh air — critters flee! Dash / scratch help you catch them.';
  if (typeof isEggHuntEventActive === 'function' && isEggHuntEventActive() && !game.eggHuntRewardClaimed && b.eggs.length > 0) {
    const left = b.eggs.filter(e => !e.collected).length;
    sub = `Egg hunt off-season in code — ${left} eggs if event returns.`;
  } else if (game.eggHuntRewardClaimed) {
    sub = 'Egg hunt bonus claimed — enjoy the yard!';
  }
  ctx.font = '13px sans-serif';
  ctx.fillText(sub, 22, 36);

  const scReady = (b.scratchCooldown || 0) <= 0;
  drawButton(BY_SCRATCH_BTN_X, BY_SCRATCH_BTN_Y, BY_SCRATCH_BTN_W, BY_SCRATCH_BTN_H, scReady ? '😼 Scratch' : `${(b.scratchCooldown || 0).toFixed(1)}s`, scReady ? '#e17055' : '#95a5a6', scReady);

  drawTouchControls();
  drawButton(W - 130, 10, 120, 35, 'Go Home', '#6c5ce7', true);
  drawFloats(0);
}
