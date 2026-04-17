// Dressing room — equip owned accessories (purchases happen in store only)
// Depends on: game state, drawing utils, drawCat, sfx

function drawDressing() {
  const currentCat = getCurrentCat();
  const equipped = getCurrentEquipped();
  setBgMusicTheme('store');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#e8e0f5');
  grad.addColorStop(1, '#d4c8e8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#555';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Dressing room', W / 2, 42);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('Tap an item to equip or clear that slot', W / 2, 68);

  drawButton(10, 10, 100, 36, 'Back', '#636e72', true);
  if (mouse.clicked && hitBox(mouse.x, mouse.y, 10, 10, 100, 36)) {
    sfxClick();
    game.screen = 'care';
  }

  const cx = W / 2 - 90;
  const cy = 180;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  drawRoundRect(cx - 10, cy - 120, 200, 260, 12);
  ctx.fill();
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 2;
  drawRoundRect(cx - 10, cy - 120, 200, 260, 12);
  ctx.stroke();
  ctx.fillStyle = '#aaa';
  ctx.font = '12px sans-serif';
  ctx.fillText('Mirror', cx + 90, cy - 100);
  if (currentCat) {
    drawCat(cx + 90, cy + 40, currentCat.breed, currentCat.stage, 1, game.time, false, false, currentCat.equipped, currentCat.look);
  }

  if (currentCat) {
    ctx.fillStyle = '#555';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentCat.name, cx + 90, cy + 108);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(currentCat.gender === 'boy' ? 'Boy' : 'Girl', cx + 90, cy + 126);

    drawButton(430, 116, 120, 34, 'Rename', '#6c5ce7', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 430, 116, 120, 34)) {
      const enteredName = typeof prompt === 'function' ? prompt('Rename your cat', currentCat.name) : currentCat.name;
      const finalName = (enteredName || '').trim();
      if (finalName) currentCat.name = finalName;
      sfxClick();
    }

    const genderLabel = currentCat.gender === 'boy' ? 'Set Girl' : 'Set Boy';
    drawButton(430, 156, 120, 34, genderLabel, '#e17055', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 430, 156, 120, 34)) {
      currentCat.gender = currentCat.gender === 'boy' ? 'girl' : 'boy';
      sfxClick();
    }
  }

  const slots = [
    { key: 'head', label: 'Head', y: 310 },
    { key: 'eyes', label: 'Eyes', y: 360 },
    { key: 'neck', label: 'Neck', y: 410 },
    { key: 'back', label: 'Back', y: 460 },
  ];

  const ownedAccessories = STORE_ITEMS.filter(it => it.cat === 'accessories' && game.inventory.includes(it.id));

  slots.forEach(slot => {
    ctx.fillStyle = '#444';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(slot.label, 40, slot.y);
    const inSlot = ownedAccessories.filter(it => it.slot === slot.key);
    let col = 0;
    const rowY = slot.y + 8;
    const cell = 52;
    inSlot.forEach(it => {
      const bx = 40 + col * (cell + 6);
      if (bx > W - 180) return;
      const isEquipped = equipped[slot.key] === it.id;
      ctx.fillStyle = isEquipped ? '#d8e8ff' : '#fff';
      ctx.strokeStyle = isEquipped ? '#6c5ce7' : '#ccc';
      ctx.lineWidth = isEquipped ? 2 : 1;
      drawRoundRect(bx, rowY, cell, cell, 8);
      ctx.fill();
      ctx.stroke();
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(it.icon, bx + cell / 2, rowY + 34);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, bx, rowY, cell, cell) && currentCat) {
        sfxEquip();
        if (isEquipped) currentCat.equipped[slot.key] = null;
        else currentCat.equipped[slot.key] = it.id;
      }
      col++;
    });
    const clearX = Math.min(W - 96, 40 + col * (cell + 6) + (col > 0 ? 10 : 0));
    drawButton(clearX, rowY, 82, cell, 'Clear', '#999', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, clearX, rowY, 82, cell) && currentCat) {
      currentCat.equipped[slot.key] = null;
      sfxClick();
    }
  });

  drawFloats();
}
