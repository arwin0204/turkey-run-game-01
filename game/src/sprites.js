// Gobble Dash — all the art, drawn in code. No image files: the turkey,
// the farmer, the oven, the carving knife and every prop are canvas paths
// in a coherent autumn palette, so the game ships no art assets.

import { CANVAS_W, CANVAS_H, GROUND_Y } from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- the turkey

export function drawTurkey(ctx, x, y, opts = {}) {
  const {
    runPhase = 0,
    airborne = false,
    hidden = false,
    invulnerable = false,
    dashing = false,
    facing = 1,
    scale = 1,
  } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  if (invulnerable && Math.floor(runPhase * 9) % 2 === 0) ctx.globalAlpha = 0.45;
  if (hidden) ctx.globalAlpha = 0.55;

  const legSwing = airborne ? 0.5 : Math.sin(runPhase * 10) * 0.55;
  const bob = airborne ? -6 : Math.abs(Math.sin(runPhase * 10)) * -2;

  // Tail fan: five autumn feathers fanning behind the body.
  const tailColors = ['#b5541e', '#d97b29', '#e8a13a', '#8a3b12', '#c96a1e'];
  ctx.save();
  ctx.translate(-20, -8 + bob);
  for (let i = 0; i < 5; i++) {
    const ang = -1.15 + i * 0.5;
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = tailColors[i];
    ctx.beginPath();
    ctx.ellipse(-16, 0, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7d08a';
    ctx.beginPath();
    ctx.ellipse(-28, 0, 5, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Legs: two orange sticks mid-stride.
  ctx.strokeStyle = '#e8862a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 12 + bob);
  ctx.lineTo(-6 + Math.sin(legSwing) * 10, 26);
  ctx.moveTo(6, 12 + bob);
  ctx.lineTo(6 + Math.sin(legSwing + Math.PI) * 10, 26);
  ctx.stroke();

  // Body: a plump brown oval with a cream belly.
  ctx.fillStyle = '#7a4a21';
  ellipse(ctx, 0, 0 + bob, 26, 21);
  ctx.fillStyle = '#a06838';
  ellipse(ctx, 2, 4 + bob, 20, 15);
  ctx.fillStyle = '#e8c491';
  ellipse(ctx, 8, 6 + bob, 12, 9);

  // Wing, darker and slightly raised when dashing.
  ctx.fillStyle = '#5d3413';
  ctx.save();
  ctx.translate(-4, -2 + bob);
  ctx.rotate(dashing ? -0.9 : -0.35 + Math.sin(runPhase * 10) * 0.08);
  ctx.beginPath();
  ctx.ellipse(-4, 0, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Neck and head.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(14, -30 + bob, 9, 22);
  ctx.fillStyle = '#c98a4b';
  circle(ctx, 19, -32 + bob, 11);
  // Beak.
  ctx.fillStyle = '#e8a13a';
  ctx.beginPath();
  ctx.moveTo(28, -34 + bob);
  ctx.lineTo(40, -30 + bob);
  ctx.lineTo(28, -27 + bob);
  ctx.closePath();
  ctx.fill();
  // Wattle: the red flap under the beak.
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(30, -24 + bob, 4, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eye: wide and panicked, as a fleeing turkey's should be.
  ctx.fillStyle = '#fff';
  circle(ctx, 22, -36 + bob, 4.2);
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, 23.5, -36 + bob, 2.2);

  ctx.restore();
}

// ---------------------------------------------------------------- the farmer

export function drawFarmer(ctx, x, y, opts = {}) {
  const { runPhase = 0, angry = true, scale = 1 } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const swing = Math.sin(runPhase * 9) * 0.5;

  // Legs in overalls, mid-chase.
  ctx.strokeStyle = '#3a5a8c';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.lineTo(-4 + Math.sin(swing) * 12, 30);
  ctx.moveTo(5, 8);
  ctx.lineTo(5 + Math.sin(swing + Math.PI) * 12, 30);
  ctx.stroke();

  // Torso: red plaid shirt under blue overalls.
  ctx.fillStyle = '#a93226';
  roundRect(ctx, -14, -22, 30, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#3a5a8c';
  roundRect(ctx, -12, -8, 26, 20, 5);
  ctx.fill();
  ctx.fillStyle = '#f7d08a';
  ctx.fillRect(-2, -8, 5, 5);

  // Arms pumping; the right one grips a wooden spoon like a weapon.
  ctx.strokeStyle = '#a93226';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-12, -16);
  ctx.lineTo(-22, -2 + Math.sin(swing) * 6);
  ctx.moveTo(14, -16);
  ctx.lineTo(24, -6 + Math.sin(swing + Math.PI) * 6);
  ctx.stroke();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(24, -6 + Math.sin(swing + Math.PI) * 6);
  ctx.lineTo(34, -20);
  ctx.stroke();
  ctx.fillStyle = '#d9b380';
  ellipse(ctx, 35, -22, 5, 7);

  // Head with a straw hat and a very determined moustache.
  ctx.fillStyle = '#e8b88a';
  circle(ctx, 2, -32, 12);
  ctx.fillStyle = '#d9b380';
  ctx.beginPath();
  ctx.ellipse(2, -40, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9a13a';
  ctx.beginPath();
  ctx.ellipse(2, -44, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a1f';
  ctx.fillRect(-9, -45, 22, 3);
  // Angry brows and moustache.
  ctx.strokeStyle = '#4a2c10';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, -38);
  ctx.lineTo(2, -35);
  ctx.moveTo(10, -38);
  ctx.lineTo(4, -35);
  ctx.stroke();
  ctx.fillStyle = '#4a2c10';
  ctx.beginPath();
  ctx.ellipse(3, -26, 7, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    ctx.fillStyle = '#fff';
    circle(ctx, -1, -36, 2.4);
    circle(ctx, 7, -36, 2.4);
    ctx.fillStyle = '#1a1a1a';
    circle(ctx, 0, -36, 1.2);
    circle(ctx, 8, -36, 1.2);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- obstacles

export function drawOven(ctx, x, groundY, w, h, t) {
  const top = groundY - h;
  // Body: a squat black iron oven with a glowing door.
  ctx.fillStyle = '#2b2b2b';
  roundRect(ctx, x, top, w, h, 8);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  roundRect(ctx, x + 6, top + 8, w - 12, 26, 5);
  ctx.fill();
  // Fire glow in the door window, flickering.
  const flick = 0.75 + Math.sin(t * 9) * 0.2 + Math.sin(t * 23) * 0.08;
  const glow = ctx.createRadialGradient(x + w / 2, top + 62, 4, x + w / 2, top + 62, 34);
  glow.addColorStop(0, `rgba(255, 190, 60, ${0.95 * flick})`);
  glow.addColorStop(0.6, `rgba(230, 90, 20, ${0.7 * flick})`);
  glow.addColorStop(1, 'rgba(200, 40, 10, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 8, top + 26, w + 16, 76);
  ctx.fillStyle = '#ff9d2e';
  roundRect(ctx, x + 12, top + 44, w - 24, 40, 6);
  ctx.fill();
  ctx.fillStyle = '#3d1f0e';
  ctx.fillRect(x + 12, top + 60, w - 24, 4);
  // Chimney with a puff of smoke.
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(x + w - 26, top - 22, 16, 24);
  ctx.fillStyle = 'rgba(220, 220, 220, 0.55)';
  const puff = (t * 0.6) % 1;
  circle(ctx, x + w - 18 + Math.sin(t * 2) * 4, top - 26 - puff * 30, 5 + puff * 7);
  // Danger sign.
  ctx.fillStyle = '#f7d08a';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', x + w / 2, top + 22);
}

export function drawKnife(ctx, x, groundY, w, h, t, phase) {
  // A carving knife that swings down from above on a timer: pass while it
  // is raised, wait (or dash) while it is down.
  const cycle = (t * 0.9 + phase) % 1;
  const drop = cycle < 0.45 ? 0 : cycle < 0.6 ? (cycle - 0.45) / 0.15 : cycle < 0.85 ? 1 : 1 - (cycle - 0.85) / 0.15;
  const bladeTop = groundY - h + drop * 46;
  const bladeH = h - 26;
  ctx.save();
  ctx.translate(x + w / 2, bladeTop);
  ctx.rotate(0.06);
  // Blade: bright steel with a glint.
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(w / 2, 0);
  ctx.lineTo(w / 2 - 3, bladeH - 14);
  ctx.lineTo(0, bladeH);
  ctx.lineTo(-w / 2 + 3, bladeH - 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(-w / 2 + 4, 6, 3, bladeH - 26);
  // Handle.
  ctx.fillStyle = '#4a2c10';
  roundRect(ctx, -w / 2 - 1, -22, w + 2, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#c9a13a';
  ctx.fillRect(-w / 2 - 1, -4, w + 2, 3);
  ctx.restore();
  // Warning shadow on the ground while the blade is down.
  if (drop > 0.5) {
    ctx.fillStyle = 'rgba(192, 57, 43, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, groundY + 6, w, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawObstacle(ctx, kind, x, groundY, t, phase = 0) {
  const def = { fence: [46, 52], haybale: [56, 50], pumpkin: [44, 38], puddle: [78, 12], crate: [54, 56], pitchfork: [30, 62], sack: [52, 44], pot: [60, 84] }[kind];
  if (kind === 'oven') {
    drawOven(ctx, x, groundY, 74, 128, t);
    return;
  }
  if (kind === 'knife') {
    drawKnife(ctx, x, groundY, 34, 118, t, phase);
    return;
  }
  const [w, h] = def;
  const top = groundY - h;
  if (kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(x, top + 6, w, 6);
    ctx.fillRect(x, top + 26, w, 6);
    ctx.fillStyle = '#6e4423';
    ctx.fillRect(x + 4, top, 7, h);
    ctx.fillRect(x + w - 11, top, 7, h);
    ctx.fillStyle = '#a06838';
    ctx.beginPath();
    ctx.moveTo(x + 4, top);
    ctx.lineTo(x + 7.5, top - 8);
    ctx.lineTo(x + 11, top);
    ctx.moveTo(x + w - 11, top);
    ctx.lineTo(x + w - 7.5, top - 8);
    ctx.lineTo(x + w - 4, top);
    ctx.fill();
  } else if (kind === 'haybale') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b5812a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + h / 2, w / 2 - 6, h / 2 - 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + h / 2, w / 2 - 14, h / 2 - 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'pumpkin') {
    ctx.fillStyle = '#e8721c';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + h / 2 + 4, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b5541e';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, top + h / 2 + 4, w / 2 - 8 + Math.abs(i) * -2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#5d7a2a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top + 2);
    ctx.quadraticCurveTo(x + w / 2 + 4, top - 8, x + w / 2 + 10, top - 10);
    ctx.stroke();
  } else if (kind === 'puddle') {
    ctx.fillStyle = '#6b4a2f';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, groundY + 2, w / 2, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6a45';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 8, groundY + 1, w / 4, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'crate') {
    ctx.fillStyle = '#a06838';
    ctx.fillRect(x, top, w, h);
    ctx.strokeStyle = '#6e4423';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, top + 2, w - 4, h - 4);
    ctx.beginPath();
    ctx.moveTo(x + 2, top + 2);
    ctx.lineTo(x + w - 2, top + h - 2);
    ctx.moveTo(x + w - 2, top + 2);
    ctx.lineTo(x + 2, top + h - 2);
    ctx.stroke();
  } else if (kind === 'pitchfork') {
    ctx.strokeStyle = '#8a8f96';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top + h);
    ctx.lineTo(x + w / 2, top + 16);
    ctx.stroke();
    ctx.lineWidth = 3.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + w / 2 + i * 10, top + 18);
      ctx.lineTo(x + w / 2 + i * 10, top);
      ctx.stroke();
    }
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top + 18);
    ctx.lineTo(x + w / 2, top + h);
    ctx.stroke();
  } else if (kind === 'sack') {
    ctx.fillStyle = '#d9c49a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + h / 2 + 4, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a68a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, top + 12);
    ctx.quadraticCurveTo(x + w / 2, top + 26, x + w - 8, top + 12);
    ctx.stroke();
    ctx.fillStyle = '#8a6a45';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FEED', x + w / 2, top + h - 12);
  } else if (kind === 'pot') {
    ctx.fillStyle = '#3a3a3a';
    roundRect(ctx, x, top + 18, w, h - 18, 10);
    ctx.fill();
    ctx.fillStyle = '#5a5a5a';
    roundRect(ctx, x - 4, top + 12, w + 8, 12, 5);
    ctx.fill();
    const bub = 0.6 + Math.sin(t * 7 + x) * 0.3;
    ctx.fillStyle = `rgba(255, 220, 120, ${0.5 + bub * 0.3})`;
    circle(ctx, x + w / 2 - 10, top + 14, 4 + bub * 2);
    circle(ctx, x + w / 2 + 12, top + 12, 3 + bub * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    circle(ctx, x + w / 2, top - 6 - ((t * 20 + x) % 18), 3);
  }
}

// ---------------------------------------------------------------- pickups

export function drawCorn(ctx, x, y, t) {
  const bobY = y + Math.sin(t * 4 + x * 0.05) * 3;
  ctx.save();
  ctx.translate(x, bobY);
  ctx.rotate(Math.sin(t * 2) * 0.12);
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a13a';
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      circle(ctx, c * 5, r * 7, 1.6);
    }
  }
  ctx.fillStyle = '#5d7a2a';
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.quadraticCurveTo(-14, 18, -6, 20);
  ctx.quadraticCurveTo(-2, 14, -8, 8);
  ctx.fill();
  ctx.restore();
}

export function drawFeather(ctx, x, y, t) {
  const bobY = y + Math.sin(t * 3 + x * 0.05) * 4;
  ctx.save();
  ctx.translate(x, bobY);
  ctx.rotate(-0.4 + Math.sin(t * 2) * 0.15);
  ctx.fillStyle = '#f7d08a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a13a';
  ctx.beginPath();
  ctx.ellipse(0, -2, 4, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, 18);
  ctx.stroke();
  ctx.restore();
}

export function drawHaystack(ctx, x, groundY, t) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(x + 6, groundY - 74, x + 34, groundY - 78);
  ctx.quadraticCurveTo(x + 62, groundY - 74, x + 68, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b5812a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 10 + i * 14, groundY - 8);
    ctx.quadraticCurveTo(x + 14 + i * 14, groundY - 44, x + 20 + i * 12, groundY - 62);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2a12';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HIDE!  (H)', x + 34, groundY - 84 - Math.abs(Math.sin(t * 3)) * 4);
}

// ---------------------------------------------------------------- scenery

export function drawSky(ctx, stage, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, stage.skyTop);
  grad.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y);
  // Low autumn sun.
  const sun = ctx.createRadialGradient(790, 92, 8, 790, 92, 70);
  sun.addColorStop(0, 'rgba(255, 244, 200, 0.95)');
  sun.addColorStop(0.4, 'rgba(255, 210, 110, 0.55)');
  sun.addColorStop(1, 'rgba(255, 210, 110, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(700, 0, 180, 180);
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 790, 92, 30);
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255, 244, 220, 0.75)';
  for (let i = 0; i < 3; i++) {
    const cx = ((t * 6 + i * 340) % (CANVAS_W + 240)) - 120;
    const cy = 58 + i * 34;
    ellipse(ctx, cx, cy, 52, 15);
    ellipse(ctx, cx + 34, cy + 6, 38, 12);
    ellipse(ctx, cx - 36, cy + 7, 32, 11);
  }
  // A distant flock, flying the other way — freedom, that way.
  ctx.strokeStyle = 'rgba(60, 30, 10, 0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const bx = ((t * 26 + i * 130) % (CANVAS_W + 120)) - 60;
    const by = 130 + i * 18;
    const flap = Math.sin(t * 6 + i * 2) * 4;
    ctx.beginPath();
    ctx.moveTo(bx - 8, by + flap);
    ctx.quadraticCurveTo(bx, by - 4, bx + 8, by + flap);
    ctx.stroke();
  }
}

export function drawGround(ctx, stage, scroll, t) {
  // Dirt ground with a grassy top strip.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 10);
  ctx.fillStyle = stage.accent;
  for (let x = -((scroll * 0.5) % 46); x < CANVAS_W; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 10);
    ctx.lineTo(x + 8, GROUND_Y + 2);
    ctx.lineTo(x + 16, GROUND_Y + 10);
    ctx.fill();
  }
  // Scattered leaves tumbling along the ground.
  ctx.fillStyle = 'rgba(217, 123, 41, 0.8)';
  for (let i = 0; i < 6; i++) {
    const lx = ((scroll * 1.1 + i * 173) % (CANVAS_W + 60)) - 30;
    const ly = GROUND_Y + 26 + (i % 3) * 18;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(t * 2 + i);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
}

export function drawBackdrop(ctx, stage, scroll) {
  // Parallax silhouettes: trees and fences in the farmyard, barn walls in
  // the barn, kitchen shelves in the kitchen.
  ctx.save();
  ctx.globalAlpha = 0.5;
  if (stage.id === 'kitchen') {
    ctx.fillStyle = '#4a2412';
    ctx.fillRect(0, 120, CANVAS_W, 10);
    ctx.fillRect(0, 240, CANVAS_W, 10);
    for (let i = 0; i < 5; i++) {
      const px = 60 + i * 190 - ((scroll * 0.25) % 190);
      ctx.fillStyle = '#5a2e16';
      ctx.fillRect(px, 88, 54, 32);
      ctx.fillRect(px + 90, 208, 40, 32);
    }
    ctx.fillStyle = '#3d1f0e';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'left';
    // (The kitchen's name is already in the HUD and the bottom bar.)
  } else {
    ctx.fillStyle = stage.accent;
    for (let i = 0; i < 6; i++) {
      const tx = 40 + i * 180 - ((scroll * 0.3) % 180);
      // Tree trunk and autumn canopy.
      ctx.fillRect(tx, GROUND_Y - 120, 12, 120);
      ctx.beginPath();
      ctx.arc(tx + 6, GROUND_Y - 138, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx - 26, GROUND_Y - 118, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + 32, GROUND_Y - 116, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    if (stage.id === 'barn') {
      ctx.fillStyle = '#5a3410';
      ctx.fillRect(0, GROUND_Y - 190, CANVAS_W, 190);
      ctx.fillStyle = '#7a4a1f';
      for (let x = 0; x < CANVAS_W; x += 60) ctx.fillRect(x, GROUND_Y - 190, 4, 190);
      ctx.fillStyle = '#3d1f0e';
      ctx.beginPath();
      ctx.moveTo(430, GROUND_Y - 190);
      ctx.lineTo(530, GROUND_Y - 190);
      ctx.lineTo(530, GROUND_Y - 90);
      ctx.lineTo(430, GROUND_Y - 90);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}
