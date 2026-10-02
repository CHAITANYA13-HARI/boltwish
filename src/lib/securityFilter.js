/**
 * securityFilter.js
 * Client-side security utilities:
 * 1. Safe profanity & abuse keyword protection (with regex escaping & error handling)
 * 2. Web Crypto SHA-256 passcode hashing with per-wish random salt (v2)
 * 3. Backward-compatible verification (v1 legacy + v2 salted)
 */

const BLOCKED_TERMS = [
  'fuck', 'bitch', 'cunt', 'nigger', 'faggot', 'whore', 'slut', 'bastard', 'asshole', 'dickhead',
  'shit', 'piss', 'cock', 'twat', 'wanker', 'prick',
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
 * Returns the Web Crypto object safely.
 */
function getCrypto() {
  const c = typeof globalThis !== 'undefined' ? (globalThis.crypto || globalThis.msCrypto) : null;
  if (!c?.subtle) throw new Error('Web Crypto API is not available.');
  return c;
}

/**
 * Computes SHA-256 hash of a string using Web Crypto API.
 */
async function sha256Hex(input) {
  const cryptoObj = getCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a 4-digit PIN with a per-wish random salt (v2 format).
 * Returns "v2:{saltHex}:{hashHex}" — each wish gets a unique salt so
 * rainbow-table attacks across all wishes are infeasible.
 */
export async function hashPasscode(pin) {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) return '';
  const cryptoObj = getCrypto();
  // 16 bytes = 128-bit random salt, unique per wish
  const saltBytes = new Uint8Array(16);
  cryptoObj.getRandomValues(saltBytes);
  const saltHex = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = await sha256Hex(`boltwish_v2_${saltHex}_${cleanPin}`);
  return `v2:${saltHex}:${hashHex}`;
}

/**
 * Verifies entered PIN against stored hash.
 * Supports both v2 (salted) and legacy v1 (static salt) formats for
 * full backward compatibility with wishes created before this update.
 */
export async function verifyPasscode(enteredPin, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.trim()) return false;
  const cleanPin = String(enteredPin || '').trim();
  if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) return false;

  const stored = storedHash.trim();

  // v2 format: "v2:{saltHex}:{hashHex}" — uses per-wish random salt
  if (stored.startsWith('v2:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const [, saltHex, expectedHash] = parts;
    const computed = await sha256Hex(`boltwish_v2_${saltHex}_${cleanPin}`);
    return Boolean(computed && computed.toLowerCase() === expectedHash.toLowerCase());
  }

  // Legacy v1 format: plain SHA-256 hex with static "boltwish_salt_" prefix
  const legacyHash = await sha256Hex(`boltwish_salt_${cleanPin}`);
  return Boolean(legacyHash && legacyHash.toLowerCase() === stored.toLowerCase());
}
