/**
 * PasscodeGate.jsx
 * Luxury 4-digit secret passcode gate for private wishes.
 * Unlocks the 3D card only when the recipient enters the correct PIN.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, KeyRound, Sparkles } from 'lucide-react';
import { verifyPasscode } from '../lib/securityFilter';
import { celebrationAudio } from '../lib/celebrationAudio';

export function PasscodeGate({ passcodeHash, recipientName, onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (pin.length < 4 || checking) return;

    setChecking(true);
    setError(false);

    const isValid = await verifyPasscode(pin, passcodeHash);
    setChecking(false);

    if (isValid) {
      celebrationAudio.playEnvelopeOpen();
      onUnlock();
    } else {
      setError(true);
      celebrationAudio.playPop();
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="center-screen passcode-gate-screen">
      <motion.div
        className={`panel passcode-gate-panel ${error ? 'passcode-error-shake' : ''}`}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="passcode-lock-icon-wrap">
          <div className="passcode-lock-circle">
            {error ? <KeyRound size={32} className="lock-icon-error" /> : <Lock size={32} className="lock-icon-gold" />}
          </div>
          <Sparkles size={16} className="passcode-sparkle-1" />
          <Sparkles size={16} className="passcode-sparkle-2" />
        </div>

        <div className="eyebrow eyebrow-dark">Private & Protected Card</div>
        <h1>A Secret Surprise for {recipientName || 'You'}</h1>
        <p className="lead">
          The sender locked this card with a secret 4-digit passcode. Enter the PIN below to unfold your surprise:
        </p>

        <form onSubmit={handleSubmit} className="passcode-form">
          <div className="passcode-input-wrap">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className={`passcode-digits-input ${error ? 'error' : ''}`}
            />
          </div>

          {error ? (
            <p className="passcode-error-text">Incorrect PIN. Please ask the sender for the code.</p>
          ) : (
            <p className="passcode-hint-text">Tip: Usually a special birth year, day, or milestone PIN.</p>
          )}

          <button
            type="submit"
            className="action-btn action-primary"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={pin.length < 4 || checking}
          >
            {checking ? 'Checking PIN...' : 'Unlock Gift Card 🎁'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
