import React from 'react';
import { Camera } from 'lucide-react';

export default function CctvScreen({ activeScenario, isAnalyzing }) {
  return (
    <div style={{
      background: '#05070f',
      border: '3px solid #1e293b',
      minHeight: '220px',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: 'var(--radius-sm)'
    }}>
      {/* Radar grid overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,0,0.05) 1px,transparent 1px)',
        backgroundSize: '20px 20px', pointerEvents: 'none'
      }} />

      {/* Scanning sweep bar */}
      <div style={{
        position: 'absolute', width: '100%', height: '2px',
        background: 'rgba(0,255,0,0.5)', boxShadow: '0 0 10px rgba(0,255,0,0.8)',
        animation: 'scanLine 3s linear infinite', top: 0
      }} />

      {/* HUD overlays */}
      <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.65rem', color: '#00ff00', fontFamily: 'monospace', fontWeight: 'bold' }}>
        CAM-04 METLIFE WEST GATES
      </span>
      <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', color: '#00ff00', fontFamily: 'monospace', fontWeight: 'bold' }}>
        LIVE FEED: 1080P
      </span>

      <div style={{ textAlign: 'center', zIndex: 1, padding: '1rem' }}>
        <Camera
          size={40}
          style={{
            color: activeScenario === 'normal' ? 'rgba(0,255,0,0.3)' : 'rgba(239,68,68,0.3)',
            marginBottom: '0.5rem',
            animation: activeScenario !== 'normal' ? 'pulse 1.5s infinite' : 'none'
          }}
        />
        {isAnalyzing && (
          <p style={{ color: '#00ff00', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 'bold' }}>
            ⟳ ANALYZING FEED...
          </p>
        )}
        {!isAnalyzing && activeScenario === 'normal' && (
          <p style={{ color: '#00ff00', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 'bold' }}>
            STATUS: fan ingress fluid
          </p>
        )}
        {!isAnalyzing && activeScenario === 'surge' && (
          <p style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
            🚨 WARNING: CROWD SURGE RISK DETECTED AT GATE C
          </p>
        )}
        {!isAnalyzing && activeScenario === 'medical' && (
          <p style={{ color: '#ffb703', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 'bold' }}>
            ⚠️ STATUS: ANOMALY EVENT AT SECTION 104
          </p>
        )}
      </div>
    </div>
  );
}
