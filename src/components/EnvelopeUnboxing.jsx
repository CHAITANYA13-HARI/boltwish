import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, PartyPopper, RotateCcw } from 'lucide-react';
import { celebrationAudio } from '../lib/celebrationAudio';
import { fireGrandConfetti, fireCelebrationConfetti } from '../lib/celebrationConfetti';

export function EnvelopeUnboxing({ preview, template, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => celebrationAudio.isMuted());
  const icon = template?.icon || '✨';
  const displayName = preview?.displayName && preview.displayName !== 'there' ? preview.displayName : 'You';
  const theme = template?.theme || {};
  const accentColor = theme.accent || '#e85d04';

  const handleOpen = () => {
    celebrationAudio.playEnvelopeOpen();
    fireGrandConfetti();
    setIsOpen(true);
  };

  const handleReplay = () => {
    setIsOpen(false);
  };

  const toggleSound = () => {
    const next = celebrationAudio.toggleMute();
    setIsMuted(next);
  };

  const popConfetti = () => {
    celebrationAudio.playPop();
    fireCelebrationConfetti();
  };

  return (
    <div className="celebration-wrapper">
      {/* Floating Celebration Controls */}
      <div className="celebration-floating-bar" aria-label="Celebration controls">
        <button
          type="button"
          className="celebration-pill-btn"
          onClick={popConfetti}
          title="Pop celebratory confetti"
        >
          <PartyPopper size={16} /> <span>Pop Confetti</span>
        </button>
        <button
          type="button"
          className="celebration-pill-btn"
          onClick={toggleSound}
          title={isMuted ? 'Turn celebration sound ON' : 'Mute sound'}
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isMuted ? 'Sound off' : 'Sound on'}</span>
        </button>
        {isOpen && (
          <button
            type="button"
            className="celebration-pill-btn secondary"
            onClick={handleReplay}
            title="Fold card and open envelope again"
          >
            <RotateCcw size={15} /> <span>Replay opening</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            className="envelope-stage"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -30 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="envelope-outer" onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleOpen()} aria-label="Tap to open your personalized wish card envelope">
              <div className="envelope-glow" style={{ background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)` }} />
              
              <div className="envelope-box">
                {/* Back flap */}
                <div className="envelope-back" />

                {/* Preview peek of the card inside */}
                <div className="envelope-card-peek">
                  <div className="envelope-peek-lines">
                    <span className="envelope-peek-chip">{preview.chip || 'Special Wish'}</span>
                    <strong>{preview.title || 'A Special Wish'}</strong>
                  </div>
                </div>

                {/* Triangular top flap */}
                <div className="envelope-flap" />

                {/* Left and right folded sides */}
                <div className="envelope-pocket" />

                {/* Recipient Dedication Banner */}
                <div className="envelope-to-label">
                  <span className="envelope-to-kicker">A personal celebration for</span>
                  <h3 className="envelope-to-name">{displayName}</h3>
                </div>

                {/* The Golden Wax Seal */}
                <motion.div
                  className="envelope-wax-seal"
                  style={{ '--seal-color': accentColor }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="seal-ring">
                    <span className="seal-icon">{icon}</span>
                  </div>
                  <div className="seal-pulse" />
                  <span className="seal-prompt">
                    <Sparkles size={13} /> Tap to Open
                  </span>
                </motion.div>
              </div>

              <div className="envelope-hint">
                <span>✨ You received a personal celebration card. Tap anywhere to unseal.</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="opened-card"
            className="opened-card-stage"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
