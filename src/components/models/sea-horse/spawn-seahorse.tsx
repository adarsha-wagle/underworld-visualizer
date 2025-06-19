import * as THREE from "three";
import { memo, useMemo, type JSX } from "react";

import { WORLD } from "@/constants/world";
import type { TSeaHorseBehavior } from "./seahorse";
import SeaHorse from "./seahorse";

// Seahorse spawner component
function SpawnSeaHorses(): JSX.Element {
  const behaviors: TSeaHorseBehavior[] = [
    "wanderer",
    "circular",
    "floater",
    "zigzag",
  ];

  // Generate seahorse data
  const seahorseData = useMemo(() => {
    const seahorseCount = 8; // Fewer than goldfish since seahorses are typically less numerous
    const halfBoundsX = WORLD.x * 0.4;
    const halfBoundsY = WORLD.y * 0.4;
    const halfBoundsZ = WORLD.z * 0.4;

    return Array.from({ length: seahorseCount }, (_, i) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const initialDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.3, // Less vertical movement
        (Math.random() - 0.5) * 2
      ).normalize();

      return {
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * halfBoundsX * 2,
          (Math.random() - 0.5) * halfBoundsY * 2,
          (Math.random() - 0.5) * halfBoundsZ * 2
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        direction: initialDirection,
        rotation: new THREE.Euler(0, 0, 0),
        behavior,
        speed: 1 + Math.random() * 2, // Slower than goldfish
        // Initialize behavior-specific data
        circleCenter: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.x * 0.6,
          (Math.random() - 0.5) * WORLD.y * 0.6,
          (Math.random() - 0.5) * WORLD.z * 0.6
        ),
        circleRadius: 20 + Math.random() * 25,
        zigzagTimer: 0,
        restTimer: 0,
        behaviorTimer: 0,
        lastAnimTime: 1,
        swimSpeed: 0,
        // Initialize rotation values
        targetRotationY: Math.atan2(initialDirection.x, initialDirection.z),
        currentRotationY: Math.atan2(initialDirection.x, initialDirection.z),
      };
    });
  }, []);

  // Memoized lighting setup
  const lighting = useMemo(
    () => (
      <>
        <ambientLight intensity={0.3} color="#87CEEB" />
        <directionalLight
          position={[10, 15, 10]}
          intensity={0.6}
          color="#FFE4B5"
        />
        <directionalLight
          position={[-10, 8, 10]}
          intensity={0.2}
          color="#4169E1"
        />
      </>
    ),
    []
  );

  return (
    <>
      {lighting}
      {/* Render seahorses */}
      {seahorseData.map((seahorse) => (
        <SeaHorse key={seahorse.id} seahorseData={seahorse} />
      ))}
    </>
  );
}

export default memo(SpawnSeaHorses);
