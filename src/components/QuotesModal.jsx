/**
 * QuotesModal.jsx
 * Interactive library of 50+ curated celebration quotes & poetry.
 * Senders can browse, filter by occasion, and insert any quote directly into their wish message.
 */

import { useState } from 'react';
import { celebrationQuotes, getQuotesByOccasion } from '../data/celebrationQuotes';
import { Sparkles, X, Check, BookOpen } from 'lucide-react';

export function QuotesModal({ initialOccasion = 'all', onSelectQuote, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(initialOccasion || 'all');
  const [copiedId, setCopiedId] = useState('');

  const categories = [
    { id: 'all', label: 'All Quotes' },
    { id: 'birthday', label: '🎂 Birthday' },
    { id: 'love', label: '❤️ Love' },
    { id: 'anniversary', label: '🥂 Anniversary' },
    { id: 'congrats', label: '🎉 Congrats' },
    { id: 'friendship', label: '🤝 Friendship' },
    { id: 'wedding', label: '💒 Wedding' },
    { id: 'newbaby', label: '👶 New Baby' },
    { id: 'thankyou', label: '🙏 Thank You' },
  ];

  const displayedQuotes = getQuotesByOccasion(selectedCategory);

  const handleUseQuote = (quote) => {
    setCopiedId(quote.id);
    onSelectQuote(`"${quote.text}" — ${quote.author}`);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className="quotes-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="quotes-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quotes-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quotes-modal-head">
          <div>
            <span className="eyebrow"><BookOpen size={14} /> Curated Inspiration Library</span>
            <h2 id="quotes-title">Timeless Celebration Quotes & Poetry</h2>
          </div>
          <button type="button" className="topbar-link" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <p className="quotes-modal-subtitle">
          Choose from over 50 poignant, poetic words by world-renowned authors. Tap any quote to insert it into your card!
        </p>

        {/* Category Pills */}
        <div className="quotes-categories-scroll">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`quotes-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quotes List */}
        <div className="quotes-grid">
          {displayedQuotes.map((q) => (
            <div key={q.id} className="quote-item-card">
              <p className="quote-text">“{q.text}”</p>
              <div className="quote-card-footer">
                <span className="quote-author">— {q.author}</span>
                <button
                  type="button"
                  className={`action-btn small ${copiedId === q.id ? 'action-primary' : 'action-secondary'}`}
                  onClick={() => handleUseQuote(q)}
                >
                  {copiedId === q.id ? <><Check size={14} /> Inserted!</> : <><Sparkles size={14} /> Use Quote</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
