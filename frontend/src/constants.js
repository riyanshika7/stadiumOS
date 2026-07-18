/**
 * StadiumOS — Application Configuration & Constants
 *
 * Single source of truth for all shared values across the application.
 * Every magic number, interval, label, and threshold lives here.
 */

// ─── API ────────────────────────────────────────────────────────────────────

/** Base URL for the StadiumOS backend API. */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.origin.includes('5173')
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://127.0.0.1:8000');

// ─── POLLING & REFRESH ──────────────────────────────────────────────────────

/** Polling interval (ms) for live alerts / incidents. */
export const LIVE_POLL_INTERVAL_MS = 4000;

/** Polling interval (ms) for Ambient Insights predictions. */
export const AMBIENT_POLL_INTERVAL_MS = 15000;

/** Polling interval (ms) for Mission Control status refresh. */
export const MISSION_CONTROL_POLL_MS = 6000;

/** How long to show toast notifications (ms). */
export const TOAST_DURATION_MS = 4000;

// ─── UI LIMITS ──────────────────────────────────────────────────────────────

/** Maximum number of alerts visible in the AlertFeed without expanding. */
export const ALERT_FEED_MAX_VISIBLE = 2;

/** Maximum number of recent incidents shown in sidebar. */
export const INCIDENT_FEED_MAX = 12;

// ─── ACCESSIBILITY ──────────────────────────────────────────────────────────

/** Accessible name for the deaf mode caption overlay. */
export const CAPTION_OVERLAY_LABEL = 'Real-Time Closed Captions (CC)';

// ─── STADIUM CONFIG ─────────────────────────────────────────────────────────

export const STADIUM_NAME = 'MetLife Stadium';
export const STADIUM_CAPACITY = 82500;
export const STADIUM_LOCATION = 'East Rutherford, New Jersey';
export const STADIUM_TIMEZONE = 'America/New_York';

// ─── CRISIS THRESHOLDS ──────────────────────────────────────────────────────

/** Crowd density % that triggers a critical alert. */
export const CROWD_CRITICAL_THRESHOLD = 0.80;
/** Crowd density % that triggers a warning. */
export const CROWD_WARNING_THRESHOLD = 0.60;
/** Maximum capacity multiplier before routing penalty. */
export const CROWD_FACTOR_MAX = 1.8;

// ─── CCTV ───────────────────────────────────────────────────────────────────

/** CCTV mock frame used for the predictive triage scanner. */
export const CCTV_MOCK_FRAME_B64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////' +
  '/////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA' +
  '/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

/** Risk index threshold for auto-generating critical alerts from CCTV. */
export const CCTV_RISK_THRESHOLD = 8;

// ─── OFFLINE ────────────────────────────────────────────────────────────────

/** Offline incident storage key in localStorage. */
export const OFFLINE_INCIDENTS_KEY = 'offline_incidents';

/** Offline queue max size before warning. */
export const OFFLINE_QUEUE_MAX = 50;

// ─── VIEW NAMES ─────────────────────────────────────────────────────────────

export const VIEW_LANDING = 'landing';
export const VIEW_MISSION_CONTROL = 'mission_control';
export const VIEW_DASHBOARD = 'dashboard';

// ─── COMMAND PALETTE ACTIONS ────────────────────────────────────────────────

export const COMMANDS = [
  { id: 'medical', label: '🚑 Simulate Medical Emergency', category: 'simulation', shortcut: 'M' },
  { id: 'surge', label: '📈 Simulate Crowd Surge at Gate C', category: 'simulation', shortcut: 'S' },
  { id: 'glare', label: '☀️ Toggle High-Glare Mode', category: 'accessibility', shortcut: 'G' },
  { id: 'route-medical', label: '📍 Route: Gate A → Medical Centre', category: 'navigation', shortcut: 'R' },
  { id: 'route-gatec', label: '📍 Route: Gate D → Gate C', category: 'navigation' },
  { id: 'clear', label: '🧹 Clear All Broadcast Alerts', category: 'operations', shortcut: 'L' },
  { id: 'mission', label: '🎯 Toggle Mission Control', category: 'navigation', shortcut: 'Ctrl+M' },
  { id: 'dashboard', label: '📊 Switch to Dashboard View', category: 'navigation' },
];

// ─── ZONE METADATA ──────────────────────────────────────────────────────────

export const ZONE_DETAILS = {
  'Gate A': { density: '45%', status: 'Normal Ingress', guards: 12, incidentCount: 0, flowRate: '1.4 fans/sec' },
  'Gate B': { density: '30%', status: 'Light Ingress', guards: 8, incidentCount: 0, flowRate: '0.8 fans/sec' },
  'Gate C': { density: '82%', status: 'High Congestion', guards: 18, incidentCount: 1, flowRate: '3.2 fans/sec' },
  'Gate D': { density: '55%', status: 'Moderate Ingress', guards: 10, incidentCount: 0, flowRate: '1.8 fans/sec' },
  'Medical Centre': { density: '15%', status: 'Available', doctors: 4, incidentCount: 0, flowRate: 'N/A' },
  'Security Station': { density: '20%', status: 'Active Dispatch', operators: 6, incidentCount: 1, flowRate: 'N/A' },
};

// ─── 3D DIGITAL TWIN ────────────────────────────────────────────────────────

/** Hotspot node definitions for the 3D digital twin scene. */
export const STADIUM_MARKERS = [
  { name: 'Gate A', position: [4.8, 0.2, 0], color: '#7C5CFF', type: 'gate' },
  { name: 'Gate B', position: [-4.8, 0.2, 0], color: '#7C5CFF', type: 'gate' },
  { name: 'Gate C', position: [0, 0.2, 4.8], color: '#00C8FF', type: 'gate' },
  { name: 'Gate D', position: [0, 0.2, -4.8], color: '#00C8FF', type: 'gate' },
  { name: 'Medical Centre', position: [2.5, 0.2, 2.5], color: '#22c55e', type: 'medical' },
  { name: 'Security Station', position: [-2.5, 0.2, -2.5], color: '#ef4444', type: 'security' },
];

// ─── MISSION CONTROL ────────────────────────────────────────────────────────

export const MISSION_CONTROL_SECTIONS = [
  { id: 'overview', label: 'Stadium Overview', icon: 'Activity' },
  { id: 'crowd', label: 'Crowd Density', icon: 'Users' },
  { id: 'incidents', label: 'Active Incidents', icon: 'AlertTriangle' },
  { id: 'volunteers', label: 'Volunteer Deployment', icon: 'UserCheck' },
  { id: 'weather', label: 'Weather & Environment', icon: 'CloudSun' },
  { id: 'transport', label: 'Transportation', icon: 'Train' },
  { id: 'security', label: 'Security Events', icon: 'Shield' },
  { id: 'accessibility', label: 'Accessibility Alerts', icon: 'Accessibility' },
];
