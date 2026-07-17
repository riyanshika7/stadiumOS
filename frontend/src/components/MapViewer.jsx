import React, { useState, useEffect } from 'react';
import { Compass, Accessibility } from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { useInclusiveMode } from '../hooks/useInclusiveMode';
import StadiumCanvasMap from './StadiumCanvasMap';
import RouteDetails from './RouteDetails';

function MapViewer({ locations, forcedStart, forcedEnd }) {
  const [navStart, setNavStart] = useState('');
  const [navEnd, setNavEnd] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // Assist Toggles
  const [accWheelchair, setAccWheelchair] = useState(false);
  const [accVisual, setAccVisual] = useState(false);
  const [accStroller, setAccStroller] = useState(false);

  const { wheelchairMode: isWheelchairActive } = useInclusiveMode();

  useEffect(() => {
    if (locations && locations.length > 0) {
      setNavStart(locations[0].name);
      setNavEnd(locations[locations.length - 1].name);
    }
  }, [locations]);

  useEffect(() => {
    if (forcedStart) setNavStart(forcedStart);
    if (forcedEnd) setNavEnd(forcedEnd);
  }, [forcedStart, forcedEnd]);

  const handleRouteSearch = async () => {
    setIsRouting(true);
    setRouteResult(null);
    try {
      const assists = [];
      if (accWheelchair || isWheelchairActive) assists.push('wheelchair');
      if (accVisual) assists.push('braille');
      if (accStroller) assists.push('family');

      const res = await fetch(`${API_BASE_URL}/api/navigation/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_location: navStart,
          end_location: navEnd,
          accessibility_needs: assists,
        }),
      });
      const data = await res.json();
      setRouteResult(data);
    } catch (err) {
      console.error(err);
      setRouteResult(null);
    } finally {
      setIsRouting(false);
    }
  };

  useEffect(() => {
    if (navStart && navEnd && navStart !== navEnd) {
      handleRouteSearch();
    }
  }, [navStart, navEnd, accWheelchair, accVisual, accStroller, isWheelchairActive]);

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <Compass size={20} />
        ACCESSIBILITY WAYFINDER & ROUTE PLANNER
      </h3>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
        Plan optimal stadium routes. When Wheelchair Mode ♿ is active, stairs are auto-pruned to calculate step-free exit paths.
      </p>

      {locations.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Loading routes and layouts...
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <form onSubmit={(e) => e.preventDefault()}>
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

            <label id="accessibility-assistance-label" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.75rem', fontWeight: 'bold' }}>Accessibility Assistance Needed</label>
            <div className="acc-grid" style={{ marginBottom: '0.5rem' }} role="group" aria-labelledby="accessibility-assistance-label">
              <button 
                type="button" 
                className={`acc-btn ${accWheelchair || isWheelchairActive ? 'active' : ''}`}
                onClick={() => !isWheelchairActive && setAccWheelchair(!accWheelchair)}
                disabled={isWheelchairActive}
                aria-pressed={accWheelchair || isWheelchairActive}
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

          <div style={{ position: 'relative' }}>
            {isRouting && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(11, 15, 25, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#46F3FF',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                gap: '0.5rem',
                zIndex: 10,
                borderRadius: '6px',
                border: '1px solid rgba(70, 243, 255, 0.2)',
                backdropFilter: 'blur(2px)'
              }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                Calculating optimal barrier-free route...
              </div>
            )}
            <StadiumCanvasMap 
              path={routeResult?.key_locations_passed || []}
              startNode={navStart}
              endNode={navEnd}
            />
          </div>

          <RouteDetails routeResult={routeResult} />
        </div>
      )}
    </div>
  );
}

export default MapViewer;
