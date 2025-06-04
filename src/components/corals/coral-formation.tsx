import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CoralFormationProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
}

export function CoralFormation({
  position,
  color = "#ff6b6b",
  scale = 1,
}: CoralFormationProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle swaying motion like underwater plants
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.z =
        Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale}>
        <coneGeometry args={[2, 8, 6]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Soft coral glow */}
      <pointLight
        position={[0, 4, 0]}
        color={color}
        intensity={0.8}
        distance={20}
        decay={2}
      />
    </group>
  );
}
