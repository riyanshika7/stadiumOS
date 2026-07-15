import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import DigitalTwinStadium from './DigitalTwinStadium';
import '../landing.css';

// --- Animated Ripple Button Effect ---
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
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// --- Live Counter Component ---
function LiveCounter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    let animFrameId = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animFrameId = window.requestAnimationFrame(step);
      }
    };
    animFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animFrameId) {
        window.cancelAnimationFrame(animFrameId);
      }
    };
  }, [end, duration]);
  return <span>{count}{suffix}</span>;
}

// --- AI Typing Text Effect Component ---
function TypingText({ text, speed = 25 }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let currentLength = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (currentLength < text.length) {
        const nextChar = text.charAt(currentLength);
        setDisplayedText((prev) => prev + nextChar);
        currentLength++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return <span>{displayedText}</span>;
}

// --- Magnetic Card Hover Component ---
function MagneticCard({ children, className }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("translate3d(0, 0, 0)");

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const force = 10; // max translation force
    const dx = (x / (rect.width / 2)) * force;
    const dy = (y / (rect.height / 2)) * force;
    setTransform(`translate3d(${dx}px, ${dy}px, 0) scale3d(1.02, 1.02, 1)`);
  };

  const handleMouseLeave = () => {
    setTransform("translate3d(0, 0, 0) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.15s ease-out", cursor: "pointer" }}
      className={className}
    >
      {children}
    </div>
  );
}

export default function LandingPage({ onEnterConsole }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScenario, setActiveScenario] = useState('normal');
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  const [activeSection, setActiveSection] = useState('hero-anchor');

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let animFrameId = null;
    function raf(time) {
      lenis.raf(time);
      animFrameId = requestAnimationFrame(raf);
    }
    animFrameId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, []);

  // Track window scroll progress for 3D Camera animations and active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = window.scrollY / totalScroll;
        setScrollProgress(progress);
        setIsNavScrolled(window.scrollY > 50);
      }

      // Dynamic navigation link highlight detection based on viewport visibility
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
  }, []);

  // Scroll to a specific anchor target smoothly
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Stagger configurations for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  // Scroll section reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    const targets = document.querySelectorAll('.smooth-section-reveal');
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-body animated-gradient-bg min-h-screen relative w-full select-none">
      
      {/* --- Full Screen 3D Digital Twin Background --- */}
      <DigitalTwinStadium 
        scrollProgress={activeScenario === 'congestion' ? 0.45 : activeScenario === 'emergency' ? 0.85 : scrollProgress} 
      />

      {/* Radial vignette mask for blending 3D scene with HTML overlay */}
      <div className="landing-vignette-overlay" />

      {/* --- Navigation Bar --- */}
      <nav className={`landing-nav ${isNavScrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo">
          <img src="/stadiumos.png" alt="StadiumOS Logo" />
          <span>StadiumOS</span>
        </div>
        <div className="landing-nav-links">
          <span className={`landing-nav-link ${activeSection === 'hero-anchor' ? 'active' : ''}`} onClick={() => scrollToSection('hero-anchor')}>System Home</span>
          <span className={`landing-nav-link ${activeSection === 'digital-twin-details' ? 'active' : ''}`} onClick={() => scrollToSection('digital-twin-details')}>AI Swarm</span>
          <span className={`landing-nav-link ${activeSection === 'sandbox-console' ? 'active' : ''}`} onClick={() => scrollToSection('sandbox-console')}>Interactive Twin</span>
          <span className={`landing-nav-link ${activeSection === 'features-section' ? 'active' : ''}`} onClick={() => scrollToSection('features-section')}>Operational Modules</span>
          <button className="btn-neon-cta" onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 300); }}>
            Enter Console ⚡
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div id="hero-anchor" className="hero-wrapper">
        <motion.div 
          className="hero-text-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-pill-badge ai-pulse-ring" variants={itemVariants}>
            <span className="indicator-pulse"></span>
            FIFA World Cup 2026 Active Digital Twin
          </motion.div>
          
          <motion.h1 className="hero-main-title" variants={itemVariants}>
            The AI Operating System <br />
            <span className="hero-gradient-text">For World-Class Stadiums</span>
          </motion.h1>
          
          <motion.p className="hero-sub-para min-h-[48px]" variants={itemVariants}>
            <TypingText text="StadiumOS connects multi-agent AI, audits CCTV video feeds ambiently, and triggers explainable crowd redirections to secure mega-events." />
          </motion.p>
          
          <motion.div className="hero-action-buttons" variants={itemVariants}>
            <button className="btn-primary-neon" onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 350); }}>
              Launch Operations Dashboard
            </button>
            <button className="btn-secondary-neon" onClick={(e) => { handleButtonRipple(e); scrollToSection('digital-twin-details'); }}>
              Explore Digital Twin
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* --- Stats Banner --- */}
      <div className="stats-banner smooth-section-reveal">
        <div className="stat-card-item">
          <div className="stat-value-neon">
            <LiveCounter end={80} suffix="K+" />
          </div>
          <div className="stat-label-text">Fans Per Match</div>
        </div>
        <div className="stat-card-item">
          <div className="stat-value-neon">
            <LiveCounter end={15} suffix="m" />
          </div>
          <div className="stat-label-text">Redirection Pre-warn</div>
        </div>
        <div className="stat-card-item">
          <div className="stat-value-neon">
            <LiveCounter end={8} suffix="+" />
          </div>
          <div className="stat-label-text">Languages Translated</div>
        </div>
        <div className="stat-card-item">
          <div className="stat-value-neon">
            <LiveCounter end={93} suffix="%" />
          </div>
          <div className="stat-label-text">Core Safety SLA</div>
        </div>
      </div>

      {/* --- Section: The Living AI OS Transformation --- */}
      <section id="digital-twin-details" className="transformation-section smooth-section-reveal">
        <div className="transformation-grid">
          <div className="transformation-content">
            <span className="trans-tag">Ambient Orchestrator</span>
            <h2 className="trans-title">
              From Stadium Model to <br />
              Autonomous Venue Neural Grid
            </h2>
            <p className="trans-description">
              As turnstile counts spike and gates exceed safe capacities, the Digital Twin highlights bottleneck nodes, computes alternative step-free exit paths, and coordinates security, facility, and translation sub-agents.
            </p>
            <div className="agent-badge-list">
              <span className="agent-badge-pill">Linguistic Mediator</span>
              <span className="agent-badge-pill">Safety Triage</span>
              <span className="agent-badge-pill">Access Router</span>
              <span className="agent-badge-pill">Predictive Ops</span>
            </div>
          </div>

          <div id="sandbox-console" className="sandbox-card-glass morph-card-glow radar-scan-overlay">
            <h3 className="text-xl font-bold font-header mb-2 text-[#46F3FF]">
              ⚡ Interactive Digital Twin Sandbox
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Simulate operational stadium scenarios to see the 3D Digital Twin respond, highlight paths, and compute redirect routes.
            </p>

            <div className="sandbox-scenarios-box">
              <button 
                className={`btn-sandbox-option ${activeScenario === 'normal' ? 'active' : ''}`}
                onClick={() => setActiveScenario('normal')}
              >
                <span>🟢 Normal Operations</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active</span>
              </button>

              <button 
                className={`btn-sandbox-option ${activeScenario === 'congestion' ? 'active' : ''}`}
                onClick={() => setActiveScenario('congestion')}
              >
                <span>🟡 Concourse Congestion Warning</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Simulate Gate C Surge</span>
              </button>

              <button 
                className={`btn-sandbox-option ${activeScenario === 'emergency' ? 'active' : ''}`}
                onClick={() => setActiveScenario('emergency')}
              >
                <span>🔴 Emergency Bypass Redirection</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-500">Trigger Critical Event</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section: Operational Modules Grid --- */}
      <section id="features-section" className="features-grid-section smooth-section-reveal">
        <div className="features-header">
          <span className="trans-tag">Enterprise Architecture</span>
          <h2 className="text-4xl font-extrabold font-header mt-2">
            Engineered for High-Pressure Stadium Environments
          </h2>
        </div>

        <div className="features-grid-cards">
          <MagneticCard className="feature-grid-card">
            <div className="feature-icon-box">🗣️</div>
            <h3 className="feature-card-title text-white">Multilingual Co-Pilot</h3>
            <p className="feature-card-desc">
              Instantly decodes fan intent and provides volunteers with dynamic speech scripts and body posture playbooks.
            </p>
          </MagneticCard>

          <MagneticCard className="feature-grid-card">
            <div className="feature-icon-box">📍</div>
            <h3 className="feature-card-title text-white">Accessibility Router</h3>
            <p className="feature-card-desc">
              Formulates step-free directions to bypass active wet ramps or security blockages in real-time.
            </p>
          </MagneticCard>

          <MagneticCard className="feature-grid-card">
            <div className="feature-icon-box">🚨</div>
            <h3 className="feature-card-title text-white">CCTV Video Triage</h3>
            <p className="feature-card-desc">
              Scans CCTV security cameras to automatically identify gate crowd crushes, slips, or perimeter intrusion risks.
            </p>
          </MagneticCard>

          <MagneticCard className="feature-grid-card">
            <div className="feature-icon-box">🎟️</div>
            <h3 className="feature-card-title text-white">Ticket Vision Gate</h3>
            <p className="feature-card-desc">
              Multimodal image parser scans paper or mobile tickets to extract seat numbers and match-day validity codes.
            </p>
          </MagneticCard>
        </div>
      </section>

      {/* --- Landing Page Footer --- */}
      <footer className="landing-footer">
        <div>© 2026 StadiumOS. Built for the FIFA World Cup 2026 PromptWars.</div>
      </footer>
    </div>
  );
}
