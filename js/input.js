// ============================================================
// CAT RUN DASH - Input Handling (keyboard + multi-touch)
// Depends on: canvas, W, H, game (globals)
// ============================================================

const keys = {};
const mouse = { x: 0, y: 0, clicked: false, down: false };

const touchCtrl = {
  isTouch: false,
  joyId: null,
  joyCX: 0, joyCY: 0,
  joyDX: 0, joyDY: 0,
  joyActive: false,
  dashId: null,
  dashActive: false,
  walkScratchId: null,
  chaseScratchId: null,
  uiId: null,
  uiStartX: 0, uiStartY: 0,
  uiMoved: false,
  scrollLastY: 0,
  careScrollMode: false,
  careScrollStartX: 0,
  careScroll0: 0,
};

const JOY_BASE_X = 110, JOY_BASE_Y = 500;
const JOY_RADIUS = 55, JOY_MAX = 50, JOY_DEAD = 8, JOY_THRESH = 0.3;
const DASH_BTN_X = 710, DASH_BTN_Y = 500, DASH_BTN_R = 45;
const WALK_SCRATCH_TOUCH_X = 10, WALK_SCRATCH_TOUCH_Y = H - 50, WALK_SCRATCH_TOUCH_W = 120, WALK_SCRATCH_TOUCH_H = 44;
const CHASE_SCRATCH_TOUCH_X = 600, CHASE_SCRATCH_TOUCH_Y = 500, CHASE_SCRATCH_TOUCH_R = 48;

// --- Keyboard ---
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.code] = false; });

// --- Mouse ---
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (W / rect.width);
  mouse.y = (e.clientY - rect.top) * (H / rect.height);
});
canvas.addEventListener('mousedown', () => { mouse.down = true; });
canvas.addEventListener('mouseup', () => { mouse.down = false; });
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (W / rect.width);
  mouse.y = (e.clientY - rect.top) * (H / rect.height);
  mouse.clicked = true;
});

canvas.addEventListener('wheel', e => {
  if (game.screen !== 'care') return;
  e.preventDefault();
  const maxS = Math.max(0, HOME_TOTAL_W - W);
  const delta = e.deltaY + e.deltaX;
  game.homeScrollX = Math.max(0, Math.min(maxS, (game.homeScrollX || 0) + delta * 0.65));
}, { passive: false });

// --- Touch helpers ---
function touchToCanvas(t, rect) {
  return {
    x: (t.clientX - rect.left) * (W / rect.width),
    y: (t.clientY - rect.top) * (H / rect.height),
  };
}

function wantsJoystick() {
  return false;
}

function wantsDashButton() {
  return (game.screen === 'chase' && !game.chase.won && !game.chase.lost) || game.screen === 'backyard';
}

function wantsWalkScratchButton() {
  if (game.screen === 'backyard') return true;
  return game.screen === 'walk' && !game.walk.caught && !game.walk.choosingCompanion && game.walk.dogs.length > 0;
}

function wantsChaseScratchButton() {
  return game.screen === 'chase' && !game.chase.won && !game.chase.lost;
}

// --- Multi-touch ---
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  touchCtrl.isTouch = true;
  const rect = canvas.getBoundingClientRect();

  for (const t of e.changedTouches) {
    const p = touchToCanvas(t, rect);

    // Walk: Scratch button (hold F)
    if (wantsWalkScratchButton() && touchCtrl.walkScratchId === null &&
        hitBox(p.x, p.y, WALK_SCRATCH_TOUCH_X, WALK_SCRATCH_TOUCH_Y, WALK_SCRATCH_TOUCH_W, WALK_SCRATCH_TOUCH_H)) {
      touchCtrl.walkScratchId = t.identifier;
      keys['KeyF'] = true;
      continue;
    }

    // Chase: Scratch button (hold F)
    if (wantsChaseScratchButton() && touchCtrl.chaseScratchId === null &&
        Math.hypot(p.x - CHASE_SCRATCH_TOUCH_X, p.y - CHASE_SCRATCH_TOUCH_Y) < CHASE_SCRATCH_TOUCH_R + 18) {
      touchCtrl.chaseScratchId = t.identifier;
      keys['KeyF'] = true;
      continue;
    }

    // Dash button zone (chase + backyard)
    if (wantsDashButton() && touchCtrl.dashId === null &&
        Math.hypot(p.x - DASH_BTN_X, p.y - DASH_BTN_Y) < DASH_BTN_R + 20) {
      touchCtrl.dashId = t.identifier;
      touchCtrl.dashActive = true;
      keys['Space'] = true;
      continue;
    }

    // Care: drag sky/wall to pan between rooms (no keyboard needed)
    if (game.screen === 'care') {
      const topUI = hitBox(p.x, p.y, 0, 0, 290, 155) || hitBox(p.x, p.y, W - 130, 0, 120, 45);
      if (p.y < H * 0.30 && !topUI) {
        touchCtrl.careScrollMode = true;
        touchCtrl.careScrollStartX = p.x;
        touchCtrl.careScroll0 = game.homeScrollX || 0;
        mouse.x = p.x;
        mouse.y = p.y;
        mouse.down = true;
        touchCtrl.uiId = t.identifier;
        touchCtrl.uiStartX = p.x;
        touchCtrl.uiStartY = p.y;
        touchCtrl.uiMoved = false;
        touchCtrl.scrollLastY = p.y;
        continue;
      }
    }

    // UI touch (also used for click-to-move steering)
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.down = true;
    touchCtrl.uiId = t.identifier;
    touchCtrl.uiStartX = p.x;
    touchCtrl.uiStartY = p.y;
    touchCtrl.uiMoved = false;
    touchCtrl.scrollLastY = p.y;
  }
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  for (const t of e.changedTouches) {
    const p = touchToCanvas(t, rect);

    // UI touch (handles steering + store scroll + care sky pan)
    if (t.identifier === touchCtrl.uiId) {
      mouse.x = p.x;
      mouse.y = p.y;
      const dist = Math.hypot(p.x - touchCtrl.uiStartX, p.y - touchCtrl.uiStartY);
      if (dist > 10) touchCtrl.uiMoved = true;
      if (touchCtrl.careScrollMode && game.screen === 'care') {
        const maxS = Math.max(0, HOME_TOTAL_W - W);
        const dx = p.x - touchCtrl.careScrollStartX;
        game.homeScrollX = Math.max(0, Math.min(maxS, touchCtrl.careScroll0 - dx));
      } else if (game.screen === 'store') {
        game.storeScroll += (touchCtrl.scrollLastY - p.y) * 1.5;
        touchCtrl.scrollLastY = p.y;
      }
    }
  }
}, { passive: false });

function handleTouchEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    // Dash release
    if (t.identifier === touchCtrl.dashId) {
      touchCtrl.dashId = null;
      touchCtrl.dashActive = false;
      keys['Space'] = false;
      continue;
    }
    if (t.identifier === touchCtrl.walkScratchId) {
      touchCtrl.walkScratchId = null;
      keys['KeyF'] = false;
      continue;
    }
    if (t.identifier === touchCtrl.chaseScratchId) {
      touchCtrl.chaseScratchId = null;
      keys['KeyF'] = false;
      continue;
    }
    // UI release — register click (for buttons/walk/chase steering)
    if (t.identifier === touchCtrl.uiId) {
      const rect = canvas.getBoundingClientRect();
      const p = touchToCanvas(t, rect);
      mouse.x = p.x;
      mouse.y = p.y;
      const skipCareTap = touchCtrl.careScrollMode && touchCtrl.uiMoved;
      touchCtrl.careScrollMode = false;
      if (!skipCareTap) mouse.clicked = true;
      mouse.down = false;
      touchCtrl.uiId = null;
    }
  }
}
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

// --- Mouse wheel (store scroll) ---
canvas.addEventListener('wheel', e => {
  if (game.screen === 'store') {
    e.preventDefault();
    game.storeScroll += e.deltaY * 0.5;
  } else if (game.screen === 'care') {
    e.preventDefault();
    const maxS = Math.max(0, HOME_TOTAL_W - W);
    game.homeScrollX = Math.max(0, Math.min(maxS, (game.homeScrollX || 0) + e.deltaY * 0.85));
  }
}, { passive: false });

// --- Virtual controls drawing (called from chase draw) ---
function drawTouchControls() {
  if (!touchCtrl.isTouch) return;

  // Dash button (chase + backyard)
  if (wantsDashButton()) {
    const ready = game.screen === 'chase'
      ? game.chase.dashCooldown <= 0
      : (game.backyard.dashCooldown || 0) <= 0;
    ctx.globalAlpha = ready ? 0.35 : 0.12;
    ctx.fillStyle = ready ? '#ffcc44' : '#666';
    ctx.beginPath();
    ctx.arc(DASH_BTN_X, DASH_BTN_Y, DASH_BTN_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = ready ? 0.85 : 0.35;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DASH', DASH_BTN_X, DASH_BTN_Y + 6);
    ctx.globalAlpha = 1;
  }
}
