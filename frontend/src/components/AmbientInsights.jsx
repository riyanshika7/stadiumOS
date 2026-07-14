import React, { useState, useEffect } from 'react';
import { Brain, HelpCircle, Eye, AlertTriangle, ShieldCheck, Cog } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

function AmbientInsights({ locations, alerts, incidents }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll for predictive insights
  useEffect(() => {
    fetchInsights();
    
    const interval = setInterval(fetchInsights, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ambient/insights`);
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Error fetching proactive insights:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !insights) {
    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
        <Brain className="animate-spin" size={20} style={{ color: 'var(--color-primary)' }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>StadiumOS Ambient Brain Ingesting Stadium Feeds...</span>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ 
      border: '2px solid rgba(0, 135, 90, 0.4)', 
      boxShadow: '0 0 20px rgba(0, 135, 90, 0.15)',
      background: 'radial-gradient(ellipse at top right, rgba(0, 135, 90, 0.1), transparent 70%), var(--bg-card)'
    }}>
      <h3 className="card-title" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(0, 135, 90, 0.2)', paddingBottom: '0.5rem' }}>
        <Brain size={22} style={{ color: 'var(--color-success)' }} />
        AMBIENT CO-PILOT PREDICTIVE ACTIONS
      </h3>
      
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
        Invisible AI actively analyzing turnstiles, weather alerts, and incident clusters. Problems are predicted and workflows automated before they cause delays.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        
        {/* Column 1: Predicted Bottlenecks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.25rem' }}>
            <AlertTriangle size={14} />
            PREDICTED PROBLEMS (15-30M)
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.predicted_problems.map((prob, idx) => (
              <div key={idx} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255, 199, 44, 0.03)', borderLeft: '2px solid var(--color-warning)', color: 'var(--text-main)', lineHeight: '1.3' }}>
                {prob}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recommended Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.35rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.25rem' }}>
            <ShieldCheck size={14} />
            RECOMMENDED PREVENTIONS
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.recommended_actions.map((act, idx) => (
              <div key={idx} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(0, 135, 90, 0.03)', borderLeft: '2px solid var(--color-primary)', color: 'var(--text-main)', lineHeight: '1.3' }}>
                {act}
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Automated Workflows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '0.35rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.25rem' }}>
            <Cog size={14} />
            AUTOMATED WORKFLOWS
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.automated_workflows.map((flow, idx) => (
              <div key={idx} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(0, 191, 255, 0.03)', borderLeft: '2px solid var(--color-info)', color: 'var(--text-main)', lineHeight: '1.3', fontStyle: 'italic' }}>
                {flow}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AmbientInsights;
