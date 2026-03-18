// setup.js — Canvas and global rendering context
// Must be loaded FIRST, before any other script

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = 800, H = 600;
canvas.width = W; canvas.height = H;

// Resize canvas to fit window
function resize() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = (W * scale) + 'px';
  canvas.style.height = (H * scale) + 'px';
}
resize();
window.addEventListener('resize', resize);
