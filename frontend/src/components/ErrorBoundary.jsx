import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card" style={{
          border: '2px solid var(--color-danger)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.05)',
          color: 'var(--text-main)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          margin: '1rem 0'
        }}>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: '900',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldAlert size={20} />
            INTERACTIVE CONTAINER FAULT RECOVERY
          </span>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            A rendering exception has been isolated within this panel. The rest of the console operations remain fully operational.
          </p>
          {this.state.error && (
            <pre style={{
              margin: '0.5rem 0',
              padding: '0.5rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '4px',
              color: '#f87171',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              maxHeight: '120px'
            }}>
              {this.state.error.toString()}
              {this.state.error.stack && `\n\nStack:\n${this.state.error.stack.split('\n').slice(0, 3).join('\n')}`}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#ef4444', border: 'none', cursor: 'pointer' }}
          >
            Reset Container
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
