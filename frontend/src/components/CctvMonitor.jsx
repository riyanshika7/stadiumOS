import React, { useState } from 'react';
import { Camera, ShieldAlert } from 'lucide-react';
import { API_BASE_URL, CCTV_MOCK_FRAME_B64 } from '../constants';
import CctvScreen from './CctvScreen';

function CctvMonitor() {
  const [activeScenario, setActiveScenario] = useState('normal');
  const [cctvResult, setCctvResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  const runCctvAnalysis = async (scenario) => {
    setIsAnalyzing(true);
    setActiveScenario(scenario);
    setCctvResult(null);
    setAnalysisError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/operations/cctv-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_b64: CCTV_MOCK_FRAME_B64, scenario }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCctvResult(data);
    } catch (err) {
      console.error('CCTV analysis error:', err);
      setAnalysisError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isCritical = cctvResult && cctvResult.risk_index >= 8;

  return (
    <div className="glass-card" style={{
      border: isCritical ? '2px solid var(--color-danger)' : '1px solid var(--border-color)',
      boxShadow: isCritical ? '0 0 25px rgba(239, 68, 68, 0.2)' : 'var(--shadow-lg)'
    }}>

      {/* ── Header ── */}
      <h3 className="card-title" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Camera size={20} />
          <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)', letterSpacing: '0.04em' }}>
            📹 COMMAND CENTER CCTV PREDICTIVE VISUAL TRIAGE
          </span>
        </span>
        {isCritical && (
          <span className="badge urgency-high" style={{ animation: 'pulse 1s infinite', whiteSpace: 'nowrap' }}>
            CRITICAL DISPATCH
          </span>
        )}
      </h3>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
        Leverage Gemini's video understanding to audit security feeds in real-time, automatically
        identifying bottlenecks and dispatching teams before crowding escalates.
      </p>

      {/* ── Main 2-col grid ── */}
      <div className="cctv-grid">

        {/* CCTV Feed Screen */}
        <CctvScreen activeScenario={activeScenario} isAnalyzing={isAnalyzing} />

        {/* ── Controls Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'space-between' }}>
          <div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)',
              textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', letterSpacing: '0.06em'
            }}>
              CCTV SCENARIO INGESTION MOCK
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'normal', label: '🟢 Scenario A: Normal Fan Ingress',           accent: 'var(--color-success)' },
                { id: 'surge',  label: '🔴 Scenario B: Gate C Crowd Surge Crush Risk', accent: 'var(--color-danger)'  },
                { id: 'medical', label: '🟡 Scenario C: Restroom Block A Fall Incident', accent: '#ffb703'           }
              ].map((scen) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => runCctvAnalysis(scen.id)}
                  disabled={isAnalyzing}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: activeScenario === scen.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    border: activeScenario === scen.id ? `2px solid ${scen.accent}` : '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: activeScenario === scen.id ? 'bold' : 'normal',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {scen.label}
                </button>
              ))}
            </div>
          </div>

          {/* CCTV Triage AI Feedback */}
          {cctvResult && (
            <div className="fade-in" style={{
              padding: '0.75rem',
              background: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 135, 90, 0.03)',
              border: `2px solid ${isCritical ? 'var(--color-danger)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              marginTop: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '900',
                color: isCritical ? 'var(--color-danger)' : 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <ShieldAlert size={14} />
                LIVE VISUAL TRIAGE: RISK INDEX {cctvResult.risk_index}/10
              </span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                <strong>Anomaly:</strong> {cctvResult.anomaly_detected}
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-accent)', fontWeight: 'bold', lineHeight: '1.3' }}>
                <strong>Dispatch:</strong> {cctvResult.automated_dispatch_action}
              </p>
            </div>
          )}

          {analysisError && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span>⚠️ Error connecting to predictive triage service.</span>
              <button 
                type="button"
                onClick={() => runCctvAnalysis(activeScenario)} 
                className="btn" 
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', alignSelf: 'flex-start', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171' }}
              >
                ↻ Retry Feed Ingestion
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CctvMonitor;
