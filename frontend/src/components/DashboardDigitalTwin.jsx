import React, { useState } from 'react';
import { Zap, Compass, Activity } from 'lucide-react';

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
    <div className="glass-card dtwin-container">
      <div className="dtwin-header">
        <h3 className="card-title dtwin-title">
          <Activity size={20} className="text-primary animate-pulse" />
          <span>🏟️ DYNAMIC 3D DIGITAL TWIN COCKPIT</span>
        </h3>
        <div className="dtwin-badge-group">
          <span className="badge status-open dtwin-badge-engine">
            R3F ENGINE ACTIVE
          </span>
          <span className="badge status-open dtwin-badge-telemetry">
            TELEMETRY LIVE
          </span>
        </div>
      </div>

      <div className="dtwin-canvas-area">
        <React.Suspense fallback={<div className="dtwin-canvas-fallback">Initializing 3D Digital Twin...</div>}>
          <DigitalTwinStadium 
            scrollProgress={0} 
            activeNode={activeNode} 
            onNodeClick={onNodeSelect}
            isContained={true}
          />
        </React.Suspense>

        {!activeNode && (
          <div className="dtwin-floating-hint">
            👉 Click on any glowing hotspot node in the 3D stadium above to inspect
          </div>
        )}

        {activeNode && selectedDetails && (
          <div className="glass-card fade-in dtwin-overlay-card">
            <div className="dtwin-overlay-header">
              <strong className="dtwin-overlay-name">📍 {activeNode.name}</strong>
              <button 
                onClick={() => onNodeSelect(null)} 
                className="dtwin-overlay-close"
              >
                ✕ Close
              </button>
            </div>

            <div className="dtwin-overlay-body">
              <div className="dtwin-overlay-row">
                <span className="dtwin-overlay-label">Status:</span>
                <span style={{ fontWeight: 'bold', color: selectedDetails.status.includes('High') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {selectedDetails.status}
                </span>
              </div>
              <div className="dtwin-overlay-row">
                <span className="dtwin-overlay-label">Zone Density:</span>
                <span className="dtwin-overlay-value">{selectedDetails.density}</span>
              </div>
              {selectedDetails.flowRate && selectedDetails.flowRate !== 'N/A' && (
                <div className="dtwin-overlay-row">
                  <span className="dtwin-overlay-label">Flow Rate:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedDetails.flowRate}</span>
                </div>
              )}
              <div className="dtwin-overlay-row">
                <span className="dtwin-overlay-label">Staffing Level:</span>
                <span style={{ fontWeight: 'bold' }}>{selectedDetails.guards || selectedDetails.doctors || selectedDetails.operators} units</span>
              </div>
            </div>

            <div className="dtwin-overlay-sparkline">
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

            <div className="dtwin-overlay-actions">
              <span className="dtwin-actions-label">Command Core Actions</span>
              <div className="dtwin-action-grid">
                <button 
                  onClick={() => onSetRouteStart(activeNode.name)} 
                  className="btn dtwin-action-btn"
                >
                  <Compass size={12} /> Start Route
                </button>
                <button 
                  onClick={() => onSetRouteDest(activeNode.name)} 
                  className="btn dtwin-action-btn"
                >
                  <Compass size={12} /> End Route
                </button>
              </div>

              {activeNode.name.includes("Gate") && (
                <button 
                  onClick={() => onTriggerSimulation('surge')} 
                  className="btn dtwin-surge-btn"
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
