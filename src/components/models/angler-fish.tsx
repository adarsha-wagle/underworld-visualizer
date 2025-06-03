import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState, type JSX } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";

const MODEL_PATH = "/models/angler-fish.glb";

// Type for your specific GLTF model
type AnglerFishGLTF = GLTF & {
  nodes: {
    Bulb?: THREE.Mesh;
    Fins?: THREE.Mesh;
    Tail?: THREE.Mesh;
    Eye?: THREE.Mesh;
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
  const anglerFishGltf = useGLTF(MODEL_PATH) as AnglerFishGLTF;
  const groupRef = useRef<THREE.Group>(null);
  const bulbMeshRef = useRef<THREE.Mesh | null>(null);
  const finsMeshRef = useRef<THREE.Mesh | null>(null);
  const tailMeshRef = useRef<THREE.Mesh | null>(null);
  const eyeMeshRef = useRef<THREE.Mesh | null>(null);
  const [isLightOn, setIsLightOn] = useState<boolean>(false);

  // Animation state
  const animationTime = useRef<number>(0);

  useEffect(() => {
    if (anglerFishGltf.scene) {
      console.log(
        "Available objects:",
        anglerFishGltf.scene.children.map((child) => child.name)
      );

      // Find and setup the Bulb mesh
      const bulbMesh = anglerFishGltf.scene.getObjectByName("Bulb") as
        | THREE.Mesh
        | undefined;
      if (bulbMesh?.isMesh) {
        bulbMeshRef.current = bulbMesh;

        // Create emissive material for the bulb
        const bulbMaterial = new THREE.MeshStandardMaterial({
          color: 0x004466,
          emissive: new THREE.Color(0x00ffff),
          emissiveIntensity: 0,
          roughness: 0.2,
          metalness: 0.1,
        });

        bulbMesh.material = bulbMaterial;
        console.log("Bulb mesh found and material set");
      } else {
        console.log("Bulb mesh not found, searching in all children...");
        anglerFishGltf.scene.traverse((child) => {
          if (
            child.name.toLowerCase().includes("bulb") ||
            child.name.toLowerCase().includes("light")
          ) {
            console.log("Found potential bulb:", child.name);
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
      tailMeshRef.current = findMeshByName("Tail");
      eyeMeshRef.current = findMeshByName("Eyes");

      console.log("Mesh references:", {
        bulb: !!bulbMeshRef.current,
        fins: !!finsMeshRef.current,
        tail: !!tailMeshRef.current,
        eye: !!eyeMeshRef.current,
      });
    }
  }, [anglerFishGltf]);

  // Animation and lighting frame loop
  useFrame((state, delta) => {
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
    if (finsMeshRef.current) {
      const finsIntensity = audioData ? audioData.mid * 0.5 : 0.3;
      finsMeshRef.current.rotation.z =
        Math.sin(time * 2.5) * (0.1 + finsIntensity * 0.2);
      finsMeshRef.current.rotation.y =
        Math.cos(time * 1.8) * (0.05 + finsIntensity * 0.1);
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
    if (eyeMeshRef.current) {
      const eyeIntensity = audioData ? audioData.overall * 0.3 : 0.2;

      // Subtle eye movement
      eyeMeshRef.current.rotation.x =
        Math.sin(time * 1.3) * (0.05 + eyeIntensity * 0.1);
      eyeMeshRef.current.rotation.y =
        Math.cos(time * 0.9) * (0.03 + eyeIntensity * 0.08);

      // Blinking effect through scaling
      const blinkTrigger = Math.sin(time * 0.8);
      if (blinkTrigger > 0.95) {
        eyeMeshRef.current.scale.y =
          0.1 + (1 - Math.abs(blinkTrigger - 0.98) * 50) * 0.9;
      } else {
        eyeMeshRef.current.scale.y = 1;
      }
    }

    // Whole body subtle movement
    if (groupRef.current) {
      const bodyIntensity = audioData ? audioData.overall * 0.2 : 0.15;
      groupRef.current.rotation.y +=
        Math.sin(time * 1.5) * 0.001 * (1 + bodyIntensity);
      groupRef.current.position.y =
        Math.sin(time * 0.8) * (0.02 + bodyIntensity * 0.05);
    }
  });

  const toggleLight = () => {
    setIsLightOn(!isLightOn);
  };

  return (
    <>
      <group ref={groupRef} onClick={toggleLight}>
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

// Enhanced version with bloom effect and more advanced animations
export function AnglerFishWithBloom({
  audioData,
}: AnglerFishProps): JSX.Element {
  const anglerFishGltf = useGLTF(MODEL_PATH) as AnglerFishGLTF;
  const groupRef = useRef<THREE.Group>(null);
  const bulbMeshRef = useRef<THREE.Mesh | null>(null);
  const finsMeshRef = useRef<THREE.Mesh | null>(null);
  const tailMeshRef = useRef<THREE.Mesh | null>(null);
  const eyeMeshRef = useRef<THREE.Mesh | null>(null);
  const [isLightOn, setIsLightOn] = useState<boolean>(true);

  const animationTime = useRef<number>(0);

  useEffect(() => {
    if (anglerFishGltf.scene) {
      // Setup bulb with bloom-ready material
      const setupBulb = (mesh: THREE.Mesh) => {
        const emissiveMaterial = new THREE.MeshStandardMaterial({
          color: 0x001122,
          emissive: new THREE.Color(0x00ffff),
          emissiveIntensity: 0,
          roughness: 0.1,
          metalness: 0.2,
          transparent: true,
          opacity: 0.9,
        });

        mesh.material = emissiveMaterial;
        // Mark for bloom post-processing
        mesh.userData.bloom = true;
        bulbMeshRef.current = mesh;
      };

      const bulbMesh = anglerFishGltf.scene.getObjectByName(
        "Bulb"
      ) as THREE.Mesh;
      if (bulbMesh?.isMesh) {
        setupBulb(bulbMesh);
      } else {
        anglerFishGltf.scene.traverse((child) => {
          if (
            child.name.toLowerCase().includes("bulb") &&
            child instanceof THREE.Mesh
          ) {
            setupBulb(child);
          }
        });
      }

      // Setup other meshes
      const findAndSetMesh = (
        name: string,
        ref: React.MutableRefObject<THREE.Mesh | null>
      ) => {
        let mesh = anglerFishGltf.scene.getObjectByName(name) as THREE.Mesh;
        if (!mesh?.isMesh) {
          anglerFishGltf.scene.traverse((child) => {
            if (
              child.name.toLowerCase().includes(name.toLowerCase()) &&
              child instanceof THREE.Mesh
            ) {
              mesh = child;
            }
          });
        }
        ref.current = mesh || null;
      };

      findAndSetMesh("Fins", finsMeshRef);
      findAndSetMesh("Tail", tailMeshRef);
      findAndSetMesh("Eye", eyeMeshRef);
    }
  }, [anglerFishGltf]);

  useFrame((state, delta) => {
    animationTime.current += delta;
    const time = animationTime.current;

    // Enhanced bulb animation with bloom
    if (bulbMeshRef.current?.material && isLightOn) {
      const material = bulbMeshRef.current
        .material as THREE.MeshStandardMaterial;

      let glowIntensity = 1.0;
      if (audioData) {
        glowIntensity = 0.5 + audioData.treble * 2.0 + audioData.overall * 0.5;
      } else {
        glowIntensity =
          0.8 + Math.sin(time * 2.5) * 0.4 + Math.sin(time * 4.1) * 0.2;
      }

      material.emissiveIntensity = Math.max(0.2, Math.min(3, glowIntensity));
    } else if (bulbMeshRef.current?.material && !isLightOn) {
      const material = bulbMeshRef.current
        .material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0;
    }

    // Enhanced animations for body parts
    if (finsMeshRef.current) {
      const intensity = audioData ? audioData.mid * 0.8 : 0.5;
      finsMeshRef.current.rotation.z =
        Math.sin(time * 3) * (0.15 + intensity * 0.25);
      finsMeshRef.current.rotation.x =
        Math.cos(time * 2.3) * (0.08 + intensity * 0.12);
    }

    if (tailMeshRef.current) {
      const intensity = audioData ? audioData.bass * 1.2 : 0.6;
      tailMeshRef.current.rotation.y =
        Math.sin(time * 3.5) * (0.2 + intensity * 0.4);
      tailMeshRef.current.rotation.z =
        Math.cos(time * 2.8) * (0.1 + intensity * 0.2);
    }

    if (eyeMeshRef.current) {
      const intensity = audioData ? audioData.overall * 0.4 : 0.3;
      eyeMeshRef.current.rotation.x =
        Math.sin(time * 1.5) * (0.06 + intensity * 0.12);
      eyeMeshRef.current.rotation.y =
        Math.cos(time * 1.1) * (0.04 + intensity * 0.1);

      // Enhanced blinking
      const blinkCycle = Math.sin(time * 0.6);
      if (blinkCycle > 0.93) {
        const blinkAmount = (blinkCycle - 0.93) / 0.07;
        eyeMeshRef.current.scale.y = 1 - blinkAmount * 0.9;
      } else {
        eyeMeshRef.current.scale.y = 1;
      }
    }

    // Enhanced whole body movement
    if (groupRef.current) {
      const intensity = audioData ? audioData.overall * 0.3 : 0.2;
      groupRef.current.rotation.y +=
        Math.sin(time * 1.2) * 0.002 * (1 + intensity);
      groupRef.current.position.y = Math.sin(time) * (0.03 + intensity * 0.08);
      groupRef.current.position.x =
        Math.cos(time * 0.7) * (0.01 + intensity * 0.03);
    }
  });

  return (
    <group ref={groupRef} onClick={() => setIsLightOn(!isLightOn)}>
      {/* Enhanced lighting setup */}
      {isLightOn && bulbMeshRef.current && (
        <>
          <pointLight
            position={[
              bulbMeshRef.current.position.x,
              bulbMeshRef.current.position.y,
              bulbMeshRef.current.position.z + 0.2,
            ]}
            color={0x00ffff}
            intensity={0.8}
            distance={3}
            decay={1.5}
          />
          <spotLight
            position={[
              bulbMeshRef.current.position.x,
              bulbMeshRef.current.position.y + 0.1,
              bulbMeshRef.current.position.z + 0.3,
            ]}
            target={groupRef.current || undefined}
            color={0x004466}
            intensity={0.3}
            angle={Math.PI / 6}
            penumbra={0.5}
            distance={4}
            decay={2}
          />
        </>
      )}

      <primitive object={anglerFishGltf.scene} />
    </group>
  );
}
