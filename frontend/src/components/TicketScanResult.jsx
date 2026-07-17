import React from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';

export default function TicketScanResult({ scanResult, uploadedFilename }) {
  if (!scanResult) return null;

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.02)', 
      border: `2px solid ${scanResult.is_valid ? 'var(--border-color)' : 'var(--color-danger)'}`, 
      padding: '1rem',
      borderRadius: 'var(--radius-sm)'
    }}>

      {/* NOT A VALID TICKET — full-width rejection banner */}
      {!scanResult.is_valid && scanResult.category === 'INVALID DOCUMENT' && (
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '2px solid var(--color-danger)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🚫</div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            color: 'var(--color-danger)',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
            textTransform: 'uppercase'
          }}>
            NOT A VALID TICKET
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            The uploaded image <strong style={{ color: 'var(--text-main)' }}>
              {uploadedFilename || 'unknown file'}
            </strong> is not recognised as a FIFA World Cup 2026 ticket or credential.
            No seat data could be extracted.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: scanResult.is_valid ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {scanResult.is_valid ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          {scanResult.is_valid ? 'VALID TICKET DETECTED' : 
            scanResult.category === 'INVALID DOCUMENT' ? 'DOCUMENT REJECTED — NOT A TICKET' : 'ALERT: SECURITY VERIFICATION FAILURE'}
        </span>
        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          {scanResult.category}
        </span>
      </div>

      {/* Only show seat grid if actual ticket data is present */}
      {scanResult.category !== 'INVALID DOCUMENT' && (
        <div className="ticket-grid">
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>GATE</span>
            <strong style={{ fontSize: '0.9rem' }}>{scanResult.gate || 'N/A'}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>SECTION</span>
            <strong style={{ fontSize: '0.9rem' }}>{scanResult.section || 'N/A'}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>ROW</span>
            <strong style={{ fontSize: '0.9rem' }}>{scanResult.row || 'N/A'}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>SEAT</span>
            <strong style={{ fontSize: '0.9rem' }}>{scanResult.seat || 'N/A'}</strong>
          </div>
        </div>
      )}

      {!scanResult.is_valid && scanResult.issue_detected && scanResult.issue_detected !== 'None' && (
        <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', fontSize: '0.8rem', color: 'var(--color-danger)', marginBottom: '1rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
          <strong>Issue:</strong> {scanResult.issue_detected}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>GATE REDIRECTION PLAYBOOK</span>
        <p style={{ fontSize: '0.85rem', lineHeight: '1.4', fontWeight: '600' }}>
          {scanResult.volunteer_action_guide}
        </p>
      </div>
    </div>
  );
}
