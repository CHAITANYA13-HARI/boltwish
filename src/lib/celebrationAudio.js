/**
 * celebrationAudio.js
 * Pure Web Audio API Synthesizer - 100% free, zero external audio assets, zero bandwidth.
 * Generates rich celebratory chords, harp arpeggios, and party sounds directly in the browser.
 */

class CelebrationAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(val) {
    this.muted = Boolean(val);
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, duration, type = 'sine', startTime = 0, gainValue = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(gainValue, this.ctx.currentTime + startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration + 0.05);
    } catch {
      // AudioContext autoplay restrictions or inactive tab
    }
  }

  /**
   * Magical celesta harp chime for opening the wax seal & envelope
   */
  playEnvelopeOpen() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.65, 'triangle', idx * 0.075, 0.18);
      this.playTone(freq * 1.5, 0.45, 'sine', idx * 0.075 + 0.02, 0.07);
    });
  }

  /**
   * Cheerful birthday celebration fanfare when candles are blown
   */
  playCandleBlow() {
    this.init();
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]; // G4, C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.8, 'triangle', idx * 0.065, 0.17);
      this.playTone(freq * 0.5, 0.9, 'sine', idx * 0.065, 0.1);
    });
  }

  /**
   * Crisp snappy confetti popper sound
   */
  playPop() {
    this.init();
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(85, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  /**
   * Warm romantic / emotional harp chord for "Send Love Back"
   */
  playLoveReaction() {
    this.init();
    const chord = [440.00, 554.37, 659.25, 880.00, 1108.73]; // A major 9th
    chord.forEach((freq, idx) => {
      this.playTone(freq, 0.7, 'sine', idx * 0.06, 0.16);
      this.playTone(freq * 2, 0.5, 'triangle', idx * 0.06 + 0.02, 0.06);
    });
  }
}

export const celebrationAudio = new CelebrationAudio();
