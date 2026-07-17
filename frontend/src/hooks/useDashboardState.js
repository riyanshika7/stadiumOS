import { useState, useEffect } from 'react';
import useAudioFeedback from './useAudioFeedback';
import { useInclusiveMode } from './useInclusiveMode';
import { retryFetch, retryFetchJson } from '../utils/retryFetch';
import {
  API_BASE_URL,
  LIVE_POLL_INTERVAL_MS,
  MISSION_CONTROL_POLL_MS,
  OFFLINE_INCIDENTS_KEY,
  VIEW_LANDING,
  VIEW_DASHBOARD,
  VIEW_MISSION_CONTROL,
} from '../constants';

export default function useDashboardState(toast) {
  const notifySuccess = toast?.success || (() => {});
  const notifyError = toast?.error || (() => {});
  const notifyWarning = toast?.warning || (() => {});
  const [currentView, setCurrentView] = useState(VIEW_LANDING);
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [isGlareMode, setIsGlareMode] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [routeStart, setRouteStart] = useState("");
  const [routeDest, setRouteDest] = useState("");
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [offlineIncidents, setOfflineIncidents] = useState([]);
  const [incidentViewTab, setIncidentViewTab] = useState('active');
  const [missionStatus, setMissionStatus] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [copilotResult, setCopilotResult] = useState(null);
  const [copilotQuery, setCopilotQuery] = useState("");
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState(false);

  const { deafMode, captionText, setCaptionText } = useInclusiveMode();

  useEffect(() => {
    if (deafMode && alerts.length > 0) {
      setCaptionText(`🎚️ BROADCAST ANNOUNCEMENT: ${alerts[0].title} — ${alerts[0].message}`);
    }
  }, [alerts, deafMode, setCaptionText]);

  useEffect(() => {
    const cached = localStorage.getItem(OFFLINE_INCIDENTS_KEY);
    if (cached) setOfflineIncidents(JSON.parse(cached));

    fetchLocations(); fetchAlerts(); fetchIncidents(); fetchMissionStatus(true);

    const interval = setInterval(() => {
      fetchAlerts(); fetchIncidents(); checkAndSyncOfflineQueue();
    }, LIVE_POLL_INTERVAL_MS);

    const mcInterval = setInterval(() => {
      if (currentView === VIEW_MISSION_CONTROL) fetchMissionStatus(true);
    }, MISSION_CONTROL_POLL_MS);

    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); setIsCommandBarOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setCurrentView((prev) => prev === VIEW_MISSION_CONTROL ? VIEW_DASHBOARD : VIEW_MISSION_CONTROL);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      clearInterval(interval);
      clearInterval(mcInterval);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [currentView]);

  const playAudioFeedback = useAudioFeedback();

  const postIncidentHelper = async (desc) => {
    try {
      await retryFetch(`${API_BASE_URL}/api/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc }),
      });
      fetchIncidents(); fetchAlerts(); playAudioFeedback('alert');
      notifySuccess('Incident reported successfully');
    } catch (e) {
      notifyError('Failed to report incident');
    }
  };

  const toggleView = () => {
    setCurrentView((prev) =>
      prev === VIEW_MISSION_CONTROL ? VIEW_DASHBOARD : VIEW_MISSION_CONTROL
    );
  };

  const executeCommand = async (action) => {
    playAudioFeedback('click');
    if (action === 'medical') {
      setActiveNode({ name: "Medical Centre", position: [2.5, 0.2, 2.5], color: "#22c55e" });
      await postIncidentHelper("Spanish-speaking fan reporting severe chest pain near MetLife Medical Centre.");
    } else if (action === 'surge') {
      setActiveNode({ name: "Gate C", position: [0, 0.2, 4.8], color: "#00C8FF" });
      await postIncidentHelper("Gate C density crosses 80%. Suggesting crowd redirection routes.");
    } else if (action === 'glare') {
      setIsGlareMode((prev) => !prev);
    } else if (action === 'route-medical') {
      setRouteStart("Gate A"); setRouteDest("Medical Centre");
    } else if (action === 'route-gatec') {
      setRouteStart("Gate D"); setRouteDest("Gate C");
    } else if (action === 'clear') {
      try {
        await retryFetch(`${API_BASE_URL}/api/alerts/clear`, { method: 'POST' });
        fetchAlerts();
      } catch (e) {
        notifyError('Failed to clear alerts');
      }
    } else if (action === 'mission') {
      toggleView();
    } else if (action === 'dashboard') {
      setCurrentView(VIEW_DASHBOARD);
    } else if (action.startsWith('ai-query:')) {
      const queryText = action.replace('ai-query:', '');
      setCopilotQuery(queryText);
      setIsCopilotModalOpen(true);
      setCopilotResult({
        plain_english_reasoning: "StadiumOS intelligence is fetching reasoning and loading context...",
        actionable_translated_script: "Routing and de-escalation scripts are being processed by the AI Swarm..."
      });
      try {
        const response = await retryFetchJson(`${API_BASE_URL}/api/copilot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText })
        });
        setCopilotResult(response);
      } catch (err) {
        setCopilotResult({
          plain_english_reasoning: "Error connecting to StadiumOS Edge AI server. Fallback to local rule-based playbooks.",
          actionable_translated_script: "Fallback instructions: Guide fan to nearest service kiosk."
        });
        notifyError("AI Copilot request failed. Offline mode active.");
      }
    }
  };

  const fetchMissionStatus = async (silentFail = false) => {
    try {
      const data = await retryFetchJson(`${API_BASE_URL}/api/mission-control`);
      setMissionStatus(data);
    } catch (err) {
      if (!silentFail) notifyWarning('Mission Control data unavailable');
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await retryFetchJson(`${API_BASE_URL}/api/locations`);
      setLocations(data);
      setIsServerOffline(false);
    } catch (err) {
      setIsServerOffline(true);
      notifyWarning('Server offline — locations unavailable');
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await retryFetchJson(`${API_BASE_URL}/api/alerts`);
      setAlerts(data);
      setIsServerOffline(false);
    } catch (err) {
      setIsServerOffline(true);
    }
  };

  const fetchIncidents = async () => {
    try {
      const data = await retryFetchJson(`${API_BASE_URL}/api/incidents`);
      setIncidents(data);
      setIsServerOffline(false);
    } catch (err) {
      setIsServerOffline(true);
    }
  };

  const checkAndSyncOfflineQueue = async () => {
    const cached = localStorage.getItem(OFFLINE_INCIDENTS_KEY);
    if (!cached) return;
    const queue = JSON.parse(cached);
    if (queue.length === 0) return;

    try {
      await retryFetch(`${API_BASE_URL}/`, {}, 1);
      for (const inc of queue) {
        await retryFetch(`${API_BASE_URL}/api/incident`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: inc.description }),
        }, 1);
      }
      localStorage.removeItem(OFFLINE_INCIDENTS_KEY);
      setOfflineIncidents([]); fetchIncidents(); fetchAlerts();
      notifySuccess('Offline incidents synced to server');
    } catch (err) {
      // Server still offline
    }
  };

  const handleIncidentSubmitted = () => {
    fetchIncidents(); fetchAlerts(); fetchLocations();
  };

  const handleIncidentOfflineIntercept = (incidentDescription, isOffline) => {
    if (isOffline || isServerOffline) {
      setOfflineIncidents((prev) => {
        const newQueue = [...prev, { description: incidentDescription, timestamp: new Date().toISOString() }];
        localStorage.setItem(OFFLINE_INCIDENTS_KEY, JSON.stringify(newQueue));
        return newQueue;
      });
      
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
      await retryFetch(`${API_BASE_URL}/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      fetchIncidents();
      notifySuccess('Incident resolved');
    } catch (err) {
      notifyError('Failed to resolve incident');
    }
  };

  const toggleGlareMode = () => {
    const newMode = !isGlareMode;
    setIsGlareMode(newMode);
    if (newMode) document.body.classList.add('high-glare-mode');
    else document.body.classList.remove('high-glare-mode');
  };

  const filteredIncidents = incidents.filter((inc) => {
    return incidentViewTab === 'active' ? inc.status !== 'resolved' : inc.status === 'resolved';
  });

  return {
    currentView, setCurrentView, locations, alerts, incidents, isGlareMode,
    isCommandBarOpen, setIsCommandBarOpen, activeNode, setActiveNode,
    routeStart, setRouteStart, routeDest, setRouteDest, isServerOffline,
    offlineIncidents, incidentViewTab, setIncidentViewTab, deafMode,
    captionText, setCaptionText, executeCommand, handleIncidentSubmitted,
    handleIncidentOfflineIntercept, resolveIncident, toggleGlareMode, filteredIncidents,
    missionStatus, activeSection, setActiveSection, toggleView, fetchMissionStatus,
    copilotResult, setCopilotResult, copilotQuery, setCopilotQuery, isCopilotModalOpen, setIsCopilotModalOpen
  };
}
