import * as THREE from "three";
import Mantaray, { type IMantaRay, type TMantaRayBehavior } from "./manta-ray";
import { useMemo } from "react";
import { WORLD } from "@/constants/world";

const mantraMantarayCount = 10;
const halfBoundX = WORLD.x / 2;
const halfBoundZ = WORLD.z / 2;

const behaviors: TMantaRayBehavior[] = ["swim"];

function SpawnMantarays() {
  const mantarays: IMantaRay[] = useMemo(() => {
    return Array.from({ length: mantraMantarayCount }, (_, index) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

      // Create unique Vector3 and Euler instances for each mantraMantaray
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * halfBoundX * 1.5,
        -10 + (Math.random() - 0.5) * 20, // Keep mantarays underwater
        (Math.random() - 0.5) * halfBoundZ * 1.5
      );

      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.3, // Reduce vertical movement
        (Math.random() - 0.5) * 2
      ).normalize();

      // Generate initial target position for each mantraMantaray
      const targetX = (Math.random() - 0.5) * halfBoundX * 1.5;
      const targetY = -10 + (Math.random() - 0.5) * 20; // Keep targets underwater
      const targetZ = (Math.random() - 0.5) * halfBoundZ * 1.5;

      return {
        id: index,
        behavior,
        position: position,
        velocity: new THREE.Vector3(0, 0, 0),
        direction: direction,
        rotation: new THREE.Euler(0, 0, 0),
        speed: 6 + Math.random() * 3, // Increase speed range
        behaviorTimer: Math.random() * 2, // Randomize initial timer

        targetDirection: direction.clone(),
        hasReachedTarget: false,
        targetThreshold: 8.0, // Increase threshold for more fluid movement
        targetPosition: new THREE.Vector3(targetX, targetY, targetZ),

        turningSpeed: 1.5 + Math.random() * 0.5, // Vary turning speeds
        currentSpeed: 3 + Math.random() * 2,
        desiredSpeed: 3 + Math.random() * 2,
        currentRotationY: Math.atan2(direction.x, direction.z),
        targetRotationY: 0,
      };
    });
  }, []);

  return (
    <>
      {mantarays.map((mantaray) => (
        <Mantaray key={mantaray.id} mantaray={mantaray} />
      ))}
    </>
  );
}

export default SpawnMantarays;
