import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
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
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  useEffect(() => {
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
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.smooth-section-reveal').forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-body animated-gradient-bg min-h-screen relative w-full select-none">
      <React.Suspense fallback={<div className="landing-vignette-overlay" style={{ background: '#02040a' }} />}>
        <DigitalTwinStadium scrollProgress={activeScenario === 'congestion' ? 0.45 : activeScenario === 'emergency' ? 0.85 : scrollProgress} />
      </React.Suspense>
      <div className="landing-vignette-overlay" />

      <nav className={`landing-nav ${isNavScrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo"><img src="/stadiumos.png" alt="StadiumOS Logo" /><span>StadiumOS</span></div>
        <div className="landing-nav-links">
          <span className={`landing-nav-link ${activeSection === 'hero-anchor' ? 'active' : ''}`} onClick={() => scrollToSection('hero-anchor')}>System Home</span>
          <span className={`landing-nav-link ${activeSection === 'digital-twin-details' ? 'active' : ''}`} onClick={() => scrollToSection('digital-twin-details')}>AI Swarm</span>
          <span className={`landing-nav-link ${activeSection === 'sandbox-console' ? 'active' : ''}`} onClick={() => scrollToSection('sandbox-console')}>Interactive Twin</span>
          <span className={`landing-nav-link ${activeSection === 'features-section' ? 'active' : ''}`} onClick={() => scrollToSection('features-section')}>Operational Modules</span>
          <button className="btn-neon-cta" onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 300); }}>Enter Console ⚡</button>
        </div>
      </nav>

      <div id="hero-anchor" className="hero-wrapper">
        <motion.div className="hero-text-content" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="hero-pill-badge ai-pulse-ring" variants={itemVariants}><span className="indicator-pulse"></span>FIFA World Cup 2026 Active Digital Twin</motion.div>
          <motion.h1 className="hero-main-title" variants={itemVariants}>The AI Operating System <br /><span className="hero-gradient-text">For World-Class Stadiums</span></motion.h1>
          <motion.p className="hero-sub-para min-h-[48px]" variants={itemVariants}><TypingText text="StadiumOS connects multi-agent AI, audits CCTV video feeds ambiently, and triggers explainable crowd redirections to secure mega-events." /></motion.p>
          <motion.div className="hero-action-buttons" variants={itemVariants}>
            <button className="btn-primary-neon" onClick={(e) => { handleButtonRipple(e); setTimeout(onEnterConsole, 350); }}>Launch Operations Dashboard</button>
            <button className="btn-secondary-neon" onClick={(e) => { handleButtonRipple(e); scrollToSection('digital-twin-details'); }}>Explore Digital Twin</button>
          </motion.div>
        </motion.div>
      </div>

      <StatsBanner />

      <section id="digital-twin-details" className="transformation-section smooth-section-reveal">
        <div className="transformation-grid">
          <div className="transformation-content">
            <span className="trans-tag">Ambient Orchestrator</span>
            <h2 className="trans-title">From Stadium Model to <br />Autonomous Venue Neural Grid</h2>
            <p className="trans-description">As turnstile counts spike and gates exceed safe capacities, the Digital Twin highlights bottleneck nodes, computes alternative step-free exit paths, and coordinates security, facility, and translation sub-agents.</p>
            <div className="agent-badge-list">
              {['Linguistic Mediator', 'Safety Triage', 'Access Router', 'Predictive Ops'].map(t => <span key={t} className="agent-badge-pill">{t}</span>)}
            </div>
          </div>

          <div id="sandbox-console" className="sandbox-card-glass morph-card-glow radar-scan-overlay">
            <h3 className="text-xl font-bold font-header mb-2 text-[#46F3FF]">⚡ Interactive Digital Twin Sandbox</h3>
            <p className="text-sm text-slate-400 mb-6">Simulate operational stadium scenarios to see the 3D Digital Twin respond, highlight paths, and compute redirect routes.</p>
            <div className="sandbox-scenarios-box">
              <button className={`btn-sandbox-option ${activeScenario === 'normal' ? 'active' : ''}`} onClick={() => setActiveScenario('normal')}><span>🟢 Normal Operations</span><span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active</span></button>
              <button className={`btn-sandbox-option ${activeScenario === 'congestion' ? 'active' : ''}`} onClick={() => setActiveScenario('congestion')}><span>🟡 Concourse Warning</span><span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Simulate Gate C Surge</span></button>
              <button className={`btn-sandbox-option ${activeScenario === 'emergency' ? 'active' : ''}`} onClick={() => setActiveScenario('emergency')}><span>🔴 Emergency Bypass</span><span className="text-[10px] uppercase font-bold tracking-wider text-red-500">Trigger Critical Event</span></button>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      <footer className="landing-footer"><div>© 2026 StadiumOS. Built for the FIFA World Cup 2026 PromptWars.</div></footer>
    </div>
  );
}
