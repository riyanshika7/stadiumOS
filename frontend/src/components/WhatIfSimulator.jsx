import React, { useState } from 'react';
import { Sliders, AlertTriangle, CheckCircle, Activity, Sparkles } from 'lucide-react';

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
    <div className="glass-card simulator-card">
      <h3 className="card-title simulator-title">
        <Sliders size={22} className="text-[#46F3FF] animate-pulse" />
        AI "WHAT-IF" CONCOURSE CONGESTION SIMULATOR
      </h3>
      
      <p className="simulator-desc">
        Simulate matchday environmental scenarios and security levels to predict potential gate congestion risks and generate explainable proactive directives.
      </p>

      <div className="simulator-controls-grid">
        <div className="simulator-control-group">
          <label className="simulator-control-label">
            <span>👥 Expected Attendance</span>
            <span className="simulator-control-value">{(attendance / 1000).toFixed(0)}k fans</span>
          </label>
          <input 
            type="range" 
            min="10000" 
            max="90000" 
            step="5000"
            value={attendance} 
            onChange={(e) => setAttendance(Number(e.target.value))} 
            className="simulator-range-input"
          />
        </div>

        <div className="simulator-control-group">
          <label className="simulator-control-label">
            <span>🏟️ Active Ingress Gates</span>
            <span className="simulator-control-value">{activeGates} / 4 gates</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="4" 
            step="1"
            value={activeGates} 
            onChange={(e) => setActiveGates(Number(e.target.value))} 
            className="simulator-range-input"
          />
        </div>

        <div className="simulator-control-group">
          <label className="simulator-control-label">
            🌧️ Weather Conditions
          </label>
          <select 
            value={weather} 
            onChange={(e) => setWeather(e.target.value)}
            className="simulator-select"
          >
            <option value="sunny">Sunny / Optimal</option>
            <option value="rain">Heavy Rain / Slippery Ramps</option>
            <option value="wind">Severe Wind Warn</option>
            <option value="snow">Snow / Ice Accumulation</option>
          </select>
        </div>

        <div className="simulator-control-group">
          <label className="simulator-control-label">
            👮 Security Alert Level
          </label>
          <select 
            value={securityLevel} 
            onChange={(e) => setSecurityLevel(e.target.value)}
            className="simulator-select"
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
        className="btn simulator-run-btn"
      >
        <Sparkles size={16} />
        {isSimulating ? 'Computing Neural Predictors...' : 'Run Simulation Analysis'}
      </button>

      {simulationResult && (
        <div className="fade-in simulator-results-grid">
          <div className="simulator-metrics-col">
            <div className="simulator-metric-header">
              <Activity size={16} style={{ color: simulationResult.riskColor }} />
              <span className="simulator-metric-label">Simulated Congestion Risk</span>
            </div>

            <div className="simulator-risk-display">
              <span className="simulator-risk-level" style={{ color: simulationResult.riskColor }}>{simulationResult.riskLevel}</span>
              <span className="simulator-risk-score">(Score: {simulationResult.score}/100)</span>
            </div>

            <div className="simulator-metric-rows">
              <div className="simulator-metric-row">
                <span className="simulator-metric-key">Estimated Entry Delay:</span>
                <span className="simulator-metric-val">{simulationResult.entryTime} mins</span>
              </div>
              <div className="simulator-metric-row">
                <span className="simulator-metric-key">System SLA Status:</span>
                <span style={{ fontWeight: 'bold', color: simulationResult.score > 75 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {simulationResult.score > 75 ? 'BREACH RISK' : 'OPTIMAL'}
                </span>
              </div>
            </div>

            <div className="simulator-gauge">
              <div className="simulator-gauge-fill" style={{ width: `${simulationResult.score}%`, background: simulationResult.riskColor }}></div>
            </div>
          </div>

          <div className="simulator-directives-col">
            <span className="simulator-directives-label">proactive directives dispatch</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {simulationResult.recommendations.map((rec, i) => (
                <div key={i} className="simulator-directive-item" style={{ borderLeft: `2px solid ${simulationResult.riskColor}` }}>
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
