import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef, useMemo, type JSX } from "react";
import { WORLD } from "@/constants/world";

const MODEL_PATH = "/models/angler-fish.glb";

// Pre-allocated objects for performance
const tempVector = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();
const tempLookTarget = new THREE.Vector3();

type AnglerFishGLTF = GLTF & {
  nodes: {
    Bulb?: THREE.Mesh;
    LeftFin?: THREE.Mesh;
    RightFin?: THREE.Mesh;
    Tail?: THREE.Mesh;
    LeftEye?: THREE.Mesh;
    RightEye?: THREE.Mesh;
    [key: string]: any;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

export type TAnglerFishBehavior = "lurker" | "prowler" | "ambush" | "patrol";

interface AnglerFishData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  rotation: THREE.Euler;
  behavior: TAnglerFishBehavior;
  speed: number;
  // Behavior-specific data
  patrolStart: THREE.Vector3;
  patrolEnd: THREE.Vector3;
  huntTimer: number;
  waitTimer: number;
  behaviorTimer: number;
  // Animation cache
  lastAnimTime: number;
  swimSpeed: number;
  isHunting: boolean;
  lightIntensity: number;
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

// Behavior update functions for angler fish
const updateLurker = (fish: AnglerFishData, deltaTime: number): void => {
  fish.behaviorTimer += deltaTime;

  if (fish.waitTimer > 0) {
    fish.waitTimer -= deltaTime;
    fish.velocity.set(0, 0, 0);
    return;
  }

  if (fish.behaviorTimer > 2 + Math.random() * 2) {
    if (Math.random() < 0.4) {
      fish.waitTimer = 1 + Math.random() * 1.5;
    } else {
      fish.direction
        .set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 2
        )
        .normalize();
    }
    fish.behaviorTimer = 0;
  }

  // Always move when not waiting
  tempVector.copy(fish.direction).multiplyScalar(fish.speed * deltaTime);
  fish.position.add(tempVector);
  fish.velocity.copy(fish.direction).multiplyScalar(fish.speed);
};

const updateProwler = (fish: AnglerFishData, deltaTime: number): void => {
  fish.behaviorTimer += deltaTime;

  if (fish.behaviorTimer > 1.5 + Math.random() * 2) {
    const newDir = tempVector2
      .set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 1.2
      )
      .normalize();

    fish.direction.lerp(newDir, 0.03);
    fish.behaviorTimer = 0;
  }

  tempVector.copy(fish.direction).multiplyScalar(fish.speed * deltaTime);
  fish.position.add(tempVector);
  fish.velocity.copy(fish.direction).multiplyScalar(fish.speed);
};

const updateAmbush = (fish: AnglerFishData, deltaTime: number): void => {
  fish.huntTimer += deltaTime;

  if (fish.isHunting) {
    // Quick burst movement
    tempVector.copy(fish.direction).multiplyScalar(fish.speed * 3 * deltaTime);
    fish.position.add(tempVector);
    fish.velocity.copy(fish.direction).multiplyScalar(fish.speed * 3);

    if (fish.huntTimer > 1) {
      fish.isHunting = false;
      fish.huntTimer = 0;
    }
  } else {
    // Slow stalking movement instead of complete stillness
    tempVector
      .copy(fish.direction)
      .multiplyScalar(fish.speed * 0.2 * deltaTime);
    fish.position.add(tempVector);
    fish.velocity.copy(fish.direction).multiplyScalar(fish.speed * 0.2);

    if (fish.huntTimer > 2 + Math.random() * 2) {
      fish.isHunting = true;
      fish.direction
        .set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 2
        )
        .normalize();
      fish.huntTimer = 0;
    }
  }
};

const updatePatrol = (fish: AnglerFishData, time: number): void => {
  const t = (Math.sin(time * fish.speed * 0.1) + 1) * 0.5;
  tempVector.lerpVectors(fish.patrolStart, fish.patrolEnd, t);
  fish.position.copy(tempVector);

  fish.direction.subVectors(fish.patrolEnd, fish.patrolStart).normalize();
  fish.velocity.copy(fish.direction).multiplyScalar(fish.speed);
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

export function AnglerFish({
  fishData,
}: {
  fishData: AnglerFishData;
}): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const anglerFishGltf = useGLTF(MODEL_PATH) as AnglerFishGLTF;

  // Create cloned scene and cache mesh references
  const { clonedScene, meshRefs } = useMemo(() => {
    const scene = anglerFishGltf.scene.clone();

    // Find mesh references in the CLONED scene
    const meshes = {
      bulb: findMeshByName(scene, "Bulb"),
      leftFin:
        findMeshByName(scene, "LeftFin") || findMeshByName(scene, "Fin-Left"),
      rightFin:
        findMeshByName(scene, "RightFin") || findMeshByName(scene, "Fin-Right"),
      tail: findMeshByName(scene, "Tail"),
      leftEye:
        findMeshByName(scene, "LeftEye") || findMeshByName(scene, "Eye-Left"),
      rightEye:
        findMeshByName(scene, "RightEye") || findMeshByName(scene, "Eye-Right"),
    };

    // Setup bulb material
    if (meshes.bulb) {
      const bulbMaterial = new THREE.MeshStandardMaterial({
        color: 0x004466,
        emissive: new THREE.Color(0x00ffff),
        emissiveIntensity: fishData.lightIntensity,
        roughness: 0.1,
        metalness: 0.6,
      });
      meshes.bulb.material = bulbMaterial;
    }

    return { clonedScene: scene, meshRefs: meshes };
  }, [anglerFishGltf, fishData.lightIntensity]);

  // Animation loop
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const time = clock.getElapsedTime();
    const deltaTime = Math.min(time - fishData.lastAnimTime, 0.1);
    fishData.lastAnimTime = time;

    if (deltaTime === 0) return;

    // Update fish position based on behavior
    switch (fishData.behavior) {
      case "lurker":
        updateLurker(fishData, deltaTime);
        wrapPosition(fishData.position);
        break;
      case "prowler":
        updateProwler(fishData, deltaTime);
        wrapPosition(fishData.position);
        break;
      case "ambush":
        updateAmbush(fishData, deltaTime);
        wrapPosition(fishData.position);
        break;
      case "patrol":
        updatePatrol(fishData, time);
        break;
    }

    // Apply position
    groupRef.current.position.copy(fishData.position);

    // Cache speed calculation
    fishData.swimSpeed = fishData.velocity.length();

    // Face movement direction
    if (fishData.swimSpeed > 0.05) {
      tempLookTarget.copy(fishData.position).add(fishData.direction);
      const targetQuat = new THREE.Quaternion();
      const currentQuat = groupRef.current.quaternion.clone();

      groupRef.current.lookAt(tempLookTarget);
      targetQuat.copy(groupRef.current.quaternion);
      groupRef.current.quaternion.copy(currentQuat);
      groupRef.current.quaternion.slerp(targetQuat, 0.08);
    }

    // Subtle body movement
    groupRef.current.rotation.y += Math.sin(time * 1.5) * 0.001;
    groupRef.current.position.y += Math.sin(time * 0.8) * 0.01;

    // Swimming sway animation (like goldfish)
    const sway = Math.sin(time * 2) * 0.03 * (1 + fishData.swimSpeed);
    groupRef.current.rotation.z += sway * 0.1;

    // Animate bulb glow - simple pulsing
    if (meshRefs.bulb?.material) {
      const material = meshRefs.bulb.material as THREE.MeshStandardMaterial;
      const glowIntensity =
        fishData.lightIntensity *
        (0.5 + Math.sin(time * 2) * 0.3 + Math.sin(time * 3.7) * 0.1);
      material.emissiveIntensity = Math.max(0, Math.min(2, glowIntensity));
    }

    // Animate fins - similar to goldfish but slower
    if (meshRefs.leftFin) {
      meshRefs.leftFin.rotation.x = Math.sin(time * 2) * 0.2;
      meshRefs.leftFin.rotation.y = Math.cos(time * 1.5) * 0.1;
    }
    if (meshRefs.rightFin) {
      meshRefs.rightFin.rotation.x = -Math.sin(time * 2) * 0.2;
      meshRefs.rightFin.rotation.y = -Math.cos(time * 1.5) * 0.1;
    }

    // Animate tail - swimming motion
    if (meshRefs.tail) {
      meshRefs.tail.rotation.y =
        Math.sin(time * 2.5) * 0.4 * (0.5 + fishData.swimSpeed);
      meshRefs.tail.rotation.z = Math.cos(time * 2) * 0.2;
    }

    // Animate eyes with blinking
    const animateEye = (eye: THREE.Mesh | null, offset = 0) => {
      if (!eye) return;

      eye.rotation.x = Math.sin(time * 1.3 + offset) * 0.05;
      eye.rotation.y = Math.cos(time * 0.9 + offset) * 0.03;

      // Blinking
      const blinkTrigger = Math.sin(time * 0.8 + offset);
      if (blinkTrigger > 0.95) {
        eye.scale.y = 0.1 + (1 - Math.abs(blinkTrigger - 0.98) * 50) * 0.9;
      } else {
        eye.scale.y = 1;
      }
    };

    animateEye(meshRefs.leftEye, 0);
    animateEye(meshRefs.rightEye, 1.2);
  });

  return (
    <group ref={groupRef}>
      {/* Point light from the bulb */}
      {meshRefs.bulb && (
        <pointLight
          position={[0, 0.5, 0.8]}
          color={0x00ffff}
          intensity={fishData.lightIntensity * 0.5}
          distance={3}
          decay={2}
        />
      )}
      <primitive object={clonedScene} />
    </group>
  );
}
