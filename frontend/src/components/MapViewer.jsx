import React, { useState, useEffect, useRef } from 'react';
import { Compass, Clock, MapPin, Accessibility, Info, HeartHandshake, Map } from 'lucide-react';
import { useInclusiveMode } from '../hooks/useInclusiveMode';
import { API_BASE_URL } from '../constants';

const NODE_COORDINATES = {
  "Gate A": { x: 15, y: 30 },
  "Gate B": { x: 50, y: 10 },
  "Gate C": { x: 85, y: 30 },
  "Section 101": { x: 30, y: 45 },
  "Section 102": { x: 70, y: 45 },
  "Section 204": { x: 50, y: 65 },
  "Elevator 1": { x: 30, y: 25 },
  "Ramp North": { x: 50, y: 25 },
  "Restroom Block A": { x: 20, y: 55 },
  "Concession Stand North": { x: 50, y: 42 }
};

const STADIUM_EDGES = [
  ["Gate A", "Section 101"], ["Gate A", "Elevator 1"], ["Gate A", "Restroom Block A"],
  ["Gate B", "Ramp North"], ["Gate B", "Concession Stand North"],
  ["Gate C", "Section 102"], ["Gate C", "Ramp North"],
  ["Section 101", "Elevator 1"], ["Section 101", "Restroom Block A"],
  ["Section 102", "Elevator 1"], ["Section 102", "Concession Stand North"],
  ["Section 204", "Ramp North"], ["Section 204", "Elevator 1"],
  ["Restroom Block A", "Section 101"], ["Concession Stand North", "Section 102"]
];

function StadiumCanvasMap({ path, startNode, endNode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let animationFrameId;
    let offset = 0;

    const draw = () => {
      // Clear
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // Draw Stadium Boundary
      ctx.strokeStyle = 'rgba(70, 243, 255, 0.12)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Concourse Inner Ring
      ctx.strokeStyle = 'rgba(70, 243, 255, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.28, 0, Math.PI * 2);
      ctx.stroke();

      // Draw static connections (Edges)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      STADIUM_EDGES.forEach(([n1, n2]) => {
        const p1 = NODE_COORDINATES[n1];
        const p2 = NODE_COORDINATES[n2];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo((p1.x / 100) * width, (p1.y / 100) * height);
          ctx.lineTo((p2.x / 100) * width, (p2.y / 100) * height);
          ctx.stroke();
        }
      });

      // Highlight calculated shortest route connections (Path)
      if (path && path.length > 1) {
        ctx.strokeStyle = '#46F3FF';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(70, 243, 255, 0.8)';
        ctx.beginPath();
        
        const startPt = NODE_COORDINATES[path[0]];
        if (startPt) {
          ctx.moveTo((startPt.x / 100) * width, (startPt.y / 100) * height);
          for (let i = 1; i < path.length; i++) {
            const pt = NODE_COORDINATES[path[i]];
            if (pt) {
              ctx.lineTo((pt.x / 100) * width, (pt.y / 100) * height);
            }
          }
        }
        ctx.stroke();
        
        // Reset shadows for nodes
        ctx.shadowBlur = 0;

        // Draw animated marching ants particles on the path
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 12]);
        ctx.lineDashOffset = -offset;
        ctx.beginPath();
        if (startPt) {
          ctx.moveTo((startPt.x / 100) * width, (startPt.y / 100) * height);
          for (let i = 1; i < path.length; i++) {
            const pt = NODE_COORDINATES[path[i]];
            if (pt) {
              ctx.lineTo((pt.x / 100) * width, (pt.y / 100) * height);
            }
          }
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      // Draw all nodes
      Object.entries(NODE_COORDINATES).forEach(([name, node]) => {
        const xCoord = (node.x / 100) * width;
        const yCoord = (node.y / 100) * height;

        const isStart = name === startNode;
        const isEnd = name === endNode;
        const isPath = path && path.includes(name);

        // Node circle
        ctx.beginPath();
        ctx.arc(xCoord, yCoord, isStart || isEnd ? 7 : 5, 0, Math.PI * 2);
        
        if (isStart) {
          ctx.fillStyle = '#22c55e'; // Green start
        } else if (isEnd) {
          ctx.fillStyle = '#ef4444'; // Red end
        } else if (isPath) {
          ctx.fillStyle = '#46F3FF'; // Cyan path
        } else {
          ctx.fillStyle = '#1e293b'; // Slate default
        }
        ctx.fill();

        ctx.strokeStyle = isPath ? '#46F3FF' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node text label
        ctx.fillStyle = isStart || isEnd || isPath ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
        ctx.font = isStart || isEnd || isPath ? 'bold 9px sans-serif' : '7.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, xCoord, yCoord - 9);
      });

      offset += 0.4;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [path, startNode, endNode]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        width={480} 
        height={300} 
        role="img"
        aria-label={`Interactive visual pathfinder map of stadium concourse zones showing calculated route from ${startNode || 'Start'} to ${endNode || 'Destination'}`}
        style={{ 
          width: '100%', 
          height: '300px', 
          background: '#0b0f19', 
          border: '1px solid rgba(70, 243, 255, 0.2)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'block'
        }}
      />
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(11,15,25,0.85)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.65rem', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
          <span>Start Point</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
          <span>Destination</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#46F3FF' }}></span>
          <span>Calculated Route</span>
        </div>
      </div>
    </div>
  );
}

function MapViewer({ locations, forcedStart, forcedEnd, forceWheelchair }) {
  const { wheelchairMode } = useInclusiveMode();
  // Merge global wheelchair mode with the prop-level override
  const isWheelchairActive = wheelchairMode || forceWheelchair;

  const [navStart, setNavStart] = useState('');
  const [navEnd, setNavEnd] = useState('');
  const [accWheelchair, setAccWheelchair] = useState(false);
  const [accVisual, setAccVisual] = useState(false);
  const [accStroller, setAccStroller] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [showGoogleMap, setShowGoogleMap] = useState(false);

  // Sync local checkbox whenever the global mode changes
  useEffect(() => {
    if (isWheelchairActive) setAccWheelchair(true);
  }, [isWheelchairActive]);

  useEffect(() => {
    if (locations.length > 0) {
      // Filter to step-free locations when wheelchair mode is active
      const validLocs = locations.filter(loc => !isWheelchairActive || !loc.accessibility_features.includes('stairs') || loc.accessibility_features.includes('elevator') || loc.accessibility_features.includes('ramp'));
      if (validLocs.length > 0) {
        setNavStart(validLocs[0].name);
        setNavEnd(validLocs[3] ? validLocs[3].name : validLocs[validLocs.length - 1].name);
      }
    }
  }, [locations, isWheelchairActive]);

  useEffect(() => {
    if (forcedStart) {
      setNavStart(forcedStart);
    }
  }, [forcedStart]);

  useEffect(() => {
    if (forcedEnd) {
      setNavEnd(forcedEnd);
    }
  }, [forcedEnd]);

  const handleNavigate = async (e) => {
    if (e) e.preventDefault();
    if (!navStart || !navEnd) return;
    
    setIsRouting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/navigation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_location: navStart,
          destination: navEnd,
          wheelchair: accWheelchair,
          visual: accVisual,
          stroller: accStroller,
        }),
      });
      const data = await res.json();
      setRouteResult(data);
    } catch (err) {
      console.error('Navigation error:', err);
    } finally {
      setIsRouting(false);
    }
  };

  // Automatically recalculate path when locations or assistance checkboxes change
  useEffect(() => {
    if (navStart && navEnd) {
      handleNavigate();
    }
  }, [navStart, navEnd, accWheelchair, accVisual, accStroller]);

  return (
    <div className="glass-card">
      {/* ♿ Wheelchair Mode Banner — injected when global inclusive mode is active */}
      {wheelchairMode && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.6rem 1rem',
            marginBottom: '0.75rem',
            background: 'rgba(70, 243, 255, 0.1)',
            border: '2px solid #46F3FF',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#46F3FF',
            letterSpacing: '0.05em',
          }}
        >
          <Accessibility size={16} aria-hidden="true" />
          ♿ WHEELCHAIR MODE ACTIVE — SHOWING STEP-FREE ROUTES ONLY
        </div>
      )}
      <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Compass size={22} />
          ACCESSIBILITY ROUTE PLANNER
        </span>
        
        {/* Google Maps Toggle Button */}
        <button
          type="button"
          onClick={() => setShowGoogleMap(!showGoogleMap)}
          className="btn"
          style={{ 
            padding: '0.35rem 0.75rem', 
            fontSize: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            background: showGoogleMap ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)'
          }}
        >
          <Map size={14} />
          <span>{showGoogleMap ? 'VIEW DYNAMIC WAYFINDER' : 'VIEW GOOGLE MAPS SATELLITE'}</span>
        </button>
      </h3>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
        Determine barrier-free pathways for fans with mobility, sensory, or family assistance needs.
      </p>

      {showGoogleMap ? (
        /* Embedded Google Map (Satellite Mode) centered at MetLife Stadium */
        <div style={{ width: '100%', height: '350px', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginTop: '1rem' }}>
          <iframe
            title="MetLife Stadium Satellite Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src="https://maps.google.com/maps?q=MetLife%20Stadium,%20NJ&t=k&z=17&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
          />
        </div>
      ) : (
        /* Step-by-Step Wayfinder + Canvas Map */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Responsive Navigation Select Grid */}
            <div className="nav-grid">
              <div className="form-group">
                <label id="start-node-label">Start Node</label>
                <select aria-labelledby="start-node-label" value={navStart} onChange={(e) => setNavStart(e.target.value)}>
                  {locations.filter(loc => !isWheelchairActive || !loc.accessibility_features.includes('stairs') || loc.accessibility_features.includes('elevator') || loc.accessibility_features.includes('ramp')).map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.type})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label id="destination-label">Destination</label>
                <select aria-labelledby="destination-label" value={navEnd} onChange={(e) => setNavEnd(e.target.value)}>
                  {locations.filter(loc => !isWheelchairActive || !loc.accessibility_features.includes('stairs') || loc.accessibility_features.includes('elevator') || loc.accessibility_features.includes('ramp')).map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <label id="accessibility-assistance-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Accessibility Assistance Needed</label>
            <div className="acc-grid" style={{ marginBottom: '0.5rem' }} role="group" aria-labelledby="accessibility-assistance-label">
              <button 
                type="button" 
                className={`acc-btn ${accWheelchair ? 'active' : ''}`}
                onClick={() => !isWheelchairActive && setAccWheelchair(!accWheelchair)}
                disabled={isWheelchairActive}
                aria-pressed={accWheelchair}
              >
                <Accessibility />
                <span>Wheelchair / Ramp {isWheelchairActive ? "(Enforced ♿)" : ""}</span>
              </button>
              <button 
                type="button" 
                className={`acc-btn ${accVisual ? 'active' : ''}`}
                onClick={() => setAccVisual(!accVisual)}
                aria-pressed={accVisual}
              >
                <Info />
                <span>Visual / Braille</span>
              </button>
              <button 
                type="button" 
                className={`acc-btn ${accStroller ? 'active' : ''}`}
                onClick={() => setAccStroller(!accStroller)}
                aria-pressed={accStroller}
              >
                <HeartHandshake />
                <span>Stroller / Family</span>
              </button>
            </div>
          </form>

          {/* Interactive HTML5 Canvas Stadium Map */}
          <StadiumCanvasMap 
            path={routeResult?.key_locations_passed || []}
            startNode={navStart}
            endNode={navEnd}
          />

          {routeResult && (
            <div className="route-results" style={{ marginTop: '0px' }}>
              <div className="route-meta">
                <div className="meta-item">
                  <Clock size={16} />
                  <span>Est. Time: {routeResult.estimated_time_minutes} mins</span>
                </div>
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{routeResult.key_locations_passed.length} checkpoints</span>
                </div>
              </div>

              {/* Explainable AI Reasoning Panel */}
              <div style={{ background: 'rgba(70, 243, 255, 0.05)', border: '1px solid rgba(70, 243, 255, 0.15)', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#46F3FF', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  🧠 EXPLAINABLE AI (XAI) PATH ROUTING REASONING
                </span>
                <p className="route-desc-text" style={{ margin: 0, fontSize: '0.78rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                  {routeResult.route_description}
                </p>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accessibility Assist Markers</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {routeResult.accessibility_features_highlighted.map((feat, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(255, 199, 44, 0.1)', color: 'var(--color-accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Route Path Checkpoints</span>
              <div className="route-steps-visual" style={{ marginTop: '0.5rem' }}>
                {routeResult.key_locations_passed.map((node, idx) => (
                  <div key={idx} className="route-step-node">
                    {node}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MapViewer;
