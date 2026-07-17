import React, { lazy, Suspense, useEffect, useState } from 'react';
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
import useDashboardState from './hooks/useDashboardState';
import CommandBar from './components/CommandBar';
import DashboardHeader from './components/DashboardHeader';
import IncidentsLog from './components/IncidentsLog';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import AuthScreen from './components/AuthScreen';
import useToast from './hooks/useToast';
import CopilotModal from './components/CopilotModal';
import { VIEW_LANDING, VIEW_MISSION_CONTROL, VIEW_DASHBOARD } from './constants';

const DashboardDigitalTwin = lazy(() =>
  import('./components/DashboardDigitalTwin')
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [volunteerId, setVolunteerId] = useState('');
  const toast = useToast();

  const {
    currentView,
    setCurrentView,
    locations,
    alerts,
    incidents,
    isGlareMode,
    isCommandBarOpen,
    setIsCommandBarOpen,
    activeNode,
    setActiveNode,
    routeStart,
    setRouteStart,
    routeDest,
    setRouteDest,
    isServerOffline,
    offlineIncidents,
    incidentViewTab,
    setIncidentViewTab,
    deafMode,
    captionText,
    setCaptionText,
    executeCommand,
    handleIncidentSubmitted,
    handleIncidentOfflineIntercept,
    resolveIncident,
    toggleGlareMode,
    filteredIncidents,
    missionStatus,
    activeSection,
    setActiveSection,
    toggleView,
    fetchMissionStatus,
    copilotResult,
    setCopilotResult,
    copilotQuery,
    setCopilotQuery,
    isCopilotModalOpen,
    setIsCopilotModalOpen
  } = useDashboardState(toast);

  const handleLogin = (id) => {
    setVolunteerId(id);
    setIsAuthenticated(true);
    toast.success(`Welcome, ${id}`);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  useEffect(() => {
    if (currentView === VIEW_MISSION_CONTROL) {
      fetchMissionStatus();
    }
  }, [currentView]);

  if (currentView === VIEW_LANDING) {
    return (
      <LandingPage onEnterConsole={() => setCurrentView(VIEW_DASHBOARD)} />
    );
  }

  if (currentView === VIEW_MISSION_CONTROL) {
    return (
      <div className="app-container">
        <DashboardHeader
          isServerOffline={isServerOffline}
          offlineIncidentsCount={offlineIncidents.length}
          isGlareMode={isGlareMode}
          toggleGlareMode={toggleGlareMode}
          onExitConsole={() => setCurrentView(VIEW_LANDING)}
          currentView={currentView}
          onToggleView={toggleView}
          overallStatus={missionStatus?.overall_status}
          volunteerId={volunteerId}
        />
        <main id="main-content" className="mission-control-layout" tabIndex="-1" aria-label="Mission Control">
          <div className="mc-status-bar">
            <div className={`mc-status-badge ${missionStatus?.overall_status || 'nominal'}`}>
              <span className="mc-status-dot"></span>
              {(missionStatus?.overall_status || 'NOMINAL').toUpperCase()}
            </div>
            <div className="mc-readiness">
              <div className="mc-readiness-bar">
                <div className="mc-readiness-fill" style={{ width: `${missionStatus?.operational_readiness || 92}%` }}></div>
              </div>
              <span>{missionStatus?.operational_readiness || 92}% READINESS</span>
            </div>
            <div className="mc-timestamp">
              Last updated: {missionStatus?.last_updated ? new Date(missionStatus.last_updated * 1000).toLocaleTimeString() : '...'}
            </div>
          </div>

          <div className="mc-grid">
            <div className="mc-card mc-card-overview">
              <h3 className="mc-card-title">🎯 STADIUM OVERVIEW</h3>
              <div className="mc-overview-stats">
                <div className="mc-stat">
                  <span className="mc-stat-value">{missionStatus?.crowd ? Object.keys(missionStatus.crowd).length : '—'}</span>
                  <span className="mc-stat-label">Zones</span>
                </div>
                <div className="mc-stat">
                  <span className="mc-stat-value">{missionStatus?.incidents?.length || 0}</span>
                  <span className="mc-stat-label">Incidents</span>
                </div>
                <div className="mc-stat">
                  <span className="mc-stat-value">{missionStatus?.alerts?.length || 0}</span>
                  <span className="mc-stat-label">Alerts</span>
                </div>
                <div className="mc-stat">
                  <span className="mc-stat-value">{missionStatus?.weather?.temperature || '—'}°</span>
                  <span className="mc-stat-label">Temperature</span>
                </div>
              </div>
            </div>

            <div className="mc-card mc-card-crowd">
              <h3 className="mc-card-title">👥 CROWD DENSITY</h3>
              <div className="mc-crowd-grid">
                {missionStatus?.crowd && Object.entries(missionStatus.crowd).map(([name, data]) => (
                  <div key={name} className={`mc-zone-item ${data.level}`}>
                    <span className="mc-zone-name">{name}</span>
                    <span className={`mc-zone-level badge urgency-${data.level === 'high' ? 'high' : data.level === 'moderate' ? 'medium' : 'low'}`}>
                      {data.level.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mc-card mc-card-incidents">
              <h3 className="mc-card-title">🚨 ACTIVE INCIDENTS</h3>
              <div className="mc-incident-feed">
                {(missionStatus?.incidents || []).length === 0 && (
                  <div className="mc-empty">No active incidents</div>
                )}
                {(missionStatus?.incidents || []).map((inc) => (
                  <div key={inc.id} className="mc-incident-item">
                    <span className={`badge urgency-${inc.urgency === 'high' || inc.urgency === 'critical' ? 'high' : 'medium'}`}>
                      {inc.urgency.toUpperCase()}
                    </span>
                    <span className="mc-incident-desc">{inc.category} at {inc.location}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mc-card mc-card-weather">
              <h3 className="mc-card-title">🌤️ WEATHER</h3>
              <div className="mc-weather-info">
                <div className="mc-weather-temp">{missionStatus?.weather?.temperature || '—'}°C</div>
                <div className="mc-weather-humidity">Humidity: {missionStatus?.weather?.humidity || '—'}%</div>
                <div className="mc-weather-alerts">
                  {(missionStatus?.weather?.alerts || []).map((w, i) => (
                    <div key={i} className="mc-weather-alert">⚠️ {w}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mc-card mc-card-deployment">
              <h3 className="mc-card-title">📋 VOLUNTEER DEPLOYMENT</h3>
              <div className="mc-deploy-grid">
                <div className="mc-deploy-stat">
                  <span className="mc-stat-value">{missionStatus?.volunteers?.deployed || 0}</span>
                  <span className="mc-stat-label">Deployed</span>
                </div>
                <div className="mc-deploy-stat">
                  <span className="mc-stat-value">{missionStatus?.volunteers?.available || 0}</span>
                  <span className="mc-stat-label">Available</span>
                </div>
                <div className="mc-deploy-stat">
                  <span className="mc-stat-value">{missionStatus?.volunteers?.total || 0}</span>
                  <span className="mc-stat-label">Total</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        <CommandBar
          isOpen={isCommandBarOpen}
          onClose={() => setIsCommandBarOpen(false)}
          onExecute={executeCommand}
        />
        <CopilotModal
          isOpen={isCopilotModalOpen}
          result={copilotResult}
          query={copilotQuery}
          onClose={() => setIsCopilotModalOpen(false)}
        />
        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Hidden screen reader announcement region for live alerts (WCAG 4.1.3 Live Regions) */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {alerts.length > 0 ? `Alert Update: ${alerts[0].title} — ${alerts[0].message}` : ''}
      </div>
      <DashboardHeader
        isServerOffline={isServerOffline}
        offlineIncidentsCount={offlineIncidents.length}
        isGlareMode={isGlareMode}
        toggleGlareMode={toggleGlareMode}
        onExitConsole={() => setCurrentView('landing')}
        currentView={currentView}
        onToggleView={toggleView}
        overallStatus={missionStatus?.overall_status}
        volunteerId={volunteerId}
      />

      <div className="dashboard-grid">
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

          <CsvUploader onUploadSuccess={handleIncidentSubmitted} />

          <IncidentsLog 
            incidents={incidents}
            incidentViewTab={incidentViewTab}
            setIncidentViewTab={setIncidentViewTab}
            filteredIncidents={filteredIncidents}
            isServerOffline={isServerOffline}
            resolveIncident={resolveIncident}
          />
        </aside>

        <main id="main-content" className="main-content" tabIndex="-1" aria-label="Stadium Operations Dashboard">
          <AmbientInsights locations={locations} alerts={alerts} incidents={incidents} />
          <AlertFeed alerts={alerts} />

          <ErrorBoundary>
            <Suspense fallback={
              <div className="glass-card suspense-fallback">
                <span className="suspense-spinner">⟳</span>
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
          </ErrorBoundary>

          <ErrorBoundary>
            <section className="action-area">
              <Translator />
              <MapViewer 
                locations={locations} 
                forcedStart={routeStart}
                forcedEnd={routeDest}
              />
            </section>
          </ErrorBoundary>

          <ErrorBoundary>
            <TicketScanner />
          </ErrorBoundary>
          <ErrorBoundary>
            <SwarmOrchestrator />
          </ErrorBoundary>
          <ErrorBoundary>
            <WhatIfSimulator />
          </ErrorBoundary>
          <ErrorBoundary>
            <CctvMonitor />
          </ErrorBoundary>
          <ErrorBoundary>
            <IncidentForm onIncidentSubmitted={handleIncidentOfflineIntercept} />
          </ErrorBoundary>

          {deafMode && captionText && (
            <div 
              role="alert" 
              aria-live="assertive" 
              className="caption-banner"
            >
              <div className="caption-header">
                <span className="caption-label">🧏 Real-Time Closed Captions (CC)</span>
                <button 
                  onClick={() => setCaptionText('')} 
                  aria-label="Dismiss caption"
                  className="caption-dismiss"
                >
                  ✕
                </button>
              </div>
              {captionText}
            </div>
          )}
        </main>
      </div>
      <CommandBar 
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onExecute={executeCommand}
      />
      <CopilotModal
        isOpen={isCopilotModalOpen}
        result={copilotResult}
        query={copilotQuery}
        onClose={() => setIsCopilotModalOpen(false)}
      />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}

export default App;
