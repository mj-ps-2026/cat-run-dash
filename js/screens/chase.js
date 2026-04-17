// screens/chase.js — Chase screen (init, update, draw) + house drawing helpers
// Depends on: game state, drawing utils, drawCat, drawDog, particles, sfx

const CHASE_SCRATCH_CX = 600, CHASE_SCRATCH_CY = 500, CHASE_SCRATCH_HIT_R = 50;
const CHASE_SCRATCH_RANGE = 78;
const CHASE_SCRATCH_COOLDOWN = 1.45;

function chaseScratchHit(mx, my) {
  return Math.hypot(mx - CHASE_SCRATCH_CX, my - CHASE_SCRATCH_CY) < CHASE_SCRATCH_HIT_R;
}

function initChase() {
  const c = game.chase;
  c.mapH = 3000; // Map height
  c.px = 400;
  c.py = c.mapH - 100; // Start at bottom
  c.vx = 0; c.vy = 0;
  c.scrapes = 0;
  c.timer = 300; // 5 minutes
  c.dashCooldown = 0;
  c.dashing = false;
  c.dashTimer = 0;
  c.won = false;
  c.lost = false;
  c.cameraY = c.py - H / 2;
  c.invincible = 0;
  c.particles = [];
  c.houseY = 120;
  c.targetX = c.px;
  c.scratchCooldown = 0;
  c.scratchFlash = 0;

  // Place dogs
  c.dogs = [];
  const totalDogs = 10;
  for (let i = 0; i < totalDogs; i++) {
    const dogY = 200 + (c.mapH - 400) * (i / totalDogs) + Math.random() * 150;
    c.dogs.push({
      x: 60 + Math.random() * (W - 120),
      y: dogY,
      vx: 0, vy: 0,
      type: i % 3,
      alive: true,
      speed: 80 + Math.random() * 40,
      patrolX: 60 + Math.random() * (W - 120),
      patrolDir: Math.random() > 0.5 ? 1 : -1,
      facing: 1,
      aggro: false,
      stunTimer: 0,
    });
  }

  // Place obstacles (bushes, fences)
  c.obstacles = [];
  for (let i = 0; i < 25; i++) {
    c.obstacles.push({
      x: 30 + Math.random() * (W - 60),
      y: 180 + Math.random() * (c.mapH - 300),
      type: Math.random() > 0.5 ? 'bush' : 'fence',
      w: 40 + Math.random() * 30,
      h: 20 + Math.random() * 15
    });
  }
}

function updateChase(dt) {
  const c = game.chase;
  const currentCat = getCurrentCat();
  if (c.won || c.lost) return;
  if (!currentCat) return;

  // Timer
  c.timer -= dt;
  if (c.timer <= 0) {
    c.timer = 0;
    c.lost = true;
    sfxLose();
    return;
  }

  // Player movement — happy cats are faster
  const moodBonus = 1.0 + getPawMood() * 0.3;
  const baseSpeed = (c.dashing ? 350 : 180) * moodBonus;
  const forwardSpeed = (c.dashing ? 350 : 120) * moodBonus;

  // Constant forward (upward) progress
  c.py -= forwardSpeed * dt;

  // Horizontal steering: keyboard
  let hDx = 0;
  if (keys['ArrowLeft'] || keys['KeyA']) hDx -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) hDx += 1;

  // Click/tap sets horizontal target (not on Scratch button)
  if (c.targetX === undefined) c.targetX = c.px;
  if (mouse.clicked || (mouse.down && touchCtrl.isTouch)) {
    if (!chaseScratchHit(mouse.x, mouse.y)) c.targetX = mouse.x;
  }

  // Slide toward target X (when no keyboard input)
  if (hDx === 0) {
    const hdx = c.targetX - c.px;
    if (Math.abs(hdx) > 3) {
      hDx = hdx > 0 ? 1 : -1;
      hDx *= Math.min(1, Math.abs(hdx) / 40);
    }
  } else {
    c.targetX = c.px;
  }

  c.vx = hDx * baseSpeed;
  c.vy = -forwardSpeed;
  c.px += c.vx * dt;
  c.px = Math.max(20, Math.min(W - 20, c.px));
  c.py = Math.max(40, Math.min(c.mapH - 20, c.py));

  // Dash
  if (c.dashCooldown > 0) c.dashCooldown -= dt;
  if ((keys['Space'] || keys['ShiftLeft'] || keys['ShiftRight']) && c.dashCooldown <= 0 && !c.dashing) {
    c.dashing = true;
    c.dashTimer = 0.3;
    c.dashCooldown = 1.5;
    c.invincible = 0.3;
    sfxDash();
    spawnParticles(c.particles, c.px, c.py, 8, '#ffcc44', 80);
  }
  if (c.dashing) {
    c.dashTimer -= dt;
    if (c.dashTimer <= 0) c.dashing = false;
    // Dash trail particles
    if (Math.random() > 0.5) {
      c.particles.push({
        x: c.px + (Math.random() - 0.5) * 20,
        y: c.py + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        life: 0.3, color: '#ffcc44', size: 3 + Math.random() * 3
      });
    }
  }
  if (c.invincible > 0) c.invincible -= dt;

  c.scratchCooldown = Math.max(0, c.scratchCooldown - dt);
  if (c.scratchFlash > 0) c.scratchFlash -= dt;

  // Defensive scratch — stun and push nearby dogs (separate from dash)
  const scratchChaseKeys = keys['KeyF'] || keys['KeyE'];
  const scratchChaseClick = mouse.clicked && chaseScratchHit(mouse.x, mouse.y);
  if (c.scratchCooldown <= 0 && (scratchChaseKeys || scratchChaseClick)) {
    let hitAny = false;
    c.dogs.forEach(dog => {
      if (!dog.alive) return;
      const distToPlayer = Math.hypot(dog.x - c.px, dog.y - c.py);
      if (distToPlayer < CHASE_SCRATCH_RANGE) {
        hitAny = true;
        dog.stunTimer = 2.6;
        const nx = distToPlayer < 1e-3 ? 1 : (dog.x - c.px) / distToPlayer;
        const ny = distToPlayer < 1e-3 ? 0 : (dog.y - c.py) / distToPlayer;
        dog.x += nx * 55;
        dog.y += ny * 55;
        dog.vx = 0;
        dog.vy = 0;
        spawnParticles(c.particles, dog.x, dog.y, 10, '#ff8844', 70);
      }
    });
    c.scratchCooldown = CHASE_SCRATCH_COOLDOWN;
    c.scratchFlash = 0.28;
    c.invincible = Math.max(c.invincible, 0.35);
    sfxScrape();
    const sy = c.py - c.cameraY;
    addFloat(c.px, sy - 40, hitAny ? '💅 Scratch!' : '💅 Swipe!', hitAny ? '#fa0' : '#88a');
  }

  // Dogs AI
  c.dogs.forEach(dog => {
    if (!dog.alive) return;
    if (dog.stunTimer > 0) { dog.stunTimer -= dt; return; }

    const distToPlayer = Math.hypot(dog.x - c.px, dog.y - c.py);

    if (distToPlayer < 250) {
      dog.aggro = true;
    }
    if (distToPlayer > 400) {
      dog.aggro = false;
    }

    if (dog.aggro) {
      // Chase player
      const angle = Math.atan2(c.py - dog.y, c.px - dog.x);
      dog.vx = Math.cos(angle) * dog.speed;
      dog.vy = Math.sin(angle) * dog.speed;
      dog.facing = dog.vx > 0 ? 1 : -1;
    } else {
      // Patrol
      dog.vx = dog.patrolDir * dog.speed * 0.4;
      dog.vy = 0;
      dog.facing = dog.patrolDir;
    }

    const minDX = 20, maxDX = W - 20;
    const nextX = dog.x + dog.vx * dt;
    dog.y += dog.vy * dt;
    dog.x = Math.max(minDX, Math.min(maxDX, nextX));
    // Bounce patrol only when movement would cross the wall (avoids flip every frame in 50..W-50 vs clamp 20..W-20)
    if (!dog.aggro) {
      if (nextX < minDX && dog.patrolDir < 0) dog.patrolDir = 1;
      else if (nextX > maxDX && dog.patrolDir > 0) dog.patrolDir = -1;
    }

    // Collision with player
    if (distToPlayer < 30) {
      if (c.dashing) {
        // Scratch the dog!
        dog.alive = false;
        game.money += 1; // $1 per dog scratched
        spawnParticles(c.particles, dog.x, dog.y, 12, '#ff4444', 120);
        addFloat(dog.x, dog.y - c.cameraY - 30, 'SCRATCH! +$1', '#ff4');
        sfxDash();
      } else if (c.invincible <= 0) {
        // Get scraped — no blood, just sad emotes
        c.scrapes++;
        c.invincible = 1.5;
        sfxScrape();
        spawnParticles(c.particles, c.px, c.py, 6, '#ffcc44', 40);
        const sadEmotes = ['😿', '😢', '💔', '😣', '😰'];
        addFloat(c.px, c.py - c.cameraY - 40, sadEmotes[c.scrapes - 1] || '😿', '#fa0');
        addFloat(c.px + 15, c.py - c.cameraY - 55, 'Ow!', '#fa0');
        dog.stunTimer = 1;

        if (c.scrapes >= 5) {
          c.lost = true;
          sfxLose();
          return;
        }
      }
    }
  });

  // Camera
  c.cameraY = lerp(c.cameraY, c.py - H / 2, 5 * dt);
  c.cameraY = Math.max(0, Math.min(c.mapH - H, c.cameraY));

  // Check win (reached house)
  if (c.py < c.houseY + 60) {
    c.won = true;
    game.money += 8; // $8 for surviving the chase
    sfxWin();
    // Save cat to collection
    game.currentCat.stage = 3;
    game.cats.push(createCatInstance(currentCat.breed, currentCat));
  }

  updateParticles(c.particles, dt);
}

function drawChase() {
  const currentCat = getCurrentCat();
  const currentBreed = getCurrentBreedIndex();
  setBgMusicTheme('chase');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  const c = game.chase;
  const camY = c.cameraY;

  // Background - neighborhood
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#87CEEB');
  grad.addColorStop(1, '#6ab86a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Ground
  ctx.fillStyle = '#7ec87e';
  ctx.fillRect(0, 0, W, H);

  // Road
  ctx.fillStyle = '#999';
  ctx.fillRect(W / 2 - 60, -camY, 120, c.mapH);
  // Road dashes
  ctx.fillStyle = '#fff';
  for (let ry = 0; ry < c.mapH; ry += 60) {
    ctx.fillRect(W / 2 - 3, ry - camY, 6, 30);
  }

  // Sidewalks
  ctx.fillStyle = '#ccc';
  ctx.fillRect(W / 2 - 80, -camY, 20, c.mapH);
  ctx.fillRect(W / 2 + 60, -camY, 20, c.mapH);

  // Houses along the sides
  for (let hy = 200; hy < c.mapH; hy += 250) {
    drawNeighborhoodHouse(80, hy - camY, false);
    drawNeighborhoodHouse(W - 180, hy - camY, true);
  }

  // Player's house at top
  drawPlayerHouse(W / 2, c.houseY - camY);

  // Obstacles
  c.obstacles.forEach(obs => {
    const oy = obs.y - camY;
    if (oy > -50 && oy < H + 50) {
      if (obs.type === 'bush') {
        ctx.fillStyle = '#3a8a3a';
        drawEllipse(obs.x, oy, obs.w / 2, obs.h / 2);
        ctx.fill();
        ctx.fillStyle = '#4a9a4a';
        drawEllipse(obs.x + 5, oy - 3, obs.w / 2 * 0.7, obs.h / 2 * 0.8);
        ctx.fill();
      } else {
        ctx.fillStyle = '#c8a87a';
        ctx.fillRect(obs.x - obs.w / 2, oy - obs.h, obs.w, obs.h);
        ctx.strokeStyle = '#a08060';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x - obs.w / 2, oy - obs.h, obs.w, obs.h);
        // Fence posts
        ctx.fillStyle = '#a08060';
        ctx.fillRect(obs.x - obs.w / 2, oy - obs.h - 5, 4, obs.h + 5);
        ctx.fillRect(obs.x + obs.w / 2 - 4, oy - obs.h - 5, 4, obs.h + 5);
      }
    }
  });

  // Dogs
  c.dogs.forEach(dog => {
    if (!dog.alive) return;
    const dy = dog.y - camY;
    if (dy > -60 && dy < H + 60) {
      if (dog.stunTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(game.time * 20) * 0.3;
      }
      drawDog(dog.x, dy, dog.type, game.time, dog.facing);
      ctx.globalAlpha = 1;

      // Aggro indicator
      if (dog.aggro) {
        ctx.fillStyle = '#f44';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', dog.x, dy - 35);
      }
    }
  });

  // Player cat
  const playerScreenY = c.py - camY;
  if (c.invincible > 0 && !c.dashing) {
    ctx.globalAlpha = 0.5 + Math.sin(game.time * 15) * 0.3;
  }
  if (c.dashing) {
    // Dash glow
    ctx.fillStyle = 'rgba(255, 204, 68, 0.3)';
    ctx.beginPath();
    ctx.arc(c.px, playerScreenY, 35, 0, Math.PI * 2);
    ctx.fill();
  }
  const moving = true;
  const pFacing = c.vx < -5 ? -1 : c.vx > 5 ? 1 : 1;
  if (currentCat) drawCat(c.px, playerScreenY, currentBreed, 3, pFacing, game.time, moving, false, currentCat.equipped, currentCat.look);
  ctx.globalAlpha = 1;

  if (c.scratchFlash > 0) {
    ctx.globalAlpha = 0.35 + Math.sin(game.time * 40) * 0.15;
    ctx.strokeStyle = '#e17055';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c.px, playerScreenY, 32 + (0.28 - c.scratchFlash) * 45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Particles
  drawParticles(c.particles, 0, camY);

  // HUD
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  drawRoundRect(10, 10, 280, 60, 10);
  ctx.fill();

  // Timer
  const mins = Math.floor(c.timer / 60);
  const secs = Math.floor(c.timer % 60);
  ctx.fillStyle = c.timer < 30 ? '#f44' : '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${mins}:${secs.toString().padStart(2, '0')}`, 20, 38);

  // Scrapes (hearts)
  ctx.font = '20px sans-serif';
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < (5 - c.scrapes) ? '#f44' : '#555';
    ctx.fillText('❤️', 100 + i * 28, 40);
  }

  // Dash cooldown
  ctx.fillStyle = '#333';
  drawRoundRect(20, 52, 80, 10, 4);
  ctx.fill();
  const dashPct = Math.max(0, 1 - c.dashCooldown / 1.5);
  ctx.fillStyle = dashPct >= 1 ? '#ffcc44' : '#886';
  drawRoundRect(20, 52, 80 * dashPct, 10, 4);
  ctx.fill();
  ctx.fillStyle = '#aaa';
  ctx.font = '10px sans-serif';
  ctx.fillText(touchCtrl.isTouch ? 'DASH' : 'DASH [Space]', 22, 49);

  // Scratch button (circle — matches touch zone in input.js)
  const scReady = c.scratchCooldown <= 0;
  ctx.globalAlpha = scReady ? 0.38 : 0.14;
  ctx.fillStyle = scReady ? '#e17055' : '#666';
  ctx.beginPath();
  ctx.arc(CHASE_SCRATCH_CX, CHASE_SCRATCH_CY, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = scReady ? 0.92 : 0.45;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('😼', CHASE_SCRATCH_CX, CHASE_SCRATCH_CY - 4);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(scReady ? 'SCRATCH' : `${c.scratchCooldown.toFixed(1)}s`, CHASE_SCRATCH_CX, CHASE_SCRATCH_CY + 14);
  ctx.globalAlpha = 1;

  // Mini-map
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  drawRoundRect(W - 60, 10, 50, 120, 6);
  ctx.fill();
  // Map content
  const mapScale = 110 / c.mapH;
  // House
  ctx.fillStyle = '#4f4';
  ctx.fillRect(W - 38, 15 + c.houseY * mapScale, 8, 6);
  // Player
  ctx.fillStyle = '#ff0';
  ctx.fillRect(W - 37, 15 + c.py * mapScale - 2, 6, 4);
  // Dogs
  c.dogs.forEach(dog => {
    if (dog.alive) {
      ctx.fillStyle = '#f44';
      ctx.fillRect(W - 37, 15 + dog.y * mapScale - 1, 4, 2);
    }
  });
  // Camera view
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(W - 55, 15 + camY * mapScale, 40, H * mapScale);

  // Arrow pointing to house
  if (c.py > c.houseY + 200) {
    ctx.fillStyle = '#4f4';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏠 ↑', W / 2, 85);
  }

  // Controls hint
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  const chaseHint = touchCtrl.isTouch ? 'Steer  |  SCRATCH  |  DASH' : 'Steer  |  F Scratch  |  Space Dash';
  ctx.fillText(chaseHint, W / 2, H - 8);

  drawTouchControls();
  drawFloats();

  // Win/Lose overlay
  if (c.won || c.lost) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);

    if (c.won) {
      ctx.fillStyle = '#4f4';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('You Made It Home!', W / 2, H / 2 - 60);
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText(`${getCurrentCatName()} is safe! +$8`, W / 2, H / 2 - 15);
      drawButton(W / 2 - 100, H / 2 + 20, 200, 50, 'Get New Cat!', '#6c5ce7', true);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 100, H / 2 + 20, 200, 50)) {
        sfxClick();
        game.currentCat = null;
        game.screen = 'select';
      }
    } else {
      ctx.fillStyle = '#f44';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      if (c.timer <= 0) {
        ctx.fillText('Time\'s Up!', W / 2, H / 2 - 60);
      } else {
        ctx.fillText('Too Many Scrapes!', W / 2, H / 2 - 60);
      }
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText('The dogs got the best of you...', W / 2, H / 2 - 15);
      drawButton(W / 2 - 80, H / 2 + 20, 160, 50, 'Try Again', '#e17055', true);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 80, H / 2 + 20, 160, 50)) {
        sfxClick();
        if (game.currentCat) game.currentCat.stage = 3;
        initChase();
      }
      drawButton(W / 2 - 80, H / 2 + 85, 160, 40, 'Main Menu', '#636e72', true);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 80, H / 2 + 85, 160, 40)) {
        sfxClick();
        game.screen = 'title';
      }
    }
  }
}

function drawNeighborhoodHouse(x, y, flip) {
  if (y < -120 || y > H + 50) return;
  ctx.save();
  if (flip) ctx.translate(0, 0);

  // House body
  const colors = ['#e8d4b8', '#d4b8a0', '#c8a888', '#e0c8b0'];
  const roofColors = ['#b85450', '#7a6050', '#506078', '#808050'];
  const idx = Math.floor((x + y) * 0.01) % colors.length;

  ctx.fillStyle = colors[idx];
  ctx.fillRect(x, y - 60, 100, 70);

  // Roof
  ctx.fillStyle = roofColors[idx];
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 60);
  ctx.lineTo(x + 50, y - 100);
  ctx.lineTo(x + 110, y - 60);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = '#8B6914';
  drawRoundRect(x + 38, y - 30, 24, 40, 4);
  ctx.fill();

  // Window
  ctx.fillStyle = '#aaddff';
  ctx.fillRect(x + 12, y - 48, 20, 18);
  ctx.fillRect(x + 68, y - 48, 20, 18);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 12, y - 48, 20, 18);
  ctx.strokeRect(x + 68, y - 48, 20, 18);

  ctx.restore();
}

function drawPlayerHouse(x, y) {
  // Bigger, cozier house
  const hx = x - 60;
  const hy = y;

  // House body
  ctx.fillStyle = '#ffe8c8';
  ctx.fillRect(hx, hy - 50, 120, 60);
  ctx.strokeStyle = '#d4a060';
  ctx.lineWidth = 2;
  ctx.strokeRect(hx, hy - 50, 120, 60);

  // Roof
  ctx.fillStyle = '#e07050';
  ctx.beginPath();
  ctx.moveTo(hx - 15, hy - 50);
  ctx.lineTo(x, hy - 95);
  ctx.lineTo(hx + 135, hy - 50);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c05040';
  ctx.stroke();

  // Door (green, welcoming)
  ctx.fillStyle = '#5a9a5a';
  drawRoundRect(x - 14, hy - 35, 28, 45, 5);
  ctx.fill();
  ctx.strokeStyle = '#3a7a3a';
  ctx.lineWidth = 2;
  drawRoundRect(x - 14, hy - 35, 28, 45, 5);
  ctx.stroke();

  // Doorknob
  ctx.fillStyle = '#ffcc44';
  ctx.beginPath();
  ctx.arc(x + 8, hy - 12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#ffffaa';
  ctx.fillRect(hx + 10, hy - 42, 22, 20);
  ctx.fillRect(hx + 88, hy - 42, 22, 20);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(hx + 10, hy - 42, 22, 20);
  ctx.strokeRect(hx + 88, hy - 42, 22, 20);
  // Window cross
  ctx.beginPath();
  ctx.moveTo(hx + 21, hy - 42); ctx.lineTo(hx + 21, hy - 22);
  ctx.moveTo(hx + 10, hy - 32); ctx.lineTo(hx + 32, hy - 32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hx + 99, hy - 42); ctx.lineTo(hx + 99, hy - 22);
  ctx.moveTo(hx + 88, hy - 32); ctx.lineTo(hx + 110, hy - 32);
  ctx.stroke();

  // "HOME" sign
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏠 HOME', x, hy - 55);

  // Welcome mat
  ctx.fillStyle = '#c8a060';
  drawRoundRect(x - 18, hy + 8, 36, 10, 3);
  ctx.fill();
}
