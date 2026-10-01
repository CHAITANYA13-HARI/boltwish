/**
 * securityFilter.js
 * Client-side security utilities:
 * 1. Fast profanity & abuse keyword protection
 * 2. Web Crypto SHA-256 passcode hashing & verification
 * 3. Input sanitation & length bounding
 */

const BLOCKED_TERMS = [
  'kill', 'die', 'murder', 'bomb', 'terrorist', 'suicide', 'f**k', 'bitch', 'cunt', 'nigger', 'faggot',
  'whore', 'slut', 'bastard', 'asshole', 'dickhead'
];

/**
 * Validates text against severe abuse/profanity keywords.
 * Returns { valid: true } or { valid: false, reason: string }
 */
export function checkContentSafety(text) {
  if (!text || typeof text !== 'string') return { valid: true };
  const lower = text.toLowerCase();
  for (const term of BLOCKED_TERMS) {
    // Check whole-word or delimited pattern
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(lower)) {
      return {
        valid: false,
        reason: `Please keep celebration wishes kind and positive. Removed inappropriate term.`,
      };
    }
  }
  return { valid: true };
}

/**
 * Computes SHA-256 hash using native browser crypto API
 */
export async function hashPasscode(pin) {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(`boltwish_salt_${cleanPin}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies entered PIN against stored SHA-256 hash
 */
export async function verifyPasscode(enteredPin, storedHash) {
  if (!storedHash) return true;
  const computed = await hashPasscode(enteredPin);
  return computed === storedHash;
}
