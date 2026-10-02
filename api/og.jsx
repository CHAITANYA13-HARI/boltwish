import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = (searchParams.get('title') || 'A Special 3D Celebration Card').slice(0, 80);
    const subtitle = (searchParams.get('subtitle') || 'Unwrap an interactive surprise with confetti & secret wish').slice(0, 120);
    const chip = (searchParams.get('chip') || 'Celebration').slice(0, 30);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0f0f13',
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, #3d1a2a 0%, #0f0f13 75%)',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#fff',
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              <span>⚡</span>
              <span>Boltwish</span>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid rgba(255, 107, 107, 0.4)',
                borderRadius: 999,
                padding: '6px 20px',
                color: '#ff8fa3',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              ✨ {chip}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.15,
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: 1.4,
                maxWidth: 900,
              }}
            >
              {subtitle}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px',
            }}
          >
            <span style={{ color: '#ff6b6b', fontSize: 20, fontWeight: 700 }}>
              🎁 Tap to unwrap 3D gift box with music
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>
              boltwish.vercel.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response('Failed to generate image', { status: 500 });
  }
}
