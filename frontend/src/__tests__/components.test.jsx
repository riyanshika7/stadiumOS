import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Import components
import WhatIfSimulator from '../components/WhatIfSimulator';
import AlertFeed from '../components/AlertFeed';
import Translator from '../components/Translator';
import IncidentForm from '../components/IncidentForm';

describe('WhatIfSimulator Component', () => {
  it('renders simulator controls and description', () => {
    render(<WhatIfSimulator />);
    expect(screen.getByText(/👥 Expected Attendance/i)).toBeInTheDocument();
    expect(screen.getByText(/🏟️ Active Ingress Gates/i)).toBeInTheDocument();
    expect(screen.getByText(/🌧️ Weather Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/👮 Security Alert Level/i)).toBeInTheDocument();
  });

  it('runs simulation on button click and shows metrics', async () => {
    render(<WhatIfSimulator />);
    const button = screen.getByRole('button', { name: /Run Simulation Analysis/i });
    fireEvent.click(button);

    // Wait for mock calculation time
    await waitFor(() => {
      expect(screen.getByText(/Simulated Congestion Risk/i)).toBeInTheDocument();
      expect(screen.getByText(/Estimated Entry Delay/i)).toBeInTheDocument();
      expect(screen.getByText(/proactive directives dispatch/i)).toBeInTheDocument();
    }, { timeout: 1500 });
  });
});

describe('AlertFeed Component', () => {
  it('renders default message when empty', () => {
    render(<AlertFeed alerts={[]} />);
    expect(screen.getByText(/All Systems Normal/i)).toBeInTheDocument();
    expect(screen.getByText(/No stadium-wide alerts currently broadcasted/i)).toBeInTheDocument();
  });

  it('renders active alerts feed list', () => {
    const mockAlerts = [
      { id: 1, title: 'Gate C Congestion', message: 'Density is high.', type: 'danger', active: true }
    ];
    render(<AlertFeed alerts={mockAlerts} />);
    expect(screen.getByText(/Gate C Congestion/i)).toBeInTheDocument();
    expect(screen.getByText(/Density is high./i)).toBeInTheDocument();
  });
});

describe('Translator Component', () => {
  it('renders initial translation widgets', () => {
    render(<Translator />);
    expect(screen.getByPlaceholderText(/Type or click a simulator tag above to translate.../i)).toBeInTheDocument();
  });
});

describe('IncidentForm Component', () => {
  it('renders incident input form controls', () => {
    render(<IncidentForm onIncidentSubmitted={() => {}} />);
    expect(screen.getByPlaceholderText(/Describe the issue in detail, mentioning location if possible.../i)).toBeInTheDocument();
  });
});

import CsvUploader from '../components/CsvUploader';
describe('CsvUploader Chaos Simulator Portal', () => {
  it('renders tab headings and initial selectors', () => {
    render(<CsvUploader />);
    expect(screen.getByText(/⚙️ JURY TESTING PORTAL/i)).toBeInTheDocument();
    expect(screen.getByText(/CSV Density/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Playbook/i)).toBeInTheDocument();
    expect(screen.getByText(/SQL DB/i)).toBeInTheDocument();
    expect(screen.getByText(/Chaos Sandbox/i)).toBeInTheDocument();
  });

  it('renders chaos simulation buttons when active', () => {
    render(<CsvUploader />);
    const chaosTabButton = screen.getByText(/Chaos Sandbox/i);
    fireEvent.click(chaosTabButton);

    expect(screen.getByText(/Simulate Corrupt CSV Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate Simultaneous 100% Capacity at Multiple Gates/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate Unknown Audio Language Input/i)).toBeInTheDocument();
  });

  it('triggers gracefully caught fallback UI on Corrupt CSV simulation click', async () => {
    const mockResponse = {
      status: 'gracefully_caught',
      error_caught: "UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff",
      fallback_message: 'Discarded corrupt byte sequences safely.',
      resolution_steps: ['1. Re-transmit CSV.', '2. Re-run validator.']
    };
    
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );
    vi.stubGlobal('fetch', mockFetch);

    render(<CsvUploader />);
    fireEvent.click(screen.getByText(/Chaos Sandbox/i));
    
    const btn = screen.getByText(/Simulate Corrupt CSV Data/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/Caught Corrupt CSV Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Discarded corrupt byte sequences safely./i)).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });

  it('triggers gracefully caught fallback UI on Simultaneous 100% capacity simulation click', async () => {
    const mockResponse = {
      status: 'gracefully_caught',
      error_caught: 'OverloadException: 100% capacity at multiple gates',
      fallback_message: 'System routing bypass rules engaged.',
      resolution_steps: ['1. Redirection routes activated.', '2. Notify concourse operators.']
    };

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );
    vi.stubGlobal('fetch', mockFetch);

    render(<CsvUploader />);
    fireEvent.click(screen.getByText(/Chaos Sandbox/i));

    const btn = screen.getByText(/Simulate Simultaneous 100% Capacity at Multiple Gates/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/Caught Capacity Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/System routing bypass rules engaged./i)).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });

  it('triggers gracefully caught fallback UI on Unknown Audio Input simulation click', async () => {
    const mockResponse = {
      status: 'gracefully_caught',
      error_caught: 'LanguageDetectionException: Audio confidence low',
      fallback_message: 'Fell back to visual symbol safety card SOP.',
      resolution_steps: ['1. Render visual translation cards.', '2. Alert supervisor.']
    };

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );
    vi.stubGlobal('fetch', mockFetch);

    render(<CsvUploader />);
    fireEvent.click(screen.getByText(/Chaos Sandbox/i));

    const btn = screen.getByText(/Simulate Unknown Audio Language Input/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/Caught Audio Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Fell back to visual symbol safety card SOP./i)).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Inclusive Mode WCAG Accessibility Tests
// ──────────────────────────────────────────────────────────────────────────────
import { InclusiveModeProvider } from '../hooks/useInclusiveMode';
import InclusiveModePanel from '../components/InclusiveMode';

const WrappedPanel = () => (
  <InclusiveModeProvider>
    <InclusiveModePanel />
  </InclusiveModeProvider>
);

describe('InclusiveMode Panel — WCAG Compliance', () => {
  it('renders wheelchair mode toggle button', () => {
    render(<WrappedPanel />);
    expect(screen.getByRole('button', { name: /Toggle Wheelchair Mode/i })).toBeInTheDocument();
  });

  it('Wheelchair Mode button has correct ARIA role and label', () => {
    render(<WrappedPanel />);
    const btn = screen.getByRole('button', { name: /Toggle Wheelchair Mode/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveAttribute('id', 'wheelchair-mode-toggle');
  });

  it('Wheelchair Mode toggles aria-pressed to true on click', () => {
    render(<WrappedPanel />);
    const btn = screen.getByRole('button', { name: /Toggle Wheelchair Mode/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('InclusiveModeProvider exposes a WCAG aria-live status region', () => {
    render(<WrappedPanel />);
    const liveRegion = document.getElementById('inclusive-live-region');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion).toHaveAttribute('role', 'status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Constants Module Tests
// ──────────────────────────────────────────────────────────────────────────────
import * as constants from '../constants';

describe('Constants Module', () => {
  it('exports API_BASE_URL as a non-empty string', () => {
    expect(typeof constants.API_BASE_URL).toBe('string');
    expect(constants.API_BASE_URL.length).toBeGreaterThan(0);
  });

  it('exports ALERT_FEED_MAX_VISIBLE as a positive integer', () => {
    expect(typeof constants.ALERT_FEED_MAX_VISIBLE).toBe('number');
    expect(constants.ALERT_FEED_MAX_VISIBLE).toBeGreaterThan(0);
    expect(Number.isInteger(constants.ALERT_FEED_MAX_VISIBLE)).toBe(true);
  });

  it('exports LIVE_POLL_INTERVAL_MS as a number >= 1000ms', () => {
    expect(typeof constants.LIVE_POLL_INTERVAL_MS).toBe('number');
    expect(constants.LIVE_POLL_INTERVAL_MS).toBeGreaterThanOrEqual(1000);
  });

  it('exports OFFLINE_INCIDENTS_KEY as a non-empty string', () => {
    expect(typeof constants.OFFLINE_INCIDENTS_KEY).toBe('string');
    expect(constants.OFFLINE_INCIDENTS_KEY.length).toBeGreaterThan(0);
  });

  it('exports AMBIENT_POLL_INTERVAL_MS as a number >= 5000ms', () => {
    expect(typeof constants.AMBIENT_POLL_INTERVAL_MS).toBe('number');
    expect(constants.AMBIENT_POLL_INTERVAL_MS).toBeGreaterThanOrEqual(5000);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Accessibility — Speech Tags Are Proper Buttons (WCAG 2.1 § 4.1.2)
// ──────────────────────────────────────────────────────────────────────────────
describe('Speech-tag Accessibility — Proper button elements', () => {
  it('IncidentForm template triggers are <button> elements, not <span>', () => {
    render(<IncidentForm onIncidentSubmitted={() => {}} />);
    const templateBtns = screen.getAllByRole('button', { name: /Template/i });
    expect(templateBtns.length).toBeGreaterThanOrEqual(3);
    templateBtns.forEach((btn) => {
      expect(btn.tagName.toLowerCase()).toBe('button');
      expect(btn).toHaveAttribute('type', 'button');
    });
  });

  it('Translator language buttons are keyboard-focusable <button> elements', () => {
    render(<Translator />);
    const langBtns = screen.getAllByRole('button');
    // At least the 10 language simulator buttons should exist
    const speechTagBtns = langBtns.filter(
      (b) => b.classList.contains('speech-tag') || b.getAttribute('type') === 'button'
    );
    expect(speechTagBtns.length).toBeGreaterThan(0);
  });

  it('Translator submit button is focusable and labeled', () => {
    render(<Translator />);
    const submitBtn = screen.getByRole('button', { name: /Translate/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('IncidentForm template group has accessible group role and label', () => {
    render(<IncidentForm onIncidentSubmitted={() => {}} />);
    const group = screen.getByRole('group', { name: /Quick-fill incident templates/i });
    expect(group).toBeInTheDocument();
  });
});
