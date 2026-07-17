import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import Firework from './Firework';
import TelemetryHUD from './TelemetryHUD';
import { STADIUM_MARKERS } from '../constants';

export function StadiumScene({ scrollProgress, activeNode, onNodeClick }) {
  const stadiumGroup = useRef();
  const droneRef1 = useRef();
  const droneRef2 = useRef();
  const droneRef3 = useRef();
  const trainRef = useRef();
  const lightRef1 = useRef();
  const lightRef2 = useRef();
  const hologramRef = useRef();
  const crowdRef = useRef();
  const dustRef = useRef();
  const dataRingRef = useRef();

  const [hoveredNode, setHoveredNode] = useState(null);
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentTimeRef = useRef(0);

  const [backgroundDust] = useState(() => {
    const arr = [];
    for (let i = 0; i < 100; i++) {
      arr.push(new THREE.Vector3(
        THREE.MathUtils.randFloat(-12, 12),
        THREE.MathUtils.randFloat(-2, 8),
        THREE.MathUtils.randFloat(-12, 12)
      ));
    }
    return arr;
  });

  const emergencyPath1 = [[-6, 0, 6], [-4, 0.5, 3], [-2, 1, 0], [0, 1.5, -2]];
  const emergencyPath2 = [[6, 0, -6], [4, 0.5, -3], [2, 1, 0], [0, 1.5, 2]];

  const trainTrack = useMemo(() => {
    const track = [];
    for (let i = 0; i <= 30; i++) {
      const angle = (i / 30) * Math.PI * 1.5 - Math.PI / 4;
      track.push([Math.cos(angle) * 11, -0.5, Math.sin(angle) * 11]);
    }
    return track;
  }, []);

  const [crowdPositions] = useState(() => {
    const arr = [];
    for (let i = 0; i < 120; i++) {
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      arr.push(new THREE.Vector3(
        Math.cos(angle) * THREE.MathUtils.randFloat(2.5, 5),
        THREE.MathUtils.randFloat(0.2, 2.2),
        Math.sin(angle) * THREE.MathUtils.randFloat(2.5, 5)
      ));
    }
    return arr;
  });

  const [parkingCars] = useState(() => {
    const arr = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        arr.push(new THREE.Vector3(8 + r * 0.8, -0.4, -4 + c * 0.8));
      }
    }
    return arr;
  });

  const [volunteerPositions] = useState(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      arr.push({
        baseAngle: angle,
        radius: THREE.MathUtils.randFloat(2.0, 5.5),
        speed: 0.2 + Math.random() * 0.3,
        yOffset: THREE.MathUtils.randFloat(0.1, 0.4),
      });
    }
    return arr;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    currentTimeRef.current = time;
    let targetX, targetY, targetZ;
    let lookTargetX = 0, lookTargetY = scrollProgress * 1.2, lookTargetZ = 0;

    if (activeNode) {
      const nodePos = activeNode.position;
      targetX = nodePos[0] + 1.8; targetY = nodePos[1] + 2.0; targetZ = nodePos[2] + 2.5;
      lookTargetX = nodePos[0]; lookTargetY = nodePos[1]; lookTargetZ = nodePos[2];
    } else {
      const orbitAngle = time * 0.12 + scrollProgress * Math.PI;
      const distance = 7.0 - scrollProgress * 3.0;
      targetX = Math.sin(orbitAngle) * distance; targetZ = Math.cos(orbitAngle) * distance;
      targetY = 3.6 - scrollProgress * 1.5;
    }

    state.camera.position.x += (targetX + state.pointer.x * 2.2 - state.camera.position.x) * 0.05;
    state.camera.position.z += (targetZ + state.pointer.y * 2.2 - state.camera.position.z) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;

    const clt = lookTargetRef.current;
    clt.x += (lookTargetX - clt.x) * 0.05; clt.y += (lookTargetY - clt.y) * 0.05; clt.z += (lookTargetZ - clt.z) * 0.05;
    state.camera.lookAt(clt);

    // Three drones patrolling at different altitudes and patterns
    if (droneRef1.current) {
      droneRef1.current.position.set(
        Math.sin(time * 0.8) * 7,
        4 + Math.cos(time * 1.2) * 1.5,
        Math.cos(time * 0.8) * 4
      );
    }
    if (droneRef2.current) {
      droneRef2.current.position.set(
        Math.cos(time * 0.6) * 5,
        5 + Math.sin(time * 1.5) * 1.2,
        Math.sin(time * 0.6) * 7
      );
    }
    if (droneRef3.current) {
      droneRef3.current.position.set(
        Math.sin(time * 0.9 + 2) * 6,
        3.5 + Math.cos(time * 0.7 + 1) * 1.0,
        Math.cos(time * 0.9 + 2) * 6
      );
    }
    if (trainRef.current) {
      const pt = trainTrack[Math.floor(((time * 0.1) % 1) * (trainTrack.length - 1))];
      if (pt) trainRef.current.position.set(pt[0], pt[1] + 0.15, pt[2]);
    }
    if (hologramRef.current) {
      hologramRef.current.rotation.y = time * 0.35; hologramRef.current.rotation.x = time * 0.20;
      hologramRef.current.position.y = 5.0 + Math.sin(time * 0.8) * 0.25;
    }
    if (dataRingRef.current) {
      dataRingRef.current.rotation.y = time * 0.15;
      dataRingRef.current.position.y = 1.0 + Math.sin(time * 0.3) * 0.1;
    }
    if (lightRef1.current) {
      lightRef1.current.target.position.set(Math.sin(time) * 3, 0, Math.cos(time) * 3);
      lightRef1.current.target.updateMatrixWorld();
    }
    if (lightRef2.current) {
      lightRef2.current.target.position.set(Math.cos(time * 0.7) * 3, 0, Math.sin(time * 0.7) * 3);
      lightRef2.current.target.updateMatrixWorld();
    }
    if (crowdRef.current) {
      const pos = crowdRef.current.geometry.attributes.position.array;
      crowdPositions.forEach((cp, idx) => {
        const angle = Math.atan2(cp.z, cp.x);
        const r = 5 - ((time * (0.05 + (idx % 5) * 0.02)) % 1) * 2.2;
        pos[idx * 3] = Math.cos(angle) * r;
        pos[idx * 3 + 1] = cp.y;
        pos[idx * 3 + 2] = Math.sin(angle) * r;
      });
      crowdRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (dustRef.current) dustRef.current.rotation.y = time * 0.02;
  });

  const nodeColors = useMemo(() => ({
    gate: "#7C5CFF",
    medical: "#22c55e",
    security: "#ef4444",
  }), []);

  return (
    <group ref={stadiumGroup} scale={2.8} position={[0, -2.2, 0]}>
      <ambientLight intensity={0.12} />
      <directionalLight position={[10, 20, 10]} intensity={0.4} color="#00C8FF" />

      {/* Stadium support pillars */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x = Math.cos(a) * 5.2;
        const z = Math.sin(a) * 5.2;
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

      {/* Stadium concentric rings */}
      {[
        { r: 5.2, h: 1.2, color: "#0070f3", lw: 2, op: 0.6 },
        { r: 4.4, h: 2.5, color: "#7C5CFF", lw: 2, op: 0.6 },
        { r: 3.6, h: 3.0, color: "#46F3FF", lw: 1, op: 0.8 }
      ].map((ring, idx) => (
        <Line
          key={idx}
          points={Array.from({ length: 33 }).map((_, i) => [
            Math.cos((i / 32) * Math.PI * 2) * ring.r,
            ring.h,
            Math.sin((i / 32) * Math.PI * 2) * ring.r
          ])}
          color={ring.color}
          lineWidth={ring.lw}
          transparent
          opacity={ring.op}
        />
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <planeGeometry args={[4.2, 2.8]} />
        <meshBasicMaterial color="#08281a" transparent opacity={0.6} />
      </mesh>
      <Line points={[[-2.1, -0.47, -1.4], [2.1, -0.47, -1.4], [2.1, -0.47, 1.4], [-2.1, -0.47, 1.4], [-2.1, -0.47, -1.4]]} color="#22c55e" lineWidth={1.5} />

      {/* Data ring — rotating information ring */}
      <group ref={dataRingRef}>
        <Line
          points={Array.from({ length: 33 }).map((_, i) => [
            Math.cos((i / 32) * Math.PI * 2) * 1.2,
            0,
            Math.sin((i / 32) * Math.PI * 2) * 1.2
          ])}
          color="#46F3FF"
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      </group>

      {/* Emergency overlay */}
      {scrollProgress > 0.25 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
          <ringGeometry args={[1.5, 4.0, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={Math.min(0.25, (scrollProgress - 0.25) * 0.8)} wireframe />
        </mesh>
      )}

      {/* Spotlights */}
      {[[-5, -5], [5, 5]].map((pos, idx) => (
        <group key={idx} position={[pos[0], 3.5, pos[1]]}>
          <mesh><cylinderGeometry args={[0.08, 0.08, 4]} /><meshBasicMaterial color="#1e293b" /></mesh>
          <spotLight
            ref={idx === 0 ? lightRef1 : lightRef2}
            color={idx === 0 ? "#00C8FF" : "#7C5CFF"}
            intensity={8}
            distance={15}
            angle={Math.PI / 8}
            penumbra={0.5}
            castShadow
          />
        </group>
      ))}

      {/* Drones */}
      <mesh ref={droneRef1}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#00C8FF" />
      </mesh>
      <mesh ref={droneRef2}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      <mesh ref={droneRef3}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      <gridHelper args={[26, 26, "#7C5CFF", "#1e1b4b"]} position={[0, -0.5, 0]} />

      {/* Train system */}
      <Line points={trainTrack} color="#334155" lineWidth={1} />
      <mesh ref={trainRef}>
        <boxGeometry args={[0.6, 0.2, 0.25]} />
        <meshBasicMaterial color="#46F3FF" />
      </mesh>

      {/* Emergency paths */}
      {scrollProgress > 0.4 && (
        <>
          <Line points={emergencyPath1} color="#ef4444" lineWidth={3} />
          <Line points={emergencyPath2} color="#f59e0b" lineWidth={3} />
          <Html position={[0, 2.0, -2]} distanceFactor={8} zIndexRange={[100, 0]}>
            <div className="px-2 py-1 bg-red-950/80 border border-red-500/50 rounded text-[9px] font-bold text-red-400 whitespace-nowrap shadow-lg">
              ⚠️ ROUTE BYPASS ACTIVE
            </div>
          </Html>
        </>
      )}

      {/* Parking cars */}
      {parkingCars.map((pos, idx) => (
        <mesh
          key={idx}
          position={[
            pos.x + ((idx % 2 === 0) ? Math.sin(currentTimeRef.current * 0.4 + idx) * 0.15 : 0),
            pos.y,
            pos.z
          ]}
        >
          <boxGeometry args={[0.15, 0.08, 0.22]} />
          <meshBasicMaterial color={idx % 7 === 0 ? "#ef4444" : "#475569"} />
        </mesh>
      ))}

      {/* Crowd particle system */}
      <points ref={crowdRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(crowdPositions.length * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#facc15" transparent opacity={0.6} />
      </points>

      {/* Volunteer position indicators */}
      {volunteerPositions.map((v, idx) => (
        <mesh key={idx} position={[
          Math.cos(currentTimeRef.current * v.speed + v.baseAngle) * v.radius,
          v.yOffset,
          Math.sin(currentTimeRef.current * v.speed + v.baseAngle) * v.radius
        ]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color="#00C8FF" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Fireworks */}
      <Firework position={[-4, 6, -3]} color="#ff2255" />
      <Firework position={[5, 7, -2]} color="#00ffcc" />
      <Firework position={[2, 6.5, 4]} color="#ffff22" />
      <Firework position={[-2, 7.5, -4]} color="#a78bfa" />

      <TelemetryHUD scrollProgress={scrollProgress} />

      {/* Background dust */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(backgroundDust.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#7C5CFF" transparent opacity={0.35} />
      </points>

      {/* Stadium hotspot markers */}
      {STADIUM_MARKERS.map((node) => {
        const isHovered = hoveredNode === node.name;
        const isActive = activeNode && activeNode.name === node.name;
        return (
          <group
            key={node.name}
            position={node.position}
            onClick={(e) => { e.stopPropagation(); onNodeClick?.(isActive ? null : node); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(node.name); }}
            onPointerOut={() => setHoveredNode(null)}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, isHovered || isActive ? 0.35 : 0.28, 16]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={isActive ? 0.95 : isHovered ? 0.75 : 0.45}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
            <Html position={[0, 0.4, 0]} distanceFactor={8} center zIndexRange={[100, 0]}>
              <div
                className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider whitespace-nowrap shadow-lg transition-all duration-200 cursor-pointer pointer-events-auto"
                style={{
                  background: isActive ? node.color : 'rgba(5, 8, 22, 0.85)',
                  border: `1px solid ${node.color}`,
                  color: isActive ? '#030612' : '#ffffff',
                  boxShadow: isActive ? `0 0 15px ${node.color}` : 'none'
                }}
              >
                {node.name}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Holographic data core */}
      <mesh ref={hologramRef} position={[0, 5.0, 0]}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#46f3ff" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
