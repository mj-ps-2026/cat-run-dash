// screens/care.js — Care hub screen (update + draw), checkGrowth, buyItem
// Depends on: catai.js, furniture.js, game state, drawing utils, sfx

function updateCare(dt) {
  setBgMusicTheme('care');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();

  if (game.careAnim) {
    game.careAnim.timer -= dt;
    if (game.careAnim.timer <= 0) {
      game.careAnim = null;
    }
  }

  // Night mode — every 5 minutes for 30 seconds
  game.nightTimer += dt;
  if (!game.isNight && game.nightTimer >= 300) {
    game.isNight = true;
    game.nightDuration = 30;
    game.nightTimer = 0;
  }
  if (game.isNight) {
    game.nightDuration -= dt;
    if (game.nightDuration <= 0) {
      game.isNight = false;
      game.nightDuration = 0;
    }
  }

  // During night, send cats to sleep spots (or sleep in place)
  if (game.isNight) {
    const ai = game.catAI;
    if (ai.state !== 'sleeping' && ai.state !== 'walking') {
      const spot = getRandomSleepSpot();
      if (spot) {
        ai.targetX = spot.x;
        ai.targetY = Math.min(spot.y, H * 0.63);
        ai._queuedBehavior = 'sleeping';
        ai.state = 'walking';
        ai.stateTimer = 99;
        ai.nextStateTimer = 35;
      } else {
        ai.state = 'sleeping';
        ai.stateTimer = 30;
        ai.nextStateTimer = 30;
      }
    }
  }

  // Horizontal scroll through home (care)
  if (game.screen === 'care') {
    const maxS = Math.max(0, HOME_TOTAL_W - W);
    if (keys['ArrowLeft']) game.homeScrollX = Math.max(0, (game.homeScrollX || 0) - 280 * dt);
    if (keys['ArrowRight']) game.homeScrollX = Math.min(maxS, (game.homeScrollX || 0) + 280 * dt);
  }

  // Litter scrub: drag inside tray surface to reduce dirt (clumps follow dirt)
  if (game.screen === 'care' && game.furniture.includes('litterbox')) {
    const d0 = game.litterboxDirt || 0;
    const sx = game.homeScrollX || 0;
    const wx = mouse.x + sx;
    const my = mouse.y;
    const lp = getFurnitureXY('litterbox');
    const tx = lp.x - 22, ty = lp.y - 4, tw = 44, th = 26;
    const inTray = wx >= tx && wx <= tx + tw && my >= ty && my <= ty + th;
    if (d0 > 0.02 && inTray && mouse.down && !game.dragging && !game.laserActive && !game.throwGrab && !game.careMode) {
      if (!game.litterScrub) game.litterScrub = { lx: wx, ly: my };
      else {
        const dist = Math.hypot(wx - game.litterScrub.lx, my - game.litterScrub.ly);
        if (dist > 0) {
          game.litterboxDirt = Math.max(0, game.litterboxDirt - dist * 0.00115);
          game.litterboxClumps = getVisibleLitterClumps();
          game.litterScrub.lx = wx;
          game.litterScrub.ly = my;
        }
      }
      if (game.litterboxDirt < 0.028) {
        game.litterboxDirt = 0;
        game.litterboxClumps = 0;
      }
    } else if (!mouse.down) {
      game.litterScrub = null;
    }
  }

  // Throwable grab — keep aim in world space (same frame as AI chase)
  if (game.throwGrab && mouse.down && game.screen === 'care') {
    const hsx = game.homeScrollX || 0;
    game.throwGrab.curX = mouse.x + hsx;
    game.throwGrab.curY = mouse.y;
  }

  // Interactive laser pointer (world coordinates)
  if (game.laserActive && mouse.down && game.screen === 'care') {
    const hsx = game.homeScrollX || 0;
    game.laserDotX = mouse.x + hsx;
    game.laserDotY = mouse.y;
    // All cats chase the dot
    const ai = game.catAI;
    if (!game.isNight && ai.state !== 'sleeping') {
      ai.targetX = game.laserDotX + (Math.random() - 0.5) * 15;
      ai.targetY = Math.min(game.laserDotY, H * 0.63);
      ai._queuedBehavior = 'playing';
      ai.state = 'walking';
      ai.stateTimer = 0.5;
      ai.nextStateTimer = 1;
    }
    // House cats also chase
    game.houseCats.forEach(idx => {
      const st = getHouseCatState(idx);
      if (st.state !== 'sleeping' || !game.isNight) {
        st.targetX = game.laserDotX + (Math.random() - 0.5) * 20;
        st.targetY = Math.min(game.laserDotY + (Math.random() - 0.5) * 15, H * 0.63);
        st.state = 'walking';
        st.timer = 2;
      }
    });
  }
  if (game.laserActive && !mouse.down) {
    game.laserActive = false;
  }

  // Thrown toy physics
  if (game.thrownToy) {
    const tt = game.thrownToy;
    if (!tt.settled) {
      tt.x += tt.vx * dt;
      tt.y += tt.vy * dt;
      tt.vx *= 0.97; // friction
      tt.vy *= 0.97;
      // Bounce off walls
      if (tt.x < 30) { tt.x = 30; tt.vx *= -0.6; }
      if (tt.x > HOME_TOTAL_W - 30) { tt.x = HOME_TOTAL_W - 30; tt.vx *= -0.6; }
      if (tt.y < 100) { tt.y = 100; tt.vy *= -0.6; }
      if (tt.y > H * 0.63) { tt.y = H * 0.63; tt.vy *= -0.4; }
      // Settle when slow enough
      if (Math.hypot(tt.vx, tt.vy) < 15) {
        tt.settled = true;
        // Update toy's resting position
        game.furniturePos[`toy_${tt.toyIdx}`] = { x: tt.x, y: tt.y };
        // Settle timer — cats lose interest after a bit
        tt.settleTimer = 3;
      }

      // Cats chase the flying toy (like laser)
      const ai = game.catAI;
      if (!game.isNight && ai.state !== 'sleeping') {
        ai.targetX = tt.x + (Math.random() - 0.5) * 10;
        ai.targetY = Math.min(tt.y, H * 0.63);
        ai._queuedBehavior = 'playing';
        ai.state = 'walking';
        ai.stateTimer = 0.3;
        ai.nextStateTimer = 1;
      }
      game.houseCats.forEach(idx => {
        const st = getHouseCatState(idx);
        if (!game.isNight) {
          st.targetX = tt.x + (Math.random() - 0.5) * 20;
          st.targetY = Math.min(tt.y + (Math.random() - 0.5) * 10, H * 0.63);
          st.state = 'walking';
          st.timer = 2;
        }
      });
    } else {
      // Settled — count down then clear
      tt.settleTimer -= dt;
      if (tt.settleTimer <= 0) {
        game.thrownToy = null;
      }
    }
  }

  // Thrown toy grab — cats chase the held toy too
  if (game.throwGrab) {
    const tg = game.throwGrab;
    const ai = game.catAI;
    if (!game.isNight && ai.state !== 'sleeping') {
      ai.targetX = tg.curX + (Math.random() - 0.5) * 10;
      ai.targetY = Math.min(tg.curY, H * 0.63);
      ai._queuedBehavior = 'playing';
      ai.state = 'walking';
      ai.stateTimer = 0.3;
      ai.nextStateTimer = 1;
    }
    game.houseCats.forEach(idx => {
      const st = getHouseCatState(idx);
      if (!game.isNight) {
        st.targetX = tg.curX + (Math.random() - 0.5) * 15;
        st.targetY = Math.min(tg.curY, H * 0.63);
        st.state = 'walking';
        st.timer = 1;
      }
    });
  }

  // Update confetti
  game.confetti = game.confetti.filter(c => {
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.vy += 120 * dt; // gravity
    c.rot += c.rotSpeed * dt;
    c.life -= dt;
    return c.life > 0;
  });

  updateCatAI(dt);
  updateHouseCats(dt);
}

function drawCare() {
  const sx = game.homeScrollX || 0;
  const mx = mouse.x, my = mouse.y;
  const wx = mx + sx;

  // Scrolling world layer (wider than the viewport)
  ctx.save();
  ctx.translate(-sx, 0);
  drawHomeBg();
  drawFurniture();

  // Backyard door (living room, left wall)
  ctx.fillStyle = '#4a6a40';
  drawRoundRect(6, H * 0.29, 66, H * 0.46, 10);
  ctx.fill();
  ctx.strokeStyle = '#2a4020';
  ctx.lineWidth = 3;
  drawRoundRect(6, H * 0.29, 66, H * 0.46, 10);
  ctx.stroke();
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(58, H * 0.54, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Backyard', 39, H * 0.36);

  // Floor poops (click to clean)
  if (game.floorPoops && game.floorPoops.length > 0) {
    game.floorPoops.forEach(fp => {
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💩', fp.x, fp.y + 6);
    });
  }

  drawHouseCats();

  if (game.placedFood) {
    const pf = game.placedFood;
    ctx.globalAlpha = 0.2 + Math.sin(game.time * 4) * 0.15;
    ctx.fillStyle = '#ffaa44';
    ctx.beginPath();
    ctx.arc(pf.x, pf.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pf.inBowl ? '🥣' : '🍖', pf.x, pf.y + 6);
  }

  drawCatBehavior();
  const catX = game.catAI.x, catY = game.catAI.y;

  if (game.careAnim) {
    const a = game.careAnim;
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, a.timer * 2);
    const animY = catY - 60 - (1.5 - a.timer) * 30;
    ctx.fillText(a.icon, catX, animY);
    ctx.globalAlpha = 1;
  }

  drawConfetti();

  // Thrown toy in flight (world space)
  if (game.thrownToy && !game.thrownToy.settled) {
    const tt = game.thrownToy;
    const toyIcons = { yarn: '🧶', bell: '🔔', mousetoy: '🐭', fish_toy: '🐠' };
    ctx.save();
    ctx.translate(tt.x, tt.y);
    ctx.rotate(game.time * 12);
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(toyIcons[tt.id] || '⚾', 0, 6);
    ctx.restore();
    ctx.globalAlpha = 0.3;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(toyIcons[tt.id] || '⚾', tt.x - tt.vx * 0.03, tt.y - tt.vy * 0.03 + 4);
    ctx.fillText(toyIcons[tt.id] || '⚾', tt.x - tt.vx * 0.06, tt.y - tt.vy * 0.06 + 4);
    ctx.globalAlpha = 1;
  }

  // Throw grab — aim line and toy (world space)
  if (game.throwGrab) {
    const tg = game.throwGrab;
    const toyId = game.ownedToys[tg.toyIdx];
    const toyIcons = { yarn: '🧶', bell: '🔔', mousetoy: '🐭', fish_toy: '🐠' };
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(tg.startX, tg.startY);
    ctx.lineTo(tg.curX, tg.curY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(toyIcons[toyId] || '⚾', tg.curX, tg.curY + 8);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px sans-serif';
    ctx.fillText('Release to throw!', tg.curX, tg.curY - 15);
  }

  // Furniture hover strokes (world)
  if (game.screen === 'care') {
    const boxes = getFurnitureHitboxes();
    for (const box of boxes) {
      const hovering = wx >= box.x && wx <= box.x + box.w && my >= box.y && my <= box.y + box.h;
      const beingDragged = game.dragging && game.dragging.id === box.dragId;
      if (hovering || beingDragged) {
        ctx.strokeStyle = beingDragged ? 'rgba(255,200,50,0.7)' : 'rgba(255,255,255,0.5)';
        ctx.lineWidth = beingDragged ? 3 : 2;
        ctx.setLineDash(beingDragged ? [] : [4, 4]);
        drawRoundRect(box.x - 2, box.y - 2, box.w + 4, box.h + 4, 6);
        ctx.stroke();
        ctx.setLineDash([]);
        if (!beingDragged) break;
      }
    }
  }

  ctx.restore();

  // Stage label
  ctx.fillStyle = '#a86e3e';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${CAT_BREEDS[game.currentCat].name} — ${STAGES[game.currentStage]}`, W / 2, 35);

  // Paw meter on the right
  drawPawMeter(680, 280, game.care, 1.2);

  // Stage progress
  ctx.fillStyle = '#865';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Paw Meter', 680, 180);

  // Growth progress display
  ctx.fillStyle = '#666';
  ctx.font = '12px sans-serif';
  const stageStr = STAGES.map((s, i) => i === game.currentStage ? `[${s}]` : s).join(' → ');
  ctx.fillText(stageStr, W / 2, 60);

  // Money display (top left)
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  drawRoundRect(10, 10, 110, 32, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`💰 $${game.money}`, 20, 32);

  // Music toggle button (beside money)
  const musicIcon = bgMusic.enabled ? '🎵' : '🔇';
  drawButton(125, 10, 35, 32, musicIcon, '#445', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 125, 10, 35, 32)) {
    toggleBgMusic();
    sfxClick();
  }

  // Store button (top left, below money)
  drawButton(10, 50, 110, 38, 'Store', '#e07050', true, '🏪');
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 10, 50, 110, 38)) {
    sfxClick();
    game.careMode = null;
    game.storeCategory = 0;
    game.storeScroll = 0;
    game.screen = 'store';
  }

  drawButton(10, 130, 125, 36, 'Chill zone', '#8a7', true, '🌿');
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 10, 130, 125, 36)) {
    sfxClick();
    initTimeout();
    game.screen = 'timeout';
  }

  // Activity buttons
  const btnW = 105, btnH = 55;
  const btnY = H - 85;
  const totalW = ACTIVITIES.length * btnW + (ACTIVITIES.length - 1) * 8;
  const btnStartX = (W - totalW) / 2;

  for (let i = 0; i < ACTIVITIES.length; i++) {
    const bx = btnStartX + i * (btnW + 8);
    const act = ACTIVITIES[i];
    const done = game.care[act] >= MAX_PER_ACTIVITY;
    const isActiveMode = game.careMode === act;
    const color = done ? '#999' : ACTIVITY_COLORS[i];
    drawButton(bx, btnY, btnW, btnH, ACTIVITY_LABELS[i], color, !done, ACTIVITY_ICONS[i]);
    if (isActiveMode) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 3]);
      drawRoundRect(bx - 2, btnY - 2, btnW + 4, btnH + 4, 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (mouse.clicked && hitBox(mouse.x, mouse.y, bx, btnY, btnW, btnH) && !done) {
      if (game.careMode === act) {
        game.careMode = null;
        sfxClick();
        continue;
      }
      game.careMode = null;
      if (act === 'walk' || act === 'gather') {
        sfxClick();
        initWalk();
        game.screen = 'walk';
      } else if (act === 'feed') {
        sfxClick();
        if (game.isNight || game.catAI.state === 'sleeping') {
          addFloat(catX, catY - 60, 'Cat is sleeping! 😴', '#f87');
        } else {
          game.careMode = 'feed';
          addFloat(catX, catY - 60, 'Click the floor to place food!', '#f87');
        }
      } else if (act === 'water') {
        sfxClick();
        const hasBowl = game.furniture.some(f => f.startsWith('fountain') || f.startsWith('foodbowl'));
        if (!hasBowl) {
          addFloat(catX, catY - 60, 'Need a water bowl or fountain first! 🥣', '#4bf');
        } else if (game.isNight || game.catAI.state === 'sleeping') {
          addFloat(catX, catY - 60, 'Cat is sleeping! 😴', '#4bf');
        } else {
          const ai = game.catAI;
          const bowlId = game.furniture.find(f => f.startsWith('fountain') || f.startsWith('foodbowl'));
          const pos = getFurnitureXY(bowlId);
          ai.targetX = pos.x;
          ai.targetY = Math.min(pos.y + 20, H * 0.63);
          ai._queuedBehavior = 'drinking';
          ai._pendingCredit = 'water';
          ai._pendingCreditAmount = 1;
          ai.state = 'walking';
          ai.stateTimer = 99;
          ai.nextStateTimer = 8;
          addFloat(catX, catY - 60, 'Getting water... 💧', '#4bf');
        }
      } else if (act === 'brush') {
        sfxClick();
        if (game.isNight || game.catAI.state === 'sleeping') {
          addFloat(catX, catY - 60, 'Cat is sleeping! 😴', '#b8f');
        } else {
          game.careMode = 'brush';
          addFloat(catX, catY - 60, 'Click on your cat to brush!', '#b8f');
        }
      } else if (act === 'play') {
        sfxClick();
        if (game.isNight || game.catAI.state === 'sleeping') {
          addFloat(catX, catY - 60, 'Cat is sleeping! 😴', '#fb4');
        } else if (game.ownedToys.length === 0) {
          addFloat(catX, catY - 60, 'Get a toy from the store first! 🧶', '#fb4');
        } else {
          // Auto-play: send cat to a random owned toy
          const toyIdx = Math.floor(Math.random() * game.ownedToys.length);
          const tp = getToyXY(toyIdx);
          const ai = game.catAI;
          ai.targetX = Math.max(50, Math.min(HOME_TOTAL_W - 160, tp.x));
          ai.targetY = Math.max(250, Math.min(H * 0.63, tp.y - 10));
          ai._queuedBehavior = 'playing';
          ai._pendingCredit = 'play';
          ai._pendingCreditAmount = 1;
          ai.state = 'walking';
          ai.stateTimer = 99;
          ai.nextStateTimer = 8;
          addFloat(catX, catY - 60, '🎉 Play time!', '#fb4');
        }
      }
    }
  }

  // Cat collection button (top right) — always visible
  const catBtnLabel = game.cats.length > 0 ? `Cats: ${game.cats.length}` : 'My Cats';
  drawButton(W - 120, 10, 110, 35, catBtnLabel, '#6c5ce7', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, W - 120, 10, 110, 35)) {
    sfxClick();
    game.careMode = null;
    game.screen = 'collection';
  }

  // Drag furniture or click-to-interact (wx = screen X + scroll, world space)
  if (game.screen === 'care') {
    const onButton = hitBox(mx, my, 10, 10, 110, 110) || hitBox(mx, my, W - 120, 10, 110, 35)
      || hitBox(mx, my, 10, 130, 125, 36);

    if (mouse.clicked && !onButton) {
      const doorX = 6, doorY = H * 0.29, doorW = 66, doorH = H * 0.46;
      if (wx >= doorX && wx <= doorX + doorW && my >= doorY && my <= doorY + doorH) {
        sfxClick();
        initBackyard();
        game.screen = 'backyard';
        mouse.clicked = false;
      }
    }

    // Handle drag in progress
    if (game.dragging && mouse.down) {
      const id = game.dragging.id;
      const newX = wx - game.dragging.offX;
      const newY = my - game.dragging.offY;
      game.furniturePos[id] = {
        x: Math.max(30, Math.min(HOME_TOTAL_W - 30, newX)),
        y: Math.max(100, Math.min(H * 0.65, newY))
      };
      game.dragging.moved = true;
    }

    // End drag
    if (game.dragging && !mouse.down) {
      const wasDrag = game.dragging.moved;
      game.dragging = null;
      // If it was a real drag (moved), don't treat as click
      if (wasDrag) { mouse.clicked = false; }
    }

    // Start drag on mousedown — special toys: laser, throwables
    const THROWABLE_TOYS = ['yarn', 'bell', 'mousetoy', 'fish_toy'];
    if (mouse.down && !game.dragging && !game.laserActive && !game.throwGrab && !game.careMode) {
      const boxes = getFurnitureHitboxes();
      for (const box of boxes) {
        if (box.dragId && wx >= box.x && wx <= box.x + box.w && my >= box.y && my <= box.y + box.h && !onButton) {
          if (box.dragId === 'litterbox') {
            const lp = getFurnitureXY('litterbox');
            const trx = lp.x - 22, ty = lp.y - 4, tw = 44, th = 26;
            const inTray = wx >= trx && wx <= trx + tw && my >= ty && my <= ty + th;
            if ((game.litterboxDirt || 0) > 0.02 && inTray) break;
          }
          // Laser toy
          if (box.label === 'Laser') {
            game.laserActive = true;
            game.laserDotX = wx;
            game.laserDotY = my;
            break;
          }
          // Throwable toy — grab it
          if (box.dragId.startsWith('toy_')) {
            const tidx = parseInt(box.dragId.split('_')[1]);
            const toyId = game.ownedToys[tidx];
            if (THROWABLE_TOYS.includes(toyId)) {
              game.throwGrab = { toyIdx: tidx, startX: wx, startY: my, curX: wx, curY: my };
              break;
            }
          }
          const pos = box.dragId.startsWith('toy_') ? getToyXY(parseInt(box.dragId.split('_')[1])) : getFurnitureXY(box.dragId);
          game.dragging = { id: box.dragId, offX: wx - pos.x, offY: my - pos.y, moved: false };
          break;
        }
      }
    }

    // Release throw — launch the toy!
    if (game.throwGrab && !mouse.down) {
      const tg = game.throwGrab;
      const dx = tg.curX - tg.startX;
      const dy = tg.curY - tg.startY;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        // Fling it!
        game.thrownToy = {
          id: game.ownedToys[tg.toyIdx],
          toyIdx: tg.toyIdx,
          x: tg.curX, y: tg.curY,
          vx: dx * 3, vy: dy * 3,
          settled: false,
        };
        sfxDash();
      }
      game.throwGrab = null;
    }

    // Click-to-interact (only if not dragging)
    if (mouse.clicked && !game.dragging) {
      const inRoom = my > 70 && my < H - 90 && mx > 0 && mx < W - 150;
      if (inRoom && !onButton) {
        let skipRoomInteract = false;
        if (game.floorPoops && game.floorPoops.length > 0) {
          for (let pi = game.floorPoops.length - 1; pi >= 0; pi--) {
            const fp = game.floorPoops[pi];
            if (Math.hypot(wx - fp.x, my - fp.y) < 28) {
              game.floorPoops.splice(pi, 1);
              sfxClick();
              addFloat(fp.x, fp.y - 22, 'Cleaned!', '#6a6');
              skipRoomInteract = true;
              mouse.clicked = false;
              break;
            }
          }
        }
        if (skipRoomInteract) {
          /* handled */
        } else if (game.careMode) {
          const ai = game.catAI;
          if (game.careMode === 'feed') {
            // Place food — bowl bonus if near a foodbowl
            let inBowl = false;
            for (const bid of ['foodbowl', 'foodbowl_blue']) {
              if (game.furniture.includes(bid)) {
                const pos = getFurnitureXY(bid);
                if (Math.hypot(wx - pos.x, my - pos.y) < 45) { inBowl = true; break; }
              }
            }
            game.placedFood = { x: wx, y: my, inBowl };
            ai.targetX = Math.max(50, Math.min(HOME_TOTAL_W - 160, wx));
            ai.targetY = Math.max(270, Math.min(H * 0.63, my));
            ai._queuedBehavior = 'eating';
            ai._pendingCredit = 'feed';
            ai._pendingCreditAmount = inBowl ? 2 : 1;
            ai.state = 'walking';
            ai.stateTimer = 99;
            ai.nextStateTimer = 6;
            if (inBowl) addFloat(wx, my - 35, 'Bowl Bonus! (+2 Feed)', '#f87');
            else addFloat(wx, my - 25, 'Food placed!', '#f87');
            sfxClick();
            game.careMode = null;
          } else if (game.careMode === 'brush') {
            const distToCat = Math.hypot(wx - ai.x, my - ai.y);
            if (distToCat < 55) {
              ai.state = 'grooming';
              ai._pendingCredit = 'brush';
              ai._pendingCreditAmount = 1;
              const dur = BEHAVIOR_DURATION['grooming'];
              ai.stateTimer = dur[0] + Math.random() * (dur[1] - dur[0]);
              ai.nextStateTimer = ai.stateTimer;
              addFloat(ai.x, ai.y - 40, '✨ Brushing!', '#b8f');
              sfxClick();
              game.careMode = null;
            } else {
              addFloat(wx, my - 20, 'Click directly on your cat!', '#b8f');
            }
          } else if (game.careMode === 'play') {
            ai.targetX = Math.max(50, Math.min(HOME_TOTAL_W - 160, wx));
            ai.targetY = Math.max(250, Math.min(H * 0.63, my));
            ai._queuedBehavior = 'playing';
            ai._pendingCredit = 'play';
            ai._pendingCreditAmount = 1;
            ai.state = 'walking';
            ai.stateTimer = 99;
            ai.nextStateTimer = 8;
            addFloat(wx, my - 20, '🎉 Play time!', '#fb4');
            sfxClick();
            game.careMode = null;
          }
        } else if (isCatSad()) {
          game.catAI.emote = { icon: '😿', timer: 1.5 };
        } else {
          const ai = game.catAI;
          const boxes = getFurnitureHitboxes();
          let clickedItem = null;
          for (const box of boxes) {
            if (wx >= box.x && wx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
              clickedItem = box; break;
            }
          }
          if (clickedItem) {
            ai.targetX = clickedItem.targetX;
            ai.targetY = clickedItem.targetY;
            ai._queuedBehavior = clickedItem.behavior;
            ai.state = 'walking';
            ai.stateTimer = 99;
            ai.nextStateTimer = 8;
            addFloat(wx, my - 10, clickedItem.label, '#fff');
            sfxClick();
          } else {
            ai.targetX = Math.max(50, Math.min(HOME_TOTAL_W - 160, wx));
            ai.targetY = Math.max(250, Math.min(H * 0.63, my));
            ai._queuedBehavior = 'idle';
            ai.state = 'walking';
            ai.stateTimer = 99;
            ai.nextStateTimer = 5;
          }
        }
      }
    }
  }

  // Furniture hover tooltip (screen space; strokes drawn in world layer above)
  if (game.screen === 'care') {
    const boxes = getFurnitureHitboxes();
    for (const box of boxes) {
      const hovering = wx >= box.x && wx <= box.x + box.w && my >= box.y && my <= box.y + box.h;
      const beingDragged = game.dragging && game.dragging.id === box.dragId;
      if (hovering && !beingDragged) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        drawRoundRect(mx - 52, my - 22, 104, 18, 5);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        const tip = box.dragId === 'litterbox' && (game.litterboxDirt || 0) > 0.02
          ? 'Scrub litter (drag)'
          : `${box.label} (drag)`;
        ctx.fillText(tip, mx, my - 9);
        break;
      }
    }
  }

  // Mood indicator
  const mood = getPawMood();
  const moodLabel = mood >= 0.5 ? '😸 Happy' : mood >= 0.2 ? '😐 Okay' : '😿 Sad';
  const moodColor = mood >= 0.5 ? '#4a4' : mood >= 0.2 ? '#aa8' : '#c44';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  drawRoundRect(10, 95, 110, 22, 6);
  ctx.fill();
  ctx.fillStyle = moodColor;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(moodLabel, 20, 111);

  // Poop / litter tips (rotate)
  const poopTips = [
    'After eating, cats need a bathroom break. A litter box keeps mess in one place.',
    'Clumps appear after a litter visit — scrub inside the box to clean (drag back & forth).',
  ];
  if (!game.isNight && game.currentCat !== null) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    drawRoundRect(10, 122, 280, 28, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    const tipIdx = Math.floor(game.time * 0.12) % poopTips.length;
    ctx.fillText('💡 ' + poopTips[tipIdx], 18, 141);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('← → keys or scroll wheel to move through the house', W / 2, H - 18);

  // Interactive laser dot (world → screen)
  if (game.laserActive) {
    const ldx = game.laserDotX - sx;
    ctx.fillStyle = 'rgba(255,0,0,0.7)';
    ctx.beginPath(); ctx.arc(ldx, game.laserDotY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,100,100,0.2)';
    ctx.beginPath(); ctx.arc(ldx, game.laserDotY, 12, 0, Math.PI * 2); ctx.fill();
  }

  // Night mode overlay
  if (game.isNight) {
    ctx.fillStyle = `rgba(10,10,40,${0.55 + Math.sin(game.time * 0.5) * 0.05})`;
    ctx.fillRect(0, 0, W, H);
    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 30; i++) {
      const starX = (i * 167 + 13) % W;
      const starY = (i * 97 + 43) % (H * 0.4);
      ctx.globalAlpha = 0.3 + Math.sin(game.time * 2 + i) * 0.3;
      ctx.beginPath(); ctx.arc(starX, starY, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Moon
    ctx.fillStyle = '#ffe888';
    ctx.beginPath(); ctx.arc(W - 80, 60, 25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(10,10,40,${0.55})`;
    ctx.beginPath(); ctx.arc(W - 70, 55, 22, 0, Math.PI * 2); ctx.fill();
    // Night label
    ctx.fillStyle = '#aaccff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌙 Night Time — Shhh...', W / 2, H - 100);
    const remaining = Math.ceil(game.nightDuration);
    ctx.font = '12px sans-serif';
    ctx.fillText(`${remaining}s until morning`, W / 2, H - 82);
  }

  // Care mode cursor icon
  if (game.careMode) {
    const modeIcons = { feed: '🍖', brush: '🖌️', play: '🧶' };
    const modeHints = { feed: 'Click floor to place food', brush: 'Click on cat to brush', play: 'Click to play with cat' };
    const icon = modeIcons[game.careMode];
    const hint = modeHints[game.careMode];
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icon, mouse.x + 14, mouse.y - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    drawRoundRect(mouse.x - 84, mouse.y - 38, 168, 18, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(hint + '  (click button to cancel)', mouse.x, mouse.y - 24);
  }

  drawFloats(sx);
}

function checkGrowth() {
  const allDone = ACTIVITIES.every(a => game.care[a] >= MAX_PER_ACTIVITY);
  if (allDone) {
    if (game.currentStage < 3) {
      setTimeout(() => {
        game.currentStage++;
        resetCare();
        sfxGrow();
        spawnConfetti(game.catAI.x, game.catAI.y - 30, 60);
        addFloat(300, 250, `Grew into a ${STAGES[game.currentStage]}!`, '#fa0', { screen: true });
        if (game.currentStage === 3) {
          // Adult! Time for the chase
          setTimeout(() => {
            addFloat(300, 200, 'Time to run home!', '#f44', { screen: true });
            setTimeout(() => {
              initChase();
              game.screen = 'chase';
            }, 1500);
          }, 1000);
        }
      }, 500);
    }
  }
}

function buyItem(item) {
  game.money -= item.price;
  sfxBuy();

  if (item.cat === 'food') {
    // Food: consumable, apply feed + show in home
    const amount = item.effect.amount;
    const prev = game.care.feed;
    game.care.feed = Math.min(MAX_PER_ACTIVITY, game.care.feed + amount);
    const gained = game.care.feed - prev;
    addFloat(400, 200, `+${gained} Feed!`, '#4a9', { screen: true });
    if (game.care.feed >= MAX_PER_ACTIVITY) setTimeout(() => sfxComplete(), 200);
    checkGrowth();
  } else if (item.cat === 'toys') {
    // Toys: give play bonus AND persist at home
    const amount = item.effect.amount;
    const prev = game.care.play;
    game.care.play = Math.min(MAX_PER_ACTIVITY, game.care.play + amount);
    const gained = game.care.play - prev;
    addFloat(400, 200, `+${gained} Play!`, '#4a9', { screen: true });
    if (!game.ownedToys.includes(item.id)) game.ownedToys.push(item.id);
    if (game.care.play >= MAX_PER_ACTIVITY) setTimeout(() => sfxComplete(), 200);
    checkGrowth();
  } else if (item.cat === 'accessories') {
    // Accessories: add to inventory AND auto-equip
    if (!game.inventory.includes(item.id)) game.inventory.push(item.id);
    game.equipped[item.slot] = item.id;
    sfxEquip();
    addFloat(400, 200, `${item.name} equipped!`, '#b8f', { screen: true });
  } else if (item.cat === 'furniture') {
    if (!game.furniture.includes(item.id)) game.furniture.push(item.id);
    addFloat(400, 200, `${item.name} placed at home!`, '#8d6', { screen: true });
  }
}
