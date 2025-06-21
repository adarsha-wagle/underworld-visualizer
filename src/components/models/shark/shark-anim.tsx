import React, { useRef } from "react";
import { useGLTF, useAnimations, Clone } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { IDynamicModel } from "../common/types";
import useModelAi from "../common/use-model-ai";

const MODEL_PATH = "/models/shark-anim.glb";

const tempVectorSwim = new THREE.Vector3();

export type TSharkBehavior = "swim" | "wanderer" | "zigzag";

export interface IShark extends IDynamicModel {
  behavior: TSharkBehavior;
  speed: number;
}

interface ISharkProps {
  shark: IShark;
}

useGLTF.preload(MODEL_PATH);

// Adds a small random variation to direction every few seconds to simuate swimming behavior
const updateSwim = (shark: IShark, deltaTime: number): void => {
  shark.behaviorTimer += deltaTime;
  if (shark.behaviorTimer > 2 + Math.random() * 2) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.2
    );
    shark.direction.add(variation.multiplyScalar(0.1)).normalize();
    shark.behaviorTimer = 0;
  }
};

const updateZigzag = (shark: IShark, deltaTime: number): void => {
  const amplitude = 4;
  const frequency = 0.1;

  const sideVector = new THREE.Vector3().copy(shark.direction);
  sideVector
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    .normalize();

  const time = shark.behaviorTimer;
  const offsetAmount = Math.sin(time * frequency * Math.PI * 2) * amplitude;

  const targetOffset = sideVector.multiplyScalar(offsetAmount);
  shark.position.add(targetOffset.clone().multiplyScalar(deltaTime));

  shark.behaviorTimer += deltaTime;
};

const wanderer = (shark: IShark, deltaTime: number): void => {};

export default function Shark({ shark }: ISharkProps) {
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
    if (shark.currentRotationY === undefined) {
      shark.currentRotationY = Math.atan2(shark.direction.x, shark.direction.z);
    }
  }, [shark]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Move the shark
    move(shark, delta);

    // Update shark behavior
    switch (shark.behavior) {
      case "swim":
        updateSwim(shark, delta);
        break;
      case "zigzag":
        updateZigzag(shark, delta);
        break;
      default:
        break;
    }

    // IMPROVED: Even smoother visual updates with different lerp speeds
    groupRef.current.position.lerp(shark.position, 0.3); // Slightly faster position updates

    // Smoother rotation updates
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      shark.rotation.x,
      0.1 // Slower for pitch
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      shark.rotation.y,
      0.2 // Medium speed for yaw
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      shark.rotation.z,
      0.15 // Slower for banking effect
    );
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <Clone object={scene} ref={groupRef} />
    </>
  );
}
