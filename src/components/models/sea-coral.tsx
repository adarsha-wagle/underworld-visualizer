import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useEffect } from "react";

const MODEL_PATH = "/models/sea-coral.glb";

type TSeaCoralGLTF = GLTF & {
  nodes: {
    leaf1?: THREE.Mesh;
    leaf2?: THREE.Mesh;
    body?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

useGLTF.preload(MODEL_PATH);

function SeaCoral() {
  const groupRef = useRef<THREE.Group>(null);
  const seaCoralGltf = useGLTF(MODEL_PATH) as TSeaCoralGLTF;

  const leaf1Ref = useRef<THREE.Mesh>(null);
  const leaf2Ref = useRef<THREE.Mesh>(null);

  // Assign references to the actual meshes inside the scene
  useEffect(() => {
    if (seaCoralGltf?.nodes) {
      if (seaCoralGltf.nodes.leaf1) leaf1Ref.current = seaCoralGltf.nodes.leaf1;
      if (seaCoralGltf.nodes.leaf2) leaf2Ref.current = seaCoralGltf.nodes.leaf2;
    }
  }, [seaCoralGltf]);

  // Animate the leaves with swaying motion
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sway = Math.sin(t * 1.2) * 0.1;

    if (leaf1Ref.current) {
      leaf1Ref.current.rotation.z = sway;
    }

    if (leaf2Ref.current) {
      leaf2Ref.current.rotation.z = -sway;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 20]}>
      <primitive object={seaCoralGltf.scene} />
    </group>
  );
}

export default SeaCoral;
