import React, { useState } from 'react';
import { Languages, Volume2, AlertCircle, Sparkles, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../constants';

function Translator() {
  const [translateInput, setTranslateInput] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // De-escalation coach states
  const [deescalateResult, setDeescalateResult] = useState(null);
  const [isCoaching, setIsCoaching] = useState(false);

  const handleTranslate = async (e) => {
    if (e) e.preventDefault();
    if (!translateInput.trim()) return;

    setIsTranslating(true);
    setDeescalateResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: translateInput }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTranslationResult(data);
    } catch (err) {
      console.error('Translation error:', err);
      setTranslationResult(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const fetchDeescalateCoaching = async () => {
    if (!translationResult) return;
    setIsCoaching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/deescalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: translationResult.translated_query,
          tone: translationResult.tone,
          context: `Volunteer is dealing with a fan requesting help. Detected intent: ${translationResult.intent}`
        }),
      });
      const data = await res.json();
      setDeescalateResult(data);
    } catch (err) {
      console.error('Deescalation error:', err);
    } finally {
      setIsCoaching(false);
    }
  };

  // Converts the promise-chain pattern to async/await for consistency.
  const simulateTranslation = async (phrase) => {
    setTranslateInput(phrase);
    setIsTranslating(true);
    setDeescalateResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: phrase }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTranslationResult(data);
    } catch (err) {
      console.error('Translation simulation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <Languages size={22} />
        MULTILINGUAL CO-PILOT
      </h3>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
        Translate queries from foreign fans instantly. Use speech simulator tags below or type custom text.
      </p>

      {/* Language quick-fill buttons */}
      <div className="speech-helpers" role="group" aria-label="Language phrase simulators">
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('¿Dónde puedo encontrar el ascensor más cercano para silla de ruedas?')}>
          🇪🇸 Spanish: Elevator Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation("Où se trouve la billetterie s'il vous plaît?")}>
          🇫🇷 French: Ticket Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('ห้องน้ำอยู่ที่ไหน')}>
          🇹🇭 Thai: Restroom Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('トイレはどこですか')}>
          🇯🇵 Japanese: Restroom Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('洗手间在哪里')}>
          🇨🇳 Mandarin: Restroom Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('أين المرحاض؟')}>
          🇸🇦 Arabic: Restroom Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('Wo ist die Toilette?')}>
          🇩🇪 German: Restroom Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('Onde fica o banheiro?')}>
          🇧🇷 Portuguese: Restroom Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation("Dov'è il bagno?")}>
          🇮🇹 Italian: Restroom Query
        </button>
        <button type="button" className="speech-tag" onClick={() => simulateTranslation('Me siento muy mal, tengo dolor de pecho y me falta el aire.')}>
          🚨 Spanish: Panic Medical
        </button>
      </div>

      <form onSubmit={handleTranslate}>
        <div className="form-group">
          <label htmlFor="translate-input">Fan Query / Phrase</label>
          <textarea
            id="translate-input"
            value={translateInput}
            onChange={(e) => setTranslateInput(e.target.value)}
            placeholder="Type or click a simulator tag above to translate..."
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isTranslating}>
          {isTranslating ? 'Analyzing & Translating...' : 'Translate & Get Suggested Reply'}
        </button>
      </form>

      {/* Pulsing Audio Waveform visualizer */}
      {isTranslating && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', height: '50px', margin: '1rem 0' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--color-primary)', borderRadius: '4px', animation: 'bounceWave 0.8s ease-in-out infinite alternate' }} />
          <div style={{ width: '4px', height: '40px', background: 'var(--color-primary)', borderRadius: '4px', animation: 'bounceWave 0.8s ease-in-out infinite alternate 0.2s' }} />
          <div style={{ width: '4px', height: '15px', background: 'var(--color-primary)', borderRadius: '4px', animation: 'bounceWave 0.8s ease-in-out infinite alternate 0.4s' }} />
          <div style={{ width: '4px', height: '35px', background: 'var(--color-primary)', borderRadius: '4px', animation: 'bounceWave 0.8s ease-in-out infinite alternate 0.1s' }} />
          <div style={{ width: '4px', height: '25px', background: 'var(--color-primary)', borderRadius: '4px', animation: 'bounceWave 0.8s ease-in-out infinite alternate 0.3s' }} />
          <div style={{ width: '4px', height: '10px', background: 'var(--color-primary)', borderRadius: '4px', animation: 'bounceWave 0.8s ease-in-out infinite alternate 0.5s' }} />
          {/* bounceWave keyframes are defined in index.css */}
        </div>
      )}

      {translationResult && (
        <div className="suggestion-box">
          <div className="suggestion-header">
            <span>Lang: {translationResult.detected_language}</span>
            <span>Intent: {translationResult.intent.replace('_', ' ')}</span>
            <span style={{ 
              color: translationResult.tone === 'panicked' || translationResult.tone === 'angry' ? 'var(--color-danger)' : 'var(--color-accent)',
              fontWeight: '900'
            }}>
              Tone: {translationResult.tone.toUpperCase()}
            </span>
          </div>
          
          <div className="suggestion-field">
            <span>English Translation</span>
            <p>{translationResult.translated_query}</p>
          </div>
          
          <div className="suggestion-field" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
            <span>Suggested English Reply</span>
            <p style={{ color: 'var(--color-accent)' }}>{translationResult.suggested_reply_english}</p>
          </div>
          
          <div className="suggestion-field" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
            <span>Suggested Native Reply (Read or Show to Fan)</span>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', lineHeight: '1.4' }}>
              <Volume2 size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <strong>{translationResult.suggested_reply_native}</strong>
            </p>
          </div>

          {/* Volunteer Playbook Instructions */}
          <div style={{ 
            marginTop: '0.5rem',
            padding: '0.75rem', 
            background: translationResult.tone === 'panicked' || translationResult.tone === 'angry' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${translationResult.tone === 'panicked' || translationResult.tone === 'angry' ? 'var(--color-danger)' : 'var(--border-color)'}`,
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '800', 
              color: translationResult.tone === 'panicked' || translationResult.tone === 'angry' ? 'var(--color-danger)' : 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <AlertCircle size={14} />
              VOLUNTEER ACTION GUIDE
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4', fontWeight: '600' }}>
              {translationResult.volunteer_instructions}
            </p>
          </div>

          {/* Trigger De-escalation Coaching for High Stress Tones */}
          {(translationResult.tone === 'angry' || translationResult.tone === 'panicked') && !deescalateResult && (
            <button 
              type="button" 
              onClick={fetchDeescalateCoaching}
              className="btn btn-secondary" 
              style={{ 
                marginTop: '0.5rem', 
                width: '100%', 
                fontSize: '0.8rem',
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

          {/* Display De-escalation Coaching Response */}
          {deescalateResult && (
            <div style={{ 
              marginTop: '0.5rem', 
              padding: '0.75rem', 
              background: 'rgba(255, 199, 44, 0.05)', 
              border: '2px solid var(--color-warning)', 
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldAlert size={14} />
                DE-ESCALATION AGENT RESPONSE
              </span>
              
              <div style={{ fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', fontWeight: 'bold' }}>SPOKEN SCRIPT FOR FAN:</span>
                <p style={{ color: 'var(--text-main)', fontWeight: 'bold', fontStyle: 'italic', paddingLeft: '0.5rem', borderLeft: '2px solid var(--color-warning)' }}>
                  "{deescalateResult.deescalation_script}"
                </p>
              </div>

              <div style={{ fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', fontWeight: 'bold' }}>PHYSICAL/BODY LANGUAGE TIPS:</span>
                <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>{deescalateResult.body_language_tips}</p>
              </div>

              <div style={{ fontSize: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', fontWeight: 'bold' }}>TACTICAL DISPATCH STEP:</span>
                <p style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{deescalateResult.tactical_step}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Translator;
