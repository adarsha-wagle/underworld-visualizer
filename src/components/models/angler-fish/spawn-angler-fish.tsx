import * as THREE from "three";
import { useMemo, type JSX } from "react";
import { WORLD } from "@/constants/world";
import { AnglerFish, type TAnglerFishBehavior } from "./angler-fish";

function SpawnAnglerFish(): JSX.Element {
  const behaviors: TAnglerFishBehavior[] = [
    "lurker",
    "prowler",
    "ambush",
    "patrol",
  ];

  // Optimize angler fish data initialization
  const anglerFishData = useMemo(() => {
    const fishCount = 8; // Fewer angler fish since they're typically more solitary
    const halfBoundsX = WORLD.width * 0.45;
    const halfBoundsY = WORLD.height * 0.3; // Keep them more in lower areas
    const halfBoundsZ = WORLD.length * 0.45;

    return Array.from({ length: fishCount }, (_, i) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

      return {
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * halfBoundsX * 2,
          -WORLD.height * 0.1 + (Math.random() - 0.5) * halfBoundsY * 2, // Bias towards lower depths
          (Math.random() - 0.5) * halfBoundsZ * 2
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.3, // Less vertical movement
          (Math.random() - 0.5) * 2
        ).normalize(),
        rotation: new THREE.Euler(0, 0, 0),
        behavior,
        speed: 0.1 + Math.random() * 0.8, // Generally slower than goldfish
        // Initialize behavior-specific data
        patrolStart: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.width * 0.6,
          -WORLD.height * 0.2 + (Math.random() - 0.5) * WORLD.height * 0.4,
          (Math.random() - 0.5) * WORLD.length * 0.6
        ),
        patrolEnd: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.width * 0.6,
          -WORLD.height * 0.2 + (Math.random() - 0.5) * WORLD.height * 0.4,
          (Math.random() - 0.5) * WORLD.length * 0.6
        ),
        huntTimer: 0,
        waitTimer: 0,
        behaviorTimer: 0,
        lastAnimTime: 0,
        swimSpeed: 0,
        isHunting: false,
        lightIntensity: 0.3 + Math.random() * 0.7, // Randomize bulb brightness
        // Audio data for light effects (can be connected to actual audio later)
        audioData: {
          bass: 0,
          mid: 0,
          treble: 0,
          overall: 0,
        },
      };
    });
  }, []);

  // Memoized lighting setup optimized for deep sea environment
  const lighting = useMemo(
    () => (
      <>
        <ambientLight intensity={0.15} color="#001122" />
        <directionalLight
          position={[5, 15, 8]}
          intensity={0.3}
          color="#002244"
        />
        <directionalLight
          position={[-8, 8, 12]}
          intensity={0.2}
          color="#000033"
        />
      </>
    ),
    []
  );

  return (
    <>
      {lighting}
      {/* Render angler fish with memoized components */}
      {anglerFishData.map((fish) => (
        <AnglerFish key={fish.id} fishData={fish} />
      ))}
    </>
  );
}

export default SpawnAnglerFish;
