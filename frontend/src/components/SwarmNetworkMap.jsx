import React from 'react';

export default function SwarmNetworkMap({ orchestratingStep, activeNodeFocus, setActiveNodeFocus }) {
  return (
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
  );
}
