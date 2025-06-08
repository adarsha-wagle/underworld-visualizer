import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useMemo, useEffect, type JSX } from "react";
import { WORLD } from "@/constants/world";

const MODEL_PATH = "/models/gold-fish.glb";

// Pre-allocated objects for performance
const tempVector = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();
const tempLookTarget = new THREE.Vector3();

type TGoldFishGlTF = GLTF & {
  nodes: {
    body?: THREE.Mesh;
    lowerBackLeftFin?: THREE.Mesh;
    lowerBackRightFin?: THREE.Mesh;
    lowerLeftFin?: THREE.Mesh;
    lowerRightFin?: THREE.Mesh;
    upperFin?: THREE.Mesh;
    tail?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

export type TGoldFishBehavior = "wanderer" | "circular" | "lazy" | "zigzag";

interface FishData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  rotation: THREE.Euler;
  behavior: TGoldFishBehavior;
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
}

// Preload model
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

// Behavior update functions (optimized with pre-allocated vectors)
const updateWanderer = (fish: FishData, deltaTime: number): void => {
  fish.behaviorTimer += deltaTime;

  if (fish.behaviorTimer > 2 + Math.random() * 3) {
    const newDir = tempVector2
      .set(
        (Math.random() - 0.5) * 1.1,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 1.1
      )
      .normalize();

    fish.direction.lerp(newDir, 0.05);
    fish.behaviorTimer = 0;
  }

  // Use temp vector to avoid creating new objects
  tempVector.copy(fish.direction).multiplyScalar(fish.speed * deltaTime);
  fish.position.add(tempVector);
  fish.velocity.copy(fish.direction).multiplyScalar(fish.speed);
};

const updateCircular = (fish: FishData, time: number): void => {
  const angle = time * fish.speed * 0.1;
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  tempVector.set(
    cosAngle * fish.circleRadius,
    Math.sin(time * 0.5) * 5,
    sinAngle * fish.circleRadius
  );
  fish.position.copy(fish.circleCenter).add(tempVector);
  fish.direction.set(-sinAngle, 0, cosAngle);
  fish.velocity.copy(fish.direction).multiplyScalar(fish.speed);
};

const updateLazy = (fish: FishData, deltaTime: number): void => {
  if (fish.restTimer > 0) {
    fish.restTimer -= deltaTime;
    fish.velocity.set(0, 0, 0);
    return;
  }

  fish.behaviorTimer += deltaTime;
  if (fish.behaviorTimer > 1 + Math.random() * 2) {
    if (Math.random() < 0.7) {
      fish.restTimer = 1 + Math.random() * 2;
    } else {
      fish.direction
        .set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 2
        )
        .normalize();
    }
    fish.behaviorTimer = 0;
  }

  tempVector.copy(fish.direction).multiplyScalar(fish.speed * 0.3 * deltaTime);
  fish.position.add(tempVector);
  fish.velocity.copy(fish.direction).multiplyScalar(fish.speed * 0.3);
};

const updateZigzag = (fish: FishData, deltaTime: number): void => {
  fish.zigzagTimer += deltaTime;
  const zigzagDirection = Math.sin(fish.zigzagTimer * 3) * 0.8;

  tempVector2.copy(fish.direction);
  tempVector2.x += zigzagDirection;
  tempVector2.normalize();

  tempVector.copy(tempVector2).multiplyScalar(fish.speed * deltaTime);
  fish.position.add(tempVector);
  fish.velocity.copy(tempVector2).multiplyScalar(fish.speed);
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

// Single goldfish component - highly optimized
export function GoldFish({
  fishData,
  index,
}: {
  fishData: FishData;
  index: number;
}): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const goldFishGltf = useGLTF(MODEL_PATH) as TGoldFishGlTF;

  // Create cloned scene and cache fin references from the CLONED scene
  const { clonedScene, finRefs } = useMemo(() => {
    const scene = goldFishGltf.scene.clone();

    // Find fin references in the CLONED scene, not the original
    const fins = {
      tail: findMeshByName(scene, "tail"),
      upperFin: findMeshByName(scene, "upperFin"),
      lowerBackLeft: findMeshByName(scene, "lowerBackLeftFin"),
      lowerBackRight: findMeshByName(scene, "lowerBackRightFin"),
      lowerLeft: findMeshByName(scene, "lowerLeftFin"),
      lowerRight: findMeshByName(scene, "lowerRightFin"),
    };

    return { clonedScene: scene, finRefs: fins };
  }, [goldFishGltf]);

  // Optimized animation with reduced calculations
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(time - fishData.lastAnimTime, 0.1); // Cap deltaTime
    fishData.lastAnimTime = time;

    if (deltaTime === 0) return; // Skip if no time passed

    // Update fish position based on behavior (using switch for better performance)
    switch (fishData.behavior) {
      case "wanderer":
        updateWanderer(fishData, deltaTime);
        wrapPosition(fishData.position);
        break;
      case "circular":
        updateCircular(fishData, time);
        break;
      case "lazy":
        updateLazy(fishData, deltaTime);
        wrapPosition(fishData.position);
        break;
      case "zigzag":
        updateZigzag(fishData, deltaTime);
        wrapPosition(fishData.position);
        break;
    }

    // Apply position directly
    groupRef.current.position.copy(fishData.position);

    // Cache speed calculation
    fishData.swimSpeed = fishData.velocity.length();

    // Face movement direction (only if moving significantly)
    if (fishData.swimSpeed > 0.1) {
      tempLookTarget.copy(fishData.position).add(fishData.direction);
      const targetQuat = new THREE.Quaternion();
      const currentQuat = groupRef.current.quaternion.clone();

      groupRef.current.lookAt(tempLookTarget);
      targetQuat.copy(groupRef.current.quaternion);
      groupRef.current.quaternion.copy(currentQuat);
      groupRef.current.quaternion.slerp(targetQuat, 0.1);
    }

    // Swimming sway animation
    const sway = Math.sin(time * 2) * 0.05 * (1 + fishData.swimSpeed);
    groupRef.current.rotation.z += sway * 0.1;
    groupRef.current.position.y += Math.sin(time * 1.5) * 0.05;

    // Animate fins - now using the correct cloned references
    if (fishData.swimSpeed >= 0) {
      const finMultiplier = 1; // Reduced from 7 for more realistic movement
      const {
        tail,
        upperFin,
        lowerBackLeft,
        lowerBackRight,
        lowerLeft,
        lowerRight,
      } = finRefs;

      if (tail) tail.rotation.y = Math.sin(time * 3 * finMultiplier) * 0.6;
      if (upperFin) upperFin.rotation.y = Math.sin(time * finMultiplier) * 0.15;
      if (lowerBackLeft)
        lowerBackLeft.rotation.z = Math.sin(time * 8 * finMultiplier) * 0.4;
      if (lowerBackRight)
        lowerBackRight.rotation.z = -Math.sin(time * 8 * finMultiplier) * 0.4;
      if (lowerLeft)
        lowerLeft.rotation.z = Math.sin(time * 6 * finMultiplier) * 0.3;
      if (lowerRight)
        lowerRight.rotation.z = -Math.sin(time * 6 * finMultiplier) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Alternative approach: Don't clone the scene at all (simpler but less memory efficient)
export function GoldFishSimple({
  fishData,
  index,
}: {
  fishData: FishData;
  index: number;
}): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const goldFishGltf = useGLTF(MODEL_PATH) as TGoldFishGlTF;

  // Directly use the original nodes (like your working version)
  const finRefs = useMemo(
    () => ({
      tail: goldFishGltf.nodes.tail ?? null,
      upperFin: goldFishGltf.nodes.upperFin ?? null,
      lowerBackLeft: goldFishGltf.nodes.lowerBackLeftFin ?? null,
      lowerBackRight: goldFishGltf.nodes.lowerBackRightFin ?? null,
      lowerLeft: goldFishGltf.nodes.lowerLeftFin ?? null,
      lowerRight: goldFishGltf.nodes.lowerRightFin ?? null,
    }),
    [goldFishGltf]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(time - fishData.lastAnimTime, 0.1);
    fishData.lastAnimTime = time;

    if (deltaTime === 0) return;

    // ... same behavior logic as above ...

    // Apply position directly
    groupRef.current.position.copy(fishData.position);
    fishData.swimSpeed = fishData.velocity.length();

    // Swimming sway animation
    const sway = Math.sin(time * 2) * 0.05 * (1 + fishData.swimSpeed);
    groupRef.current.rotation.z += sway * 0.1;
    groupRef.current.position.y += Math.sin(time * 1.5) * 0.05;

    // Animate fins - this will work because we're using original nodes
    const {
      tail,
      upperFin,
      lowerBackLeft,
      lowerBackRight,
      lowerLeft,
      lowerRight,
    } = finRefs;

    if (tail) tail.rotation.y = Math.sin(time * 3) * 0.6;
    if (upperFin) upperFin.rotation.y = Math.sin(time) * 0.15;
    if (lowerBackLeft) lowerBackLeft.rotation.z = Math.sin(time * 8) * 0.4;
    if (lowerBackRight) lowerBackRight.rotation.z = -Math.sin(time * 8) * 0.4;
    if (lowerLeft) lowerLeft.rotation.z = Math.sin(time * 6) * 0.3;
    if (lowerRight) lowerRight.rotation.z = -Math.sin(time * 6) * 0.3;
  });

  return (
    <group ref={groupRef}>
      <primitive object={goldFishGltf.scene} />
    </group>
  );
}
