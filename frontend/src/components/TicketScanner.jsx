import React, { useState, useRef, useCallback } from 'react';
import { Camera, UploadCloud } from 'lucide-react';
import { API_BASE_URL } from '../constants';
import TicketScanResult from './TicketScanResult';

// Module-level constant: avoids recreation on every render.
const MOCK_TICKET_B64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP' +
  '//////////////////////////////////////////////////////////////////////' +
  '//////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

function TicketScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMock, setSelectedMock] = useState('');

  // File upload states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const fileInputRef = useRef(null);

  const handleScan = useCallback(async (mockType, customBase64 = null, filename = '') => {
    setIsScanning(true);
    if (!customBase64) {
      setSelectedMock(mockType);
    }
    const payloadB64 = customBase64 || MOCK_TICKET_B64;

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
      console.error('Ticket vision scan connection error:', err);
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fname = file.name;
    setUploadedFilename(fname);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setSelectedMock('custom');
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

      {/* Accessible drag & drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a ticket image to scan"
        onClick={triggerFileSelect}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileSelect(); } }}
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

      <TicketScanResult scanResult={scanResult} uploadedFilename={uploadedFilename} />
    </div>
  );
}

export default TicketScanner;
