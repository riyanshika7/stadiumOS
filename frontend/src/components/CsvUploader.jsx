import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertTriangle, Database, Send } from 'lucide-react';
import { API_BASE_URL } from '../constants';

function CsvUploader({ onUploadSuccess }) {
  // File states
  const [csvFile, setCsvFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [dbFile, setDbFile] = useState(null);
  
  // Status states
  const [activeTab, setActiveTab] = useState('csv'); // csv, pdf, db
  const [statusMsg, setStatusMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // RAG query states
  const [playbookQuery, setPlaybookQuery] = useState('');
  const [ragAnswer, setRagAnswer] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);

  const handleUpload = async (fileType, file) => {
    if (!file) {
      setStatusMsg(`Please select a ${fileType.toUpperCase()} file first.`);
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setStatusMsg('');
    
    const formData = new FormData();
    formData.append('file', file);

    let endpoint = '/api/crowd/upload-csv';
    if (fileType === 'pdf') endpoint = '/api/crowd/upload-pdf';
    else if (fileType === 'db') endpoint = '/api/crowd/upload-db';

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
        setStatusMsg(data.message || 'File processed successfully.');
        // Reset file input
        if (fileType === 'csv') setCsvFile(null);
        else if (fileType === 'pdf') setPdfFile(null);
        else if (fileType === 'db') setDbFile(null);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setIsSuccess(false);
        setStatusMsg(data.detail || 'Upload failed.');
      }
    } catch (err) {
      console.error(err);
      setIsSuccess(false);
      setStatusMsg('Connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRAGQuery = async (e) => {
    e.preventDefault();
    if (!playbookQuery.trim()) return;

    setIsQuerying(true);
    setRagAnswer('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/playbook/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: playbookQuery }),
      });
      const data = await res.json();
      if (res.ok) {
        setRagAnswer(data.answer);
      } else {
        setRagAnswer('Failed to query playbook.');
      }
    } catch (err) {
      console.error(err);
      setRagAnswer('Connection failed.');
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
        ⚙️ JURY TESTING PORTAL
      </h3>
      
      {/* Tab Selector */}
      <div role="tablist" aria-label="Jury Testing Tools" style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          role="tab"
          id="tab-csv"
          aria-selected={activeTab === 'csv'}
          aria-controls="panel-csv"
          onClick={() => { setActiveTab('csv'); setStatusMsg(''); }}
          style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: activeTab === 'csv' ? 'var(--color-primary)' : 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          CSV Density
        </button>
        <button 
          role="tab"
          id="tab-pdf"
          aria-selected={activeTab === 'pdf'}
          aria-controls="panel-pdf"
          onClick={() => { setActiveTab('pdf'); setStatusMsg(''); }}
          style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: activeTab === 'pdf' ? 'var(--color-primary)' : 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          PDF Playbook
        </button>
        <button 
          role="tab"
          id="tab-db"
          aria-selected={activeTab === 'db'}
          aria-controls="panel-db"
          onClick={() => { setActiveTab('db'); setStatusMsg(''); }}
          style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: activeTab === 'db' ? 'var(--color-primary)' : 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          SQL DB
        </button>
        <button 
          role="tab"
          id="tab-chaos"
          aria-selected={activeTab === 'chaos'}
          aria-controls="panel-chaos"
          onClick={() => { setActiveTab('chaos'); setStatusMsg(''); }}
          style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: activeTab === 'chaos' ? 'var(--color-primary)' : 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Chaos Sandbox
        </button>
      </div>

      {/* CSV TAB */}
      {activeTab === 'csv' && (
        <div id="panel-csv" role="tabpanel" aria-labelledby="tab-csv">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.3' }}>
            Upload custom zone CSV files to trigger Explainable AI (XAI) redirect alerts.
          </p>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => setCsvFile(e.target.files[0])}
                id="csv-file-selector"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="csv-file-selector" 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', flex: 1 }}
              >
                Choose CSV
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {csvFile ? csvFile.name : 'No file selected'}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleUpload('csv', csvFile)}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', gap: '0.5rem' }} 
            disabled={isLoading || !csvFile}
          >
            <Upload size={12} />
            Ingest CSV Densities
          </button>
        </div>
      )}

      {/* PDF TAB */}
      {activeTab === 'pdf' && (
        <div id="panel-pdf" role="tabpanel" aria-labelledby="tab-pdf">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.3' }}>
            Upload an SOP/Playbook PDF to index guidelines, then query them via GenAI RAG.
          </p>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setPdfFile(e.target.files[0])}
                id="pdf-file-selector"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="pdf-file-selector" 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', flex: 1 }}
              >
                Choose PDF
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {pdfFile ? pdfFile.name : 'No file selected'}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleUpload('pdf', pdfFile)}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', gap: '0.5rem', marginBottom: '1rem' }} 
            disabled={isLoading || !pdfFile}
          >
            <Upload size={12} />
            Upload PDF SOP
          </button>

          {/* RAG Query Box */}
          <form onSubmit={handleRAGQuery} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-accent)', display: 'block', marginBottom: '0.25rem' }}>
              Query Playbook (GenAI RAG)
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <input 
                type="text" 
                value={playbookQuery}
                onChange={(e) => setPlaybookQuery(e.target.value)}
                placeholder="Ask lost child SOP, etc..."
                style={{ flex: 1, padding: '0.35rem', fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem' }} disabled={isQuerying}>
                <Send size={12} />
              </button>
            </div>
            {ragAnswer && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                <strong>Answer:</strong> {ragAnswer}
              </div>
            )}
          </form>
        </div>
      )}

      {/* SQL DB TAB */}
      {activeTab === 'db' && (
        <div id="panel-db" role="tabpanel" aria-labelledby="tab-db">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.3' }}>
            Replace the active database with a custom SQLite `.db` file containing new stadium nodes.
          </p>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept=".db" 
                onChange={(e) => setDbFile(e.target.files[0])}
                id="db-file-selector"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="db-file-selector" 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', flex: 1 }}
              >
                Choose SQLite DB
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {dbFile ? dbFile.name : 'No file selected'}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleUpload('db', dbFile)}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', gap: '0.5rem' }} 
            disabled={isLoading || !dbFile}
          >
            <Database size={12} />
            Replace Database
          </button>
        </div>
      )}

      {/* CHAOS SANDBOX TAB */}
      {activeTab === 'chaos' && (
        <div id="panel-chaos" role="tabpanel" aria-labelledby="tab-chaos" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3', marginBottom: '0.25rem' }}>
            Trigger simulated chaos events. The backend intercepts errors gracefully and outputs actionable fallback diagnostics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/chaos/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scenario: 'corrupt_csv' })
                  });
                  const data = await res.json();
                  setIsSuccess(data.status === 'gracefully_caught');
                  setStatusMsg(`Caught Corrupt CSV Error: "${data.error_caught}". System Action: ${data.fallback_message}\nSOP: ${data.resolution_steps.join(' | ')}`);
                } catch(err) {
                  setIsSuccess(false);
                  setStatusMsg('Chaos trigger connection failure.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', background: 'rgba(239,68,68,0.05)', display: 'block', width: '100%', textAlign: 'left' }}
              disabled={isLoading}
            >
              💥 Simulate Corrupt CSV Data
            </button>

            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/chaos/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scenario: 'simultaneous_capacity' })
                  });
                  const data = await res.json();
                  setIsSuccess(data.status === 'gracefully_caught');
                  setStatusMsg(`Caught Capacity Error: "${data.error_caught}". System Action: ${data.fallback_message}\nSOP: ${data.resolution_steps.join(' | ')}`);
                } catch(err) {
                  setIsSuccess(false);
                  setStatusMsg('Chaos trigger connection failure.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', background: 'rgba(245,158,11,0.05)', display: 'block', width: '100%', textAlign: 'left' }}
              disabled={isLoading}
            >
              💥 Simulate Simultaneous 100% Capacity at Multiple Gates
            </button>

            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/chaos/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scenario: 'unknown_audio' })
                  });
                  const data = await res.json();
                  setIsSuccess(data.status === 'gracefully_caught');
                  setStatusMsg(`Caught Audio Error: "${data.error_caught}". System Action: ${data.fallback_message}\nSOP: ${data.resolution_steps.join(' | ')}`);
                } catch(err) {
                  setIsSuccess(false);
                  setStatusMsg('Chaos trigger connection failure.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem', border: '1px solid rgba(70,243,255,0.4)', color: '#46F3FF', background: 'rgba(70,243,255,0.05)', display: 'block', width: '100%', textAlign: 'left' }}
              disabled={isLoading}
            >
              💥 Simulate Unknown Audio Language Input
            </button>
          </div>
        </div>
      )}

      {/* Status Output */}
      {statusMsg && (
        <div style={{ 
          marginTop: '0.75rem', 
          padding: '0.5rem 0.75rem', 
          borderRadius: '4px', 
          fontSize: '0.72rem',
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          background: isSuccess ? 'rgba(0, 135, 90, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          color: isSuccess ? 'var(--color-success)' : 'var(--color-danger)',
          border: `1px solid ${isSuccess ? 'rgba(0,135,90,0.15)' : 'rgba(239,68,68,0.15)'}`,
          lineHeight: '1.2'
        }}>
          {isSuccess ? <CheckCircle2 size={12} style={{ flexShrink: 0 }} /> : <AlertTriangle size={12} style={{ flexShrink: 0 }} />}
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
}

export default CsvUploader;
