import React, { useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { WORLD } from "@/constants/world";
import { deltaAngle, lerpAngle } from "@/lib/math";

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
    -WORLD.width / 2,
    WORLD.width / 2
  );
  const clampedY = THREE.MathUtils.clamp(
    rawPosition.y,
    -WORLD.height * 0.2,
    WORLD.height * 0.2
  ); // optional Y limit
  const clampedZ = THREE.MathUtils.clamp(
    rawPosition.z,
    -WORLD.height / 2,
    WORLD.height / 2
  );

  return [clampedX, clampedY, clampedZ];
};

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
  // Wideness of the zigzag (amplitude in world units)
  const amplitude = 4;
  const frequency = 0.1; // cycles per second

  // Create perpendicular vector (side direction)
  const sideVector = new THREE.Vector3().copy(dolphin.direction);
  sideVector
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    .normalize();

  // Calculate side offset using sine wave
  const time = dolphin.behaviorTimer;
  const offsetAmount = Math.sin(time * frequency * Math.PI * 2) * amplitude;

  // Calculate the desired direction by blending toward side offset
  const targetOffset = sideVector.multiplyScalar(offsetAmount);

  // Smoothly nudge position sideways (not direction)
  dolphin.position.add(targetOffset.clone().multiplyScalar(deltaTime));

  dolphin.behaviorTimer += deltaTime;
};

const move = (dolphin: IDolphin, deltaTime: number): void => {
  // Calculate distance to target - FIXED: Use targetPosition instead of targetDirection
  const distanceToTarget = dolphin.position.distanceTo(dolphin.targetPosition);
  dolphin.targetDistance = distanceToTarget; // Update the distance property

  // Check if target is reached
  if (distanceToTarget <= dolphin.targetThreshold) {
    dolphin.hasReachedTarget = true;

    // Generate next target - FIXED: Set targetPosition, not targetDirection
    const [x, y, z] = generateNewPosition(dolphin);
    dolphin.targetPosition.set(x, y, z);

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
  const targetAngle = Math.atan2(dolphin.direction.x, dolphin.direction.z);

  dolphin.rotation.y = lerpAngle(previousAngle, targetAngle, deltaTime * 2);

  const turnRate = Math.abs(deltaAngle(previousAngle, dolphin.rotation.y));
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
  const targetRef = useRef<THREE.Mesh>(null);
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
        updateZigzag(dolphin, delta);
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

    targetRef.current?.position.copy(dolphin.targetPosition);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <primitive ref={groupRef} object={scene} />

      {/* Target position indicator - FIXED: Make it visible */}
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
