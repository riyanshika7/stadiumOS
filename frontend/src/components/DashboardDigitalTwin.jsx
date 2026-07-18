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
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    volunteers: true,
    incidents: true,
    emergency: true,
    parking: false,
    transit: false,
    weather: false,
    accessibility: false,
    aiRecommend: true
  });

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

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
        {/* Floating Cockpit Layers Panel */}
        <div className="dtwin-layers-panel" aria-label="Digital Twin Overlay Layers">
          <div className="dtwin-layers-title">
            <span style={{ fontSize: '0.9rem' }}>🎛️</span>
            <span>Cockpit Layers</span>
          </div>
          
          <button 
            onClick={() => toggleLayer('heatmap')}
            className={`dtwin-layer-item ${activeLayers.heatmap ? 'active' : ''}`}
            aria-pressed={activeLayers.heatmap}
          >
            <span>🗺️ Crowd Heatmap</span>
            <div className={`dtwin-layer-indicator ${activeLayers.heatmap ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('volunteers')}
            className={`dtwin-layer-item ${activeLayers.volunteers ? 'active' : ''}`}
            aria-pressed={activeLayers.volunteers}
          >
            <span>🚶 Volunteer Beacons</span>
            <div className={`dtwin-layer-indicator ${activeLayers.volunteers ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('incidents')}
            className={`dtwin-layer-item ${activeLayers.incidents ? 'active' : ''}`}
            aria-pressed={activeLayers.incidents}
          >
            <span>⚠️ Incident Markers</span>
            <div className={`dtwin-layer-indicator ${activeLayers.incidents ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('emergency')}
            className={`dtwin-layer-item ${activeLayers.emergency ? 'active' : ''}`}
            aria-pressed={activeLayers.emergency}
          >
            <span>🚨 Evacuation Zones</span>
            <div className={`dtwin-layer-indicator ${activeLayers.emergency ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('parking')}
            className={`dtwin-layer-item ${activeLayers.parking ? 'active' : ''}`}
            aria-pressed={activeLayers.parking}
          >
            <span>🚗 Parking Overlays</span>
            <div className={`dtwin-layer-indicator ${activeLayers.parking ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('transit')}
            className={`dtwin-layer-item ${activeLayers.transit ? 'active' : ''}`}
            aria-pressed={activeLayers.transit}
          >
            <span>🚊 Metro Feeds</span>
            <div className={`dtwin-layer-indicator ${activeLayers.transit ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('weather')}
            className={`dtwin-layer-item ${activeLayers.weather ? 'active' : ''}`}
            aria-pressed={activeLayers.weather}
          >
            <span>🌧️ Live Rain Overlay</span>
            <div className={`dtwin-layer-indicator ${activeLayers.weather ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('accessibility')}
            className={`dtwin-layer-item ${activeLayers.accessibility ? 'active' : ''}`}
            aria-pressed={activeLayers.accessibility}
          >
            <span>♿ Accessible Routes</span>
            <div className={`dtwin-layer-indicator ${activeLayers.accessibility ? 'active' : ''}`} />
          </button>
          
          <button 
            onClick={() => toggleLayer('aiRecommend')}
            className={`dtwin-layer-item ${activeLayers.aiRecommend ? 'active' : ''}`}
            aria-pressed={activeLayers.aiRecommend}
          >
            <span>🤖 AI Swarm Tips</span>
            <div className={`dtwin-layer-indicator ${activeLayers.aiRecommend ? 'active' : ''}`} />
          </button>
        </div>

        <React.Suspense fallback={<div className="dtwin-canvas-fallback">Initializing 3D Digital Twin...</div>}>
          <DigitalTwinStadium 
            scrollProgress={0} 
            activeNode={activeNode} 
            onNodeClick={onNodeSelect}
            isContained={true}
            activeLayers={activeLayers}
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
