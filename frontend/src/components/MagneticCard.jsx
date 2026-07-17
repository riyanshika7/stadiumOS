import React, { useState, useRef } from 'react';

export default function MagneticCard({ children, className }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("translate3d(0, 0, 0)");

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const force = 10; // max translation force
    const dx = (x / (rect.width / 2)) * force;
    const dy = (y / (rect.height / 2)) * force;
    setTransform(`translate3d(${dx}px, ${dy}px, 0) scale3d(1.02, 1.02, 1)`);
  };

  const handleMouseLeave = () => {
    setTransform("translate3d(0, 0, 0) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.15s ease-out", cursor: "pointer" }}
      className={className}
    >
      {children}
    </div>
  );
}
