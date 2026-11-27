// Gobble Dash — the world: spawning, stages, movement and collisions.
// One clear job: own the entities (obstacles, corn, feathers, haystacks)
// and answer what the turkey runs into.

import {
  CANVAS_W,
  GROUND_Y,
  LANES,
  OBSTACLES,
  STAGES,
  RUN,
} from './config.js';

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function stageFor(distance) {
  for (const stage of STAGES) {
    if (distance < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export function speedFor(distance) {
  return Math.min(RUN.maxSpeed, RUN.startSpeed + distance * RUN.speedPerMetre);
}

export class World {
  constructor() {
    this.distance = 0;
    this.scroll = 0;
    this.speed = RUN.startSpeed;
    this.obstacles = [];
    this.pickups = [];
    this.haystacks = [];
    this.spawnX = CANVAS_W + 120;
    this.nextFeatherAt = 320;
    this.time = 0;
  }

  reset() {
    this.distance = 0;
    this.scroll = 0;
    this.speed = RUN.startSpeed;
    this.obstacles = [];
    this.pickups = [];
    this.haystacks = [];
    this.spawnX = CANVAS_W + 120;
    this.nextFeatherAt = 320;
    this.time = 0;
  }

  // Deterministic layouts for the screenshot states: the shots show real
  // renders of the game's own code, with the world built by this method.
  seedScene(scene) {
    this.reset();
    if (scene === 'farm') {
      this.distance = 120;
      this.obstacles = [
        this.makeObstacle('fence', 1, 620),
        this.makeObstacle('haybale', 0, 780),
        this.makeObstacle('pumpkin', 2, 900),
      ];
      this.pickups = [
        { kind: 'corn', x: 430, lane: 1, taken: false },
        { kind: 'corn', x: 470, lane: 1, taken: false },
        { kind: 'corn', x: 510, lane: 1, taken: false },
      ];
      this.haystacks = [{ x: 700, lane: 2, used: false }];
    } else if (scene === 'kitchen') {
      this.distance = 940;
      this.obstacles = [
        this.makeObstacle('oven', 0, 560),
        this.makeObstacle('knife', 2, 700, 0.1),
        this.makeObstacle('pot', 1, 860),
        this.makeObstacle('oven', 2, 1020),
      ];
      this.pickups = [
        { kind: 'corn', x: 470, lane: 1, taken: false },
        { kind: 'feather', x: 620, lane: 1, taken: false },
      ];
      this.haystacks = [];
    }
  }

  makeObstacle(kind, lane, x, phase = Math.random()) {
    const def = OBSTACLES[kind];
    return {
      kind,
      lane,
      x,
      w: def.w,
      h: def.h,
      phase,
      passed: false,
      hit: false,
    };
  }

  spawnAhead(stage) {
    const kind = pick(stage.obstacles);
    const lane = Math.floor(Math.random() * LANES.length);
    const x = this.spawnX + rand(0, 160);
    this.obstacles.push(this.makeObstacle(kind, lane, x));
    // Corn trails reward the lane beside the danger.
    if (Math.random() < 0.65) {
      const cornLane = (lane + (Math.random() < 0.5 ? 1 : 2)) % LANES.length;
      for (let i = 0; i < 3; i++) {
        this.pickups.push({ kind: 'corn', x: x + 30 + i * 34, lane: cornLane, taken: false });
      }
    }
    // A haystack to hide in shows up now and then, away from the obstacle.
    if (Math.random() < 0.22) {
      const hayLane = (lane + 1) % LANES.length;
      this.haystacks.push({ x: x + rand(120, 220), lane: hayLane, used: false });
    }
    if (this.distance > this.nextFeatherAt) {
      this.pickups.push({ kind: 'feather', x: x + 200, lane: Math.floor(Math.random() * LANES.length), taken: false });
      this.nextFeatherAt += rand(280, 460);
    }
    const [lo, hi] = stage.spawnGap;
    this.spawnX = CANVAS_W + rand(lo, hi);
  }

  update(dt, dashing) {
    this.time += dt;
    // speed is pixels per frame at 60 fps, so scale by 60 * dt seconds.
    const step = this.speed * (dashing ? 2.1 : 1) * 60 * dt;
    // The world scrolls fast, but the turkey covers about 8 metres a second.
    this.distance += step * 0.026;
    this.scroll += step;
    this.speed = speedFor(this.distance);
    this.spawnX -= step;
    const stage = stageFor(this.distance);
    if (this.spawnX < CANVAS_W + 40) this.spawnAhead(stage);

    const move = (list) => {
      for (const e of list) e.x -= step;
      return list.filter((e) => e.x > -160);
    };
    this.obstacles = move(this.obstacles);
    this.pickups = move(this.pickups);
    this.haystacks = move(this.haystacks);
  }

  groundYFor(lane) {
    return LANES[lane];
  }

  // The turkey's hitbox against one obstacle. A low obstacle is cleared
  // by jumping over it; a tall one only by being in another lane.
  hitsObstacle(turkey, obstacle) {
    const def = OBSTACLES[obstacle.kind];
    const oy = GROUND_Y - obstacle.h;
    const top = obstacle.kind === 'knife' ? oy + this.knifeDrop(obstacle) * 46 : oy;
    const tLeft = turkey.x - 20;
    const tRight = turkey.x + 22;
    const tTop = turkey.y - 34;
    const tBottom = turkey.y + 26;
    const oLeft = obstacle.x;
    const oRight = obstacle.x + obstacle.w;
    const oTop = top;
    const oBottom = GROUND_Y;
    const overlapX = tRight > oLeft + 4 && tLeft < oRight - 4;
    const overlapY = tBottom > oTop + 6 && tTop < oBottom;
    if (!overlapX || !overlapY) return false;
    if (def.kind === 'flat') return turkey.y >= GROUND_Y - 4 && !turkey.airborne;
    return true;
  }

  // The knife's blade drop, 0 raised to 1 fully down, on its own cycle.
  knifeDrop(obstacle) {
    const cycle = (this.time * 0.9 + obstacle.phase) % 1;
    if (cycle < 0.45) return 0;
    if (cycle < 0.6) return (cycle - 0.45) / 0.15;
    if (cycle < 0.85) return 1;
    return 1 - (cycle - 0.85) / 0.15;
  }

  pickupAt(turkey, pickup) {
    const py = LANES[pickup.lane] - 18;
    const dx = pickup.x - turkey.x;
    const dy = py - turkey.y;
    return Math.abs(dx) < 34 && Math.abs(dy) < 40;
  }

  haystackNear(turkey) {
    return this.haystacks.find((h) => h.lane === turkey.lane && !h.used && Math.abs(h.x + 34 - turkey.x) < 70);
  }
}
