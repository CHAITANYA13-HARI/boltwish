import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, RotateCcw } from 'lucide-react';
import { celebrationAudio } from '../lib/celebrationAudio';
import { fireGrandConfetti } from '../lib/celebrationConfetti';

export function BirthdayCake({ recipientName }) {
  const [blown, setBlown] = useState(false);

  const handleBlow = () => {
    celebrationAudio.playCandleBlow();
    fireGrandConfetti();
    setBlown(true);
  };

  const handleRelight = (e) => {
    e.stopPropagation();
    celebrationAudio.playPop();
    setBlown(false);
  };

  return (
    <div className="birthday-interactive-section">
      <div className="birthday-cake-card" onClick={!blown ? handleBlow : undefined} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && !blown && handleBlow()}>
        <div className="cake-headline">
          <Sparkles size={16} className="sparkle-spin" />
          <span>Interactive Birthday Moment</span>
        </div>

        {/* The Animated Cake */}
        <div className="cake-stage">
          <div className="cake-candles-row">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="cake-candle">
                {!blown ? (
                  <div className={`candle-flame flame-wiggle-${idx + 1}`} />
                ) : (
                  <div className="candle-smoke" />
                )}
                <div className="candle-wick" />
                <div className="candle-stick" />
              </div>
            ))}
          </div>

          <div className="cake-tier cake-tier-top">
            <div className="cake-frosting-drips" />
            <div className="cake-decorations">
              <span>🍓</span><span>✨</span><span>🍓</span>
            </div>
          </div>
          <div className="cake-tier cake-tier-base">
            <div className="cake-stripes" />
          </div>
          <div className="cake-plate" />
        </div>

        {/* Action / Wish outcome */}
        <div className="cake-prompt-area">
          {!blown ? (
            <motion.div
              className="cake-action-callout"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button type="button" className="cake-blow-btn" onClick={handleBlow}>
                <Flame size={18} className="flame-icon-pulse" />
                <span>Make a wish & tap to blow the candles!</span>
              </button>
              <small className="cake-hint">Take a deep breath first 🌬️</small>
            </motion.div>
          ) : (
            <motion.div
              className="cake-wish-granted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="wish-granted-banner">
                🎉 Your birthday wish is made! May it all come true, {recipientName || 'friend'}! ✨
              </div>
              <button
                type="button"
                className="cake-relight-btn"
                onClick={handleRelight}
              >
                <RotateCcw size={14} /> Relight candles
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
