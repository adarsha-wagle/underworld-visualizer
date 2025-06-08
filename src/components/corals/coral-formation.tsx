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
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.rotation.z =
        Math.cos(state.clock.elapsedTime * 0.3) * 0.03;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {/* Lower-res coral: fewer segments */}
      <coneGeometry args={[1.2, 5, 4]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
    </mesh>
  );
}
