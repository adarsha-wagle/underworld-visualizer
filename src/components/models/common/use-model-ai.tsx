import * as THREE from "three";

import { WORLD } from "@/constants/world";
import type { IDynamicModel } from "./types";

const tempVectorMove = new THREE.Vector3();

function useModelAi() {
  const generateNewPosition = (
    dolphin: IDynamicModel
  ): [number, number, number] => {
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

  const move = (dolphin: IDynamicModel, deltaTime: number): void => {
    const distanceToTarget = dolphin.position.distanceTo(
      dolphin.targetPosition
    );

    // Check if target is reached
    if (distanceToTarget <= dolphin.targetThreshold) {
      dolphin.hasReachedTarget = true;
      // Generate next target
      const [x, y, z] = generateNewPosition(dolphin);
      dolphin.targetPosition.set(x, y, z);
      dolphin.hasReachedTarget = false;
    }

    // Calculate direction to target
    tempVectorMove
      .copy(dolphin.targetPosition)
      .sub(dolphin.position)
      .normalize();

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
    dolphin.velocity
      .copy(dolphin.direction)
      .multiplyScalar(dolphin.currentSpeed);

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
    }

    // Normalize current rotation to [-π, π]
    // while (dolphin.currentRotationY > Math.PI)
    //   dolphin.currentRotationY -= 2 * Math.PI;
    // while (dolphin.currentRotationY < -Math.PI)
    //   dolphin.currentRotationY += 2 * Math.PI;

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

  return { generateNewPosition, move };
}

export default useModelAi;
