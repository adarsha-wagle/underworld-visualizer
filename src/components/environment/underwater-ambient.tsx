import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function UnderwaterAmbient() {
  const ambientRef = useRef<THREE.AmbientLight>(null!);

  useFrame((state) => {
    // Subtle color shifting for underwater atmosphere
    if (ambientRef.current) {
      const time = state.clock.elapsedTime;
      const intensity = 0.4 + Math.sin(time * 0.5) * 0.08;
      ambientRef.current.intensity = intensity;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} color="#006699" />
      <fog attach="fog" args={["#003355", 20, 120]} />
    </>
  );
}

export default UnderwaterAmbient;
