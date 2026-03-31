// ============================================================
// CAT RUN DASH - Configuration & Constants
// Extracted from index.html
// ============================================================

// Home (care screen): horizontal scrolling "rooms" — each segment is W wide
const HOME_ROOM_W = 800;
const HOME_ROOMS = 3;
const HOME_TOTAL_W = HOME_ROOM_W * HOME_ROOMS;

// Backyard egg hunt: time-limited (Easter season). Uses local date.
function isEggHuntEventActive() {
  const now = new Date();
  const m = now.getMonth();
  const day = now.getDate();
  if (m === 2) return true; // March (Easter season)
  if (m === 3 && day <= 25) return true; // through April 25
  return false;
}

// Visual theme per scroll segment (care home). Used by drawSkyBg / drawHomeBg.
const HOME_ROOM_THEMES = [
  {
    label: 'Living room',
    skyTop: '#7ec8f0',
    skyMid: '#c5e8ff',
    skyBottom: '#8fd4a0',
    wall: '#f5e6d3',
    wallBand: '#ead4bc',
    floor: '#d4a574',
    floorStyle: 'wood',
    baseboard: '#a08060',
    windowX: 520,
    windowW: 130,
    windowH: 105,
    windowTint: '#7eb8d8',
    frame: '#f8f8f8',
    decor: 'picture',
  },
  {
    label: 'Bedroom',
    skyTop: '#9aa8c8',
    skyMid: '#c8d2e8',
    skyBottom: '#7a9a80',
    wall: '#e4eaf2',
    wallBand: '#d2dce8',
    floor: '#8b7355',
    floorStyle: 'carpet',
    baseboard: '#6a5440',
    windowX: 480,
    windowW: 120,
    windowH: 100,
    windowTint: '#6a8aaa',
    frame: '#eee',
    decor: 'curtains',
  },
  {
    label: 'Kitchen',
    skyTop: '#a8dcff',
    skyMid: '#d8f0ff',
    skyBottom: '#90d498',
    wall: '#f2f6f0',
    wallBand: '#e0ebe4',
    floor: '#c8c8c0',
    floorStyle: 'tile',
    baseboard: '#7a9080',
    windowX: 540,
    windowW: 125,
    windowH: 95,
    windowTint: '#98c8e8',
    frame: '#fff',
    decor: 'shelf',
  },
];

// ============================================================
// CAT DEFINITIONS
// ============================================================
const CAT_BREEDS = [
  { name: 'Marmalade', bodyColor: '#f4a442', stripeColor: '#d4812a', earInner: '#ffb8d0', eyeColor: '#4a2' },
  { name: 'Shadow', bodyColor: '#2a2a2a', stripeColor: '#1a1a1a', earInner: '#444', eyeColor: '#6c6' },
  { name: 'Snowball', bodyColor: '#f0eee8', stripeColor: '#e0ddd5', earInner: '#ffb8d0', eyeColor: '#48f' },
  { name: 'Smokey', bodyColor: '#7a7a8a', stripeColor: '#5a5a6a', earInner: '#a0a0b0', eyeColor: '#fa0' },
  { name: 'Patches', bodyColor: '#f4a442', stripeColor: '#2a2a2a', earInner: '#ffb8d0', eyeColor: '#4a2', calico: true },
  { name: 'Tux', bodyColor: '#2a2a2a', stripeColor: '#f0eee8', earInner: '#444', eyeColor: '#48f', tuxedo: true },
];

const STAGES = ['Baby', 'Kitten', 'Teen', 'Adult'];
const STAGE_SCALE = [0.5, 0.7, 0.85, 1.0];
const STAGE_HEAD_RATIO = [0.55, 0.48, 0.42, 0.38]; // head size relative to body

const ACTIVITIES = ['feed', 'play', 'brush', 'water', 'walk', 'gather'];
const ACTIVITY_LABELS = ['Feed', 'Play', 'Brush', 'Water', 'Walk', 'Gather'];
const ACTIVITY_ICONS = ['🍖', '🧶', '🖌️', '💧', '🐾', '🌸'];
const ACTIVITY_COLORS = ['#f87', '#fb4', '#b8f', '#4bf', '#8d6', '#f8d'];
const MAX_PER_ACTIVITY = 5;

// ============================================================
// STORE ITEMS
// ============================================================
const STORE_CATEGORIES = ['food', 'toys', 'accessories', 'furniture'];
const STORE_CAT_LABELS = ['Food', 'Toys', 'Accessories', 'Furniture'];
const STORE_CAT_ICONS = ['\u{1F356}', '\u{1F9F8}', '\u{1F452}', '\u{1F6CB}\uFE0F'];
const STORE_CAT_COLORS = ['#f87', '#fb4', '#b8f', '#8d6'];

const STORE_ITEMS = [
  // ── Food (consumable — auto-feeds your cat) ──
  { id: 'kibble',       cat: 'food', name: 'Kibble',        price: 0,  icon: '🥫', desc: '+1 Feed',   effect: { act: 'feed', amount: 1 } },
  { id: 'tuna',         cat: 'food', name: 'Tuna Can',      price: 4,  icon: '🐟', desc: '+2 Feed',   effect: { act: 'feed', amount: 2 } },
  { id: 'milk',         cat: 'food', name: 'Cat Milk',      price: 3,  icon: '🥛', desc: '+1 Feed',   effect: { act: 'feed', amount: 1 } },
  { id: 'chicken',      cat: 'food', name: 'Chicken',       price: 5,  icon: '🍗', desc: '+2 Feed',   effect: { act: 'feed', amount: 2 } },
  { id: 'salmon',       cat: 'food', name: 'Salmon',        price: 7,  icon: '🍣', desc: '+3 Feed',   effect: { act: 'feed', amount: 3 } },
  { id: 'shrimp',       cat: 'food', name: 'Shrimp',        price: 8,  icon: '🦐', desc: '+3 Feed',   effect: { act: 'feed', amount: 3 } },
  { id: 'fancyfeast',   cat: 'food', name: 'Fancy Feast',   price: 12, icon: '🍖', desc: '+5 Feed',   effect: { act: 'feed', amount: 5 } },
  { id: 'cake',         cat: 'food', name: 'Cat Cake',      price: 15, icon: '🎂', desc: '+5 Feed',   effect: { act: 'feed', amount: 5 } },
  // ── Toys (consumable — auto-plays) ──
  { id: 'yarn',         cat: 'toys', name: 'Yarn Ball',     price: 0,  icon: '🧶', desc: '+1 Play',   effect: { act: 'play', amount: 1 } },
  { id: 'bell',         cat: 'toys', name: 'Jingle Bell',   price: 3,  icon: '🔔', desc: '+1 Play',   effect: { act: 'play', amount: 1 } },
  { id: 'mousetoy',     cat: 'toys', name: 'Mouse Toy',     price: 4,  icon: '🐭', desc: '+2 Play',   effect: { act: 'play', amount: 2 } },
  { id: 'fish_toy',     cat: 'toys', name: 'Fish Toy',      price: 5,  icon: '🐠', desc: '+2 Play',   effect: { act: 'play', amount: 2 } },
  { id: 'featherwand',  cat: 'toys', name: 'Feather Wand',  price: 7,  icon: '🪶', desc: '+3 Play',   effect: { act: 'play', amount: 3 } },
  { id: 'butterfly',    cat: 'toys', name: 'Butterfly Toy',  price: 8,  icon: '🦋', desc: '+3 Play',  effect: { act: 'play', amount: 3 } },
  { id: 'laser',        cat: 'toys', name: 'Laser Pointer', price: 12, icon: '🔴', desc: '+5 Play',   effect: { act: 'play', amount: 5 } },
  { id: 'rc_car',       cat: 'toys', name: 'RC Mouse Car',  price: 14, icon: '🏎️', desc: '+5 Play',  effect: { act: 'play', amount: 5 } },
  // ── Accessories: Head ──
  { id: 'bow_blue',     cat: 'accessories', name: 'Blue Bow',      price: 6,  icon: '🎀', desc: 'Cute bow',          slot: 'head' },
  { id: 'bow_pink',     cat: 'accessories', name: 'Pink Bow',      price: 6,  icon: '🎀', desc: 'Pretty bow',        slot: 'head' },
  { id: 'bow_red',      cat: 'accessories', name: 'Red Bow',       price: 6,  icon: '🎀', desc: 'Bold bow',          slot: 'head' },
  { id: 'flower_crown', cat: 'accessories', name: 'Flower Crown',  price: 8,  icon: '🌺', desc: 'Spring vibes',      slot: 'head' },
  { id: 'beanie',       cat: 'accessories', name: 'Beanie',        price: 7,  icon: '🧢', desc: 'Cozy & warm',       slot: 'head' },
  { id: 'party_hat',    cat: 'accessories', name: 'Party Hat',     price: 5,  icon: '🥳', desc: 'Celebration!',      slot: 'head' },
  { id: 'cowboy_hat',   cat: 'accessories', name: 'Cowboy Hat',    price: 10, icon: '🤠', desc: 'Yeehaw!',           slot: 'head' },
  { id: 'wizard_hat',   cat: 'accessories', name: 'Wizard Hat',    price: 12, icon: '🧙', desc: 'Magical kitty',     slot: 'head' },
  { id: 'pirate_hat',   cat: 'accessories', name: 'Pirate Hat',    price: 11, icon: '🏴‍☠️', desc: 'Arr meow!',     slot: 'head' },
  { id: 'tophat',       cat: 'accessories', name: 'Top Hat',       price: 10, icon: '🎩', desc: 'Very dapper',       slot: 'head' },
  { id: 'crown',        cat: 'accessories', name: 'Crown',         price: 15, icon: '👑', desc: 'Royal vibes',       slot: 'head' },
  { id: 'halo',         cat: 'accessories', name: 'Halo',          price: 14, icon: '😇', desc: 'Angel kitty',       slot: 'head' },
  // ── Accessories: Eyes ──
  { id: 'sunglasses',   cat: 'accessories', name: 'Sunglasses',    price: 8,  icon: '🕶️', desc: 'Cool shades',      slot: 'eyes' },
  { id: 'heart_glasses',cat: 'accessories', name: 'Heart Glasses', price: 9,  icon: '💗', desc: 'Love at first sight',slot: 'eyes' },
  { id: 'star_glasses', cat: 'accessories', name: 'Star Glasses',  price: 10, icon: '⭐', desc: 'Superstar',         slot: 'eyes' },
  { id: 'monocle',      cat: 'accessories', name: 'Monocle',       price: 12, icon: '🧐', desc: 'Distinguished',     slot: 'eyes' },
  // ── Accessories: Neck ──
  { id: 'collar_red',   cat: 'accessories', name: 'Red Collar',    price: 0,  icon: '🔴', desc: 'Stylish collar',    slot: 'neck' },
  { id: 'collar_gold',  cat: 'accessories', name: 'Gold Collar',   price: 8,  icon: '💛', desc: 'Fancy collar',      slot: 'neck' },
  { id: 'collar_purple',cat: 'accessories', name: 'Purple Collar', price: 6,  icon: '💜', desc: 'Elegant collar',    slot: 'neck' },
  { id: 'bowtie',       cat: 'accessories', name: 'Bowtie',        price: 7,  icon: '🎀', desc: 'Formal & cute',     slot: 'neck' },
  { id: 'bell_collar',  cat: 'accessories', name: 'Bell Collar',   price: 6,  icon: '🔔', desc: 'Jingle jingle',     slot: 'neck' },
  { id: 'flower_lei',   cat: 'accessories', name: 'Flower Lei',    price: 9,  icon: '🌸', desc: 'Tropical cat',      slot: 'neck' },
  { id: 'bandana',      cat: 'accessories', name: 'Bandana',       price: 5,  icon: '🧣', desc: 'Adventurous',       slot: 'neck' },
  { id: 'scarf',        cat: 'accessories', name: 'Scarf',         price: 8,  icon: '🧣', desc: 'Stay warm',         slot: 'neck' },
  { id: 'pearl_necklace',cat:'accessories', name: 'Pearl Necklace',price: 14, icon: '📿', desc: 'So fancy',          slot: 'neck' },
  // ── Accessories: Back ──
  { id: 'cape',         cat: 'accessories', name: 'Red Cape',      price: 12, icon: '🦸', desc: 'Super cat!',        slot: 'back' },
  { id: 'cape_blue',    cat: 'accessories', name: 'Blue Cape',     price: 12, icon: '🦸', desc: 'Cool hero',         slot: 'back' },
  { id: 'wings_angel',  cat: 'accessories', name: 'Angel Wings',   price: 18, icon: '🪽', desc: 'Heavenly kitty',    slot: 'back' },
  { id: 'wings_bat',    cat: 'accessories', name: 'Bat Wings',     price: 16, icon: '🦇', desc: 'Spooky kitty',      slot: 'back' },
  { id: 'backpack',     cat: 'accessories', name: 'Backpack',      price: 10, icon: '🎒', desc: 'Ready to explore',  slot: 'back' },
  // ── Furniture (with color variants) ──
  { id: 'catbed',       cat: 'furniture', name: 'Pink Cat Bed',    price: 8,  icon: '🛏️', desc: 'Comfy naps' },
  { id: 'catbed_blue',  cat: 'furniture', name: 'Blue Cat Bed',    price: 8,  icon: '🛏️', desc: 'Cool & cozy' },
  { id: 'catbed_green', cat: 'furniture', name: 'Green Cat Bed',   price: 8,  icon: '🛏️', desc: 'Natural vibes' },
  { id: 'scratchpost',  cat: 'furniture', name: 'Scratch Post',    price: 6,  icon: '🪵', desc: 'Save the couch' },
  { id: 'scratchpost_dark', cat: 'furniture', name: 'Dark Scratch Post', price: 7, icon: '🪵', desc: 'Sleek & modern' },
  { id: 'cattower',     cat: 'furniture', name: 'Cat Tower',       price: 15, icon: '🏰', desc: 'Climb & play' },
  { id: 'cattower_pink',cat: 'furniture', name: 'Pink Cat Tower',  price: 16, icon: '🏰', desc: 'Cute climbing' },
  { id: 'foodbowl',     cat: 'furniture', name: 'Fancy Bowl',      price: 0,  icon: '🥣', desc: 'Eat in style' },
  { id: 'foodbowl_blue',cat: 'furniture', name: 'Blue Bowl',       price: 4,  icon: '🥣', desc: 'Ocean vibes' },
  { id: 'fountain',     cat: 'furniture', name: 'Water Fountain',  price: 10, icon: '⛲', desc: 'Fresh water' },
  { id: 'fountain_gold',cat: 'furniture', name: 'Gold Fountain',   price: 14, icon: '⛲', desc: 'Luxury hydration' },
  { id: 'blanket',      cat: 'furniture', name: 'Purple Blanket',  price: 5,  icon: '🧶', desc: 'Warm & soft' },
  { id: 'blanket_blue', cat: 'furniture', name: 'Blue Blanket',    price: 5,  icon: '🧶', desc: 'Cool comfort' },
  { id: 'blanket_pink', cat: 'furniture', name: 'Pink Blanket',    price: 5,  icon: '🧶', desc: 'Cozy & cute' },
  { id: 'hammock',      cat: 'furniture', name: 'Pink Hammock',    price: 10, icon: '🪢', desc: 'Hang out' },
  { id: 'hammock_green',cat: 'furniture', name: 'Green Hammock',   price: 10, icon: '🪢', desc: 'Nature naps' },
  { id: 'fishtank',     cat: 'furniture', name: 'Fish Tank',       price: 12, icon: '🐠', desc: 'Watch the fish' },
  { id: 'plant',        cat: 'furniture', name: 'Cat Grass Pot',   price: 5,  icon: '🌿', desc: 'Healthy snack' },
  { id: 'plant_flower', cat: 'furniture', name: 'Flower Pot',      price: 6,  icon: '🌺', desc: 'Pretty blooms' },
  { id: 'rug',          cat: 'furniture', name: 'Pink Rug',        price: 7,  icon: '🔴', desc: 'Soft & pretty' },
  { id: 'rug_blue',     cat: 'furniture', name: 'Blue Rug',        price: 7,  icon: '🔵', desc: 'Cool floor' },
  { id: 'rug_green',    cat: 'furniture', name: 'Green Rug',       price: 7,  icon: '🟢', desc: 'Nature feels' },
  { id: 'bookshelf',    cat: 'furniture', name: 'Bookshelf',       price: 11, icon: '📚', desc: 'Smart cat' },
  { id: 'toybox',       cat: 'furniture', name: 'Yellow Toy Box',  price: 6,  icon: '📦', desc: 'Full of fun' },
  { id: 'toybox_pink',  cat: 'furniture', name: 'Pink Toy Box',    price: 6,  icon: '📦', desc: 'Pretty storage' },
  { id: 'nightlight',   cat: 'furniture', name: 'Moon Light',      price: 8,  icon: '🌙', desc: 'Soft glow' },
  { id: 'nightlight_star', cat: 'furniture', name: 'Star Light',   price: 9,  icon: '⭐', desc: 'Twinkle glow' },
  { id: 'painting',     cat: 'furniture', name: 'Cat Painting',    price: 9,  icon: '🖼️', desc: 'Meow Lisa' },
  { id: 'painting_sky', cat: 'furniture', name: 'Sky Painting',    price: 9,  icon: '🖼️', desc: 'Dreamy clouds' },
  { id: 'couch',        cat: 'furniture', name: 'Cozy Couch',      price: 12, icon: '🛋️', desc: 'Sit or nap' },
  { id: 'couch_blue',   cat: 'furniture', name: 'Blue Couch',      price: 12, icon: '🛋️', desc: 'Cool comfort' },
  { id: 'litterbox',    cat: 'furniture', name: 'Litter Box',      price: 0,  icon: '📦', desc: 'Keeps poops contained' },
];

// Behavior emotes — chosen based on mood (paw fullness)
const BEHAVIOR_EMOTES_HAPPY = {
  idle: ['😊', '😸'],
  sitting: ['😊', '😌', '✨', '💕'],
  walking: ['😸', '🎵'],
  scratching: ['💅', '✨', '😼'],
  drinking: ['💧', '😋', '✨'],
  eating: ['😋', '🍖', '✨', '😸'],
  sleeping: ['💤', '😴', '💕'],
  playing: ['⭐', '😸', '✨', '🎉', '💕'],
  looking: ['👀', '😸', '✨'],
  grooming: ['✨', '💅', '😌'],
  watching: ['👀', '😲', '✨', '😸'],
  sniffing: ['👃', '🌿', '😊'],
  pooping: ['😌', '💨', '✨'],
};
const BEHAVIOR_EMOTES_NEUTRAL = {
  idle: ['😐', '😶'],
  sitting: ['😐', '😶'],
  walking: [],
  scratching: ['💅', '😐'],
  drinking: ['💧'],
  eating: ['😐'],
  sleeping: ['💤', '😴'],
  playing: ['😐'],
  looking: ['👀', '❓'],
  grooming: ['😐'],
  watching: ['👀', '❓'],
  sniffing: ['👃'],
  pooping: ['😶', '💨'],
};
const BEHAVIOR_EMOTES_SAD = {
  idle: ['😿', '😢', '💔'],
  sitting: ['😿', '😞', '💔', '😢'],
  walking: ['😿', '😞'],
  scratching: [],
  drinking: ['😿'],
  eating: ['😞'],
  sleeping: ['😿', '💔'],
  playing: ['😞'],
  looking: ['😿', '❓', '💔'],
  grooming: ['😿'],
  watching: ['😿', '😞'],
  sniffing: ['😿'],
  pooping: ['😿', '💨'],
};

// Duration ranges per behavior (seconds)
const BEHAVIOR_DURATION = {
  idle: [2, 4],
  sitting: [3, 7],
  walking: [0, 0], // walking duration is distance-based
  scratching: [2, 4],
  drinking: [2, 3],
  eating: [2, 4],
  sleeping: [5, 10],
  playing: [3, 5],
  looking: [2, 4],
  grooming: [3, 5],
  watching: [3, 6],
  sniffing: [2, 3],
  pooping: [2, 3.5],
};

// ============================================================
// FURNITURE POSITIONS & DRAGGING
// ============================================================
const FURNITURE_DEFAULTS = {
  catbed: { x: 150, y: 348 }, catbed_blue: { x: 420, y: 348 }, catbed_green: { x: 340, y: 348 },
  scratchpost: { x: 480, y: 300 }, scratchpost_dark: { x: 460, y: 300 },
  cattower: { x: 520, y: 270 }, cattower_pink: { x: 500, y: 270 },
  foodbowl: { x: 200, y: 372 }, foodbowl_blue: { x: 230, y: 372 },
  fountain: { x: 100, y: 348 }, fountain_gold: { x: 130, y: 348 },
  blanket: { x: 410, y: 366 }, blanket_blue: { x: 350, y: 366 }, blanket_pink: { x: 380, y: 366 },
  hammock: { x: 95, y: 195 }, hammock_green: { x: 95, y: 195 },
  fishtank: { x: 475, y: 230 }, plant: { x: 70, y: 345 }, plant_flower: { x: 90, y: 345 },
  rug: { x: 300, y: 372 }, rug_blue: { x: 300, y: 372 }, rug_green: { x: 300, y: 372 },
  bookshelf: { x: 40, y: 180 },
  toybox: { x: 258, y: 336 }, toybox_pink: { x: 280, y: 336 },
  nightlight: { x: 540, y: 278 }, nightlight_star: { x: 555, y: 278 },
  painting: { x: 375, y: 162 }, painting_sky: { x: 425, y: 162 },
  couch: { x: 320, y: 340 }, couch_blue: { x: 320, y: 340 },
  litterbox: { x: 620, y: 392 },
};

// Map variant IDs to their base furniture type for behavior/hitbox purposes
const FURNITURE_BASE = {};
Object.keys(FURNITURE_DEFAULTS).forEach(id => {
  // Base type is the part before the last underscore variant, if it matches a known base
  const bases = ['catbed','scratchpost','cattower','foodbowl','fountain','blanket','hammock','fishtank','plant','rug','bookshelf','toybox','nightlight','painting','couch','litterbox'];
  FURNITURE_BASE[id] = bases.find(b => id === b || id.startsWith(b + '_')) || id;
});

// Toy default spots
const TOY_DEFAULT_SPOTS = [
  { x: 340, y: 366 }, { x: 180, y: 360 }, { x: 460, y: 372 },
  { x: 120, y: 366 }, { x: 280, y: 378 }, { x: 400, y: 360 },
  { x: 220, y: 372 }, { x: 500, y: 366 },
];
