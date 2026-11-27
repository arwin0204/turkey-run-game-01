// Gobble Dash — keyboard and mouse input. One clear job: turn raw events
// into the game's verbs (lane up/down, jump, dash, hide, pause, clicks),
// and expose the pointer position so menus can be clicked.

import { KEYS } from './config.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.pressed = new Set();
    this.queue = [];
    this.pointer = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
    this.onFirstGesture = null;

    window.addEventListener('keydown', (event) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
      if (!event.repeat) {
        this.pressed.add(event.code);
        this.queue.push(event.code);
        this.gesture();
      }
    });
    window.addEventListener('keyup', (event) => {
      this.pressed.delete(event.code);
    });
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      this.pointer.x = x;
      this.pointer.y = y;
      this.pointer.clicked = true;
      this.pointer.clickX = x;
      this.pointer.clickY = y;
      this.queue.push('PointerJump');
      this.gesture();
    });
    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      this.pointer.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    });
    window.addEventListener('blur', () => this.pressed.clear());
  }

  gesture() {
    if (this.onFirstGesture) {
      const fn = this.onFirstGesture;
      this.onFirstGesture = null;
      fn();
    }
  }

  // Drain the keys pressed since the last frame; the game acts on each once.
  drain() {
    const out = this.queue;
    this.queue = [];
    return out;
  }

  takeClick() {
    const was = this.pointer.clicked;
    this.pointer.clicked = false;
    return was ? { x: this.pointer.clickX, y: this.pointer.clickY } : null;
  }

  held(code) {
    return this.pressed.has(code);
  }

  static matches(code, list) {
    return list.includes(code);
  }
}

export { KEYS };
