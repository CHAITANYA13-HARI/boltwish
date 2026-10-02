/**
 * qrTagExporter.js
 * Draws a high-resolution 1000x1200 printable gift tag badge with QR code onto a Canvas
 * and downloads it as a crisp PNG image.
 */

import QRCode from 'qrcode';

export async function downloadGiftTagBadgePng({
  url,
  recipientName = 'You',
  fromName = '',
  title = 'Celebration Card',
}) {
  if (!url) return;

  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background gradient: festive warm cream/peach
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.5, '#fff7f2');
  bgGrad.addColorStop(1, '#ffeff3');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer border & shadow effect
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Inner dashed festive stitching line
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 6;
  ctx.setLineDash([16, 12]);
  ctx.strokeRect(55, 55, width - 110, height - 110);
  ctx.setLineDash([]); // reset dash

  // Top punch-hole guide
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(width / 2, 95, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Top header text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('✨ A SPECIAL SURPRISE FOR ✨', width / 2, 175);

  // Recipient Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 64px "Playfair Display", Georgia, serif';
  const cleanName = recipientName.length > 22 ? recipientName.slice(0, 20) + '…' : recipientName;
  ctx.fillText(cleanName, width / 2, 260);

  // Occasion title
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const cleanTitle = title.length > 36 ? title.slice(0, 34) + '…' : title;
  ctx.fillText(`“${cleanTitle}”`, width / 2, 320);

  // Generate QR code data URL
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 580,
    margin: 2,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
  });

  // Load and draw QR image in center
  const qrImg = new Image();
  await new Promise((resolve, reject) => {
    qrImg.onload = resolve;
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  // Draw white rounded card behind QR
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  const qrBoxSize = 620;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 380;
  ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
  ctx.shadowColor = 'transparent'; // reset shadow

  ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, 580, 580);

  // Scan instruction
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('📱 Scan with your phone camera', width / 2, 1070);

  ctx.fillStyle = '#64748b';
  ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('to unwrap your interactive 3D wish card', width / 2, 1120);

  // From line
  if (fromName) {
    const sender = fromName.replace(/^from\s+/i, '').trim();
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`With love from ${sender} ❤️`, width / 2, 1200);
  }

  // Footer branding
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('BOLTWISH • boltwish.vercel.app', width / 2, 1270);

  // Trigger download
  const imageUri = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = imageUri;
  a.download = `gift-tag-${recipientName.toLowerCase().replace(/\s+/g, '-')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
