import React, { useState } from 'react';
import { Network, Brain, Shield, Compass } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function SwarmOrchestrator() {
  const [eventDesc, setEventDesc] = useState('');
  const [swarmResult, setSwarmResult] = useState(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  const runSwarmCoordination = async (description) => {
    setIsOrchestrating(true);
    setEventDesc(description);
    setSwarmResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/swarm/coordinate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_description: description }),
      });
      const data = await res.json();
      setSwarmResult(data);
    } catch (err) {
      console.error("Swarm coordination failure:", err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="glass-card" style={{ 
      border: '2px solid rgba(168, 85, 247, 0.4)', 
      boxShadow: '0 0 25px rgba(168, 85, 247, 0.15)',
      background: 'radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.08), transparent 70%), var(--bg-card)'
    }}>
      <h3 className="card-title" style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', paddingBottom: '0.5rem' }}>
        <Network size={22} style={{ color: '#c084fc' }} />
        HIERARCHICAL MULTI-AGENT SWARM ORCHESTRATOR
      </h3>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
        Solve multi-dimensional stadium emergencies by orchestrating a swarm of specialized sub-agents working in parallel, led by a Swarm Coordinator.
      </p>

      {/* Preset Scenario Triggers */}
      <div className="speech-helpers" style={{ marginBottom: '1.25rem' }}>
        <span className="speech-tag" onClick={() => runSwarmCoordination("Spanish-speaking fan reporting severe chest pain on the Gate C ramp during a high-density ingress rush.")} style={{ border: '1px solid #c084fc' }}>
          🚨 Crisis Scenario 1: Spanish Medical Emergency at Congested Gate C
        </span>
        <span className="speech-tag" onClick={() => runSwarmCoordination("French-speaking parent lost their young child near Section 104 outer ramp which is slippery due to rain.")} style={{ border: '1px solid #c084fc' }}>
          🚨 Crisis Scenario 2: French Parent & Lost Child near Wet Exit Ramp
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          type="text"
          value={eventDesc}
          onChange={(e) => setEventDesc(e.target.value)}
          placeholder="Describe a complex multi-dimensional stadium crisis here..."
          style={{ flex: 1, padding: '0.6rem 1rem' }}
        />
        <button 
          onClick={() => runSwarmCoordination(eventDesc)}
          className="btn btn-primary" 
          style={{ background: '#a855f7', border: 'none', padding: '0.6rem 1.2rem' }}
          disabled={isOrchestrating || !eventDesc.trim()}
        >
          {isOrchestrating ? 'Orchestrating Swarm...' : 'Run Swarm'}
        </button>
      </div>

      {swarmResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          
          {/* Swarm Leader Coordination Summary */}
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(168, 85, 247, 0.08)', borderLeft: '4px solid #a855f7', borderRadius: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>
              👑 SWARM COORDINATOR EXECUTIVE SUMMARY
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold', lineHeight: '1.4' }}>
              {swarmResult.coordination_summary}
            </p>
          </div>

          {/* Responsive Swarm Agent Collaboration Grid */}
          <div className="swarm-grid">
            
            {/* Agent 1: Linguistic Mediator */}
            <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '#0.75rem', fontWeight: 'bold', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                <Brain size={12} />
                Linguistic Agent
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                {swarmResult.linguistic_playbook}
              </p>
            </div>

            {/* Agent 2: Safety Triage */}
            <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '#0.75rem', fontWeight: 'bold', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                <Shield size={12} />
                Safety Agent
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                {swarmResult.safety_playbook}
              </p>
            </div>

            {/* Agent 3: Access Router */}
            <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '#0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                <Compass size={12} />
                Access Router
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                {swarmResult.routing_playbook}
              </p>
            </div>

            {/* Agent 4: Predictive Ops */}
            <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '#0.75rem', fontWeight: 'bold', color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                <Network size={12} />
                Predictive Ops
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                {swarmResult.ops_playbook}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default SwarmOrchestrator;
