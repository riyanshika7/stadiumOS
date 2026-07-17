import React from 'react';
import { X, Brain, ShieldAlert, Sparkles, Languages } from 'lucide-react';

export default function CopilotModal({ isOpen, result, query, onClose }) {
  if (!isOpen || !result) return null;

  const {
    intent_detection = {},
    plain_english_reasoning = '',
    actionable_translated_script = '',
    intent_and_context = {}
  } = result;

  const urgency = intent_detection.urgency || intent_and_context.urgency || 'low';
  const category = intent_detection.category || intent_and_context.category || 'general';
  const primaryThreat = intent_detection.primary_threat || intent_and_context.primary_threat || 'general';

  return (
    <div className="command-bar-overlay" onClick={onClose}>
      <div 
        className="glass-card copilot-modal-window" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="StadiumOS AI Copilot Reasoning"
      >
        <div className="copilot-modal-header">
          <div className="header-title-wrapper">
            <Brain className="icon-pulse text-amber" size={20} />
            <h2>STADIUMOS CO-PILOT (XAI)</h2>
          </div>
          <button onClick={onClose} className="copilot-close-btn" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div className="copilot-modal-body">
          <div className="copilot-query-section">
            <span className="section-label">USER QUERY:</span>
            <blockquote className="query-text">"{query}"</blockquote>
          </div>

          <div className="copilot-meta-grid">
            <div className="meta-card">
              <span className="card-label">🚨 URGENCY</span>
              <span className={`badge urgency-${urgency.toLowerCase()}`}>
                {urgency.toUpperCase()}
              </span>
            </div>
            <div className="meta-card">
              <span className="card-label">📁 CATEGORY</span>
              <span className="meta-val">{category.toUpperCase()}</span>
            </div>
            <div className="meta-card">
              <span className="card-label">🎯 PRIMARY THREAT</span>
              <span className="meta-val">{primaryThreat.toUpperCase()}</span>
            </div>
          </div>

          <div className="copilot-reasoning-section">
            <div className="section-header-row">
              <Sparkles size={16} className="text-amber" />
              <h3>EXPLAINABLE AI (XAI) REASONING</h3>
            </div>
            <div className="reasoning-bubble font-mono">
              {plain_english_reasoning || result.reasoning_engine || "Processing reasoning path..."}
            </div>
          </div>

          <div className="copilot-action-section">
            <div className="section-header-row">
              <Languages size={16} className="text-emerald" />
              <h3>ACTIONABLE VOLUNTEER SCRIPT</h3>
            </div>
            <div className="action-bubble">
              <p className="script-highlight">
                {actionable_translated_script || result.actionable_script || "Ready to assist."}
              </p>
            </div>
          </div>
        </div>

        <div className="copilot-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Dismiss Insight</button>
        </div>
      </div>
    </div>
  );
}
