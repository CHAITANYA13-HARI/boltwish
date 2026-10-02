import crypto from 'crypto';

// Serverless rate-limiting cache (rolling 15-minute window)
const rateLimitMap = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getRateLimitRecord(key) {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    const fresh = { count: 0, resetAt: now + WINDOW_MS };
    rateLimitMap.set(key, fresh);
    return fresh;
  }
  return record;
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Security response headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { wishId, pin, clientHash } = body;

    if (!wishId || typeof wishId !== 'string' || !wishId.trim()) {
      return res.status(400).json({ error: 'Missing wish identifier.' });
    }

    const cleanPin = String(pin || '').trim();
    if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits.' });
    }

    // Identify client by forward IP and wish ID
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : (req.socket?.remoteAddress || '127.0.0.1');

    const rateKey = `${clientIp}:${wishId.trim()}`;
    const limitRecord = getRateLimitRecord(rateKey);

    if (limitRecord.count >= MAX_ATTEMPTS) {
      const retryAfter = Math.max(1, Math.ceil((limitRecord.resetAt - Date.now()) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Too many incorrect PIN attempts. Please wait 15 minutes before trying again.',
        retryAfter,
      });
    }

    // Compute cryptographic SHA-256 hash
    const computedHash = crypto
      .createHash('sha256')
      .update(`boltwish_salt_${cleanPin}`)
      .digest('hex');

    let isValid = false;
    if (clientHash && typeof clientHash === 'string') {
      isValid = computedHash.toLowerCase() === clientHash.trim().toLowerCase();
    }

    if (isValid) {
      // Clear rate limit record on successful unlock
      rateLimitMap.delete(rateKey);
      return res.status(200).json({ valid: true });
    }

    // Increment failed attempts
    limitRecord.count += 1;
    const remaining = Math.max(0, MAX_ATTEMPTS - limitRecord.count);

    return res.status(200).json({
      valid: false,
      remainingAttempts: remaining,
      message: remaining > 0
        ? `Incorrect PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many attempts. Locked for 15 minutes.',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server validation error' });
  }
}
