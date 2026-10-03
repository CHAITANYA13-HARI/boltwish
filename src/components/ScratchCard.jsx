import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Eye } from 'lucide-react';
import { celebrationAudio, triggerHaptic } from '../lib/celebrationAudio';
import { fireReactionCannon } from '../lib/celebrationConfetti';

export function ScratchCard({ secretMessage, title = 'Secret Blessing' }) {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);

  const defaultSecret = secretMessage || 'You are deeply appreciated, cherished, and loved. May this year bring endless wonderful moments to your life! ✨';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    let animId;
    const initCanvas = () => {
      const width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 340;
      const height = canvas.offsetHeight || 140;

      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(initCanvas);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw shimmering metallic foil
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#d1d5db');
      gradient.addColorStop(0.3, '#f3f4f6');
      gradient.addColorStop(0.5, '#9ca3af');
      gradient.addColorStop(0.7, '#e5e7eb');
      gradient.addColorStop(1, '#9ca3af');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Decorative pattern on foil
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < width; i += 24) {
        for (let j = 0; j < height; j += 24) {
          ctx.fillRect(i, j, 3, 3);
        }
      }

      // Centered foil instructions
      ctx.fillStyle = '#4b5563';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨ Scratch here with your finger/mouse ✨', width / 2, height / 2 - 8);

      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('to reveal a hidden surprise', width / 2, height / 2 + 16);
    };

    animId = requestAnimationFrame(initCanvas);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isRevealed]);

  const scratch = (clientX, clientY) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    triggerHaptic(10);

    // Calculate scratched area every few strokes
    if (Math.random() > 0.6) {
      checkPercent(ctx, canvas.width, canvas.height);
    }
  };

  const checkPercent = (ctx, w, h) => {
    try {
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      let transparentPixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 3; i < data.length; i += 4 * 16) {
        if (data[i] === 0) transparentPixels++;
      }

      const percent = Math.round((transparentPixels / (totalPixels / 16)) * 100);
      setScratchedPercent(percent);

      if (percent > 42 && !isRevealed) {
        revealFull();
      }
    } catch {
      // fallback
    }
  };

  const revealFull = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    triggerHaptic([30, 40, 30]);
    celebrationAudio.playPop();
    fireReactionCannon('✨');
  };

  const handlePointerDown = (e) => {
    try {
      e.target?.setPointerCapture?.(e.pointerId);
    } catch {}
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    try {
      e?.target?.releasePointerCapture?.(e.pointerId);
    } catch {}
    setIsScratching(false);
  };

  return (
    <div className="scratch-card-container">
      <div className="scratch-card-header">
        <div className="scratch-badge">
          <Sparkles size={14} /> <span>{title}</span>
        </div>
        {!isRevealed && (
          <button
            type="button"
            className="scratch-reveal-btn"
            onClick={revealFull}
            title="Instant reveal"
          >
            <Eye size={13} /> <span>Tap to Reveal</span>
          </button>
        )}
      </div>

      <div className="scratch-card-box">
        {/* Hidden secret message underneath */}
        <div className="scratch-secret-content">
          <div className="scratch-sparkle-orbit">✨</div>
          <p className="scratch-secret-text">“{defaultSecret}”</p>
          <span className="scratch-secret-tag">Special hidden note for you</span>
        </div>

        {/* Scratchable silver foil canvas */}
        <AnimatePresence>
          {!isRevealed && (
            <motion.canvas
              ref={canvasRef}
              className="scratch-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.3 } }}
            />
          )}
        </AnimatePresence>
      </div>

      {!isRevealed && scratchedPercent > 0 && (
        <div className="scratch-progress-bar">
          <div className="scratch-progress-fill" style={{ width: `${Math.min(100, scratchedPercent * 2.3)}%` }} />
        </div>
      )}
    </div>
  );
}
