import React, { useState, useEffect, useRef } from 'react';
import { EarOff, Mic, MicOff, AlertCircle } from 'lucide-react';

export default function ClosedCaptionsConsole({ captionText, setCaptionText }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [fontSizeRem, setFontSizeRem] = useState(1.85);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMsg('Web Speech API is not supported in this browser. Please use Google Chrome or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalSpeech = '';
      let interimSpeech = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript + ' ';
        } else {
          interimSpeech += event.results[i][0].transcript;
        }
      }

      if (finalSpeech) {
        setTranscript(prev => prev + finalSpeech);
        setCaptionText(prev => prev + finalSpeech);
      }
      setInterimTranscript(interimSpeech);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access blocked. Please enable microphone permissions in your browser settings.');
      } else if (event.error === 'no-speech') {
        // Continue silently
      } else {
        setErrorMsg(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isListening, setCaptionText]);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setErrorMsg('');
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setErrorMsg('Failed to start microphone. Please refresh and try again.');
        setIsListening(false);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setCaptionText('');
  };

  return (
    <div 
      className="deaf-accessibility-mode-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.5rem',
        background: '#000000',
        color: '#ffea00',
        border: isListening ? '4px solid #ffea00' : '4px solid #333333',
        borderRadius: '12px',
        boxShadow: isListening 
          ? '0 12px 48px rgba(0,0,0,0.95), 0 0 25px rgba(255, 234, 0, 0.4)' 
          : '0 8px 32px rgba(0,0,0,0.85)',
        width: '92%',
        maxWidth: '800px',
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'all 0.25s ease'
      }}
      role="region"
      aria-label="Deaf Fan Accessibility Assistant"
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255, 234, 0, 0.3)', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <EarOff size={20} aria-hidden="true" />
          DEAF FAN ACCESSIBILITY ASSISTANT
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span 
            aria-live="polite"
            style={{ 
              fontSize: '0.7rem', 
              fontWeight: 'bold', 
              padding: '0.2rem 0.5rem', 
              border: isListening ? '1px solid #ffea00' : '1px solid #555555', 
              background: isListening ? 'rgba(255, 234, 0, 0.15)' : 'rgba(0,0,0,0.5)',
              borderRadius: '4px',
              color: isListening ? '#ffea00' : '#888888',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: isListening ? '#ffea00' : '#888888',
              animation: isListening ? 'pulse 1.2s infinite' : 'none',
              display: 'inline-block'
            }}></span>
            {isListening ? 'LISTENING LIVE' : 'MIC STANDBY'}
          </span>
        </div>
      </div>

      {/* Main Transcription Display Box */}
      <div 
        aria-live="assertive"
        role="log"
        aria-label="Real-time speech transcript"
        style={{
          background: '#000000',
          border: '2px solid #ffea00',
          borderRadius: '8px',
          padding: '1.25rem',
          minHeight: '140px',
          maxHeight: '240px',
          overflowY: 'auto',
          textAlign: 'left'
        }}
      >
        {!transcript && !interimTranscript ? (
          <p style={{ fontSize: `${Math.max(1.1, fontSizeRem - 0.5)}rem`, fontWeight: '700', color: 'rgba(255, 234, 0, 0.45)', margin: 0, fontStyle: 'italic' }}>
            {isListening ? 'Speak clearly near the device...' : 'Activate Speech-to-Text below and speak to start transcribing.'}
          </p>
        ) : (
          <p style={{ fontSize: `${fontSizeRem}rem`, fontWeight: '900', color: '#ffea00', margin: 0, lineHeight: '1.45', wordBreak: 'break-word' }}>
            {transcript}
            <span style={{ color: 'rgba(255, 234, 0, 0.65)', fontWeight: '700' }}>{interimTranscript}</span>
          </p>
        )}
      </div>

      {/* Error Indicator */}
      {errorMsg && (
        <div 
          role="alert"
          style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid #ef4444', 
            color: '#ff4d4d', 
            padding: '0.6rem', 
            borderRadius: '6px', 
            fontSize: '0.85rem', 
            fontWeight: 'bold',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem' 
          }}
        >
          <AlertCircle size={16} aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Font Size Adjuster Control (WCAG 1.4.4 Text Resize support) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', marginTop: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <span id="caption-font-size-label" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ffea00', letterSpacing: '0.05em' }}>TEXT ZOOM:</span>
        <div role="group" aria-labelledby="caption-font-size-label" style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => setFontSizeRem(prev => Math.max(1.2, prev - 0.2))}
            aria-label="Decrease caption text size"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 234, 0, 0.4)',
              color: '#ffea00',
              borderRadius: '4px',
              padding: '0.3rem 0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            A -
          </button>
          <button
            type="button"
            onClick={() => setFontSizeRem(1.85)}
            aria-label="Reset caption text size to default"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 234, 0, 0.4)',
              color: '#ffea00',
              borderRadius: '4px',
              padding: '0.3rem 0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            DEFAULT ({Math.round((fontSizeRem / 1.85) * 100)}%)
          </button>
          <button
            type="button"
            onClick={() => setFontSizeRem(prev => Math.min(3.5, prev + 0.2))}
            aria-label="Increase caption text size"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 234, 0, 0.4)',
              color: '#ffea00',
              borderRadius: '4px',
              padding: '0.3rem 0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            A +
          </button>
        </div>
      </div>

      {/* Controller Buttons Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.25rem' }}>
        <button
          onClick={toggleListening}
          aria-label={isListening ? "Stop transcribing speech to text" : "Start transcribing speech to text"}
          disabled={!isSupported}
          style={{
            flex: '1',
            padding: '0.75rem 1.25rem',
            background: isListening ? '#ff4d4d' : '#ffea00',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '900',
            cursor: isSupported ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(255, 234, 0, 0.2)',
            transition: 'all 0.15s ease',
            opacity: isSupported ? 1 : 0.5
          }}
        >
          {isListening ? (
            <>
              <MicOff size={18} aria-hidden="true" />
              STOP TRANSCRIPTION
            </>
          ) : (
            <>
              <Mic size={18} aria-hidden="true" />
              START SPEECH-TO-TEXT
            </>
          )}
        </button>

        <button
          onClick={clearTranscript}
          aria-label="Clear current transcript"
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#ffea00',
            border: '2px solid rgba(255, 234, 0, 0.3)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          CLEAR SCREEN
        </button>
      </div>
    </div>
  );
}
