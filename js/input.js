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
  uiId: null,
  uiStartX: 0, uiStartY: 0,
  uiMoved: false,
  scrollLastY: 0,
};

const JOY_BASE_X = 110, JOY_BASE_Y = 500;
const JOY_RADIUS = 55, JOY_MAX = 50, JOY_DEAD = 8, JOY_THRESH = 0.3;
const DASH_BTN_X = 710, DASH_BTN_Y = 500, DASH_BTN_R = 45;

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

// --- Touch helpers ---
function touchToCanvas(t, rect) {
  return {
    x: (t.clientX - rect.left) * (W / rect.width),
    y: (t.clientY - rect.top) * (H / rect.height),
  };
}

function wantsJoystick() {
  if (game.screen === 'chase' && !game.chase.won && !game.chase.lost) return true;
  if (game.screen === 'walk' && !game.walk.choosingCompanion && !game.walk.caught) return true;
  return false;
}

// --- Multi-touch ---
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  touchCtrl.isTouch = true;
  const rect = canvas.getBoundingClientRect();

  for (const t of e.changedTouches) {
    const p = touchToCanvas(t, rect);
    const joy = wantsJoystick();

    // Joystick zone: left 35%, bottom 45%
    if (joy && touchCtrl.joyId === null && p.x < W * 0.35 && p.y > H * 0.55) {
      touchCtrl.joyId = t.identifier;
      touchCtrl.joyActive = true;
      touchCtrl.joyCX = p.x;
      touchCtrl.joyCY = p.y;
      touchCtrl.joyDX = 0;
      touchCtrl.joyDY = 0;
      continue;
    }

    // Dash button zone (chase only)
    if (joy && game.screen === 'chase' && touchCtrl.dashId === null &&
        Math.hypot(p.x - DASH_BTN_X, p.y - DASH_BTN_Y) < DASH_BTN_R + 20) {
      touchCtrl.dashId = t.identifier;
      touchCtrl.dashActive = true;
      keys['Space'] = true;
      continue;
    }

    // UI touch
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

    // Joystick
    if (t.identifier === touchCtrl.joyId) {
      const dx = p.x - touchCtrl.joyCX;
      const dy = p.y - touchCtrl.joyCY;
      const dist = Math.hypot(dx, dy);
      if (dist > JOY_DEAD) {
        const clamped = Math.min(dist, JOY_MAX);
        touchCtrl.joyDX = (dx / dist) * (clamped / JOY_MAX);
        touchCtrl.joyDY = (dy / dist) * (clamped / JOY_MAX);
      } else {
        touchCtrl.joyDX = 0;
        touchCtrl.joyDY = 0;
      }
      keys['ArrowLeft']  = touchCtrl.joyDX < -JOY_THRESH;
      keys['ArrowRight'] = touchCtrl.joyDX >  JOY_THRESH;
      keys['ArrowUp']    = touchCtrl.joyDY < -JOY_THRESH;
      keys['ArrowDown']  = touchCtrl.joyDY >  JOY_THRESH;
      continue;
    }

    // UI touch
    if (t.identifier === touchCtrl.uiId) {
      mouse.x = p.x;
      mouse.y = p.y;
      const dist = Math.hypot(p.x - touchCtrl.uiStartX, p.y - touchCtrl.uiStartY);
      if (dist > 10) touchCtrl.uiMoved = true;
      if (game.screen === 'store') {
        game.storeScroll += (touchCtrl.scrollLastY - p.y) * 1.5;
        touchCtrl.scrollLastY = p.y;
      }
    }
  }
}, { passive: false });

function handleTouchEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    // Joystick release
    if (t.identifier === touchCtrl.joyId) {
      touchCtrl.joyId = null;
      touchCtrl.joyActive = false;
      touchCtrl.joyDX = 0;
      touchCtrl.joyDY = 0;
      keys['ArrowLeft'] = false;
      keys['ArrowRight'] = false;
      keys['ArrowUp'] = false;
      keys['ArrowDown'] = false;
      continue;
    }
    // Dash release
    if (t.identifier === touchCtrl.dashId) {
      touchCtrl.dashId = null;
      touchCtrl.dashActive = false;
      keys['Space'] = false;
      continue;
    }
    // UI release — only register click if finger didn't drag
    if (t.identifier === touchCtrl.uiId) {
      const rect = canvas.getBoundingClientRect();
      const p = touchToCanvas(t, rect);
      if (!touchCtrl.uiMoved) {
        mouse.x = p.x;
        mouse.y = p.y;
        mouse.clicked = true;
      }
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
  }
}, { passive: false });

// --- Virtual controls drawing (called from walk/chase draw) ---
function drawTouchControls() {
  if (!touchCtrl.isTouch || !wantsJoystick()) return;

  // Joystick base
  const jx = touchCtrl.joyActive ? touchCtrl.joyCX : JOY_BASE_X;
  const jy = touchCtrl.joyActive ? touchCtrl.joyCY : JOY_BASE_Y;

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(jx, jy, JOY_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Joystick thumb
  const tx = jx + touchCtrl.joyDX * (JOY_RADIUS - 15);
  const ty = jy + touchCtrl.joyDY * (JOY_RADIUS - 15);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(tx, ty, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Dash button (chase only)
  if (game.screen === 'chase') {
    const ready = game.chase.dashCooldown <= 0;
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
