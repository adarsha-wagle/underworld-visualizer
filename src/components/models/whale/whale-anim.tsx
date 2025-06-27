import React, { useRef } from "react";
import { useGLTF, useAnimations, Clone } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { IDynamicModel } from "../common/types";
import useModelAi from "../common/use-model-ai";

const MODEL_PATH = "/models/whale-anim.glb";

const tempVectorSwim = new THREE.Vector3();

export type TWhaleBehavior = "swim" | "stopAndMove";

export interface IWhale extends IDynamicModel {
  behavior: TWhaleBehavior;
  speed: number;

  isMoving?: boolean;
  originalSpeed?: number;

  stopAndMoveTimer: number;
}

interface IWhaleProps {
  whale: IWhale;
}

useGLTF.preload(MODEL_PATH);

// Adds a small random variation to direction every few seconds to simuate swimming behavior
const updateSwim = (whale: IWhale, deltaTime: number): void => {
  whale.behaviorTimer += deltaTime;
  if (whale.behaviorTimer > 2 + Math.random() * 2) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.2
    );
    whale.direction.add(variation.multiplyScalar(0.1)).normalize();
    whale.behaviorTimer = 0;
  }
};

const updateStopAndMove = (whale: IWhale, deltaTime: number): void => {
  // Initialize properties if not set
  if (whale.isMoving === undefined) {
    whale.isMoving = true;
    whale.originalSpeed = whale.speed;
  }

  whale.behaviorTimer += deltaTime;

  if (whale.behaviorTimer > whale.stopAndMoveTimer) {
    whale.isMoving = !whale.isMoving;
    whale.behaviorTimer = 0;

    // Set speed based on current state
    if (whale.isMoving) {
      whale.speed = whale.originalSpeed || 1;
    } else {
      whale.speed = 0;
    }
  }

  // Add slight directional variation when moving (like natural swimming)
  if (whale.isMoving && whale.behaviorTimer > 0.5) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.1
    );
    whale.direction.add(variation.multiplyScalar(0.05)).normalize();
  }
  if (!whale.isMoving) {
    // Add gentle swaying motion while stopped
    const time = 0.5;

    const swayAmount = Math.sin(time * 1.5) * 0.01; // Left/right sway
    const bobAmount = Math.sin(time * 1.2) * 0.015; // Vertical bob

    whale.position.x += swayAmount;
    whale.position.y += bobAmount;
  }
};

export default function Whale({ whale }: IWhaleProps) {
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
    if (whale.currentRotationY === undefined) {
      whale.currentRotationY = Math.atan2(whale.direction.x, whale.direction.z);
    }
  }, [whale]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Move the whale
    move(whale, delta);

    // Update whale behavior
    switch (whale.behavior) {
      case "swim":
        updateSwim(whale, delta);
        break;
      case "stopAndMove":
        updateStopAndMove(whale, delta);
        break;
      default:
        break;
    }

    // IMPROVED: Even smoother visual updates with different lerp speeds
    groupRef.current.position.lerp(whale.position, 0.3); // Slightly faster position updates

    // Smoother rotation updates
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      whale.rotation.x,
      0.1 // Slower for pitch
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      whale.rotation.y,
      0.2 // Medium speed for yaw
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      whale.rotation.z,
      0.15 // Slower for banking effect
    );
  });

  return <Clone object={scene} ref={groupRef} scale={3} />;
}
