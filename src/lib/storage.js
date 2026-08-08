export function readJson(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeKeys(keys) {
  keys.forEach((key) => localStorage.removeItem(key));
}

export function slugify(value) {
  return String(value || 'user')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'user';
}

export function createSecureId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  }

  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('Secure ID generation is unavailable in this browser.');
}
