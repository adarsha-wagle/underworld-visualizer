import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useMemo, type JSX } from "react";
import { WORLD } from "@/constants/world";

const MODEL_PATH = "/models/whale.glb";

// Pre-allocated objects for performance
const tempVector = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();

// Extend the GLTF type for proper typing
type TWhaleGLTF = GLTF & {
  nodes: {
    tail?: THREE.Mesh;
    body?: THREE.Mesh;
    finBack?: THREE.Mesh;
    finRight?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

export type TWhaleBehavior =
  | "migrator"
  | "deep_diver"
  | "surface_cruiser"
  | "pod_follower";

interface WhaleData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  rotation: THREE.Euler;
  behavior: TWhaleBehavior;
  speed: number;
  scale: number;
  // Behavior-specific data
  diveDepth: number;
  surfaceTime: number;
  podCenter: THREE.Vector3;
  podRadius: number;
  behaviorTimer: number;
  // Animation cache
  lastAnimTime: number;
  swimSpeed: number;
  // Rotation smoothing
  targetRotationY: number;
  currentRotationY: number;
  // Dive state
  isDiving: boolean;
  diveTimer: number;
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
const updateMigrator = (whale: WhaleData, deltaTime: number): void => {
  whale.behaviorTimer += deltaTime;

  // Whales migrate in more consistent directions
  if (whale.behaviorTimer > 8 + Math.random() * 12) {
    const newDir = tempVector2
      .set(
        (Math.random() - 0.5) * 0.8, // Less random direction changes
        (Math.random() - 0.5) * 0.2, // Gentle vertical movement
        (Math.random() - 0.5) * 0.8
      )
      .normalize();

    whale.direction.lerp(newDir, 0.02); // Very gradual direction changes
    whale.behaviorTimer = 0;
  }

  tempVector.copy(whale.direction).multiplyScalar(whale.speed * deltaTime);
  whale.position.add(tempVector);
  whale.velocity.copy(whale.direction).multiplyScalar(whale.speed);
};

const updateDeepDiver = (whale: WhaleData, deltaTime: number): void => {
  whale.diveTimer += deltaTime;

  if (!whale.isDiving && whale.diveTimer > 15 + Math.random() * 20) {
    // Start diving
    whale.isDiving = true;
    whale.diveDepth = -20 - Math.random() * 25; // Dive deep
    whale.direction.y = -0.3 - Math.random() * 0.2; // Dive down
    whale.direction.normalize();
    whale.diveTimer = 0;
  } else if (whale.isDiving && whale.diveTimer > 10 + Math.random() * 15) {
    // Surface
    whale.isDiving = false;
    whale.direction.y = 0.2 + Math.random() * 0.1; // Surface
    whale.direction.normalize();
    whale.diveTimer = 0;
  }

  // Gradual direction changes while diving/surfacing
  if (whale.isDiving && whale.position.y < whale.diveDepth) {
    whale.direction.y = Math.max(whale.direction.y, 0.1); // Stop diving, start surfacing
  }

  tempVector.copy(whale.direction).multiplyScalar(whale.speed * deltaTime);
  whale.position.add(tempVector);
  whale.velocity.copy(whale.direction).multiplyScalar(whale.speed);
};

const updateSurfaceCruiser = (whale: WhaleData, deltaTime: number): void => {
  whale.behaviorTimer += deltaTime;

  // Stay near surface
  if (whale.position.y < -5) {
    whale.direction.y = 0.3; // Move up
  } else if (whale.position.y > 5) {
    whale.direction.y = -0.1; // Move down slightly
  }

  // Occasional direction changes
  if (whale.behaviorTimer > 10 + Math.random() * 15) {
    whale.direction.x = (Math.random() - 0.5) * 1.2;
    whale.direction.z = (Math.random() - 0.5) * 1.2;
    whale.direction.normalize();
    whale.behaviorTimer = 0;
  }

  tempVector.copy(whale.direction).multiplyScalar(whale.speed * deltaTime);
  whale.position.add(tempVector);
  whale.velocity.copy(whale.direction).multiplyScalar(whale.speed);
};

const updatePodFollower = (whale: WhaleData, time: number): void => {
  // Move in a loose formation around pod center
  const angle = time * whale.speed * 0.02 + whale.id * 0.5; // Offset by ID
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  tempVector.set(
    cosAngle * whale.podRadius,
    Math.sin(time * 0.1 + whale.id) * 8, // Gentle vertical movement
    sinAngle * whale.podRadius
  );

  whale.position.copy(whale.podCenter).add(tempVector);
  whale.direction.set(-sinAngle, 0, cosAngle);
  whale.velocity.copy(whale.direction).multiplyScalar(whale.speed);
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

// Single whale component with movement
function Whale({ whaleData }: { whaleData: WhaleData }): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const whaleGltf = useGLTF(MODEL_PATH) as TWhaleGLTF;

  // Create cloned scene and cache part references
  const { clonedScene, tailRef, finBackRef, finRightRef } = useMemo(() => {
    const scene = whaleGltf.scene.clone();
    const tail = findMeshByName(scene, "tail");
    const finBack = findMeshByName(scene, "finBack");
    const finRight = findMeshByName(scene, "finRight");

    return {
      clonedScene: scene,
      tailRef: tail,
      finBackRef: finBack,
      finRightRef: finRight,
    };
  }, [whaleGltf]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(time - whaleData.lastAnimTime, 0.1);
    whaleData.lastAnimTime = time;

    if (deltaTime === 0) return;

    // Update whale position based on behavior
    switch (whaleData.behavior) {
      case "migrator":
        updateMigrator(whaleData, deltaTime);
        wrapPosition(whaleData.position);
        break;
      case "deep_diver":
        updateDeepDiver(whaleData, deltaTime);
        wrapPosition(whaleData.position);
        break;
      case "surface_cruiser":
        updateSurfaceCruiser(whaleData, deltaTime);
        wrapPosition(whaleData.position);
        break;
      case "pod_follower":
        updatePodFollower(whaleData, time);
        break;
    }

    // Apply position and scale
    groupRef.current.position.copy(whaleData.position);
    groupRef.current.scale.setScalar(whaleData.scale);

    // Cache speed calculation
    whaleData.swimSpeed = whaleData.velocity.length();

    // Smooth rotation towards movement direction
    if (whaleData.swimSpeed > 0.1) {
      whaleData.targetRotationY = Math.atan2(
        whaleData.direction.x,
        whaleData.direction.z
      );

      whaleData.currentRotationY = lerpAngle(
        whaleData.currentRotationY,
        whaleData.targetRotationY,
        0.03 // Very slow rotation for whales
      );
    }

    // Apply base rotation
    groupRef.current.rotation.y = whaleData.currentRotationY;

    // 🐋 Whale animations
    const swimIntensity = Math.min(whaleData.swimSpeed * 0.1, 1);
    const baseSpeed = 0.8 + swimIntensity * 0.4;

    // Whale slow full-body sway
    const bodySway = Math.sin(time * 0.2) * 0.04;
    const bodyPitch = Math.cos(time * 0.15) * 0.03;

    groupRef.current.rotation.y += bodySway;
    groupRef.current.rotation.x = bodyPitch;

    // Tail flapping (more active when swimming faster)
    if (tailRef) {
      const tailSpeed = baseSpeed * (1 + swimIntensity);
      tailRef.rotation.x =
        Math.sin(time * tailSpeed * 2) * (0.1 + swimIntensity * 0.05);
    }

    // Fin gentle motion
    if (finBackRef) {
      finBackRef.rotation.z = Math.cos(time * baseSpeed * 1.5) * 0.2;
    }

    if (finRightRef) {
      finRightRef.rotation.z = -Math.cos(time * baseSpeed * 1.5) * 0.2;
    }

    // Gentle breathing motion
    const breathScale = 1 + Math.sin(time * 0.5) * 0.02;
    groupRef.current.scale.multiplyScalar(breathScale);
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default Whale;
