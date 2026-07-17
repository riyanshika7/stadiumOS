import React from 'react';
import { Accessibility, Volume2 } from 'lucide-react';
import { useInclusiveMode } from '../hooks/useInclusiveMode';

// ──────────────────────────────────────────────────────────────────────────────
// Inclusive Mode Control Panel — embedded in App header / toolbar
// Renders accessible toggle buttons for Wheelchair Mode (Step-Free) and Deaf Fan Mode (Captions)
// ──────────────────────────────────────────────────────────────────────────────

export default function InclusiveModePanel() {
  const { wheelchairMode, toggleWheelchairMode, deafMode, toggleDeafMode } = useInclusiveMode();

  return (
    <div
      role="group"
      aria-label="Inclusive Accessibility Modes"
      style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
    >
      {/* Wheelchair Mode Button */}
      <button
        id="wheelchair-mode-toggle"
        onClick={toggleWheelchairMode}
        aria-pressed={wheelchairMode}
        aria-label="Toggle Wheelchair Mode – Show step-free routes only"
        title="Wheelchair Mode"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.4rem 0.8rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: wheelchairMode ? 'rgba(70, 243, 255, 0.12)' : 'rgba(255,255,255,0.03)',
          color: wheelchairMode ? '#46F3FF' : 'var(--text-muted)',
          border: wheelchairMode ? '2px solid #46F3FF' : '1px solid var(--border-color)',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleWheelchairMode();
          }
        }}
      >
        <Accessibility size={14} aria-hidden="true" />
        <span>♿ Step-Free</span>
      </button>

      {/* Deaf Fan Mode Button */}
      <button
        id="deaf-mode-toggle"
        onClick={toggleDeafMode}
        aria-pressed={deafMode}
        aria-label="Toggle Deaf Fan Mode – Enable real-time audio captioning"
        title="Deaf Fan Mode"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.4rem 0.8rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: deafMode ? 'rgba(255, 234, 0, 0.12)' : 'rgba(255,255,255,0.03)',
          color: deafMode ? '#FFEA00' : 'var(--text-muted)',
          border: deafMode ? '2px solid #FFEA00' : '1px solid var(--border-color)',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleDeafMode();
          }
        }}
      >
        <Volume2 size={14} aria-hidden="true" />
        <span>🧏 Deaf Mode</span>
      </button>
    </div>
  );
}

