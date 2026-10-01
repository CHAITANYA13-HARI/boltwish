/**
 * storyCanvasExporter.js
 * Generates high-resolution 1080x1920 Instagram Story & WhatsApp Status graphics
 * completely in the browser using the HTML5 Canvas API and QRCode.
 * 100% free, zero server load, instantaneous download.
 */

import QRCode from 'qrcode';

export async function exportInstagramStory({
  recipientName = 'Special One',
  occasionTitle = 'Celebration Wish',
  message = '',
  fromName = '',
  theme = {},
  wishUrl = window.location.href,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const primaryColor = theme.accent || '#e85d04';
  const secondaryColor = theme.accentSoft || '#fb8500';

  // 1. Draw luxury dark background with radial glow
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 1080, 1920);

  // Gradient radial glow in center
  const glow = ctx.createRadialGradient(540, 750, 50, 540, 750, 700);
  glow.addColorStop(0, hexToRgba(primaryColor, 0.45));
  glow.addColorStop(0.5, hexToRgba(secondaryColor, 0.18));
  glow.addColorStop(1, 'rgba(9, 13, 22, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Draw Decorative Double Gold Border
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, 980, 1820);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(65, 65, 950, 1790);

  // Corner Ornaments
  drawCornerOrnament(ctx, 50, 50, 0);
  drawCornerOrnament(ctx, 1030, 50, Math.PI / 2);
  drawCornerOrnament(ctx, 1030, 1870, Math.PI);
  drawCornerOrnament(ctx, 50, 1870, -Math.PI / 2);
  ctx.restore();

  // 3. Brand Pill & Header
  ctx.save();
  ctx.fillStyle = hexToRgba(primaryColor, 0.25);
  roundRect(ctx, 390, 120, 300, 54, 27);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(primaryColor, 0.8);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ BOLTWISH EXCLUSIVE', 540, 156);
  ctx.restore();

  // 4. Occasion Badge / Subtitle
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'italic 34px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('A Heartfelt Celebration For', 540, 240);

  // 5. Recipient Name in Big Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 76px Georgia, serif';
  ctx.shadowColor = hexToRgba(primaryColor, 0.8);
  ctx.shadowBlur = 24;
  ctx.fillText(recipientName, 540, 340);
  ctx.shadowBlur = 0;

  // Title / Tagline
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(occasionTitle, 540, 420);
  ctx.restore();

  // Decorative Divider
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, 460);
  ctx.lineTo(740, 460);
  ctx.stroke();
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(540, 460, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Main Wish Message (Card Box with Text Wrapping)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  roundRect(ctx, 110, 520, 860, 680, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Quote marks
  ctx.fillStyle = hexToRgba(primaryColor, 0.4);
  ctx.font = 'bold 120px Georgia, serif';
  ctx.fillText('“', 160, 620);

  // Render wrapped message text
  ctx.fillStyle = '#f8fafc';
  ctx.font = '36px Georgia, serif';
  ctx.textAlign = 'center';
  const cleanMsg = message.replace(/\n+/g, ' ');
  wrapText(ctx, cleanMsg, 540, 660, 760, 54, 8);

  // Sender sign-off
  if (fromName) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic bold 32px Georgia, serif';
    ctx.fillText(`— With heartfelt love, ${fromName}`, 540, 1140);
  }
  ctx.restore();

  // 7. QR Code generation & placement at bottom
  try {
    const qrDataUrl = await QRCode.toDataURL(wishUrl, {
      width: 320,
      margin: 1,
      color: { dark: '#090d16', light: '#ffffff' },
    });

    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrDataUrl;
    });

    // QR container box
    ctx.save();
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 390, 1260, 300, 300, 20);
    ctx.fill();
    ctx.drawImage(qrImg, 405, 1275, 270, 270);

    // Call to action below QR
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to Open 3D Gift Card 🎁', 540, 1630);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '26px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Experience the interactive unboxing with music & confetti', 540, 1680);
    ctx.restore();
  } catch (err) {
    console.error('Failed to draw QR code on story canvas', err);
  }

  // 8. Footer brand mark
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('boltwish.vercel.app · Made with love', 540, 1790);
  ctx.restore();

  // 9. Download the generated PNG
  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.download = `${recipientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-story.png`;
  anchor.href = dataUrl;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

// Helpers
function hexToRgba(hex, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((char) => char + char).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 8) {
  const words = text.split(' ');
  let line = '';
  let linesDrawn = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
      linesDrawn++;
      if (linesDrawn >= maxLines - 1 && n < words.length - 1) {
        ctx.fillText((line + '...').trim(), x, y);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function drawCornerOrnament(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(35, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 35);
  ctx.stroke();
  ctx.restore();
}
