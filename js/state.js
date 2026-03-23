// ============================================================
// CAT RUN DASH - Game State, Save/Load
// Extracted from index.html
// Depends on: initCatAI (from other modules, loaded before or after)
// ============================================================

let game = {
  screen: 'title', // title, select, care, walk, chase, result
  time: 0,
  cats: [], // { breed: index, stage: 3 } completed cats
  currentCat: null, // breed index
  currentStage: 0,
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
  equipped: { head: null, neck: null, eyes: null, back: null }, // accessory slots
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
  // Confetti
  confetti: [],
};

function resetCare() {
  game.care = { feed: 0, play: 0, brush: 0, water: 0, walk: 0, gather: 0 };
}

// ============================================================
// SAVE / LOAD (localStorage)
// ============================================================
const SAVE_KEY = 'catRunDash_save';
const SAVE_FIELDS = ['cats', 'currentCat', 'currentStage', 'care', 'money', 'inventory', 'equipped', 'furniture', 'ownedToys', 'houseCats', 'furniturePos', 'floorPoops', 'litterboxDirt'];

function saveGame() {
  try {
    const data = {};
    SAVE_FIELDS.forEach(k => { data[k] = game[k]; });
    data.screen = game.screen;
    // Don't save mid-chase or mid-walk — save as care screen
    if (data.screen === 'walk' || data.screen === 'chase') data.screen = 'care';
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
    // Restore screen (default to care if a cat exists, else title)
    if (data.screen === 'care' || data.screen === 'store' || data.screen === 'collection') {
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
