import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * InclusiveModeContext
 * Provides global inclusive accessibility state:
 *  - wheelchairMode: boolean — filters routes and map to step-free paths only
 */
const InclusiveModeContext = createContext({
  wheelchairMode: false,
  toggleWheelchairMode: () => {},
  deafMode: false,
  toggleDeafMode: () => {},
  captionText: '',
  setCaptionText: () => {},
});

export function InclusiveModeProvider({ children }) {
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [deafMode, setDeafMode] = useState(false);
  const [captionText, setCaptionText] = useState('');

  const toggleWheelchairMode = useCallback(() => {
    setWheelchairMode((prev) => {
      const next = !prev;
      const el = document.getElementById('inclusive-live-region');
      if (el) {
        el.textContent = next
          ? 'Wheelchair Mode enabled. Showing step-free routes only.'
          : 'Wheelchair Mode disabled. Showing all routes.';
      }
      return next;
    });
  }, []);

  const toggleDeafMode = useCallback(() => {
    setDeafMode((prev) => {
      const next = !prev;
      const el = document.getElementById('inclusive-live-region');
      if (el) {
        el.textContent = next
          ? 'Deaf Fan Mode enabled. Real-time captions will be displayed.'
          : 'Deaf Fan Mode disabled.';
      }
      // Reset caption text if disabled
      if (!next) {
        setCaptionText('');
      } else {
        setCaptionText('🧏 DEAF FAN MODE ACTIVE: Real-time transcriptions & broadcasts will appear here in high-contrast captions.');
      }
      return next;
    });
  }, []);

  return (
    <InclusiveModeContext.Provider
      value={{ wheelchairMode, toggleWheelchairMode, deafMode, toggleDeafMode, captionText, setCaptionText }}
    >
      {/* WCAG SR-only live region for mode change announcements */}
      <div
        id="inclusive-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      {children}
    </InclusiveModeContext.Provider>
  );
}

export function useInclusiveMode() {
  return useContext(InclusiveModeContext);
}


export default InclusiveModeContext;
