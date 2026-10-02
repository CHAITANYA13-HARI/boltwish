/**
 * securityFilter.js
 * Client-side security utilities:
 * 1. Safe profanity & abuse keyword protection (with regex escaping & error handling)
 * 2. Web Crypto SHA-256 passcode hashing & verification
 * 3. Input sanitation & length bounding
 */

const BLOCKED_TERMS = [
  'fuck', 'bitch', 'cunt', 'nigger', 'faggot', 'whore', 'slut', 'bastard', 'asshole', 'dickhead'
];

/**
 * Escapes regex special characters safely
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates text against severe abuse/profanity keywords.
 * Returns { valid: true } or { valid: false, reason: string }
 */
export function checkContentSafety(text) {
  if (!text || typeof text !== 'string') return { valid: true };
  const lower = text.toLowerCase();
  for (const term of BLOCKED_TERMS) {
    try {
      const escaped = escapeRegExp(term);
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lower)) {
        return {
          valid: false,
          reason: 'Please keep celebration wishes kind and positive. Inappropriate language detected.',
        };
      }
    } catch {
      if (lower.includes(term.toLowerCase())) {
        return {
          valid: false,
          reason: 'Please keep celebration wishes kind and positive. Inappropriate language detected.',
        };
      }
    }
  }
  return { valid: true };
}

/**
/**
 * Computes SHA-256 hash using Web Crypto API (supported in modern browsers and Node 18+)
 */
export async function hashPasscode(pin) {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) return '';
  const cryptoObj = typeof globalThis !== 'undefined' ? (globalThis.crypto || globalThis.msCrypto) : null;
  if (!cryptoObj?.subtle) {
    throw new Error('Web Crypto API is not available.');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(`boltwish_salt_${cleanPin}`);
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies entered PIN against stored SHA-256 hash.
 * Returns false if hash is missing, invalid, or PIN does not match.
 */
export async function verifyPasscode(enteredPin, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.trim()) {
    return false;
  }
  const cleanPin = String(enteredPin || '').trim();
  if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
    return false;
  }
  const computed = await hashPasscode(cleanPin);
  return Boolean(computed && computed.toLowerCase() === storedHash.trim().toLowerCase());
}
