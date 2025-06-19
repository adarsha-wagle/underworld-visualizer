import * as THREE from "three";
import { memo, useMemo, type JSX } from "react";
import { WORLD } from "@/constants/world";
import { GoldFish, type TGoldFishBehavior } from "./gold-fish";

function SpawnGoldFish(): JSX.Element {
  const behaviors: TGoldFishBehavior[] = [
    "wanderer",
    "circular",
    "lazy",
    "zigzag",
  ];

  // Optimize fish data initialization
  const fishData = useMemo(() => {
    const fishCount = 15;
    const halfBoundsX = WORLD.x * 0.4;
    const halfBoundsY = WORLD.y * 0.4;
    const halfBoundsZ = WORLD.z * 0.4;

    return Array.from({ length: fishCount }, (_, i) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

      return {
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * halfBoundsX * 2,
          (Math.random() - 0.5) * halfBoundsY * 2,
          (Math.random() - 0.5) * halfBoundsZ * 2
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 2
        ).normalize(),
        rotation: new THREE.Euler(0, 0, 0),
        behavior,
        speed: 0.3 + Math.random() * 1.2,
        // Initialize behavior-specific data
        circleCenter: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.x * 0.6,
          (Math.random() - 0.5) * WORLD.y * 0.6,
          (Math.random() - 0.5) * WORLD.z * 0.6
        ),
        circleRadius: 30 + Math.random() * 30,
        zigzagTimer: 0,
        restTimer: 0,
        behaviorTimer: 0,
        lastAnimTime: 0,
        swimSpeed: 0,
      };
    });
  }, []);

  // Memoized lighting setup with reduced complexity
  const lighting = useMemo(
    () => (
      <>
        <ambientLight intensity={0.4} color="#87CEEB" />
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.8}
          color="#FFE4B5"
        />
        <directionalLight
          position={[-10, 10, 10]}
          intensity={0.3}
          color="#4169E1"
        />
      </>
    ),
    []
  );

  return (
    <>
      {lighting}
      {/* Render fish with memoized components */}
      {fishData.map((fish) => (
        <GoldFish key={fish.id} fishData={fish} />
      ))}
    </>
  );
}

export default memo(SpawnGoldFish);
