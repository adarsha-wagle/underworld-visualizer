import { useRef, useMemo } from "react";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MarineParticlesProps {
  count?: number;
}

function MarineParticles({ count = 2000 }: MarineParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null!);

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 60 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      // Subtle marine particle colors
      const brightness = Math.random() * 0.5 + 0.3;
      colors[i * 3] = brightness * 0.7;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness * 1.2;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      // Gentle floating motion
      positions[i * 3] += Math.sin(time * 0.3 + i * 0.01) * 0.002;
      positions[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.02) * 0.003;
      positions[i * 3 + 2] += Math.cos(time * 0.4 + i * 0.015) * 0.002;

      // Slow downward drift
      positions[i * 3 + 1] -= 0.005;

      // Reset particles that drift too low
      if (positions[i * 3 + 1] < -30) {
        positions[i * 3 + 1] = 50;
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleData.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default MarineParticles;
