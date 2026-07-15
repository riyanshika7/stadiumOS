import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import { API_BASE_URL } from '../constants';

function SwarmOrchestrator() {
  const [eventDesc, setEventDesc] = useState('');
  const [swarmResult, setSwarmResult] = useState(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [activeNodeFocus, setActiveNodeFocus] = useState('leader'); // leader, linguistic, safety, routing, ops
  const [orchestratingStep, setOrchestratingStep] = useState(0); // 0 = idle, 1 = parsing, 2 = consulting, 3 = consensus, 4 = done

  // Simulate step progression for maximum "WOW" animation effect during execution
  useEffect(() => {
    if (isOrchestrating) {
      setOrchestratingStep(1);
      const t1 = setTimeout(() => setOrchestratingStep(2), 1200);
      const t2 = setTimeout(() => setOrchestratingStep(3), 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (swarmResult) {
      setOrchestratingStep(4);
    } else {
      setOrchestratingStep(0);
    }
  }, [isOrchestrating, swarmResult]);

  const runSwarmCoordination = async (description) => {
    setIsOrchestrating(true);
    setEventDesc(description);
    setSwarmResult(null);
    setActiveNodeFocus('leader');

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

  const getStepText = () => {
    switch (orchestratingStep) {
      case 1: return "🧠 Linguistic Mediator decoding query syntax & sentiment...";
      case 2: return "📡 Safety & Router agents analyzing MetLife telemetry checkpoints...";
      case 3: return "👑 Swarm Coordinator unifying responses and generating executive consensus...";
      case 4: return "✓ Swarm Playbook Compiled Successfully";
      default: return "Multi-agent swarm ready for dispatch.";
    }
  };

  return (
    <div className="glass-card" style={{ 
      border: '2px solid rgba(168, 85, 247, 0.4)', 
      boxShadow: '0 0 25px rgba(168, 85, 247, 0.15)',
      background: 'radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.08), transparent 70%), var(--bg-card)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h3 className="card-title" style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', paddingBottom: '0.5rem' }}>
        <Network size={22} className={isOrchestrating ? "animate-spin text-purple-400" : "text-purple-400"} />
        HIERARCHICAL MULTI-AGENT SWARM ORCHESTRATOR
      </h3>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
        Solve multi-dimensional stadium emergencies by orchestrating a swarm of specialized sub-agents working in parallel, led by a Swarm Coordinator.
      </p>

      {/* Preset Scenario Triggers */}
      <div className="speech-helpers" style={{ marginBottom: '1.25rem' }} role="group" aria-label="Preset crisis scenarios">
        <button
          type="button"
          className="speech-tag"
          onClick={() => runSwarmCoordination('Spanish-speaking fan reporting severe chest pain on the Gate C ramp during a high-density ingress rush.')}
          style={{ border: '1px solid #c084fc', cursor: 'pointer' }}
        >
          🚨 Crisis Scenario 1: Spanish Medical Emergency at Congested Gate C
        </button>
        <button
          type="button"
          className="speech-tag"
          onClick={() => runSwarmCoordination('French-speaking parent lost their young child near Section 104 outer ramp which is slippery due to rain.')}
          style={{ border: '1px solid #c084fc', cursor: 'pointer' }}
        >
          🚨 Crisis Scenario 2: French Parent & Lost Child near Wet Exit Ramp
        </button>
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
          style={{ background: '#a855f7', border: 'none', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
          disabled={isOrchestrating || !eventDesc.trim()}
        >
          {isOrchestrating ? 'Orchestrating...' : 'Run Swarm'}
        </button>
      </div>

      {/* Real-time Step/Consensus Status Bar */}
      {(isOrchestrating || swarmResult) && (
        <div style={{ margin: '1rem 0', padding: '0.6rem 1rem', background: 'rgba(5, 8, 22, 0.4)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
          <div className="status-dot animate-ping" style={{ backgroundColor: orchestratingStep === 4 ? '#22c55e' : '#a855f7' }}></div>
          <span style={{ color: orchestratingStep === 4 ? '#22c55e' : '#c084fc', fontWeight: 'bold' }}>
            {getStepText()}
          </span>
        </div>
      )}

      {/* Swarm Interactive Node Network Arena */}
      {(isOrchestrating || swarmResult) && (
        <div style={{ position: 'relative', height: '240px', background: '#02040a', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <svg width="100%" height="100%" role="img" aria-label="Hierarchical swarm agent network connection map showing agent coordination relationships" style={{ overflow: 'visible' }}>
            <title>Multi-Agent Swarm Node Map</title>
            {/* SVG Link lines */}
            <g opacity={0.65}>
              <line x1="300" y1="120" x2="150" y2="60" stroke={orchestratingStep >= 1 ? "#a855f7" : "#334155"} strokeWidth="2.5" strokeDasharray={orchestratingStep === 1 ? "8 4" : "none"} className={orchestratingStep === 1 ? "swarm-flow-line" : ""} />
              <line x1="300" y1="120" x2="150" y2="180" stroke={orchestratingStep >= 2 ? "#ef4444" : "#334155"} strokeWidth="2.5" strokeDasharray={orchestratingStep === 2 ? "8 4" : "none"} className={orchestratingStep === 2 ? "swarm-flow-line" : ""} />
              <line x1="300" y1="120" x2="450" y2="60" stroke={orchestratingStep >= 2 ? "#00c8ff" : "#334155"} strokeWidth="2.5" strokeDasharray={orchestratingStep === 2 ? "8 4" : "none"} className={orchestratingStep === 2 ? "swarm-flow-line" : ""} />
              <line x1="300" y1="120" x2="450" y2="180" stroke={orchestratingStep >= 2 ? "#22c55e" : "#334155"} strokeWidth="2.5" strokeDasharray={orchestratingStep === 2 ? "8 4" : "none"} className={orchestratingStep === 2 ? "swarm-flow-line" : ""} />
            </g>

            {/* Swarm Leader Node (Center) */}
            <g 
              transform="translate(300, 120)" 
              onClick={() => setActiveNodeFocus('leader')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNodeFocus('leader'); } }}
              tabIndex={0}
              role="button"
              aria-label="Swarm Coordinator Leader node"
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle r="30" fill="rgba(168, 85, 247, 0.25)" stroke="#a855f7" strokeWidth="2.5" className={orchestratingStep === 3 ? "animate-pulse" : ""} />
              <circle r="22" fill="#a855f7" />
              <text y="5" textAnchor="middle" fill="#000000" fontWeight="950" fontSize="11">SWARM</text>
            </g>

            {/* Sub-Agent 1: Linguistic (Top-Left) */}
            <g 
              transform="translate(150, 60)" 
              onClick={() => setActiveNodeFocus('linguistic')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNodeFocus('linguistic'); } }}
              tabIndex={0}
              role="button"
              aria-label="Inspect Linguistic Mediator node"
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle r="24" fill={orchestratingStep >= 1 ? "rgba(168, 85, 247, 0.15)" : "rgba(255,255,255,0.02)"} stroke="#a855f7" strokeWidth={activeNodeFocus === 'linguistic' ? 3.5 : 2} className={orchestratingStep === 1 ? "animate-ping" : ""} />
              <circle r="16" fill="#02040a" stroke="#a855f7" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="#a855f7" fontSize="10">🗣️</text>
              <text y="32" textAnchor="middle" fill="var(--text-main)" fontSize="9" fontWeight="bold">Linguistic</text>
            </g>

            {/* Sub-Agent 2: Safety (Bottom-Left) */}
            <g 
              transform="translate(150, 180)" 
              onClick={() => setActiveNodeFocus('safety')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNodeFocus('safety'); } }}
              tabIndex={0}
              role="button"
              aria-label="Inspect Safety Triage node"
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle r="24" fill={orchestratingStep >= 2 ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.02)"} stroke="#ef4444" strokeWidth={activeNodeFocus === 'safety' ? 3.5 : 2} className={orchestratingStep === 2 ? "animate-ping" : ""} />
              <circle r="16" fill="#02040a" stroke="#ef4444" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="#ef4444" fontSize="10">🛡️</text>
              <text y="32" textAnchor="middle" fill="var(--text-main)" fontSize="9" fontWeight="bold">Safety Triage</text>
            </g>

            {/* Sub-Agent 3: Router (Top-Right) */}
            <g 
              transform="translate(450, 60)" 
              onClick={() => setActiveNodeFocus('routing')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNodeFocus('routing'); } }}
              tabIndex={0}
              role="button"
              aria-label="Inspect Access Router node"
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle r="24" fill={orchestratingStep >= 2 ? "rgba(0, 200, 255, 0.15)" : "rgba(255,255,255,0.02)"} stroke="#00c8ff" strokeWidth={activeNodeFocus === 'routing' ? 3.5 : 2} className={orchestratingStep === 2 ? "animate-ping" : ""} />
              <circle r="16" fill="#02040a" stroke="#00c8ff" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="#00c8ff" fontSize="10">🧭</text>
              <text y="32" textAnchor="middle" fill="var(--text-main)" fontSize="9" fontWeight="bold">Access Router</text>
            </g>

            {/* Sub-Agent 4: Ops (Bottom-Right) */}
            <g 
              transform="translate(450, 180)" 
              onClick={() => setActiveNodeFocus('ops')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNodeFocus('ops'); } }}
              tabIndex={0}
              role="button"
              aria-label="Inspect Predictive Ops node"
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <circle r="24" fill={orchestratingStep >= 2 ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.02)"} stroke="#22c55e" strokeWidth={activeNodeFocus === 'ops' ? 3.5 : 2} className={orchestratingStep === 2 ? "animate-ping" : ""} />
              <circle r="16" fill="#02040a" stroke="#22c55e" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="#22c55e" fontSize="10">⚙️</text>
              <text y="32" textAnchor="middle" fill="var(--text-main)" fontSize="9" fontWeight="bold">Predictive Ops</text>
            </g>
          </svg>


          {/* Floating node overlay thinking state card */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(5, 8, 22, 0.85)', padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: '#a855f7', fontWeight: 'bold' }}>
            ℹ Click node to inspect playbook
          </div>
        </div>
      )}

      {/* Selected Swarm Agent Response Panel */}
      {swarmResult && (
        <div className="fade-in" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          {activeNodeFocus === 'leader' && (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                👑 SWARM COORDINATOR EXEC SUMMARY
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold', lineHeight: '1.4' }}>
                {swarmResult.coordination_summary}
              </p>
            </div>
          )}

          {activeNodeFocus === 'linguistic' && (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                🗣️ LINGUISTIC MEDIATOR RESPONSE
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {swarmResult.linguistic_playbook}
              </p>
            </div>
          )}

          {activeNodeFocus === 'safety' && (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                🛡️ SAFETY TRIAGE PLAYBOOK
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {swarmResult.safety_playbook}
              </p>
            </div>
          )}

          {activeNodeFocus === 'routing' && (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#00c8ff', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                🧭 ACCESS ROUTER INSTRUCTIONS
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {swarmResult.routing_playbook}
              </p>
            </div>
          )}

          {activeNodeFocus === 'ops' && (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                ⚙️ PREDICTIVE OPS DIRECTIVES
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {swarmResult.ops_playbook}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SwarmOrchestrator;
