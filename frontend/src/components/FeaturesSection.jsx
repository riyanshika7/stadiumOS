import React from 'react';
import MagneticCard from './MagneticCard';

const FeaturesSection = React.memo(function FeaturesSection() {
  return (
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
  );
});

export default FeaturesSection;
