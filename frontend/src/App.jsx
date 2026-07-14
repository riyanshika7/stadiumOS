import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  UserCheck,
  Sun,
  Eye,
  WifiOff
} from 'lucide-react';

import AlertFeed from './components/AlertFeed';
import Translator from './components/Translator';
import MapViewer from './components/MapViewer';
import IncidentForm from './components/IncidentForm';
import CsvUploader from './components/CsvUploader';
import TicketScanner from './components/TicketScanner';
import AmbientInsights from './components/AmbientInsights';
import CctvMonitor from './components/CctvMonitor';
import SwarmOrchestrator from './components/SwarmOrchestrator';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [isGlareMode, setIsGlareMode] = useState(false);
  
  // Offline-First Sync state variables
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [offlineIncidents, setOfflineIncidents] = useState([]);

  // Sidebar incident view tab state (Active vs History)
  const [incidentViewTab, setIncidentViewTab] = useState('active'); // active, history

  useEffect(() => {
    // Load initial offline queue from local storage if present
    const cached = localStorage.getItem('offline_incidents');
    if (cached) {
      setOfflineIncidents(JSON.parse(cached));
    }

    fetchLocations();
    fetchAlerts();
    fetchIncidents();

    // Poll for live data and perform background sync check
    const interval = setInterval(() => {
      fetchAlerts();
      fetchIncidents();
      checkAndSyncOfflineQueue();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/locations`);
      const data = await res.json();
      setLocations(data);
      setIsServerOffline(false);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setIsServerOffline(true);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts`);
      const data = await res.json();
      setAlerts(data);
      setIsServerOffline(false);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setIsServerOffline(true);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/incidents`);
      const data = await res.json();
      setIncidents(data);
      setIsServerOffline(false);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setIsServerOffline(true);
    }
  };

  // Background queue syncer when connectivity is restored
  const checkAndSyncOfflineQueue = async () => {
    const cached = localStorage.getItem('offline_incidents');
    if (!cached) return;
    
    const queue = JSON.parse(cached);
    if (queue.length === 0) return;

    console.log(`Attempting to background-sync ${queue.length} offline incidents...`);
    
    try {
      // Test server connection first
      const ping = await fetch(`${API_BASE_URL}/`);
      if (ping.ok) {
        // Post each queued incident
        for (const inc of queue) {
          await fetch(`${API_BASE_URL}/api/incident`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: inc.description }),
          });
        }
        // Clear local cache queue upon successful flush
        localStorage.removeItem('offline_incidents');
        setOfflineIncidents([]);
        fetchIncidents();
        fetchAlerts();
        console.log("Offline queue synced successfully.");
      }
    } catch (err) {
      console.log("Server still offline. Retaining queue in browser storage.");
    }
  };

  const handleIncidentSubmitted = () => {
    fetchIncidents();
    fetchAlerts();
    fetchLocations();
  };

  // Safe incident submission handler for Offline support
  const handleIncidentOfflineIntercept = (incidentDescription, isOffline) => {
    if (isOffline || isServerOffline) {
      const newQueue = [...offlineIncidents, { description: incidentDescription, timestamp: new Date().toISOString() }];
      setOfflineIncidents(newQueue);
      localStorage.setItem('offline_incidents', JSON.stringify(newQueue));
      
      // Inject local mock incident onto the UI list immediately to reassure volunteer
      const tempMockInc = {
        id: Math.random(),
        category: "Pending Sync",
        urgency: "Medium",
        location: "Concourse West",
        description: `[OFFLINE QUEUED] ${incidentDescription}`,
        required_action: "Pending upload to command center server...",
        status: "open",
        reported_at: new Date()
      };
      setIncidents([tempMockInc, ...incidents]);
    } else {
      handleIncidentSubmitted();
    }
  };

  const resolveIncident = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (err) {
      console.error('Error resolving incident:', err);
    }
  };

  const toggleGlareMode = () => {
    const newMode = !isGlareMode;
    setIsGlareMode(newMode);
    if (newMode) {
      document.body.classList.add('high-glare-mode');
    } else {
      document.body.classList.remove('high-glare-mode');
    }
  };

  // Filter incidents depending on the active View Tab
  const filteredIncidents = incidents.filter((inc) => {
    if (incidentViewTab === 'active') {
      return inc.status !== 'resolved';
    } else {
      return inc.status === 'resolved';
    }
  });

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header">
        <div className="logo-section">
          <img
            src="/stadiumos.png"
            alt="StadiumOS — AI Operating System for World-Class Stadiums"
            className="logo-img"
          />
        </div>
        
        {/* Offline Status Warning Bar */}
        {isServerOffline && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '2px solid var(--color-danger)', 
            color: 'var(--color-danger)', 
            padding: '0.4rem 1rem', 
            fontSize: '0.8rem', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'pulse 1.5s infinite'
          }}>
            <WifiOff size={16} />
            <span>LOCAL EDGE SERVER OFFLINE — QUEUEING ACTIVE ({offlineIncidents.length})</span>
          </div>
        )}

        <div className="header-status">
          <button 
            onClick={toggleGlareMode} 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.8rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              border: isGlareMode ? '2px solid #ffff00' : '1px solid var(--border-color)',
              color: isGlareMode ? '#ffff00' : 'var(--text-main)'
            }}
          >
            {isGlareMode ? <Eye size={14} /> : <Sun size={14} />}
            <span>{isGlareMode ? 'DISABLE GLARE MODE' : 'ENABLE GLARE MODE'}</span>
          </button>
          
          <div className="status-indicator" style={{ 
            borderColor: isServerOffline ? 'var(--color-danger)' : 'var(--color-success)',
            color: isServerOffline ? 'var(--color-danger)' : 'var(--color-success)',
            background: isServerOffline ? 'rgba(239,68,68,0.08)' : 'rgba(0,135,90,0.08)'
          }}>
            <div className="status-dot" style={{ 
              backgroundColor: isServerOffline ? 'var(--color-danger)' : 'var(--color-success)',
              boxShadow: `0 0 8px ${isServerOffline ? 'var(--color-danger)' : 'var(--color-success)'}`
            }}></div>
            <span>{isServerOffline ? 'OFFLINE CACHING ACTIVE' : 'STADIUM COMMS ACTIVE'}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <UserCheck size={16} style={{ color: 'var(--color-accent)' }} />
            <span>ID: VOL-4028</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left Sidebar Panel */}
        <aside className="sidebar-panel">
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              🖥️ STADIUMOS BRIEFING
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              You are assigned to the <strong>West Concourse</strong>. Keep your device screen bright. 
              Review the live broadcast feed for crowd surge warnings.
            </p>
          </div>

          {/* Jury Testing & Playbook RAG Portal */}
          <CsvUploader onUploadSuccess={handleIncidentSubmitted} />

          {/* Live Incidents Log Section */}
          <div className="glass-card" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', borderBottom: 'none', paddingBottom: 0 }}>
              <Clock size={18} />
              LIVE INCIDENTS LOG
            </h3>

            {/* Sub-tab view selector */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <button 
                onClick={() => setIncidentViewTab('active')}
                style={{ 
                  flex: 1, 
                  padding: '0.35rem', 
                  fontSize: '0.75rem', 
                  background: incidentViewTab === 'active' ? 'var(--color-primary)' : 'transparent', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--border-color)', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                Active ({incidents.filter(i => i.status !== 'resolved').length})
              </button>
              <button 
                onClick={() => setIncidentViewTab('history')}
                style={{ 
                  flex: 1, 
                  padding: '0.35rem', 
                  fontSize: '0.75rem', 
                  background: incidentViewTab === 'history' ? 'var(--color-primary)' : 'transparent', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--border-color)', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                History ({incidents.filter(i => i.status === 'resolved').length})
              </button>
            </div>
            
            <div className="incident-list" style={{ flex: 1 }}>
              {filteredIncidents.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                  No {incidentViewTab === 'active' ? 'active' : 'resolved'} incidents.
                </p>
              ) : (
                filteredIncidents.map((inc) => (
                  <div key={inc.id} className="incident-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div className="incident-header-row">
                        <span className={`badge urgency-${inc.urgency.toLowerCase()}`}>{inc.urgency}</span>
                        <span className={`badge status-${inc.status}`}>{inc.status}</span>
                      </div>
                      {inc.status === 'open' && !isServerOffline && (
                        <button 
                          onClick={() => resolveIncident(inc.id)}
                          className="btn" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'rgba(0, 135, 90, 0.2)', border: '1px solid var(--color-primary)', color: 'var(--text-main)' }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    <p className="incident-desc">{inc.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>📍 {inc.location}</span>
                      <span>Category: {inc.category}</span>
                    </div>
                    {inc.required_action && (
                      <div style={{ fontSize: '0.75rem', background: 'rgba(255, 199, 44, 0.05)', borderLeft: '2px solid var(--color-accent)', padding: '0.25rem 0.5rem', width: '100%' }}>
                        <strong>Action:</strong> {inc.required_action}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Dashboard Area */}
        <main className="main-content">
          
          {/* Top Ambient Proactive Insights Banner */}
          <AmbientInsights locations={locations} alerts={alerts} incidents={incidents} />

          {/* Top Alerts feed */}
          <AlertFeed alerts={alerts} />

          {/* Double Column Panels: Translation and Navigation */}
          <section className="action-area">
            
            {/* Panel 1: Translation Co-Pilot */}
            <Translator />

            {/* Panel 2: Accessibility Navigation Planner */}
            <MapViewer locations={locations} />

          </section>

          {/* New V2.0 Multimodal Credential Vision Scanner */}
          <TicketScanner />

          {/* New V2.0 Hierarchical Agent Swarm Orchestrator */}
          <SwarmOrchestrator />

          {/* New V2.0 Live CCTV Predictive Triage */}
          <CctvMonitor />

          {/* Bottom section: Incident Reporting */}
          <IncidentForm onIncidentSubmitted={handleIncidentOfflineIntercept} />

        </main>
      </div>
    </div>
  );
}

export default App;
