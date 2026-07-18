import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { Play, Gamepad2, Github, ExternalLink, Activity, Terminal, Shield, Zap, Sparkles } from 'lucide-react';
import '../landing.css';
import TypingText from './TypingText';
import StatsBanner from './StatsBanner';
import FeaturesSection from './FeaturesSection';

const DigitalTwinStadium = React.lazy(() => import('./DigitalTwinStadium'));

export function handleButtonRipple(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

export default function LandingPage({ onEnterConsole }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScenario, setActiveScenario] = useState('normal');
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero-anchor');

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [swarmPing, setSwarmPing] = useState(null);
  const [isSwarmOptimizing, setIsSwarmOptimizing] = useState(false);
  const [swarmOptimized, setSwarmOptimized] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [agentPings, setAgentPings] = useState({ mediator: 15, triage: 8, router: 22, ops: 12 });
  const [logs, setLogs] = useState([
    "[SYS] Initialization of swarm nodes complete.",
    "[MEDIATOR] Pre-caching Spanish, Spanish (Mexico), and Portuguese translation models.",
    "[ROUTER] Mapping step-free coordinates for MetLife Section 102."
  ]);
  const [sensorsHUD, setSensorsHUD] = useState(true);
  const [dronesActive, setDronesActive] = useState(true);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [stadiumOccupancy, setStadiumOccupancy] = useState(82);
  const [diagnosticProgress, setDiagnosticProgress] = useState(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [isSyncingCache, setIsSyncingCache] = useState(false);

  // Boot sequence states
  const [bootProgress, setBootProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [stadiumBrightness, setStadiumBrightness] = useState(0.15);

  const lenisRef = useRef(null);

  const bootMessages = [
    "Initializing StadiumOS Kernel v4.2.1-prod...",
    "Connecting Swarm Intelligence Agents (Mediator, Triage, Router)...",
    "Loading 3D Digital Twin Geometry & Venue Grid...",
    "Synchronizing CCTV Feeds & Ambient Sensor Networks...",
    "Calibrating Weather-Aware Dijkstra Pathing Matrices...",
    "Mission Control Online. Activating Holographic HUD."
  ];

  // 1. Initializing Boot sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setBootDone(true);
          }, 800);
          return 100;
        }
        
        // Random realistic loading increments
        const increment = Math.floor(Math.random() * 8) + 4;
        const nextVal = Math.min(100, prev + increment);
        
        if (nextVal < 20) setBootPhase(0);
        else if (nextVal < 40) setBootPhase(1);
        else if (nextVal < 60) setBootPhase(2);
        else if (nextVal < 80) setBootPhase(3);
        else if (nextVal < 99) setBootPhase(4);
        else setBootPhase(5);

        return nextVal;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  // 2. Sequential Lighting Power-On simulation
  useEffect(() => {
    if (bootDone) {
      setTimeout(() => setStadiumBrightness(0.35), 200);
      setTimeout(() => setStadiumBrightness(0.65), 500);
      setTimeout(() => setStadiumBrightness(0.85), 800);
      setTimeout(() => setStadiumBrightness(1.0), 1200);
    }
  }, [bootDone]);

  // 3. Lenis scroll setup
  useEffect(() => {
    if (!bootDone) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let animFrameId = null;
    function raf(time) {
      lenis.raf(time);
      animFrameId = requestAnimationFrame(raf);
    }
    animFrameId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [bootDone]);

  // 4. Scroll progress & Section Tracking
  useEffect(() => {
    if (!bootDone) return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
        setIsNavScrolled(window.scrollY > 50);
      }

      const sections = ['hero-anchor', 'digital-twin-details', 'sandbox-console', 'features-section'];
      let currentActive = 'hero-anchor';
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
            currentActive = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bootDone]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const handlePingSwarm = () => {
    const pingTime = Math.floor(Math.random() * 15) + 5;
    setSwarmPing(pingTime);
    setAgentPings({
      mediator: Math.floor(Math.random() * 10) + 10,
      triage: Math.floor(Math.random() * 6) + 5,
      router: Math.floor(Math.random() * 15) + 15,
      ops: Math.floor(Math.random() * 8) + 8
    });
    setLogs(prev => [
      ...prev,
      `[SWARM] Broadcast ping: success in ${pingTime}ms. All nodes responsive.`
    ]);
  };

  const handleOptimizeSwarm = () => {
    setIsSwarmOptimizing(true);
    setLogs(prev => [...prev, "[SYS] Initiating swarm load-balancer & thread optimization..."]);
    setTimeout(() => {
      setIsSwarmOptimizing(false);
      setSwarmOptimized(true);
      setLogs(prev => [
        ...prev,
        "[SYS] Agent allocation balanced. CPU overhead down 18%, memory leak-checked: OK."
      ]);
    }, 1200);
  };

  const handleRunDiagnostic = () => {
    setDiagnosticProgress(0);
    setDiagnosticLogs(["[DIAG] Starting core systems self-diagnosis..."]);
    
    const steps = [
      { progress: 20, log: "[DIAG] Testing Linguistic Mediator model registry... OK" },
      { progress: 50, log: "[DIAG] Calibrating Safety Triage risk multipliers... OK" },
      { progress: 75, log: "[DIAG] Computing weather-Dijkstra graph index... OK" },
      { progress: 100, log: "[DIAG] System diagnosis COMPLETE. 0 issues detected." }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setDiagnosticProgress(s.progress);
        setDiagnosticLogs(prev => [...prev, s.log]);
      }, (idx + 1) * 600);
    });
  };

  const handleFlushCache = () => {
    setIsSyncingCache(true);
    setTimeout(() => {
      setIsSyncingCache(false);
      alert("Offline cache flushed successfully. MetLife local SQLite replica fully synchronized with master cloud ledger.");
    }, 1000);
  };
  // Magnetic / Floating Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 12 } }
  };

  return (
    <div className="landing-body animated-gradient-bg min-h-screen relative w-full select-none overflow-x-hidden">
      
      {/* ⚡ Cinematic Loading Console Overlay */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div 
            className="boot-sequence-overlay"
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.8, ease: 'easeInOut' } }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#02040c',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              color: '#46F3FF',
              fontFamily: 'Consolas, Monaco, monospace'
            }}
          >
            {/* Holographic matrix background scan lines */}
            <div className="scanlines" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%', zIndex: 1, pointerEvents: 'none' }} />
            
            {/* Logo materializing from glow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 2, marginBottom: '3rem' }}>
              <motion.img 
                src="/stadiumos.png" 
                alt="StadiumOS Logo" 
                style={{
                  height: '80px',
                  filter: `drop-shadow(0 0 ${bootProgress / 4}px rgba(70, 243, 255, 0.8))`
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '0.2em', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                STADIUMOS
              </h1>
            </div>

            {/* Console output messages */}
            <div 
              style={{
                width: '100%',
                maxWidth: '650px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(70, 243, 255, 0.2)',
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                zIndex: 2,
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(70, 243, 255, 0.15)', paddingBottom: '0.5rem', fontSize: '0.8rem', color: '#88a4b8' }}>
                <span>🛰️ SYS_BOOT // CORE_BRIDGE_ONLINE</span>
                <span>SECURE MODE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#a5f3fc', minHeight: '80px' }}>
                <div style={{ color: '#00ffcc' }}>&gt; {bootMessages[bootPhase]}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Establishing RAG Playbook node caches... OK</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mounting Rate Limiters & Security Headers... OK</div>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${bootProgress}%`, height: '100%', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', transition: 'width 0.1s ease-out' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', width: '40px', textAlign: 'right' }}>{bootProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Stadium Canvas */}
      <React.Suspense fallback={<div className="landing-vignette-overlay" style={{ background: '#02040a' }} />}>
        <div style={{ filter: `brightness(${stadiumBrightness})`, transition: 'filter 1.2s cubic-bezier(0.25, 1, 0.5, 1)' }}>
          <DigitalTwinStadium scrollProgress={activeScenario === 'congestion' ? 0.45 : activeScenario === 'emergency' ? 0.85 : scrollProgress} />
        </div>
      </React.Suspense>
      
      {/* Aurora overlay glow grid */}
      <div className="landing-vignette-overlay" style={{ background: 'radial-gradient(circle at 50% 30%, transparent 40%, rgba(3, 6, 18, 0.95) 90%)' }} />

      {/* Futuristic Background Beams / Particle Starfield */}
      <div 
        className="aurora-beams" 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 10% 20%, rgba(124, 92, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(70, 243, 255, 0.05) 0%, transparent 45%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Premium Apple Navigation */}
      <nav className={`landing-nav ${isNavScrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo">
          <img src="/stadiumos.png" alt="StadiumOS Logo" />
          <span>StadiumOS</span>
        </div>
        <div className="landing-nav-links">
          <button 
            type="button"
            className={`landing-nav-link ${activeSection === 'hero-anchor' && !activeDropdown ? 'active' : ''}`} 
            onClick={() => { setActiveDropdown(null); scrollToSection('hero-anchor'); }}
            aria-label="Scroll to home section"
          >
            System Home
          </button>
          <button 
            type="button"
            className={`landing-nav-link ${activeDropdown === 'swarm' ? 'active' : ''}`} 
            onClick={() => setActiveDropdown(prev => prev === 'swarm' ? null : 'swarm')}
            aria-expanded={activeDropdown === 'swarm'}
            aria-controls="swarm-dropdown-panel"
            aria-label="Toggle AI Swarm operational panel"
          >
            AI Swarm
          </button>
          <button 
            type="button"
            className={`landing-nav-link ${activeDropdown === 'twin' ? 'active' : ''}`} 
            onClick={() => setActiveDropdown(prev => prev === 'twin' ? null : 'twin')}
            aria-expanded={activeDropdown === 'twin'}
            aria-controls="twin-dropdown-panel"
            aria-label="Toggle Interactive Twin controls panel"
          >
            Interactive Twin
          </button>
          <button 
            type="button"
            className={`landing-nav-link ${activeDropdown === 'ops' ? 'active' : ''}`} 
            onClick={() => setActiveDropdown(prev => prev === 'ops' ? null : 'ops')}
            aria-expanded={activeDropdown === 'ops'}
            aria-controls="ops-dropdown-panel"
            aria-label="Toggle Operational Modules panel"
          >
            Operational Modules
          </button>
          <button 
            className="btn-secondary-neon"
            onClick={() => {
              caches.keys().then((names) => {
                for (let name of names) {
                  caches.delete(name);
                }
              });
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((regs) => {
                  for (let reg of regs) {
                    reg.unregister();
                  }
                });
              }
              setTimeout(() => {
                window.location.reload(true);
              }, 400);
            }}
            style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', marginRight: '0.5rem' }}
            title="Clears all service worker caches and performs a hard reload"
          >
            🔄 Reset Cache
          </button>
          <button className="btn-neon-cta" onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 300); }}>
            Enter Console <Zap size={14} style={{ fill: '#ffffff' }} />
          </button>
        </div>
      </nav>

      {/* 🚀 Futuristic Interactive Dropdown Panels */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div 
            id={activeDropdown === 'swarm' ? 'swarm-dropdown-panel' : activeDropdown === 'twin' ? 'twin-dropdown-panel' : 'ops-dropdown-panel'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="landing-dropdown-panel sandbox-card-glass morph-card-glow"
            style={{
              position: 'fixed',
              top: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '92%',
              maxWidth: '920px',
              background: 'rgba(5, 8, 22, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(70, 243, 255, 0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 30px rgba(70, 243, 255, 0.08)',
              borderRadius: '16px',
              zIndex: 9999,
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              color: '#ffffff'
            }}
          >
            {/* Header row with Title and Close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(70, 243, 255, 0.15)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em', color: '#46F3FF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {activeDropdown === 'swarm' && "🛰️ AI AGENT SWARM DEPLOYMENT CONTROL"}
                  {activeDropdown === 'twin' && "📡 3D DIGITAL TWIN REAL-TIME CONTROLS"}
                  {activeDropdown === 'ops' && "⚙️ OPERATIONAL CORE SUBSYSTEM DIAGNOSTICS"}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#88a4b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeDropdown === 'swarm' && "Status: Active Sync // 4 Agent sub-nodes running"}
                  {activeDropdown === 'twin' && `Status: Connected // Simulated Occupancy: ${stadiumOccupancy}%`}
                  {activeDropdown === 'ops' && "Status: Diagnostic standby // Systems normal"}
                </span>
              </div>
              <button 
                onClick={() => setActiveDropdown(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#88a4b8',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#88a4b8'}
              >
                ✕ Close
              </button>
            </div>

            {/* Content: Swarm View */}
            {activeDropdown === 'swarm' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { name: 'Linguistic Mediator', role: 'Context & Speech Translation', status: 'ACTIVE', color: '#10b981', ping: agentPings.mediator },
                    { name: 'Safety Triage', role: 'Incident Risk Evaluator', status: 'STANDBY', color: '#f59e0b', ping: agentPings.triage },
                    { name: 'Access Router', role: 'Weather-Aware Pathfinding', status: 'ACTIVE', color: '#10b981', ping: agentPings.router },
                    { name: 'Predictive Ops', role: 'Ambient Concourse Predictor', status: 'MONITORING', color: '#46F3FF', ping: agentPings.ops }
                  ].map(agent => (
                    <div 
                      key={agent.name}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{agent.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#88a4b8' }}>{agent.role}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem' }}>
                        <span style={{ fontSize: '0.65rem', color: agent.color, fontWeight: 900, letterSpacing: '0.05em' }}>● {agent.status}</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Ping: {agent.ping}ms</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Swarm Actions Bar */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(70,243,255,0.1)', paddingTop: '1rem' }}>
                  <button 
                    onClick={handlePingSwarm}
                    className="btn-secondary-neon"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Zap size={14} /> Ping Swarm Node
                  </button>
                  <button 
                    onClick={handleOptimizeSwarm}
                    className="btn-primary-neon"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    disabled={isSwarmOptimizing}
                  >
                    {isSwarmOptimizing ? "Optimizing..." : swarmOptimized ? "✓ Optimized" : "⚙️ Optimize Allocation"}
                  </button>
                  <button 
                    onClick={() => setShowLogs(prev => !prev)}
                    className="btn-secondary-neon"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    {showLogs ? "📂 Hide Terminal" : "📁 View Logs Terminal"}
                  </button>
                  {swarmPing && (
                    <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
                      Radar Ping Result: {swarmPing}ms (Nominal)
                    </span>
                  )}
                </div>

                {/* Swarm Terminal Console */}
                {showLogs && (
                  <div 
                    style={{
                      background: '#000000',
                      border: '1px solid rgba(70, 243, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      fontFamily: 'Consolas, monospace',
                      fontSize: '0.75rem',
                      color: '#00ffcc',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      textAlign: 'left'
                    }}
                  >
                    {logs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* Content: Digital Twin View */}
            {activeDropdown === 'twin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Left Column: Preset simulations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#46F3FF', textTransform: 'uppercase' }}>Select Active Twin Scenario:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        className={`btn-sandbox-option ${activeScenario === 'normal' ? 'active' : ''}`}
                        onClick={() => setActiveScenario('normal')}
                        style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}
                      >
                        <span>🟢 Normal Operations (0% risk)</span>
                      </button>
                      <button 
                        className={`btn-sandbox-option ${activeScenario === 'congestion' ? 'active' : ''}`}
                        onClick={() => setActiveScenario('congestion')}
                        style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}
                      >
                        <span>🟡 Gate C Crowd Congestion Surge</span>
                      </button>
                      <button 
                        className={`btn-sandbox-option ${activeScenario === 'emergency' ? 'active' : ''}`}
                        onClick={() => setActiveScenario('emergency')}
                        style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}
                      >
                        <span>🔴 Emergency Medical Route Bypass</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Layer toggles & Occupancy Slider */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#46F3FF', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                        Overlay Layers:
                      </strong>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setSensorsHUD(prev => !prev)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: sensorsHUD ? 'rgba(70, 243, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                            color: sensorsHUD ? '#46F3FF' : '#88a4b8',
                            border: sensorsHUD ? '1px solid #46F3FF' : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          📡 HUD {sensorsHUD ? "ON" : "OFF"}
                        </button>
                        <button 
                          onClick={() => setDronesActive(prev => !prev)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: dronesActive ? 'rgba(70, 243, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                            color: dronesActive ? '#46F3FF' : '#88a4b8',
                            border: dronesActive ? '1px solid #46F3FF' : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          🛸 Drones {dronesActive ? "ON" : "OFF"}
                        </button>
                        <button 
                          onClick={() => setHeatmapActive(prev => !prev)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: heatmapActive ? 'rgba(70, 243, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                            color: heatmapActive ? '#46F3FF' : '#88a4b8',
                            border: heatmapActive ? '1px solid #46F3FF' : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          🌡️ Heatmap {heatmapActive ? "ON" : "OFF"}
                        </button>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                        <span>Simulated Fan Density:</span>
                        <strong style={{ color: '#46F3FF' }}>{stadiumOccupancy}% ({Math.floor(stadiumOccupancy * 825)} fans)</strong>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={stadiumOccupancy} 
                        onChange={(e) => setStadiumOccupancy(Number(e.target.value))} 
                        style={{
                          width: '100%',
                          accentColor: '#46F3FF',
                          background: 'rgba(255,255,255,0.1)',
                          height: '5px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content: Operational Modules Diagnostics */}
            {activeDropdown === 'ops' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {/* Subsystems List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem', marginBottom: '0.2rem' }}>Subsystems Integrity:</strong>
                    {[
                      { name: "Multilingual Speech-to-Text Recognition", status: "NOMINAL", icon: "🗣️" },
                      { name: "Weather-aware Dijkstra Engine", status: "NOMINAL", icon: "📍" },
                      { name: "SQLite Offline Edge Ledger", status: "READY", icon: "📁" },
                      { name: "CCTV Predictive Video Triage", status: "ACTIVE", icon: "🚨" }
                    ].map(sub => (
                      <div key={sub.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <span>{sub.icon} {sub.name}</span>
                        <strong style={{ color: '#10b981', fontSize: '0.7rem' }}>{sub.status}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Diagnostic Action Block */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={handleRunDiagnostic}
                        className="btn-primary-neon"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        🔧 Run Self-Diagnostic
                      </button>
                      <button 
                        onClick={handleFlushCache}
                        className="btn-secondary-neon"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        disabled={isSyncingCache}
                      >
                        {isSyncingCache ? "Syncing..." : "🔄 Flush Edge Cache"}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {diagnosticProgress !== null && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span>Diagnostic Progress:</span>
                          <strong>{diagnosticProgress}%</strong>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${diagnosticProgress}%`, height: '100%', background: 'linear-gradient(90deg, #46F3FF, #7C5CFF)', transition: 'width 0.2s' }} />
                        </div>
                      </div>
                    )}

                    {/* Diagnostic Logs console */}
                    {diagnosticLogs.length > 0 && (
                      <div 
                        style={{
                          background: '#000000',
                          border: '1px solid rgba(70, 243, 255, 0.2)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          fontFamily: 'Consolas, monospace',
                          fontSize: '0.72rem',
                          color: '#00ffcc',
                          minHeight: '80px',
                          maxHeight: '100px',
                          overflowY: 'auto',
                          textAlign: 'left'
                        }}
                      >
                        {diagnosticLogs.map((dLog, idx) => <div key={idx}>&gt; {dLog}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Hero Content Section */}
      <div id="hero-anchor" className="hero-wrapper">
        <motion.div className="hero-text-content" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="hero-pill-badge ai-pulse-ring" variants={itemVariants}>
            <span className="indicator-pulse"></span>
            FIFA World Cup 2026 Active Digital Twin
          </motion.div>
          
          <motion.h1 className="hero-main-title" variants={itemVariants}>
            AI Operating System <br />
            <span className="hero-gradient-text">For World-Class Stadiums</span>
          </motion.h1>

          <motion.p className="hero-sub-para min-h-[48px]" variants={itemVariants}>
            <TypingText text="Empowering volunteers and organizers with real-time intelligence, predictive operations, and AI-driven decision support for safer, smarter events." />
          </motion.p>
          
          {/* Flagship Cinematic CTA Buttons with Hover Magnetic Scale */}
          <motion.div className="hero-action-buttons" variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            
            <motion.button 
              className="btn-primary-neon" 
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 240, 255, 0.6)' }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 350); }}
            >
              <Play size={18} fill="#ffffff" /> Launch Mission Control
            </motion.button>

            <motion.button 
              className="btn-secondary-neon" 
              whileHover={{ scale: 1.05, borderColor: 'rgba(70, 243, 255, 0.6)', background: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { handleButtonRipple(e); scrollToSection('digital-twin-details'); }}
            >
              <Gamepad2 size={18} /> Explore Digital Twin
            </motion.button>

            <motion.a 
              href="https://github.com/riyanshika7/stadiumOS"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary-neon"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '0.95rem 1.5rem' }}
            >
              <Github size={18} /> GitHub
            </motion.a>

            <motion.button 
              className="btn-secondary-neon" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '0.95rem 1.5rem' }}
              onClick={() => scrollToSection('sandbox-console')}
            >
              <ExternalLink size={18} /> Live Demo
            </motion.button>

          </motion.div>
        </motion.div>
      </div>

      <StatsBanner />

      {/* Cinematic Scroll Content Section */}
      <section id="digital-twin-details" className="transformation-section smooth-section-reveal">
        <div className="transformation-grid">
          <div className="transformation-content">
            <span className="trans-tag">Ambient Orchestrator</span>
            <h2 className="trans-title">From Stadium Model to <br />Autonomous Venue Neural Grid</h2>
            <p className="trans-description">As turnstile counts spike and gates exceed safe capacities, the Digital Twin highlights bottleneck nodes, computes alternative step-free exit paths, and coordinates security, facility, and translation sub-agents.</p>
            <div className="agent-badge-list">
              {['Linguistic Mediator', 'Safety Triage', 'Access Router', 'Predictive Ops'].map(t => (
                <span key={t} className="agent-badge-pill">{t}</span>
              ))}
            </div>
          </div>

          <div id="sandbox-console" className="sandbox-card-glass morph-card-glow radar-scan-overlay">
            <h3 className="text-xl font-bold font-header mb-2 text-[#46F3FF]">⚡ Interactive Digital Twin Sandbox</h3>
            <p className="text-sm text-slate-400 mb-6">Simulate operational stadium scenarios to see the 3D Digital Twin respond, highlight paths, and compute redirect routes.</p>
            <div className="sandbox-scenarios-box">
              <button className={`btn-sandbox-option ${activeScenario === 'normal' ? 'active' : ''}`} onClick={() => setActiveScenario('normal')}>
                <span>🟢 Normal Operations</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active</span>
              </button>
              <button className={`btn-sandbox-option ${activeScenario === 'congestion' ? 'active' : ''}`} onClick={() => setActiveScenario('congestion')}>
                <span>🟡 Concourse Warning</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Simulate Gate C Surge</span>
              </button>
              <button className={`btn-sandbox-option ${activeScenario === 'emergency' ? 'active' : ''}`} onClick={() => setActiveScenario('emergency')}>
                <span>🔴 Emergency Bypass</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-500">Trigger Critical Event</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      <footer className="landing-footer">
        <div>© 2026 StadiumOS. Built for the FIFA World Cup 2026 PromptWars.</div>
      </footer>
    </div>
  );
}
