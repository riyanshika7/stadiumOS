import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { API_BASE_URL } from '../constants';

function IncidentForm({ onIncidentSubmitted }) {
  const [incidentText, setIncidentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!incidentText.trim()) return;

    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: incidentText }),
      });
      if (res.ok) {
        setIncidentText('');
        setMessage('Incident logged successfully!');
        if (onIncidentSubmitted) {
          onIncidentSubmitted(incidentText, false);
        }
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage('Error logging incident.');
      }
    } catch (err) {
      console.error("Connection failed, caching offline:", err);
      // Fallback to offline local caching
      if (onIncidentSubmitted) {
        onIncidentSubmitted(incidentText, true);
        setIncidentText('');
        setMessage('Offline: Incident cached in local storage.');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage('Failed to connect to server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTemplate = (template) => {
    setIncidentText(template);
  };

  return (
    <section className="glass-card">
      <h3 className="card-title">
        <PlusCircle size={22} />
        DYNAMIC INCIDENT REPORTING
      </h3>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
        Report a hazard, medical issue, or lost item. StadiumOS parses the text, extracts the location, sets the urgency, and updates command center logs.
      </p>

      <div className="speech-helpers" role="group" aria-label="Quick-fill incident templates">
        <button
          type="button"
          className="speech-tag"
          onClick={() => fillTemplate('Medical emergency: an elderly fan has fainted near Section 204 Row E due to heat.')}
        >
          📋 Medical Template
        </button>
        <button
          type="button"
          className="speech-tag"
          onClick={() => fillTemplate('Hazard: soft drink spilled at Concession Stand North, slippery floor.')}
        >
          📋 Spill Hazard Template
        </button>
        <button
          type="button"
          className="speech-tag"
          onClick={() => fillTemplate('Lost item: found a blue backpack containing passport near Restroom Block A.')}
        >
          📋 Lost Item Template
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="incident-text">Describe the Incident / Report</label>
          <textarea
            id="incident-text"
            value={incidentText}
            onChange={(e) => setIncidentText(e.target.value)}
            placeholder="Describe the issue in detail, mentioning location if possible..."
            rows={3}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
            {isSubmitting ? 'Parsing...' : 'Submit Report'}
          </button>
          {message && (
            <span style={{ fontSize: '0.9rem', color: message.includes('Error') || message.includes('Failed') ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: '600' }}>
              {message}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

export default IncidentForm;
