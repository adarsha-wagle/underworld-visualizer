import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { WORLD } from "@/constants/world";

interface SwimmingFishProps {
  count?: number;
}

function BigDebris({ count = WORLD.x }: SwimmingFishProps) {
  const fishRef = useRef<THREE.Points | null>(null);
  const velocities = useRef<Float32Array | null>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spread within world bounds
      positions[i3] = (Math.random() - 0.5) * WORLD.x;
      positions[i3 + 1] = (Math.random() - 0.5) * WORLD.y;
      positions[i3 + 2] = (Math.random() - 0.5) * WORLD.z;

      // Tropical fish colors
      const colorType = Math.random();
      if (colorType < 0.3) {
        colors.set([1.0, 0.5, 0.1], i3); // Orange
      } else if (colorType < 0.6) {
        colors.set([0.2, 0.6, 1.0], i3); // Blue
      } else {
        colors.set([1.0, 1.0, 0.2], i3); // Yellow
      }
    }

    return { positions, colors };
  }, [count]);

  useEffect(() => {
    const vels = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      vels[i3] = (Math.random() - 0.5) * 0.02;
      vels[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vels[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    velocities.current = vels;
  }, [count]);

  useFrame((state) => {
    const ref = fishRef.current;
    const vels = velocities.current;
    if (!ref || !vels) return;

    const posArray = ref.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3] += vels[i3] + Math.sin(time + i) * 0.005;
      posArray[i3 + 1] += vels[i3 + 1] + Math.cos(time * 0.7 + i) * 0.003;
      posArray[i3 + 2] += vels[i3 + 2] + Math.sin(time * 0.5 + i) * 0.005;

      // Clamp within world boundaries
      if (Math.abs(posArray[i3]) > WORLD.x / 2) vels[i3] *= -1;
      if (Math.abs(posArray[i3 + 1]) > WORLD.y / 2) vels[i3 + 1] *= -1;
      if (Math.abs(posArray[i3 + 2]) > WORLD.z / 2) vels[i3 + 2] *= -1;
    }

    ref.geometry.attributes.position.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      fishRef.current?.geometry.dispose();
    };
  }, []);

  return (
    <points ref={fishRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default BigDebris;
