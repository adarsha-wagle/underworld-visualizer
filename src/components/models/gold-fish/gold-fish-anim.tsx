import React, { useRef } from "react";
import { useGLTF, useAnimations, Clone } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { IDynamicModel } from "../common/types";
import useModelAi from "../common/use-model-ai";

const MODEL_PATH = "/models/goldfish-anim.glb";

const tempVectorSwim = new THREE.Vector3();

export type TGoldfishBehavior = "swim" | "stopAndMove";

export interface IGoldfishAnim extends IDynamicModel {
  behavior: TGoldfishBehavior;
  speed: number;

  isMoving?: boolean;
  originalSpeed?: number;

  stopAndMoveTimer: number;
}

interface GoldfishAnimProps {
  goldfish: IGoldfishAnim;
}

useGLTF.preload(MODEL_PATH);

// Adds a small random variation to direction every few seconds to simuate swimming behavior
const updateSwim = (goldfish: IGoldfishAnim, deltaTime: number): void => {
  goldfish.behaviorTimer += deltaTime;
  if (goldfish.behaviorTimer > 2 + Math.random() * 2) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.2
    );
    goldfish.direction.add(variation.multiplyScalar(0.1)).normalize();
    goldfish.behaviorTimer = 0;
  }
};

const updateStopAndMove = (
  goldfish: IGoldfishAnim,
  deltaTime: number
): void => {
  // Initialize properties if not set
  if (goldfish.isMoving === undefined) {
    goldfish.isMoving = true;
    goldfish.originalSpeed = goldfish.speed;
  }

  goldfish.behaviorTimer += deltaTime;

  if (goldfish.behaviorTimer > goldfish.stopAndMoveTimer) {
    goldfish.isMoving = !goldfish.isMoving;
    goldfish.behaviorTimer = 0;

    // Set speed based on current state
    if (goldfish.isMoving) {
      goldfish.speed = goldfish.originalSpeed || 1;
    } else {
      goldfish.speed = 0;
    }
  }

  // Add slight directional variation when moving (like natural swimming)
  if (goldfish.isMoving && goldfish.behaviorTimer > 0.5) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.1
    );
    goldfish.direction.add(variation.multiplyScalar(0.05)).normalize();
  }
  if (!goldfish.isMoving) {
    // Add gentle swaying motion while stopped
    const time = 0.5;

    const swayAmount = Math.sin(time * 1.5) * 0.01; // Left/right sway
    const bobAmount = Math.sin(time * 1.2) * 0.015; // Vertical bob

    goldfish.position.x += swayAmount;
    goldfish.position.y += bobAmount;
  }
};

export default function Goldfish({ goldfish }: GoldfishAnimProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, groupRef);

  const { move } = useModelAi();

  React.useEffect(() => {
    if (actions && animations.length > 0) {
      animations.forEach((clip) => {
        const action = actions[clip.name];
        if (action) {
          action.reset().play();
        }
      });
    }
  }, [actions, animations]);

  // Initialize rotation values if not set
  React.useEffect(() => {
    if (goldfish.currentRotationY === undefined) {
      goldfish.currentRotationY = Math.atan2(
        goldfish.direction.x,
        goldfish.direction.z
      );
    }
  }, [goldfish]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Move the goldfish
    move(goldfish, delta);

    // Update goldfish behavior
    switch (goldfish.behavior) {
      case "swim":
        updateSwim(goldfish, delta);
        break;
      case "stopAndMove":
        updateStopAndMove(goldfish, delta);
        break;
      default:
        break;
    }

    // IMPROVED: Even smoother visual updates with different lerp speeds
    groupRef.current.position.lerp(goldfish.position, 0.3); // Slightly faster position updates

    // Smoother rotation updates
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      goldfish.rotation.x,
      0.1 // Slower for pitch
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      goldfish.rotation.y,
      0.2 // Medium speed for yaw
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      goldfish.rotation.z,
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
