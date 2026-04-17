// screens/select.js — Cat selection + name + look customization
// Depends on: game state, drawing utils, drawCat, drawHomeBg, sfx, initCatAI

const selectFlow = { step: 'breed', breed: null, name: '', gender: 'girl', fur: 0, nose: 0, eyes: 0 };

(function bindSelectKeys() {
  if (typeof window === 'undefined' || window._selectKeyBound) return;
  window._selectKeyBound = true;
  window.addEventListener('keydown', e => {
    if (typeof game === 'undefined' || game.screen !== 'select') return;
    if (selectFlow.step !== 'name') return;
    if (e.key === 'Backspace') {
      selectFlow.name = (selectFlow.name || '').slice(0, -1);
      e.preventDefault();
    } else if (e.key.length === 1 && (selectFlow.name || '').length < 18) {
      selectFlow.name = (selectFlow.name || '') + e.key;
    }
  });
})();

function drawSelect() {
  if (game._freshSelect) {
    selectFlow.step = 'breed';
    selectFlow.breed = null;
    selectFlow.name = '';
    selectFlow.gender = 'girl';
    selectFlow.fur = 0;
    selectFlow.nose = 0;
    selectFlow.eyes = 0;
    game._freshSelect = false;
  }
  setBgMusicTheme('select');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  drawHomeBg();

  if (selectFlow.step === 'breed') {
    ctx.fillStyle = '#6a4';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#384';
    ctx.lineWidth = 4;
    ctx.strokeText('Choose Your Cat!', W / 2, 60);
    ctx.fillText('Choose Your Cat!', W / 2, 60);

    const visible = [];
    for (let i = 0; i < CAT_BREEDS.length; i++) {
      if (CAT_BREEDS[i].secret && !hasUnlockedSecretBreeds()) continue;
      visible.push(i);
    }

    const cols = 3;
    const cardW = 180, cardH = 180;
    const startX = (W - cols * cardW - (cols - 1) * 20) / 2;
    const startY = 90;

    for (let vi = 0; vi < visible.length; vi++) {
      const i = visible[vi];
      const row = Math.floor(vi / cols);
      const col = vi % cols;
      const cx = startX + col * (cardW + 20);
      const cy = startY + row * (cardH + 15);

      const hover = hitBox(mouse.x, mouse.y, cx, cy, cardW, cardH);

      ctx.fillStyle = hover ? '#fff8f0' : '#fff5e8';
      ctx.strokeStyle = hover ? '#f4a442' : '#ddd';
      ctx.lineWidth = hover ? 3 : 2;
      drawRoundRect(cx, cy, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      drawCat(cx + cardW / 2, cy + cardH / 2 - 10, i, 0, 1, game.time, false);

      ctx.fillStyle = '#555';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(CAT_BREEDS[i].name, cx + cardW / 2, cy + cardH - 15);

      if (mouse.clicked && hover) {
        sfxMeow();
        selectFlow.breed = i;
        selectFlow.name = CAT_BREEDS[i].name;
        selectFlow.gender = 'girl';
        selectFlow.fur = i % CAT_LOOK_FUR.length;
        selectFlow.nose = 0;
        selectFlow.eyes = i % CAT_LOOK_EYES.length;
        selectFlow.step = 'name';
        mouse.clicked = false;
      }
    }

    drawButton(20, H - 52, 120, 40, 'Back', '#636e72', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 52, 120, 40)) {
      sfxClick();
      game.screen = 'avatar';
    }

    if (CAT_BREEDS.some(b => b.secret) && !hasUnlockedSecretBreeds()) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Collect 6 cats total to unlock magical breeds ✨', W / 2, H - 36);
    }
    return;
  }

  if (selectFlow.step === 'name') {
    ctx.fillStyle = '#6a4';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#384';
    ctx.lineWidth = 3;
    ctx.strokeText('Name & gender', W / 2, 52);
    ctx.fillText('Name & gender', W / 2, 52);

    ctx.fillStyle = '#444';
    ctx.font = '16px sans-serif';
    ctx.fillText('Name (type on keyboard or tap letters below)', W / 2, 92);

    ctx.fillStyle = '#fff';
    drawRoundRect(W / 2 - 200, 108, 400, 44, 10);
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    drawRoundRect(W / 2 - 200, 108, 400, 44, 10);
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(selectFlow.name || '…', W / 2, 138);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let li = 0; li < letters.length; li++) {
      const col = li % 13;
      const row = Math.floor(li / 13);
      const bx = 70 + col * 52;
      const by = 175 + row * 36;
      const ch = letters[li];
      drawButton(bx, by, 46, 30, ch, '#889', true);
      if (mouse.clicked && hitBox(mouse.x, mouse.y, bx, by, 46, 30) && (selectFlow.name || '').length < 18) {
        sfxClick();
        selectFlow.name += ch;
        mouse.clicked = false;
      }
    }
    drawButton(70, 255, 80, 32, 'Space', '#889', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 70, 255, 80, 32)) {
      sfxClick();
      selectFlow.name += ' ';
      mouse.clicked = false;
    }
    drawButton(160, 255, 90, 32, '← Del', '#c07050', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 160, 255, 90, 32)) {
      sfxClick();
      selectFlow.name = (selectFlow.name || '').slice(0, -1);
      mouse.clicked = false;
    }

    ctx.fillStyle = '#555';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gender', W / 2, 318);
    const gBoy = hitBox(mouse.x, mouse.y, W / 2 - 120, 330, 100, 42);
    const gGirl = hitBox(mouse.x, mouse.y, W / 2 + 20, 330, 100, 42);
    drawButton(W / 2 - 120, 330, 100, 42, 'Boy', selectFlow.gender === 'boy' ? '#4a8' : '#889', true);
    drawButton(W / 2 + 20, 330, 100, 42, 'Girl', selectFlow.gender === 'girl' ? '#d48' : '#889', true);
    if (mouse.clicked && gBoy) {
      sfxClick();
      selectFlow.gender = 'boy';
      mouse.clicked = false;
    }
    if (mouse.clicked && gGirl) {
      sfxClick();
      selectFlow.gender = 'girl';
      mouse.clicked = false;
    }

    drawButton(W / 2 - 90, H - 120, 180, 48, 'Next: looks ✨', '#e84393', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 90, H - 120, 180, 48)) {
      const nm = (selectFlow.name || '').trim() || CAT_BREEDS[selectFlow.breed].name;
      selectFlow.name = nm;
      sfxClick();
      selectFlow.step = 'customize';
      mouse.clicked = false;
    }

    drawButton(20, H - 52, 140, 40, '← Breeds', '#636e72', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 52, 140, 40)) {
      sfxClick();
      selectFlow.step = 'breed';
      mouse.clicked = false;
    }
    return;
  }

  if (selectFlow.step === 'customize') {
    ctx.fillStyle = '#6a4';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fur, nose & eyes', W / 2, 48);

    drawCat(W / 2, 200, selectFlow.breed, 0, 1, game.time, false, false, createEmptyEquipped(), {
      fur: selectFlow.fur,
      nose: selectFlow.nose,
      eyes: selectFlow.eyes,
    });

    const row = (label, n, key, y) => {
      ctx.fillStyle = '#555';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, 80, y);
      for (let i = 0; i < n; i++) {
        const bx = 200 + i * 56;
        let col = '#888';
        if (key === 'fur') col = CAT_LOOK_FUR[i % CAT_LOOK_FUR.length];
        if (key === 'nose') col = CAT_LOOK_NOSE[i % CAT_LOOK_NOSE.length];
        if (key === 'eyes') col = CAT_LOOK_EYES[i % CAT_LOOK_EYES.length];
        ctx.fillStyle = col;
        drawRoundRect(bx, y - 16, 44, 32, 8);
        ctx.fill();
        if (selectFlow[key] === i) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          drawRoundRect(bx - 2, y - 18, 48, 36, 9);
          ctx.stroke();
        }
        if (mouse.clicked && hitBox(mouse.x, mouse.y, bx, y - 16, 44, 32)) {
          sfxClick();
          selectFlow[key] = i;
          mouse.clicked = false;
        }
      }
    };
    row('Fur', CAT_LOOK_FUR.length, 'fur', 300);
    row('Nose', CAT_LOOK_NOSE.length, 'nose', 360);
    row('Eyes', CAT_LOOK_EYES.length, 'eyes', 420);

    drawButton(W / 2 - 100, H - 100, 200, 50, 'Start life together!', '#6c5ce7', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 100, H - 100, 200, 50)) {
      sfxMeow();
      const nm = (selectFlow.name || '').trim() || CAT_BREEDS[selectFlow.breed].name;
      game.currentCat = createCatInstance(selectFlow.breed, {
        name: nm,
        gender: selectFlow.gender,
        look: { fur: selectFlow.fur, nose: selectFlow.nose, eyes: selectFlow.eyes },
      });
      resetCare();
      initCatAI();
      game.screen = 'care';
      selectFlow.step = 'breed';
      mouse.clicked = false;
    }

    drawButton(20, H - 52, 140, 40, '← Back', '#636e72', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 52, 140, 40)) {
      sfxClick();
      selectFlow.step = 'name';
      mouse.clicked = false;
    }
  }
}
