import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useEffect } from "react";

type TSharkGLTF = GLTF & {
  nodes: {
    tail?: THREE.Mesh;
    body?: THREE.Mesh;
    backFinLeft?: THREE.Mesh;
    backFinRight?: THREE.Mesh;
    finLeft?: THREE.Mesh;
    finRight?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

const MODEL_PATH = "/models/shark.glb";

useGLTF.preload(MODEL_PATH);

function Shark() {
  const groupRef = useRef<THREE.Group>(null);
  const sharkGltf = useGLTF(MODEL_PATH) as TSharkGLTF;
  const timeRef = useRef(0);

  const tailRef = useRef<THREE.Mesh>(null);
  const finLeftRef = useRef<THREE.Mesh>(null);
  const finRightRef = useRef<THREE.Mesh>(null);
  const backFinLeftRef = useRef<THREE.Mesh>(null);
  const backFinRightRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!sharkGltf.scene) return;

    sharkGltf.scene.traverse((child) => {
      console.log("child name", child.name);
      if (child instanceof THREE.Mesh) {
        switch (child.name) {
          case "tail":
            tailRef.current = child;
            break;
          case "finLeft":
            finLeftRef.current = child;
            break;
          case "finRight":
            finRightRef.current = child;
            break;
          case "backFinLeft":
            backFinLeftRef.current = child;
            break;
          case "backFinRight":
            backFinRightRef.current = child;
            break;
        }
      }
    });
  }, [sharkGltf]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Body gentle sway (like swimming)
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.05;
      groupRef.current.rotation.x = Math.cos(t * 0.3) * 0.02;
    }

    // Tail wiggle
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 2) * 0.4;
    }

    // Fins fluttering
    if (finLeftRef.current) {
      finLeftRef.current.rotation.z = Math.sin(t * 2.5) * 0.1;
    }

    if (finRightRef.current) {
      finRightRef.current.rotation.z = -Math.sin(t * 2.5) * 0.1;
    }

    if (backFinLeftRef.current) {
      backFinLeftRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
    }

    if (backFinRightRef.current) {
      backFinRightRef.current.rotation.z = -Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 80]}>
      <primitive object={sharkGltf.scene} />
    </group>
  );
}

export default Shark;
