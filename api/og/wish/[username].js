import { ImageResponse } from '@vercel/og';

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

    return new ImageResponse(
      (
        <div style={{
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(90deg,#fff5f7,#fff)',
        }}>
          <div style={{ padding: 48, borderRadius: 24, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ background: 'linear-gradient(90deg,#ff6b6b,#ff8fa3)', color: '#fff', padding: '8px 12px', borderRadius: 999, fontWeight: 700 }}>{chip}</div>
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color: '#0f172a', lineHeight: 1.05 }}>{title}</div>
            {subtitle ? <div style={{ marginTop: 16, fontSize: 22, color: '#6b7280' }}>{subtitle}</div> : null}
            <div style={{ marginTop: 28, fontSize: 16, color: '#9ca3af' }}>boltwish.vercel.app/wish/{username}</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    return new Response(`Failed to generate the image: ${e.message}`, { status: 500 });
  }
}
