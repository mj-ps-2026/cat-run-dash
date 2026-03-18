// screens/store.js — Store screen drawing
// Depends on: game state, drawing utils, drawCat, buyItem, sfx

function drawStore() {
  setBgMusicTheme('store');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  // Shop interior background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#f8e8d0');
  grad.addColorStop(1, '#e8d0b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Shelving wall texture
  ctx.fillStyle = '#d4b896';
  ctx.fillRect(0, 0, W, 55);
  ctx.fillStyle = '#c4a886';
  ctx.fillRect(0, 52, W, 3);

  // Floor
  ctx.fillStyle = '#c8a878';
  ctx.fillRect(0, H - 50, W, 50);
  // Floor tiles
  ctx.strokeStyle = '#b8986c';
  ctx.lineWidth = 1;
  for (let fx = 0; fx < W; fx += 60) {
    ctx.beginPath(); ctx.moveTo(fx, H - 50); ctx.lineTo(fx, H); ctx.stroke();
  }

  // Title
  ctx.fillStyle = '#6a3';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#483';
  ctx.lineWidth = 3;
  ctx.strokeText('🏪 Paws & Claws Shop', W / 2, 35);
  ctx.fillText('🏪 Paws & Claws Shop', W / 2, 35);

  // Money display
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  drawRoundRect(W - 130, 8, 120, 32, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`💰 $${game.money}`, W - 20, 30);

  // Back button
  drawButton(10, 8, 90, 32, 'Back', '#636e72', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 10, 8, 90, 32)) {
    sfxClick();
    game.screen = 'care';
  }

  // Category tabs
  const tabW = 140, tabH = 36;
  const tabStartX = (W - STORE_CATEGORIES.length * (tabW + 8)) / 2;
  const tabY = 58;

  for (let i = 0; i < STORE_CATEGORIES.length; i++) {
    const tx = tabStartX + i * (tabW + 8);
    const active = game.storeCategory === i;
    ctx.fillStyle = active ? STORE_CAT_COLORS[i] : '#ccc';
    ctx.strokeStyle = active ? darken(STORE_CAT_COLORS[i].startsWith('#') ? STORE_CAT_COLORS[i] : '#888', 30) : '#aaa';
    ctx.lineWidth = 2;
    drawRoundRect(tx, tabY, tabW, tabH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = active ? '#fff' : '#666';
    ctx.font = active ? 'bold 14px sans-serif' : '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${STORE_CAT_ICONS[i]} ${STORE_CAT_LABELS[i]}`, tx + tabW / 2, tabY + tabH / 2 + 5);

    if (mouse.clicked && hitBox(mouse.x, mouse.y, tx, tabY, tabW, tabH)) {
      sfxClick();
      game.storeCategory = i;
      game.storeScroll = 0;
    }
  }

  // Get items for current category
  const catKey = STORE_CATEGORIES[game.storeCategory];
  const items = STORE_ITEMS.filter(it => it.cat === catKey);

  // Items grid
  const gridY = 105;
  const cardW = 160, cardH = 115;
  const cols = 4;
  const gapX = 12, gapY = 12;
  const gridStartX = (W - cols * cardW - (cols - 1) * gapX) / 2;

  // Scroll limits
  const totalRows = Math.ceil(items.length / cols);
  const visibleH = H - 60 - gridY;
  const contentH = totalRows * (cardH + gapY);
  const maxScroll = Math.max(0, contentH - visibleH);
  game.storeScroll = Math.max(0, Math.min(maxScroll, game.storeScroll));

  // Scroll arrows if content overflows
  if (maxScroll > 0) {
    // Up arrow
    if (game.storeScroll > 0) {
      drawButton(W - 40, gridY, 30, 24, '▲', '#888', true);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, W - 40, gridY, 30, 24)) {
        game.storeScroll = Math.max(0, game.storeScroll - (cardH + gapY));
      }
    }
    // Down arrow
    if (game.storeScroll < maxScroll) {
      drawButton(W - 40, H - 72, 30, 24, '▼', '#888', true);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, W - 40, H - 72, 30, 24)) {
        game.storeScroll = Math.min(maxScroll, game.storeScroll + (cardH + gapY));
      }
    }
    // Scrollbar track
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(W - 28, gridY + 28, 6, visibleH - 56);
    // Scrollbar thumb
    const trackH = visibleH - 56;
    const thumbH = Math.max(20, trackH * (visibleH / contentH));
    const thumbY = gridY + 28 + (game.storeScroll / maxScroll) * (trackH - thumbH);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    drawRoundRect(W - 29, thumbY, 8, thumbH, 4);
    ctx.fill();
  }

  items.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = gridStartX + col * (cardW + gapX);
    const cy = gridY + row * (cardH + gapY) - game.storeScroll;

    if (cy < gridY - cardH || cy > H - 50) return; // Off screen

    const owned = game.inventory.includes(item.id) || game.furniture.includes(item.id) || game.ownedToys.includes(item.id);
    const equipped = Object.values(game.equipped).includes(item.id);
    const hover = hitBox(mouse.x, mouse.y, cx, cy, cardW, cardH);

    // Card background
    ctx.fillStyle = owned ? '#e8ffe8' : (hover ? '#fff8f0' : '#fff');
    ctx.strokeStyle = owned ? '#8c8' : (hover ? '#f4a442' : '#ddd');
    ctx.lineWidth = hover ? 2.5 : 1.5;
    drawRoundRect(cx, cy, cardW, cardH, 10);
    ctx.fill();
    ctx.stroke();

    // Icon
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.icon, cx + 30, cy + 40);

    // Name
    ctx.fillStyle = '#444';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, cx + 55, cy + 28);

    // Description
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.fillText(item.desc, cx + 55, cy + 44);

    // Price or status
    if (owned) {
      if (item.cat === 'accessories') {
        // Equip/Unequip button
        const eqBtnX = cx + cardW - 68;
        const eqBtnY = cy + cardH - 34;
        const eqColor = equipped ? '#e07050' : '#6c5ce7';
        const eqLabel = equipped ? 'Remove' : 'Equip';
        drawButton(eqBtnX, eqBtnY, 60, 26, eqLabel, eqColor, true);
        if (mouse.clicked && hitBox(mouse.x, mouse.y, eqBtnX, eqBtnY, 60, 26)) {
          if (equipped) {
            // Unequip
            game.equipped[item.slot] = null;
            sfxEquip();
          } else {
            // Equip (replaces current in that slot)
            game.equipped[item.slot] = item.id;
            sfxEquip();
            addFloat(cx + cardW / 2, cy, 'Equipped!', '#6c5ce7');
          }
        }
      } else if (item.cat === 'furniture') {
        ctx.fillStyle = '#6a6';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Placed', cx + cardW / 2, cy + cardH - 16);
      } else {
        // Consumables can be re-bought
        const bbx = cx + cardW - 68;
        const bby = cy + cardH - 34;
        const canAfford = game.money >= item.price;
        drawButton(bbx, bby, 60, 26, `$${item.price}`, canAfford ? '#4a9' : '#999', canAfford);
        if (mouse.clicked && hitBox(mouse.x, mouse.y, bbx, bby, 60, 26)) {
          if (canAfford) {
            buyItem(item);
          } else {
            sfxNope();
            addFloat(cx + cardW / 2, cy, 'Not enough $!', '#f44');
          }
        }
      }
    } else {
      // Buy button
      const bbx = cx + cardW - 68;
      const bby = cy + cardH - 34;
      const canAfford = game.money >= item.price;
      drawButton(bbx, bby, 60, 26, `$${item.price}`, canAfford ? '#4a9' : '#999', canAfford);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, bbx, bby, 60, 26)) {
        if (canAfford) {
          buyItem(item);
        } else {
          sfxNope();
          addFloat(cx + cardW / 2, cy, 'Not enough $!', '#f44');
        }
      }
    }

    // Equipped badge
    if (equipped) {
      ctx.fillStyle = '#6c5ce7';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('EQUIPPED', cx + cardW - 8, cy + 16);
    }
  });

  // Cat preview with accessories (bottom right)
  if (game.currentCat !== null) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    drawRoundRect(W - 140, H - 160, 130, 145, 10);
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    drawRoundRect(W - 140, H - 160, 130, 145, 10);
    ctx.stroke();
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Preview', W - 75, H - 145);
    drawCat(W - 75, H - 75, game.currentCat, game.currentStage, 1, game.time, false);
  }

  drawFloats();
}
