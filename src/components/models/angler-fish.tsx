import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, type JSX } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";

const MODEL_PATH = "/models/angler-fish.glb";

// Type for your specific GLTF model
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

useGLTF.preload(MODEL_PATH);

interface AnglerFishProps {
  audioData?: {
    bass: number;
    mid: number;
    treble: number;
    overall: number;
  };
}

export default function AnglerFish({
  audioData,
}: AnglerFishProps): JSX.Element {
  const isLightOn = true;
  const anglerFishGltf = useGLTF(MODEL_PATH) as AnglerFishGLTF;
  const groupRef = useRef<THREE.Group>(null);
  const bulbMeshRef = useRef<THREE.Mesh | null>(null);
  const finsMeshRef = useRef<THREE.Mesh | null>(null);
  const finLeftMeshRef = useRef<THREE.Mesh | null>(null);
  const finRightMeshRef = useRef<THREE.Mesh | null>(null);
  const tailMeshRef = useRef<THREE.Mesh | null>(null);
  const eyeMeshRef = useRef<THREE.Mesh | null>(null);
  const eyeLeftMeshRef = useRef<THREE.Mesh | null>(null);
  const eyeRightMeshRef = useRef<THREE.Mesh | null>(null);

  // Animation state
  const animationTime = useRef<number>(0);

  useEffect(() => {
    if (anglerFishGltf.scene) {
      console.log(
        "Available objects:",
        anglerFishGltf.scene.children.map((child) => child.name)
      );

      // Find and setup the Bulb mesh
      const bulbGroup = anglerFishGltf.scene.getObjectByName("Bulb");

      let actualBulbMesh: THREE.Mesh | null = null;

      if (bulbGroup) {
        bulbGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            actualBulbMesh = child;
          }
        });
      }

      if (actualBulbMesh) {
        bulbMeshRef.current = actualBulbMesh;

        const bulbMaterial = new THREE.MeshStandardMaterial({
          color: 0x004466,
          emissive: new THREE.Color(0x00ffff),
          emissiveIntensity: 0,
          roughness: 0.1,
          metalness: 0.6,
        });

        (actualBulbMesh as THREE.Mesh).material = bulbMaterial;
      } else {
        anglerFishGltf.scene.traverse((child) => {
          if (
            child.name.toLowerCase().includes("bulb") ||
            child.name.toLowerCase().includes("light")
          ) {
            if (child instanceof THREE.Mesh) {
              bulbMeshRef.current = child;
              const bulbMaterial = new THREE.MeshStandardMaterial({
                color: 0x004466,
                emissive: new THREE.Color(0x00ffff),
                emissiveIntensity: 0,
                roughness: 0.2,
                metalness: 0.1,
              });
              child.material = bulbMaterial;
            }
          }
        });
      }

      // Find and setup other body parts
      const findMeshByName = (name: string): THREE.Mesh | null => {
        let found = anglerFishGltf.scene.getObjectByName(name) as
          | THREE.Mesh
          | undefined;
        if (found?.isMesh) return found;

        // Search in all children if not found directly
        anglerFishGltf.scene.traverse((child) => {
          if (
            child.name.toLowerCase().includes(name.toLowerCase()) &&
            child instanceof THREE.Mesh
          ) {
            found = child;
          }
        });

        return found || null;
      };

      finsMeshRef.current = findMeshByName("Fins");
      finLeftMeshRef.current = findMeshByName("Fin-Left");
      finRightMeshRef.current = findMeshByName("Fin-Right");
      tailMeshRef.current = findMeshByName("Tail");
      eyeMeshRef.current = findMeshByName("Eyes");
      eyeLeftMeshRef.current = findMeshByName("Eye-Left");
      eyeRightMeshRef.current = findMeshByName("Eye-Right");

      console.log("Mesh references:", {
        bulb: !!bulbMeshRef.current,
        fins: !!finsMeshRef.current,
        tail: !!tailMeshRef.current,
        eye: !!eyeMeshRef.current,
        eyeLeft: !!eyeLeftMeshRef.current,

        eyeRight: !!eyeRightMeshRef.current,
        finLeft: !!finLeftMeshRef.current,
        finRight: !!finRightMeshRef.current,
      });
    }
  }, [anglerFishGltf]);

  // Animation and lighting frame loop
  useFrame((_, delta) => {
    animationTime.current += delta;
    const time = animationTime.current;

    // Bulb glow animation
    if (bulbMeshRef.current?.material && isLightOn) {
      const material = bulbMeshRef.current
        .material as THREE.MeshStandardMaterial;

      let glowIntensity = 1.0;
      if (audioData) {
        // Respond to treble frequencies with some bass influence
        glowIntensity = 0.3 + audioData.treble * 1.2 + audioData.bass * 0.3;
      } else {
        // Default pulsing effect - slower and more organic
        glowIntensity =
          0.4 + Math.sin(time * 2) * 0.3 + Math.sin(time * 3.7) * 0.1;
      }

      material.emissiveIntensity = Math.max(0, Math.min(2, glowIntensity));
    } else if (bulbMeshRef.current?.material && !isLightOn) {
      const material = bulbMeshRef.current
        .material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0;
    }

    // Fins animation - gentle swaying
    const finsIntensity = audioData ? audioData.mid * 0.5 : 0.3;

    if (finLeftMeshRef.current) {
      finLeftMeshRef.current.rotation.x =
        Math.sin(time * 2.5) * (0.1 + finsIntensity * 0.2);
      finLeftMeshRef.current.rotation.y =
        Math.cos(time * 1.8) * (0.05 + finsIntensity * 0.1);
    }

    if (finRightMeshRef.current) {
      finRightMeshRef.current.rotation.x =
        -Math.sin(time * 2.5) * (0.1 + finsIntensity * 0.2);
      finRightMeshRef.current.rotation.y =
        -Math.cos(time * 1.8) * (0.05 + finsIntensity * 0.1);
    }

    // Tail animation - swimming motion
    if (tailMeshRef.current) {
      const tailIntensity = audioData ? audioData.bass * 0.8 : 0.4;
      tailMeshRef.current.rotation.y =
        Math.sin(time * 3) * (0.15 + tailIntensity * 0.3);
      tailMeshRef.current.rotation.z =
        Math.cos(time * 2.2) * (0.08 + tailIntensity * 0.15);
    }

    // Eye animation - subtle movement and blinking
    const animateEye = (eye: THREE.Mesh | null, offset = 0) => {
      if (!eye) return;
      const intensity = audioData ? audioData.overall * 0.3 : 0.2;

      eye.rotation.x = Math.sin(time * 1.3 + offset) * (0.05 + intensity * 0.1);
      eye.rotation.y =
        Math.cos(time * 0.9 + offset) * (0.03 + intensity * 0.08);

      // blinking via scale.y
      const blinkTrigger = Math.sin(time * 0.8 + offset);
      if (blinkTrigger > 0.95) {
        eye.scale.y = 0.1 + (1 - Math.abs(blinkTrigger - 0.98) * 50) * 0.9;
      } else {
        eye.scale.y = 1;
      }
    };

    animateEye(eyeLeftMeshRef.current, 0);
    animateEye(eyeRightMeshRef.current, 1.2);

    // Whole body subtle movement
    if (groupRef.current) {
      const bodyIntensity = audioData ? audioData.overall * 0.2 : 0.15;
      groupRef.current.rotation.y +=
        Math.sin(time * 1.5) * 0.001 * (1 + bodyIntensity);
      groupRef.current.position.y =
        Math.sin(time * 0.8) * (0.02 + bodyIntensity * 0.05);
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Add a subtle point light when bulb is on for environmental lighting */}
        {isLightOn && bulbMeshRef.current && (
          <pointLight
            position={[
              bulbMeshRef.current.position.x,
              bulbMeshRef.current.position.y,
              bulbMeshRef.current.position.z + 0.1,
            ]}
            color={0x00ffff}
            intensity={0.5}
            distance={2}
            decay={2}
          />
        )}

        <primitive object={anglerFishGltf.scene} />
      </group>
    </>
  );
}
