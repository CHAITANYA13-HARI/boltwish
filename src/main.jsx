import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

/**
 * ErrorBoundary — catches uncaught React render errors and shows a
 * friendly fallback screen instead of a blank white page.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for debugging; could be sent to an error-tracking service
    console.error('[Boltwish] Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 20px',
            textAlign: 'center',
            fontFamily: 'Manrope, sans-serif',
            background: 'linear-gradient(180deg, #fffafc 0%, #fff5f7 100%)',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>😔</div>
          <h1 style={{ fontSize: '1.6rem', margin: '0 0 8px', color: '#0f172a' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: 380, lineHeight: 1.6, margin: '0 0 24px' }}>
            An unexpected error occurred. Your data is safe — please refresh the page or go back home.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: 'none',
                background: '#ff6b6b',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              🔄 Reload page
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1.5px solid #e2e8f0',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              🏠 Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);