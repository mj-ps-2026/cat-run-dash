// furniture.js — Furniture position helpers and drawing
// Depends on: config.js (FURNITURE_DEFAULTS, TOY_DEFAULT_SPOTS), game state, drawing utils

function getFurnitureXY(id) {
  return game.furniturePos[id] || FURNITURE_DEFAULTS[id] || { x: 300, y: 350 };
}

function getToyXY(idx) {
  const key = `toy_${idx}`;
  if (game.furniturePos[key]) return game.furniturePos[key];
  return TOY_DEFAULT_SPOTS[idx % TOY_DEFAULT_SPOTS.length];
}

function getFurnitureOffset(id) {
  const def = FURNITURE_DEFAULTS[id];
  if (!def) return { dx: 0, dy: 0 };
  const pos = getFurnitureXY(id);
  return { dx: pos.x - def.x, dy: pos.y - def.y };
}

// ============================================================
// FURNITURE DRAWING (in home)
// ============================================================
function drawFurniture() {
  const owned = game.furniture;

  // Helper: wrap each item with position offset
  function withOffset(id, fn) {
    const off = getFurnitureOffset(id);
    ctx.save();
    ctx.translate(off.dx, off.dy);
    fn();
    ctx.restore();
  }

  if (owned.includes('catbed')) { withOffset('catbed', () => {
    ctx.fillStyle = '#d4627a';
    drawEllipse(150, H * 0.58, 35, 14);
    ctx.fill();
    ctx.fillStyle = '#e88aa0';
    drawEllipse(150, H * 0.57, 28, 10);
    ctx.fill();
  }); }

  if (owned.includes('scratchpost')) { withOffset('scratchpost', () => {
    const spx = 480, spy = H * 0.38;
    // Post
    ctx.fillStyle = '#c8a060';
    ctx.fillRect(spx - 6, spy, 12, H * 0.28);
    // Rope wrapping
    ctx.strokeStyle = '#e8c880';
    ctx.lineWidth = 3;
    for (let ry = 0; ry < H * 0.28; ry += 8) {
      ctx.beginPath();
      ctx.moveTo(spx - 6, spy + ry);
      ctx.lineTo(spx + 6, spy + ry + 4);
      ctx.stroke();
    }
    // Top platform
    ctx.fillStyle = '#d4627a';
    drawRoundRect(spx - 18, spy - 6, 36, 10, 4);
    ctx.fill();
  }); }

  if (owned.includes('cattower')) { withOffset('cattower', () => {
    const tx = 520, ty = H * 0.25;
    // Main pole
    ctx.fillStyle = '#c8a060';
    ctx.fillRect(tx - 5, ty, 10, H * 0.42);
    // Level 1 (bottom)
    ctx.fillStyle = '#8a6040';
    drawRoundRect(tx - 25, ty + H * 0.32, 50, 12, 5);
    ctx.fill();
    ctx.fillStyle = '#d4627a';
    drawRoundRect(tx - 20, ty + H * 0.27, 40, 18, 6);
    ctx.fill();
    // Level 2 (top)
    ctx.fillStyle = '#8a6040';
    drawRoundRect(tx - 22, ty + H * 0.08, 44, 12, 5);
    ctx.fill();
    ctx.fillStyle = '#7ab';
    drawRoundRect(tx - 18, ty + H * 0.02, 36, 20, 6);
    ctx.fill();
    // Top perch
    ctx.fillStyle = '#8a6040';
    drawRoundRect(tx - 18, ty - 6, 36, 10, 5);
    ctx.fill();
  }); }

  if (owned.includes('foodbowl')) { withOffset('foodbowl', () => {
    ctx.fillStyle = '#e0c0a0';
    drawEllipse(200, H * 0.62, 16, 6);
    ctx.fill();
    ctx.fillStyle = '#ff9966';
    drawEllipse(200, H * 0.615, 12, 4);
    ctx.fill();
    ctx.strokeStyle = '#c0a080';
    ctx.lineWidth = 1.5;
    drawEllipse(200, H * 0.62, 16, 6);
    ctx.stroke();
  }); }

  if (owned.includes('fountain')) { withOffset('fountain', () => {
    const fx = 100, fy = H * 0.58;
    ctx.fillStyle = '#88bbdd';
    drawEllipse(fx, fy, 18, 8);
    ctx.fill();
    ctx.fillStyle = '#aaddff';
    drawEllipse(fx, fy - 2, 14, 5);
    ctx.fill();
    // Water drop animation
    ctx.fillStyle = '#aaddff';
    const dropY = fy - 15 + Math.abs(Math.sin(game.time * 4)) * 10;
    ctx.beginPath();
    ctx.arc(fx, dropY, 2, 0, Math.PI * 2);
    ctx.fill();
    // Rim
    ctx.strokeStyle = '#6699bb';
    ctx.lineWidth = 2;
    drawEllipse(fx, fy, 18, 8);
    ctx.stroke();
  }); }

  if (owned.includes('blanket')) { withOffset('blanket', () => {
    ctx.fillStyle = '#b898d8';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(380, H * 0.6);
    ctx.quadraticCurveTo(410, H * 0.56, 440, H * 0.6);
    ctx.quadraticCurveTo(430, H * 0.64, 400, H * 0.66);
    ctx.quadraticCurveTo(385, H * 0.63, 380, H * 0.6);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Plaid pattern
    ctx.strokeStyle = '#a080c0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    for (let bl = 385; bl < 435; bl += 10) {
      ctx.beginPath(); ctx.moveTo(bl, H * 0.57); ctx.lineTo(bl, H * 0.66); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }); }

  if (owned.includes('catbed_blue')) { withOffset('catbed_blue', () => {
    ctx.fillStyle = '#4477aa';
    drawEllipse(420, H * 0.58, 35, 14);
    ctx.fill();
    ctx.fillStyle = '#6699cc';
    drawEllipse(420, H * 0.57, 28, 10);
    ctx.fill();
    // Pillow
    ctx.fillStyle = '#88bbdd';
    drawEllipse(420, H * 0.565, 16, 6);
    ctx.fill();
  }); }

  if (owned.includes('hammock')) { withOffset('hammock', () => {
    const hx = 60, hy = H * 0.3;
    // Poles
    ctx.strokeStyle = '#8a6040';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hx, hy - 10); ctx.lineTo(hx, hy + 60);
    ctx.moveTo(hx + 70, hy - 10); ctx.lineTo(hx + 70, hy + 60);
    ctx.stroke();
    // Fabric
    ctx.fillStyle = '#f6a';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.quadraticCurveTo(hx + 35, hy + 30, hx + 70, hy);
    ctx.lineTo(hx + 70, hy + 5);
    ctx.quadraticCurveTo(hx + 35, hy + 35, hx, hy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // Strings
    ctx.strokeStyle = '#c48';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, hy - 10); ctx.lineTo(hx + 5, hy);
    ctx.moveTo(hx + 70, hy - 10); ctx.lineTo(hx + 65, hy);
    ctx.stroke();
  }); }

  if (owned.includes('fishtank')) { withOffset('fishtank', () => {
    const ftx = 450, fty = H * 0.3;
    // Tank body (glass)
    ctx.fillStyle = 'rgba(150,210,255,0.4)';
    ctx.strokeStyle = '#88c';
    ctx.lineWidth = 2;
    drawRoundRect(ftx, fty, 50, 40, 4);
    ctx.fill();
    ctx.stroke();
    // Water
    ctx.fillStyle = 'rgba(100,180,255,0.3)';
    ctx.fillRect(ftx + 2, fty + 8, 46, 30);
    // Fish
    ctx.fillStyle = '#f80';
    const fishX = ftx + 25 + Math.sin(game.time * 2) * 12;
    const fishY = fty + 22 + Math.sin(game.time * 3) * 5;
    ctx.beginPath();
    ctx.ellipse(fishX, fishY, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(fishX - 5, fishY);
    ctx.lineTo(fishX - 10, fishY - 4);
    ctx.lineTo(fishX - 10, fishY + 4);
    ctx.closePath();
    ctx.fill();
    // Bubbles
    ctx.strokeStyle = 'rgba(200,230,255,0.6)';
    ctx.lineWidth = 1;
    const bubY = fty + 10 + Math.abs(Math.sin(game.time * 2)) * 15;
    ctx.beginPath(); ctx.arc(ftx + 35, bubY, 2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(ftx + 30, bubY - 5, 1.5, 0, Math.PI * 2); ctx.stroke();
    // Stand
    ctx.fillStyle = '#8a6040';
    ctx.fillRect(ftx + 5, fty + 40, 40, 5);
    ctx.fillRect(ftx + 10, fty + 45, 5, H * 0.22);
    ctx.fillRect(ftx + 35, fty + 45, 5, H * 0.22);
  }); }

  if (owned.includes('plant')) { withOffset('plant', () => {
    const px = 70, py = H * 0.56;
    // Pot
    ctx.fillStyle = '#c87040';
    ctx.beginPath();
    ctx.moveTo(px - 12, py); ctx.lineTo(px - 10, py + 18);
    ctx.lineTo(px + 10, py + 18); ctx.lineTo(px + 12, py);
    ctx.closePath();
    ctx.fill();
    // Rim
    ctx.fillStyle = '#b06030';
    ctx.fillRect(px - 13, py - 3, 26, 5);
    // Grass blades
    ctx.strokeStyle = '#5a5';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let gi = 0; gi < 7; gi++) {
      const gx = px - 8 + gi * 2.5;
      const bend = Math.sin(game.time * 1.5 + gi * 0.8) * 3;
      ctx.beginPath();
      ctx.moveTo(gx, py - 2);
      ctx.quadraticCurveTo(gx + bend, py - 18 - gi * 1.5, gx + bend * 1.5, py - 22 - Math.random() * 2);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }); }

  if (owned.includes('rug')) { withOffset('rug', () => {
    ctx.globalAlpha = 0.6;
    // Round rug with pattern
    ctx.fillStyle = '#cc6677';
    drawEllipse(300, H * 0.62, 50, 18);
    ctx.fill();
    ctx.fillStyle = '#dd8899';
    drawEllipse(300, H * 0.62, 35, 12);
    ctx.fill();
    ctx.fillStyle = '#eeb0b8';
    drawEllipse(300, H * 0.62, 18, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
  }); }

  if (owned.includes('bookshelf')) { withOffset('bookshelf', () => {
    const bx = 15, by = H * 0.2;
    // Shelf frame
    ctx.fillStyle = '#8a6040';
    ctx.fillRect(bx, by, 50, 80);
    // Shelves
    ctx.fillStyle = '#a07050';
    ctx.fillRect(bx, by + 25, 50, 4);
    ctx.fillRect(bx, by + 52, 50, 4);
    // Books (top shelf)
    const bookColors = ['#e44','#44a','#4a4','#fa0','#a4a','#4aa'];
    for (let bi = 0; bi < 5; bi++) {
      ctx.fillStyle = bookColors[bi];
      ctx.fillRect(bx + 4 + bi * 9, by + 4, 7, 21);
    }
    // Books (middle shelf)
    for (let bi = 0; bi < 4; bi++) {
      ctx.fillStyle = bookColors[bi + 2];
      ctx.fillRect(bx + 4 + bi * 11, by + 30, 9, 22);
    }
    // Cat figure on bottom shelf
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(bx + 25, by + 65, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx + 25, by + 58, 4, 0, Math.PI * 2);
    ctx.fill();
  }); }

  if (owned.includes('toybox')) { withOffset('toybox', () => {
    const tbx = 240, tby = H * 0.54;
    // Box
    ctx.fillStyle = '#e8c040';
    drawRoundRect(tbx, tby, 36, 25, 4);
    ctx.fill();
    ctx.strokeStyle = '#c8a020';
    ctx.lineWidth = 2;
    drawRoundRect(tbx, tby, 36, 25, 4);
    ctx.stroke();
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOYS', tbx + 18, tby + 16);
    // Yarn poking out
    ctx.fillStyle = '#f66';
    ctx.beginPath();
    ctx.arc(tbx + 10, tby - 3, 5, 0, Math.PI * 2);
    ctx.fill();
    // Mouse toy poking out
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.ellipse(tbx + 28, tby - 2, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }); }

  if (owned.includes('nightlight')) { withOffset('nightlight', () => {
    const nx = 540, ny = H * 0.45;
    // Base
    ctx.fillStyle = '#ddd';
    drawEllipse(nx, ny + 12, 10, 4);
    ctx.fill();
    ctx.fillRect(nx - 3, ny, 6, 12);
    // Glow
    const glowAlpha = 0.15 + Math.sin(game.time * 1.5) * 0.08;
    ctx.fillStyle = `rgba(255,240,180,${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(nx, ny - 5, 30, 0, Math.PI * 2);
    ctx.fill();
    // Bulb shape (moon)
    ctx.fillStyle = '#ffe888';
    ctx.beginPath();
    ctx.arc(nx, ny - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    // Moon cutout
    ctx.fillStyle = '#ffe888';
    ctx.beginPath();
    ctx.arc(nx + 3, ny - 7, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,240,180,${glowAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(nx + 4, ny - 7, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }); }

  if (owned.includes('painting')) { withOffset('painting', () => {
    const px2 = 350, py2 = H * 0.22;
    // Frame
    ctx.fillStyle = '#8a6040';
    ctx.fillRect(px2 - 2, py2 - 2, 54, 44);
    // Canvas
    ctx.fillStyle = '#f8f0e0';
    ctx.fillRect(px2, py2, 50, 40);
    // Cat painting (simple cartoon cat face)
    ctx.fillStyle = '#f4a442';
    ctx.beginPath();
    ctx.arc(px2 + 25, py2 + 22, 12, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.moveTo(px2 + 15, py2 + 13); ctx.lineTo(px2 + 18, py2 + 5); ctx.lineTo(px2 + 22, py2 + 13);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px2 + 28, py2 + 13); ctx.lineTo(px2 + 32, py2 + 5); ctx.lineTo(px2 + 35, py2 + 13);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(px2 + 21, py2 + 20, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px2 + 29, py2 + 20, 2, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = '#ffb0c0';
    ctx.beginPath(); ctx.arc(px2 + 25, py2 + 24, 1.5, 0, Math.PI * 2); ctx.fill();
    // Mouth
    ctx.strokeStyle = '#c88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px2 + 25, py2 + 25); ctx.lineTo(px2 + 23, py2 + 27);
    ctx.moveTo(px2 + 25, py2 + 25); ctx.lineTo(px2 + 27, py2 + 27);
    ctx.stroke();
    // Frame inner border
    ctx.strokeStyle = '#c8a060';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px2 + 1, py2 + 1, 48, 38);
  }); }

  // ── Color variants (reuse base drawing with different colors) ──
  if (owned.includes('catbed_green')) { withOffset('catbed_green', () => {
    ctx.fillStyle = '#4a8a4a'; drawEllipse(150, H * 0.58, 35, 14); ctx.fill();
    ctx.fillStyle = '#6aaa6a'; drawEllipse(150, H * 0.57, 28, 10); ctx.fill();
  }); }
  if (owned.includes('scratchpost_dark')) { withOffset('scratchpost_dark', () => {
    const spx = 480, spy = H * 0.38;
    ctx.fillStyle = '#5a4030'; ctx.fillRect(spx - 6, spy, 12, H * 0.28);
    ctx.strokeStyle = '#7a6050'; ctx.lineWidth = 3;
    for (let ry = 0; ry < H * 0.28; ry += 8) { ctx.beginPath(); ctx.moveTo(spx - 6, spy + ry); ctx.lineTo(spx + 6, spy + ry + 4); ctx.stroke(); }
    ctx.fillStyle = '#444'; drawRoundRect(spx - 18, spy - 6, 36, 10, 4); ctx.fill();
  }); }
  if (owned.includes('cattower_pink')) { withOffset('cattower_pink', () => {
    const tx = 520, ty = H * 0.25;
    ctx.fillStyle = '#c8a060'; ctx.fillRect(tx - 5, ty, 10, H * 0.42);
    ctx.fillStyle = '#8a6040'; drawRoundRect(tx - 25, ty + H * 0.32, 50, 12, 5); ctx.fill();
    ctx.fillStyle = '#e88aa0'; drawRoundRect(tx - 20, ty + H * 0.27, 40, 18, 6); ctx.fill();
    ctx.fillStyle = '#8a6040'; drawRoundRect(tx - 22, ty + H * 0.08, 44, 12, 5); ctx.fill();
    ctx.fillStyle = '#f6a0b8'; drawRoundRect(tx - 18, ty + H * 0.02, 36, 20, 6); ctx.fill();
    ctx.fillStyle = '#8a6040'; drawRoundRect(tx - 18, ty - 6, 36, 10, 5); ctx.fill();
  }); }
  if (owned.includes('foodbowl_blue')) { withOffset('foodbowl_blue', () => {
    ctx.fillStyle = '#8080cc'; drawEllipse(200, H * 0.62, 16, 6); ctx.fill();
    ctx.fillStyle = '#ff9966'; drawEllipse(200, H * 0.615, 12, 4); ctx.fill();
    ctx.strokeStyle = '#6060aa'; ctx.lineWidth = 1.5; drawEllipse(200, H * 0.62, 16, 6); ctx.stroke();
  }); }
  if (owned.includes('fountain_gold')) { withOffset('fountain_gold', () => {
    const fx = 100, fy = H * 0.58;
    ctx.fillStyle = '#daa520'; drawEllipse(fx, fy, 18, 8); ctx.fill();
    ctx.fillStyle = '#aaddff'; drawEllipse(fx, fy - 2, 14, 5); ctx.fill();
    ctx.fillStyle = '#aaddff'; const dropY = fy - 15 + Math.abs(Math.sin(game.time * 4)) * 10;
    ctx.beginPath(); ctx.arc(fx, dropY, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b8960f'; ctx.lineWidth = 2; drawEllipse(fx, fy, 18, 8); ctx.stroke();
  }); }
  if (owned.includes('blanket_blue')) { withOffset('blanket_blue', () => {
    ctx.fillStyle = '#6088c0'; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(380, H*0.6); ctx.quadraticCurveTo(410, H*0.56, 440, H*0.6); ctx.quadraticCurveTo(430, H*0.64, 400, H*0.66); ctx.quadraticCurveTo(385, H*0.63, 380, H*0.6); ctx.fill();
    ctx.globalAlpha = 1;
  }); }
  if (owned.includes('blanket_pink')) { withOffset('blanket_pink', () => {
    ctx.fillStyle = '#d888a8'; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(380, H*0.6); ctx.quadraticCurveTo(410, H*0.56, 440, H*0.6); ctx.quadraticCurveTo(430, H*0.64, 400, H*0.66); ctx.quadraticCurveTo(385, H*0.63, 380, H*0.6); ctx.fill();
    ctx.globalAlpha = 1;
  }); }
  if (owned.includes('hammock_green')) { withOffset('hammock_green', () => {
    const hx = 60, hy = H * 0.3;
    ctx.strokeStyle = '#8a6040'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(hx, hy - 10); ctx.lineTo(hx, hy + 60); ctx.moveTo(hx + 70, hy - 10); ctx.lineTo(hx + 70, hy + 60); ctx.stroke();
    ctx.fillStyle = '#6a6'; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 35, hy + 30, hx + 70, hy); ctx.lineTo(hx + 70, hy + 5); ctx.quadraticCurveTo(hx + 35, hy + 35, hx, hy + 5); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }); }
  if (owned.includes('plant_flower')) { withOffset('plant_flower', () => {
    const px = 70, py = H * 0.56;
    ctx.fillStyle = '#c87040'; ctx.beginPath(); ctx.moveTo(px-12,py); ctx.lineTo(px-10,py+18); ctx.lineTo(px+10,py+18); ctx.lineTo(px+12,py); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b06030'; ctx.fillRect(px-13,py-3,26,5);
    ctx.strokeStyle = '#5a5'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px, py-2); ctx.quadraticCurveTo(px-5, py-25, px-3, py-30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py-2); ctx.quadraticCurveTo(px+5, py-22, px+4, py-28); ctx.stroke();
    ctx.fillStyle = '#f6a'; ctx.beginPath(); ctx.arc(px-3, py-32, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f44'; ctx.beginPath(); ctx.arc(px+4, py-30, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(px-3, py-32, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px+4, py-30, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.lineCap = 'butt';
  }); }
  if (owned.includes('rug_blue')) { withOffset('rug_blue', () => {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#4477aa'; drawEllipse(300, H*0.62, 50, 18); ctx.fill();
    ctx.fillStyle = '#5599cc'; drawEllipse(300, H*0.62, 35, 12); ctx.fill();
    ctx.fillStyle = '#77bbee'; drawEllipse(300, H*0.62, 18, 6); ctx.fill();
    ctx.globalAlpha = 1;
  }); }
  if (owned.includes('rug_green')) { withOffset('rug_green', () => {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#448844'; drawEllipse(300, H*0.62, 50, 18); ctx.fill();
    ctx.fillStyle = '#55aa55'; drawEllipse(300, H*0.62, 35, 12); ctx.fill();
    ctx.fillStyle = '#77cc77'; drawEllipse(300, H*0.62, 18, 6); ctx.fill();
    ctx.globalAlpha = 1;
  }); }
  if (owned.includes('toybox_pink')) { withOffset('toybox_pink', () => {
    const tbx = 240, tby = H * 0.54;
    ctx.fillStyle = '#e080a0'; drawRoundRect(tbx, tby, 36, 25, 4); ctx.fill();
    ctx.strokeStyle = '#c06080'; ctx.lineWidth = 2; drawRoundRect(tbx, tby, 36, 25, 4); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TOYS', tbx+18, tby+16);
    ctx.fillStyle = '#66f'; ctx.beginPath(); ctx.arc(tbx+10, tby-3, 5, 0, Math.PI*2); ctx.fill();
  }); }
  if (owned.includes('nightlight_star')) { withOffset('nightlight_star', () => {
    const nx = 540, ny = H * 0.45;
    ctx.fillStyle = '#ddd'; drawEllipse(nx, ny+12, 10, 4); ctx.fill(); ctx.fillRect(nx-3, ny, 6, 12);
    const ga = 0.15 + Math.sin(game.time * 1.5) * 0.08;
    ctx.fillStyle = `rgba(200,220,255,${ga})`; ctx.beginPath(); ctx.arc(nx, ny-5, 30, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#aaccff';
    for (let si = 0; si < 5; si++) { const a = (si/5)*Math.PI*2 - Math.PI/2; const a2 = ((si+0.5)/5)*Math.PI*2 - Math.PI/2;
      ctx.beginPath(); ctx.moveTo(nx + Math.cos(a)*8, ny-5+Math.sin(a)*8); ctx.lineTo(nx + Math.cos(a2)*3.5, ny-5+Math.sin(a2)*3.5); ctx.lineTo(nx + Math.cos(a+Math.PI*2/5)*8, ny-5+Math.sin(a+Math.PI*2/5)*8); ctx.fill(); }
  }); }
  if (owned.includes('painting_sky')) { withOffset('painting_sky', () => {
    const px2 = 350, py2 = H * 0.22;
    ctx.fillStyle = '#8a6040'; ctx.fillRect(px2-2, py2-2, 54, 44);
    ctx.fillStyle = '#87CEEB'; ctx.fillRect(px2, py2, 50, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; drawEllipse(px2+15, py2+15, 12, 6); ctx.fill(); drawEllipse(px2+22, py2+13, 8, 5); ctx.fill();
    drawEllipse(px2+35, py2+22, 10, 5); ctx.fill(); drawEllipse(px2+40, py2+20, 7, 4); ctx.fill();
    ctx.fillStyle = '#7ec87e'; ctx.fillRect(px2, py2+30, 50, 10);
    ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 1.5; ctx.strokeRect(px2+1, py2+1, 48, 38);
  }); }

  if (owned.includes('couch')) { withOffset('couch', () => {
    const cx = 280, cy = H * 0.54;
    // Back
    ctx.fillStyle = '#b05a50';
    drawRoundRect(cx, cy - 18, 80, 22, 6);
    ctx.fill();
    // Seat
    ctx.fillStyle = '#c87060';
    drawRoundRect(cx, cy + 2, 80, 16, 5);
    ctx.fill();
    // Arms
    ctx.fillStyle = '#a04a40';
    drawRoundRect(cx - 8, cy - 12, 12, 32, 4);
    ctx.fill();
    drawRoundRect(cx + 76, cy - 12, 12, 32, 4);
    ctx.fill();
    // Cushion lines
    ctx.strokeStyle = '#a05848';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + 27, cy + 3); ctx.lineTo(cx + 27, cy + 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 53, cy + 3); ctx.lineTo(cx + 53, cy + 16); ctx.stroke();
  }); }

  if (owned.includes('couch_blue')) { withOffset('couch_blue', () => {
    const cx = 280, cy = H * 0.54;
    ctx.fillStyle = '#4466aa';
    drawRoundRect(cx, cy - 18, 80, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#5577bb';
    drawRoundRect(cx, cy + 2, 80, 16, 5);
    ctx.fill();
    ctx.fillStyle = '#3355aa';
    drawRoundRect(cx - 8, cy - 12, 12, 32, 4);
    ctx.fill();
    drawRoundRect(cx + 76, cy - 12, 12, 32, 4);
    ctx.fill();
    ctx.strokeStyle = '#4466aa';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + 27, cy + 3); ctx.lineTo(cx + 27, cy + 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 53, cy + 3); ctx.lineTo(cx + 53, cy + 16); ctx.stroke();
  }); }

  // ── Owned toys on the floor ──
  const toys = game.ownedToys;
  // Toy positions (spread across the floor)
  const toySpots = [
    { x: 340, y: H * 0.61 }, { x: 180, y: H * 0.60 }, { x: 460, y: H * 0.62 },
    { x: 120, y: H * 0.61 }, { x: 280, y: H * 0.63 }, { x: 400, y: H * 0.60 },
    { x: 220, y: H * 0.62 }, { x: 500, y: H * 0.61 },
  ];
  toys.forEach((toyId, i) => {
    const tPos = getToyXY(i);
    const tx = tPos.x, ty = tPos.y;

    if (toyId === 'yarn') {
      ctx.fillStyle = '#e55';
      ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c33';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0.5, 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx + 5, ty + 3); ctx.quadraticCurveTo(tx + 12, ty + 8, tx + 15, ty + 2); ctx.stroke();
    }
    if (toyId === 'bell') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.arc(tx, ty - 3, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c8a000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(tx, ty, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    if (toyId === 'mousetoy') {
      ctx.fillStyle = '#aaa';
      ctx.beginPath(); ctx.ellipse(tx, ty, 8, 5, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(tx - 6, ty - 3, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(tx - 7, ty - 4, 1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx + 7, ty); ctx.quadraticCurveTo(tx + 14, ty - 5, tx + 16, ty + 2); ctx.stroke();
    }
    if (toyId === 'fish_toy') {
      ctx.fillStyle = '#4ac';
      ctx.beginPath(); ctx.ellipse(tx, ty, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx + 6, ty); ctx.lineTo(tx + 12, ty - 4); ctx.lineTo(tx + 12, ty + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(tx - 3, ty - 1, 1, 0, Math.PI * 2); ctx.fill();
    }
    if (toyId === 'featherwand') {
      ctx.strokeStyle = '#8a6040';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 20, ty - 25); ctx.stroke();
      const featherWave = Math.sin(game.time * 2) * 3;
      ctx.fillStyle = '#e55';
      ctx.beginPath(); ctx.ellipse(tx + 20, ty - 27 + featherWave, 3, 8, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#55e';
      ctx.beginPath(); ctx.ellipse(tx + 23, ty - 25 + featherWave, 3, 7, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e5e';
      ctx.beginPath(); ctx.ellipse(tx + 17, ty - 26 + featherWave, 2, 6, 0.5, 0, Math.PI * 2); ctx.fill();
    }
    if (toyId === 'butterfly') {
      const bfly = Math.sin(game.time * 4) * 0.4;
      const bx2 = tx + Math.sin(game.time * 1.5) * 8;
      const by2 = ty - 10 + Math.sin(game.time * 2) * 5;
      ctx.fillStyle = '#f6a';
      ctx.beginPath(); ctx.ellipse(bx2 - 5, by2, 5 + bfly * 3, 4, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(bx2 + 5, by2, 5 + bfly * 3, 4, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.ellipse(bx2, by2, 1.5, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (toyId === 'laser') {
      ctx.fillStyle = '#666';
      drawRoundRect(tx - 3, ty - 2, 16, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#e22';
      ctx.beginPath(); ctx.arc(tx + 14, ty + 1, 2, 0, Math.PI * 2); ctx.fill();
      if (!game.laserActive) {
        // Auto laser dot when not being controlled
        const dotX = tx + 40 + Math.sin(game.time * 3) * 30;
        const dotY = ty - 10 + Math.cos(game.time * 2.3) * 15;
        ctx.fillStyle = 'rgba(255,0,0,0.6)';
        ctx.beginPath(); ctx.arc(dotX, dotY, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,100,100,0.2)';
        ctx.beginPath(); ctx.arc(dotX, dotY, 8, 0, Math.PI * 2); ctx.fill();
      }
      // Label hint
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('click & drag!', tx + 5, ty + 12);
    }
    if (toyId === 'rc_car') {
      const carX = tx + Math.sin(game.time * 1.2) * 15;
      const carY = ty + Math.cos(game.time * 0.8) * 5;
      ctx.fillStyle = '#44a';
      drawRoundRect(carX - 10, carY - 4, 20, 8, 3);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(carX - 6, carY + 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(carX + 6, carY + 4, 3, 0, Math.PI * 2); ctx.fill();
      // Mouse ears on top
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(carX - 4, carY - 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(carX + 4, carY - 5, 3, 0, Math.PI * 2); ctx.fill();
    }
  });
}
