import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, ShieldAlert, Users, Compass, Activity, 
  HelpCircle, Volume2, Mic, MicOff, AlertTriangle, 
  Clock, Zap, CheckSquare, Sparkles, Send, MapPin
} from 'lucide-react';

export default function MissionCommander() {
  const [situation, setSituation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [typedReasoning, setTypedReasoning] = useState('');
  const [activeTab, setActiveTab] = useState('plan'); // plan, timeline, metrics

  const recognitionRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Quick Preset Situations
  const presets = [
    { label: "Gate 4 Overcrowded", text: "Gate 4 is overcrowded with transit passenger arrivals." },
    { label: "Heavy Rain approaching", text: "Heavy convective rain storm cell approaching outer perimeter." },
    { label: "Lost Child Section 102", text: "Lost 6-year-old child reported missing near Section 102 stands." },
    { label: "Medical Section C", text: "Medical emergency: fan collapsed with chest pain in Section C." },
    { label: "Metro Ingress Delay", text: "Metro line transit delayed by 15 minutes causing platform queue backup." },
    { label: "Parking Saturation", text: "Parking Lot A reached 100% capacity tailing back onto highway." },
    { label: "Concession Fire Alarm", text: "Fire alarm triggered at Concession Stand North." }
  ];

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        const speechText = e.results[0][0].transcript;
        setSituation(speechText);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setError('');
      recognitionRef.current.start();
    }
  };

  const handleAnalyze = async (textToAnalyze = situation) => {
    const targetText = textToAnalyze || situation;
    if (!targetText.trim()) {
      setError("Please input or speak an operational situation to command.");
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setResult(null);
    setTypedReasoning('');
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    try {
      const API_BASE_URL = window.location.origin.includes('5173') 
        ? `${window.location.protocol}//${window.location.hostname}:8000` 
        : '';
      const response = await fetch(`${API_BASE_URL}/api/mission-commander`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: targetText })
      });

      if (!response.ok) throw new Error("Tactical analysis failed");
      const data = await response.json();
      
      setResult(data);
      animateTyping(data.ai_reasoning);
    } catch (err) {
      console.error(err);
      setError("Failed to generate mission plan. Please verify server status.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Typing Effect for AI Reasoning
  const animateTyping = (text) => {
    let currentIdx = 0;
    setTypedReasoning('');
    typingTimerRef.current = setInterval(() => {
      if (currentIdx < text.length) {
        setTypedReasoning(prev => prev + text.charAt(currentIdx));
        currentIdx += 1;
      } else {
        clearInterval(typingTimerRef.current);
      }
    }, 15);
  };

  const getRiskColor = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'critical') return '#ef4444'; // Red
    if (l === 'high') return '#f97316'; // Orange
    if (l === 'medium') return '#a855f7'; // Violet/Purple
    return '#06b6d4'; // Cyan/Low
  };

  return (
    <div 
      className="glass-card mission-commander-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.75rem',
        background: 'rgba(11, 15, 25, 0.75)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 240, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Streaming holographic particles (CSS Background) */}
      <div 
        className="hologram-particles"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(0, 240, 255, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 240, 255, 0.15)', paddingBottom: '0.75rem', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="pulsing-orbit" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              position: 'absolute',
              width: '28px', height: '28px',
              border: '2px dashed #00f0ff',
              borderRadius: '50%',
              animation: 'spin 10s linear infinite'
            }} />
            <span style={{
              position: 'absolute',
              width: '36px', height: '36px',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              borderRadius: '50%',
              animation: 'spin-reverse 15s linear infinite'
            }} />
            <Sparkles size={20} style={{ color: '#00f0ff', filter: 'drop-shadow(0 0 8px #00f0ff)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0, background: 'linear-gradient(90deg, #00f0ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI MISSION COMMANDER
            </h2>
            <span style={{ fontSize: '0.7rem', color: '#00ffcc', letterSpacing: '0.15em', fontWeight: 'bold' }}>STADIUMOS OPERATION CENTER BRIDGE</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', border: '1px solid rgba(0, 255, 204, 0.3)', background: 'rgba(0, 255, 204, 0.05)', color: '#00ffcc', borderRadius: '4px', fontWeight: 'bold' }}>
            ● STATUS: ONLINE
          </span>
        </div>
      </div>

      {/* Input console */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                setSituation(preset.text);
                handleAnalyze(preset.text);
              }}
              style={{
                fontSize: '0.72rem',
                padding: '0.35rem 0.65rem',
                background: 'rgba(0, 240, 255, 0.03)',
                color: '#8beeff',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 240, 255, 0.08)';
                e.target.style.borderColor = 'rgba(0, 240, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 240, 255, 0.03)';
                e.target.style.borderColor = 'rgba(0, 240, 255, 0.15)';
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
          <input
            type="text"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Type or speak an operational crisis (e.g. Lost child in Row B, Rain Approaching)..."
            style={{
              flex: 1,
              padding: '0.9rem 1.2rem',
              paddingRight: '3rem',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#ffffff',
              border: '2px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '10px',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00f0ff'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0, 240, 255, 0.2)'}
          />
          
          <button
            onClick={toggleSpeech}
            aria-label={isListening ? "Stop voice command capture" : "Activate voice command capture"}
            style={{
              position: 'absolute',
              right: '65px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: isListening ? '#ef4444' : '#00f0ff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
          >
            {isListening ? (
              <MicOff size={20} className="flash-mic" style={{ filter: 'drop-shadow(0 0 5px #ef4444)' }} />
            ) : (
              <Mic size={20} />
            )}
          </button>

          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing}
            style={{
              padding: '0 1.25rem',
              background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={18} />
          </button>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}
      </div>

      {/* AI Thinking Animation */}
      {isAnalyzing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem', zIndex: 1 }}>
          <div className="quantum-loader" style={{ position: 'relative', width: '60px', height: '60px' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', border: '4px solid transparent', borderTopColor: '#00f0ff', borderBottomColor: '#00f0ff', borderRadius: '50%', animation: 'spin 1.5s linear infinite' }} />
            <div style={{ position: 'absolute', width: '70%', height: '70%', top: '15%', left: '15%', border: '4px solid transparent', borderLeftColor: '#a855f7', borderRightColor: '#a855f7', borderRadius: '50%', animation: 'spin-reverse 1.2s linear infinite' }} />
            <div style={{ position: 'absolute', width: '40%', height: '40%', top: '30%', left: '30%', backgroundColor: '#00ffcc', borderRadius: '50%', filter: 'blur(3px)', animation: 'pulse 1s infinite alternate' }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#00f0ff', letterSpacing: '0.15em', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
            PROCESSING MULTI-STEP TACTICAL REASONING...
          </span>
        </div>
      )}

      {/* Result Command Center Output Panel */}
      {result && !isAnalyzing && (
        <div 
          className="mission-results-grid animate-fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '1.5rem',
            zIndex: 1,
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Left Column: Summary, Reasoning, Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Situation Summary card */}
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '1.25rem',
                borderLeft: `5px solid ${getRiskColor(result.risk_level)}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#a855f7', letterSpacing: '0.1em', fontWeight: '900', textTransform: 'uppercase' }}>🚨 SITUATION OVERVIEW</span>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.15rem 0.5rem', 
                    background: `${getRiskColor(result.risk_level)}33`,
                    border: `1px solid ${getRiskColor(result.risk_level)}`,
                    color: getRiskColor(result.risk_level),
                    borderRadius: '4px',
                    fontWeight: '900',
                    letterSpacing: '0.05em'
                  }}
                >
                  {result.risk_level.toUpperCase()} RISK
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, color: '#ffffff', letterSpacing: '0.02em' }}>{result.situation_summary}</h3>
            </div>

            {/* AI Reasoning card */}
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: 'inset 0 0 15px rgba(0, 240, 255, 0.02)'
              }}
            >
              <h4 style={{ fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '0.1em', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>🧠 AI COGNITIVE REASONING</h4>
              <p 
                style={{ 
                  margin: 0, 
                  fontSize: '0.92rem', 
                  color: '#e2e8f0', 
                  lineHeight: '1.5',
                  fontFamily: 'Consolas, Monaco, monospace'
                }}
              >
                {typedReasoning}
                <span className="typing-cursor" style={{ color: '#00f0ff', fontWeight: 'bold' }}>|</span>
              </p>
            </div>

            {/* AI Recommendations Checklist */}
            <div>
              <h4 style={{ fontSize: '#0.75rem', color: '#00f0ff', letterSpacing: '0.1em', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckSquare size={16} /> Actionable Operations Checklist
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="recommendation-glow-card"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.95rem 1.15rem',
                      background: 'rgba(0, 240, 255, 0.02)',
                      border: '1px solid rgba(0, 240, 255, 0.12)',
                      borderRadius: '8px',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 0 0 rgba(0, 240, 255, 0)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.12)';
                      e.currentTarget.style.boxShadow = '0 0 0 rgba(0, 240, 255, 0)';
                    }}
                  >
                    <input 
                      type="checkbox" 
                      id={`chk-${idx}`}
                      style={{ 
                        marginTop: '0.2rem',
                        cursor: 'pointer',
                        accentColor: '#00f0ff'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <label 
                        htmlFor={`chk-${idx}`}
                        style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', cursor: 'pointer' }}
                      >
                        {rec.action}
                      </label>
                      <span style={{ fontSize: '0.78rem', color: '#88a4b8', fontStyle: 'italic' }}>
                        <strong>Why:</strong> {rec.why}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Confidence, Affected Zones, Metrics, Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Tab navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.25rem', gap: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('plan')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  background: activeTab === 'plan' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  color: activeTab === 'plan' ? '#00f0ff' : '#888',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                METRICS
              </button>
              <button 
                onClick={() => setActiveTab('timeline')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  background: activeTab === 'timeline' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  color: activeTab === 'timeline' ? '#00f0ff' : '#888',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                TACTICAL TIMELINE
              </button>
            </div>

            {activeTab === 'plan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Confidence Score meter */}
                <div 
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.72rem', color: '#a855f7', letterSpacing: '0.05em', textTransform: 'uppercase' }}>🎯 Confidence Rating</h5>
                    <span style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff' }}>{result.confidence_score}%</span>
                  </div>
                  <div style={{ position: 'relative', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="55" height="55" transform="rotate(-90)">
                      <circle cx="27.5" cy="27.5" r="22" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="27.5" cy="27.5" r="22" 
                        stroke="#a855f7" strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={138} 
                        strokeDashoffset={138 - (138 * result.confidence_score) / 100}
                        style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                      />
                    </svg>
                    <Zap size={14} style={{ position: 'absolute', color: '#a855f7', filter: 'drop-shadow(0 0 4px #a855f7)' }} />
                  </div>
                </div>

                {/* Stadium Impacts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#00ffcc', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>👥 Fans Affected</span>
                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{result.fans_impacted.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#00ffcc', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>⏳ Est. Resolution</span>
                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{result.predicted_resolution_time}</strong>
                  </div>
                </div>

                {/* Affected Zones */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#88a4b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    📍 AFFECTED STADIUM ZONES
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {result.affected_zones.map((zone, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(0, 240, 255, 0.08)',
                          border: '1px solid rgba(0, 240, 255, 0.25)',
                          color: '#00f0ff',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <MapPin size={10} />
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detailed Impact Sectors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem' }}>♿</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.72rem', color: '#fff' }}>Accessibility Vector</strong>
                      <span style={{ fontSize: '0.75rem', color: '#88a4b8' }}>{result.accessibility_impact}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>🚑</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.72rem', color: '#fff' }}>Medical Vector</strong>
                      <span style={{ fontSize: '0.75rem', color: '#88a4b8' }}>{result.medical_impact}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>🚔</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.72rem', color: '#fff' }}>Security Vector</strong>
                      <span style={{ fontSize: '0.75rem', color: '#88a4b8' }}>{result.security_impact}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>🚍</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.72rem', color: '#fff' }}>Transit Vector</strong>
                      <span style={{ fontSize: '0.75rem', color: '#88a4b8' }}>{result.transportation_impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div 
                className="timeline-container"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  paddingLeft: '0.75rem',
                  borderLeft: '2px solid rgba(168, 85, 247, 0.4)',
                  position: 'relative'
                }}
              >
                {result.timeline.map((step, idx) => (
                  <div 
                    key={idx}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.15rem'
                    }}
                  >
                    <span 
                      style={{
                        position: 'absolute',
                        left: '-17px',
                        top: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#a855f7',
                        boxShadow: '0 0 6px #a855f7'
                      }}
                    />
                    <strong style={{ fontSize: '0.8rem', color: '#fff' }}>
                      {step.split(':')[0]}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#88a4b8' }}>
                      {step.split(':').slice(1).join(':').strip ? step.split(':').slice(1).join(':').trim() : step}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
