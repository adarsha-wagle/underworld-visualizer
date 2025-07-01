import * as THREE from "three";
import Whale, { type IWhale, type TWhaleBehavior } from "./whale";
import { useMemo } from "react";
import { WORLD } from "@/constants/world";

const whaleCount = 3;
const halfBoundX = WORLD.x / 2;
const halfBoundZ = WORLD.z / 2;
const halfBoundY = WORLD.y;

const behaviors: TWhaleBehavior[] = ["swim", "stopAndMove"];

function SpawnWhales() {
  const whales: IWhale[] = useMemo(() => {
    return Array.from({ length: whaleCount }, (_, index) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

      const xRandom = Math.random() - Math.random();
      const zRandom = Math.random() - Math.random();
      const yRandom = Math.random() - Math.random();

      // Create unique Vector3 and Euler instances for each whaleWhale
      const position = new THREE.Vector3(
        xRandom * halfBoundX,
        yRandom * halfBoundY,
        zRandom * halfBoundZ
      );

      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.3, // Reduce vertical movement
        (Math.random() - 0.5) * 2
      ).normalize();

      // Generate initial target position for each whaleWhale
      const targetX = (Math.random() - 0.5) * halfBoundX * 1.5;
      const targetY = -10 + (Math.random() - 0.5) * 20; // Keep targets underwater
      const targetZ = (Math.random() - 0.5) * halfBoundZ * 1.5;

      const targetPosition = new THREE.Vector3(targetX, targetY, targetZ);

      return {
        id: index,
        behavior,
        position: position,
        velocity: new THREE.Vector3(0, 0, 0),
        direction: direction,
        rotation: new THREE.Euler(0, 0, 0),
        speed: 0.75 + Math.random() * 3, // Increase speed range
        behaviorTimer: Math.random() * 2, // Randomize initial timer

        targetDirection: direction.clone(),
        hasReachedTarget: false,
        targetThreshold: 8.0, // Increase threshold for more fluid movement
        targetPosition: targetPosition,

        turningSpeed: 1.5 + Math.random() * 0.5, // Vary turning speeds
        currentSpeed: 3 + Math.random() * 2,
        desiredSpeed: 3 + Math.random() * 2,
        currentRotationY: Math.atan2(direction.x, direction.z),
        targetRotationY: 0,
        stopAndMoveTimer: 5 + Math.floor(Math.random() * 10),
      };
    });
  }, []);

  return (
    <>
      {whales.map((whale) => (
        <Whale key={whale.id} whale={whale} />
      ))}
    </>
  );
}

export default SpawnWhales;
