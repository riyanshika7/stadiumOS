import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { StadiumScene } from './StadiumScene';
import StadiumCanvasMap from './StadiumCanvasMap';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

export default function DigitalTwinStadium({ scrollProgress, activeNode, onNodeClick, isContained = false }) {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  const containerStyle = isContained
    ? { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }
    : { position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' };

  if (!hasWebGL) {
    return (
      <div style={{ 
        ...containerStyle, 
        display: 'flex', 
        flexDirection: 'column', 
        background: '#02040a', 
        color: '#46F3FF', 
        border: '1px solid rgba(70,243,255,0.2)', 
        padding: '1rem', 
        overflow: 'hidden' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid rgba(70,243,255,0.2)', paddingBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>📡 2D RADAR GRID (WEBGL ACCELERATION SUSPENDED)</span>
          <span className="badge status-open" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', fontSize: '0.65rem' }}>2D Schematic</span>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <StadiumCanvasMap path={[]} startNode="" endNode="" />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Canvas
        camera={{ position: [0, 8, 16], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <StadiumScene 
          scrollProgress={scrollProgress} 
          activeNode={activeNode} 
          onNodeClick={onNodeClick} 
        />
      </Canvas>
    </div>
  );
}
