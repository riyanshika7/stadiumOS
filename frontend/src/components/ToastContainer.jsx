import React from 'react';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const COLORS = {
  success: 'rgba(0, 135, 90, 0.95)',
  error: 'rgba(239, 68, 68, 0.95)',
  warning: 'rgba(255, 199, 44, 0.95)',
  info: 'rgba(0, 112, 243, 0.95)',
};

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      role="alert"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item toast-${toast.type}`}
          style={{
            background: COLORS[toast.type] || COLORS.info,
            borderLeft: `4px solid ${toast.type === 'error' ? '#ff0000' : toast.type === 'warning' ? '#ffaa00' : toast.type === 'success' ? '#00ff88' : '#00ccff'}`,
          }}
        >
          <span className="toast-icon">{ICONS[toast.type] || ICONS.info}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => onRemove(toast.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
