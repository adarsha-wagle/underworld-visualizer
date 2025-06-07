import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, type JSX } from "react";

const MODEL_PATH = "/models/seahorse.glb";

// Extend the GLTF type for proper typing
type TSeaHorseGLTF = GLTF & {
  nodes: {
    fin?: THREE.Mesh;
    body?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

useGLTF.preload(MODEL_PATH);

function SeaHorse(): JSX.Element {
  const seaHorseGltf = useGLTF(MODEL_PATH) as TSeaHorseGLTF;
  const groupRef = useRef<THREE.Group>(null);
  const finRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 🎐 Animate fin with faster flapping
    if (finRef.current) {
      finRef.current.rotation.z = Math.sin(t * 10) * 0.2;
    }

    // 🌊 Animate body with gentle swaying
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 1.5) * 0.1; // slow gentle sway
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.2; // bobbing up and down
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} />

      <group ref={groupRef} position={[10, 0, 0]}>
        <primitive object={seaHorseGltf.scene} />
        {seaHorseGltf.nodes.fin && (
          <primitive object={seaHorseGltf.nodes.fin} ref={finRef} />
        )}
      </group>
    </>
  );
}

export default SeaHorse;
