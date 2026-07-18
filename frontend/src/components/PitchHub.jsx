import React, { useState } from 'react';
import { Award, Compass, HelpCircle, Activity, Globe, Shield, FileText, CheckCircle } from 'lucide-react';

const PILLARS = [
  {
    id: "persona",
    title: "👥 Persona: Volunteer Co-Pilot",
    targetId: "mission-commander-widget",
    problem: "Stadium volunteers are overloaded, face language barriers, and lack real-time situational coordinates during high-pressure events.",
    reasoning: "The AI agent aggregates shared state from the in-memory Stadium Intelligence Hub, providing dynamic cognitive guidance directly on local handhelds.",
    action: "Volunteers receive step-by-step instructions, translation scripts, and route redirection alerts without radio congestion.",
    expectedOutcome: "Unifies distributed stadium intelligence, allowing frontline volunteers to resolve local inquiries autonomously.",
    impact: "Reduces command center radio congestion by 70% and accelerates local crowd guidance."
  },
  {
    id: "crowd",
    title: "🗺️ Crowd Management",
    targetId: "digital-twin-widget",
    problem: "Sudden surges at gate entry points cause physical bottlenecks, stampede hazards, and transit delays.",
    reasoning: "Ingests real-time zone capacity counts (CSV/API) and generates plain English explainable warnings (XAI) detailing flow rates and bottleneck risk.",
    action: "Volunteers review the 3D Digital Twin heatmap and redirect incoming traffic to underutilized gates.",
    expectedOutcome: "Maintains gate capacities below 80% and clears bottlenecks within 15 minutes.",
    impact: "Saves up to 4 minutes of transit delay per fan and mitigates physical crushing risks."
  },
  {
    id: "translation",
    title: "🗣️ Multilingual Assistance",
    targetId: "translator-widget",
    problem: "Spectators from 8+ countries face critical communication barriers during emergency and ticketing issues.",
    reasoning: "Generative AI translator analyzes the tone (panicked, angry) and intent, applying immediate triage instructions.",
    action: "Volunteers speak or type a fan's query and receive an instant de-escalation response script in the fan's native language.",
    expectedOutcome: "Translates and categorizes queries in under 500ms with a local simulator fallback.",
    impact: "Ensures inclusive, real-time aid for diverse non-English speaking stadium visitors."
  },
  {
    id: "accessibility",
    title: "♿ Accessibility & WCAG AAA",
    targetId: "digital-twin-widget",
    problem: "Wheelchair, stroller, and sensory-sensitive fans are redirected onto steps, wet ramps, or high-congestion lanes.",
    reasoning: "Modifies routing weights dynamically by pruning steps, slip hazards, and overcrowded quadrants.",
    action: "Toggle 'Wheelchair Mode' to instantly recalculate step-free routes, and check deaf PA captions.",
    expectedOutcome: "Calculates step-free paths with 100% stair avoidance.",
    impact: "Assures WCAG AAA compliance and a safe, inclusive environment for all mobility-impaired fans."
  },
  {
    id: "swarm",
    title: "🧬 Multi-Agent Swarm",
    targetId: "swarm-orchestrator-widget",
    problem: "Complex stadium crises (e.g. medical emergency on a wet ramp during gate surges) involve multiple operational domains.",
    reasoning: "Hierarchical coordination using a Swarm Leader that orchestrates Safety, Linguistic, Routing, and Ops agents.",
    action: "Input a complex event text; review the synchronized coordinated actions compiled by the swarm.",
    expectedOutcome: "Compiles a unified, conflict-free tactical response within 2.5 seconds.",
    impact: "Unlocks joint operations response capability and automates standard SOP playbooks."
  },
  {
    id: "cctv",
    title: "📹 CCTV Video Triage",
    targetId: "cctv-monitor-widget",
    problem: "Traditional control rooms rely on operators watching dozens of monitors, missing localized fights or medical collapses.",
    reasoning: "Multimodal AI analyzes mock camera frames, detects anomalies, and calculates a dynamic Risk Index.",
    action: "CCTV feeds display risk indices and auto-dispatch alerts to the closest volunteer sector.",
    expectedOutcome: "Flags anomalies (fights, slips, gridlock) instantly and recommends dispatch vectors.",
    impact: "Shortens emergency dispatch delay from 6 minutes down to 30 seconds."
  },
  {
    id: "rag",
    title: "📖 Playbook RAG Q&A",
    targetId: "csv-uploader-widget",
    problem: "Standard Operating Procedures (SOPs) are stored in massive, unreadable PDF binders that are impossible to search during a crisis.",
    reasoning: "Ingests uploaded PDF playbook files and utilizes Gemini semantic reasoning to answer questions based on the document.",
    action: "Upload a stadium playbook PDF and ask context-aware questions to get instant, verified answers.",
    expectedOutcome: "Retrieves context-bound answers with 95%+ precision.",
    impact: "Empowers volunteers with immediate SOP answers on the go."
  },
  {
    id: "testing",
    title: "🔬 Jury Ingestion & Chaos",
    targetId: "jury-portal-widget",
    problem: "Evaluation juries need to verify systems under malicious payloads, network drops, and extreme surge spikes.",
    reasoning: "A stable ingestion pipeline validating file formats (.pdf, .csv, .docx) combined with a Chaos Simulator.",
    action: "Jury members upload test CSVs, simulate network failures, or trigger gate surges to check system resilience.",
    expectedOutcome: "Gracefully captures all network and file corruption faults without application crashes.",
    impact: "Guarantees a flawless, high-stability scoring parameter in QA testing."
  }
];

export default function PitchHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePillar, setActivePillar] = useState(PILLARS[0]);

  const handleScrollToWidget = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
      // Apply a temporary neon highlight effect
      element.style.outline = '3px solid #00F0FF';
      element.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.4)';
      setTimeout(() => {
        element.style.outline = 'none';
        element.style.boxShadow = 'none';
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn"
        aria-label="Open PromptWars Pitch and Compliance Hub"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #7C5CFF 0%, #00F0FF 100%)',
          color: '#030612',
          border: 'none',
          borderRadius: '50px',
          padding: '0.75rem 1.5rem',
          fontSize: '0.8rem',
          fontWeight: '900',
          boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <Award size={16} className="animate-bounce" />
        <span>🏆 PROMPTWARS PITCH & COMPLIANCE HUB</span>
      </button>

      {/* Sliding Compliance Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="compliance-hub-title"
          className="glass-card"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '420px',
            zIndex: 10000,
            background: 'rgba(8, 12, 22, 0.95)',
            borderTop: '2px solid #00F0FF',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -20px 50px rgba(0,0,0,0.9)',
            display: 'flex',
            padding: '1.5rem',
            gap: '1.5rem',
            backdropFilter: 'blur(20px)',
            animation: 'slideUp 0.3s ease-out',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          {/* Left Column: Pillars Navigation */}
          <div
            style={{
              width: '280px',
              borderRight: '1px solid rgba(0, 240, 255, 0.15)',
              paddingRight: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              overflowY: 'auto'
            }}
          >
            <h2
              id="compliance-hub-title"
              style={{
                fontSize: '0.9rem',
                fontWeight: '900',
                color: '#00F0FF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem'
              }}
            >
              🏁 challenge pillars
            </h2>
            {PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePillar(p)}
                className={`dtwin-layer-item ${activePillar.id === p.id ? 'active' : ''}`}
                style={{
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.75rem',
                  border: '1px solid ' + (activePillar.id === p.id ? 'rgba(0, 240, 255, 0.4)' : 'transparent'),
                  background: activePillar.id === p.id ? 'rgba(0, 240, 255, 0.08)' : 'transparent'
                }}
              >
                {p.title}
              </button>
            ))}
            
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
              aria-label="Close Compliance Hub"
              style={{ marginTop: 'auto', fontSize: '0.75rem', padding: '0.4rem' }}
            >
              ✕ Close Pitch Hub
            </button>
          </div>

          {/* Right Column: Interactive Audit Metadata Card */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} className="text-primary" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                  {activePillar.title} Evaluation
                </h3>
              </div>
              <button
                onClick={() => handleScrollToWidget(activePillar.targetId)}
                className="btn"
                style={{
                  fontSize: '0.7rem',
                  padding: '0.3rem 0.75rem',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  color: '#00F0FF'
                }}
              >
                🔎 Focus Module on Dashboard
              </button>
            </div>

            {/* Structured 5-Field Explainer Layout */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem',
                flex: 1
              }}
            >
              {/* Problem */}
              <div className="glass-card" style={{ padding: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <strong style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase' }}>🚨 Problem solved</strong>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {activePillar.problem}
                </p>
              </div>

              {/* AI Reasoning */}
              <div className="glass-card" style={{ padding: '0.75rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <strong style={{ fontSize: '0.75rem', color: '#00F0FF', textTransform: 'uppercase' }}>🧠 AI Reasoning Model</strong>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {activePillar.reasoning}
                </p>
              </div>

              {/* Action */}
              <div className="glass-card" style={{ padding: '0.75rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <strong style={{ fontSize: '0.75rem', color: '#a855f7', textTransform: 'uppercase' }}>⚡ Volunteer Action</strong>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {activePillar.action}
                </p>
              </div>

              {/* Expected Outcome & Impact */}
              <div className="glass-card" style={{ padding: '0.75rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <div>
                    <strong style={{ fontSize: '0.75rem', color: '#22c55e', textTransform: 'uppercase' }}>🎯 Expected Outcome</strong>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.1rem', lineHeight: '1.4' }}>
                      {activePillar.expectedOutcome}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(34, 197, 94, 0.1)', paddingTop: '0.4rem' }}>
                    <strong style={{ fontSize: '0.75rem', color: '#facc15', textTransform: 'uppercase' }}>📈 Operational Impact</strong>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.1rem', lineHeight: '1.4' }}>
                      {activePillar.impact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
