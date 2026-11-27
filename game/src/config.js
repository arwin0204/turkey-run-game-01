// Gobble Dash — tuning, stages and obstacle tables.
// One clear job: every number the game balances on lives here.

export const CANVAS_W = 960;
export const CANVAS_H = 540;

export const GROUND_Y = 452;
export const TURKEY_X = 185;
export const LANES = [392, 438, 484];
export const LANE_COUNT = 3;

export const PLAYER = {
  radius: 26,
  hearts: 3,
  jumpVelocity: -11.5,
  gravity: 0.62,
  dashTime: 0.32,
  dashSpeed: 2.1,
  invulnerableTime: 1.6,
  hideTime: 1.4,
};

export const RUN = {
  startSpeed: 5.2,
  maxSpeed: 11.5,
  speedPerMetre: 0.0042,
  escapeDistance: 1200,
  cornScore: 10,
  featherScore: 50,
  cornFarmerPush: 5,
  hitFarmerLurch: 26,
  spotFlashTime: 0.9,
};

// The escape route: farmyard, then the barn, then the kitchen. Each stage
// raises the speed and swaps in harder obstacles.
export const STAGES = [
  {
    id: 'farmyard',
    name: 'THE FARMYARD',
    from: 0,
    to: 400,
    skyTop: '#f2a65a',
    skyBottom: '#f7d08a',
    ground: '#8a5a2b',
    grass: '#c98a3d',
    accent: '#7c4a12',
    obstacles: ['fence', 'haybale', 'pumpkin', 'puddle'],
    spawnGap: [300, 460],
  },
  {
    id: 'barn',
    name: 'THE BARN',
    from: 400,
    to: 800,
    skyTop: '#b4552d',
    skyBottom: '#e08a4e',
    ground: '#6e4423',
    grass: '#a06a2e',
    accent: '#5a3410',
    obstacles: ['crate', 'pitchfork', 'sack', 'haybale'],
    spawnGap: [260, 410],
  },
  {
    id: 'kitchen',
    name: 'THE KITCHEN',
    from: 800,
    to: 1200,
    skyTop: '#7a2e1d',
    skyBottom: '#c96a3a',
    ground: '#54301a',
    grass: '#7d4a22',
    accent: '#3d1f0e',
    obstacles: ['oven', 'knife', 'pot', 'crate'],
    spawnGap: [230, 360],
  },
];

// Obstacle shapes. kind: 'low' is jumped over, 'tall' must be dodged by
// changing lane, 'flat' is a ground hazard you hop or sidestep.
export const OBSTACLES = {
  fence: { kind: 'low', w: 46, h: 52, label: 'Fence' },
  haybale: { kind: 'low', w: 56, h: 50, label: 'Hay bale' },
  pumpkin: { kind: 'low', w: 44, h: 38, label: 'Pumpkin' },
  puddle: { kind: 'flat', w: 78, h: 12, label: 'Mud puddle' },
  crate: { kind: 'low', w: 54, h: 56, label: 'Crate' },
  pitchfork: { kind: 'low', w: 30, h: 62, label: 'Pitchfork' },
  sack: { kind: 'low', w: 52, h: 44, label: 'Feed sack' },
  oven: { kind: 'tall', w: 74, h: 128, label: 'Hot oven' },
  knife: { kind: 'tall', w: 34, h: 118, label: 'Carving knife', swings: true },
  pot: { kind: 'tall', w: 60, h: 84, label: 'Boiling pot' },
};

export const COLLECTIBLES = {
  corn: { w: 30, h: 34, score: RUN.cornScore },
  feather: { w: 34, h: 26, score: RUN.featherScore },
};

export const KEYS = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'ArrowUp', 'KeyW'],
  dash: ['ShiftLeft', 'ShiftRight'],
  hide: ['KeyH'],
  pause: ['KeyP', 'Escape'],
  restart: ['KeyR', 'Enter'],
  mute: ['KeyM'],
  start: ['Enter', 'Space'],
};
