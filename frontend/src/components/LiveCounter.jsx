import React, { useState, useEffect } from 'react';

export default function LiveCounter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    let animFrameId = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animFrameId = window.requestAnimationFrame(step);
      }
    };
    animFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animFrameId) {
        window.cancelAnimationFrame(animFrameId);
      }
    };
  }, [end, duration]);
  return <span>{count}{suffix}</span>;
}
