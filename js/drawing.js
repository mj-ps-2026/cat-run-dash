// ============================================================
// CAT RUN DASH - Drawing Utilities
// Extracted from index.html
// Depends on: ctx, W, H, game, mouse, CAT_BREEDS, STAGE_SCALE,
//             STAGE_HEAD_RATIO, ACTIVITY_COLORS, ACTIVITY_ICONS,
//             MAX_PER_ACTIVITY (globals)
// ============================================================

// ============================================================
// DRAWING UTILITIES
// ============================================================
function drawRoundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawEllipse(cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function hitBox(mx, my, x, y, w, h) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function lighten(hex, amt) {
  let r = parseInt(hex.slice(1,3), 16);
  let g = parseInt(hex.slice(3,5), 16);
  let b = parseInt(hex.slice(5,7), 16);
  r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex, amt) {
  let r = parseInt(hex.slice(1,3), 16);
  let g = parseInt(hex.slice(3,5), 16);
  let b = parseInt(hex.slice(5,7), 16);
  r = Math.max(0, r - amt); g = Math.max(0, g - amt); b = Math.max(0, b - amt);
  return `rgb(${r},${g},${b})`;
}

// ============================================================
// BUTTON HELPER
// ============================================================
function drawButton(x, y, w, h, text, color, hovered = false, icon = '') {
  ctx.save();
  const hover = hovered && hitBox(mouse.x, mouse.y, x, y, w, h);

  ctx.fillStyle = hover ? lighten(color, 30) : color;
  ctx.strokeStyle = darken(color, 40);
  ctx.lineWidth = 3;
  drawRoundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();

  if (hover) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (icon) {
    ctx.font = '20px sans-serif';
    ctx.fillText(icon, x + w / 2, y + h / 2 - 10);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(text, x + w / 2, y + h / 2 + 12);
  } else {
    ctx.fillText(text, x + w / 2, y + h / 2);
  }
  ctx.restore();

  return hover;
}

// ============================================================
// CAT DRAWING
// ============================================================
function drawCat(x, y, breedIdx, stage, facing = 1, animTime = 0, walking = false, eyesClosed = false) {
  const breed = CAT_BREEDS[breedIdx];
  const s = STAGE_SCALE[stage];
  const headRatio = STAGE_HEAD_RATIO[stage];

  const bodyW = 40 * s;
  const bodyH = 30 * s;
  const headR = bodyW * headRatio;

  // Bounce animation
  const bounce = walking ? Math.sin(animTime * 8) * 3 * s : Math.sin(animTime * 2) * 1.5 * s;

  ctx.save();
  ctx.translate(x, y + bounce);

  // Tail
  ctx.strokeStyle = breed.bodyColor;
  ctx.lineWidth = 5 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const tailWag = Math.sin(animTime * 4) * 0.3;
  ctx.moveTo(-bodyW * 0.7 * facing, -bodyH * 0.1);
  ctx.quadraticCurveTo(
    -bodyW * 1.2 * facing, -bodyH * 0.8 + tailWag * 20,
    -bodyW * 0.9 * facing + Math.sin(animTime * 3) * 8, -bodyH * 1.2
  );
  ctx.stroke();

  // Body
  ctx.fillStyle = breed.bodyColor;
  drawEllipse(0, 0, bodyW, bodyH * 0.7);
  ctx.fill();

  // Tuxedo white belly
  if (breed.tuxedo) {
    ctx.fillStyle = breed.stripeColor;
    drawEllipse(0, bodyH * 0.1, bodyW * 0.6, bodyH * 0.45);
    ctx.fill();
  }

  // Calico patches
  if (breed.calico) {
    ctx.fillStyle = '#2a2a2a';
    drawEllipse(-bodyW * 0.3, -bodyH * 0.1, bodyW * 0.25, bodyH * 0.25);
    ctx.fill();
    ctx.fillStyle = '#f0eee8';
    drawEllipse(bodyW * 0.3, bodyH * 0.1, bodyW * 0.2, bodyH * 0.2);
    ctx.fill();
  }

  // Legs
  const legY = bodyH * 0.4;
  const legSpread = bodyW * 0.5;
  const legW = 7 * s;
  const legH = 14 * s;
  ctx.fillStyle = breed.bodyColor;
  for (let i = -1; i <= 1; i += 2) {
    const legBounce = walking ? Math.sin(animTime * 8 + i * 1.5) * 4 * s : 0;
    // Front legs
    drawEllipse(i * legSpread * 0.5 + facing * bodyW * 0.2, legY + legH * 0.3 + legBounce, legW, legH);
    ctx.fill();
    // Back legs
    drawEllipse(i * legSpread * 0.5 - facing * bodyW * 0.2, legY + legH * 0.3 - legBounce, legW * 1.1, legH);
    ctx.fill();
  }

  // Paw tips (white for tuxedo)
  if (breed.tuxedo) {
    ctx.fillStyle = '#f0eee8';
    for (let i = -1; i <= 1; i += 2) {
      const legBounce = walking ? Math.sin(animTime * 8 + i * 1.5) * 4 * s : 0;
      drawEllipse(i * legSpread * 0.5 + facing * bodyW * 0.2, legY + legH * 0.7 + legBounce, legW * 0.7, legH * 0.3);
      ctx.fill();
    }
  }

  // Head
  const headY = -bodyH * 0.5;
  const headX = facing * bodyW * 0.15;
  ctx.fillStyle = breed.bodyColor;
  drawEllipse(headX, headY, headR, headR * 0.9);
  ctx.fill();

  // Tuxedo face
  if (breed.tuxedo) {
    ctx.fillStyle = '#f0eee8';
    ctx.beginPath();
    ctx.moveTo(headX - headR * 0.3, headY + headR * 0.1);
    ctx.lineTo(headX, headY - headR * 0.2);
    ctx.lineTo(headX + headR * 0.3, headY + headR * 0.1);
    ctx.lineTo(headX, headY + headR * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  // Ears
  const earW = headR * 0.5;
  const earH = headR * 0.7;
  for (let side = -1; side <= 1; side += 2) {
    const earX = headX + side * headR * 0.6;
    const earY = headY - headR * 0.7;
    // Outer ear
    ctx.fillStyle = breed.bodyColor;
    ctx.beginPath();
    ctx.moveTo(earX - earW * 0.5, earY + earH * 0.5);
    ctx.lineTo(earX, earY - earH * 0.5);
    ctx.lineTo(earX + earW * 0.5, earY + earH * 0.5);
    ctx.closePath();
    ctx.fill();
    // Inner ear
    ctx.fillStyle = breed.earInner;
    ctx.beginPath();
    ctx.moveTo(earX - earW * 0.25, earY + earH * 0.3);
    ctx.lineTo(earX, earY - earH * 0.2);
    ctx.lineTo(earX + earW * 0.25, earY + earH * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // Eyes
  const eyeSpread = headR * 0.4;
  const eyeY = headY - headR * 0.05;
  const eyeR = headR * 0.22;
  for (let side = -1; side <= 1; side += 2) {
    const eyeX = headX + side * eyeSpread;
    if (eyesClosed) {
      // Closed eyes — happy curved arcs
      ctx.strokeStyle = '#333';
      ctx.lineWidth = Math.max(1.5, 2 * s);
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeR * 0.8, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else {
      // Open eyes
      ctx.fillStyle = '#fff';
      drawEllipse(eyeX, eyeY, eyeR, eyeR * 1.1);
      ctx.fill();
      ctx.fillStyle = '#111';
      drawEllipse(eyeX + facing * eyeR * 0.15, eyeY, eyeR * 0.55, eyeR * 0.65);
      ctx.fill();
      ctx.fillStyle = '#fff';
      drawEllipse(eyeX + eyeR * 0.2, eyeY - eyeR * 0.25, eyeR * 0.2, eyeR * 0.2);
      ctx.fill();
      ctx.fillStyle = breed.eyeColor;
      ctx.globalAlpha = 0.4;
      drawEllipse(eyeX + facing * eyeR * 0.1, eyeY, eyeR * 0.45, eyeR * 0.55);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Nose
  ctx.fillStyle = '#ffb0c0';
  ctx.beginPath();
  const noseX = headX + facing * headR * 0.05;
  const noseY = headY + headR * 0.25;
  ctx.moveTo(noseX, noseY - 2 * s);
  ctx.lineTo(noseX - 3 * s, noseY + 2 * s);
  ctx.lineTo(noseX + 3 * s, noseY + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#c08090';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(noseX, noseY + 2 * s);
  ctx.lineTo(noseX - 3 * s, noseY + 5 * s);
  ctx.moveTo(noseX, noseY + 2 * s);
  ctx.lineTo(noseX + 3 * s, noseY + 5 * s);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = breed.bodyColor === '#2a2a2a' ? '#666' : '#888';
  ctx.lineWidth = 1 * s;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(noseX + side * 4 * s, noseY + 1 * s + i * 2 * s);
      ctx.lineTo(noseX + side * (headR * 0.9), noseY + i * 4 * s);
      ctx.stroke();
    }
  }

  // Stripes (for tabby cats)
  if (!breed.calico && !breed.tuxedo && breed.stripeColor !== breed.bodyColor) {
    ctx.strokeStyle = breed.stripeColor;
    ctx.lineWidth = 2 * s;
    ctx.globalAlpha = 0.3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * bodyW * 0.2 - bodyW * 0.1, -bodyH * 0.4);
      ctx.quadraticCurveTo(i * bodyW * 0.2, -bodyH * 0.1, i * bodyW * 0.2 + bodyW * 0.1, bodyH * 0.2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // === ACCESSORIES ===
  const eq = game.equipped;

  // ── Back accessories ──
  if (eq.back === 'cape' || eq.back === 'cape_blue') {
    ctx.fillStyle = eq.back === 'cape' ? '#e44' : '#44a';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(-facing * bodyW * 0.1, -bodyH * 0.3);
    ctx.quadraticCurveTo(-facing * bodyW * 0.8, bodyH * 0.2, -facing * bodyW * 0.5, bodyH * 0.8 + Math.sin(animTime * 3) * 4);
    ctx.lineTo(-facing * bodyW * 0.1, bodyH * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (eq.back === 'wings_angel') {
    ctx.globalAlpha = 0.8;
    for (let wSide = -1; wSide <= 1; wSide += 2) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      const wx = -facing * bodyW * 0.2;
      ctx.moveTo(wx, -bodyH * 0.2);
      ctx.quadraticCurveTo(wx + wSide * bodyW * 0.9, -bodyH * 1.0 + Math.sin(animTime * 2 + wSide) * 3, wx + wSide * bodyW * 0.7, -bodyH * 0.1);
      ctx.quadraticCurveTo(wx + wSide * bodyW * 0.4, bodyH * 0.1, wx, bodyH * 0.1);
      ctx.fill();
      // Feather lines
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx + wSide * bodyW * 0.2, -bodyH * 0.3);
      ctx.lineTo(wx + wSide * bodyW * 0.5, -bodyH * 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (eq.back === 'wings_bat') {
    ctx.globalAlpha = 0.85;
    for (let wSide = -1; wSide <= 1; wSide += 2) {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      const wx = -facing * bodyW * 0.2;
      ctx.moveTo(wx, -bodyH * 0.15);
      ctx.lineTo(wx + wSide * bodyW * 0.8, -bodyH * 0.9 + Math.sin(animTime * 3 + wSide) * 3);
      ctx.lineTo(wx + wSide * bodyW * 0.5, -bodyH * 0.3);
      ctx.lineTo(wx + wSide * bodyW * 0.7, -bodyH * 0.1);
      ctx.lineTo(wx + wSide * bodyW * 0.3, bodyH * 0.1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (eq.back === 'backpack') {
    ctx.fillStyle = '#e07050';
    const bpx = -facing * bodyW * 0.35;
    drawRoundRect(bpx - 8 * s, -bodyH * 0.35, 16 * s, 18 * s, 4 * s);
    ctx.fill();
    ctx.fillStyle = '#c05030';
    ctx.fillRect(bpx - 6 * s, -bodyH * 0.15, 12 * s, 2 * s);
    // Buckle
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(bpx, -bodyH * 0.1, 2 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Neck accessories ──
  const neckY2 = headY + headR * 0.6;
  if (eq.neck === 'collar_red' || eq.neck === 'collar_gold' || eq.neck === 'collar_purple') {
    const colColors = { collar_red: '#e33', collar_gold: '#daa520', collar_purple: '#a050d0' };
    const tagColors = { collar_red: '#ff0', collar_gold: '#fff', collar_purple: '#e8a0ff' };
    ctx.strokeStyle = colColors[eq.neck];
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.ellipse(headX * 0.5, neckY2, bodyW * 0.35, bodyH * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = tagColors[eq.neck];
    ctx.beginPath();
    ctx.arc(headX * 0.5, neckY2 + bodyH * 0.15, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (eq.neck === 'bell_collar') {
    ctx.strokeStyle = '#e33';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.ellipse(headX * 0.5, neckY2, bodyW * 0.35, bodyH * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Bell
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(headX * 0.5, neckY2 + bodyH * 0.17, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8960f';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(headX * 0.5, neckY2 + bodyH * 0.19, 1 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (eq.neck === 'bowtie') {
    const btx = headX * 0.5, bty = neckY2;
    ctx.fillStyle = '#e33';
    ctx.beginPath();
    ctx.moveTo(btx, bty);
    ctx.lineTo(btx - 8 * s, bty - 5 * s);
    ctx.lineTo(btx - 8 * s, bty + 5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(btx, bty);
    ctx.lineTo(btx + 8 * s, bty - 5 * s);
    ctx.lineTo(btx + 8 * s, bty + 5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c22';
    ctx.beginPath();
    ctx.arc(btx, bty, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (eq.neck === 'flower_lei') {
    ctx.lineWidth = 3 * s;
    const leiR = bodyW * 0.36;
    for (let fi = 0; fi < 8; fi++) {
      const angle = (fi / 8) * Math.PI * 2;
      const fx2 = headX * 0.5 + Math.cos(angle) * leiR;
      const fy2 = neckY2 + Math.sin(angle) * bodyH * 0.18;
      const flowerColors = ['#f6a', '#f80', '#ff0', '#f44', '#f6a', '#fa0', '#ff4', '#e55'];
      ctx.fillStyle = flowerColors[fi];
      ctx.beginPath();
      ctx.arc(fx2, fy2, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // Vine
    ctx.strokeStyle = '#4a4';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.ellipse(headX * 0.5, neckY2, leiR, bodyH * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (eq.neck === 'bandana') {
    ctx.fillStyle = '#e55';
    ctx.beginPath();
    ctx.moveTo(headX * 0.5 - bodyW * 0.3, neckY2 - 3 * s);
    ctx.lineTo(headX * 0.5 + bodyW * 0.3, neckY2 - 3 * s);
    ctx.lineTo(headX * 0.5, neckY2 + bodyH * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c33';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (eq.neck === 'scarf') {
    ctx.fillStyle = '#6af';
    ctx.beginPath();
    ctx.ellipse(headX * 0.5, neckY2, bodyW * 0.38, bodyH * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6af';
    ctx.beginPath();
    ctx.moveTo(headX * 0.5 + facing * bodyW * 0.2, neckY2);
    ctx.quadraticCurveTo(headX * 0.5 + facing * bodyW * 0.5, neckY2 + bodyH * 0.3, headX * 0.5 + facing * bodyW * 0.3, neckY2 + bodyH * 0.5 + Math.sin(animTime * 2) * 3);
    ctx.lineTo(headX * 0.5 + facing * bodyW * 0.15, neckY2 + bodyH * 0.1);
    ctx.fill();
    ctx.strokeStyle = '#48d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headX * 0.5 - bodyW * 0.15, neckY2 - bodyH * 0.08);
    ctx.lineTo(headX * 0.5 + bodyW * 0.15, neckY2 - bodyH * 0.08);
    ctx.stroke();
  }
  if (eq.neck === 'pearl_necklace') {
    const pearlR = bodyW * 0.34;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(headX * 0.5, neckY2, pearlR, bodyH * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let pi = 0; pi < 10; pi++) {
      const angle = (pi / 10) * Math.PI * 2;
      const px2 = headX * 0.5 + Math.cos(angle) * pearlR;
      const py2 = neckY2 + Math.sin(angle) * bodyH * 0.15;
      ctx.fillStyle = '#f8f4f0';
      ctx.beginPath();
      ctx.arc(px2, py2, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(px2 - 0.5 * s, py2 - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Eye accessories ──
  if (eq.eyes === 'sunglasses') {
    ctx.fillStyle = 'rgba(30,30,30,0.85)';
    for (let side2 = -1; side2 <= 1; side2 += 2) {
      const sgX = headX + side2 * eyeSpread;
      drawRoundRect(sgX - eyeR * 1.3, eyeY - eyeR * 1.1, eyeR * 2.6, eyeR * 2, eyeR * 0.4);
      ctx.fill();
    }
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(headX - eyeSpread + eyeR * 1.1, eyeY);
    ctx.lineTo(headX + eyeSpread - eyeR * 1.1, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headX - eyeSpread - eyeR * 1.2, eyeY);
    ctx.lineTo(headX - headR * 0.8, eyeY - eyeR);
    ctx.moveTo(headX + eyeSpread + eyeR * 1.2, eyeY);
    ctx.lineTo(headX + headR * 0.8, eyeY - eyeR);
    ctx.stroke();
  }
  if (eq.eyes === 'heart_glasses') {
    for (let side2 = -1; side2 <= 1; side2 += 2) {
      const sgX = headX + side2 * eyeSpread;
      ctx.fillStyle = 'rgba(220,40,80,0.8)';
      // Heart shape
      ctx.beginPath();
      const hr = eyeR * 1.2;
      ctx.moveTo(sgX, eyeY + hr * 0.6);
      ctx.bezierCurveTo(sgX - hr * 1.2, eyeY - hr * 0.3, sgX - hr * 0.6, eyeY - hr * 1.2, sgX, eyeY - hr * 0.4);
      ctx.bezierCurveTo(sgX + hr * 0.6, eyeY - hr * 1.2, sgX + hr * 1.2, eyeY - hr * 0.3, sgX, eyeY + hr * 0.6);
      ctx.fill();
    }
    // Bridge
    ctx.strokeStyle = '#c22';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(headX - eyeSpread + eyeR * 0.8, eyeY - eyeR * 0.2);
    ctx.lineTo(headX + eyeSpread - eyeR * 0.8, eyeY - eyeR * 0.2);
    ctx.stroke();
  }
  if (eq.eyes === 'star_glasses') {
    for (let side2 = -1; side2 <= 1; side2 += 2) {
      const sgX = headX + side2 * eyeSpread;
      ctx.fillStyle = 'rgba(255,200,0,0.85)';
      // Star shape
      ctx.beginPath();
      const sr = eyeR * 1.3;
      for (let si = 0; si < 5; si++) {
        const a1 = (si / 5) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((si + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(sgX + Math.cos(a1) * sr, eyeY + Math.sin(a1) * sr);
        ctx.lineTo(sgX + Math.cos(a2) * sr * 0.45, eyeY + Math.sin(a2) * sr * 0.45);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c90';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Bridge
    ctx.strokeStyle = '#c90';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(headX - eyeSpread + eyeR * 0.8, eyeY);
    ctx.lineTo(headX + eyeSpread - eyeR * 0.8, eyeY);
    ctx.stroke();
  }
  if (eq.eyes === 'monocle') {
    const mX = headX + eyeSpread; // right eye
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.arc(mX, eyeY, eyeR * 1.4, 0, Math.PI * 2);
    ctx.stroke();
    // Lens glare
    ctx.fillStyle = 'rgba(200,230,255,0.25)';
    ctx.beginPath();
    ctx.arc(mX, eyeY, eyeR * 1.3, 0, Math.PI * 2);
    ctx.fill();
    // Chain
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(mX, eyeY + eyeR * 1.4);
    ctx.quadraticCurveTo(mX + bodyW * 0.3, eyeY + bodyH * 0.5, headX * 0.5, neckY2);
    ctx.stroke();
  }

  // ── Head accessories ──
  const hatY = headY - headR * 0.9;
  if (eq.head === 'bow_blue' || eq.head === 'bow_pink' || eq.head === 'bow_red') {
    const bowColors = { bow_blue: ['#44a','#66d'], bow_pink: ['#f6a','#fad'], bow_red: ['#c22','#f66'] };
    const [bowColor, bowLight] = bowColors[eq.head];
    ctx.fillStyle = bowColor;
    ctx.beginPath();
    ctx.ellipse(headX - 7 * s, hatY, 6 * s, 4 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + 7 * s, hatY, 6 * s, 4 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bowLight;
    ctx.beginPath();
    ctx.arc(headX, hatY, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (eq.head === 'flower_crown') {
    // Vine circle
    ctx.strokeStyle = '#4a4';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.ellipse(headX, hatY + 2 * s, headR * 0.6, 4 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Flowers
    const fcColors = ['#f6a','#fa0','#f44','#ff0','#f8d','#e66'];
    for (let fi = 0; fi < 6; fi++) {
      const a = (fi / 6) * Math.PI * 2;
      const fx2 = headX + Math.cos(a) * headR * 0.6;
      const fy2 = hatY + 2 * s + Math.sin(a) * 4 * s;
      ctx.fillStyle = fcColors[fi];
      ctx.beginPath();
      ctx.arc(fx2, fy2, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(fx2, fy2, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (eq.head === 'beanie') {
    ctx.fillStyle = '#6a6';
    ctx.beginPath();
    ctx.ellipse(headX, hatY - 2 * s, headR * 0.65, headR * 0.45, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Brim fold
    ctx.fillStyle = '#585';
    ctx.beginPath();
    ctx.ellipse(headX, hatY + 2 * s, headR * 0.7, 3 * s, 0, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX, hatY + 2 * s, headR * 0.7, 3 * s, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Pom pom
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX, hatY - headR * 0.4, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (eq.head === 'party_hat') {
    ctx.fillStyle = '#e44';
    ctx.beginPath();
    ctx.moveTo(headX - headR * 0.4, hatY + 3 * s);
    ctx.lineTo(headX, hatY - 16 * s);
    ctx.lineTo(headX + headR * 0.4, hatY + 3 * s);
    ctx.closePath();
    ctx.fill();
    // Stripes
    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 2 * s;
    for (let pi = 1; pi <= 3; pi++) {
      const py3 = hatY + 3 * s - pi * 4.5 * s;
      const pw = headR * 0.4 * (1 - pi * 0.22);
      ctx.beginPath();
      ctx.moveTo(headX - pw, py3);
      ctx.lineTo(headX + pw, py3);
      ctx.stroke();
    }
    // Pom
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(headX, hatY - 16 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (eq.head === 'cowboy_hat') {
    ctx.fillStyle = '#b8864e';
    // Brim (wide)
    ctx.beginPath();
    ctx.ellipse(headX, hatY + 2 * s, headR * 1.0, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Crown (dented top)
    ctx.beginPath();
    ctx.moveTo(headX - headR * 0.45, hatY + 2 * s);
    ctx.quadraticCurveTo(headX - headR * 0.45, hatY - 12 * s, headX - headR * 0.15, hatY - 10 * s);
    ctx.quadraticCurveTo(headX, hatY - 8 * s, headX + headR * 0.15, hatY - 10 * s);
    ctx.quadraticCurveTo(headX + headR * 0.45, hatY - 12 * s, headX + headR * 0.45, hatY + 2 * s);
    ctx.closePath();
    ctx.fill();
    // Band
    ctx.fillStyle = '#8a5e2a';
    ctx.fillRect(headX - headR * 0.45, hatY - 1 * s, headR * 0.9, 3 * s);
  }
  if (eq.head === 'wizard_hat') {
    // Tall pointy hat
    ctx.fillStyle = '#336';
    ctx.beginPath();
    ctx.moveTo(headX - headR * 0.55, hatY + 3 * s);
    ctx.quadraticCurveTo(headX - headR * 0.1, hatY - 22 * s, headX + headR * 0.3, hatY - 20 * s);
    ctx.lineTo(headX + headR * 0.55, hatY + 3 * s);
    ctx.closePath();
    ctx.fill();
    // Brim
    ctx.beginPath();
    ctx.ellipse(headX, hatY + 3 * s, headR * 0.75, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stars
    ctx.fillStyle = '#ff0';
    ctx.font = `${6 * s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('\u2605', headX - 3 * s, hatY - 6 * s);
    ctx.fillText('\u2605', headX + 5 * s, hatY - 12 * s);
    ctx.font = `${4 * s}px sans-serif`;
    ctx.fillText('\u2605', headX + 1 * s, hatY - 2 * s);
  }
  if (eq.head === 'pirate_hat') {
    ctx.fillStyle = '#222';
    // Hat body
    ctx.beginPath();
    ctx.moveTo(headX - headR * 0.8, hatY + 2 * s);
    ctx.quadraticCurveTo(headX - headR * 0.5, hatY - 10 * s, headX, hatY - 6 * s);
    ctx.quadraticCurveTo(headX + headR * 0.5, hatY - 10 * s, headX + headR * 0.8, hatY + 2 * s);
    ctx.closePath();
    ctx.fill();
    // Brim
    ctx.beginPath();
    ctx.ellipse(headX, hatY + 3 * s, headR * 0.8, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Skull
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX, hatY - 4 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.fill();
    // Crossbones
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(headX - 4 * s, hatY - 1 * s); ctx.lineTo(headX + 4 * s, hatY - 7 * s);
    ctx.moveTo(headX + 4 * s, hatY - 1 * s); ctx.lineTo(headX - 4 * s, hatY - 7 * s);
    ctx.stroke();
  }
  if (eq.head === 'tophat') {
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(headX, hatY + 2 * s, headR * 0.7, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    drawRoundRect(headX - headR * 0.35, hatY - 16 * s, headR * 0.7, 18 * s, 3 * s);
    ctx.fill();
    ctx.fillStyle = '#a44';
    ctx.fillRect(headX - headR * 0.35, hatY - 3 * s, headR * 0.7, 3 * s);
  }
  if (eq.head === 'crown') {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    const cw = headR * 0.65;
    const ch = 10 * s;
    ctx.moveTo(headX - cw, hatY);
    ctx.lineTo(headX - cw, hatY - ch);
    ctx.lineTo(headX - cw * 0.5, hatY - ch * 0.5);
    ctx.lineTo(headX, hatY - ch);
    ctx.lineTo(headX + cw * 0.5, hatY - ch * 0.5);
    ctx.lineTo(headX + cw, hatY - ch);
    ctx.lineTo(headX + cw, hatY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8960f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#e33';
    ctx.beginPath(); ctx.arc(headX, hatY - ch * 0.7, 2 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#33e';
    ctx.beginPath(); ctx.arc(headX - cw * 0.55, hatY - ch * 0.5, 1.5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headX + cw * 0.55, hatY - ch * 0.5, 1.5 * s, 0, Math.PI * 2); ctx.fill();
  }
  if (eq.head === 'halo') {
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5 * s;
    ctx.globalAlpha = 0.7 + Math.sin(animTime * 3) * 0.2;
    ctx.beginPath();
    ctx.ellipse(headX, hatY - 6 * s, headR * 0.55, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(headX, hatY - 6 * s, headR * 0.5, 2.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ============================================================
// DOG DRAWING
// ============================================================
function drawDog(x, y, type, animTime, facing = 1) {
  const colors = [
    { body: '#b8864e', ear: '#8a5e2a', spot: '#d4a060' },
    { body: '#666', ear: '#444', spot: '#888' },
    { body: '#c4956a', ear: '#a07040', spot: '#e0b890' },
  ];
  const c = colors[type % colors.length];
  const s = 1;
  const bounce = Math.sin(animTime * 6) * 2;

  ctx.save();
  ctx.translate(x, y + bounce);

  // Tail
  ctx.strokeStyle = c.body;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-20 * facing, -8);
  ctx.quadraticCurveTo(-30 * facing, -25 + Math.sin(animTime * 8) * 8, -25 * facing, -30);
  ctx.stroke();

  // Body
  ctx.fillStyle = c.body;
  drawEllipse(0, 0, 28, 18);
  ctx.fill();

  // Spot
  ctx.fillStyle = c.spot;
  drawEllipse(-5 * facing, -3, 10, 8);
  ctx.fill();

  // Legs
  ctx.fillStyle = c.body;
  for (let i = -1; i <= 1; i += 2) {
    const lb = Math.sin(animTime * 6 + i) * 4;
    drawEllipse(i * 12 + facing * 6, 14 + lb, 5, 10);
    ctx.fill();
    drawEllipse(i * 12 - facing * 6, 14 - lb, 5, 10);
    ctx.fill();
  }

  // Head
  const headX = facing * 22;
  const headY = -10;
  ctx.fillStyle = c.body;
  drawEllipse(headX, headY, 16, 14);
  ctx.fill();

  // Snout
  ctx.fillStyle = c.spot;
  drawEllipse(headX + facing * 12, headY + 4, 9, 7);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#222';
  drawEllipse(headX + facing * 18, headY + 2, 4, 3);
  ctx.fill();

  // Mouth (angry)
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(headX + facing * 10, headY + 8);
  ctx.lineTo(headX + facing * 18, headY + 7);
  ctx.stroke();

  // Teeth
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(headX + facing * 12, headY + 7);
  ctx.lineTo(headX + facing * 13, headY + 11);
  ctx.lineTo(headX + facing * 14, headY + 7);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(headX + facing * 15, headY + 7);
  ctx.lineTo(headX + facing * 16, headY + 10);
  ctx.lineTo(headX + facing * 17, headY + 7);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  drawEllipse(headX + facing * 4, headY - 4, 5, 5);
  ctx.fill();
  ctx.fillStyle = '#553';
  drawEllipse(headX + facing * 5, headY - 3, 3, 3.5);
  ctx.fill();
  ctx.fillStyle = '#fff';
  drawEllipse(headX + facing * 5.5, headY - 4.5, 1.2, 1.2);
  ctx.fill();

  // Angry eyebrows
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(headX + facing * -1, headY - 9);
  ctx.lineTo(headX + facing * 9, headY - 7);
  ctx.stroke();

  // Ears (floppy)
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  const earX = headX - facing * 4;
  ctx.ellipse(earX, headY - 10, 7, 10, facing * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================
// PAW METER
// ============================================================
function drawPawMeter(x, y, care, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Paw pad positions (toe beans + metacarpal + carpal)
  const beans = [
    { x: -28, y: -35, r: 11, act: 'feed' },   // toe 1
    { x: -9,  y: -42, r: 11, act: 'play' },    // toe 2
    { x: 9,   y: -42, r: 11, act: 'brush' },   // toe 3
    { x: 28,  y: -35, r: 11, act: 'water' },   // toe 4
    { x: 0,   y: 0,   r: 20, act: 'walk' },    // metacarpal (big pad)
    { x: -30, y: 15,  r: 8,  act: 'gather' },  // carpal (side pad)
  ];

  // Draw paw outline bg
  ctx.fillStyle = '#f5e0d0';
  ctx.strokeStyle = '#d4a080';
  ctx.lineWidth = 3;

  beans.forEach(b => {
    drawEllipse(b.x, b.y, b.r, b.r * 0.9);
    ctx.fill();
    ctx.stroke();
  });

  // Fill based on progress
  beans.forEach((b, i) => {
    const act = b.act;
    const progress = care[act] / MAX_PER_ACTIVITY;
    if (progress > 0) {
      ctx.fillStyle = ACTIVITY_COLORS[i];
      ctx.globalAlpha = 0.3 + progress * 0.7;
      drawEllipse(b.x, b.y, b.r * progress, b.r * 0.9 * progress);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Label
    ctx.fillStyle = '#865';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${care[act]}/${MAX_PER_ACTIVITY}`, b.x, b.y + b.r + 12);

    // Icon
    ctx.font = b.r > 15 ? '16px sans-serif' : '11px sans-serif';
    ctx.fillText(ACTIVITY_ICONS[i], b.x, b.y + 4);
  });

  ctx.restore();
}

// ============================================================
// FLOATING TEXT
// ============================================================
function addFloat(x, y, text, color = '#fff', opts) {
  const screen = opts && opts.screen;
  game.floats.push({ x, y, text, color, life: 1.5, screen: !!screen });
}

function updateFloats(dt) {
  game.floats = game.floats.filter(f => {
    f.y -= 30 * dt;
    f.life -= dt;
    return f.life > 0;
  });
}

function drawFloats(scrollX) {
  const sx = scrollX || 0;
  game.floats.forEach(f => {
    const fx = f.screen ? f.x : f.x - sx;
    ctx.globalAlpha = Math.min(1, f.life * 2);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, fx, f.y);
    ctx.globalAlpha = 1;
  });
}

// ============================================================
// PARTICLE SYSTEM
// ============================================================
function spawnParticles(arr, x, y, count, color, speed = 100) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = speed * (0.5 + Math.random());
    arr.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 0.5 + Math.random() * 0.5,
      color,
      size: 2 + Math.random() * 4
    });
  }
}

function updateParticles(arr, dt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const p = arr[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.size *= 0.98;
    if (p.life <= 0) arr.splice(i, 1);
  }
}

function drawParticles(arr, offsetX = 0, offsetY = 0) {
  arr.forEach(p => {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x - offsetX, p.y - offsetY, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

// ============================================================
// BACKGROUND DRAWING
// ============================================================
function drawGrassBg() {
  ctx.fillStyle = '#7ec87e';
  ctx.fillRect(0, 0, W, H);
  // Subtle grass tufts
  ctx.fillStyle = '#6ab86a';
  for (let i = 0; i < 80; i++) {
    const gx = (i * 97 + 33) % W;
    const gy = (i * 131 + 17) % H;
    ctx.beginPath();
    ctx.ellipse(gx, gy, 3, 6, (i * 0.7) % Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSkyBg(totalW) {
  const tw = totalW || W;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#87CEEB');
  grad.addColorStop(0.6, '#b8e4f7');
  grad.addColorStop(1, '#7ec87e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, tw, H);
  // Clouds — repeat across wide home
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const cloudSets = [[100, 60, 50], [300, 40, 40], [550, 70, 35], [700, 30, 45]];
  for (let seg = 0; seg < HOME_ROOMS; seg++) {
    const ox = seg * HOME_ROOM_W;
    cloudSets.forEach(([cx, cy, r]) => {
      drawEllipse(ox + cx + Math.sin(game.time * 0.1 + cx + seg) * 10, cy, r, r * 0.5);
      ctx.fill();
      drawEllipse(ox + cx + r * 0.6, cy - 5, r * 0.7, r * 0.4);
      ctx.fill();
      drawEllipse(ox + cx - r * 0.5, cy + 3, r * 0.6, r * 0.35);
      ctx.fill();
    });
  }
}

function drawHomeBg() {
  const tw = typeof HOME_TOTAL_W !== 'undefined' ? HOME_TOTAL_W : W;
  drawSkyBg(tw);
  // Floor
  ctx.fillStyle = '#f5deb3';
  ctx.fillRect(0, H * 0.65, tw, H * 0.35);
  // Wall
  ctx.fillStyle = '#ffe8d0';
  ctx.fillRect(0, H * 0.15, tw, H * 0.5);
  // Baseboard
  ctx.fillStyle = '#d4a87a';
  ctx.fillRect(0, H * 0.63, tw, H * 0.04);
  // Window in each room segment
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  for (let seg = 0; seg < HOME_ROOMS; seg++) {
    const ox = seg * HOME_ROOM_W;
    ctx.fillStyle = '#87CEEB';
    drawRoundRect(ox + 550, H * 0.2, 120, 100, 8);
    ctx.fill();
    ctx.strokeRect(ox + 552, H * 0.2 + 2, 116, 96);
    ctx.beginPath(); ctx.moveTo(ox + 610, H * 0.2); ctx.lineTo(ox + 610, H * 0.2 + 100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 550, H * 0.2 + 50); ctx.lineTo(ox + 670, H * 0.2 + 50); ctx.stroke();
  }
}

// ============================================================
// CONFETTI
// ============================================================
function spawnConfetti(cx, cy, count) {
  for (let i = 0; i < count; i++) {
    game.confetti.push({
      x: cx + (Math.random() - 0.5) * 60,
      y: cy - Math.random() * 30,
      vx: (Math.random() - 0.5) * 200,
      vy: -150 - Math.random() * 200,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 10,
      color: ['#f44','#4a4','#44f','#fa0','#f6a','#4af','#ff0','#a4f'][Math.floor(Math.random() * 8)],
      size: 4 + Math.random() * 5,
      life: 2.5 + Math.random() * 1.5,
    });
  }
}

function drawConfetti() {
  game.confetti.forEach(c => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.globalAlpha = Math.min(1, c.life);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}
