// Gobble Dash — synthesized sound. No audio files: every gobble, chirp,
// thud and jingle is built from oscillators and filtered noise, so the
// game ships no sound assets and plays offline.

export class SoundBank {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  // Browsers only allow audio after a user gesture; call from the first
  // key press or click, then every effect just works.
  unlock() {
    if (this.context) {
      if (this.context.state === 'suspended') void this.context.resume();
      return;
    }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    this.context = new Ctor();
    this.master = this.context.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.context.destination);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  tone(freq, dur, type = 'sine', vol = 0.2, slideTo = null, delay = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + delay;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol = 0.2, lowpass = 1200, delay = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + delay;
    const len = Math.max(1, Math.floor(this.context.sampleRate * dur));
    const buf = this.context.createBuffer(1, len, this.context.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.context.createBufferSource();
    src.buffer = buf;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  gobble() {
    // The turkey's signature: a burst of short descending clucks.
    for (let i = 0; i < 5; i++) {
      this.tone(340 - i * 38, 0.09, 'square', 0.16, 180 - i * 20, i * 0.07);
    }
    this.tone(140, 0.22, 'triangle', 0.2, 90, 0.36);
  }

  jump() {
    this.noise(0.16, 0.1, 2400);
    this.tone(300, 0.14, 'sine', 0.1, 620);
  }

  dash() {
    this.noise(0.22, 0.16, 3200);
  }

  pickup() {
    this.tone(880, 0.09, 'sine', 0.18);
    this.tone(1318, 0.12, 'sine', 0.16, null, 0.07);
  }

  feather() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.16, null, i * 0.06));
  }

  hit() {
    this.noise(0.25, 0.3, 700);
    this.tone(160, 0.3, 'sawtooth', 0.22, 60);
  }

  spotted() {
    this.tone(196, 0.16, 'square', 0.18);
    this.tone(147, 0.22, 'square', 0.18, null, 0.14);
  }

  caught() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.2, null, i * 0.22));
    this.noise(0.5, 0.12, 500, 0.1);
  }

  escaped() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.2, null, i * 0.11));
    this.tone(1568, 0.5, 'sine', 0.16, null, 0.55);
  }

  click() {
    this.tone(660, 0.06, 'sine', 0.14);
  }

  // A cheerful plucked folk loop: banjo-ish square plucks over a soft bass.
  // Runs on a step timer so it costs almost nothing.
  startMusic() {
    if (!this.context || this.musicTimer) return;
    const melody = [392, 0, 523, 659, 0, 587, 523, 440, 392, 0, 440, 523, 587, 659, 784, 0];
    const bass = [131, 0, 0, 98, 0, 0, 110, 0, 131, 0, 0, 98, 0, 110, 0, 0];
    this.musicTimer = window.setInterval(() => {
      if (this.muted) return;
      const i = this.musicStep % 16;
      const m = melody[i];
      const b = bass[i];
      if (m) this.tone(m, 0.16, 'square', 0.05);
      if (b) this.tone(b, 0.3, 'triangle', 0.09);
      this.musicStep++;
    }, 210);
  }

  stopMusic() {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
