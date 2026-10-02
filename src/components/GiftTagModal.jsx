import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, X, Sparkles, Gift, Download } from 'lucide-react';
import { downloadGiftTagBadgePng } from '../lib/qrTagExporter';

export function GiftTagModal({ url, recipientName, fromName, title, onClose }) {
  const [qrCodeData, setQrCodeData] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 280,
      margin: 1,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    })
      .then((dataUri) => setQrCodeData(dataUri))
      .catch((err) => console.error('Error generating QR code', err));
  }, [url]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    setDownloading(true);
    try {
      await downloadGiftTagBadgePng({
        url,
        recipientName: recipientName || 'You',
        fromName: fromName || '',
        title: title || 'Celebration',
      });
    } catch (err) {
      console.error('Error downloading PNG', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="gift-tag-overlay" role="presentation" onClick={onClose}>
      <div
        className="gift-tag-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-tag-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gift-tag-dialog-head">
          <div>
            <span className="eyebrow"><Gift size={14} /> Printable Gift Tag</span>
            <h3 id="gift-tag-title">Attach to your physical gift</h3>
          </div>
          <button
            type="button"
            className="topbar-link"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="gift-tag-explainer">
          Print this mini gift tag or save it as an image to attach to a gift box, bouquet of flowers, or chocolate box.
        </p>

        {/* Printable Physical Tag Preview */}
        <div className="gift-tag-sheet-preview">
          <div className="printable-gift-tag" id="printable-gift-tag">
            {/* Punch Hole guide */}
            <div className="tag-punch-hole" title="Punch ribbon hole here" />

            <div className="tag-header">
              <span className="tag-sparkle"><Sparkles size={12} /></span>
              <span className="tag-kicker">A Special Surprise For</span>
              <h2 className="tag-recipient">{recipientName || 'You'}</h2>
            </div>

            <div className="tag-qr-wrap">
              {qrCodeData ? (
                <img
                  src={qrCodeData}
                  alt={`QR code to open ${recipientName}'s wish`}
                  className="tag-qr-image"
                />
              ) : (
                <div className="tag-qr-loading">Generating QR...</div>
              )}
            </div>

            <p className="tag-instruction">
              Scan with your phone camera to view your digital celebration card 🎁
            </p>

            {fromName && (
              <div className="tag-footer">
                <span>With love from</span>
                <strong>{fromName.replace(/^from\s+/i, '')}</strong>
              </div>
            )}

            <div className="tag-brand">Boltwish</div>
          </div>
        </div>

        <div className="gift-tag-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="action-btn action-primary"
            onClick={handleDownloadPng}
            disabled={downloading}
          >
            <Download size={16} /> {downloading ? 'Saving Image...' : 'Save Tag as Image (PNG)'}
          </button>
          <button
            type="button"
            className="action-btn action-secondary"
            onClick={handlePrint}
          >
            <Printer size={16} /> Print Tag
          </button>
          <button
            type="button"
            className="action-btn action-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
