// screens/walk.js — Walk/gather screen (init, update, draw)
// Depends on: maze.js, game state, drawing utils, drawCat, drawDog, sfx

const WALK_SCRATCH_BTN_X = 10, WALK_SCRATCH_BTN_Y = H - 50, WALK_SCRATCH_BTN_W = 120, WALK_SCRATCH_BTN_H = 44;
const WALK_SCRATCH_RANGE = 74;
const WALK_SCRATCH_COOLDOWN = 1.45;

function initWalk(destId) {
  const w = game.walk;
  w.destId = destId || null;
  const currentStage = getCurrentStage();
  w.distWalked = 0;
  w.gathered = 0;
  w.walkCounted = false;
  w.caught = false;
  w.caughtTimer = 0;
  w.hits = 0;
  w.companion = null;
  w.companionX = 0; w.companionY = 0;

  // If player has adult cats, show companion selection
  const adultCats = game.cats.filter(c => c.stage === 3);
  if (adultCats.length > 0 && currentStage > 0) {
    w.choosingCompanion = true;
  } else {
    w.choosingCompanion = false;
  }

  // Maze complexity scales with growth stage
  // Baby: no maze (open park), Kitten: easy 5x4, Teen: medium 7x5, Adult: hard 9x7
  const stage = currentStage;
  if (stage === 0) {
    // Baby: no maze, just open park
    w.maze = null;
    w.mazeW = 0; w.mazeH = 0; w.cellSize = 0;
    w.dogs = [];
  } else {
    const mazeSizes = [null, [5, 4], [7, 5], [9, 7]];
    const [mc, mr] = mazeSizes[stage];
    const cs = Math.min(Math.floor((W - 40) / mc), Math.floor((H - 100) / mr));
    w.cellSize = cs;
    w.mazeW = mc; w.mazeH = mr;
    const ox = Math.floor((W - mc * cs) / 2);
    const oy = Math.floor((H - mr * cs) / 2) + 10;
    w.mazeOX = ox; w.mazeOY = oy;
    w.maze = generateMaze(mc, mr);
    w.walls = getMazeWalls(w.maze, mc, mr, cs, ox, oy);

    // Place cat in top-left cell center
    w.px = ox + cs / 2;
    w.py = oy + cs / 2;

    // Dogs: 1 for kitten, 2 for teen, 3 for adult
    const dogCount = stage;
    w.dogs = [];
    for (let i = 0; i < dogCount; i++) {
      // Place in bottom-right area
      const dc = mc - 1 - (i % 2);
      const dr = mr - 1 - Math.floor(i / 2);
      w.dogs.push({
        x: ox + dc * cs + cs / 2,
        y: oy + dr * cs + cs / 2,
        vx: 0, vy: 0,
        facing: -1,
        speed: 55 + stage * 15,
        dir: Math.floor(Math.random() * 4), // 0=up 1=right 2=down 3=left
        changeTimer: 1 + Math.random() * 2,
        type: i % 3,
      });
    }
  }

  if (!w.maze) {
    // Open park - place cat in center
    w.px = 400; w.py = 300;
    w.dogs = [];
  }

  w.targetX = w.px;
  w.targetY = w.py;
  w.autoWalkTimer = 0;
  w.scratchCooldown = 0;
  w.scratchFlash = 0;

  // Critters to chase (if you're lucky!)
  w.critters = [];
  const critterCount = stage === 0 ? 4 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3);
  const critterKinds = ['bird', 'bug', 'bunny', 'lizard'];
  const critterSpawnW = w.maze ? w.mazeW * (w.cellSize || 60) : W;
  const critterSpawnH = w.maze ? w.mazeH * (w.cellSize || 60) : H;
  const critterOX = w.maze ? (w.mazeOX || 0) : 0;
  const critterOY = w.maze ? (w.mazeOY || 0) : 0;
  for (let ci = 0; ci < critterCount; ci++) {
    const kind = critterKinds[Math.floor(Math.random() * critterKinds.length)];
    w.critters.push({
      x: critterOX + 30 + Math.random() * (critterSpawnW - 60),
      y: critterOY + 30 + Math.random() * (critterSpawnH - 60),
      kind,
      hp: CRITTER_HP[kind],
      maxHp: CRITTER_HP[kind],
      caught: false,
      vx: 0, vy: 0,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Scatter collectible items
  w.items = [];
  const itemCount = stage === 0 ? 12 : (w.mazeW * w.mazeH > 20 ? 10 : 8);
  if (w.maze) {
    // Place items in maze cells
    const ox = w.mazeOX, oy = w.mazeOY, cs = w.cellSize;
    const cells = [];
    for (let r = 0; r < w.mazeH; r++)
      for (let c = 0; c < w.mazeW; c++)
        cells.push({ r, c });
    // Shuffle
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    for (let i = 0; i < Math.min(itemCount, cells.length); i++) {
      const cell = cells[i];
      w.items.push({
        x: ox + cell.c * cs + cs * 0.2 + Math.random() * cs * 0.6,
        y: oy + cell.r * cs + cs * 0.2 + Math.random() * cs * 0.6,
        type: Math.floor(Math.random() * 4),
        collected: false,
        bob: Math.random() * Math.PI * 2
      });
    }
  } else {
    for (let i = 0; i < itemCount; i++) {
      w.items.push({
        x: 60 + Math.random() * 680,
        y: 80 + Math.random() * 440,
        type: Math.floor(Math.random() * 4),
        collected: false,
        bob: Math.random() * Math.PI * 2
      });
    }
  }

  // Wandering cats for Sunny Park
  w.wanderCats = [];
  if (w.destId === 'park') {
    for (let i = 0; i < 3; i++) {
      const stage = Math.floor(Math.random() * 2) + 1;
      w.wanderCats.push({
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 400,
        targetX: 0, targetY: 0,
        facing: Math.random() > 0.5 ? 1 : -1,
        state: 'idle',
        timer: 2 + Math.random() * 4,
        breed: Math.floor(Math.random() * CAT_BREEDS.length),
        stage: stage,
      });
    }
  }
}

function updateWalk(dt) {
  const w = game.walk;

  // Caught animation
  if (w.caught) {
    w.caughtTimer -= dt;
    if (w.caughtTimer <= 0) {
      game.screen = 'care';
    }
    return;
  }

  const moodBonus = 1.0 + getPawMood() * 0.3;
  const speed = 150 * moodBonus;
  const catRad = 10;

  w.scratchCooldown = Math.max(0, w.scratchCooldown - dt);
  if (w.scratchFlash > 0) w.scratchFlash -= dt;

  // Pointer-driven move: only glide while finger/mouse is held (not click-to-run)
  const homeHit = hitBox(mouse.x, mouse.y, W - 130, 10, 120, 35);
  const scratchBtnHit = w.dogs.length > 0 && hitBox(mouse.x, mouse.y, WALK_SCRATCH_BTN_X, WALK_SCRATCH_BTN_Y, WALK_SCRATCH_BTN_W, WALK_SCRATCH_BTN_H);
  if (mouse.clicked && !homeHit && !scratchBtnHit) {
    w.targetX = mouse.x;
    w.targetY = mouse.y;
  }
  if (mouse.down && !homeHit && !scratchBtnHit) {
    if (touchCtrl.isTouch) {
      if (touchCtrl.uiId !== null) {
        w.targetX = mouse.x;
        w.targetY = mouse.y;
      }
    } else {
      w.targetX = mouse.x;
      w.targetY = mouse.y;
    }
  }

  // Active pointer = held mouse (desktop) or steering touch; pause over Go Home / Scratch
  const pointerMovesCat = mouse.down && (!touchCtrl.isTouch || touchCtrl.uiId !== null) && !homeHit && !scratchBtnHit;

  // Keyboard overrides target
  let kbDx = 0, kbDy = 0;
  if (keys['ArrowLeft'] || keys['KeyA']) kbDx -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) kbDx += 1;
  if (keys['ArrowUp'] || keys['KeyW']) kbDy -= 1;
  if (keys['ArrowDown'] || keys['KeyS']) kbDy += 1;
  if (kbDx || kbDy) {
    const mag = Math.sqrt(kbDx * kbDx + kbDy * kbDy);
    w.px += (kbDx / mag) * speed * dt;
    w.py += (kbDy / mag) * speed * dt;
    w.distWalked += speed * dt;
    w.targetX = w.px;
    w.targetY = w.py;
  } else {
    // Move toward target only while user is holding the pointer down
    const tdx = w.targetX - w.px;
    const tdy = w.targetY - w.py;
    const tdist = Math.hypot(tdx, tdy);
    if (tdist > 5 && pointerMovesCat) {
      w.px += (tdx / tdist) * speed * dt;
      w.py += (tdy / tdist) * speed * dt;
      w.distWalked += speed * dt;
    }
  }

  // Wall collisions for cat
  if (w.maze && w.walls) {
    const res = resolveWallCollisions(w.px, w.py, catRad, w.walls);
    w.px = res.x; w.py = res.y;
  }
  // Screen bounds
  w.px = Math.max(15, Math.min(W - 15, w.px));
  w.py = Math.max(55, Math.min(H - 15, w.py));

  // Defensive scratch — stun nearby dogs
  const scratchKeys = keys['KeyF'] || keys['KeyE'];
  const scratchClick = mouse.clicked && scratchBtnHit;
  if (!w.caught && w.scratchCooldown <= 0 && w.dogs.length > 0 && (scratchKeys || scratchClick)) {
    const partArr = game.chase.particles.length ? game.chase.particles : (w._particles || (w._particles = []));
    let hitAny = false;
    w.dogs.forEach(dog => {
      const d = Math.hypot(dog.x - w.px, dog.y - w.py);
      if (d < WALK_SCRATCH_RANGE) {
        hitAny = true;
        dog.stunTimer = 2.6;
        const nx = d < 1e-3 ? 1 : (dog.x - w.px) / d;
        const ny = d < 1e-3 ? 0 : (dog.y - w.py) / d;
        dog.x += nx * 38;
        dog.y += ny * 38;
        spawnParticles(partArr, dog.x, dog.y, 8, '#ffcc44', 55);
      }
    });
    w.scratchCooldown = WALK_SCRATCH_COOLDOWN;
    w.scratchFlash = 0.28;
    sfxScrape();
    addFloat(w.px, w.py - 42, hitAny ? '💅 Scratch!' : '💅 Swipe!', hitAny ? '#fa0' : '#88a');
  }

  // Dog AI and movement
  w.dogs.forEach(dog => {
    if ((dog.stunTimer || 0) > 0) {
      dog.stunTimer -= dt;
      if (dog.stunTimer > 0) return;
      dog.stunTimer = 0;
    }

    dog.changeTimer -= dt;
    if (dog.changeTimer <= 0) {
      dog.changeTimer = 1.5 + Math.random() * 2;
      // Chase player with some randomness
      const toPx = w.px - dog.x, toPy = w.py - dog.y;
      if (Math.random() < 0.6) {
        // Move toward player (prefer axis with bigger distance)
        if (Math.abs(toPx) > Math.abs(toPy)) {
          dog.dir = toPx > 0 ? 1 : 3;
        } else {
          dog.dir = toPy > 0 ? 2 : 0;
        }
      } else {
        dog.dir = Math.floor(Math.random() * 4);
      }
    }

    const dirs = [[0,-1],[1,0],[0,1],[-1,0]];
    const [ddx, ddy] = dirs[dog.dir];
    dog.x += ddx * dog.speed * dt;
    dog.y += ddy * dog.speed * dt;
    dog.facing = ddx !== 0 ? ddx : dog.facing;

    // Dog wall collisions
    if (w.maze && w.walls) {
      const res = resolveWallCollisions(dog.x, dog.y, 8, w.walls);
      // If dog got pushed, it hit a wall — change direction
      if (Math.abs(res.x - dog.x) > 0.5 || Math.abs(res.y - dog.y) > 0.5) {
        dog.changeTimer = 0; // force direction change next frame
      }
      dog.x = res.x; dog.y = res.y;
    }
    dog.x = Math.max(15, Math.min(W - 15, dog.x));
    dog.y = Math.max(55, Math.min(H - 15, dog.y));

    // Check catch — companion can protect
    const distToPlayer = Math.hypot(dog.x - w.px, dog.y - w.py);
    const distToCompanion = w.companion ? Math.hypot(dog.x - w.companionX, dog.y - w.companionY) : 999;

    // Companion attacks nearby dogs
    if (w.companion && distToCompanion < 35) {
      dog.stunTimer = 3;
      dog.x += (dog.x - w.companionX) * 0.5;
      dog.y += (dog.y - w.companionY) * 0.5;
      spawnParticles(game.chase.particles.length ? game.chase.particles : (w._particles || (w._particles = [])), dog.x, dog.y, 6, '#ffcc44', 50);
      addFloat(dog.x, dog.y - 20, '😼 Protected!', '#fa0');
      sfxDash();
      return;
    }

    if (distToPlayer < 22 && !w.caught) {
      w.hits++;
      sfxScrape();
      const sadEmotes = ['😿', '😢', '💔'];
      addFloat(w.px, w.py - 40, sadEmotes[w.hits - 1] || '😿', '#fa0');
      addFloat(w.px + 15, w.py - 55, `Hit ${w.hits}/3`, '#f88');
      dog.stunTimer = 2;
      // Push dog away
      dog.x += (dog.x - w.px) * 0.8;
      dog.y += (dog.y - w.py) * 0.8;

      if (w.hits >= 3) {
        w.caught = true;
        w.caughtTimer = 2.5;
        game.care = { feed: 0, play: 0, brush: 0, water: 0, walk: 0, gather: 0 };
        sfxLose();
        addFloat(w.px, w.py - 70, 'CAUGHT! Paw meter reset!', '#f44');
      }
    }
  });

  // Move companion — follows player
  if (w.companion) {
    const cdx = w.px - 25 - w.companionX;
    const cdy = w.py - w.companionY;
    const cDist = Math.hypot(cdx, cdy);
    if (cDist > 30) {
      const cSpd = 160;
      w.companionX += (cdx / cDist) * cSpd * dt;
      w.companionY += (cdy / cDist) * cSpd * dt;
    }
    // Companion wall collisions
    if (w.maze && w.walls) {
      const res = resolveWallCollisions(w.companionX, w.companionY, 8, w.walls);
      w.companionX = res.x; w.companionY = res.y;
    }
    w.companionX = Math.max(15, Math.min(W - 15, w.companionX));
    w.companionY = Math.max(55, Math.min(H - 15, w.companionY));
  }

  // Critter AI — flee from player
  w.critters.forEach(c => {
    if (c.caught) return;
    c.phase += dt * 8;
    const cdx = c.x - w.px;
    const cdy = c.y - w.py;
    const cDist = Math.hypot(cdx, cdy) || 1;
    const fleeRange = c.kind === 'lizard' ? 200 : c.kind === 'bunny' ? 160 : 130;
    const fleeStr = c.kind === 'lizard' ? 240 : c.kind === 'bunny' ? 200 : 180;
    if (cDist < fleeRange) {
      const flee = fleeStr * (1 - cDist / fleeRange);
      c.vx += (cdx / cDist) * flee * dt;
      c.vy += (cdy / cDist) * flee * dt;
    }
    const caps = { bird: 160, bug: 130, bunny: 150, lizard: 190 };
    const cap = caps[c.kind] || 130;
    const vm = Math.hypot(c.vx, c.vy);
    if (vm > cap) { c.vx = (c.vx / vm) * cap; c.vy = (c.vy / vm) * cap; }
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.vx *= 0.97;
    c.vy *= 0.97;
    // Bounds
    const minX = (w.maze ? (w.mazeOX || 0) : 0) + 10;
    const maxX = (w.maze ? (w.mazeOX || 0) + (w.mazeW || 0) * (w.cellSize || W) : W) - 10;
    const minY = (w.maze ? (w.mazeOY || 0) : 0) + 10;
    const maxY = (w.maze ? (w.mazeOY || 0) + (w.mazeH || 0) * (w.cellSize || H) : H) - 10;
    if (c.x < minX || c.x > maxX) c.vx *= -0.8;
    if (c.y < minY || c.y > maxY) c.vy *= -0.8;
    c.x = Math.max(minX, Math.min(maxX, c.x));
    c.y = Math.max(minY, Math.min(maxY, c.y));
    // Catch
    if (Math.hypot(c.x - w.px, c.y - w.py) < 22) {
      c.caught = true;
      sfxGather();
      const reward = c.kind === 'bunny' ? 3 : c.kind === 'lizard' ? 2 : 1;
      game.money += reward;
      addFloat(c.x, c.y - 30, `🐾 Caught ${c.kind}! +$${reward}`, '#f8d');
    }
  });

  // Check item collection
  w.items.forEach(item => {
    if (!item.collected) {
      const dist = Math.hypot(item.x - w.px, item.y - w.py);
      if (dist < 20) {
        item.collected = true;
        w.gathered++;
        game.money += 1;
        sfxGather();
        addFloat(item.x, item.y - 20, '+1 Gather! +$1', '#f8d');
        if (game.care.gather < MAX_PER_ACTIVITY) {
          game.care.gather++;
          if (game.care.gather >= MAX_PER_ACTIVITY) setTimeout(() => sfxComplete(), 100);
        }
      }
    }
  });

  if (w.distWalked > 300 && !w.walkCounted) {
    w.walkCounted = true;
    game.money += 1;
    if (game.care.walk < MAX_PER_ACTIVITY) {
      game.care.walk++;
      addFloat(w.px, w.py - 60, '+1 Walk! +$1', '#8d6');
      if (game.care.walk >= MAX_PER_ACTIVITY) setTimeout(() => sfxComplete(), 100);
    }
  }

  // Wandering cats AI (Sunny Park)
  w.wanderCats.forEach(cat => {
    cat.timer -= dt;
    if (cat.state === 'walking') {
      const dx = cat.targetX - cat.x;
      const dy = cat.targetY - cat.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 5) {
        cat.x = cat.targetX; cat.y = cat.targetY;
        cat.state = 'idle';
        cat.timer = 3 + Math.random() * 5;
      } else {
        const spd = 35;
        cat.x += (dx / dist) * spd * dt;
        cat.y += (dy / dist) * spd * dt;
        cat.facing = dx > 0 ? 1 : -1;
      }
    } else if (cat.timer <= 0) {
      cat.targetX = 80 + Math.random() * (W - 160);
      cat.targetY = 100 + Math.random() * (H - 200);
      cat.state = 'walking';
      cat.timer = 8 + Math.random() * 4;
    }
  });
}

function drawPineTree(x, y, size) {
  const trunkH = size * 0.35;
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(x - size * 0.06, y - trunkH, size * 0.12, trunkH);
  for (let i = 0; i < 3; i++) {
    const ly = y - trunkH - i * size * 0.2;
    const lw = size * (0.35 - i * 0.08);
    ctx.fillStyle = ['#1a4a1a', '#2a5a2a', '#3a6a3a'][i];
    ctx.beginPath();
    ctx.moveTo(x, ly - size * 0.22);
    ctx.lineTo(x - lw, ly);
    ctx.lineTo(x + lw, ly);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWalk() {
  const currentCat = getCurrentCat();
  const currentStage = getCurrentStage();
  setBgMusicTheme('walk');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  const w = game.walk;

  // Companion selection overlay
  if (w.choosingCompanion) {
    ctx.fillStyle = '#2d1b69';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffcc44';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bring a Companion?', W / 2, 60);
    ctx.fillStyle = '#ddb8ff';
    ctx.font = '14px sans-serif';
    ctx.fillText('An adult cat can protect you from dogs!', W / 2, 85);

    const adultCats = game.cats.filter(c => c.stage === 3);
    const cols = Math.min(adultCats.length, 4);
    const cw = 130, ch = 130, gap = 12;
    const sx = (W - cols * cw - (cols - 1) * gap) / 2;
    adultCats.forEach((cat, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const cx = sx + col * (cw + gap);
      const cy = 110 + row * (ch + gap);
      const hover = hitBox(mouse.x, mouse.y, cx, cy, cw, ch);
      ctx.fillStyle = hover ? 'rgba(100,255,100,0.2)' : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = hover ? '#6c6' : '#444';
      ctx.lineWidth = 2;
      drawRoundRect(cx, cy, cw, ch, 10); ctx.fill(); ctx.stroke();
      drawCat(cx + cw/2, cy + ch/2 - 8, cat.breed, 3, 1, game.time + i, false, false, cat.equipped, cat.look);
      ctx.fillStyle = '#ddd'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(cat.name || CAT_BREEDS[cat.breed].name, cx + cw/2, cy + ch - 12);
      if (mouse.clicked && hover) {
        sfxMeow();
        w.companion = cat;
        w.companionX = w.px - 30;
        w.companionY = w.py;
        w.choosingCompanion = false;
      }
    });

    // "Go Alone" button
    drawButton(W / 2 - 70, H - 60, 140, 40, 'Go Alone', '#636e72', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 70, H - 60, 140, 40)) {
      sfxClick();
      w.choosingCompanion = false;
    }
    return;
  }

  drawGrassBg();

  // Location-specific background decorations
  if (w.destId === 'park') {
    ctx.fillStyle = 'rgba(255, 255, 200, 0.12)';
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createRadialGradient(650, 60, 10, 650, 60, 120);
    grad.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(500, 0, 300, 200);
    const parkFlowerColors = ['#ff6b8a', '#ffb347', '#ff69b4', '#dda0dd', '#ffd700', '#ff4081', '#ff8c69', '#ff7f50'];
    for (let i = 0; i < 40; i++) {
      const fx = (i * 79 + 31) % (W - 10) + 5;
      const fy = (i * 57 + 23) % (H - 10) + 5;
      const fc = parkFlowerColors[i % parkFlowerColors.length];
      ctx.fillStyle = fc;
      drawEllipse(fx, fy, 3 + (i % 3), 2 + (i % 2));
      ctx.fill();
      ctx.fillStyle = '#ffeb3b';
      drawEllipse(fx, fy, 1.2, 1);
      ctx.fill();
    }
  }

  if (w.maze) {
    // Draw maze
    const ox = w.mazeOX, oy = w.mazeOY, cs = w.cellSize;

    // Maze floor
    ctx.fillStyle = w.destId === 'woods' ? '#8a7a5a' : '#d4b896';
    ctx.fillRect(ox, oy, w.mazeW * cs, w.mazeH * cs);

    // Cell floors (subtle checker / pine needles)
    for (let r = 0; r < w.mazeH; r++) {
      for (let c = 0; c < w.mazeW; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = w.destId === 'woods' ? 'rgba(30,20,10,0.07)' : 'rgba(0,0,0,0.03)';
          ctx.fillRect(ox + c * cs, oy + r * cs, cs, cs);
        }
        if (w.destId === 'woods' && (r * w.mazeW + c) % 5 === 0) {
          ctx.fillStyle = 'rgba(60,50,30,0.1)';
          ctx.beginPath();
          ctx.ellipse(ox + c * cs + cs * 0.3 + Math.random() * cs * 0.4, oy + r * cs + cs * 0.7, 2, 4, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Maze walls
    ctx.strokeStyle = w.destId === 'woods' ? '#4a3a2a' : '#6a4a2a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    w.walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();
    });

    // Hedge / pine tops on walls
    ctx.strokeStyle = w.destId === 'woods' ? '#2a5a2a' : '#4a7a3a';
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.5;
    w.walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1 - 1);
      ctx.lineTo(wall.x2, wall.y2 - 1);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Pine trees around maze for Pine Trail
    if (w.destId === 'woods') {
      for (let i = 0; i < 10; i++) {
        const side = i % 4;
        let tx, ty;
        const tSize = 22 + (i % 3) * 10;
        if (side === 0) { tx = ox - 20; ty = oy + 20 + i * (w.mazeH * cs - 40) / 3; }
        else if (side === 1) { tx = ox + w.mazeW * cs + 20; ty = oy + 20 + (i - 1) * (w.mazeH * cs - 40) / 2; }
        else if (side === 2) { tx = ox + 30 + (i - 2) * (w.mazeW * cs - 60) / 3; ty = oy - 22; }
        else { tx = ox + 30 + (i - 3) * (w.mazeW * cs - 60) / 2; ty = oy + w.mazeH * cs + 22; }
        if (tx > ox && tx < ox + w.mazeW * cs && ty > oy && ty < oy + w.mazeH * cs) continue;
        drawPineTree(tx, ty, tSize);
      }
    }
  } else {
    // Baby: open park with path and trees
    ctx.fillStyle = '#5a5';
    for (let i = 0; i < 6; i++) {
      const tx = (i * 137 + 50) % (W - 40) + 20;
      const ty = (i * 93 + 30) % (H - 120) + 80;
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(tx - 4, ty, 8, 20);
      ctx.fillStyle = '#3a8a3a';
      drawEllipse(tx, ty - 5, 18, 20); ctx.fill();
      ctx.fillStyle = '#4a9a4a';
      drawEllipse(tx - 5, ty, 14, 15); ctx.fill();
      drawEllipse(tx + 8, ty - 2, 12, 14); ctx.fill();
    }
    ctx.fillStyle = '#d4b896';
    ctx.beginPath();
    ctx.moveTo(0, 350); ctx.quadraticCurveTo(200, 300, 400, 340);
    ctx.quadraticCurveTo(600, 380, 800, 320);
    ctx.lineTo(800, 380); ctx.quadraticCurveTo(600, 430, 400, 390);
    ctx.quadraticCurveTo(200, 350, 0, 400); ctx.closePath(); ctx.fill();

    // Extra flowers for Sunny Park
    if (w.destId === 'park') {
      const sfColors = ['#ff6b8a', '#ffb347', '#ff69b4', '#dda0dd', '#ffd700', '#ff4081'];
      for (let i = 0; i < 25; i++) {
        const fx = (i * 67 + 41) % (W - 20) + 10;
        const fy = (i * 53 + 19) % (H - 40) + 20;
        const pathY = 320 + Math.sin(fx * 0.008) * 40;
        if (Math.abs(fy - pathY) < 25) continue;
        const fc = sfColors[i % sfColors.length];
        ctx.fillStyle = fc;
        drawEllipse(fx, fy, 4 + (i % 3), 3 + (i % 2));
        ctx.fill();
        ctx.fillStyle = '#ffeb3b';
        drawEllipse(fx, fy, 1.5, 1.2);
        ctx.fill();
      }
    }
  }

  // Draw critters
  w.critters.forEach(c => {
    if (c.caught) return;
    const cFace = c.vx >= 0 ? 1 : -1;
    drawCritterSprite(c.x, c.y, c.kind, c.phase, cFace);
  });

  // Draw collectible items
  const itemIcons = w.destId === 'woods' ? ['🌲', '🍂', '🪵', '🌰'] : ['🌸', '🪶', '🍃', '🐚'];
  w.items.forEach(item => {
    if (!item.collected) {
      const bob = Math.sin(item.bob) * 2.5;
      ctx.fillStyle = 'rgba(255,255,200,0.42)';
      ctx.beginPath();
      ctx.arc(item.x, item.y + bob, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(itemIcons[item.type], item.x, item.y + bob + 6);
    }
  });

  // Draw dogs
  w.dogs.forEach(dog => {
    drawDog(dog.x, dog.y, dog.type, game.time, dog.facing);
  });

  // Draw companion cat
  if (w.companion) {
    const cFacing = w.companionX < w.px ? 1 : -1;
    drawCat(w.companionX, w.companionY, w.companion.breed, 3, cFacing, game.time, true, false, w.companion.equipped, w.companion.look);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(w.companion.name || CAT_BREEDS[w.companion.breed].name, w.companionX, w.companionY + 25);
  }

  // Draw wandering cats (Sunny Park)
  if (w.destId === 'park' && w.wanderCats) {
    w.wanderCats.forEach(cat => {
      const catMoving = cat.state === 'walking';
      drawCat(cat.x, cat.y, cat.breed, cat.stage, cat.facing, game.time, catMoving, false);
    });
  }

  // Draw player cat
  const toTarget = Math.hypot(w.targetX - w.px, w.targetY - w.py);
  const homeHitDraw = hitBox(mouse.x, mouse.y, W - 130, 10, 120, 35);
  const scratchHitDraw = w.dogs.length > 0 && hitBox(mouse.x, mouse.y, WALK_SCRATCH_BTN_X, WALK_SCRATCH_BTN_Y, WALK_SCRATCH_BTN_W, WALK_SCRATCH_BTN_H);
  const pointerHeld = mouse.down && (!touchCtrl.isTouch || touchCtrl.uiId !== null) && !homeHitDraw && !scratchHitDraw;
  const kbMoving = keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'] || keys['KeyA'] || keys['KeyD'] || keys['KeyW'] || keys['KeyS'];
  const moving = kbMoving || (toTarget > 5 && pointerHeld);
  const facing = (w.targetX < w.px) ? -1 : 1;

  if (w.caught) {
    // Caught animation — flash red
    ctx.globalAlpha = 0.5 + Math.sin(game.time * 15) * 0.3;
    if (currentCat) drawCat(w.px, w.py, currentCat.breed, currentCat.stage, facing, game.time, false, false, currentCat.equipped, currentCat.look);
    ctx.globalAlpha = 1;
    // Big warning text
    ctx.fillStyle = '#f44';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', W / 2, H / 2 - 40);
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Paw meter reset to 0...', W / 2, H / 2);
  } else {
    if (currentCat) drawCat(w.px, w.py, currentCat.breed, currentCat.stage, facing, game.time, moving, false, currentCat.equipped, currentCat.look);
  }

  if (w.scratchFlash > 0 && !w.caught) {
    ctx.globalAlpha = 0.35 + Math.sin(game.time * 40) * 0.15;
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w.px, w.py, 28 + (0.28 - w.scratchFlash) * 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // HUD
  if (w.destId === 'park' && !w.maze) {
    ctx.fillStyle = 'rgba(255, 200, 50, 0.45)';
    drawRoundRect(10, 10, 320, 40, 8);
  } else if (w.destId === 'woods') {
    ctx.fillStyle = 'rgba(30, 50, 20, 0.55)';
    drawRoundRect(10, 10, 320, 40, 8);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    drawRoundRect(10, 10, 260, 40, 8);
  }
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Walk: ${game.care.walk}/${MAX_PER_ACTIVITY}   Gather: ${game.care.gather}/${MAX_PER_ACTIVITY}`, 20, 35);
  // Hit counter
  if (w.dogs.length > 0 && !w.caught) {
    ctx.font = '16px sans-serif';
    for (let hi = 0; hi < 3; hi++) {
      ctx.fillText(hi < (3 - w.hits) ? '💛' : '🖤', 200 + hi * 22, 36);
    }
    if (w.companion) {
      ctx.fillStyle = '#fda'; ctx.font = '11px sans-serif';
      ctx.fillText(`🛡️ ${CAT_BREEDS[w.companion.breed].name}`, 280, 36);
    }
  }

  // Stage difficulty label
  if (w.maze) {
    const diffLabels = ['', 'Easy Maze', 'Medium Maze', 'Hard Maze'];
    const locLabel = w.destId === 'woods' ? '🌲 Pine Trail' : '';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${locLabel} ${diffLabels[currentStage]}  |  🐕 ${w.dogs.length} dog${w.dogs.length !== 1 ? 's' : ''}`, W / 2, 25);
  }

  // Scratch button (when dogs are present)
  if (w.dogs.length > 0 && !w.caught) {
    const ready = w.scratchCooldown <= 0;
    const lbl = ready ? '😼 Scratch' : `${w.scratchCooldown.toFixed(1)}s`;
    drawButton(WALK_SCRATCH_BTN_X, WALK_SCRATCH_BTN_Y, WALK_SCRATCH_BTN_W, WALK_SCRATCH_BTN_H, lbl, ready ? '#e17055' : '#95a5a6', ready);
  }

  // Warning about dogs
  if (w.dogs.length > 0 && !w.caught) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Watch out for dogs! Scratch (F) to push them back. If caught, paw meter resets!', W / 2, H - 10);
  } else if (!w.caught) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    const moveHint = touchCtrl.isTouch ? 'Hold & drag to move' : 'Hold click or Arrow keys to move';
    const critterCount = w.critters.filter(c => !c.caught).length;
    if (w.destId === 'park') {
      const catCount = w.wanderCats ? w.wanderCats.length : 0;
      ctx.fillText(`☀️ Sunny Park — Flowers bloom, cats roam!  ${moveHint}  |  🌿 ${critterCount} critters`, W / 2, H - 10);
    } else if (w.destId === 'woods') {
      ctx.fillText(`🌲 Pine Trail — Watch for pinecones underfoot!  ${moveHint}  |  🌿 ${critterCount} critters`, W / 2, H - 10);
    } else if (critterCount > 0) {
      ctx.fillText(`${moveHint}  |  Collect sparkly items!  |  🌿 ${critterCount} critters nearby — chase them!`, W / 2, H - 10);
    } else {
      ctx.fillText(`${moveHint}  |  Collect sparkly items!`, W / 2, H - 10);
    }
  }

  // Return button (not during caught animation)
  if (!w.caught) {
    drawButton(W - 130, 10, 120, 35, 'Go Home', '#e17055', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, W - 130, 10, 120, 35)) {
      sfxClick();
      game.screen = 'care';
      checkGrowth();
    }
  }

  // Draw target indicator only while pointer is held (matches movement rules)
  if (!w.caught && toTarget > 5 && pointerHeld) {
    ctx.globalAlpha = 0.3 + Math.sin(game.time * 6) * 0.15;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w.targetX, w.targetY, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  drawFloats();
}
