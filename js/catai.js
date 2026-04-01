// catai.js — Cat home behavior AI, house cats, mood system
// Depends on: furniture.js (getFurnitureXY, getToyXY), game state, drawing utils

// Furniture interaction spots (x, y, behavior, requires)
function getFurnitureSpots() {
  const spots = [
    // Default spots (always available)
    { x: 300, y: 340, behavior: 'sitting', weight: 2 },
    { x: 200, y: 360, behavior: 'grooming', weight: 2 },
    { x: 400, y: 350, behavior: 'looking', weight: 2 },
    { x: 500, y: 360, behavior: 'idle', weight: 1 },
    { x: 150, y: 370, behavior: 'playing', weight: 1 },
  ];
  const owned = game.furniture;
  // Furniture-specific behaviors — positions are dynamic (draggable)
  const fp = (id) => getFurnitureXY(id);
  const py20 = (id) => Math.min(fp(id).y + 20, H * 0.63);
  if (owned.includes('scratchpost'))  { const p = fp('scratchpost'); spots.push({ x: p.x, y: py20('scratchpost'), behavior: 'scratching', weight: 3 }); }
  if (owned.includes('cattower'))     { const p = fp('cattower'); spots.push({ x: p.x, y: py20('cattower'), behavior: 'scratching', weight: 2 }, { x: p.x, y: p.y + 10, behavior: 'sitting', weight: 2 }, { x: p.x, y: py20('cattower'), behavior: 'playing', weight: 3 }); }
  if (owned.includes('fountain'))     { const p = fp('fountain'); spots.push({ x: p.x, y: py20('fountain'), behavior: 'drinking', weight: 3 }); }
  if (owned.includes('catbed'))       { const p = fp('catbed'); spots.push({ x: p.x, y: p.y, behavior: 'sleeping', weight: 3 }); }
  if (owned.includes('catbed_blue'))  { const p = fp('catbed_blue'); spots.push({ x: p.x, y: p.y, behavior: 'sleeping', weight: 3 }); }
  if (owned.includes('blanket'))      { const p = fp('blanket'); spots.push({ x: p.x, y: p.y, behavior: 'sleeping', weight: 2 }); }
  if (owned.includes('foodbowl'))     { const p = fp('foodbowl'); spots.push({ x: p.x, y: py20('foodbowl'), behavior: 'eating', weight: 2 }); }
  if (owned.includes('fishtank'))     { const p = fp('fishtank'); spots.push({ x: p.x, y: py20('fishtank'), behavior: 'watching', weight: 3 }); }
  if (owned.includes('hammock'))      { const p = fp('hammock'); spots.push({ x: p.x, y: p.y + 30, behavior: 'sleeping', weight: 2 }, { x: p.x, y: p.y + 30, behavior: 'sitting', weight: 1 }); }
  if (owned.includes('plant'))        { const p = fp('plant'); spots.push({ x: p.x, y: py20('plant'), behavior: 'sniffing', weight: 2 }); }
  if (owned.includes('toybox'))       { const p = fp('toybox'); spots.push({ x: p.x, y: py20('toybox'), behavior: 'playing', weight: 3 }); }
  if (owned.includes('rug'))          { const p = fp('rug'); spots.push({ x: p.x, y: p.y, behavior: 'grooming', weight: 2 }); }
  if (owned.includes('bookshelf'))    { const p = fp('bookshelf'); spots.push({ x: p.x, y: py20('bookshelf'), behavior: 'looking', weight: 2 }); }
  if (owned.includes('nightlight'))   { const p = fp('nightlight'); spots.push({ x: p.x, y: py20('nightlight'), behavior: 'sitting', weight: 1 }); }
  if (owned.includes('painting'))     { const p = fp('painting'); spots.push({ x: p.x, y: py20('painting'), behavior: 'watching', weight: 3 }); }
  // Color variants inherit same behaviors as base
  if (owned.includes('catbed_green'))    { const p = fp('catbed_green'); spots.push({ x: p.x, y: p.y, behavior: 'sleeping', weight: 3 }); }
  if (owned.includes('scratchpost_dark')){ const p = fp('scratchpost_dark'); spots.push({ x: p.x, y: py20('scratchpost_dark'), behavior: 'scratching', weight: 3 }); }
  if (owned.includes('cattower_pink'))   { const p = fp('cattower_pink'); spots.push({ x: p.x, y: py20('cattower_pink'), behavior: 'playing', weight: 3 }); }
  if (owned.includes('foodbowl_blue'))   { const p = fp('foodbowl_blue'); spots.push({ x: p.x, y: py20('foodbowl_blue'), behavior: 'eating', weight: 2 }); }
  if (owned.includes('fountain_gold'))   { const p = fp('fountain_gold'); spots.push({ x: p.x, y: py20('fountain_gold'), behavior: 'drinking', weight: 3 }); }
  if (owned.includes('blanket_blue'))    { const p = fp('blanket_blue'); spots.push({ x: p.x, y: p.y, behavior: 'sleeping', weight: 2 }); }
  if (owned.includes('blanket_pink'))    { const p = fp('blanket_pink'); spots.push({ x: p.x, y: p.y, behavior: 'sleeping', weight: 2 }); }
  if (owned.includes('hammock_green'))   { const p = fp('hammock_green'); spots.push({ x: p.x, y: p.y + 30, behavior: 'sleeping', weight: 2 }); }
  if (owned.includes('plant_flower'))    { const p = fp('plant_flower'); spots.push({ x: p.x, y: py20('plant_flower'), behavior: 'sniffing', weight: 2 }); }
  if (owned.includes('rug_blue'))        { const p = fp('rug_blue'); spots.push({ x: p.x, y: p.y, behavior: 'grooming', weight: 2 }); }
  if (owned.includes('rug_green'))       { const p = fp('rug_green'); spots.push({ x: p.x, y: p.y, behavior: 'grooming', weight: 2 }); }
  if (owned.includes('toybox_pink'))     { const p = fp('toybox_pink'); spots.push({ x: p.x, y: py20('toybox_pink'), behavior: 'playing', weight: 3 }); }
  if (owned.includes('nightlight_star')) { const p = fp('nightlight_star'); spots.push({ x: p.x, y: py20('nightlight_star'), behavior: 'sitting', weight: 1 }); }
  if (owned.includes('painting_sky'))    { const p = fp('painting_sky'); spots.push({ x: p.x, y: py20('painting_sky'), behavior: 'watching', weight: 3 }); }
  if (owned.includes('couch'))          { const p = fp('couch'); spots.push({ x: p.x, y: p.y, behavior: 'sitting', weight: 3 }, { x: p.x, y: p.y, behavior: 'sleeping', weight: 2 }); }
  if (owned.includes('couch_blue'))     { const p = fp('couch_blue'); spots.push({ x: p.x, y: p.y, behavior: 'sitting', weight: 3 }, { x: p.x, y: p.y, behavior: 'sleeping', weight: 2 }); }
  if (owned.includes('cat_tunnel'))     { const p = fp('cat_tunnel'); spots.push({ x: p.x, y: Math.min(p.y + 8, H * 0.63), behavior: 'tunneling', weight: 3 }); }
  // Toys on the floor — positions are dynamic
  game.ownedToys.forEach((toyId, i) => {
    const tp = getToyXY(i);
    spots.push({ x: tp.x, y: tp.y - 10, behavior: 'playing', weight: 3 });
  });
  return spots;
}

// Clickable furniture/toy hitboxes for click-to-interact
// Clumps visible in litter (dirt drops as you scrub; ~0.07 dirt per visit/clump)
function getVisibleLitterClumps() {
  const d = game.litterboxDirt || 0;
  const c = game.litterboxClumps | 0;
  if (d < 0.02) return 0;
  const est = Math.ceil(d / 0.07);
  return Math.min(c, Math.max(0, est));
}

function getFurnitureHitboxes() {
  const boxes = [];
  const owned = game.furniture;
  const toys = game.ownedToys;

  // Hitbox definitions: id, default hitbox offset from center, size, behavior
  const defs = [
    { id: 'catbed',      w: 70, h: 35, offy: -5, behavior: 'sleeping', label: 'Pink Bed' },
    { id: 'catbed_blue', w: 70, h: 35, offy: -5, behavior: 'sleeping', label: 'Blue Bed' },
    { id: 'catbed_green', w: 70, h: 35, offy: -5, behavior: 'sleeping', label: 'Green Bed' },
    { id: 'scratchpost', w: 36, h: 100, offy: -20, behavior: 'scratching', label: 'Scratch Post' },
    { id: 'scratchpost_dark', w: 36, h: 100, offy: -20, behavior: 'scratching', label: 'Dark Post' },
    { id: 'cattower',    w: 55, h: 150, offy: -10, behavior: 'playing', label: 'Cat Tower' },
    { id: 'cattower_pink', w: 55, h: 150, offy: -10, behavior: 'playing', label: 'Pink Tower' },
    { id: 'foodbowl',    w: 36, h: 20, offy: 5, behavior: 'eating', label: 'Fancy Bowl' },
    { id: 'foodbowl_blue', w: 36, h: 20, offy: 5, behavior: 'eating', label: 'Blue Bowl' },
    { id: 'fountain',    w: 40, h: 30, offy: 0, behavior: 'drinking', label: 'Fountain' },
    { id: 'fountain_gold', w: 40, h: 30, offy: 0, behavior: 'drinking', label: 'Gold Fountain' },
    { id: 'blanket',     w: 70, h: 30, offy: 5, behavior: 'sleeping', label: 'Blanket' },
    { id: 'blanket_blue', w: 70, h: 30, offy: 5, behavior: 'sleeping', label: 'Blue Blanket' },
    { id: 'blanket_pink', w: 70, h: 30, offy: 5, behavior: 'sleeping', label: 'Pink Blanket' },
    { id: 'hammock',     w: 80, h: 45, offy: 0, behavior: 'sleeping', label: 'Hammock' },
    { id: 'hammock_green', w: 80, h: 45, offy: 0, behavior: 'sleeping', label: 'Green Hammock' },
    { id: 'fishtank',    w: 60, h: 55, offy: -20, behavior: 'watching', label: 'Fish Tank' },
    { id: 'plant',       w: 30, h: 40, offy: -5, behavior: 'sniffing', label: 'Cat Grass' },
    { id: 'plant_flower', w: 30, h: 40, offy: -5, behavior: 'sniffing', label: 'Flower Pot' },
    { id: 'rug',         w: 104, h: 30, offy: 5, behavior: 'grooming', label: 'Pink Rug' },
    { id: 'rug_blue',    w: 104, h: 30, offy: 5, behavior: 'grooming', label: 'Blue Rug' },
    { id: 'rug_green',   w: 104, h: 30, offy: 5, behavior: 'grooming', label: 'Green Rug' },
    { id: 'bookshelf',   w: 55, h: 85, offy: -30, behavior: 'looking', label: 'Bookshelf' },
    { id: 'toybox',      w: 42, h: 35, offy: -5, behavior: 'playing', label: 'Toy Box' },
    { id: 'toybox_pink', w: 42, h: 35, offy: -5, behavior: 'playing', label: 'Pink Toy Box' },
    { id: 'nightlight',  w: 28, h: 35, offy: -10, behavior: 'sitting', label: 'Moon Light' },
    { id: 'nightlight_star', w: 28, h: 35, offy: -10, behavior: 'sitting', label: 'Star Light' },
    { id: 'painting',    w: 58, h: 48, offy: -20, behavior: 'watching', label: 'Cat Painting' },
    { id: 'painting_sky', w: 58, h: 48, offy: -20, behavior: 'watching', label: 'Sky Painting' },
    { id: 'couch',       w: 100, h: 40, offy: -5, behavior: 'sitting', label: 'Cozy Couch' },
    { id: 'couch_blue',  w: 100, h: 40, offy: -5, behavior: 'sitting', label: 'Blue Couch' },
    { id: 'litterbox',   w: 54, h: 42, offy: 2, behavior: 'sniffing', label: 'Litter Box' },
    { id: 'cat_tunnel',  w: 108, h: 48, offy: 0, behavior: 'playing', label: 'Tunnel' },
  ];

  defs.forEach(d => {
    if (!owned.includes(d.id)) return;
    const pos = getFurnitureXY(d.id);
    boxes.push({
      x: pos.x - d.w / 2, y: pos.y + (d.offy || 0) - d.h / 2,
      w: d.w, h: d.h,
      behavior: d.behavior,
      targetX: pos.x, targetY: Math.min(pos.y + 20, H * 0.63),
      label: d.label,
      dragId: d.id,
    });
  });

  // Toy hitboxes
  const toyNames = { yarn: 'Yarn Ball', bell: 'Jingle Bell', mousetoy: 'Mouse Toy', fish_toy: 'Fish Toy', featherwand: 'Feather Wand', butterfly: 'Butterfly', laser: 'Laser', rc_car: 'RC Car' };
  toys.forEach((toyId, i) => {
    const tp = getToyXY(i);
    boxes.push({ x: tp.x - 15, y: tp.y - 15, w: 30, h: 30, behavior: 'playing', targetX: tp.x, targetY: tp.y - 10, label: toyNames[toyId] || 'Toy', dragId: `toy_${i}` });
  });

  return boxes;
}

// Returns 0-1 how full the paw is overall
function getPawMood() {
  const total = ACTIVITIES.reduce((sum, a) => sum + game.care[a], 0);
  const max = ACTIVITIES.length * MAX_PER_ACTIVITY;
  return total / max;
}

function getMoodEmotes(state) {
  const mood = getPawMood();
  if (mood >= 0.5) return BEHAVIOR_EMOTES_HAPPY[state] || [];
  if (mood >= 0.2) return BEHAVIOR_EMOTES_NEUTRAL[state] || [];
  return BEHAVIOR_EMOTES_SAD[state] || [];
}

function isCatSad() {
  return getPawMood() < 0.2;
}

const SLEEP_SPOT_IDS = ['catbed', 'catbed_blue', 'catbed_green', 'blanket', 'blanket_blue', 'blanket_pink', 'hammock', 'hammock_green', 'couch', 'couch_blue'];

function getRandomSleepSpot() {
  const available = game.furniture.filter(id => SLEEP_SPOT_IDS.includes(id));
  if (available.length === 0) return null;
  const pick = available[Math.floor(Math.random() * available.length)];
  const pos = getFurnitureXY(pick);
  return { x: pos.x, y: pos.y + (pick.startsWith('hammock') ? 30 : 0) };
}

function spawnCatPoop(ai) {
  if (ai._poopInLitterbox && game.furniture.includes('litterbox')) {
    const p = getFurnitureXY('litterbox');
    game.litterboxDirt = Math.min(1, (game.litterboxDirt || 0) + 0.07);
    game.litterboxClumps = Math.min(8, (game.litterboxClumps || 0) + 1);
    addFloat(p.x, p.y - 36, '💩 In the box', '#7a5');
  } else {
    if (!game.floorPoops) game.floorPoops = [];
    game._poopUid = (game._poopUid || 0) + 1;
    game.floorPoops.push({ x: ai.x, y: ai.y + 10, id: game._poopUid });
    addFloat(ai.x, ai.y - 38, '💩', '#654');
  }
  ai._poopInLitterbox = false;
}

function initCatAI() {
  const ai = game.catAI;
  ai.x = 300; ai.y = 340;
  ai.targetX = 300; ai.targetY = 340;
  ai.state = 'idle';
  ai.stateTimer = 2;
  ai.nextStateTimer = 0;
  ai.emote = null;
  ai.facing = 1;
  ai.purring = false;
  ai.zzz = 0;
  ai._poopCountPending = 0;
  ai._poopInLitterbox = false;
}

function updateCatAI(dt) {
  const ai = game.catAI;

  // Blink
  ai.blinkTimer -= dt;
  if (ai.blinkTimer <= 0) {
    ai.blinkTimer = 2 + Math.random() * 4;
  }

  // Emote timer
  if (ai.emote) {
    ai.emote.timer -= dt;
    if (ai.emote.timer <= 0) ai.emote = null;
  }

  // Sleep zzz counter
  if (ai.state === 'sleeping') {
    ai.zzz += dt;
  } else {
    ai.zzz = 0;
  }

  ai.purring = (ai.state === 'sleeping' || ai.state === 'sitting' || ai.state === 'grooming');

  if (ai.state === 'walking') {
    // Move toward target
    const dx = ai.targetX - ai.x;
    const dy = ai.targetY - ai.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 5) {
      // Arrived — start the queued behavior
      ai.x = ai.targetX;
      ai.y = ai.targetY;
      ai.state = ai._queuedBehavior || 'idle';
      const dur = BEHAVIOR_DURATION[ai.state];
      ai.stateTimer = dur[0] + Math.random() * (dur[1] - dur[0]);
      ai.nextStateTimer = ai.stateTimer;
      // Auto-credit play when cat plays at a toy/tower/toybox (no button needed)
      if (ai.state === 'playing' && !ai._pendingCredit && game.care.play < MAX_PER_ACTIVITY) {
        ai._pendingCredit = 'play';
        ai._pendingCreditAmount = 1;
      }
      // Maybe emote on arrival
      maybeEmote(ai);
    } else {
      const chasing = game.laserActive || (game.thrownToy && !game.thrownToy.settled) || game.throwGrab;
      const speed = (chasing ? 280 : 60) * STAGE_SCALE[game.currentStage];
      ai.x += (dx / dist) * speed * dt;
      ai.y += (dy / dist) * speed * dt;
      ai.facing = dx > 0 ? 1 : -1;
      if (game.screen === 'care') {
        ai.x = Math.max(35, Math.min(HOME_TOTAL_W - 35, ai.x));
      }
      if (game.screen === 'timeout') {
        const r0 = HOME_ROOM_W + 35;
        const r1 = HOME_ROOM_W * 2 - 35;
        ai.x = Math.max(r0, Math.min(r1, ai.x));
        ai.y = Math.max(260, Math.min(H * 0.63, ai.y));
      }
    }
  } else {
    // Count down current behavior
    ai.stateTimer -= dt;
    ai.nextStateTimer -= dt;

    // Random emote during behavior
    if (Math.random() < dt * 0.3 && !ai.emote) {
      maybeEmote(ai);
    }

    if (ai.nextStateTimer <= 0) {
      // Award pending care credit when activity finishes
      if (ai._pendingCredit) {
        const act = ai._pendingCredit;
        const amount = ai._pendingCreditAmount || 1;
        const prev = game.care[act];
        game.care[act] = Math.min(MAX_PER_ACTIVITY, game.care[act] + amount);
        const gained = game.care[act] - prev;
        if (gained > 0) {
          const idx = ACTIVITIES.indexOf(act);
          game.careAnim = { type: act, timer: 1.5, icon: ACTIVITY_ICONS[idx] };
          addFloat(ai.x, ai.y - 80, `+${gained} ${ACTIVITY_LABELS[idx]}!`, ACTIVITY_COLORS[idx]);
          if (game.care[act] >= MAX_PER_ACTIVITY) {
            setTimeout(() => sfxComplete(), 200);
            addFloat(680, 230, `${ACTIVITY_LABELS[idx]} Complete!`, '#4a2', { screen: true });
          }
          checkGrowth();
        }
        ai._pendingCredit = null;
        ai._pendingCreditAmount = 1;
        if (act === 'feed') {
          game.placedFood = null;
          ai._poopCountPending = (ai._poopCountPending || 0) + 1;
        }
      }
      if (ai.state === 'pooping') {
        spawnCatPoop(ai);
      }
      pickNextBehavior(ai);
    }
  }

  if (game.screen === 'timeout') {
    const r0 = HOME_ROOM_W + 35;
    const r1 = HOME_ROOM_W * 2 - 35;
    ai.x = Math.max(r0, Math.min(r1, ai.x));
    ai.y = Math.max(260, Math.min(H * 0.63, ai.y));
  }
}

function maybeEmote(ai) {
  const emotes = getMoodEmotes(ai.state);
  if (emotes && emotes.length > 0 && Math.random() < 0.6) {
    ai.emote = {
      icon: emotes[Math.floor(Math.random() * emotes.length)],
      timer: 1.5
    };
  }
}

function pickNextBehavior(ai) {
  if ((ai._poopCountPending | 0) > 0) {
    ai._poopCountPending--;
    const hasLitter = game.furniture.includes('litterbox');
    ai._poopInLitterbox = hasLitter;
    let tx, ty;
    if (hasLitter) {
      const p = getFurnitureXY('litterbox');
      tx = p.x;
      ty = Math.min(p.y + 10, H * 0.63);
    } else {
      tx = 80 + Math.random() * (HOME_TOTAL_W - 160);
      ty = 285 + Math.random() * (H * 0.63 - 295);
    }
    ai.targetX = tx;
    ai.targetY = ty;
    ai._queuedBehavior = 'pooping';
    const dist = Math.hypot(ai.targetX - ai.x, ai.targetY - ai.y);
    if (dist > 15) {
      ai.state = 'walking';
      ai.stateTimer = 99;
    } else {
      const dur = BEHAVIOR_DURATION.pooping;
      ai.state = 'pooping';
      ai.stateTimer = dur[0] + Math.random() * (dur[1] - dur[0]);
      maybeEmote(ai);
    }
    ai.nextStateTimer = ai.stateTimer + 0.5;
    return;
  }

  let spots = getFurnitureSpots();
  const sad = isCatSad();

  // Sad cats only do idle, sitting, sleeping — no playing, scratching, etc.
  if (sad) {
    spots = spots.filter(s => s.behavior === 'idle' || s.behavior === 'sitting' || s.behavior === 'sleeping' || s.behavior === 'looking');
    if (spots.length === 0) spots = [{ x: 300, y: 360, behavior: 'sitting', weight: 1 }];
  }

  if (game.screen === 'timeout') {
    const rMin = HOME_ROOM_W + 45;
    const rMax = HOME_ROOM_W * 2 - 45;
    spots = spots.filter(s => s.x >= rMin && s.x <= rMax);
    if (spots.length === 0) {
      spots = [{ x: HOME_ROOM_W + 400, y: 340, behavior: 'idle', weight: 1 }];
    }
  }

  // Weighted random pick
  const totalWeight = spots.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = spots[0];
  for (const spot of spots) {
    roll -= spot.weight;
    if (roll <= 0) { chosen = spot; break; }
  }

  // Walk to the spot, then do the behavior
  ai.targetX = chosen.x + (Math.random() - 0.5) * 20;
  ai.targetY = chosen.y + (Math.random() - 0.5) * 10;
  // Clamp to room bounds
  ai.targetX = Math.max(50, Math.min(HOME_TOTAL_W - 160, ai.targetX));
  ai.targetY = Math.max(250, Math.min(H * 0.63, ai.targetY));
  ai._queuedBehavior = chosen.behavior;

  const dist = Math.hypot(ai.targetX - ai.x, ai.targetY - ai.y);
  if (dist > 15) {
    ai.state = 'walking';
    ai.stateTimer = 99; // walking until arrival
  } else {
    // Already close enough
    ai.state = chosen.behavior;
    const dur = BEHAVIOR_DURATION[ai.state];
    ai.stateTimer = dur[0] + Math.random() * (dur[1] - dur[0]);
    maybeEmote(ai);
  }
  ai.nextStateTimer = ai.stateTimer + 0.5;
}

function drawCatBehavior() {
  const ai = game.catAI;
  const s = STAGE_SCALE[game.currentStage];

  // Blink check — eyes briefly close every few seconds
  const isBlinking = ai.blinkTimer > 0 && ai.blinkTimer < 0.15;
  const isWalking = ai.state === 'walking';
  const isSleeping = ai.state === 'sleeping';
  const closed = isSleeping || isBlinking;

  if (isSleeping) {
    // Sleeping: squished lying-down pose with eyes closed inside drawCat
    ctx.save();
    ctx.translate(ai.x, ai.y);
    ctx.scale(1.2, 0.7);
    ctx.translate(-ai.x, -ai.y);
    drawCat(ai.x, ai.y + 8 * s, game.currentCat, game.currentStage, ai.facing, game.time * 0.3, false, true);
    ctx.restore();

    // Zzz animation
    for (let z = 0; z < 3; z++) {
      const zPhase = (ai.zzz * 0.8 + z * 0.7) % 3;
      if (zPhase > 2.5) continue;
      const zx = ai.x + 15 * s + z * 8;
      const zy = ai.y - 30 * s - zPhase * 15;
      ctx.globalAlpha = Math.max(0, 1 - zPhase / 2.5);
      ctx.fillStyle = '#aaf';
      ctx.font = `${(10 + z * 3) * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('z', zx, zy);
      ctx.globalAlpha = 1;
    }
  } else if (ai.state === 'scratching') {
    // Reaching up with claw lines
    drawCat(ai.x, ai.y - 5 - Math.abs(Math.sin(game.time * 6)) * 5, game.currentCat, game.currentStage, ai.facing, game.time * 2, false, isBlinking);
    ctx.strokeStyle = 'rgba(200,200,200,0.5)';
    ctx.lineWidth = 1.5;
    for (let sl = 0; sl < 3; sl++) {
      const sx = ai.x + ai.facing * (15 + sl * 5) * s;
      ctx.globalAlpha = Math.max(0, Math.sin(game.time * 8 + sl * 2)) * 0.6;
      ctx.beginPath();
      ctx.moveTo(sx, ai.y - 25 * s);
      ctx.lineTo(sx + 2, ai.y - 10 * s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (ai.state === 'drinking' || ai.state === 'eating') {
    const bob = Math.sin(game.time * 5) * 3;
    drawCat(ai.x, ai.y + bob, game.currentCat, game.currentStage, ai.facing, game.time, false, isBlinking);
  } else if (ai.state === 'grooming') {
    ctx.save();
    ctx.translate(ai.x, ai.y);
    ctx.rotate(Math.sin(game.time * 3) * 0.08);
    ctx.translate(-ai.x, -ai.y);
    drawCat(ai.x, ai.y, game.currentCat, game.currentStage, ai.facing, game.time * 1.5, false, isBlinking);
    ctx.restore();
    if (Math.sin(game.time * 4) > 0.7) {
      ctx.fillStyle = '#fff';
      ctx.font = `${8 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✨', ai.x + ai.facing * 15 * s, ai.y - 10 * s + Math.sin(game.time * 6) * 5);
    }
  } else if (ai.state === 'playing') {
    const playBounce = Math.abs(Math.sin(game.time * 5)) * 8 * s;
    drawCat(ai.x + Math.sin(game.time * 3) * 5, ai.y - playBounce, game.currentCat, game.currentStage, Math.sin(game.time * 2) > 0 ? 1 : -1, game.time * 2, true, isBlinking);
  } else if (ai.state === 'tunneling') {
    ctx.save();
    ctx.translate(ai.x, ai.y + 14 * s);
    ctx.scale(1.05, 0.72);
    ctx.translate(-ai.x, -ai.y);
    drawCat(ai.x, ai.y, game.currentCat, game.currentStage, ai.facing, game.time * 0.9, false, isBlinking);
    ctx.restore();
    ctx.fillStyle = 'rgba(40,25,20,0.25)';
    drawRoundRect(ai.x - 38, ai.y - 8, 76, 20, 8);
    ctx.fill();
  } else if (ai.state === 'watching') {
    drawCat(ai.x, ai.y, game.currentCat, game.currentStage, ai.facing, game.time * 0.5, false, isBlinking);
  } else if (ai.state === 'sniffing') {
    const sniffBob = Math.sin(game.time * 6) * 2;
    drawCat(ai.x + ai.facing * sniffBob, ai.y, game.currentCat, game.currentStage, ai.facing, game.time, false, isBlinking);
  } else if (ai.state === 'sitting') {
    drawCat(ai.x, ai.y + Math.sin(game.time * 1) * 1.5, game.currentCat, game.currentStage, ai.facing, game.time * 0.5, false, isBlinking);
  } else if (ai.state === 'pooping') {
    ctx.save();
    ctx.translate(ai.x, ai.y);
    ctx.scale(1.06, 0.86);
    ctx.translate(-ai.x, -ai.y);
    drawCat(ai.x, ai.y + 6 * s, game.currentCat, game.currentStage, ai.facing, game.time * 0.7, false, isBlinking);
    ctx.restore();
  } else {
    drawCat(ai.x, ai.y, game.currentCat, game.currentStage, ai.facing, game.time, isWalking, isBlinking);
  }

  // Emote bubble
  if (ai.emote) {
    const eAlpha = Math.min(1, ai.emote.timer * 3);
    ctx.globalAlpha = eAlpha;
    // Bubble
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const bubX = ai.x + 20 * s;
    const bubY = ai.y - 45 * s - (1.5 - ai.emote.timer) * 8;
    ctx.beginPath();
    ctx.arc(bubX, bubY, 14, 0, Math.PI * 2);
    ctx.fill();
    // Tail of bubble
    ctx.beginPath();
    ctx.moveTo(bubX - 6, bubY + 12);
    ctx.lineTo(ai.x + 8 * s, ai.y - 25 * s);
    ctx.lineTo(bubX + 2, bubY + 12);
    ctx.fill();
    // Emote icon
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ai.emote.icon, bubX, bubY + 5);
    ctx.globalAlpha = 1;
  }

  // Purring indicator (small lines near body)
  if (ai.purring && ai.state !== 'sleeping') {
    ctx.globalAlpha = 0.3 + Math.sin(game.time * 8) * 0.2;
    ctx.strokeStyle = '#fda';
    ctx.lineWidth = 1;
    for (let pi = 0; pi < 3; pi++) {
      const pAngle = game.time * 3 + pi * 2.1;
      const pr = 20 * s + Math.sin(pAngle) * 5;
      ctx.beginPath();
      ctx.arc(ai.x, ai.y - 5 * s, pr, pAngle, pAngle + 0.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Behavior label (subtle)
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  const stateLabel = {
    idle: '', sitting: 'sitting', walking: '', scratching: 'scratching!',
    drinking: 'drinking...', eating: 'eating...', sleeping: 'sleeping...',
    playing: 'playing!', looking: 'looking around', grooming: 'grooming',
    watching: 'watching...', sniffing: 'sniffing', pooping: 'pooping...',
    tunneling: 'in the tunnel…',
  };
  if (stateLabel[ai.state]) {
    ctx.fillText(stateLabel[ai.state], ai.x, ai.y + 30 * s);
  }
}

// ============================================================
// HOUSE CATS (collected cats wandering in the home)
// ============================================================
// Each house cat gets a simple autonomous wander state
const houseCatStates = {}; // keyed by cat index

function getHouseCatState(idx) {
  if (!houseCatStates[idx]) {
    houseCatStates[idx] = {
      x: 100 + Math.random() * 400,
      y: 300 + Math.random() * 60,
      targetX: 100 + Math.random() * 400,
      targetY: 300 + Math.random() * 60,
      facing: Math.random() > 0.5 ? 1 : -1,
      state: 'idle', // idle, walking, sitting, sleeping, grooming
      timer: 2 + Math.random() * 4,
    };
  }
  return houseCatStates[idx];
}

function updateHouseCats(dt) {
  game.houseCats.forEach(idx => {
    const st = getHouseCatState(idx);
    st.timer -= dt;

    // Night mode — send to sleep spot or sleep in place
    if (game.isNight && st.state !== 'sleeping' && st.state !== 'walking') {
      const spot = getRandomSleepSpot();
      if (spot) {
        st.targetX = spot.x + (Math.random() - 0.5) * 20;
        st.targetY = Math.min(spot.y, H * 0.63);
        st.state = 'walking';
        st.timer = 35;
        st._nightWalk = true;
      } else {
        st.state = 'sleeping'; st.timer = 30;
      }
      return;
    }
    if (game.isNight && st.state === 'walking' && st._nightWalk) {
      // let it walk to the sleep spot; handled below
    }

    if (st.state === 'walking') {
      const dx = st.targetX - st.x, dy = st.targetY - st.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 5) {
        st.x = st.targetX; st.y = st.targetY;
        if (st._nightWalk) {
          st.state = 'sleeping';
          st.timer = 30;
          st._nightWalk = false;
        } else {
          st.state = ['idle', 'sitting', 'sleeping', 'grooming'][Math.floor(Math.random() * 4)];
          st.timer = 3 + Math.random() * 5;
        }
      } else {
        const hcChasing = game.laserActive || (game.thrownToy && !game.thrownToy.settled) || game.throwGrab;
        const spd = hcChasing ? 250 : 40;
        st.x += (dx / dist) * spd * dt;
        st.y += (dy / dist) * spd * dt;
        st.facing = dx > 0 ? 1 : -1;
      }
    } else if (st.timer <= 0) {
      // Pick new behavior
      st.targetX = 60 + Math.random() * (HOME_TOTAL_W - 120);
      st.targetY = 290 + Math.random() * 70;
      st.state = 'walking';
      st.timer = 10;
    }
  });
}

function drawHouseCats() {
  game.houseCats.forEach(idx => {
    if (idx >= game.cats.length) return;
    const cat = game.cats[idx];
    const st = getHouseCatState(idx);
    const isWalking = st.state === 'walking';
    const isSleeping = st.state === 'sleeping';

    if (isSleeping) {
      ctx.save();
      ctx.translate(st.x, st.y);
      ctx.scale(1.1, 0.7);
      ctx.translate(-st.x, -st.y);
      drawCat(st.x, st.y + 4, cat.breed, 3, st.facing, game.time * 0.3 + idx, false, true);
      ctx.restore();
      // Mini zzz
      ctx.fillStyle = '#aaf';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      const zPhase = (game.time * 0.8 + idx) % 2;
      ctx.globalAlpha = Math.max(0, 1 - zPhase);
      ctx.fillText('z', st.x + 10, st.y - 15 - zPhase * 8);
      ctx.globalAlpha = 1;
    } else if (st.state === 'grooming') {
      ctx.save();
      ctx.translate(st.x, st.y);
      ctx.rotate(Math.sin(game.time * 3 + idx) * 0.06);
      ctx.translate(-st.x, -st.y);
      drawCat(st.x, st.y, cat.breed, 3, st.facing, game.time + idx, false);
      ctx.restore();
    } else {
      drawCat(st.x, st.y, cat.breed, 3, st.facing, game.time + idx, isWalking);
    }

    // Name tag
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(CAT_BREEDS[cat.breed].name, st.x, st.y + 25);
  });
}
