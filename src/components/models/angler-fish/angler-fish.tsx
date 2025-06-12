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
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    overall: number;
  };
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
    // Dim light while waiting
    fish.audioData.overall = 0.2;
    return;
  }

  if (fish.behaviorTimer > 3 + Math.random() * 4) {
    if (Math.random() < 0.6) {
      fish.waitTimer = 2 + Math.random() * 3;
    } else {
      fish.direction
        .set(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 1.5
        )
        .normalize();
    }
    fish.behaviorTimer = 0;
  }

  tempVector.copy(fish.direction).multiplyScalar(fish.speed * 0.5 * deltaTime);
  fish.position.add(tempVector);
  fish.velocity.copy(fish.direction).multiplyScalar(fish.speed * 0.5);
  fish.audioData.overall = 0.4 + Math.random() * 0.3;
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
  fish.audioData.overall = 0.5 + Math.sin(fish.behaviorTimer * 2) * 0.2;
};

const updateAmbush = (fish: AnglerFishData, deltaTime: number): void => {
  fish.huntTimer += deltaTime;

  if (fish.isHunting) {
    // Quick burst movement
    tempVector.copy(fish.direction).multiplyScalar(fish.speed * 2 * deltaTime);
    fish.position.add(tempVector);
    fish.velocity.copy(fish.direction).multiplyScalar(fish.speed * 2);
    fish.audioData.overall = 0.8; // Bright light when hunting

    if (fish.huntTimer > 0.5) {
      fish.isHunting = false;
      fish.huntTimer = 0;
    }
  } else {
    // Wait and watch
    fish.velocity.set(0, 0, 0);
    fish.audioData.overall = 0.3; // Dim light while waiting

    if (fish.huntTimer > 3 + Math.random() * 4) {
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
  fish.audioData.overall = 0.4 + Math.sin(time * 1.5) * 0.2;
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
    const bodyIntensity = fishData.audioData.overall * 0.2;
    groupRef.current.rotation.y +=
      Math.sin(time * 1.5) * 0.001 * (1 + bodyIntensity);
    groupRef.current.position.y +=
      Math.sin(time * 0.8) * (0.01 + bodyIntensity * 0.03);

    // Animate bulb glow
    if (meshRefs.bulb?.material) {
      const material = meshRefs.bulb.material as THREE.MeshStandardMaterial;
      let glowIntensity = fishData.lightIntensity * fishData.audioData.overall;
      glowIntensity += Math.sin(time * 2) * 0.1 + Math.sin(time * 3.7) * 0.05;
      material.emissiveIntensity = Math.max(0, Math.min(2, glowIntensity));
    }

    // Animate fins
    const finsIntensity = fishData.audioData.overall * 0.3;
    if (meshRefs.leftFin) {
      meshRefs.leftFin.rotation.x =
        Math.sin(time * 2.5) * (0.1 + finsIntensity * 0.2);
      meshRefs.leftFin.rotation.y =
        Math.cos(time * 1.8) * (0.05 + finsIntensity * 0.1);
    }
    if (meshRefs.rightFin) {
      meshRefs.rightFin.rotation.x =
        -Math.sin(time * 2.5) * (0.1 + finsIntensity * 0.2);
      meshRefs.rightFin.rotation.y =
        -Math.cos(time * 1.8) * (0.05 + finsIntensity * 0.1);
    }

    // Animate tail
    if (meshRefs.tail) {
      const tailIntensity = fishData.audioData.overall * 0.4;
      meshRefs.tail.rotation.y =
        Math.sin(time * 3) * (0.15 + tailIntensity * 0.3);
      meshRefs.tail.rotation.z =
        Math.cos(time * 2.2) * (0.08 + tailIntensity * 0.15);
    }

    // Animate eyes with blinking
    const animateEye = (eye: THREE.Mesh | null, offset = 0) => {
      if (!eye) return;
      const intensity = fishData.audioData.overall * 0.3;

      eye.rotation.x = Math.sin(time * 1.3 + offset) * (0.05 + intensity * 0.1);
      eye.rotation.y =
        Math.cos(time * 0.9 + offset) * (0.03 + intensity * 0.08);

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
          intensity={fishData.lightIntensity * fishData.audioData.overall}
          distance={3}
          decay={2}
        />
      )}
      <primitive object={clonedScene} />
    </group>
  );
}
