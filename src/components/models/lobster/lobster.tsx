import React, { useRef } from "react";
import { useGLTF, useAnimations, Clone } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { IDynamicModel } from "../common/types";
import useModelAi from "../common/use-model-ai";

const MODEL_PATH = "/models/lobster.glb";

export type TLobsterBehav =
  | "scavenger"
  | "territorial"
  | "burrower"
  | "wanderer";

const tempVectorSwim = new THREE.Vector3();

export type TLobsterBehavior = "swim" | "wanderer" | "zigzag" | "stopAndMove";

export interface ILobster extends IDynamicModel {
  behavior: TLobsterBehavior;
  speed: number;

  isMoving?: boolean;
  originalSpeed?: number;
}

interface ILobsterProps {
  lobster: ILobster;
}

useGLTF.preload(MODEL_PATH);

// Adds a small random variation to direction every few seconds to simuate swimming behavior
const updateSwim = (lobster: ILobster, deltaTime: number): void => {
  lobster.behaviorTimer += deltaTime;
  if (lobster.behaviorTimer > 2 + Math.random() * 2) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.2
    );
    lobster.direction.add(variation.multiplyScalar(0.1)).normalize();
    lobster.behaviorTimer = 0;
  }
};

const updateZigzag = (lobster: ILobster, deltaTime: number): void => {
  const amplitude = 4;
  const frequency = 0.1;

  const sideVector = new THREE.Vector3().copy(lobster.direction);
  sideVector
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    .normalize();

  const time = lobster.behaviorTimer;
  const offsetAmount = Math.sin(time * frequency * Math.PI * 2) * amplitude;

  const targetOffset = sideVector.multiplyScalar(offsetAmount);
  lobster.position.add(targetOffset.clone().multiplyScalar(deltaTime));

  lobster.behaviorTimer += deltaTime;
};

const updateStopAndMove = (lobster: ILobster, deltaTime: number): void => {
  // Initialize properties if not set
  if (lobster.isMoving === undefined) {
    lobster.isMoving = true;
    lobster.originalSpeed = lobster.speed;
  }

  lobster.behaviorTimer += deltaTime;

  // Change between moving and stopping every 2-4 seconds
  const switchInterval = 2 + Math.random() * 2;

  if (lobster.behaviorTimer > switchInterval) {
    lobster.isMoving = !lobster.isMoving;
    lobster.behaviorTimer = 0;

    // Set speed based on current state
    if (lobster.isMoving) {
      lobster.speed = lobster.originalSpeed || 1;
    } else {
      lobster.speed = 0;
    }
  }

  // Add slight directional variation when moving (like natural swimming)
  if (lobster.isMoving && lobster.behaviorTimer > 0.5) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.1
    );
    lobster.direction.add(variation.multiplyScalar(0.05)).normalize();
  }
};

export default function Lobster({ lobster }: ILobsterProps) {
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
    if (lobster.currentRotationY === undefined) {
      lobster.currentRotationY = Math.atan2(
        lobster.direction.x,
        lobster.direction.z
      );
    }
  }, [lobster]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Move the lobster
    move(lobster, delta);

    // Update lobster behavior
    switch (lobster.behavior) {
      case "swim":
        updateSwim(lobster, delta);
        break;
      case "zigzag":
        updateZigzag(lobster, delta);
        break;
      case "stopAndMove":
        updateStopAndMove(lobster, delta);
        break;
      default:
        break;
    }

    // IMPROVED: Even smoother visual updates with different lerp speeds
    groupRef.current.position.lerp(lobster.position, 0.3); // Slightly faster position updates

    // Smoother rotation updates
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      lobster.rotation.x,
      0.1 // Slower for pitch
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      lobster.rotation.y,
      0.2 // Medium speed for yaw
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      lobster.rotation.z,
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
