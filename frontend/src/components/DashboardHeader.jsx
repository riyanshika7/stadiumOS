import React from 'react';
import { WifiOff, Sun, Eye, UserCheck, LayoutDashboard, Monitor } from 'lucide-react';
import InclusiveModePanel from './InclusiveMode';
import MatchdayClock from './MatchdayClock';

export default function DashboardHeader({
  isServerOffline,
  offlineIncidentsCount,
  isGlareMode,
  toggleGlareMode,
  onExitConsole,
  currentView,
  onToggleView,
  overallStatus,
  volunteerId
}) {
  const isMissionControl = currentView === 'mission_control';
  return (
    <header className="app-header">
      <div className="logo-section">
        <img
          src="/stadiumos.png"
          alt="StadiumOS — AI Operating System for World-Class Stadiums"
          className="logo-img"
        />
        <div className={`header-mode-badge ${isMissionControl ? 'mission-control' : ''}`}>
          {isMissionControl ? '🎯 MISSION CONTROL' : '📋 OPERATIONS DASHBOARD'}
        </div>
      </div>

      {/* Scoreboard Clock */}
      <MatchdayClock />

      
      {/* Offline Status Warning Bar */}
      {isServerOffline && (
        <div className="offline-warning-bar">
          <WifiOff size={16} />
          <span>LOCAL EDGE SERVER OFFLINE — QUEUEING ACTIVE ({offlineIncidentsCount})</span>
        </div>
      )}

      <div className="header-status">
        <InclusiveModePanel />

        <button
          onClick={onToggleView}
          className={`btn btn-secondary mission-toggle ${isMissionControl ? 'active' : ''}`}
          aria-pressed={isMissionControl}
          aria-label={isMissionControl ? 'Switch to Operations Dashboard' : 'Switch to Mission Control'}
          title={isMissionControl ? 'Switch to Dashboard' : 'Switch to Mission Control'}
        >
          {isMissionControl ? <LayoutDashboard size={14} /> : <Monitor size={14} />}
          <span>{isMissionControl ? 'DASHBOARD' : 'MISSION CONTROL'}</span>
        </button>

        <button 
          id="glare-mode-toggle"
          onClick={toggleGlareMode} 
          aria-pressed={isGlareMode}
          aria-label="Toggle Glare Mode for outdoor high contrast display"
          className={`btn btn-secondary ${isGlareMode ? 'active-glare' : ''}`}
        >
          {isGlareMode ? <Eye size={14} /> : <Sun size={14} />}
          <span>{isGlareMode ? 'DISABLE GLARE MODE' : 'ENABLE GLARE MODE'}</span>
        </button>
        
        <div className={`status-indicator ${isServerOffline ? 'offline' : 'online'}`}>
          <div className={`status-dot ${isServerOffline ? 'offline' : 'online'}`}></div>
          <span>{isServerOffline ? 'OFFLINE CACHING ACTIVE' : 'STADIUM COMMS ACTIVE'}</span>
        </div>
        
        <button 
          onClick={onExitConsole} 
          className="btn btn-secondary header-exit-btn"
        >
          🏟️ Exit Console
        </button>

        <div className="vol-id-badge">
          <UserCheck size={16} />
          <span>{volunteerId || 'ID: VOL-4028'}</span>
        </div>
      </div>
    </header>
  );
}
