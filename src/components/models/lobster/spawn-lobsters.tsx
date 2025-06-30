import * as THREE from "three";
import Lobster, { type ILobster, type TLobsterBehavior } from "./lobster";
import { useMemo } from "react";
import { WORLD } from "@/constants/world";

const sharkCount = 10;
const halfBoundX = WORLD.x / 2;
const halfBoundZ = WORLD.z / 2;

const behaviors: TLobsterBehavior[] = ["swim", "zigzag", "stopAndMove"];

function SpawnLobsters() {
  const lobsters: ILobster[] = useMemo(() => {
    return Array.from({ length: sharkCount }, (_, index) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

      // Create unique Vector3 and Euler instances for each lobster
      const position = new THREE.Vector3(
        Math.random() * halfBoundX * (1 + Math.random()),
        -10 + (Math.random() - 0.5) * 20, // Keep lobsters underwater
        Math.random() * halfBoundZ * (1 + Math.random())
      );

      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.3, // Reduce vertical movement
        (Math.random() - 0.5) * 2
      ).normalize();

      // Generate initial target position for each lobster
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
        speed: 1 + Math.random() * 3, // Increase speed range
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
      {lobsters.map((lobster) => (
        <Lobster key={lobster.id} lobster={lobster} />
      ))}
    </>
  );
}

export default SpawnLobsters;
