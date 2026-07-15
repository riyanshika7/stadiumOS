import React, { useState } from 'react';
import { Sliders, HelpCircle, AlertTriangle, CheckCircle, Activity, Sparkles } from 'lucide-react';

export default function WhatIfSimulator() {
  const [attendance, setAttendance] = useState(60000);
  const [activeGates, setActiveGates] = useState(4);
  const [weather, setWeather] = useState('sunny');
  const [securityLevel, setSecurityLevel] = useState('standard');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    
    // Simulate short calculation delay for premium sci-fi UX feel
    setTimeout(() => {
      // Predictive heuristic calculation
      const baseRiskScore = (attendance / 90000) * 50;
      const gateDeduction = (4 - activeGates) * 15;
      const weatherModifier = weather === 'rain' ? 20 : weather === 'wind' ? 10 : weather === 'snow' ? 25 : 0;
      const securityModifier = securityLevel === 'critical' ? 30 : securityLevel === 'elevated' ? 15 : 0;
      
      const totalScore = Math.min(100, Math.max(0, baseRiskScore + gateDeduction + weatherModifier + securityModifier));
      
      let riskLevel = 'LOW';
      let riskColor = '#22c55e';
      let entryTime = 12; // minutes
      let recommendations = [];

      if (totalScore > 75) {
        riskLevel = 'CRITICAL';
        riskColor = '#ef4444';
        entryTime = Math.round(55 + (totalScore - 75) * 1.2);
        recommendations = [
          "⚠️ Activate Emergency Bypass Route 2 immediately.",
          "🗣️ Dispatch Linguistic Mediators to Gate C Concourse.",
          "👮 Redeploy 12 standby operators from Concourse East to West.",
          "📢 Broadcast real-time crowd redirection to mobile apps."
        ];
      } else if (totalScore > 50) {
        riskLevel = 'HIGH';
        riskColor = '#f59e0b';
        entryTime = Math.round(30 + (totalScore - 50) * 1);
        recommendations = [
          "🟡 Monitor Gate C ingress bottlenecks.",
          "🧭 Plan alternative accessibility routes.",
          "👮 Increase security staffing at Gate A & D."
        ];
      } else if (totalScore > 25) {
        riskLevel = 'MODERATE';
        riskColor = '#eab308';
        entryTime = Math.round(18 + (totalScore - 25) * 0.5);
        recommendations = [
          "🟢 Smooth ingress flow. Keep current staffing levels.",
          "📢 Monitor weather updates for wet ramp warnings."
        ];
      } else {
        riskLevel = 'LOW';
        riskColor = '#22c55e';
        entryTime = Math.round(8 + totalScore * 0.2);
        recommendations = [
          "✓ All systems optimal. Normal flow patterns verified."
        ];
      }

      setSimulationResult({
        score: Math.round(totalScore),
        riskLevel,
        riskColor,
        entryTime,
        recommendations
      });
      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="glass-card" style={{ 
      border: '2px solid rgba(70, 243, 255, 0.4)', 
      boxShadow: '0 0 25px rgba(70, 243, 255, 0.15)',
      background: 'radial-gradient(ellipse at top left, rgba(70, 243, 255, 0.08), transparent 70%), var(--bg-card)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h3 className="card-title" style={{ color: '#46F3FF', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(70, 243, 255, 0.2)', paddingBottom: '0.5rem' }}>
        <Sliders size={22} className="text-[#46F3FF] animate-pulse" />
        AI "WHAT-IF" CONCOURSE CONGESTION SIMULATOR
      </h3>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        Simulate matchday environmental scenarios and security levels to predict potential gate congestion risks and generate explainable proactive directives.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
        {/* Expected Attendance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
            <span>👥 Expected Attendance</span>
            <span style={{ color: '#46F3FF' }}>{(attendance / 1000).toFixed(0)}k fans</span>
          </label>
          <input 
            type="range" 
            min="10000" 
            max="90000" 
            step="5000"
            value={attendance} 
            onChange={(e) => setAttendance(Number(e.target.value))} 
            style={{ width: '100%', accentColor: '#46F3FF', cursor: 'pointer' }}
          />
        </div>

        {/* Active Ingress Gates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
            <span>🏟️ Active Ingress Gates</span>
            <span style={{ color: '#46F3FF' }}>{activeGates} / 4 gates</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="4" 
            step="1"
            value={activeGates} 
            onChange={(e) => setActiveGates(Number(e.target.value))} 
            style={{ width: '100%', accentColor: '#46F3FF', cursor: 'pointer' }}
          />
        </div>

        {/* Weather Conditions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            🌧️ Weather Conditions
          </label>
          <select 
            value={weather} 
            onChange={(e) => setWeather(e.target.value)}
            style={{ background: 'rgba(5, 8, 22, 0.8)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.4rem', borderRadius: '4px', outline: 'none' }}
          >
            <option value="sunny">Sunny / Optimal</option>
            <option value="rain">Heavy Rain / Slippery Ramps</option>
            <option value="wind">Severe Wind Warn</option>
            <option value="snow">Snow / Ice Accumulation</option>
          </select>
        </div>

        {/* Security Alert Level */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            👮 Security Alert Level
          </label>
          <select 
            value={securityLevel} 
            onChange={(e) => setSecurityLevel(e.target.value)}
            style={{ background: 'rgba(5, 8, 22, 0.8)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.4rem', borderRadius: '4px', outline: 'none' }}
          >
            <option value="standard">Level 1 - Standard</option>
            <option value="elevated">Level 2 - Elevated</option>
            <option value="critical">Level 3 - Critical Search</option>
          </select>
        </div>
      </div>

      <button 
        onClick={runSimulation}
        disabled={isSimulating}
        className="btn btn-primary"
        style={{ 
          background: 'linear-gradient(135deg, #0070f3, #46F3FF)', 
          border: 'none', 
          padding: '0.65rem', 
          fontWeight: 'bold', 
          marginTop: '0.5rem',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          cursor: 'pointer',
          borderRadius: '6px'
        }}
      >
        <Sparkles size={16} />
        {isSimulating ? 'Computing Neural Predictors...' : 'Run Simulation Analysis'}
      </button>

      {/* Simulation Result Area */}
      {simulationResult && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(70, 243, 255, 0.2)', paddingTop: '1rem' }}>
          {/* Left gauge / metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} style={{ color: simulationResult.riskColor }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Simulated Congestion Risk</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: '900', color: simulationResult.riskColor }}>{simulationResult.riskLevel}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(Score: {simulationResult.score}/100)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Entry Delay:</span>
                <span style={{ fontWeight: 'bold', color: '#46F3FF' }}>{simulationResult.entryTime} mins</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>System SLA Status:</span>
                <span style={{ fontWeight: 'bold', color: simulationResult.score > 75 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {simulationResult.score > 75 ? 'BREACH RISK' : 'OPTIMAL'}
                </span>
              </div>
            </div>

            {/* Simple Animated Gauge Meter */}
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${simulationResult.score}%`, background: simulationResult.riskColor, transition: 'width 0.5s ease-out' }}></div>
            </div>
          </div>

          {/* Right recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>proactive directives dispatch</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {simulationResult.recommendations.map((rec, i) => (
                <div key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${simulationResult.riskColor}`, padding: '0.4rem', borderRadius: '2px', color: 'var(--text-main)' }}>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
