// ============================================================
// CAT RUN DASH - Game State, Save/Load
// Extracted from index.html
// Depends on: initCatAI (from other modules, loaded before or after)
// ============================================================

let game = {
  screen: 'title', // title, avatar, select, care, walk, chase, backyard, timeout, store, collection, travel, dressing
  time: 0,
  cats: [], // completed cat instances
  currentCat: null, // active cat instance
  care: { feed: 0, play: 0, brush: 0, water: 0, walk: 0, gather: 0 },
  // Care animation
  careAnim: null, // { type, timer, x, y }
  // Walk state
  walk: { px: 0, py: 0, items: [], distWalked: 0, gathered: 0, walkCounted: false, maze: [], dogs: [], caught: false, caughtTimer: 0, mazeW: 0, mazeH: 0, cellSize: 0, hits: 0, companion: null, companionX: 0, companionY: 0, choosingCompanion: false, scratchCooldown: 0, scratchFlash: 0 },
  // Chase state
  chase: { px: 0, py: 0, vx: 0, vy: 0, dogs: [], scrapes: 0, timer: 300, dashCooldown: 0, dashing: false, dashTimer: 0, houseY: 0, mapH: 0, cameraY: 0, obstacles: [], particles: [], won: false, lost: false, invincible: 0, scratchCooldown: 0, scratchFlash: 0 },
  // Transition
  transition: null, // { from, to, timer }
  // Floating text
  floats: [],
  // Title animation
  titleBounce: 0,
  // Store
  money: 10,
  inventory: [],       // accessory item ids owned
  equipped: { head: null, neck: null, eyes: null, back: null }, // legacy save compatibility
  furniture: [],       // furniture item ids placed in home
  ownedToys: [],       // toy item ids (persist at home)
  houseCats: [],       // indices into game.cats that are visible at home
  furniturePos: {},     // { itemId: { x, y } } custom positions for placed furniture
  dragging: null,       // { id, offX, offY } or null
  storeCategory: 0,    // current tab index
  storeScroll: 0,      // scroll offset for items
  // Cat home behavior AI
  catAI: {
    x: 300, y: 340,           // position in care screen
    targetX: 300, targetY: 340,
    facing: 1,
    state: 'idle',             // idle, walking, scratching, drinking, sleeping, playing, sitting, looking, grooming
    stateTimer: 0,             // time left in current state
    nextStateTimer: 2,         // countdown to pick next behavior
    emote: null,               // { icon, timer }
    tailWag: 0,                // extra tail animation speed
    blinkTimer: 0,             // eye blink
    purring: false,
    zzz: 0,                    // sleep animation counter
  },
  // Night mode
  nightTimer: 0,        // counts up, triggers night every 300s (5 min)
  isNight: false,
  nightDuration: 0,     // counts down from 30
  // Laser pointer interactive
  laserActive: false,    // true when user is dragging laser dot
  laserDotX: 400, laserDotY: 350,
  // Throwable toy physics
  thrownToy: null,       // { id, x, y, vx, vy, toyIdx, settled } or null
  throwGrab: null,        // { toyIdx, startX, startY } while holding before throw
  careMode: null,         // active care interaction mode: 'feed'|'brush'|'play'|null
  placedFood: null,       // { x, y, inBowl } food placed on floor waiting for cat
  floorPoops: [],         // { x, y, id } messes to click-clean (no litter box or missed)
  litterboxDirt: 0,       // 0–1 fills slowly when cat uses litter box
  litterboxClumps: 0,     // visible deposits (increments each use; scooping reduces)
  homeScrollX: 0,       // care screen horizontal scroll (0 .. HOME_TOTAL_W - W)
  litterScrub: null,    // { lx, ly } world coords while scrubbing litter tray
  // Confetti
  confetti: [],
  // Backyard (door from care) + optional egg hunt
  backyard: {
    px: 400, py: 320, targetX: 400, targetY: 320,
    eggs: [], // { x, y, collected }
    eggHuntComplete: false,
  },
  eggHuntRewardClaimed: false, // one-time reward when all eggs found during event
  // Supporter mod pack (password unlock)
  modPackUnlocked: false,
  growBoostUsed: false,
  petCooldown: 0,
  careHintUntil: 0,
  careHintText: '',
  careMusicCalm: false,
  // Chill zone (playful time-out screen)
  timeout: { timer: 0, savedScroll: 0 },
  // Player avatar (before choose-a-cat)
  playerAvatar: { skin: 0, hair: 0, eyes: 0 },
  // Floor lamp on/off per furniture id
  furnitureLights: {},
  // Cat supplies: scoop must be equipped to scrub litter
  equippedTool: null, // 'scoop' | null
  // Trip map: car animation + destination
  travel: { phase: 'map', timer: 0, dest: null },
};

function resetCare() {
  game.care = { feed: 0, play: 0, brush: 0, water: 0, walk: 0, gather: 0 };
}

function createEmptyEquipped() {
  return { head: null, neck: null, eyes: null, back: null };
}

function nextCatId() {
  game._catUid = (game._catUid || 0) + 1;
  return `cat_${game._catUid}`;
}

function normalizeEquipped(equipped) {
  return Object.assign(createEmptyEquipped(), equipped || {});
}

function createCatInstance(breed, opts) {
  const data = opts || {};
  return {
    id: data.id || nextCatId(),
    breed,
    stage: data.stage || 0,
    name: data.name || CAT_BREEDS[breed].name,
    gender: data.gender || 'girl',
    equipped: normalizeEquipped(data.equipped),
    look: data.look || { fur: 0, nose: 0, eyes: 0 },
  };
}

function ensureCatInstance(cat, fallbackBreed, fallbackStage, fallbackEquipped) {
  if (!cat && fallbackBreed === null) return null;
  const breed = cat && cat.breed !== undefined ? cat.breed : fallbackBreed;
  if (breed === null || breed === undefined) return null;
  return createCatInstance(breed, {
    id: cat && cat.id,
    stage: cat && cat.stage !== undefined ? cat.stage : (fallbackStage || 0),
    name: cat && cat.name,
    gender: cat && cat.gender,
    equipped: (cat && cat.equipped) || fallbackEquipped,
    look: cat && cat.look,
  });
}

function getCurrentCat() {
  return game.currentCat;
}

function getCurrentBreedIndex() {
  const cat = getCurrentCat();
  return cat ? cat.breed : null;
}

function getCurrentStage() {
  const cat = getCurrentCat();
  return cat ? cat.stage : 0;
}

function getCurrentCatName() {
  const cat = getCurrentCat();
  if (!cat) return '';
  return cat.name || CAT_BREEDS[cat.breed].name;
}

function getCurrentCatLabel() {
  const cat = getCurrentCat();
  if (!cat) return '';
  const genderLabel = cat.gender === 'boy' ? 'Boy' : 'Girl';
  return `${getCurrentCatName()} (${genderLabel})`;
}

function getCurrentEquipped() {
  const cat = getCurrentCat();
  if (!cat) return createEmptyEquipped();
  cat.equipped = normalizeEquipped(cat.equipped);
  return cat.equipped;
}

function hasUnlockedSecretBreeds() {
  return !!(game.cats && game.cats.length >= 6);
}

// ============================================================
// SAVE / LOAD (localStorage)
// ============================================================
const SAVE_KEY = 'catRunDash_save';
const SAVE_FIELDS = ['cats', 'currentCat', 'care', 'money', 'inventory', 'equipped', 'furniture', 'ownedToys', 'houseCats', 'furniturePos', 'floorPoops', 'litterboxDirt', 'litterboxClumps', 'homeScrollX', 'eggHuntRewardClaimed', 'modPackUnlocked', 'growBoostUsed', '_catUid', 'playerAvatar', 'furnitureLights', 'equippedTool'];

function saveGame() {
  try {
    const data = {};
    SAVE_FIELDS.forEach(k => { data[k] = game[k]; });
    data.screen = game.screen;
    // Don't save mid-chase or mid-walk — save as care screen
    if (data.screen === 'walk' || data.screen === 'chase' || data.screen === 'backyard' || data.screen === 'timeout' || data.screen === 'dressing' || data.screen === 'travel') data.screen = 'care';
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { /* storage full or unavailable — silently ignore */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    SAVE_FIELDS.forEach(k => {
      if (data[k] !== undefined) game[k] = data[k];
    });
    if (data.eggHuntRewardClaimed === undefined) game.eggHuntRewardClaimed = false;
    if (data.modPackUnlocked === undefined) game.modPackUnlocked = false;
    if (data.growBoostUsed === undefined) game.growBoostUsed = false;
    if (data.playerAvatar && typeof data.playerAvatar === 'object') game.playerAvatar = data.playerAvatar;
    if (data.furnitureLights && typeof data.furnitureLights === 'object') game.furnitureLights = data.furnitureLights;
    if (data.equippedTool !== undefined) game.equippedTool = data.equippedTool;
    game.cats = (game.cats || []).map(cat => ensureCatInstance(cat, cat && cat.breed, cat && cat.stage, data.equipped));
    game.currentCat = ensureCatInstance(game.currentCat, typeof data.currentCat === 'number' ? data.currentCat : null, data.currentStage || 0, data.equipped);
    game.equipped = normalizeEquipped(game.equipped);
    const seenIds = new Set();
    game.cats.forEach(cat => {
      while (seenIds.has(cat.id)) cat.id = nextCatId();
      seenIds.add(cat.id);
    });
    if (game.currentCat) {
      while (seenIds.has(game.currentCat.id)) game.currentCat.id = nextCatId();
      seenIds.add(game.currentCat.id);
    }
    if (!game._catUid) {
      game._catUid = game.cats.length + (game.currentCat ? 1 : 0);
    }
    // Restore screen (default to care if a cat exists, else title)
    if (data.screen === 'care' || data.screen === 'store' || data.screen === 'collection' || data.screen === 'dressing') {
      game.screen = data.screen;
    } else if (game.currentCat !== null) {
      game.screen = 'care';
    } else {
      game.screen = 'title';
    }
    // Init cat behavior AI if we have a cat
    if (game.currentCat !== null) initCatAI();
    return true;
  } catch (e) { return false; }
}

// NOTE: loadGame() and setInterval(saveGame) are called from main.js
// after all scripts are loaded, to avoid circular dependency with initCatAI.
