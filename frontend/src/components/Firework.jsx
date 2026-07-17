import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Firework({ position, color }) {
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
        p.velocity.y -= delta * 0.4;
        positions[idx * 3] += p.velocity.x * delta;
        positions[idx * 3 + 1] += p.velocity.y * delta;
        positions[idx * 3 + 2] += p.velocity.z * delta;
      } else {
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
