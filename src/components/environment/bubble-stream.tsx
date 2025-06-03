import { useRef, useMemo } from "react";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IBubbleStreamProps {
  position: [number, number, number];
  count?: number;
}

function BubbleStream({ position, count = 50 }: IBubbleStreamProps) {
  const bubblesRef = useRef<THREE.Points>(null!);

  const bubbleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0] + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = position[1] - Math.random() * 20;
      positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
      sizes[i] = Math.random() * 0.5 + 0.2;
    }

    return { positions, sizes };
  }, [count, position]);

  useFrame(() => {
    if (!bubblesRef.current) return;

    const positions = bubblesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += 0.05 + Math.random() * 0.02;
      positions[i * 3] += Math.sin(positions[i * 3 + 1] * 0.1) * 0.01;

      if (positions[i * 3 + 1] > position[1] + 30) {
        positions[i * 3 + 1] = position[1] - 20;
        positions[i * 3] = position[0] + (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
      }
    }

    bubblesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={bubblesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[bubbleData.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#87CEEB"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

export default BubbleStream;
