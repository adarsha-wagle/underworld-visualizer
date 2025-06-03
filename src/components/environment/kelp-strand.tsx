import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface KelpStrandProps {
  position: [number, number, number];
  height?: number;
}

function KelpStrand({ position, height = 15 }: KelpStrandProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      // Underwater kelp swaying
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.x = Math.sin(time * 0.8) * 0.3;
      meshRef.current.rotation.z = Math.cos(time * 0.6) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.2, 0.5, height, 8]} />
      <meshStandardMaterial
        color="#3d7a5d"
        roughness={0.6}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
