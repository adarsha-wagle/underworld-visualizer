import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";

const MODEL_PATH = "/models/lobster.glb";

// World boundaries (smaller for lobsters - bottom dwellers)
const WORLD = {
  width: 200,
  height: 30,
  length: 200,
};

// Pre-allocated objects for performance
const tempVector = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();

// Extend the GLTF type for proper typing
type TLobsterGLTF = GLTF & {
  nodes: {
    finRight?: THREE.Mesh;
    finLeft?: THREE.Mesh;
    body?: THREE.Mesh;
    legFirst?: THREE.Mesh;
    legMiddle?: THREE.Mesh;
    legLast?: THREE.Mesh;
    mustacheLeft?: THREE.Mesh;
    mustacheRight?: THREE.Mesh;
    tail?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

export type TLobsterBehavior =
  | "scavenger"
  | "territorial"
  | "burrower"
  | "wanderer";

interface LobsterData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  rotation: THREE.Euler;
  behavior: TLobsterBehavior;
  speed: number;
  scale: number;
  // Behavior-specific data
  scavengeTarget: THREE.Vector3;
  territoryCenter: THREE.Vector3;
  territoryRadius: number;
  burrowTimer: number;
  isBurrowing: boolean;
  behaviorTimer: number;
  // Animation cache
  lastAnimTime: number;
  walkSpeed: number;
  // Rotation smoothing
  targetRotationY: number;
  currentRotationY: number;
  // Activity state
  activityLevel: number;
}

// Preload model for better performance
useGLTF.preload(MODEL_PATH);

// Helper function to find mesh by name in cloned scene
const findMeshByName = (
  scene: THREE.Object3D,
  name: string
): THREE.Mesh | null => {
  let foundMesh: THREE.Mesh | null = null;
  scene.traverse((child) => {
    if (child.name === name && child instanceof THREE.Mesh) {
      foundMesh = child;
    }
  });
  return foundMesh;
};

// Behavior update functions
const updateScavenger = (lobster: LobsterData, deltaTime: number): void => {
  lobster.behaviorTimer += deltaTime;

  // Update scavenging target periodically
  if (lobster.behaviorTimer > 4 + Math.random() * 6) {
    lobster.scavengeTarget.set(
      (Math.random() - 0.5) * WORLD.width * 0.9,
      -WORLD.height * 0.4 + Math.random() * 5, // Stay near bottom
      (Math.random() - 0.5) * WORLD.length * 0.9
    );
    lobster.behaviorTimer = 0;
    lobster.activityLevel = Math.min(lobster.activityLevel + 0.3, 1);
  }

  // Move towards scavenging target
  tempVector.copy(lobster.scavengeTarget).sub(lobster.position);
  const distanceToTarget = tempVector.length();

  if (distanceToTarget > 3) {
    tempVector.normalize();
    lobster.direction.lerp(tempVector, 0.06); // Deliberate movement

    const currentSpeed = lobster.speed * (0.8 + lobster.activityLevel * 0.4);
    tempVector2
      .copy(lobster.direction)
      .multiplyScalar(currentSpeed * deltaTime);
    lobster.position.add(tempVector2);
    lobster.velocity.copy(lobster.direction).multiplyScalar(currentSpeed);
  } else {
    // Reached target, slow down and find new target
    lobster.activityLevel = Math.max(lobster.activityLevel - 0.1, 0);
    lobster.behaviorTimer = 3; // Force new target soon
  }
};

const updateTerritorial = (lobster: LobsterData, deltaTime: number): void => {
  lobster.behaviorTimer += deltaTime;

  const distanceFromCenter = lobster.position.distanceTo(
    lobster.territoryCenter
  );

  if (distanceFromCenter > lobster.territoryRadius) {
    // Return to territory
    tempVector.copy(lobster.territoryCenter).sub(lobster.position).normalize();
    lobster.direction.lerp(tempVector, 0.08);
    lobster.activityLevel = Math.min(lobster.activityLevel + 0.2, 1);
  } else {
    // Patrol territory
    if (lobster.behaviorTimer > 3 + Math.random() * 4) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * lobster.territoryRadius * 0.8;

      tempVector
        .set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
        .add(lobster.territoryCenter);

      tempVector2.copy(tempVector).sub(lobster.position).normalize();
      lobster.direction.lerp(tempVector2, 0.05);
      lobster.behaviorTimer = 0;
    }
  }

  const currentSpeed = lobster.speed * (0.6 + lobster.activityLevel * 0.3);
  tempVector2.copy(lobster.direction).multiplyScalar(currentSpeed * deltaTime);
  lobster.position.add(tempVector2);
  lobster.velocity.copy(lobster.direction).multiplyScalar(currentSpeed);
};

const updateBurrower = (lobster: LobsterData, deltaTime: number): void => {
  if (!lobster.isBurrowing) {
    lobster.burrowTimer += deltaTime;

    // Move slowly while looking for burrow spot
    lobster.velocity.multiplyScalar(0.9);

    // Trigger burrowing
    if (lobster.burrowTimer > 8 + Math.random() * 12) {
      lobster.isBurrowing = true;
      lobster.burrowTimer = 0;
      lobster.activityLevel = 0; // Very still when burrowing
    }
  } else {
    // Burrowing behavior - stay mostly still with slight movements
    lobster.burrowTimer += deltaTime;

    // Slight underground movements
    const wiggle = Math.sin(lobster.burrowTimer * 2) * 0.1;
    lobster.position.y += wiggle * deltaTime;

    // End burrowing
    if (lobster.burrowTimer > 5 + Math.random() * 8) {
      lobster.isBurrowing = false;
      lobster.burrowTimer = 0;
      lobster.activityLevel = 0.5;

      // Emerge with new direction
      lobster.direction
        .set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2)
        .normalize();
    }
  }
};

const updateWanderer = (lobster: LobsterData, deltaTime: number): void => {
  lobster.behaviorTimer += deltaTime;

  // Random wandering with occasional direction changes
  if (lobster.behaviorTimer > 5 + Math.random() * 10) {
    const newDir = tempVector2
      .set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 0.2, // Slight vertical movement
        (Math.random() - 0.5) * 1.5
      )
      .normalize();

    lobster.direction.lerp(newDir, 0.03); // Very gradual direction changes
    lobster.behaviorTimer = 0;
  }

  const currentSpeed = lobster.speed * 0.7; // Leisurely pace
  tempVector.copy(lobster.direction).multiplyScalar(currentSpeed * deltaTime);
  lobster.position.add(tempVector);
  lobster.velocity.copy(lobster.direction).multiplyScalar(currentSpeed);
};

// Boundary wrapping with bottom preference
const wrapPosition = (position: THREE.Vector3): void => {
  const halfX = WORLD.width / 2;
  const halfY = WORLD.height / 2;
  const halfZ = WORLD.length / 2;

  if (position.x > halfX) position.x = -halfX;
  else if (position.x < -halfX) position.x = halfX;

  if (position.y > halfY) position.y = -halfY * 0.8; // Keep near bottom
  else if (position.y < -halfY) position.y = -halfY * 0.8;

  if (position.z > halfZ) position.z = -halfZ;
  else if (position.z < -halfZ) position.z = halfZ;
};

// Smooth angle interpolation
const lerpAngle = (from: number, to: number, t: number): number => {
  let diff = to - from;

  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  return from + diff * t;
};

// Single lobster component with GLTF model and movement
function Lobster({
  lobsterData,
}: {
  lobsterData: LobsterData;
}): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const lobsterGltf = useGLTF(MODEL_PATH) as TLobsterGLTF;

  // Create cloned scene and cache part references
  const {
    clonedScene,
    finRightRef,
    finLeftRef,
    tailRef,
    mustacheLeftRef,
    mustacheRightRef,
    legFirstRef,
    legMiddleRef,
    legLastRef,
  } = useMemo(() => {
    const scene = lobsterGltf.scene.clone();
    const finRight = findMeshByName(scene, "finRight");
    const finLeft = findMeshByName(scene, "finLeft");
    const tail = findMeshByName(scene, "tail");
    const mustacheLeft = findMeshByName(scene, "mustacheLeft");
    const mustacheRight = findMeshByName(scene, "mustacheRight");
    const legFirst = findMeshByName(scene, "legFirst");
    const legMiddle = findMeshByName(scene, "legMiddle");
    const legLast = findMeshByName(scene, "legLast");

    return {
      clonedScene: scene,
      finRightRef: finRight,
      finLeftRef: finLeft,
      tailRef: tail,
      mustacheLeftRef: mustacheLeft,
      mustacheRightRef: mustacheRight,
      legFirstRef: legFirst,
      legMiddleRef: legMiddle,
      legLastRef: legLast,
    };
  }, [lobsterGltf]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(time - lobsterData.lastAnimTime, 0.1);
    lobsterData.lastAnimTime = time;

    if (deltaTime === 0) return;

    // Update lobster position based on behavior
    switch (lobsterData.behavior) {
      case "scavenger":
        updateScavenger(lobsterData, deltaTime);
        wrapPosition(lobsterData.position);
        break;
      case "territorial":
        updateTerritorial(lobsterData, deltaTime);
        wrapPosition(lobsterData.position);
        break;
      case "burrower":
        updateBurrower(lobsterData, deltaTime);
        wrapPosition(lobsterData.position);
        break;
      case "wanderer":
        updateWanderer(lobsterData, deltaTime);
        wrapPosition(lobsterData.position);
        break;
    }

    // Apply position and scale
    groupRef.current.position.copy(lobsterData.position);
    groupRef.current.scale.setScalar(lobsterData.scale);

    // Cache speed calculation
    lobsterData.walkSpeed = lobsterData.velocity.length();

    // Smooth rotation towards movement direction
    if (lobsterData.walkSpeed > 0.1) {
      lobsterData.targetRotationY = Math.atan2(
        lobsterData.direction.x,
        lobsterData.direction.z
      );

      const rotationSpeed = lobsterData.isBurrowing ? 0.02 : 0.04;
      lobsterData.currentRotationY = lerpAngle(
        lobsterData.currentRotationY,
        lobsterData.targetRotationY,
        rotationSpeed
      );
    }

    // Apply base rotation
    groupRef.current.rotation.y = lobsterData.currentRotationY;

    // 🦞 Lobster animations using your original animation logic
    const walkIntensity = Math.min(lobsterData.walkSpeed * 0.1, 1);
    const activityMultiplier = 1 + lobsterData.activityLevel * 0.5;
    const baseSpeed = (0.3 + walkIntensity * 0.7) * activityMultiplier;

    // Group gentle sway (less when burrowing)
    const swayIntensity = lobsterData.isBurrowing ? 0.01 : 0.05;
    groupRef.current.rotation.y += Math.sin(time * 0.3) * swayIntensity;
    groupRef.current.rotation.x = Math.cos(time * 0.2) * 0.03;

    // Animate parts with behavior-specific modulations
    const finSpeed = baseSpeed * 5;
    const finIntensity = lobsterData.isBurrowing ? 0.05 : 0.2;

    if (finLeftRef) {
      finLeftRef.rotation.z = Math.sin(time * finSpeed) * finIntensity;
    }
    if (finRightRef) {
      finRightRef.rotation.z = -Math.sin(time * finSpeed) * finIntensity;
    }

    // Tail movement
    if (tailRef) {
      const tailSpeed = baseSpeed * 3;
      const tailIntensity = lobsterData.isBurrowing ? 0.05 : 0.15;
      tailRef.rotation.x = Math.sin(time * tailSpeed) * tailIntensity;
    }

    // Mustaches (antennae)
    const mustacheSpeed = baseSpeed * 4;
    const mustacheIntensity = 0.2 + lobsterData.activityLevel * 0.1;

    if (mustacheLeftRef) {
      mustacheLeftRef.rotation.y =
        Math.sin(time * mustacheSpeed) * mustacheIntensity;
    }
    if (mustacheRightRef) {
      mustacheRightRef.rotation.y =
        -Math.sin(time * mustacheSpeed) * mustacheIntensity;
    }

    // Legs walking motion
    const legSpeed = baseSpeed * 2;
    const legIntensity = lobsterData.isBurrowing ? 0.02 : 0.1;

    if (legFirstRef) {
      legFirstRef.rotation.z = Math.sin(time * legSpeed) * legIntensity;
    }
    if (legMiddleRef) {
      legMiddleRef.rotation.z = Math.sin(time * legSpeed + 1) * legIntensity;
    }
    if (legLastRef) {
      legLastRef.rotation.z = Math.sin(time * legSpeed + 2) * legIntensity;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Lobster spawner component
function SpawnLobsters(): React.JSX.Element {
  const behaviors: TLobsterBehavior[] = [
    "scavenger",
    "territorial",
    "burrower",
    "wanderer",
  ];

  // Generate lobster data
  const lobsterData = useMemo(() => {
    const lobsterCount = 6; // More lobsters as they're smaller creatures
    const halfBoundsX = WORLD.width * 0.4;
    const halfBoundsY = WORLD.height * 0.3;
    const halfBoundsZ = WORLD.length * 0.4;

    return Array.from({ length: lobsterCount }, (_, i) => {
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const initialDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        0, // Lobsters don't move much vertically
        (Math.random() - 0.5) * 2
      ).normalize();

      return {
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * halfBoundsX * 2,
          -halfBoundsY + Math.random() * 5, // Near bottom
          (Math.random() - 0.5) * halfBoundsZ * 2
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        direction: initialDirection,
        rotation: new THREE.Euler(0, 0, 0),
        behavior,
        speed: 3 + Math.random() * 4, // Slower than sharks
        scale: 0.8 + Math.random() * 0.6, // Varied lobster sizes
        // Initialize behavior-specific data
        scavengeTarget: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.width * 0.8,
          -WORLD.height * 0.4,
          (Math.random() - 0.5) * WORLD.length * 0.8
        ),
        territoryCenter: new THREE.Vector3(
          (Math.random() - 0.5) * WORLD.width * 0.6,
          -halfBoundsY,
          (Math.random() - 0.5) * WORLD.length * 0.6
        ),
        territoryRadius: 15 + Math.random() * 15,
        burrowTimer: Math.random() * 10,
        isBurrowing: false,
        behaviorTimer: Math.random() * 5,
        lastAnimTime: 0,
        walkSpeed: 0,
        // Initialize rotation values
        targetRotationY: Math.atan2(initialDirection.x, initialDirection.z),
        currentRotationY: Math.atan2(initialDirection.x, initialDirection.z),
        // Activity level
        activityLevel: Math.random() * 0.3, // Start with low activity
      };
    });
  }, []);

  // Memoized lighting setup optimized for seafloor
  const lighting = useMemo(
    () => (
      <>
        <ambientLight intensity={0.4} color="#4682B4" />
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.6}
          color="#87CEEB"
          castShadow
        />
        <directionalLight
          position={[-10, 15, -10]}
          intensity={0.3}
          color="#6495ED"
        />
        {/* Seafloor lighting */}
        <spotLight
          position={[0, 25, 0]}
          angle={Math.PI / 4}
          intensity={0.4}
          color="#ADD8E6"
          distance={60}
          penumbra={0.7}
        />
      </>
    ),
    []
  );

  return (
    <>
      {lighting}

      {/* Render lobsters */}
      {lobsterData.map((lobster) => (
        <Lobster key={lobster.id} lobsterData={lobster} />
      ))}
    </>
  );
}

export default SpawnLobsters;
