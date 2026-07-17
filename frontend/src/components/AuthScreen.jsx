import React, { useState } from 'react';
import { Shield, UserCheck, KeyRound } from 'lucide-react';

export default function AuthScreen({ onLogin }) {
  const [volId, setVolId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!volId.trim() || !pin.trim()) {
      setError('Please enter both Volunteer ID and PIN');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (pin.length < 4) {
        setError('Invalid PIN — must be 4+ digits');
        setIsLoading(false);
        return;
      }
      onLogin(volId.trim());
    }, 600);
  };

  return (
    <div className="auth-overlay">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Shield size={48} style={{ color: '#46F3FF', filter: 'drop-shadow(0 0 12px rgba(70,243,255,0.4))' }} />
        </div>

        <div>
          <h1 className="auth-title">STADIUMOS</h1>
          <p className="auth-subtitle">
            FIFA World Cup 2026 — Volunteer Command Terminal
          </p>
        </div>

        <div className="auth-input-group">
          <label className="auth-label" htmlFor="volId">
            <UserCheck size={12} /> Volunteer ID
          </label>
          <input
            id="volId"
            type="text"
            className="auth-input"
            placeholder="e.g. VOL-4028"
            value={volId}
            onChange={(e) => setVolId(e.target.value.toUpperCase())}
            autoFocus
          />
        </div>

        <div className="auth-input-group">
          <label className="auth-label" htmlFor="pin">
            <KeyRound size={12} /> Security PIN
          </label>
          <input
            id="pin"
            type="password"
            className="auth-input"
            placeholder="Enter your 4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          className="auth-btn"
          disabled={isLoading}
        >
          {isLoading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE'}
        </button>

        <p className="auth-footer">
          Authorized personnel only. All access is logged and monitored.
          Terminal ID: SEC-{Math.random().toString(36).slice(2, 6).toUpperCase()}
        </p>
      </form>
    </div>
  );
}
