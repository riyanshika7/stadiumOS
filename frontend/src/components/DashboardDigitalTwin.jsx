import React, { useState } from 'react';
import { Shield, Flame, Activity, Zap, Compass } from 'lucide-react';

const DigitalTwinStadium = React.lazy(() => import('./DigitalTwinStadium'));

const ZONE_DETAILS = {
  "Gate A": { density: "45%", status: "Normal Ingress", guards: 12, incidentCount: 0, flowRate: "1.4 fans/sec" },
  "Gate B": { density: "30%", status: "Light Ingress", guards: 8, incidentCount: 0, flowRate: "0.8 fans/sec" },
  "Gate C": { density: "82%", status: "High Congestion", guards: 18, incidentCount: 1, flowRate: "3.2 fans/sec" },
  "Gate D": { density: "55%", status: "Moderate Ingress", guards: 10, incidentCount: 0, flowRate: "1.8 fans/sec" },
  "Medical Centre": { density: "15%", status: "Available", doctors: 4, incidentCount: 0, flowRate: "N/A" },
  "Security Station": { density: "20%", status: "Active Dispatch", operators: 6, incidentCount: 1, flowRate: "N/A" }
};

export default function DashboardDigitalTwin({ activeNode, onNodeSelect, onTriggerSimulation, onSetRouteStart, onSetRouteDest }) {
  const selectedDetails = activeNode ? ZONE_DETAILS[activeNode.name] : null;

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '520px', position: 'relative' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 8, 22, 0.4)', zIndex: 10 }}>
        <h3 className="card-title" style={{ margin: 0, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} className="text-primary animate-pulse" />
          <span>🏟️ DYNAMIC 3D DIGITAL TWIN COCKPIT</span>
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge status-open" style={{ background: 'rgba(70, 243, 255, 0.15)', color: '#46F3FF', border: '1px solid rgba(70,243,255,0.4)', fontSize: '0.7rem' }}>
            R3F ENGINE ACTIVE
          </span>
          <span className="badge status-open" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)', fontSize: '0.7rem' }}>
            TELEMETRY LIVE
          </span>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div style={{ flex: 1, position: 'relative', background: '#02040a' }}>
        <React.Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Initializing 3D Digital Twin...</div>}>
          <DigitalTwinStadium 
            scrollProgress={0} 
            activeNode={activeNode} 
            onNodeClick={onNodeSelect}
            isContained={true}
          />
        </React.Suspense>

        {/* Floating Instructions Banner */}
        {!activeNode && (
          <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(5, 8, 22, 0.85)', border: '1px solid rgba(70, 243, 255, 0.3)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.75rem', color: '#46F3FF', backdropFilter: 'blur(8px)', zIndex: 5, pointerEvents: 'none', boxShadow: '0 0 15px rgba(70,243,255,0.2)' }}>
            👉 Click on any glowing hotspot node in the 3D stadium above to inspect
          </div>
        )}

        {/* Floating Telemetry Detail Overlay */}
        {activeNode && selectedDetails && (
          <div className="glass-card fade-in" style={{ position: 'absolute', top: '1rem', right: '1rem', width: '260px', padding: '1rem', background: 'rgba(5, 8, 22, 0.9)', border: '1px solid rgba(70, 243, 255, 0.4)', zIndex: 10, backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#46F3FF' }}>📍 {activeNode.name}</strong>
              <button 
                onClick={() => onNodeSelect(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ fontWeight: 'bold', color: selectedDetails.status.includes('High') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {selectedDetails.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Zone Density:</span>
                <span style={{ fontWeight: 'bold', color: '#46F3FF' }}>{selectedDetails.density}</span>
              </div>
              {selectedDetails.flowRate && selectedDetails.flowRate !== 'N/A' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Flow Rate:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedDetails.flowRate}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Staffing Level:</span>
                <span style={{ fontWeight: 'bold' }}>{selectedDetails.guards || selectedDetails.doctors || selectedDetails.operators} units</span>
              </div>
            </div>

            {/* Sparkline simulation */}
            <div style={{ margin: '0.75rem 0', height: '30px', position: 'relative' }}>
              <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                <path 
                  d="M0 25 Q 30 5, 60 22 T 120 10 T 180 20 T 240 5" 
                  fill="none" 
                  stroke={activeNode.color} 
                  strokeWidth="2" 
                  className="dash-sparkline" 
                />
                <circle cx="240" cy="5" r="3" fill={activeNode.color} className="animate-ping" />
              </svg>
            </div>

            {/* Actions Context Menu */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Command Core Actions</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                <button 
                  onClick={() => onSetRouteStart(activeNode.name)} 
                  className="btn" 
                  style={{ padding: '0.3rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  <Compass size={12} /> Start Route
                </button>
                <button 
                  onClick={() => onSetRouteDest(activeNode.name)} 
                  className="btn" 
                  style={{ padding: '0.3rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  <Compass size={12} /> End Route
                </button>
              </div>

              {activeNode.name.includes("Gate") && (
                <button 
                  onClick={() => onTriggerSimulation(activeNode.name)} 
                  className="btn" 
                  style={{ padding: '0.35rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <Zap size={12} /> Simulate Surge Event
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
