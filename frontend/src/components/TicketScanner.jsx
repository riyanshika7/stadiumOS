import React, { useState, useRef } from 'react';
import { Camera, ShieldAlert, CheckCircle, UploadCloud, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function TicketScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMock, setSelectedMock] = useState('');
  
  // File upload states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Data, setBase64Data] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const fileInputRef = useRef(null);

  // Simulated base64 fallback image
  const mockTicketBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

  const handleScan = async (mockType, customBase64 = null, filename = '') => {
    setIsScanning(true);
    if (!customBase64) {
      setSelectedMock(mockType);
    }
    
    const payloadB64 = customBase64 || mockTicketBase64;

    try {
      const res = await fetch(`${API_BASE_URL}/api/volunteer/vision-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_b64: payloadB64,
          ticket_type: mockType,
          filename: filename
        }),
      });
      
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error("Ticket vision scan connection error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fname = file.name;
    setUploadedFilename(fname);

    // Set preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setBase64Data(reader.result);
      setSelectedMock('custom');
      // Automatically trigger scan with custom uploaded image + filename
      handleScan('custom', reader.result, fname);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetScanner = () => {
    setPreviewUrl(null);
    setBase64Data('');
    setScanResult(null);
    setSelectedMock('');
    setUploadedFilename('');
  };

  return (
    <div className="glass-card">
      <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Camera size={22} />
          AMBIENT TICKET & CREDENTIAL SCANNER
        </span>
        {previewUrl && (
          <button 
            onClick={resetScanner} 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={12} />
            Reset Scanner
          </button>
        )}
      </h3>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
        Snap or upload a photo of a ticket or credential to verify gate authenticity, extract seat sectors, and get step-free path guides.
      </p>

      {/* Toggles for quick demos */}
      <div className="speech-helpers" style={{ marginBottom: '1.25rem' }}>
        <button 
          className="speech-tag" 
          onClick={() => {
            setPreviewUrl(null);
            handleScan('vip');
          }}
          style={{ border: selectedMock === 'vip' ? '1px solid var(--color-accent)' : '1px solid var(--border-color)', background: 'transparent' }}
        >
          👑 Sim VIP Pass Scan
        </button>
        <button 
          className="speech-tag" 
          onClick={() => {
            setPreviewUrl(null);
            handleScan('accessible');
          }}
          style={{ border: selectedMock === 'accessible' ? '1px solid var(--color-accent)' : '1px solid var(--border-color)', background: 'transparent' }}
        >
          ♿ Sim Wheelchair Pass
        </button>
        <button 
          className="speech-tag" 
          onClick={() => {
            setPreviewUrl(null);
            handleScan('fake');
          }}
          style={{ border: selectedMock === 'fake' ? '1px solid var(--color-danger)' : '1px solid var(--border-color)', background: 'transparent' }}
        >
          ⚠️ Sim Mismatched Ticket
        </button>
      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }}
      />

      {/* Drag & Drop Visual Box */}
      <div 
        onClick={triggerFileSelect}
        style={{ 
          height: '200px', 
          border: previewUrl ? '2px solid var(--color-primary)' : '2px dashed var(--border-color)', 
          borderRadius: 'var(--radius-sm)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '0.75rem',
          background: previewUrl ? 'black' : 'rgba(255,255,255,0.01)',
          cursor: 'pointer',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Ticket Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {/* Green Scanning line indicator */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '3px',
              background: '#00ff00',
              boxShadow: '0 0 12px #00ff00',
              animation: 'scanLine 2s linear infinite',
              top: 0
            }} />
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              background: 'rgba(0,0,0,0.7)', 
              color: '#00ff00', 
              padding: '0.2rem 0.6rem', 
              fontSize: '0.75rem', 
              borderRadius: '4px',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}>
              {isScanning ? 'SCANNING CUSTOM UPLOAD...' : 'TAP IMAGE TO CHANGE PHOTO'}
            </div>
          </>
        ) : (
          <>
            <UploadCloud size={40} style={{ color: 'var(--text-muted)' }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 'bold', display: 'block' }}>
                {isScanning ? 'Processing Visual Scan...' : 'DRAG & DROP OR TAP TO UPLOAD TICKET'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Supports PNG, JPG, or PDF ticket screen captures
              </span>
            </div>
          </>
        )}
      </div>

      {scanResult && (
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: `2px solid ${scanResult.is_valid ? 'var(--border-color)' : 'var(--color-danger)'}`, 
          padding: '1rem',
          borderRadius: 'var(--radius-sm)'
        }}>

          {/* NOT A VALID TICKET — full-width rejection banner */}
          {!scanResult.is_valid && scanResult.category === 'INVALID DOCUMENT' && (
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '2px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🚫</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '900',
                color: 'var(--color-danger)',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
                textTransform: 'uppercase'
              }}>
                NOT A VALID TICKET
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                The uploaded image <strong style={{ color: 'var(--text-main)' }}>
                  {uploadedFilename || 'unknown file'}
                </strong> is not recognised as a FIFA World Cup 2026 ticket or credential.
                No seat data could be extracted.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', color: scanResult.is_valid ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {scanResult.is_valid ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
              {scanResult.is_valid ? 'VALID TICKET DETECTED' : 
                scanResult.category === 'INVALID DOCUMENT' ? 'DOCUMENT REJECTED — NOT A TICKET' : 'ALERT: SECURITY VERIFICATION FAILURE'}
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {scanResult.category}
            </span>
          </div>

          {/* Only show seat grid if actual ticket data is present */}
          {scanResult.category !== 'INVALID DOCUMENT' && (
            <div className="ticket-grid">
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>GATE</span>
                <strong style={{ fontSize: '0.9rem' }}>{scanResult.gate || 'N/A'}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>SECTION</span>
                <strong style={{ fontSize: '0.9rem' }}>{scanResult.section || 'N/A'}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>ROW</span>
                <strong style={{ fontSize: '0.9rem' }}>{scanResult.row || 'N/A'}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>SEAT</span>
                <strong style={{ fontSize: '0.9rem' }}>{scanResult.seat || 'N/A'}</strong>
              </div>
            </div>
          )}

          {!scanResult.is_valid && scanResult.issue_detected && scanResult.issue_detected !== 'None' && (
            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', fontSize: '0.8rem', color: 'var(--color-danger)', marginBottom: '1rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
              <strong>Issue:</strong> {scanResult.issue_detected}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>GATE REDIRECTION PLAYBOOK</span>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4', fontWeight: '600' }}>
              {scanResult.volunteer_action_guide}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketScanner;
