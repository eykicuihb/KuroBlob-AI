/**
 * 🎵 SoundFX — Web Audio Procedural Synthesizer for KuroBlob AI
 * 100% Zero external audio files. Synthesizes cute, tactile, interactive sound effects in real-time.
 */

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = typeof localStorage !== 'undefined' ? localStorage.getItem('kuroblob_muted') === 'true' : false;
    this.volume = typeof localStorage !== 'undefined' ? parseFloat(localStorage.getItem('kuroblob_volume') || '0.35') : 0.35;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (typeof localStorage !== 'undefined') localStorage.setItem('kuroblob_muted', muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (typeof localStorage !== 'undefined') localStorage.setItem('kuroblob_volume', this.volume);
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * 🫧 Pop sound: Light, crisp bubble click
   */
  pop(freq = 600, duration = 0.06) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + duration * 0.4);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * 🍮 Boing sound: Rubbery elastic spring bounce
   */
  boing(intensity = 1.0) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.28 * Math.max(0.6, intensity);
    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 180 + Math.min(intensity * 40, 100);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + duration);

    // FM modulation for rubbery wobble
    mod.type = 'sine';
    mod.frequency.setValueAtTime(25, now);
    modGain.gain.setValueAtTime(60, now);
    modGain.gain.exponentialRampToValueAtTime(1, now + duration);

    mod.connect(modGain);
    modGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    mod.start(now);
    osc.start(now);
    mod.stop(now + duration);
    osc.stop(now + duration);
  }

  /**
   * 🤏 Poke sound: Squeaky cute jelly poke
   */
  poke() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.14;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(440, now + duration);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * 💧 Water droplet blink sound
   */
  blink() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.05;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + duration);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * ⌨️ Typing blip: Soft, subtle digital blip for streaming AI text
   */
  typingBlip() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.03;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freqs = [640, 720, 800, 960];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * 🎼 Emotion musical signature
   */
  emotionReaction(emotion) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (emotion) {
      case 'HAPPY':
      case 'EXCITED':
      case 'PARTY':
        this.playArpeggio([523.25, 659.25, 783.99, 1046.50], 0.07, 'sine'); // C5, E5, G5, C6
        break;

      case 'LOVE':
      case 'SHY':
        this.playDualTone(587.33, 880, 0.25, 'sine'); // D5, A5 warm chord
        break;

      case 'SURPRISED':
      case 'STAR':
        this.playSlide(350, 1200, 0.18, 'triangle');
        break;

      case 'ANGRY':
      case 'EVIL':
      case 'DEVIL':
        this.playBuzz(120, 75, 0.28);
        break;

      case 'SAD':
      case 'CRYING':
        this.playSlide(440, 260, 0.35, 'sine');
        break;

      case 'MAGIC':
      case 'COSMIC':
      case 'ZEN':
        this.playArpeggio([659.25, 880, 987.77, 1318.51, 1567.98], 0.06, 'sine');
        break;

      case 'SLEEPING':
        this.playSlide(300, 180, 0.45, 'sine');
        break;

      default:
        this.pop(700, 0.08);
        break;
    }
  }

  playArpeggio(notes, interval = 0.08, type = 'sine') {
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
      }, i * interval * 1000);
    });
  }

  playDualTone(f1, f2, duration = 0.2, type = 'sine') {
    const now = this.ctx.currentTime;
    [f1, f2].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  playSlide(fromFreq, toFreq, duration = 0.2, type = 'sine') {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(fromFreq, now);
    osc.frequency.exponentialRampToValueAtTime(toFreq, now + duration);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  playBuzz(fromFreq, toFreq, duration = 0.25) {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(fromFreq, now);
    osc.frequency.linearRampToValueAtTime(toFreq, now + duration);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }
}

export const soundFx = new SoundFX();
