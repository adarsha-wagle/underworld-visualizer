import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useEffect } from "react";

const MODEL_PATH = "/models/lobster.glb";

type TLobster = GLTF & {
  nodes: {
    finRight?: THREE.Mesh;
    finLeft?: THREE.Mesh;
    body?: THREE.Mesh;
    legFirst?: THREE.Mesh;
    legMiddle?: THREE.Mesh;
    legLast?: THREE.Mesh;
    mustacheLeft?: THREE.Mesh;
    mustacheRight?: THREE.Mesh;
    tail?: THREE.Mesh;
    [key: string]: any;
  };
};

useGLTF.preload(MODEL_PATH);

function Lobster() {
  const lobsterGltf = useGLTF(MODEL_PATH) as TLobster;
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Refs for individual parts
  const finRightRef = useRef<THREE.Mesh>(null);
  const finLeftRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const mustacheLeftRef = useRef<THREE.Mesh>(null);
  const mustacheRightRef = useRef<THREE.Mesh>(null);
  const legFirstRef = useRef<THREE.Mesh>(null);
  const legMiddleRef = useRef<THREE.Mesh>(null);
  const legLastRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!lobsterGltf.scene) return;

    // Optionally assign refs to mesh parts directly
    lobsterGltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        switch (child.name) {
          case "finRight":
            finRightRef.current = child;
            break;
          case "finLeft":
            finLeftRef.current = child;
            break;
          case "tail":
            tailRef.current = child;
            break;
          case "mustacheLeft":
            mustacheLeftRef.current = child;
            break;
          case "mustacheRight":
            mustacheRightRef.current = child;
            break;
          case "legFirst":
            legFirstRef.current = child;
            break;
          case "legMiddle":
            legMiddleRef.current = child;
            break;
          case "legLast":
            legLastRef.current = child;
            break;
        }
      }
    });
  }, [lobsterGltf]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Group gentle sway
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
      groupRef.current.rotation.x = Math.cos(t * 0.2) * 0.03;
    }

    // Animate parts
    finLeftRef.current!.rotation.z = Math.sin(t * 5) * 0.2;
    finRightRef.current!.rotation.z = -Math.sin(t * 5) * 0.2;

    tailRef.current!.rotation.x = Math.sin(t * 3) * 0.15;

    mustacheLeftRef.current!.rotation.y = Math.sin(t * 4) * 0.2;
    mustacheRightRef.current!.rotation.y = -Math.sin(t * 4) * 0.2;

    legFirstRef.current!.rotation.z = Math.sin(t * 2) * 0.1;
    legMiddleRef.current!.rotation.z = Math.sin(t * 2 + 1) * 0.1;
    legLastRef.current!.rotation.z = Math.sin(t * 2 + 2) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0, 60]}>
      <primitive object={lobsterGltf.scene} />
    </group>
  );
}

export default Lobster;
