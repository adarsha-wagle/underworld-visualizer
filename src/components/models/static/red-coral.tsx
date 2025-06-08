import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Clone } from "@react-three/drei";

import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef } from "react";

const MODEL_PATH = "/models/red-coral.glb";

type TCoral = GLTF & {
  nodes: {
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

useGLTF.preload(MODEL_PATH);

type TRedCoralProps = {
  position: [number, number, number];
};

function RedCoral({ position }: TRedCoralProps) {
  const redCoralGltf = useGLTF(MODEL_PATH) as TCoral;
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.2;
      groupRef.current.rotation.y = Math.cos(t * 0.3) * 0.1;
      groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Clone object={redCoralGltf.scene} />
    </group>
  );
}

export default RedCoral;
