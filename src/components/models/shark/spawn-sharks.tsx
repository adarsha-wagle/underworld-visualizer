import * as THREE from "three";
import { useMemo, type JSX } from "react";
import type { TSharkBehavior } from "./shark";
import { WORLD } from "@/constants/world";
import Shark from "./shark";

// Shark spawner component
function SpawnSharks(): JSX.Element {
  const behaviors: TSharkBehavior[] = [
    "hunter",
    "patroller",
    "ambusher",
    "cruiser",
  ];

  // Generate shark data
  const sharkData = useMemo(() => {
    const sharkCount = 3; // Few sharks as they're apex predators
    const halfBoundsX = WORLD.width * 0.4;
    const halfBoundsY = WORLD.height * 0.4;
    const halfBoundsZ = WORLD.length * 0.4;

    return Array.from({ length: sharkCount }, (_, i) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const initialDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5,
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
        speed: 15 + Math.random() * 8, // Fast predators
        scale: 0.9 + Math.random() * 0.4, // Varied shark sizes
        // Initialize behavior-specific data
        huntingTarget: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.width * 0.6,
          (Math.random() - 0.5) * WORLD.height * 0.4,
          (Math.random() - 0.5) * WORLD.length * 0.6
        ),
        patrolRadius: 30 + Math.random() * 25,
        patrolCenter: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.width * 0.5,
          (Math.random() - 0.5) * WORLD.height * 0.3,
          (Math.random() - 0.5) * WORLD.length * 0.5
        ),
        ambushTimer: Math.random() * 8,
        isAmbushing: false,
        burstSpeed: 15,
        behaviorTimer: Math.random() * 5,
        lastAnimTime: 0,
        swimSpeed: 0,
        // Initialize rotation values
        targetRotationY: Math.atan2(initialDirection.x, initialDirection.z),
        currentRotationY: Math.atan2(initialDirection.x, initialDirection.z),
        // Aggression
        aggressionLevel: Math.random() * 0.5, // Start with some base aggression
      };
    });
  }, []);

  // Memoized lighting setup optimized for sharks
  const lighting = useMemo(
    () => (
      <>
        <ambientLight intensity={0.3} color="#2F4F4F" />
        <directionalLight
          position={[15, 25, 15]}
          intensity={0.7}
          color="#4682B4"
          castShadow
        />
        <directionalLight
          position={[-10, 15, -10]}
          intensity={0.4}
          color="#708090"
        />
        {/* Dramatic underwater lighting */}
        <spotLight
          position={[0, 30, 0]}
          angle={Math.PI / 6}
          intensity={0.5}
          color="#B0C4DE"
          distance={80}
          penumbra={0.5}
        />
      </>
    ),
    []
  );

  return (
    <>
      {lighting}
      {/* Render sharks */}
      {sharkData.map((shark) => (
        <Shark key={shark.id} sharkData={shark} />
      ))}
    </>
  );
}

export default SpawnSharks;
