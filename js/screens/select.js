// screens/select.js — Cat selection + name + look customization
// Depends on: game state, drawing utils, drawCat, drawHomeBg, sfx, initCatAI

const selectFlow = { step: 'name', breed: 0, name: '', gender: 'girl', fur: 0, nose: 0, eyes: 0 };

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
    const pa = game.playerAvatar || {};
    selectFlow.step = 'setup';
    selectFlow.breed = 0;
    selectFlow.name = (pa.name || '').trim() || 'Cat';
    selectFlow.gender = pa.gender || 'girl';
    selectFlow.fur = 0;
    selectFlow.nose = 0;
    selectFlow.eyes = 0;
    game._freshSelect = false;
  }
  setBgMusicTheme('select');
  if (!bgMusic.playing && bgMusic.enabled) startBgMusic();
  drawHomeBg();

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
      selectFlow.step = 'setup';
      mouse.clicked = false;
    }

    drawButton(20, H - 52, 120, 40, 'Back', '#636e72', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 52, 120, 40)) {
      sfxClick();
      game.screen = 'avatarname';
    }
    return;
  }

  if (selectFlow.step === 'setup') {
    ctx.fillStyle = '#6a4';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Choose breed & customize', W / 2, 38);

    const visible = [];
    for (let i = 0; i < CAT_BREEDS.length; i++) {
      if (CAT_BREEDS[i].secret && !hasUnlockedSecretBreeds()) continue;
      visible.push(i);
    }

    const breedCardW = 80, breedCardH = 80;
    const breedsPerRow = 4;
    const breedStartX = (W - breedsPerRow * breedCardW - (breedsPerRow - 1) * 8) / 2;
    const breedY = 55;

    for (let vi = 0; vi < visible.length; vi++) {
      const i = visible[vi];
      const col = vi % breedsPerRow;
      const row = Math.floor(vi / breedsPerRow);
      const cx = breedStartX + col * (breedCardW + 8);
      const cy = breedY + row * (breedCardH + 8);
      const hover = hitBox(mouse.x, mouse.y, cx, cy, breedCardW, breedCardH);
      const selected = selectFlow.breed === i;

      ctx.fillStyle = selected ? '#ffe0b0' : (hover ? '#fff8f0' : '#fff5e8');
      ctx.strokeStyle = selected ? '#f4a442' : (hover ? '#f4a442' : '#ddd');
      ctx.lineWidth = selected ? 3 : 2;
      drawRoundRect(cx, cy, breedCardW, breedCardH, 8);
      ctx.fill();
      ctx.stroke();

      drawCat(cx + breedCardW / 2, cy + breedCardH / 2 - 5, i, 0, 0.45, game.time, false);

      if (mouse.clicked && hover) {
        sfxClick();
        selectFlow.breed = i;
        selectFlow.fur = i % CAT_LOOK_FUR.length;
        selectFlow.nose = 0;
        selectFlow.eyes = i % CAT_LOOK_EYES.length;
        mouse.clicked = false;
      }
    }

    if (CAT_BREEDS.some(b => b.secret) && !hasUnlockedSecretBreeds()) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Collect 6 cats to unlock magical breeds ✨', W / 2, breedY + 2 * (breedCardH + 8) + 12);
    }

    drawCat(W / 2, 280, selectFlow.breed, 0, 1, game.time, false, false, createEmptyEquipped(), {
      fur: selectFlow.fur,
      nose: selectFlow.nose,
      eyes: selectFlow.eyes,
    });

    ctx.fillStyle = '#444';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(CAT_BREEDS[selectFlow.breed].name, W / 2, 380);

    const row = (label, n, key, y) => {
      ctx.fillStyle = '#555';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(label, 70, y);
      for (let i = 0; i < n; i++) {
        const bx = 90 + i * 46;
        let col = '#888';
        if (key === 'fur') col = CAT_LOOK_FUR[i % CAT_LOOK_FUR.length];
        if (key === 'nose') col = CAT_LOOK_NOSE[i % CAT_LOOK_NOSE.length];
        if (key === 'eyes') col = CAT_LOOK_EYES[i % CAT_LOOK_EYES.length];
        ctx.fillStyle = col;
        drawRoundRect(bx, y - 13, 38, 28, 6);
        ctx.fill();
        if (selectFlow[key] === i) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          drawRoundRect(bx - 1, y - 14, 40, 30, 7);
          ctx.stroke();
        }
        if (mouse.clicked && hitBox(mouse.x, mouse.y, bx, y - 13, 38, 28)) {
          sfxClick();
          selectFlow[key] = i;
          mouse.clicked = false;
        }
      }
    };
    row('Fur', CAT_LOOK_FUR.length, 'fur', 430);
    row('Nose', CAT_LOOK_NOSE.length, 'nose', 470);
    row('Eyes', CAT_LOOK_EYES.length, 'eyes', 510);

    drawButton(W / 2 - 100, H - 90, 200, 50, 'Start life together!', '#6c5ce7', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, W / 2 - 100, H - 90, 200, 50)) {
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
      selectFlow.step = 'name';
      mouse.clicked = false;
    }

    drawButton(20, H - 52, 120, 40, '← Avatar', '#636e72', true);
    if (mouse.clicked && hitBox(mouse.x, mouse.y, 20, H - 52, 120, 40)) {
      sfxClick();
      game.screen = 'avatar';
      mouse.clicked = false;
    }
  }
}
