import { useState, useCallback, useRef } from 'react';

let toastId = 0;

export default function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timersRef.current[id];
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success', 3000), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error', 5000), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning', 4000), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info', 4000), [addToast]);

  return { toasts, addToast, removeToast, success, error, warning, info };
}
