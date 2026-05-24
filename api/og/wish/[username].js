export const config = {
  runtime: 'edge',
};

export default function (req) {
  try {
    const url = new URL(req.url);
    const { pathname, searchParams } = url;
    const parts = pathname.split('/').filter(Boolean);
    const username = parts[parts.length - 1] || 'wish';

    const title = searchParams.get('title') || 'A special wish';
    const subtitle = searchParams.get('subtitle') || '';
    const chip = searchParams.get('chip') || '';

    const escapeXml = (value) => String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const safeTitle = escapeXml(title);
    const safeSubtitle = escapeXml(subtitle);
    const safeChip = escapeXml(chip || 'Wish');
    const safeUsername = escapeXml(username);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${safeTitle}</title>
  <desc id="desc">Preview image for Boltwish wish by ${safeUsername}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff5f7" />
      <stop offset="0.52" stop-color="#fffaf0" />
      <stop offset="1" stop-color="#ffffff" />
    </linearGradient>
    <linearGradient id="chip" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ff6b6b" />
      <stop offset="1" stop-color="#ff8fa3" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#f5a7b8" flood-opacity="0.18" />
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1040" cy="120" r="150" fill="#ffd6dd" fill-opacity="0.35" />
  <circle cx="140" cy="520" r="180" fill="#fce7b2" fill-opacity="0.25" />
  <rect x="86" y="78" width="1028" height="474" rx="36" fill="rgba(255,255,255,0.72)" filter="url(#shadow)" />
  <rect x="120" y="112" width="152" height="44" rx="22" fill="url(#chip)" />
  <text x="196" y="141" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="700" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial">${safeChip}</text>
  <text x="120" y="250" fill="#0f172a" font-size="64" font-weight="800" letter-spacing="-1.6" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial">${safeTitle}</text>
  ${safeSubtitle ? `<text x="120" y="322" fill="#6b7280" font-size="28" font-weight="500" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial">${safeSubtitle}</text>` : ''}
  <text x="120" y="420" fill="#9ca3af" font-size="20" font-weight="600" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial">boltwish.vercel.app/wish/${safeUsername}</text>
</svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (e) {
    return new Response(`Failed to generate the image: ${e.message}`, { status: 500 });
  }
}
