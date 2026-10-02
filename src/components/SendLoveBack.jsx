import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Check, Copy, Share2, MessageSquare } from 'lucide-react';
import { celebrationAudio } from '../lib/celebrationAudio';
import { fireFloatingHearts, fireReactionCannon } from '../lib/celebrationConfetti';

export function SendLoveBack({ fromName, title }) {
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [copied, setCopied] = useState(false);

  const sender = fromName ? fromName.replace(/^from\s*:?\s*/i, '').trim() : 'them';
  const cleanTitle = title ? title.replace(/[✨🎉🎂❤️👶💍🤝🙏]/g, '').trim() : 'celebration wish';

  const reactions = [
    { emoji: '🥹', label: 'Tears of joy', note: 'I got happy tears reading this!' },
    { emoji: '❤️', label: 'Loved every word', note: 'Loved every single word of this!' },
    { emoji: '🎉', label: 'Best surprise', note: 'This was the best surprise ever!' },
    { emoji: '🥂', label: 'Cheers!', note: 'Cheers! So grateful for you!' },
  ];

  const handleSelect = (reaction) => {
    setSelectedReaction(reaction);
    celebrationAudio.playLoveReaction();
    if (reaction.emoji === '❤️') {
      fireFloatingHearts();
    } else {
      fireReactionCannon(reaction.emoji);
    }
  };

  const thankYouText = selectedReaction
    ? `Hey ${sender}! I just opened the Boltwish card you made for me ("${cleanTitle}"). ${selectedReaction.note} Thank you so much! ${selectedReaction.emoji}❤️`
    : `Hey ${sender}! I just opened the Boltwish card you made for me ("${cleanTitle}"). It truly made my day! Thank you so much! ❤️`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(thankYouText)}`;
  const smsUrl = `sms:?&body=${encodeURIComponent(thankYouText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(thankYouText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Thank you, ${sender}!`,
          text: thankYouText,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <section className="send-love-back-card">
      <div className="send-love-header">
        <Heart size={18} className="love-icon-pulse" />
        <div>
          <h3>Did this make your day?</h3>
          <p>Send a quick note of gratitude back to {sender}:</p>
        </div>
      </div>

      <div className="reactions-row" role="group" aria-label="Reaction options">
        {reactions.map((r) => {
          const isSelected = selectedReaction?.emoji === r.emoji;
          return (
            <motion.button
              key={r.label}
              type="button"
              className={`reaction-pill ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelect(r)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="reaction-emoji">{r.emoji}</span>
              <span className="reaction-label">{r.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedReaction && (
          <motion.div
            className="send-love-drawer"
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="send-love-preview-box">
              <span className="preview-label">Your message to {sender}:</span>
              <p className="preview-message">“{thankYouText}”</p>
            </div>

            <div className="send-love-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {typeof navigator !== 'undefined' && navigator.share ? (
                <button
                  type="button"
                  className="action-btn action-primary"
                  onClick={handleNativeShare}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Share2 size={15} /> Send Reply (Any App)
                </button>
              ) : null}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-whatsapp"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={15} /> WhatsApp
              </a>
              <a
                href={smsUrl}
                className="action-btn action-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <MessageSquare size={15} /> Text / SMS
              </a>
              <button
                type="button"
                className="action-btn action-secondary"
                onClick={handleCopy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
