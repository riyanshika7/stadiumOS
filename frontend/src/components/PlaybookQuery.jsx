import React from 'react';
import { Send } from 'lucide-react';

export default function PlaybookQuery({
  playbookQuery,
  setPlaybookQuery,
  handleRAGQuery,
  isQuerying,
  ragAnswer
}) {
  return (
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
  );
}
