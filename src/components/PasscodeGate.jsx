/**
 * PasscodeGate.jsx
 * Luxury 4-digit secret passcode gate for private wishes.
 * Unlocks the 3D card only when the recipient enters the correct PIN.
 * Features server & client-side rate limiting (5 attempts / 15-min lockout).
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, KeyRound, Sparkles, ShieldAlert, Clock } from 'lucide-react';
import { verifyPasscode } from '../lib/securityFilter';
import { celebrationAudio } from '../lib/celebrationAudio';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function PasscodeGate({ passcodeHash, hashedPasscode, recipientName, wishId, onUnlock }) {
  const actualHash = passcodeHash || hashedPasscode || '';
  const storageKey = `bw_pin_${wishId || 'gate'}`;

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Initialize lockout state from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lockedUntil && parsed.lockedUntil > Date.now()) {
          setLockedUntil(parsed.lockedUntil);
          setAttempts(parsed.attempts || MAX_ATTEMPTS);
        } else if (parsed.attempts && parsed.resetAt && parsed.resetAt > Date.now()) {
          setAttempts(parsed.attempts);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, [storageKey]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil || lockedUntil <= Date.now()) {
      setSecondsRemaining(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff === 0) {
        setLockedUntil(0);
        setAttempts(0);
        localStorage.removeItem(storageKey);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil, storageKey]);

  const recordFailedAttempt = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (nextAttempts >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_MS;
      setLockedUntil(lockoutTime);
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          attempts: nextAttempts,
          lockedUntil: lockoutTime,
        }));
      } catch {}
      setErrorMessage('Too many incorrect attempts. This card is locked for 15 minutes.');
    } else {
      const remaining = MAX_ATTEMPTS - nextAttempts;
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          attempts: nextAttempts,
          resetAt: Date.now() + LOCKOUT_MS,
        }));
      } catch {}
      setErrorMessage(`Incorrect PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }
  };

  const isLocked = lockedUntil > Date.now();

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (pin.length !== 4 || checking || isLocked) return;

    setChecking(true);
    setError(false);
    setErrorMessage('');

    let isValid = false;

    // 1. Attempt server-side verification with rate-limiting
    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wishId: wishId || 'wish',
          pin,
          clientHash: actualHash,
        }),
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        const retrySec = data.retryAfter || 900;
        const lockoutTime = Date.now() + retrySec * 1000;
        setLockedUntil(lockoutTime);
        setErrorMessage(data.error || 'Too many attempts. Locked for 15 minutes.');
        setChecking(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        isValid = Boolean(data.valid);
        if (!isValid && data.message) {
          setErrorMessage(data.message);
        }
      } else {
        // Fallback to client-side verification
        isValid = await verifyPasscode(pin, actualHash);
      }
    } catch {
      // Offline fallback
      isValid = await verifyPasscode(pin, actualHash);
    }

    setChecking(false);

    if (isValid) {
      // Clear rate limiting on success
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      celebrationAudio.playEnvelopeOpen();
      onUnlock();
    } else {
      setError(true);
      celebrationAudio.playPop();
      recordFailedAttempt();
      setTimeout(() => setError(false), 2200);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
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
            {isLocked ? (
              <ShieldAlert size={32} className="lock-icon-error" />
            ) : error ? (
              <KeyRound size={32} className="lock-icon-error" />
            ) : (
              <Lock size={32} className="lock-icon-gold" />
            )}
          </div>
          <Sparkles size={16} className="passcode-sparkle-1" />
          <Sparkles size={16} className="passcode-sparkle-2" />
        </div>

        <div className="eyebrow eyebrow-dark">Private & Protected Card</div>
        <h1>A Secret Surprise for {recipientName || 'You'}</h1>
        <p className="lead">
          The sender locked this card with a secret 4-digit passcode. Enter the PIN below to unfold your surprise:
        </p>

        {isLocked ? (
          <div className="passcode-lockout-notice" style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 700 }}>
              <Clock size={18} />
              <span>Card Temporarily Locked</span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#7f1d1d' }}>
              Too many incorrect PIN attempts. For security, please wait <strong>{formatTime(secondsRemaining)}</strong> before trying again.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="passcode-form">
            <div className="passcode-input-wrap">
              <label htmlFor="passcode-pin-input" className="sr-only">Secret 4-digit PIN</label>
              <input
                id="passcode-pin-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                autoFocus
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className={`passcode-digits-input ${error ? 'error' : ''}`}
                aria-label="Secret 4-digit PIN"
              />
            </div>

            {error || errorMessage ? (
              <p className="passcode-error-text" role="alert">
                {errorMessage || 'Incorrect PIN. Please ask the sender for the code.'}
              </p>
            ) : (
              <p className="passcode-hint-text">Tip: Usually a special birth year, day, or milestone PIN.</p>
            )}

            <button
              type="submit"
              className="action-btn action-primary"
              style={{ width: '100%', marginTop: '16px' }}
              disabled={pin.length !== 4 || checking || isLocked}
            >
              {checking ? 'Checking PIN...' : 'Unlock Gift Card 🎁'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
