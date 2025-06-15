import React, { useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { WORLD } from "@/constants/world";

const MODEL_PATH = "/models/dolphin.glb";

const tempVectorSwim = new THREE.Vector3();
const tempVectorMove = new THREE.Vector3();

export type TDolphinBehavior = "swim" | "whistle" | "zigzag";

export interface IDolphin {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  behavior: TDolphinBehavior;
  speed: number;
  rotation: THREE.Euler;
  behaviorTimer: number;

  targetDirection: THREE.Vector3; // where dolphin wants to go
  hasReachedTarget: boolean; // Whether dolphin has reached the target initally set to false.
  targetThreshold: number;
  targetPosition: THREE.Vector3;

  targetDistance: number; // next distance from dolphin to target
  turningSpeed: number; // how fast it can turn (0.5 - 2.0)
  avoidanceDistance: number;

  currentSpeed: number; // current movement speed (should match speed initially)
  desiredSpeed: number; // Target speed (should match speed initially)
}

interface IDolphinProps {
  dolphin: IDolphin;
}

useGLTF.preload(MODEL_PATH);

const updateSwim = (dolphin: IDolphin, deltaTime: number): void => {
  // Add some swimming variation
  dolphin.behaviorTimer += deltaTime;

  if (dolphin.behaviorTimer > 2 + Math.random() * 2) {
    const variation = tempVectorSwim.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.2
    );

    dolphin.direction.add(variation.multiplyScalar(0.1)).normalize();
    dolphin.behaviorTimer = 0;
  }
};

const move = (dolphin: IDolphin, deltaTime: number): void => {
  // Calculate distance to target - FIXED: Use targetPosition instead of targetDirection
  const distanceToTarget = dolphin.position.distanceTo(dolphin.targetPosition);
  dolphin.targetDistance = distanceToTarget; // Update the distance property

  // Check if target is reached
  if (distanceToTarget <= dolphin.targetThreshold) {
    dolphin.hasReachedTarget = true;

    // Generate next target - FIXED: Set targetPosition, not targetDirection
    dolphin.targetPosition.set(
      (Math.random() - 0.5) * WORLD.width, // Center around 0
      (Math.random() - 0.5) * WORLD.height * 0.3, // Limited Y movement
      (Math.random() - 0.5) * WORLD.height // Center around 0
    );

    dolphin.hasReachedTarget = false;
  }

  // Calculate direction to target - FIXED: Direction calculation
  tempVectorMove.copy(dolphin.targetPosition).sub(dolphin.position).normalize();

  // FIXED: Don't overwrite targetDirection here, use it as intended
  // dolphin.targetDirection should represent the desired direction

  // Smooth steering towards target
  const steerForce = tempVectorMove
    .sub(dolphin.direction)
    .multiplyScalar(dolphin.turningSpeed);
  dolphin.direction.add(steerForce.multiplyScalar(deltaTime)).normalize();

  // Speed management based on distance to target
  const slowdownDistance = 15.0;
  const speedupDistance = 30.0;

  if (distanceToTarget < slowdownDistance) {
    // Slow down when approaching target
    dolphin.desiredSpeed =
      dolphin.speed * 0.3 +
      (distanceToTarget / slowdownDistance) * dolphin.speed * 0.7;
  } else if (distanceToTarget > speedupDistance) {
    // Speed up when far from target
    dolphin.desiredSpeed = dolphin.speed * 1.2;
  } else {
    // Normal speed
    dolphin.desiredSpeed = dolphin.speed;
  }

  // Smooth speed transitions
  const speedDiff = dolphin.desiredSpeed - dolphin.currentSpeed;
  dolphin.currentSpeed += speedDiff * deltaTime * 2.0; // Acceleration factor

  // Update position with current speed - FIXED: Use fresh vector
  tempVectorMove
    .copy(dolphin.direction)
    .multiplyScalar(dolphin.currentSpeed * deltaTime);
  dolphin.position.add(tempVectorMove);

  // Update velocity
  dolphin.velocity.copy(dolphin.direction).multiplyScalar(dolphin.currentSpeed);

  // Calculate realistic rotation
  const angle = Math.atan2(dolphin.direction.x, dolphin.direction.z);
  dolphin.rotation.y = angle;

  // Banking turn effect - FIXED: Calculate turn rate properly
  const previousAngle = dolphin.rotation.y;
  const turnRate = Math.abs(angle - previousAngle);
  dolphin.rotation.z = Math.sin(turnRate * 10) * 0.3; // Amplify for visible effect

  // Pitch based on vertical movement and distance to target
  let pitchTarget = -dolphin.direction.y * 0.5;
  if (distanceToTarget < slowdownDistance) {
    // Add gentle diving motion when approaching target
    pitchTarget += Math.sin(Date.now() * 0.002) * 0.1;
  }
  dolphin.rotation.x = THREE.MathUtils.lerp(
    dolphin.rotation.x,
    pitchTarget,
    deltaTime * 2
  );
};

export default function Dolphin({ dolphin }: IDolphinProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, groupRef);

  React.useEffect(() => {
    if (actions && animations.length > 0) {
      actions[animations[0].name]?.reset().play();
    }
  }, [actions, animations]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // move the dolphin to target position
    move(dolphin, delta);

    // update dolphin behavior
    switch (dolphin.behavior) {
      case "swim":
        updateSwim(dolphin, delta);
        break;
      case "zigzag":
        updateSwim(dolphin, delta);
        break;
      default:
        break;
    }

    // FIXED: More responsive position updates
    groupRef.current.position.lerp(dolphin.position, 0.2);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      dolphin.rotation.x,
      0.15
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      dolphin.rotation.y,
      0.15
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      dolphin.rotation.z,
      0.15
    );
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <primitive ref={groupRef} object={scene} />

      {/* Target position indicator - FIXED: Make it visible */}
      {dolphin.targetPosition && (
        <mesh position={dolphin.targetPosition}>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}

      {/* Reached target indicator - FIXED: Different position and geometry */}
      {dolphin.hasReachedTarget && (
        <mesh position={dolphin.position}>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshBasicMaterial color="green" wireframe />
        </mesh>
      )}
    </>
  );
}
