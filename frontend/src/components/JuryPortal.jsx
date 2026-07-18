import React, { useState, useRef } from 'react';
import { Upload, FileText, Database, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

const FILE_ICONS = {
  '.csv': FileText,
  '.pdf': FileText,
  '.db': Database,
  '.sqlite': Database,
  '.sql': Database,
};

const FILE_ACCEPT = '.csv,.pdf,.db,.sqlite,.sqlite3,.sql';

export default function JuryPortal() {
  const [file, setFile] = useState(null);
  const [scenario, setScenario] = useState('comprehensive');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!FILE_ACCEPT.includes(ext)) {
        setError(`Unsupported file type: ${ext}. Use CSV, PDF, or SQLite.`);
        setFile(null);
        return;
      }
      setFile(f);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('scenario', scenario);

    try {
      const res = await fetch('/api/jury/evaluate', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to run jury evaluation');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'PASS': return '#22c55e';
      case 'PARTIAL': return '#f59e0b';
      case 'FAIL': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px', margin: '2rem auto' }}>
      <h3 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Upload size={20} className="text-accent" />
        <span>🎯 JURY EVALUATION PORTAL</span>
      </h3>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        Upload a CSV, PDF, or SQLite database with real-world stadium data. The system will dynamically
        evaluate incident ingestion, capacity threshold handling, XAI compliance, alert escalation,
        intelligence hub resilience, and GCP integration.
      </p>

      <div className="incident-tab-bar" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={`incident-tab-btn ${file ? 'active' : ''}`}
          onClick={() => inputRef.current?.click()}
          style={{ cursor: 'pointer', textAlign: 'center', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          aria-label={file ? `Change selected file: ${file.name}` : 'Choose File (CSV, PDF, SQLite)'}
        >
          {file ? `📄 ${file.name}` : '📁 Choose File (CSV, PDF, SQLite)'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={FILE_ACCEPT}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="simulator-controls-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="simulator-control-group">
          <label className="simulator-control-label">🧪 Evaluation Scenario</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="simulator-select"
          >
            <option value="comprehensive">Comprehensive (all dimensions)</option>
            <option value="ingest">Bulk Ingest Only</option>
            <option value="capacity">Capacity Threshold Stress</option>
            <option value="xai">XAI Compliance Check</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className="btn simulator-run-btn"
        style={{ marginTop: 0 }}
      >
        {loading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
        {loading ? 'Evaluating...' : 'Run Jury Evaluation'}
      </button>

      {error && (
        <div className="incident-action-box" style={{ marginTop: '1rem', borderLeftColor: '#ef4444' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="fade-in" style={{ marginTop: '1.5rem' }}>
          <div className="simulator-risk-display" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="simulator-risk-level" style={{ color: getVerdictColor(result.verdict), fontSize: '1.5rem' }}>
              {result.verdict}
            </span>
            <span className="simulator-risk-score" style={{ fontSize: '1rem' }}>Score: {result.score}/100</span>
          </div>

          <div className="simulator-gauge" style={{ margin: '1rem 0' }}>
            <div
              className="simulator-gauge-fill"
              style={{ width: `${result.score}%`, background: getVerdictColor(result.verdict) }}
            ></div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{result.summary}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.tests?.map((test, i) => (
              <div
                key={i}
                className="simulator-directive-item"
                style={{
                  borderLeft: `3px solid ${test.passed ? '#22c55e' : '#ef4444'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <span style={{ flexShrink: 0, marginTop: '1px' }}>
                  {test.passed
                    ? <CheckCircle size={14} style={{ color: '#22c55e' }} />
                    : <XCircle size={14} style={{ color: '#ef4444' }} />
                  }
                </span>
                <div>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    {test.test_name.replace(/_/g, ' ')}
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {test.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
