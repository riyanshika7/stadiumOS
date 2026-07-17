import React from 'react';
import { Clock } from 'lucide-react';

export default function IncidentsLog({
  incidents,
  incidentViewTab,
  setIncidentViewTab,
  filteredIncidents,
  isServerOffline,
  resolveIncident
}) {
  return (
    <div className="glass-card incidents-log-card">
      <h3 className="card-title incidents-log-title">
        <Clock size={18} />
        LIVE INCIDENTS LOG
      </h3>

      <div className="incident-tab-bar">
        <button 
          onClick={() => setIncidentViewTab('active')}
          className={`incident-tab-btn ${incidentViewTab === 'active' ? 'active' : ''}`}
        >
          Active ({incidents.filter(i => i.status !== 'resolved').length})
        </button>
        <button 
          onClick={() => setIncidentViewTab('history')}
          className={`incident-tab-btn ${incidentViewTab === 'history' ? 'active' : ''}`}
        >
          History ({incidents.filter(i => i.status === 'resolved').length})
        </button>
      </div>
      
      <div className="incident-list" style={{ flex: 1 }}>
        {filteredIncidents.length === 0 ? (
          <p className="incident-empty">
            No {incidentViewTab === 'active' ? 'active' : 'resolved'} incidents.
          </p>
        ) : (
          filteredIncidents.map((inc) => (
            <div key={inc.id} className="incident-card incident-card-content">
              <div className="incident-card-header">
                <div className="incident-header-row">
                  <span className={`badge urgency-${inc.urgency.toLowerCase()}`}>{inc.urgency}</span>
                  <span className={`badge status-${inc.status}`}>{inc.status}</span>
                </div>
                {inc.status === 'open' && !isServerOffline && (
                  <button 
                    onClick={() => resolveIncident(inc.id)}
                    className="btn incident-resolve-btn"
                  >
                    Resolve
                  </button>
                )}
              </div>
              <p className="incident-desc">{inc.description}</p>
              <div className="incident-card-footer">
                <span>📍 {inc.location}</span>
                <span>Category: {inc.category}</span>
              </div>
              {inc.required_action && (
                <div className="incident-action-box">
                  <strong>Action:</strong> {inc.required_action}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
