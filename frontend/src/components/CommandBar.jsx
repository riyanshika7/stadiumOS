import React, { useState, useEffect, useRef } from 'react';

export const COMMANDS = [
  { id: 'sim-medical', name: '🚨 Simulate Urgent Medical Incident', category: 'Simulation', action: 'medical' },
  { id: 'sim-surge', name: '📈 Simulate Crowd Congestion at Gate C', category: 'Simulation', action: 'surge' },
  { id: 'glare', name: '☀ Toggle Glare Mode (Outdoor Display)', category: 'Settings', action: 'glare' },
  { id: 'nav-medical', name: '🧭 Plan Route to Medical Centre', category: 'Navigation', action: 'route-medical' },
  { id: 'nav-gatec', name: '🧭 Plan Route to Gate C', category: 'Navigation', action: 'route-gatec' },
  { id: 'clear-alerts', name: '🗑 Clear Bulletin Alerts', category: 'Management', action: 'clear' },
  { id: 'mission-control', name: '🎯 Toggle Mission Control View', category: 'Navigation', action: 'mission' },
  { id: 'dashboard', name: '📊 Switch to Dashboard View', category: 'Navigation', action: 'dashboard' },
];

export default function CommandBar({ isOpen, onClose, onExecute }) {
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

  if (search.trim()) {
    filtered.push({
      id: 'ai-query',
      name: `🤖 Ask StadiumOS AI: "${search}"`,
      category: 'AI Assistant',
      action: `ai-query:${search.trim()}`
    });
  }

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
  }, [isOpen, filtered, selectedIndex, onExecute, onClose]);

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
            aria-label="Search operational dashboard commands"
          />
        </div>
        <div className="command-bar-list" role="listbox" aria-label="Command search results">
          {filtered.length === 0 ? (
            <div className="command-bar-empty">No commands matched.</div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div 
                  key={cmd.id} 
                  role="option"
                  aria-selected={isSelected}
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
