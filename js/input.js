// ============================================================
// CAT RUN DASH - Input Handling
// Extracted from index.html
// Depends on: canvas, W, H, game (globals)
// ============================================================

const keys = {};
const mouse = { x: 0, y: 0, clicked: false, down: false };

document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup', e => { keys[e.code] = false; });

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

// Touch support
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  mouse.x = (t.clientX - rect.left) * (W / rect.width);
  mouse.y = (t.clientY - rect.top) * (H / rect.height);
  mouse.down = true;
  mouse.clicked = true;
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  mouse.x = (t.clientX - rect.left) * (W / rect.width);
  mouse.y = (t.clientY - rect.top) * (H / rect.height);
}, { passive: false });
canvas.addEventListener('touchend', e => { e.preventDefault(); mouse.down = false; }, { passive: false });

canvas.addEventListener('wheel', e => {
  if (game.screen === 'store') {
    e.preventDefault();
    game.storeScroll += e.deltaY * 0.5;
  }
}, { passive: false });
