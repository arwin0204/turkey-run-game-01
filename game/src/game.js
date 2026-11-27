// Gobble Dash — the game itself: states, the turkey's physics, the chase,
// the HUD and every screen. One clear job: run one escape from the title
// screen to caught-or-escaped, and draw all of it.

import {
  CANVAS_W,
  CANVAS_H,
  GROUND_Y,
  TURKEY_X,
  LANES,
  PLAYER,
  RUN,
  STAGES,
  KEYS,
} from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { World, stageFor } from './world.js';
import {
  drawTurkey,
  drawFarmer,
  drawObstacle,
  drawCorn,
  drawFeather,
  drawHaystack,
  drawSky,
  drawGround,
  drawBackdrop,
  roundRect,
} from './sprites.js';

const STATES = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  CAUGHT: 'caught',
  ESCAPED: 'escaped',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class GobbleDash {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sound = new SoundBank();
    this.world = new World();
    this.state = STATES.TITLE;
    this.best = 0;
    this.time = 0;
    this.lastTs = 0;
    this.shake = 0;
    this.spotFlash = 0;
    this.message = null;
    this.messageTime = 0;
    this.scene = new URLSearchParams(window.location.search).get('shot');
    this.frozenScene = false;

    this.input.onFirstGesture = () => {
      this.sound.unlock();
      this.sound.startMusic();
    };

    this.resetRun();
    if (this.scene) this.applyShotScene(this.scene);
    this.bindButtons();
    window.requestAnimationFrame((ts) => this.frame(ts));
  }

  resetRun() {
    this.world.reset();
    this.turkey = {
      x: TURKEY_X,
      lane: 1,
      y: LANES[1],
      vy: 0,
      airborne: false,
      runPhase: 0,
      dashTime: 0,
      invulnerable: 0,
      hideTime: 0,
      hidden: false,
    };
    this.score = 0;
    this.corn = 0;
    this.feathers = 0;
    this.hearts = PLAYER.hearts;
    this.farmerGap = 100;
    this.farmerX = 30;
    this.farmerPhase = 0;
    this.spotFlash = 0;
    this.message = null;
    this.state = STATES.TITLE;
  }

  startRun() {
    this.resetRun();
    this.state = STATES.PLAYING;
    this.sound.gobble();
    this.flash('RUN! The farmer is coming!');
  }

  // Screenshot states: real renders of the game's own code with the world
  // built for the shot (?shot=title|farm|kitchen|caught|escaped).
  applyShotScene(scene) {
    if (scene === 'farm' || scene === 'kitchen') {
      this.world.seedScene(scene);
      this.frozenScene = true;
      this.state = STATES.PLAYING;
      this.score = scene === 'kitchen' ? 1480 : 340;
      this.corn = scene === 'kitchen' ? 14 : 6;
      this.hearts = scene === 'kitchen' ? 2 : 3;
      this.farmerGap = scene === 'kitchen' ? 34 : 72;
      this.turkey.y = LANES[1] - 40;
      this.turkey.airborne = true;
      this.turkey.vy = -3;
      if (scene === 'kitchen') this.spotFlash = 0.6;
    } else if (scene === 'caught') {
      this.world.seedScene('farm');
      this.state = STATES.CAUGHT;
      this.score = 860;
      this.best = 860;
      this.corn = 11;
      this.hearts = 0;
      this.farmerGap = 0;
      this.turkey.lane = 1;
      this.turkey.y = LANES[1];
    } else if (scene === 'escaped') {
      this.world.seedScene('kitchen');
      this.world.distance = RUN.escapeDistance;
      this.state = STATES.ESCAPED;
      this.score = 2310;
      this.best = 2310;
      this.corn = 24;
      this.feathers = 2;
      this.hearts = 2;
      this.farmerGap = 100;
    }
  }

  flash(text, seconds = 1.8) {
    this.message = text;
    this.messageTime = seconds;
  }

  bindButtons() {
    // Buttons are drawn on the canvas; clicks land through the input queue.
    this.buttons = [];
  }

  button(x, y, w, h, label, action) {
    this.buttons.push({ x, y, w, h, label, action });
    const p = this.input.pointer;
    const hover = p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
    this.ctx.save();
    this.ctx.fillStyle = hover ? '#f7c948' : '#e8a13a';
    roundRect(this.ctx, x, y, w, h, 10);
    this.ctx.fill();
    this.ctx.strokeStyle = '#7a4a1f';
    this.ctx.lineWidth = 3;
    roundRect(this.ctx, x, y, w, h, 10);
    this.ctx.stroke();
    this.ctx.fillStyle = '#3a2410';
    this.ctx.font = 'bold 20px Georgia, serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    this.ctx.restore();
    return hover;
  }

  // ------------------------------------------------------------ update

  frame(ts) {
    const dt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;
    this.time += dt;
    this.update(dt);
    this.render();
    window.requestAnimationFrame((next) => this.frame(next));
  }

  update(dt) {
    const keys = this.input.drain();
    const click = this.input.takeClick();

    if (this.messageTime > 0) this.messageTime -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3);

    // A screenshot scene holds its pose: the world keeps animating, but
    // nothing scrolls, falls or gets collected while the shot is taken.
    if (this.frozenScene) {
      this.world.time += dt;
      this.turkey.runPhase += dt;
      this.input.drain();
      this.input.takeClick();
      return;
    }
    if (this.spotFlash > 0) this.spotFlash -= dt;

    for (const code of keys) {
      if (Input.matches(code, KEYS.mute)) {
        const muted = this.sound.toggleMute();
        this.flash(muted ? 'Sound OFF (M to turn on)' : 'Sound ON');
      }
    }

    if (this.state === STATES.TITLE) {
      this.world.time += dt;
      this.turkey.runPhase += dt;
      for (const code of keys) {
        if (Input.matches(code, KEYS.start)) this.startRun();
      }
      if (click) this.handleMenuClick(click, 'title');
      return;
    }

    if (this.state === STATES.PAUSED) {
      for (const code of keys) {
        if (Input.matches(code, KEYS.pause) || Input.matches(code, KEYS.start)) {
          this.state = STATES.PLAYING;
          this.flash('Back to the run!');
        }
      }
      if (click) this.handleMenuClick(click, 'paused');
      return;
    }

    if (this.state === STATES.CAUGHT || this.state === STATES.ESCAPED) {
      this.world.time += dt;
      for (const code of keys) {
        if (Input.matches(code, KEYS.restart)) this.startRun();
      }
      if (click) this.handleMenuClick(click, 'end');
      return;
    }

    // ---- PLAYING ----
    const t = this.turkey;
    const dashing = t.dashTime > 0;
    this.world.update(dt, dashing);
    t.runPhase += dt * (dashing ? 1.8 : 1);

    for (const code of keys) {
      if (Input.matches(code, KEYS.pause)) {
        this.state = STATES.PAUSED;
        this.sound.click();
        continue;
      }
      if (Input.matches(code, KEYS.up) && t.lane > 0 && !t.airborne) {
        t.lane--;
        this.sound.jump();
      } else if (Input.matches(code, KEYS.down) && t.lane < LANES.length - 1 && !t.airborne) {
        t.lane++;
        this.sound.jump();
      } else if (Input.matches(code, KEYS.jump)) {
        this.tryJump();
      } else if (Input.matches(code, KEYS.dash) && t.dashTime <= 0) {
        t.dashTime = PLAYER.dashTime;
        this.sound.dash();
      } else if (Input.matches(code, KEYS.hide)) {
        this.tryHide();
      } else if (code === 'PointerJump') {
        this.tryJump();
      }
    }
    if (click) {
      // A click on the lower half of the screen drops a lane; upper half jumps.
      if (click.y > CANVAS_H * 0.62 && t.lane < LANES.length - 1 && !t.airborne) t.lane++;
    }

    // Lane glide and jump physics.
    const targetY = LANES[t.lane];
    if (t.airborne) {
      t.vy += PLAYER.gravity;
      t.y += t.vy;
      if (t.y >= targetY) {
        t.y = targetY;
        t.vy = 0;
        t.airborne = false;
      }
    } else {
      t.y += (targetY - t.y) * 0.35;
    }
    if (t.dashTime > 0) t.dashTime -= dt;
    if (t.invulnerable > 0) t.invulnerable -= dt;
    if (t.hideTime > 0) {
      t.hideTime -= dt;
      if (t.hideTime <= 0) t.hidden = false;
    }

    // The farmer gains slowly; corn pushes him back, hits pull him close.
    this.farmerGap = clamp(this.farmerGap - dt * 1.1, 0, 100);
    this.farmerX = 30 + (100 - this.farmerGap) * 0.85;
    this.farmerPhase += dt;
    if (this.farmerGap < 22 && this.spotFlash <= 0 && t.invulnerable <= 0) {
      this.spotFlash = RUN.spotFlashTime;
      this.sound.spotted();
      this.flash("HE'S RIGHT BEHIND YOU — DASH!");
    }
    if (this.farmerGap <= 0) return this.getCaught('The farmer grabbed you by the tail feathers!');

    // Obstacles: pass them for points, hit them for a heart.
    for (const ob of this.world.obstacles) {
      if (!ob.passed && ob.x + ob.w < t.x - 24) {
        ob.passed = true;
        this.score += 5;
      }
      if (!ob.hit && this.world.hitsObstacle(t, ob) && t.invulnerable <= 0 && !t.hidden) {
        ob.hit = true;
        this.loseHeart(ob);
      }
    }

    // Pickups.
    for (const p of this.world.pickups) {
      if (p.taken) continue;
      if (this.world.pickupAt(t, p)) {
        p.taken = true;
        if (p.kind === 'corn') {
          this.corn++;
          this.score += RUN.cornScore;
          this.farmerGap = clamp(this.farmerGap + RUN.cornFarmerPush, 0, 100);
          this.sound.pickup();
        } else {
          this.feathers++;
          this.score += RUN.featherScore;
          if (this.hearts < PLAYER.hearts) this.hearts++;
          this.sound.feather();
          this.flash('GOLDEN FEATHER! +50 and a heart back!');
        }
      }
    }

    // Escaped!
    if (this.world.distance >= RUN.escapeDistance) {
      this.state = STATES.ESCAPED;
      this.best = Math.max(this.best, this.score);
      this.sound.escaped();
      this.sound.stopMusic();
    }
  }

  tryJump() {
    const t = this.turkey;
    if (t.airborne || t.hidden) return;
    t.airborne = true;
    t.vy = PLAYER.jumpVelocity;
    this.sound.jump();
  }

  tryHide() {
    const t = this.turkey;
    const hay = this.world.haystackNear(t);
    if (!hay || t.airborne) return;
    hay.used = true;
    t.hidden = true;
    t.hideTime = PLAYER.hideTime;
    this.farmerGap = clamp(this.farmerGap + 30, 0, 100);
    this.sound.gobble();
    this.flash('Hidden in the hay! The farmer runs past...');
  }

  loseHeart(obstacle) {
    this.hearts--;
    this.turkey.invulnerable = PLAYER.invulnerableTime;
    this.farmerGap = clamp(this.farmerGap - RUN.hitFarmerLurch, 0, 100);
    this.shake = 0.6;
    this.spotFlash = RUN.spotFlashTime;
    this.sound.hit();
    if (this.hearts <= 0) {
      this.getCaught(`Tripped on the ${obstacle.kind} — and the farmer was waiting!`);
    } else {
      this.flash(`Ouch! A ${obstacle.kind} cost a heart — ${this.hearts} left!`);
    }
  }

  getCaught(reason) {
    this.state = STATES.CAUGHT;
    this.best = Math.max(this.best, this.score);
    this.caughtReason = reason;
    this.sound.caught();
    this.sound.stopMusic();
  }

  handleMenuClick(click, menu) {
    for (const b of this.buttons) {
      if (click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h) {
        this.sound.click();
        b.action();
        return;
      }
    }
    if (menu === 'title') this.startRun();
    else if (menu === 'end') this.startRun();
    else if (menu === 'paused') this.state = STATES.PLAYING;
  }

  // ------------------------------------------------------------ render

  render() {
    const ctx = this.ctx;
    const stage = stageFor(this.world.distance);
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake * 18, (Math.random() - 0.5) * this.shake * 14);
    }
    drawSky(ctx, stage, this.time);
    drawBackdrop(ctx, stage, this.world.scroll);
    drawGround(ctx, stage, this.world.scroll, this.time);

    // Haystacks sit behind the turkey so hiding reads clearly.
    for (const h of this.world.haystacks) {
      drawHaystack(ctx, h.x, LANES[h.lane] + 26, this.time);
    }
    // Pickups.
    for (const p of this.world.pickups) {
      if (p.taken) continue;
      const py = LANES[p.lane] - 18;
      if (p.kind === 'corn') drawCorn(ctx, p.x, py, this.time);
      else drawFeather(ctx, p.x, py, this.time);
    }
    // Obstacles.
    for (const ob of this.world.obstacles) {
      drawObstacle(ctx, ob.kind, ob.x, GROUND_Y, this.time, ob.phase);
    }
    // Lane guides, faint, so the three lanes read at a glance.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    for (const y of LANES) {
      ctx.beginPath();
      ctx.moveTo(0, y + 28);
      ctx.lineTo(CANVAS_W, y + 28);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // The farmer chases from the left; the turkey runs ahead of him.
    const farmerVisible = this.state !== STATES.TITLE || true;
    if (farmerVisible) {
      drawFarmer(ctx, this.farmerX, LANES[this.turkey.lane] + 4, { runPhase: this.farmerPhase });
    }
    const t = this.turkey;
    drawTurkey(ctx, t.x, t.y, {
      runPhase: t.runPhase,
      airborne: t.airborne,
      hidden: t.hidden,
      invulnerable: t.invulnerable > 0,
      dashing: t.dashTime > 0,
    });

    // Distance markers: the route to freedom.
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`STAGE: ${stage.name}`, 16, CANVAS_H - 14);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(this.world.distance)} m / ${RUN.escapeDistance} m to freedom`, CANVAS_W - 16, CANVAS_H - 14);

    if (this.spotFlash > 0 && this.state === STATES.PLAYING) {
      ctx.fillStyle = `rgba(192, 57, 43, ${0.22 * (this.spotFlash / RUN.spotFlashTime)})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#c0392b';
      ctx.font = 'bold 30px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPOTTED!', CANVAS_W / 2, 96);
    }

    if (this.state === STATES.PLAYING || this.state === STATES.PAUSED) this.drawHud();

    if (this.message && this.messageTime > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(this.messageTime, 0, 1);
      ctx.fillStyle = 'rgba(58, 36, 16, 0.9)';
      roundRect(ctx, CANVAS_W / 2 - 260, 118, 520, 40, 20);
      ctx.fill();
      ctx.fillStyle = '#f7d08a';
      ctx.font = 'bold 19px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.message, CANVAS_W / 2, 139);
      ctx.restore();
    }

    if (this.state === STATES.TITLE) this.drawTitle();
    else if (this.state === STATES.PAUSED) this.drawPaused();
    else if (this.state === STATES.CAUGHT) this.drawEnd(false);
    else if (this.state === STATES.ESCAPED) this.drawEnd(true);

    ctx.restore();
  }

  drawHud() {
    const ctx = this.ctx;
    ctx.save();
    // Top bar.
    ctx.fillStyle = 'rgba(43, 22, 8, 0.82)';
    roundRect(ctx, 10, 10, CANVAS_W - 20, 54, 12);
    ctx.fill();
    // Score.
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`SCORE ${this.score}`, 26, 34);
    ctx.font = '16px Georgia, serif';
    ctx.fillText(`🌽 ${this.corn}   🪶 ${this.feathers}`, 26, 56);
    // Distance progress bar.
    const barX = 300;
    const barW = 300;
    const prog = clamp(this.world.distance / RUN.escapeDistance, 0, 1);
    ctx.fillStyle = '#5a3410';
    roundRect(ctx, barX, 22, barW, 16, 8);
    ctx.fill();
    ctx.fillStyle = '#7fc24a';
    if (prog > 0) {
      roundRect(ctx, barX, 22, barW * prog, 16, 8);
      ctx.fill();
    }
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(this.world.distance)} m — FREEDOM ${RUN.escapeDistance} m`, barX + barW / 2, 52);
    // Hearts.
    ctx.textAlign = 'right';
    ctx.font = '24px Georgia, serif';
    let hearts = '';
    for (let i = 0; i < PLAYER.hearts; i++) hearts += i < this.hearts ? '❤️' : '🖤';
    ctx.fillText(hearts, CANVAS_W - 26, 36);
    // Farmer danger meter.
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillStyle = '#f7d08a';
    ctx.fillText('FARMER', CANVAS_W - 196, 54);
    ctx.fillStyle = '#5a3410';
    roundRect(ctx, CANVAS_W - 186, 46, 120, 10, 5);
    ctx.fill();
    const danger = 1 - this.farmerGap / 100;
    ctx.fillStyle = danger > 0.7 ? '#c0392b' : danger > 0.4 ? '#e8a13a' : '#7fc24a';
    if (danger > 0) {
      roundRect(ctx, CANVAS_W - 186, 46, 120 * danger, 10, 5);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTitle() {
    const ctx = this.ctx;
    this.buttons = [];
    ctx.save();
    ctx.fillStyle = 'rgba(43, 22, 8, 0.55)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // Title card.
    ctx.fillStyle = 'rgba(58, 36, 16, 0.92)';
    roundRect(ctx, 150, 58, 660, 300, 18);
    ctx.fill();
    ctx.strokeStyle = '#e8a13a';
    ctx.lineWidth = 3;
    roundRect(ctx, 150, 58, 660, 300, 18);
    ctx.stroke();

    ctx.fillStyle = '#f7c948';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOBBLE DASH', CANVAS_W / 2, 138);
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'italic bold 26px Georgia, serif';
    ctx.fillText('The Great Turkey Escape', CANVAS_W / 2, 176);
    ctx.fillStyle = '#fff3c4';
    ctx.font = '17px Georgia, serif';
    ctx.fillText('Thanksgiving is coming — and YOU are the main course.', CANVAS_W / 2, 216);
    ctx.fillText('Outrun the farmer, dodge the oven and the carving knife,', CANVAS_W / 2, 242);
    ctx.fillText('grab the corn, and reach the forest 1200 m away!', CANVAS_W / 2, 268);
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillStyle = '#f7c948';
    ctx.fillText('W/S or ↑/↓ change lane  •  SPACE jump  •  SHIFT dash  •  H hide in hay', CANVAS_W / 2, 306);
    ctx.fillText('Click also works: click to jump, lower half to drop a lane.', CANVAS_W / 2, 330);

    // The stars of the show, posing on the title screen.
    drawTurkey(ctx, 300, 420, { runPhase: this.time });
    drawFarmer(ctx, 660, 424, { runPhase: this.time });

    this.button(CANVAS_W / 2 - 130, 392, 260, 52, '▶  START THE ESCAPE', () => this.startRun());
    ctx.fillStyle = '#d9b380';
    ctx.font = '15px Georgia, serif';
    ctx.fillText('Press ENTER or click START — sound on for gobbles!', CANVAS_W / 2, 470);
    if (this.best > 0) {
      ctx.fillStyle = '#f7c948';
      ctx.font = 'bold 16px Georgia, serif';
      ctx.fillText(`Best escape so far: ${this.best} points`, CANVAS_W / 2, 496);
    }
    ctx.restore();
  }

  drawPaused() {
    const ctx = this.ctx;
    this.buttons = [];
    ctx.save();
    ctx.fillStyle = 'rgba(43, 22, 8, 0.6)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_W / 2, 220);
    ctx.font = '18px Georgia, serif';
    ctx.fillText('The farmer waits for no turkey… except now. Catch your breath.', CANVAS_W / 2, 256);
    this.button(CANVAS_W / 2 - 110, 290, 220, 50, '▶  KEEP RUNNING', () => { this.state = STATES.PLAYING; });
    ctx.restore();
  }

  drawEnd(escaped) {
    const ctx = this.ctx;
    this.buttons = [];
    ctx.save();
    ctx.fillStyle = escaped ? 'rgba(38, 90, 40, 0.62)' : 'rgba(90, 20, 10, 0.62)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = 'rgba(58, 36, 16, 0.94)';
    roundRect(ctx, 190, 70, 580, 330, 18);
    ctx.fill();
    ctx.strokeStyle = escaped ? '#7fc24a' : '#c0392b';
    ctx.lineWidth = 4;
    roundRect(ctx, 190, 70, 580, 330, 18);
    ctx.stroke();

    ctx.textAlign = 'center';
    if (escaped) {
      ctx.fillStyle = '#7fc24a';
      ctx.font = 'bold 58px Georgia, serif';
      ctx.fillText('ESCAPED!', CANVAS_W / 2, 150);
      ctx.fillStyle = '#fff3c4';
      ctx.font = 'italic 22px Georgia, serif';
      ctx.fillText('You made it to the forest — no Thanksgiving dinner today!', CANVAS_W / 2, 190);
      drawTurkey(ctx, CANVAS_W / 2, 268, { runPhase: this.time });
    } else {
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 58px Georgia, serif';
      ctx.fillText('CAUGHT!', CANVAS_W / 2, 150);
      ctx.fillStyle = '#fff3c4';
      ctx.font = 'italic 22px Georgia, serif';
      ctx.fillText(this.caughtReason || 'The farmer got you.', CANVAS_W / 2, 190);
      ctx.font = '17px Georgia, serif';
      ctx.fillText('Tonight, the turkey is the main course…', CANVAS_W / 2, 218);
      drawFarmer(ctx, CANVAS_W / 2 - 60, 268, { runPhase: this.time });
      drawTurkey(ctx, CANVAS_W / 2 + 60, 272, { runPhase: 0 });
    }

    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(`SCORE ${this.score}    •    ${Math.floor(this.world.distance)} m run`, CANVAS_W / 2, 318);
    ctx.font = '17px Georgia, serif';
    ctx.fillText(`🌽 Corn ${this.corn}    🪶 Feathers ${this.feathers}    ❤️ Hearts left ${this.hearts}`, CANVAS_W / 2, 348);
    ctx.fillStyle = '#f7c948';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(`Best score: ${this.best}`, CANVAS_W / 2, 376);

    this.button(CANVAS_W / 2 - 130, 410, 260, 50, '↻  RUN AGAIN  (R)', () => this.startRun());
    ctx.fillStyle = '#d9b380';
    ctx.font = '15px Georgia, serif';
    ctx.fillText('Press R or click RUN AGAIN', CANVAS_W / 2, 486);
    ctx.restore();
  }
}
