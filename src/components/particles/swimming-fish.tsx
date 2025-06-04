import { useRef, useMemo } from "react";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SwimmingFishProps {
  count?: number;
}

function SwimmingFish({ count = 150 }: SwimmingFishProps) {
  const fishRef = useRef<THREE.Points>(null!);
  const velocities = useRef<Float32Array>(null);

  const fishData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread fish throughout the underwater world
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      // Random fish colors (tropical fish variety)
      const colorType = Math.random();
      if (colorType < 0.3) {
        colors[i * 3] = 1.0; // Orange fish
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.1;
      } else if (colorType < 0.6) {
        colors[i * 3] = 0.2; // Blue fish
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0; // Yellow fish
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.2;
      }

      // Random swimming velocities
      vels[i * 3] = (Math.random() - 0.5) * 0.02;
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    velocities.current = vels;
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!fishRef.current || !velocities.current) return;

    const positions = fishRef.current.geometry.attributes.position
      .array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      // Swimming motion with schooling behavior
      positions[i * 3] +=
        velocities.current[i * 3] + Math.sin(time + i) * 0.005;
      positions[i * 3 + 1] +=
        velocities.current[i * 3 + 1] + Math.cos(time * 0.7 + i) * 0.003;
      positions[i * 3 + 2] +=
        velocities.current[i * 3 + 2] + Math.sin(time * 0.5 + i) * 0.005;

      // Boundary checking - keep fish in bounds
      if (Math.abs(positions[i * 3]) > 60) {
        velocities.current[i * 3] *= -1;
      }
      if (positions[i * 3 + 1] > 30 || positions[i * 3 + 1] < -20) {
        velocities.current[i * 3 + 1] *= -1;
      }
      if (Math.abs(positions[i * 3 + 2]) > 60) {
        velocities.current[i * 3 + 2] *= -1;
      }
    }

    fishRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={fishRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[fishData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[fishData.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

export default SwimmingFish;
