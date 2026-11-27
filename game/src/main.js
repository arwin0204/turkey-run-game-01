// Gobble Dash — bootstrap. One clear job: find the canvas, start the
// game, and report a loud, readable error if anything fails to load.

import { GobbleDash } from './game.js';

const canvas = document.getElementById('game');
if (!canvas) {
  throw new Error('Gobble Dash: no #game canvas in the page.');
}

try {
  const game = new GobbleDash(canvas);
  // Exposed for play-testing and screenshots: window.__gobble holds the
  // live game (state, score, distance) so a test can drive and read it.
  window.__gobble = game;
} catch (error) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2b1608';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f7d08a';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gobble Dash could not start.', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '16px Georgia, serif';
    ctx.fillText(String(error && error.message ? error.message : error), canvas.width / 2, canvas.height / 2 + 22);
  }
  throw error;
}
