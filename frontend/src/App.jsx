import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Clock,
  UserCheck,
  Sun,
  WifiOff,
  Eye
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
import LandingPage from './components/LandingPage';
import WhatIfSimulator from './components/WhatIfSimulator';
import useAudioFeedback from './hooks/useAudioFeedback';
import { InclusiveModeProvider } from './hooks/useInclusiveMode';
import InclusiveModePanel from './components/InclusiveMode';
import { API_BASE_URL, LIVE_POLL_INTERVAL_MS, OFFLINE_INCIDENTS_KEY } from './constants';

// Lazy-load the 3D Digital Twin — loads Three.js only when the dashboard
// tab is actually visited, shaving ~500 kB from the initial bundle.
const DashboardDigitalTwin = lazy(() =>
  import('./components/DashboardDigitalTwin')
);

const COMMANDS = [
  { id: 'sim-medical', name: '🚨 Simulate Urgent Medical Incident', category: 'Simulation', action: 'medical' },
  { id: 'sim-surge', name: '📈 Simulate Crowd Congestion at Gate C', category: 'Simulation', action: 'surge' },
  { id: 'glare', name: '☀ Toggle Glare Mode (Outdoor Display)', category: 'Settings', action: 'glare' },
  { id: 'nav-medical', name: '🧭 Plan Route to Medical Centre', category: 'Navigation', action: 'route-medical' },
  { id: 'nav-gatec', name: '🧭 Plan Route to Gate C', category: 'Navigation', action: 'route-gatec' },
  { id: 'clear-alerts', name: '🗑 Clear Bulletin Alerts', category: 'Management', action: 'clear' },
];

function CommandBar({ isOpen, onClose, onExecute }) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onExecute(filtered[selectedIndex].action);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="command-bar-overlay" onClick={onClose}>
      <div className="command-bar-window" onClick={e => e.stopPropagation()}>
        <div className="command-bar-search-wrapper">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search actions... (e.g. simulate, glare, route)" 
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
            className="command-bar-input"
          />
        </div>
        <div className="command-bar-list">
          {filtered.length === 0 ? (
            <div className="command-bar-empty">No commands matched.</div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div 
                  key={cmd.id} 
                  className={`command-bar-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => { onExecute(cmd.action); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span>{cmd.name}</span>
                  <span className="command-bar-badge">{cmd.category}</span>
                </div>
              );
            })
          )}
        </div>
        <div className="command-bar-footer">
          <span>↑↓ to navigate</span>
          <span>⏎ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [isGlareMode, setIsGlareMode] = useState(false);
  
  // Custom Command states (Top 1% Redesign)
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [routeStart, setRouteStart] = useState("");
  const [routeDest, setRouteDest] = useState("");

  // Offline-First Sync state variables
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [offlineIncidents, setOfflineIncidents] = useState([]);

  // Sidebar incident view tab state (Active vs History)
  const [incidentViewTab, setIncidentViewTab] = useState('active'); // active, history

  useEffect(() => {
    // Load initial offline queue from local storage if present
    const cached = localStorage.getItem(OFFLINE_INCIDENTS_KEY);
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
    }, LIVE_POLL_INTERVAL_MS);

    // Global Command Bar key listener (Ctrl+K or Cmd+K)
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);
  const playAudioFeedback = useAudioFeedback();

  const executeCommand = async (action) => {
    playAudioFeedback('click');
    switch (action) {
      case 'medical':
        setActiveNode({ name: "Medical Centre", position: [2.5, 0.2, 2.5], color: "#22c55e" });
        try {
          await fetch(`${API_BASE_URL}/api/incident`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: "Spanish-speaking fan reporting severe chest pain near MetLife Medical Centre." }),
          });
          fetchIncidents();
          fetchAlerts();
          playAudioFeedback('alert');
        } catch (e) {
          console.error(e);
        }
        break;
      case 'surge':
        setActiveNode({ name: "Gate C", position: [0, 0.2, 4.8], color: "#00C8FF" });
        try {
          await fetch(`${API_BASE_URL}/api/incident`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: "Gate C density crosses 80%. Suggesting crowd redirection routes." }),
          });
          fetchIncidents();
          fetchAlerts();
          playAudioFeedback('alert');
        } catch (e) {
          console.error(e);
        }
        break;
      case 'glare':
        setIsGlareMode((prev) => !prev);
        break;
      case 'route-medical':
        setRouteStart("Gate A");
        setRouteDest("Medical Centre");
        break;
      case 'route-gatec':
        setRouteStart("Gate D");
        setRouteDest("Gate C");
        break;
      case 'clear':
        try {
          await fetch(`${API_BASE_URL}/api/alerts/clear`, { method: 'POST' });
          fetchAlerts();
        } catch (e) {
          console.error(e);
        }
        break;
      default:
        break;
    }
  };
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
    const cached = localStorage.getItem(OFFLINE_INCIDENTS_KEY);
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
        localStorage.removeItem(OFFLINE_INCIDENTS_KEY);
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
      localStorage.setItem(OFFLINE_INCIDENTS_KEY, JSON.stringify(newQueue));
      
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

  if (currentView === 'landing') {
    return (
      <LandingPage onEnterConsole={() => setCurrentView('dashboard')} />
    );
  }

  return (
    <div className="app-container">
      {/* WCAG 2.4.1 — Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
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
          {/* ♿ Inclusive Mode Controls: Deaf Fan Mode + Wheelchair Mode */}
          <InclusiveModePanel />

          <button 
            id="glare-mode-toggle"
            onClick={toggleGlareMode} 
            aria-pressed={isGlareMode}
            aria-label="Toggle Glare Mode for outdoor high contrast display"
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
          
          <button 
            onClick={() => setCurrentView('landing')} 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.8rem', 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
          >
            🏟️ Exit Console
          </button>

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
        <main id="main-content" className="main-content" tabIndex="-1" aria-label="Stadium Operations Dashboard">
          
          {/* Top Ambient Proactive Insights Banner */}
          <AmbientInsights locations={locations} alerts={alerts} incidents={incidents} />

          {/* Top Alerts feed */}
          <AlertFeed alerts={alerts} />

          {/* DYNAMIC 3D DIGITAL TWIN COCKPIT (lazy-loaded — Three.js only downloads when needed) */}
          <Suspense fallback={
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '520px', color: 'var(--color-primary)', fontSize: '0.9rem', gap: '0.75rem' }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
              Loading 3D Digital Twin...
            </div>
          }>
            <DashboardDigitalTwin
              activeNode={activeNode}
              onNodeSelect={setActiveNode}
              onTriggerSimulation={executeCommand}
              onSetRouteStart={setRouteStart}
              onSetRouteDest={setRouteDest}
            />
          </Suspense>

          {/* Double Column Panels: Translation and Navigation */}
          <section className="action-area">
            
            {/* Panel 1: Translation Co-Pilot */}
            <Translator />

            {/* Panel 2: Accessibility Navigation Planner */}
            <MapViewer 
              locations={locations} 
              forcedStart={routeStart}
              forcedEnd={routeDest}
            />

          </section>

          {/* New V2.0 Multimodal Credential Vision Scanner */}
          <TicketScanner />

           {/* New V2.0 Hierarchical Agent Swarm Orchestrator */}
          <SwarmOrchestrator />

          {/* AI "What-If" Concourse Congestion Simulator (Top 1% Redesign) */}
          <WhatIfSimulator />

          {/* New V2.0 Live CCTV Predictive Triage */}
          <CctvMonitor />

          {/* Bottom section: Incident Reporting */}
          <IncidentForm onIncidentSubmitted={handleIncidentOfflineIntercept} />

        </main>
      </div>
      <CommandBar 
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onExecute={executeCommand}
      />
    </div>
  );
}

export default App;
