import React from 'react';
import { Clock, MapPin } from 'lucide-react';

export default function RouteDetails({ routeResult }) {
  if (!routeResult) return null;

  return (
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
  );
}
