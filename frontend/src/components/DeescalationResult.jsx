import React from 'react';
import { Shield } from 'lucide-react';

export default function DeescalationResult({ deescalateResult }) {
  if (!deescalateResult) return null;

  return (
    <div style={{ 
      marginTop: '0.5rem', 
      padding: '0.75rem', 
      background: 'rgba(255, 199, 44, 0.05)', 
      border: '2px solid var(--color-warning)', 
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <ShieldAlert size={14} />
        DE-ESCALATION AGENT RESPONSE
      </span>
      
      <div style={{ fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', fontWeight: 'bold' }}>SPOKEN SCRIPT FOR FAN:</span>
        <p style={{ color: 'var(--text-main)', fontWeight: 'bold', fontStyle: 'italic', paddingLeft: '0.5rem', borderLeft: '2px solid var(--color-warning)' }}>
          "{deescalateResult.deescalation_script}"
        </p>
      </div>

      <div style={{ fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', fontWeight: 'bold' }}>PHYSICAL/BODY LANGUAGE TIPS:</span>
        <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>{deescalateResult.body_language_tips}</p>
      </div>

      <div style={{ fontSize: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.4rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', fontWeight: 'bold' }}>TACTICAL DISPATCH STEP:</span>
        <p style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{deescalateResult.tactical_step}</p>
      </div>
    </div>
  );
}
