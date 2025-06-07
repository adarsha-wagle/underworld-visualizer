import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useEffect } from "react";

type TWhaleGLTF = GLTF & {
  nodes: {
    tail?: THREE.Mesh;
    body?: THREE.Mesh;
    finBack?: THREE.Mesh;
    finRight?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

const MODEL_PATH = "/models/whale.glb";

useGLTF.preload(MODEL_PATH);

function Whale() {
  const groupRef = useRef<THREE.Group>(null);
  const whaleGltf = useGLTF(MODEL_PATH) as TWhaleGLTF;
  const timeRef = useRef(0);

  const tailRef = useRef<THREE.Mesh>(null);
  const finBackRef = useRef<THREE.Mesh>(null);
  const finRightRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!whaleGltf.scene) return;

    // Assign part refs based on names
    whaleGltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        switch (child.name) {
          case "tail":
            tailRef.current = child;
            break;
          case "finBack":
            finBackRef.current = child;
            break;
          case "finRight":
            finRightRef.current = child;
            break;
        }
      }
    });
  }, [whaleGltf]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Whale slow full-body sway
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.04;
      groupRef.current.rotation.x = Math.cos(t * 0.15) * 0.03;
    }

    // Tail flapping
    if (tailRef.current) {
      tailRef.current.rotation.x = Math.sin(t * 2) * 0.1;
    }

    // Fin gentle motion
    if (finBackRef.current) {
      finBackRef.current.rotation.z = Math.cos(t * 1.5) * 0.2;
    }

    if (finRightRef.current) {
      finRightRef.current.rotation.z = -Math.cos(t * 1.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 20]}>
      <primitive object={whaleGltf.scene} />
    </group>
  );
}

export default Whale;
