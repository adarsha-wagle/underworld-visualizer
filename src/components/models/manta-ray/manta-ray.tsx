import React, { useRef } from "react";
import { useGLTF, useAnimations, Clone } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { IDynamicModel } from "../common/types";
import useModelAi from "../common/use-model-ai";

const MODEL_PATH = "/models/manta-ray.glb";

const tempVectorSwim = new THREE.Vector3();

export type TMantaRayBehavior = "swim";

export interface IMantaRay extends IDynamicModel {
  behavior: TMantaRayBehavior;
  speed: number;

  isMoving?: boolean;
  originalSpeed?: number;
}

interface IMantaRayProps {
  mantaray: IMantaRay;
}

useGLTF.preload(MODEL_PATH);

// Adds a small random variation to direction every few seconds to simuate swimming behavior
const updateSwim = (mantaray: IMantaRay, deltaTime: number): void => {
  mantaray.behaviorTimer += deltaTime;
  if (mantaray.behaviorTimer > 2 + Math.random() * 2) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.2
    );
    mantaray.direction.add(variation.multiplyScalar(0.1)).normalize();
    mantaray.behaviorTimer = 0;
  }
};

export default function Mantaray({ mantaray }: IMantaRayProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, groupRef);

  const { move } = useModelAi();

  React.useEffect(() => {
    if (actions && animations.length > 0) {
      actions[animations[0].name]?.reset().play();
    }
  }, [actions, animations]);

  // Initialize rotation values if not set
  React.useEffect(() => {
    if (mantaray.currentRotationY === undefined) {
      mantaray.currentRotationY = Math.atan2(
        mantaray.direction.x,
        mantaray.direction.z
      );
    }
  }, [mantaray]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Move the mantaray
    move(mantaray, delta);

    // Update mantaray behavior
    switch (mantaray.behavior) {
      case "swim":
        updateSwim(mantaray, delta);
        break;
      default:
        break;
    }

    // IMPROVED: Even smoother visual updates with different lerp speeds
    groupRef.current.position.lerp(mantaray.position, 0.3); // Slightly faster position updates

    // Smoother rotation updates
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mantaray.rotation.x,
      0.1 // Slower for pitch
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mantaray.rotation.y,
      0.2 // Medium speed for yaw
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      mantaray.rotation.z,
      0.15 // Slower for banking effect
    );
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <Clone object={scene} ref={groupRef} />
    </>
  );
}
