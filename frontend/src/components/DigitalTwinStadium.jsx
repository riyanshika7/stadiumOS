import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Points, Point, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Fireworks Component ---
function Firework({ position, color }) {
  const pointsRef = useRef();
  const [particles] = useState(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);
      const speed = THREE.MathUtils.randFloat(0.5, 2.5);
      arr.push({
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.cos(phi) * speed,
          Math.sin(phi) * Math.sin(theta) * speed
        ),
        age: 0,
        maxAge: THREE.MathUtils.randFloat(1.5, 3.0),
      });
    }
    return arr;
  });

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    particles.forEach((p, idx) => {
      p.age += delta;
      if (p.age < p.maxAge) {
        // Apply gravity and velocity
        p.velocity.y -= delta * 0.4;
        positions[idx * 3] += p.velocity.x * delta;
        positions[idx * 3 + 1] += p.velocity.y * delta;
        positions[idx * 3 + 2] += p.velocity.z * delta;
      } else {
        // Reset particle
        positions[idx * 3] = 0;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = 0;
        p.age = 0;
        p.velocity.y = THREE.MathUtils.randFloat(0.5, 2.5);
      }
    });
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(60 * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.12} color={color} transparent opacity={0.8} />
      </points>
    </group>
  );
}

// --- Digital Twin Scene ---
function StadiumScene({ scrollProgress, activeNode, onNodeClick }) {
  const cameraRef = useRef();
  const stadiumGroup = useRef();
  const droneRef1 = useRef();
  const droneRef2 = useRef();
  const trainRef = useRef();
  const lightRef1 = useRef();
  const lightRef2 = useRef();
  const hologramRef = useRef();
  const crowdRef = useRef();
  const dustRef = useRef();
  
  const [hoveredNode, setHoveredNode] = useState(null);
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  const currentTime = typeof performance !== 'undefined' ? performance.now() * 0.001 : Date.now() * 0.001;

  // Space dust / background particles
  const [backgroundDust] = useState(() => {
    const arr = [];
    for (let i = 0; i < 150; i++) {
      arr.push(new THREE.Vector3(
        THREE.MathUtils.randFloat(-15, 15),
        THREE.MathUtils.randFloat(-2, 10),
        THREE.MathUtils.randFloat(-15, 15)
      ));
    }
    return arr;
  });

  // Draw simple emergency path splines
  const emergencyPath1 = [
    [-6, 0, 6],
    [-4, 0.5, 3],
    [-2, 1, 0],
    [0, 1.5, -2]
  ];

  const emergencyPath2 = [
    [6, 0, -6],
    [4, 0.5, -3],
    [2, 1, 0],
    [0, 1.5, 2]
  ];

  // Train track
  const trainTrack = [];
  for (let i = 0; i <= 40; i++) {
    const angle = (i / 40) * Math.PI * 1.5 - Math.PI / 4;
    trainTrack.push([Math.cos(angle) * 11, -0.5, Math.sin(angle) * 11]);
  }

  // Generate crowd points
  const [crowdPositions] = useState(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const radius = THREE.MathUtils.randFloat(2.5, 5);
      const height = THREE.MathUtils.randFloat(0.2, 2.5);
      arr.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
    }
    return arr;
  });

  // Generate parking points
  const [parkingCars] = useState(() => {
    const arr = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        arr.push(new THREE.Vector3(8 + r * 0.8, -0.4, -4 + c * 0.8));
      }
    }
    return arr;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Camera orbit rotation or active node focus
    let targetX, targetY, targetZ;
    let lookTargetX = 0, lookTargetY = scrollProgress * 1.2, lookTargetZ = 0;

    if (activeNode) {
      // Lerp camera closer to the node for dynamic zoom detail view
      const nodePos = activeNode.position;
      targetX = nodePos[0] + 1.8;
      targetY = nodePos[1] + 2.0;
      targetZ = nodePos[2] + 2.5;
      lookTargetX = nodePos[0];
      lookTargetY = nodePos[1];
      lookTargetZ = nodePos[2];
    } else {
      // Default slow orbit
      const orbitAngle = time * 0.12 + scrollProgress * Math.PI;
      const distance = 7.0 - scrollProgress * 3.0; // Zoomed in closer for full window enlarged form
      const height = 3.6 - scrollProgress * 1.5;   // Lower camera height to look at it closely
      targetX = Math.sin(orbitAngle) * distance;
      targetZ = Math.cos(orbitAngle) * distance;
      targetY = height;
    }

    // Apply smooth camera positioning with mouse pointer offsets (buttery smooth parallax)
    state.camera.position.x += (targetX + state.pointer.x * 2.2 - state.camera.position.x) * 0.05;
    state.camera.position.z += (targetZ + state.pointer.y * 2.2 - state.camera.position.z) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;

    // Smoothly lerp lookTarget to eliminate camera snapping
    const currentLookTarget = lookTargetRef.current;
    currentLookTarget.x += (lookTargetX - currentLookTarget.x) * 0.05;
    currentLookTarget.y += (lookTargetY - currentLookTarget.y) * 0.05;
    currentLookTarget.z += (lookTargetZ - currentLookTarget.z) * 0.05;
    state.camera.lookAt(currentLookTarget);

    // 2. AI Drones Flying in infinity loops
    if (droneRef1.current) {
      droneRef1.current.position.x = Math.sin(time * 0.8) * 7;
      droneRef1.current.position.y = 4 + Math.cos(time * 1.2) * 1.5;
      droneRef1.current.position.z = Math.cos(time * 0.8) * 4;
    }
    if (droneRef2.current) {
      droneRef2.current.position.x = Math.cos(time * 0.6) * 5;
      droneRef2.current.position.y = 5 + Math.sin(time * 1.5) * 1.2;
      droneRef2.current.position.z = Math.sin(time * 0.6) * 7;
    }

    // 3. Metro train movement
    if (trainRef.current) {
      const trainTime = (time * 0.1) % 1;
      const trackIdx = Math.floor(trainTime * (trainTrack.length - 1));
      const pt = trainTrack[trackIdx];
      if (pt) {
        trainRef.current.position.set(pt[0], pt[1] + 0.15, pt[2]);
      }
    }

    // 4. Rotating and Floating Hologram Core
    if (hologramRef.current) {
      hologramRef.current.rotation.y = time * 0.35;
      hologramRef.current.rotation.x = time * 0.20;
      hologramRef.current.position.y = 5.0 + Math.sin(time * 0.8) * 0.25;
    }

    // 5. Sweeping Floodlights
    if (lightRef1.current) {
      lightRef1.current.target.position.x = Math.sin(time) * 3;
      lightRef1.current.target.position.z = Math.cos(time) * 3;
      lightRef1.current.target.updateMatrixWorld();
    }
    if (lightRef2.current) {
      lightRef2.current.target.position.x = Math.cos(time * 0.7) * 3;
      lightRef2.current.target.position.z = Math.sin(time * 0.7) * 3;
      lightRef2.current.target.updateMatrixWorld();
    }

    // 6. Animate crowd particles buffer positions
    if (crowdRef.current) {
      const positions = crowdRef.current.geometry.attributes.position.array;
      const count = crowdPositions.length;
      for (let idx = 0; idx < count; idx++) {
        const pos = crowdPositions[idx];
        const angle = Math.atan2(pos.z, pos.x);
        const flowSpeed = 0.05 + (idx % 5) * 0.02;
        const flowOffset = (time * flowSpeed) % 1;
        const currentRadius = 5 - flowOffset * 2.2;
        positions[idx * 3] = Math.cos(angle) * currentRadius;
        positions[idx * 3 + 1] = pos.y;
        positions[idx * 3 + 2] = Math.sin(angle) * currentRadius;
      }
      crowdRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 7. Rotate space dust system
    if (dustRef.current) {
      dustRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group ref={stadiumGroup} scale={2.8} position={[0, -2.2, 0]}>
      {/* Ambient & Directional Lights */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[10, 20, 10]} intensity={0.4} color="#00C8FF" />

      {/* --- Stadium Architecture Structure (Glowing Wireframe Digital Twin) --- */}
      {/* Stadium outer ribs */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 5.2;
        const z = Math.sin(angle) * 5.2;
        return (
          <Line
            key={i}
            points={[
              [x * 0.8, -0.5, z * 0.8],
              [x, 1.2, z],
              [x * 0.85, 2.5, z * 0.85],
              [x * 0.7, 3.0, z * 0.7]
            ]}
            color={scrollProgress > 0.4 ? "#a78bfa" : "#00C8FF"}
            lineWidth={1.5}
            transparent
            opacity={0.45}
          />
        );
      })}

      {/* Stadium horizontal rings */}
      <Line
        points={Array.from({ length: 33 }).map((_, i) => {
          const angle = (i / 32) * Math.PI * 2;
          return [Math.cos(angle) * 5.2, 1.2, Math.sin(angle) * 5.2];
        })}
        color="#0070f3"
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      <Line
        points={Array.from({ length: 33 }).map((_, i) => {
          const angle = (i / 32) * Math.PI * 2;
          return [Math.cos(angle) * 4.4, 2.5, Math.sin(angle) * 4.4];
        })}
        color="#7C5CFF"
        lineWidth={2}
        transparent
        opacity={0.6}
      />
      <Line
        points={Array.from({ length: 33 }).map((_, i) => {
          const angle = (i / 32) * Math.PI * 2;
          return [Math.cos(angle) * 3.6, 3.0, Math.sin(angle) * 3.6];
        })}
        color="#46F3FF"
        lineWidth={1}
        transparent
        opacity={0.8}
      />

      {/* Stadium Pitch / Field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <planeGeometry args={[4.2, 2.8]} />
        <meshBasicMaterial color="#08281a" transparent opacity={0.6} />
      </mesh>
      {/* Glowing Pitch Border */}
      <Line
        points={[
          [-2.1, -0.47, -1.4],
          [2.1, -0.47, -1.4],
          [2.1, -0.47, 1.4],
          [-2.1, -0.47, 1.4],
          [-2.1, -0.47, -1.4]
        ]}
        color="#22c55e"
        lineWidth={1.5}
      />

      {/* --- Dynamic Heatmap Overlay (Visible on Scroll) --- */}
      {scrollProgress > 0.25 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
          <ringGeometry args={[1.5, 4.0, 32]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={Math.min(0.25, (scrollProgress - 0.25) * 0.8)}
            wireframe
          />
        </mesh>
      )}

      {/* --- Floodlights & Spotlight Beams --- */}
      {/* Pole 1 */}
      <group position={[-5, 3.5, -5]}>
        <mesh><cylinderGeometry args={[0.08, 0.08, 4]} /><meshBasicMaterial color="#1e293b" /></mesh>
        <spotLight
          ref={lightRef1}
          color="#00C8FF"
          intensity={8}
          distance={15}
          angle={Math.PI / 8}
          penumbra={0.5}
          castShadow
        />
      </group>
      {/* Pole 2 */}
      <group position={[5, 3.5, 5]}>
        <mesh><cylinderGeometry args={[0.08, 0.08, 4]} /><meshBasicMaterial color="#1e293b" /></mesh>
        <spotLight
          ref={lightRef2}
          color="#7C5CFF"
          intensity={8}
          distance={15}
          angle={Math.PI / 8}
          penumbra={0.5}
          castShadow
        />
      </group>

      {/* --- AI Drones (Orbiting Glowing Spheres) --- */}
      <mesh ref={droneRef1}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#00C8FF" />
      </mesh>
      <mesh ref={droneRef2}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>

      {/* --- Holographic Grid Ground Plane --- */}
      <gridHelper args={[26, 26, "#7C5CFF", "#1e1b4b"]} position={[0, -0.5, 0]} />

      {/* --- Metro Rail Track and Train --- */}
      <Line points={trainTrack} color="#334155" lineWidth={1} />
      <mesh ref={trainRef}>
        <boxGeometry args={[0.6, 0.2, 0.25]} />
        <meshBasicMaterial color="#46F3FF" />
      </mesh>

      {/* --- Emergency Routing Lines --- */}
      {scrollProgress > 0.4 && (
        <>
          <Line points={emergencyPath1} color="#ef4444" lineWidth={3} />
          <Line points={emergencyPath2} color="#f59e0b" lineWidth={3} />
          {/* Glowing Label at Emergency Node */}
          <Html position={[0, 2.0, -2]} distanceFactor={8} zIndexRange={[100, 0]}>
            <div className="px-2 py-1 bg-red-950/80 border border-red-500/50 rounded text-[9px] font-bold text-red-400 whitespace-nowrap shadow-lg">
              ⚠️ ROUTE BYPASS ACTIVE
            </div>
          </Html>
        </>
      )}

      {/* --- Parking Movement Lot --- */}
      {parkingCars.map((pos, idx) => {
        // Move some cars slightly to simulate movement using currentTime
        const moveOffset = (idx % 2 === 0) ? Math.sin(currentTime * 0.4 + idx) * 0.15 : 0;
        return (
          <mesh key={idx} position={[pos.x + moveOffset, pos.y, pos.z]}>
            <boxGeometry args={[0.15, 0.08, 0.22]} />
            <meshBasicMaterial color={idx % 7 === 0 ? "#ef4444" : "#475569"} />
          </mesh>
        );
      })}

      {/* --- Crowd Movement (Flowing Particles) --- */}
      <points ref={crowdRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(crowdPositions.length * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#facc15" transparent opacity={0.6} />
      </points>

      {/* --- Dynamic Fireworks --- */}
      <Firework position={[-4, 6, -3]} color="#ff2255" />
      <Firework position={[5, 7, -2]} color="#00ffcc" />
      <Firework position={[2, 6.5, 4]} color="#ffff22" />

      {/* Floating Holographic Labels for Awwwards Aesthetic */}
      <Html position={[0, 3.4, 0]} distanceFactor={7} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center select-none pointer-events-none">
          <div className="text-[10px] tracking-[0.2em] font-extrabold text-[#46F3FF] bg-[#050816]/75 border border-[#46F3FF]/30 px-3 py-1 rounded-full uppercase backdrop-blur-md whitespace-nowrap shadow-xl">
            🏟️ StadiumOS Digital Twin
          </div>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#46F3FF] to-transparent mt-1"></div>
        </div>
      </Html>

      {/* Floating Status Cards in 3D Space */}
      {scrollProgress > 0.1 && (
        <Html position={[4.2, 1.8, 2.5]} distanceFactor={7} zIndexRange={[100, 0]}>
          <div className="p-2 bg-slate-950/80 border border-emerald-500/30 rounded-xl text-[10px] text-white backdrop-blur shadow-2xl min-w-[120px] transition-opacity duration-300">
            <div className="text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Live Telemetry
            </div>
            <div className="font-medium text-slate-300">Concourse Flow: Normal</div>
            <div className="font-semibold text-emerald-400">Rate: 1.2 fans/sec</div>
          </div>
        </Html>
      )}

      {scrollProgress > 0.3 && (
        <Html position={[-4.5, 1.2, 1.5]} distanceFactor={7} zIndexRange={[100, 0]}>
          <div className="p-2 bg-slate-950/80 border border-amber-500/30 rounded-xl text-[10px] text-white backdrop-blur shadow-2xl min-w-[120px] transition-opacity duration-300">
            <div className="text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              Crowd Warning
            </div>
            <div className="font-medium text-slate-300">Gate C: High Flow</div>
            <div className="font-semibold text-amber-400">Bypass Route 1 Active</div>
          </div>
        </Html>
      )}

      {/* --- Floating Space Dust / Background Particles --- */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(backgroundDust.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#7C5CFF" transparent opacity={0.35} />
      </points>

      {/* --- Stadium Interactive Hotspot Nodes --- */}
      {STADIUM_MARKERS.map((node) => {
        const isHovered = hoveredNode === node.name;
        const isActive = activeNode && activeNode.name === node.name;
        return (
          <group 
            key={node.name} 
            position={node.position}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick?.(isActive ? null : node);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode(node.name);
            }}
            onPointerOut={() => setHoveredNode(null)}
          >
            {/* Pulsing Outer Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, isHovered || isActive ? 0.35 : 0.28, 16]} />
              <meshBasicMaterial 
                color={node.color} 
                transparent 
                opacity={isActive ? 0.95 : isHovered ? 0.75 : 0.45} 
              />
            </mesh>
            {/* Center Core */}
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
            {/* Floating Label */}
            <Html 
              position={[0, 0.4, 0]} 
              distanceFactor={8}
              center
              zIndexRange={[100, 0]}
            >
              <div 
                className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider whitespace-nowrap shadow-lg transition-all duration-200 cursor-pointer pointer-events-auto"
                style={{
                  background: isActive ? node.color : 'rgba(5, 8, 22, 0.85)',
                  border: `1px solid ${node.color}`,
                  color: isActive ? '#030612' : '#ffffff',
                  boxShadow: isActive ? `0 0 15px ${node.color}` : 'none',
                }}
              >
                {node.name}
              </div>
            </Html>
          </group>
        );
      })}

      {/* --- Floating Holographic core --- */}
      <mesh ref={hologramRef} position={[0, 5.0, 0]}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#46f3ff" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// --- Hotspot Node Definitions ---
const STADIUM_MARKERS = [
  { name: "Gate A", position: [4.8, 0.2, 0], color: "#7C5CFF" },
  { name: "Gate B", position: [-4.8, 0.2, 0], color: "#7C5CFF" },
  { name: "Gate C", position: [0, 0.2, 4.8], color: "#00C8FF" },
  { name: "Gate D", position: [0, 0.2, -4.8], color: "#00C8FF" },
  { name: "Medical Centre", position: [2.5, 0.2, 2.5], color: "#22c55e" },
  { name: "Security Station", position: [-2.5, 0.2, -2.5], color: "#ef4444" },
];

// --- Main Wrapper ---
export default function DigitalTwinStadium({ scrollProgress, activeNode, onNodeClick, isContained = false }) {
  const containerStyle = isContained
    ? { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }
    : { position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' };

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
