import React, { useState, useEffect } from 'react';
import { Compass, Clock, MapPin, Accessibility, Info, HeartHandshake, Map } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function MapViewer({ locations }) {
  const [navStart, setNavStart] = useState('');
  const [navEnd, setNavEnd] = useState('');
  const [accWheelchair, setAccWheelchair] = useState(false);
  const [accVisual, setAccVisual] = useState(false);
  const [accStroller, setAccStroller] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [showGoogleMap, setShowGoogleMap] = useState(false);

  useEffect(() => {
    if (locations.length > 0) {
      setNavStart(locations[0].name);
      setNavEnd(locations[3] ? locations[3].name : locations[0].name);
    }
  }, [locations]);

  const handleNavigate = async (e) => {
    e.preventDefault();
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

  return (
    <div className="glass-card">
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
          <span>{showGoogleMap ? 'VIEW STADIUM CHECKPOINTS' : 'VIEW GOOGLE MAPS SATELLITE'}</span>
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
        /* Step-by-Step Wayfinder */
        <div>
          <form onSubmit={handleNavigate}>
            {/* Responsive Navigation Select Grid */}
            <div className="nav-grid">
              <div className="form-group">
                <label>Start Node</label>
                <select value={navStart} onChange={(e) => setNavStart(e.target.value)}>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.type})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Destination</label>
                <select value={navEnd} onChange={(e) => setNavEnd(e.target.value)}>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={{ marginBottom: '0.5rem', display: 'block' }}>Accessibility Assistance Needed</label>
            <div className="acc-grid">
              <button 
                type="button" 
                className={`acc-btn ${accWheelchair ? 'active' : ''}`}
                onClick={() => setAccWheelchair(!accWheelchair)}
              >
                <Accessibility />
                <span>Wheelchair / Ramp</span>
              </button>
              <button 
                type="button" 
                className={`acc-btn ${accVisual ? 'active' : ''}`}
                onClick={() => setAccVisual(!accVisual)}
              >
                <Info />
                <span>Visual / Braille</span>
              </button>
              <button 
                type="button" 
                className={`acc-btn ${accStroller ? 'active' : ''}`}
                onClick={() => setAccStroller(!accStroller)}
              >
                <HeartHandshake />
                <span>Stroller / Family</span>
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isRouting}>
              {isRouting ? 'Calculating Accessible Path...' : 'Plan Path'}
            </button>
          </form>

          {routeResult && (
            <div className="route-results">
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

              <p className="route-desc-text">
                {routeResult.route_description}
              </p>

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
