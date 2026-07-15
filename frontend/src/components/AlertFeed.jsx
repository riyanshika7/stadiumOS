import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ALERT_FEED_MAX_VISIBLE } from '../constants';

function AlertFeed({ alerts }) {
  const [showAll, setShowAll] = useState(false);
  const maxVisible = ALERT_FEED_MAX_VISIBLE;
  const displayedAlerts = showAll ? alerts : alerts.slice(0, maxVisible);

  return (
    <section className="glass-card" style={{ 
      borderLeft: '5px solid var(--color-accent)',
      padding: '1rem'
    }}>
      {/* Responsive wrapped header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <h3 className="card-title" style={{ borderBottom: 'none', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          COMMAND CENTER LIVE BROADCASTS
        </h3>
        
        {alerts.length > maxVisible && (
          <button 
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="btn"
            style={{ 
              fontSize: '0.75rem', 
              background: showAll ? 'var(--color-primary)' : 'rgba(255, 199, 44, 0.1)', 
              border: showAll ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)', 
              color: showAll ? 'var(--text-main)' : 'var(--color-accent)', 
              padding: '0.25rem 0.6rem', 
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {showAll ? 'SHOW LESS' : `+${alerts.length - maxVisible} MORE ACTIVE`}
          </button>
        )}
      </div>

      <div className="alerts-banner-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {alerts.length === 0 ? (
          <div className="alert-item info" style={{ padding: '0.5rem 0.75rem' }}>
            <div className="alert-body">
              <h4 style={{ margin: 0, fontSize: '0.85rem' }}>All Systems Normal</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>No stadium-wide alerts currently broadcasted.</p>
            </div>
          </div>
        ) : (
          displayedAlerts.map((al) => (
            <div key={al.id} className={`alert-item ${al.type}`} style={{ padding: '0.6rem 0.75rem' }}>
              <div className="alert-body">
                <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 'bold' }}>{al.title}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: '1.3' }}>{al.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default AlertFeed;
