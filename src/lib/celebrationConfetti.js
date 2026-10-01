/**
 * celebrationConfetti.js
 * Multi-directional celebratory confetti and floating hearts animation.
 * Uses lightweight canvas-confetti with zero backend costs.
 */

import confetti from 'canvas-confetti';

/**
 * Standard celebratory confetti burst
 */
export function fireCelebrationConfetti() {
  confetti({
    particleCount: 90,
    spread: 85,
    origin: { y: 0.65 },
    colors: ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#8338ec', '#ff70a6'],
  });
}

/**
 * Grand multi-stage celebratory explosion (for envelope unboxing & candle blow)
 */
export function fireGrandConfetti() {
  const count = 220;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#ff4d6d', '#ffd166', '#70e000', '#00b4d8', '#7209b7', '#f72585', '#ffffff'],
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Multi-tier blast
  fire(0.25, { spread: 35, startVelocity: 60 });
  fire(0.2, { spread: 65 });
  fire(0.35, { spread: 110, decay: 0.91, scalar: 0.85 });
  fire(0.1, { spread: 130, startVelocity: 28, decay: 0.92, scalar: 1.25 });
  fire(0.1, { spread: 130, startVelocity: 48 });
}

/**
 * Floating hearts shower for "Send Love Back" reactions
 */
export function fireFloatingHearts() {
  confetti({
    particleCount: 45,
    spread: 70,
    origin: { y: 0.8 },
    scalar: 1.2,
    colors: ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#ffd166'],
  });
}
