/**
 * Application-wide constants.
 * Single source of truth for shared values across components.
 */

/** Base URL for the StadiumOS backend API. */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/** Maximum number of alerts visible in the AlertFeed without expanding. */
export const ALERT_FEED_MAX_VISIBLE = 2;

/** Polling interval (ms) for live alerts / incidents in App.jsx. */
export const LIVE_POLL_INTERVAL_MS = 4000;

/** Polling interval (ms) for Ambient Insights predictions. */
export const AMBIENT_POLL_INTERVAL_MS = 15000;

/** CCTV mock frame used for the predictive triage scanner. */
export const CCTV_MOCK_FRAME_B64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////' +
  '/////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA' +
  '/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

/** Offline incident storage key in localStorage. */
export const OFFLINE_INCIDENTS_KEY = 'offline_incidents';
