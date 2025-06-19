import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useMemo, type JSX } from "react";

const MODEL_PATH = "/models/shark.glb";

// World boundaries (medium size for sharks)
const WORLD = {
  width: 300,
  height: 50,
  length: 300,
};

// Pre-allocated objects for performance
const tempVector = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();

// Extend the GLTF type for proper typing
type TSharkGLTF = GLTF & {
  nodes: {
    tail?: THREE.Mesh;
    body?: THREE.Mesh;
    backFinLeft?: THREE.Mesh;
    backFinRight?: THREE.Mesh;
    finLeft?: THREE.Mesh;
    finRight?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

export type TSharkBehavior = "hunter" | "patroller" | "ambusher" | "cruiser";

interface SharkData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  rotation: THREE.Euler;
  behavior: TSharkBehavior;
  speed: number;
  scale: number;
  // Behavior-specific data
  huntingTarget: THREE.Vector3;
  patrolRadius: number;
  patrolCenter: THREE.Vector3;
  ambushTimer: number;
  isAmbushing: boolean;
  burstSpeed: number;
  behaviorTimer: number;
  // Animation cache
  lastAnimTime: number;
  swimSpeed: number;
  // Rotation smoothing
  targetRotationY: number;
  currentRotationY: number;
  // Aggression state
  aggressionLevel: number;
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
const updateHunter = (shark: SharkData, deltaTime: number): void => {
  shark.behaviorTimer += deltaTime;

  // Update hunting target periodically
  if (shark.behaviorTimer > 3 + Math.random() * 4) {
    shark.huntingTarget.set(
      (Math.random() - 0.5) * WORLD.x * 0.8,
      (Math.random() - 0.5) * WORLD.y * 0.6,
      (Math.random() - 0.5) * WORLD.z * 0.8
    );
    shark.behaviorTimer = 0;
    shark.aggressionLevel = Math.min(shark.aggressionLevel + 0.2, 1);
  }

  // Move towards hunting target
  tempVector.copy(shark.huntingTarget).sub(shark.position);
  const distanceToTarget = tempVector.length();

  if (distanceToTarget > 5) {
    tempVector.normalize();
    shark.direction.lerp(tempVector, 0.08); // Aggressive pursuit

    // Burst speed when close to target
    const currentSpeed =
      distanceToTarget < 20
        ? shark.speed * (1.5 + shark.aggressionLevel)
        : shark.speed;

    tempVector2.copy(shark.direction).multiplyScalar(currentSpeed * deltaTime);
    shark.position.add(tempVector2);
    shark.velocity.copy(shark.direction).multiplyScalar(currentSpeed);
  } else {
    // Reached target, slow down and find new target
    shark.aggressionLevel = Math.max(shark.aggressionLevel - 0.1, 0);
    shark.behaviorTimer = 2.5; // Force new target soon
  }
};

const updatePatroller = (shark: SharkData, time: number): void => {
  // Patrol in expanding/contracting circles
  const radiusVariation = Math.sin(time * 0.1) * 10;
  const currentRadius = shark.patrolRadius + radiusVariation;
  const angle = time * shark.speed * 0.05;

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  tempVector.set(
    cosAngle * currentRadius,
    Math.sin(time * 0.2) * 5, // Vertical patrol movement
    sinAngle * currentRadius
  );

  shark.position.copy(shark.patrolCenter).add(tempVector);
  shark.direction.set(-sinAngle, 0, cosAngle);
  shark.velocity.copy(shark.direction).multiplyScalar(shark.speed);
};

const updateAmbusher = (shark: SharkData, deltaTime: number): void => {
  if (!shark.isAmbushing) {
    shark.ambushTimer += deltaTime;

    // Stay relatively still while waiting
    shark.velocity.multiplyScalar(0.95); // Gradual slowdown

    // Trigger ambush
    if (shark.ambushTimer > 5 + Math.random() * 10) {
      shark.isAmbushing = true;
      shark.ambushTimer = 0;
      shark.burstSpeed = shark.speed * 2.5; // Fast burst

      // Random ambush direction
      shark.direction
        .set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 2
        )
        .normalize();
    }
  } else {
    // Ambush burst
    shark.ambushTimer += deltaTime;

    tempVector
      .copy(shark.direction)
      .multiplyScalar(shark.burstSpeed * deltaTime);
    shark.position.add(tempVector);
    shark.velocity.copy(shark.direction).multiplyScalar(shark.burstSpeed);

    // End ambush
    if (shark.ambushTimer > 2) {
      shark.isAmbushing = false;
      shark.ambushTimer = 0;
      shark.burstSpeed = shark.speed;
    }
  }
};

const updateCruiser = (shark: SharkData, deltaTime: number): void => {
  shark.behaviorTimer += deltaTime;

  // Steady, efficient swimming with occasional direction changes
  if (shark.behaviorTimer > 6 + Math.random() * 8) {
    const newDir = tempVector2
      .set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 1.5
      )
      .normalize();

    shark.direction.lerp(newDir, 0.04); // Smooth direction changes
    shark.behaviorTimer = 0;
  }

  tempVector.copy(shark.direction).multiplyScalar(shark.speed * deltaTime);
  shark.position.add(tempVector);
  shark.velocity.copy(shark.direction).multiplyScalar(shark.speed);
};

// Optimized boundary wrapping
const wrapPosition = (position: THREE.Vector3): void => {
  const halfX = WORLD.x / 2;
  const halfY = WORLD.y / 2;
  const halfZ = WORLD.z / 2;

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

  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  return from + diff * t;
};

// Single shark component with movement
function Shark({ sharkData }: { sharkData: SharkData }): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const sharkGltf = useGLTF(MODEL_PATH) as TSharkGLTF;

  // Create cloned scene and cache part references
  const {
    clonedScene,
    tailRef,
    finLeftRef,
    finRightRef,
    backFinLeftRef,
    backFinRightRef,
  } = useMemo(() => {
    const scene = sharkGltf.scene.clone();
    const tail = findMeshByName(scene, "tail");
    const finLeft = findMeshByName(scene, "finLeft");
    const finRight = findMeshByName(scene, "finRight");
    const backFinLeft = findMeshByName(scene, "backFinLeft");
    const backFinRight = findMeshByName(scene, "backFinRight");

    return {
      clonedScene: scene,
      tailRef: tail,
      finLeftRef: finLeft,
      finRightRef: finRight,
      backFinLeftRef: backFinLeft,
      backFinRightRef: backFinRight,
    };
  }, [sharkGltf]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(time - sharkData.lastAnimTime, 0.1);
    sharkData.lastAnimTime = time;

    if (deltaTime === 0) return;

    // Update shark position based on behavior
    switch (sharkData.behavior) {
      case "hunter":
        updateHunter(sharkData, deltaTime);
        wrapPosition(sharkData.position);
        break;
      case "patroller":
        updatePatroller(sharkData, time);
        break;
      case "ambusher":
        updateAmbusher(sharkData, deltaTime);
        wrapPosition(sharkData.position);
        break;
      case "cruiser":
        updateCruiser(sharkData, deltaTime);
        wrapPosition(sharkData.position);
        break;
    }

    // Apply position and scale
    groupRef.current.position.copy(sharkData.position);
    groupRef.current.scale.setScalar(sharkData.scale);

    // Cache speed calculation
    sharkData.swimSpeed = sharkData.velocity.length();

    // Smooth rotation towards movement direction
    if (sharkData.swimSpeed > 0.2) {
      sharkData.targetRotationY = Math.atan2(
        sharkData.direction.x,
        sharkData.direction.z
      );

      const rotationSpeed = sharkData.isAmbushing ? 0.12 : 0.06;
      sharkData.currentRotationY = lerpAngle(
        sharkData.currentRotationY,
        sharkData.targetRotationY,
        rotationSpeed
      );
    }

    // Apply base rotation
    groupRef.current.rotation.y = sharkData.currentRotationY;

    // 🦈 Shark animations
    const swimIntensity = Math.min(sharkData.swimSpeed * 0.08, 1.2);
    const aggressionMultiplier = 1 + sharkData.aggressionLevel * 0.5;
    const baseSpeed = (0.4 + swimIntensity * 0.6) * aggressionMultiplier;

    // Body gentle sway (more pronounced when hunting/aggressive)
    const bodySway =
      Math.sin(time * baseSpeed) * (0.05 + sharkData.aggressionLevel * 0.02);
    const bodyPitch = Math.cos(time * baseSpeed * 0.75) * 0.02;

    groupRef.current.rotation.y += bodySway;
    groupRef.current.rotation.x = bodyPitch;

    // Tail wiggle (more aggressive when hunting)
    if (tailRef) {
      const tailSpeed = baseSpeed * 2;
      const tailIntensity = 0.4 + sharkData.aggressionLevel * 0.2;
      tailRef.rotation.y = Math.sin(time * tailSpeed) * tailIntensity;
    }

    // Fins fluttering (synchronized with swimming intensity)
    if (finLeftRef) {
      const finSpeed = baseSpeed * 2.5;
      finLeftRef.rotation.z =
        Math.sin(time * finSpeed) * (0.1 + swimIntensity * 0.05);
    }

    if (finRightRef) {
      const finSpeed = baseSpeed * 2.5;
      finRightRef.rotation.z =
        -Math.sin(time * finSpeed) * (0.1 + swimIntensity * 0.05);
    }

    // Back fins (subtle movement)
    if (backFinLeftRef) {
      const backFinSpeed = baseSpeed * 1.5;
      backFinLeftRef.rotation.z = Math.sin(time * backFinSpeed) * 0.05;
    }

    if (backFinRightRef) {
      const backFinSpeed = baseSpeed * 1.5;
      backFinRightRef.rotation.z = -Math.sin(time * backFinSpeed) * 0.05;
    }

    // Predator tension - slight scale pulsing when aggressive
    if (sharkData.aggressionLevel > 0.3) {
      const tensionScale =
        1 + Math.sin(time * 3) * 0.01 * sharkData.aggressionLevel;
      groupRef.current.scale.multiplyScalar(tensionScale);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default Shark;
