import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useMemo, type JSX } from "react";

import { WORLD } from "@/constants/world";

const MODEL_PATH = "/models/seahorse.glb";

// Pre-allocated objects for performance
const tempVector = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();

// Extend the GLTF type for proper typing
type TSeaHorseGLTF = GLTF & {
  nodes: {
    body?: THREE.Mesh;
    fin?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

export type TSeaHorseBehavior = "wanderer" | "circular" | "floater" | "zigzag";

interface SeaHorseData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  rotation: THREE.Euler;
  behavior: TSeaHorseBehavior;
  speed: number;
  // Behavior-specific data
  circleCenter: THREE.Vector3;
  circleRadius: number;
  zigzagTimer: number;
  restTimer: number;
  behaviorTimer: number;
  // Animation cache
  lastAnimTime: number;
  swimSpeed: number;
  // Rotation smoothing
  targetRotationY: number;
  currentRotationY: number;
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
const updateWanderer = (seahorse: SeaHorseData, deltaTime: number): void => {
  seahorse.behaviorTimer += deltaTime;

  if (seahorse.behaviorTimer > 2 + Math.random() * 3) {
    const newDir = tempVector2
      .set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.3, // Reduced Y movement for seahorses
        (Math.random() - 0.5) * 1.2
      )
      .normalize();

    seahorse.direction.lerp(newDir, 0.05);
    seahorse.behaviorTimer = 0;
  }

  tempVector
    .copy(seahorse.direction)
    .multiplyScalar(seahorse.speed * deltaTime);
  seahorse.position.add(tempVector);
  seahorse.velocity.copy(seahorse.direction).multiplyScalar(seahorse.speed);
};

const updateCircular = (seahorse: SeaHorseData, time: number): void => {
  const angle = time * seahorse.speed * 0.08; // Slower than goldfish
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  tempVector.set(
    cosAngle * seahorse.circleRadius,
    Math.sin(time * 0.3) * 3, // Gentler vertical movement
    sinAngle * seahorse.circleRadius
  );
  seahorse.position.copy(seahorse.circleCenter).add(tempVector);
  seahorse.direction.set(-sinAngle, 0, cosAngle);
  seahorse.velocity.copy(seahorse.direction).multiplyScalar(seahorse.speed);
};

const updateFloater = (seahorse: SeaHorseData, deltaTime: number): void => {
  if (seahorse.restTimer > 0) {
    seahorse.restTimer -= deltaTime;
    seahorse.velocity.set(0, 0, 0);
    // Gentle floating motion when resting
    seahorse.position.y += Math.sin(seahorse?.lastAnimTime * 2) * 0.02;
    return;
  }

  seahorse.behaviorTimer += deltaTime;
  if (seahorse.behaviorTimer > 1.5 + Math.random() * 2.5) {
    if (Math.random() < 0.8) {
      // More likely to rest (seahorses are slower)
      seahorse.restTimer = 1.5 + Math.random() * 3;
    } else {
      seahorse.direction
        .set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 2
        )
        .normalize();
    }
    seahorse.behaviorTimer = 0;
  }

  tempVector
    .copy(seahorse.direction)
    .multiplyScalar(seahorse.speed * 0.2 * deltaTime);
  seahorse.position.add(tempVector);
  seahorse.velocity
    .copy(seahorse.direction)
    .multiplyScalar(seahorse.speed * 0.2);
};

const updateZigzag = (seahorse: SeaHorseData, deltaTime: number): void => {
  seahorse.zigzagTimer += deltaTime;
  const zigzagDirection = Math.sin(seahorse.zigzagTimer * 2.5) * 0.6; // Slower zigzag

  tempVector2.copy(seahorse.direction);
  tempVector2.x += zigzagDirection;
  tempVector2.normalize();

  tempVector.copy(tempVector2).multiplyScalar(seahorse.speed * deltaTime);
  seahorse.position.add(tempVector);
  seahorse.velocity.copy(tempVector2).multiplyScalar(seahorse.speed);
};

// Optimized boundary wrapping
const wrapPosition = (position: THREE.Vector3): void => {
  const halfX = WORLD.width / 2;
  const halfY = WORLD.height / 2;
  const halfZ = WORLD.length / 2;

  if (position.x > halfX) position.x = -halfX;
  else if (position.x < -halfX) position.x = halfX;

  if (position.y > halfY) position.y = -halfY;
  else if (position.y < -halfY) position.y = halfY;

  if (position.z > halfZ) position.z = -halfZ;
  else if (position.z < -halfZ) position.z = halfZ;
};

// Smooth angle interpolation
const lerpAngle = (from: number, to: number, t: number): number => {
  let diff = to - from;

  // Handle wrap-around
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  return from + diff * t;
};

// Single seahorse component with movement
function SeaHorse({
  seahorseData,
}: {
  seahorseData: SeaHorseData;
}): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const seaHorseGltf = useGLTF(MODEL_PATH) as TSeaHorseGLTF;

  // Create cloned scene and cache fin reference
  const { clonedScene, finRef } = useMemo(() => {
    const scene = seaHorseGltf.scene.clone();
    const fin = findMeshByName(scene, "fin");

    return {
      clonedScene: scene,
      finRef: fin,
    };
  }, [seaHorseGltf]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(time - seahorseData?.lastAnimTime, 0.1);
    seahorseData.lastAnimTime = time;

    if (deltaTime === 0) return;

    // Update seahorse position based on behavior
    switch (seahorseData.behavior) {
      case "wanderer":
        updateWanderer(seahorseData, deltaTime);
        wrapPosition(seahorseData.position);
        break;
      case "circular":
        updateCircular(seahorseData, time);
        break;
      case "floater":
        updateFloater(seahorseData, deltaTime);
        wrapPosition(seahorseData.position);
        break;
      case "zigzag":
        updateZigzag(seahorseData, deltaTime);
        wrapPosition(seahorseData.position);
        break;
    }

    // Apply position
    groupRef.current.position.copy(seahorseData.position);

    // Cache speed calculation
    seahorseData.swimSpeed = seahorseData.velocity.length();

    // Smooth rotation towards movement direction (only if moving significantly)
    if (seahorseData.swimSpeed > 0.05) {
      // Calculate target Y rotation from direction vector
      seahorseData.targetRotationY = Math.atan2(
        seahorseData.direction.x,
        seahorseData.direction.z
      );

      // Smooth interpolation of rotation
      seahorseData.currentRotationY = lerpAngle(
        seahorseData.currentRotationY,
        seahorseData.targetRotationY,
        0.08 // Slower rotation for seahorses
      );
    }

    // Apply base rotation
    groupRef.current.rotation.y = seahorseData.currentRotationY;

    // 🎐 Animate fin with movement-based speed
    if (finRef) {
      const finSpeed = seahorseData.swimSpeed > 0.1 ? 10 : 5; // Faster when moving
      finRef.rotation.z = Math.sin(time * finSpeed) * 0.2;
    }

    // 🌊 Apply all secondary animations in one go to reduce jitter
    const gentleSway =
      Math.sin(time * 1.5) * 0.03 * (1 + seahorseData.swimSpeed * 0.5);
    const subtleBob = Math.sin(time * 1.2) * 0.03;
    const subtleRoll = Math.sin(time * 0.8) * 0.02;

    // Apply secondary rotations
    groupRef.current.rotation.z = gentleSway * 0.1;
    groupRef.current.rotation.x = subtleRoll;

    // Apply subtle bobbing to position
    groupRef.current.position.y += subtleBob;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default SeaHorse;
