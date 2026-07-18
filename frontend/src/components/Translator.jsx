import React, { useState } from 'react';
import { Languages, MessageSquare, Volume2, ShieldAlert, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../constants';
import TranslationHelpers from './TranslationHelpers';
import DeescalationResult from './DeescalationResult';

function Translator() {
  const [queryText, setQueryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // De-escalation states
  const [isCoaching, setIsCoaching] = useState(false);
  const [deescalateResult, setDeescalateResult] = useState(null);

  const handleTranslate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!queryText.trim()) return;

    setIsLoading(true);
    setResult(null);
    setDeescalateResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/volunteer/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Network error: Translation service is currently unreachable.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDeescalation = async () => {
    if (!result) return;
    setIsCoaching(true);
    setDeescalateResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/volunteer/deescalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fan_query: queryText,
          detected_language: result.detected_language,
          intent: result.intent
        }),
      });
      const data = await res.json();
      setDeescalateResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCoaching(false);
    }
  };

  const runPresetTranslation = (phrase) => {
    setQueryText(phrase);
    // Auto submit
    const fakeEvent = { preventDefault: () => {} };
    setTimeout(() => handleTranslate(fakeEvent), 50);
  };

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <Languages size={20} />
        MULTILINGUAL TRANSLATION & DE-ESCALATION CO-PILOT
      </h3>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
        Identify fan query intents, auto-detect spoken language, translate messages instantly, and generate psycho-social scripts to de-escalate security conflicts.
      </p>

      {/* Preset simulation helpers */}
      <TranslationHelpers onSimulate={runPresetTranslation} />

      <form onSubmit={handleTranslate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Type or click a simulator tag above to translate..."
          style={{ flex: 1, padding: '0.6rem 1rem' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ background: 'var(--color-primary)', border: 'none', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
          disabled={isLoading || !queryText.trim()}
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </button>
      </form>

      {/* Robust Error & Retry state */}
      {error && (
        <div className="glass-card fade-in" style={{ border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 'bold' }}>❌ {error}</span>
          <button 
            type="button"
            onClick={() => handleTranslate()} 
            className="btn" 
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}
          >
            ↻ Retry translation
          </button>
        </div>
      )}

      {/* Robust Skeleton loading state */}
      {isLoading && (
        <div className="skeleton-loader fade-in" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <div style={{ width: '150px', height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '60px', height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          </div>
          <div style={{ width: '100%', height: '35px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '100%', height: '50px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '100%', height: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        </div>
      )}

      {/* Translation Results Panel */}
      {result && (
        <div className="fade-in" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-accent)' }}>
              <MessageSquare size={16} />
              CO-PILOT DISPATCH SUGGESTION
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              🌍 {result.detected_language}
            </span>
          </div>

          <div className="speech-playbooks" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {/* Translated meaning */}
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '0.6rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>TRANSLATED MEANING:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{result.translated_query}</span>
            </div>

            {/* Spoken Script to read to fan */}
            <div style={{ background: 'rgba(0, 135, 90, 0.02)', padding: '0.6rem', border: '1px solid rgba(0, 135, 90, 0.2)' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Volume2 size={12} />
                SPOKEN FAN SCRIPT (IN THEIR LANGUAGE):
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>
                "{result.translated_response}"
              </p>
            </div>
            
            {/* Actionable Instruction */}
            {result.actionable_instruction && (
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '0.6rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>ACTIONABLE INSTRUCTION:</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{result.actionable_instruction}</span>
              </div>
            )}
          </div>

          {/* Explainable AI reasoning engine details */}
          {result.reasoning_engine && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-main)', display: 'block' }}>🧠 EXPLAINABLE AI REASONING DETAILS:</span>
              <span>{result.reasoning_engine}</span>
            </div>
          )}

          {/* Trigger De-escalation Option if conflict/high-urgency query */}
          {result.intent === 'conflict' && (
            <button
              onClick={handleRequestDeescalation}
              className="btn btn-warning"
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.8rem',
                background: 'rgba(255, 199, 44, 0.15)',
                border: '1px solid var(--color-warning)',
                color: 'var(--color-warning)',
                fontWeight: 'bold'
              }}
              disabled={isCoaching}
            >
              <Sparkles size={14} style={{ marginRight: '0.4rem' }} />
              {isCoaching ? 'Retrieving Psychological Scripts...' : '⚠️ REQUEST DE-ESCALATION COACHING'}
            </button>
          )}

          <DeescalationResult deescalateResult={deescalateResult} />
        </div>
      )}
    </div>
  );
}

export default Translator;
