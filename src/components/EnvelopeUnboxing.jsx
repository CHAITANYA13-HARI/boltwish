import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, PartyPopper, RotateCcw, Gift, Heart } from 'lucide-react';
import { celebrationAudio } from '../lib/celebrationAudio';
import { fireGrandConfetti, fireCelebrationConfetti } from '../lib/celebrationConfetti';

export function EnvelopeUnboxing({ preview, template, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => celebrationAudio.isMuted());
  const icon = template?.icon || '✨';
  const displayName = preview?.displayName && preview.displayName !== 'there' ? preview.displayName : 'You';
  const theme = template?.theme || {};
  const accentColor = theme.accent || '#e85d04';
  const templateId = template?.id || 'celebration';

  // Theme-specific cover graphics & badges
  const themeConfig = {
    birthday: {
      badge: '🎂 Birthday Celebration',
      tagline: 'A special surprise for someone wonderful',
      coverPattern: 'balloons',
      ribbonColor: '#e85d04',
      ribbonAccent: '#ffd166',
    },
    anniversary: {
      badge: '🥂 Anniversary Wishes',
      tagline: 'Celebrating a beautiful story of love & partnership',
      coverPattern: 'sparkles',
      ribbonColor: '#d94674',
      ribbonAccent: '#fbcfe8',
    },
    love: {
      badge: '❤️ A Love Note',
      tagline: 'Straight from the heart, just for you',
      coverPattern: 'hearts',
      ribbonColor: '#e11d48',
      ribbonAccent: '#fda4af',
    },
    congrats: {
      badge: '🎉 Congratulations',
      tagline: 'Celebrating an incredible milestone & victory',
      coverPattern: 'stars',
      ribbonColor: '#7c3aed',
      ribbonAccent: '#c4b5fd',
    },
    newbaby: {
      badge: '👶 Welcome Little One',
      tagline: 'Warmest blessings for baby & the proud family',
      coverPattern: 'clouds',
      ribbonColor: '#0ea5e9',
      ribbonAccent: '#bae6fd',
    },
    wedding: {
      badge: '💒 Wedding Blessings',
      tagline: 'To the newlyweds with heartfelt love',
      coverPattern: 'rings',
      ribbonColor: '#db2777',
      ribbonAccent: '#fbcfe8',
    },
    friendship: {
      badge: '🤝 Friendship Card',
      tagline: 'For an awesome friend who makes life better',
      coverPattern: 'stars',
      ribbonColor: '#059669',
      ribbonAccent: '#a7f3d0',
    },
    thankyou: {
      badge: '🙏 With Deep Gratitude',
      tagline: 'Thank you for your kindness & support',
      coverPattern: 'leaves',
      ribbonColor: '#0f766e',
      ribbonAccent: '#99f6e4',
    },
  };

  const currentTheme = themeConfig[templateId] || themeConfig.birthday;

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
    <div className={`celebration-wrapper theme-wrap-${templateId}`}>
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
            title="Fold card and re-open surprise"
          >
            <RotateCcw size={15} /> <span>Replay opening</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="gift-card-closed"
            className="giftcard-3d-stage"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.06, y: -25, transition: { duration: 0.35 } }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={`giftcard-container giftcard-theme-${templateId}`}
              onClick={handleOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpen()}
              aria-label={`Tap to open your ${template?.label || 'celebration'} gift card`}
            >
              {/* Outer atmospheric aura */}
              <div
                className="giftcard-ambient-glow"
                style={{ background: `radial-gradient(circle, ${accentColor}40 0%, transparent 72%)` }}
              />

              {/* The Foldable 3D Card Body */}
              <div className="giftcard-cover-card">
                {/* Decorative Pattern Background */}
                <div className={`giftcard-cover-pattern pattern-${currentTheme.coverPattern}`} />

                {/* Satin Gift Ribbon: Horizontal & Vertical Straps */}
                <div className="gift-ribbon-horizontal" style={{ '--ribbon-color': currentTheme.ribbonColor }} />
                <div className="gift-ribbon-vertical" style={{ '--ribbon-color': currentTheme.ribbonColor }} />

                {/* Center 3D Gift Bow Knot */}
                <div className="gift-ribbon-bow" style={{ '--ribbon-color': currentTheme.ribbonColor }}>
                  <div className="bow-loop bow-left" />
                  <div className="bow-loop bow-right" />
                  <div className="bow-knot" />
                </div>

                {/* Gold foil corner brackets */}
                <div className="card-corner corner-tl" />
                <div className="card-corner corner-tr" />
                <div className="card-corner corner-bl" />
                <div className="card-corner corner-br" />

                {/* Cover Typographic Plaque */}
                <div className="giftcard-plaque">
                  <span className="giftcard-chip">
                    <Sparkles size={13} /> {currentTheme.badge}
                  </span>
                  <span className="giftcard-kicker">A special delivery for</span>
                  <h2 className="giftcard-recipient-title">{displayName}</h2>
                  <p className="giftcard-subtitle">{currentTheme.tagline}</p>

                  {/* Wax Seal / Stamp Button */}
                  <motion.div
                    className="giftcard-open-stamp"
                    style={{ '--stamp-color': accentColor }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <div className="stamp-inner">
                      <span className="stamp-icon">{icon}</span>
                    </div>
                    <span className="stamp-label">
                      <Gift size={14} /> Tap to Open Card
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Gentle prompt below card */}
              <div className="giftcard-tap-indicator">
                <span className="pulse-dot" />
                <span>Tap the card to unwrap your celebration</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="opened-card-view"
            className="opened-card-stage"
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
