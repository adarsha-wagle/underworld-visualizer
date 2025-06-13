import React, { useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface IDolphinProps {
  position?: [number, number, number];
  scale?: number;
}

const MODEL_PATH = "/models/dolphin.glb";

useGLTF.preload(MODEL_PATH);

export default function Dolphin({ position = [0, 0, 0] }: IDolphinProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, group);

  React.useEffect(() => {
    if (actions && animations.length > 0) {
      console.log("actions", actions);
      actions[animations[0].name]?.reset().play();
    }
  }, [actions, animations]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <primitive ref={group} object={scene} position={position} />;
    </>
  );
}
