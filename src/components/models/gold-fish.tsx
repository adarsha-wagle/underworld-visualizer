import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useEffect, type JSX } from "react";

const MODEL_PATH = "/models/gold-fish.glb";

type TGoldFishGlTF = GLTF & {
  nodes: {
    body?: THREE.Mesh;
    lowerBackLeftFin?: THREE.Mesh;
    lowerBackRightFin?: THREE.Mesh;
    lowerLeftFin?: THREE.Mesh;
    lowerRightFin?: THREE.Mesh;
    upperFin?: THREE.Mesh;
    tail?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

useGLTF.preload(MODEL_PATH);

function GoldFish(): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const goldFishGltf = useGLTF(MODEL_PATH) as TGoldFishGlTF;

  const lowerBackLeftFinRef = useRef<THREE.Mesh>(null);
  const lowerBackRightFinRef = useRef<THREE.Mesh>(null);
  const lowerLeftFinRef = useRef<THREE.Mesh>(null);
  const lowerRightFinRef = useRef<THREE.Mesh>(null);
  const upperFinRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  // ⛵ Animate the goldfish parts
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sway = Math.sin(t * 1.5) * 0.05;

    if (groupRef.current) {
      groupRef.current.rotation.y = sway;
      groupRef.current.position.y = Math.sin(t * 1.1) * 0.1;
    }

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 2) * 0.4;
    }

    if (upperFinRef.current) {
      upperFinRef.current.rotation.y = Math.sin(t) * 0.1;
    }

    if (lowerBackLeftFinRef.current) {
      lowerBackLeftFinRef.current.rotation.z = Math.sin(t * 7) * 0.3;
    }

    if (lowerBackRightFinRef.current) {
      lowerBackRightFinRef.current.rotation.z = -Math.sin(t * 7) * 0.3;
    }

    if (lowerLeftFinRef.current) {
      lowerLeftFinRef.current.rotation.z = Math.sin(t * 5) * 0.2;
    }

    if (lowerRightFinRef.current) {
      lowerRightFinRef.current.rotation.z = -Math.sin(t * 5) * 0.2;
    }
  });

  // 📌 Assign mesh refs after model loads
  useEffect(() => {
    lowerBackLeftFinRef.current = goldFishGltf.nodes.lowerBackLeftFin ?? null;
    lowerBackRightFinRef.current = goldFishGltf.nodes.lowerBackRightFin ?? null;
    lowerLeftFinRef.current = goldFishGltf.nodes.lowerLeftFin ?? null;
    lowerRightFinRef.current = goldFishGltf.nodes.lowerRightFin ?? null;
    upperFinRef.current = goldFishGltf.nodes.upperFin ?? null;
    tailRef.current = goldFishGltf.nodes.tail ?? null;
  }, [goldFishGltf]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={0.4} color="skyblue" />
      <group ref={groupRef} position={[0, 0, 0]}>
        <primitive object={goldFishGltf.scene} />
      </group>
    </>
  );
}

export default GoldFish;
