import React, { useState } from 'react';
import { Camera, ShieldAlert } from 'lucide-react';
import { API_BASE_URL, CCTV_MOCK_FRAME_B64 } from '../constants';

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

      {/* ── Main 2-col grid (stacks on mobile via .cctv-grid) ── */}
      <div className="cctv-grid">

        {/* CCTV Feed Screen */}
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
        {/* scanLine animation is defined globally in index.css */}

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
                { id: 'medical',label: '🟡 Scenario C: Section 104 Concourse Collapse',accent: 'var(--color-warning)' },
              ].map(({ id, label, accent }) => (
                <button
                  key={id}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => runCctvAnalysis(id)}
                  disabled={isAnalyzing}
                  style={{
                    justifyContent: 'flex-start',
                    padding: '0.55rem 0.9rem',
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.82rem)',
                    borderLeft: activeScenario === id ? `4px solid ${accent}` : '4px solid transparent',
                    fontWeight: activeScenario === id ? '700' : '500',
                    opacity: isAnalyzing ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'normal',
                    textAlign: 'left',
                    lineHeight: '1.3'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4', display: 'block' }}>
            Clicking a scenario uploads mock security frames and invokes Gemini's video understanding to triage threats.
          </span>
        </div>

      </div>{/* end cctv-grid */}

      {/* ── Analysis Results or Error ── */}
      {analysisError && (
        <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-danger)' }}>
          ⚠️ CCTV analysis failed. Check backend connection and try again.
        </div>
      )}
      {cctvResult && (
        <div style={{
          marginTop: '1.5rem',
          background: 'rgba(255,255,255,0.01)',
          border: `1px solid ${isCritical ? 'var(--color-danger)' : 'var(--border-color)'}`,
          padding: '1rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div className="cctv-results-flex">

            {/* Risk Index */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minWidth: '80px',
              borderRight: '1px solid var(--border-color)',
              paddingRight: '1.25rem'
            }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.2rem' }}>RISK INDEX</span>
              <strong style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '900',
                lineHeight: '1',
                color: cctvResult.risk_index >= 8
                  ? 'var(--color-danger)'
                  : cctvResult.risk_index >= 5
                    ? 'var(--color-warning)'
                    : 'var(--color-success)'
              }}>
                {cctvResult.risk_index}
              </strong>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/ 10</span>
            </div>

            {/* Details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--color-accent)' }}>Visual Anomaly: </strong>
                {cctvResult.anomaly_detected}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Predicted 5M Impact: </strong>
                {cctvResult.predicted_impact}
              </div>
              <div style={{
                marginTop: '0.15rem', padding: '0.5rem',
                background: isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)',
                borderLeft: `3px solid ${isCritical ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                fontSize: '0.8rem', fontWeight: 'bold', lineHeight: '1.35'
              }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                  AUTOMATED GROUND DISPATCH ACTION:
                </span>
                {cctvResult.automated_dispatch_action}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default CctvMonitor;
