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

  targetDirection: THREE.Vector3;
  hasReachedTarget: boolean;
  targetThreshold: number;
  targetPosition: THREE.Vector3;

  turningSpeed: number;

  currentSpeed: number;
  desiredSpeed: number;

  // Add these for smoother rotation
  targetRotationY: number; // Target Y rotation angle
  currentRotationY: number; // Current Y rotation angle (smoothed)
}

interface IDolphinProps {
  dolphin: IDolphin;
}

useGLTF.preload(MODEL_PATH);

const generateNewPosition = (dolphin: IDolphin): [number, number, number] => {
  const { position, direction } = dolphin;

  // 1. Random angle between 70 and 140 degrees
  const angleDeg = 70 + Math.random() * (110 - 70);
  const angleRad = THREE.MathUtils.degToRad(angleDeg);

  // 2. Randomly rotate left or right
  const sign = Math.random() > 0.5 ? 1 : -1;

  // 3. New direction rotated from current direction (Y-axis only)
  const newDirection = direction
    .clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), angleRad * sign);

  // 4. Choose travel distance
  const distance = 30 + Math.random() * 30;

  // 5. Compute new target position
  const rawPosition = position
    .clone()
    .add(newDirection.multiplyScalar(distance));

  // 6. Clamp within world bounds
  const clampedX = THREE.MathUtils.clamp(
    rawPosition.x,
    -WORLD.x / 2,
    WORLD.x / 2
  );
  const clampedY = THREE.MathUtils.clamp(
    rawPosition.y,
    -WORLD.y * 0.2,
    WORLD.y * 0.2
  );
  const clampedZ = THREE.MathUtils.clamp(
    rawPosition.z,
    -WORLD.z / 2,
    WORLD.z / 2
  );

  return [clampedX, clampedY, clampedZ];
};

// Adds a small random variation to direction every few seconds to simuate swimming behavior
const updateSwim = (dolphin: IDolphin, deltaTime: number): void => {
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

const updateZigzag = (dolphin: IDolphin, deltaTime: number): void => {
  const amplitude = 4;
  const frequency = 0.1;

  const sideVector = new THREE.Vector3().copy(dolphin.direction);
  sideVector
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    .normalize();

  const time = dolphin.behaviorTimer;
  const offsetAmount = Math.sin(time * frequency * Math.PI * 2) * amplitude;

  const targetOffset = sideVector.multiplyScalar(offsetAmount);
  dolphin.position.add(targetOffset.clone().multiplyScalar(deltaTime));

  dolphin.behaviorTimer += deltaTime;
};

const move = (dolphin: IDolphin, deltaTime: number): void => {
  const distanceToTarget = dolphin.position.distanceTo(dolphin.targetPosition);

  // Check if target is reached
  if (distanceToTarget <= dolphin.targetThreshold) {
    dolphin.hasReachedTarget = true;

    // Generate next target
    const [x, y, z] = generateNewPosition(dolphin);
    dolphin.targetPosition.set(x, y, z);
    dolphin.hasReachedTarget = false;
  }

  // Calculate direction to target
  tempVectorMove.copy(dolphin.targetPosition).sub(dolphin.position).normalize();

  // IMPROVED: Smoother steering with configurable turning speed
  const maxTurnRate = dolphin.turningSpeed * deltaTime;
  const steerForce = tempVectorMove.sub(dolphin.direction);

  // Limit the steering force to prevent sudden turns
  if (steerForce.length() > maxTurnRate) {
    steerForce.normalize().multiplyScalar(maxTurnRate);
  }

  dolphin.direction.add(steerForce).normalize();

  // Speed management
  const slowdownDistance = 15.0;
  const speedupDistance = 30.0;

  if (distanceToTarget < slowdownDistance) {
    dolphin.desiredSpeed =
      dolphin.speed * 0.3 +
      (distanceToTarget / slowdownDistance) * dolphin.speed * 0.7;
  } else if (distanceToTarget > speedupDistance) {
    dolphin.desiredSpeed = dolphin.speed * 1.2;
  } else {
    dolphin.desiredSpeed = dolphin.speed;
  }

  // Smooth speed transitions
  const speedDiff = dolphin.desiredSpeed - dolphin.currentSpeed;
  dolphin.currentSpeed += speedDiff * deltaTime * 2.0;

  // Update position
  tempVectorMove
    .copy(dolphin.direction)
    .multiplyScalar(dolphin.currentSpeed * deltaTime);
  dolphin.position.add(tempVectorMove);

  // Update velocity
  dolphin.velocity.copy(dolphin.direction).multiplyScalar(dolphin.currentSpeed);

  // IMPROVED: Smooth rotation handling
  // Calculate target rotation angle
  const targetAngle = Math.atan2(dolphin.direction.x, dolphin.direction.z);

  // Initialize current rotation if not set
  if (dolphin.currentRotationY === undefined) {
    dolphin.currentRotationY = targetAngle;
  }

  // Find the shortest angular path to target
  let angleDiff = targetAngle - dolphin.currentRotationY;

  // Normalize angle difference to [-π, π]
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

  // Apply smooth rotation with speed control
  const rotationSpeed = 3.0; // Adjust this value to control rotation speed
  const maxRotationStep = rotationSpeed * deltaTime;

  if (Math.abs(angleDiff) > maxRotationStep) {
    // If angle difference is large, rotate at maximum speed
    dolphin.currentRotationY += Math.sign(angleDiff) * maxRotationStep;
  } else {
    // If close to target, move directly to target
    dolphin.currentRotationY = targetAngle;
  }

  // Normalize current rotation to [-π, π]
  while (dolphin.currentRotationY > Math.PI)
    dolphin.currentRotationY -= 2 * Math.PI;
  while (dolphin.currentRotationY < -Math.PI)
    dolphin.currentRotationY += 2 * Math.PI;

  // Set the rotation
  dolphin.rotation.y = dolphin.currentRotationY;

  // Banking turn effect - based on rotation speed
  const turnRate = Math.abs(angleDiff);
  dolphin.rotation.z = Math.sin(turnRate * 5) * 0.2; // Reduced amplitude for more subtle effect

  // Pitch based on vertical movement
  let pitchTarget = -dolphin.direction.y * 0.5;
  if (distanceToTarget < slowdownDistance) {
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
  const targetRef = useRef<THREE.Mesh>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, groupRef);

  React.useEffect(() => {
    if (actions && animations.length > 0) {
      actions[animations[0].name]?.reset().play();
    }
  }, [actions, animations]);

  // Initialize rotation values if not set
  React.useEffect(() => {
    if (dolphin.currentRotationY === undefined) {
      dolphin.currentRotationY = Math.atan2(
        dolphin.direction.x,
        dolphin.direction.z
      );
    }
  }, [dolphin]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Move the dolphin
    move(dolphin, delta);

    // Update dolphin behavior
    switch (dolphin.behavior) {
      case "swim":
        // updateSwim(dolphin, delta);
        break;
      case "zigzag":
        updateZigzag(dolphin, delta);
        break;
      default:
        break;
    }

    // IMPROVED: Even smoother visual updates with different lerp speeds
    groupRef.current.position.lerp(dolphin.position, 0.3); // Slightly faster position updates

    // Smoother rotation updates
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      dolphin.rotation.x,
      0.1 // Slower for pitch
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      dolphin.rotation.y,
      0.2 // Medium speed for yaw
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      dolphin.rotation.z,
      0.15 // Slower for banking effect
    );

    targetRef.current?.position.copy(dolphin.targetPosition);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <primitive ref={groupRef} object={scene} />

      {/* Target position indicator */}
      {dolphin.targetPosition && (
        <mesh ref={targetRef} position={dolphin.targetPosition}>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}
      {dolphin.position && (
        <mesh position={dolphin.position}>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial color="blue" />
        </mesh>
      )}
    </>
  );
}
