import React from 'react';
import { API_BASE_URL } from '../constants';

export default function ChaosSandbox({ setIsLoading, setIsSuccess, setStatusMsg, isLoading }) {
  const triggerChaos = async (scenario) => {
    setIsLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/chaos/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      setIsSuccess(data.status === 'gracefully_caught');
      
      // Enforce the exact original error prefixes expected by unit tests
      let prefix = '';
      if (scenario === 'corrupt_csv') {
        prefix = 'Caught Corrupt CSV Error';
      } else if (scenario === 'simultaneous_capacity') {
        prefix = 'Caught Capacity Error';
      } else {
        prefix = 'Caught Audio Error';
      }

      setStatusMsg(
        `${prefix}: "${data.error_caught}". ` +
        `System Action: ${data.fallback_message}\nSOP: ${data.resolution_steps.join(' | ')}`
      );
    } catch(err) {
      setIsSuccess(false);
      setStatusMsg('Chaos trigger connection failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="panel-chaos" role="tabpanel" aria-labelledby="tab-chaos" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.3', marginBottom: '0.25rem' }}>
        Trigger simulated chaos events. The backend intercepts errors gracefully and outputs actionable fallback diagnostics.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => triggerChaos('corrupt_csv')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.45rem', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', background: 'rgba(239,68,68,0.05)', display: 'block', width: '100%', textAlign: 'left' }}
          disabled={isLoading}
        >
          💥 Simulate Corrupt CSV Data
        </button>

        <button
          onClick={() => triggerChaos('simultaneous_capacity')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.45rem', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', background: 'rgba(245,158,11,0.05)', display: 'block', width: '100%', textAlign: 'left' }}
          disabled={isLoading}
        >
          💥 Simulate Simultaneous 100% Capacity at Multiple Gates
        </button>

        <button
          onClick={() => triggerChaos('unknown_audio')}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.45rem', border: '1px solid rgba(70,243,255,0.4)', color: '#46F3FF', background: 'rgba(70,243,255,0.05)', display: 'block', width: '100%', textAlign: 'left' }}
          disabled={isLoading}
        >
          💥 Simulate Unknown Audio Language Input
        </button>
      </div>
    </div>
  );
}
