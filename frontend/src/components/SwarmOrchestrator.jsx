import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import { API_BASE_URL } from '../constants';
import SwarmNetworkMap from './SwarmNetworkMap';

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
    <div className="glass-card swarm-card">
      <h3 className="card-title swarm-title">
        <Network size={22} className={isOrchestrating ? "animate-spin text-purple-400" : "text-purple-400"} />
        HIERARCHICAL MULTI-AGENT SWARM ORCHESTRATOR
      </h3>

      <p className="swarm-desc">
        Solve multi-dimensional stadium emergencies by orchestrating a swarm of specialized sub-agents working in parallel, led by a Swarm Coordinator.
      </p>

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

      <div className="swarm-input-row">
        <input 
          type="text"
          value={eventDesc}
          onChange={(e) => setEventDesc(e.target.value)}
          placeholder="Describe a complex multi-dimensional stadium crisis here..."
          className="swarm-input"
        />
        <button 
          onClick={() => runSwarmCoordination(eventDesc)}
          className="btn swarm-run-btn"
          disabled={isOrchestrating || !eventDesc.trim()}
        >
          {isOrchestrating ? 'Orchestrating...' : 'Run Swarm'}
        </button>
      </div>

      {(isOrchestrating || swarmResult) && (
        <div className="swarm-status-bar">
          <div className="status-dot animate-ping" style={{ backgroundColor: orchestratingStep === 4 ? '#22c55e' : '#a855f7' }}></div>
          <span className="swarm-status-text" style={{ color: orchestratingStep === 4 ? '#22c55e' : '#c084fc' }}>
            {getStepText()}
          </span>
        </div>
      )}

      {(isOrchestrating || swarmResult) && (
        <SwarmNetworkMap 
          orchestratingStep={orchestratingStep}
          activeNodeFocus={activeNodeFocus}
          setActiveNodeFocus={setActiveNodeFocus}
        />
      )}

      {swarmResult && (
        <div className="fade-in swarm-agent-panel">
          {activeNodeFocus === 'leader' && (
            <div>
              <span className="swarm-agent-label" style={{ color: '#c084fc' }}>
                👑 SWARM COORDINATOR EXEC SUMMARY
              </span>
              <p className="swarm-leader-text">
                {swarmResult.coordination_summary}
              </p>
            </div>
          )}

          {activeNodeFocus === 'linguistic' && (
            <div>
              <span className="swarm-agent-label" style={{ color: '#c084fc' }}>
                🗣️ LINGUISTIC MEDIATOR RESPONSE
              </span>
              <p className="swarm-agent-text">
                {swarmResult.linguistic_playbook}
              </p>
            </div>
          )}

          {activeNodeFocus === 'safety' && (
            <div>
              <span className="swarm-agent-label" style={{ color: '#ef4444' }}>
                🛡️ SAFETY TRIAGE PLAYBOOK
              </span>
              <p className="swarm-agent-text">
                {swarmResult.safety_playbook}
              </p>
            </div>
          )}

          {activeNodeFocus === 'routing' && (
            <div>
              <span className="swarm-agent-label" style={{ color: '#00c8ff' }}>
                🧭 ACCESS ROUTER INSTRUCTIONS
              </span>
              <p className="swarm-agent-text">
                {swarmResult.routing_playbook}
              </p>
            </div>
          )}

          {activeNodeFocus === 'ops' && (
            <div>
              <span className="swarm-agent-label" style={{ color: '#22c55e' }}>
                ⚙️ PREDICTIVE OPS DIRECTIVES
              </span>
              <p className="swarm-agent-text">
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
