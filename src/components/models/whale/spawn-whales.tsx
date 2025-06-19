import * as THREE from "three";
import { memo, useMemo, type JSX } from "react";

import { WORLD } from "@/constants/world";
import type { TWhaleBehavior } from "./whale";
import Whale from "./whale";

// Whale spawner component
function SpawnWhales(): JSX.Element {
  const behaviors: TWhaleBehavior[] = [
    "migrator",
    "deep_diver",
    "surface_cruiser",
    "pod_follower",
  ];

  // Generate whale data
  const whaleData = useMemo(() => {
    const whaleCount = 3; // Fewer whales as they're large creatures
    const halfBoundsX = WORLD.x * 0.3;
    const halfBoundsY = WORLD.y * 0.3;
    const halfBoundsZ = WORLD.z * 0.3;

    // Create a pod center for pod followers
    const podCenter = new THREE.Vector3(
      (Math.random() - 0.5) * WORLD.x * 0.4,
      (Math.random() - 0.5) * WORLD.y * 0.2,
      (Math.random() - 0.5) * WORLD.z * 0.4
    );

    return Array.from({ length: whaleCount }, (_, i) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const initialDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.4,
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
        speed: 8 + Math.random() * 4, // Varied whale speeds
        scale: 0.8 + Math.random() * 0.6, // Varied whale sizes
        // Initialize behavior-specific data
        diveDepth: -15 - Math.random() * 20,
        surfaceTime: 0,
        podCenter: podCenter,
        podRadius: 40 + Math.random() * 30,
        behaviorTimer: Math.random() * 10, // Stagger behavior timers
        lastAnimTime: 0,
        swimSpeed: 0,
        // Initialize rotation values
        targetRotationY: Math.atan2(initialDirection.x, initialDirection.z),
        currentRotationY: Math.atan2(initialDirection.x, initialDirection.z),
        // Dive state
        isDiving: false,
        diveTimer: Math.random() * 20, // Stagger dive cycles
      };
    });
  }, []);

  // Memoized lighting setup optimized for whales
  const lighting = useMemo(
    () => (
      <>
        <ambientLight intensity={0.4} color="#4682B4" />
        <directionalLight
          position={[20, 30, 20]}
          intensity={0.8}
          color="#87CEEB"
          castShadow
        />
        <directionalLight
          position={[-15, 20, 15]}
          intensity={0.3}
          color="#191970"
        />
        {/* Underwater ambiance */}
        <pointLight
          position={[0, -20, 0]}
          intensity={0.2}
          color="#000080"
          distance={100}
        />
      </>
    ),
    []
  );

  return (
    <>
      {lighting}
      {/* Render whales */}
      {whaleData.map((whale) => (
        <Whale key={whale.id} whaleData={whale} />
      ))}
    </>
  );
}

export default memo(SpawnWhales);
