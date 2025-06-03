import React, { useRef, useMemo, useEffect, useState, type JSX } from "react";
import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import SectionVisualizerContainer from "./sections/section_visualizer_container";

// Type definitions
interface AudioData {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
}

interface AudioAnalyzerHook {
  audioData: AudioData;
  startAudio: () => Promise<void>;
  isPlaying: boolean;
}

interface FishProps {
  position: [number, number, number];
  audioData: AudioData;
}

interface CoralProps {
  position: [number, number, number];
  audioData: AudioData;
}

interface BubbleProps {
  audioData: AudioData;
}

interface AquariumSceneProps {
  audioData: AudioData;
}

interface ControlsProps {
  onStart: () => Promise<void>;
  isPlaying: boolean;
  audioData: AudioData;
}

// Audio analyzer hook
function useAudioAnalyzer(): AudioAnalyzerHook {
  const [audioData, setAudioData] = useState<AudioData>({
    bass: 0,
    mid: 0,
    treble: 0,
    overall: 0,
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startAudio = async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;

      const bufferLength: number = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyzerRef.current);

      setIsPlaying(true);
    } catch (err) {
      console.log("Microphone access denied, using demo data");
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    let animationId: number;

    const updateAudioData = (): void => {
      if (analyzerRef.current && dataArrayRef.current) {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

        const bass: number =
          dataArrayRef.current.slice(0, 10).reduce((a, b) => a + b) / 10 / 255;
        const mid: number =
          dataArrayRef.current.slice(10, 40).reduce((a, b) => a + b) / 30 / 255;
        const treble: number =
          dataArrayRef.current.slice(40, 128).reduce((a, b) => a + b) /
          88 /
          255;
        const overall: number =
          dataArrayRef.current.reduce((a, b) => a + b) /
          dataArrayRef.current.length /
          255;

        setAudioData({ bass, mid, treble, overall });
      } else {
        // Demo data when no microphone
        const time: number = Date.now() * 0.001;
        setAudioData({
          bass: Math.abs(Math.sin(time * 0.5)) * 0.8,
          mid: Math.abs(Math.sin(time * 1.2)) * 0.6,
          treble: Math.abs(Math.sin(time * 2)) * 0.4,
          overall:
            (Math.abs(Math.sin(time * 0.8)) + Math.abs(Math.sin(time * 1.5))) *
            0.3,
        });
      }

      animationId = requestAnimationFrame(updateAudioData);
    };

    if (isPlaying) {
      updateAudioData();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return { audioData, startAudio, isPlaying };
}

// Fish component
function Fish({ position, audioData }: FishProps): JSX.Element {
  const meshRef = useRef<THREE.Group>(null);
  const [hue] = useState<number>(Math.random() * 360);

  useFrame((state: RootState) => {
    if (meshRef.current) {
      // Dance based on treble
      const dance: number = audioData.treble * 2;
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 2) * (0.5 + dance);
      meshRef.current.position.y =
        position[1] +
        Math.sin(state.clock.elapsedTime * 3 + position[0]) *
          (0.3 + dance * 0.5);

      // Color intensity based on mid frequencies
      const intensity: number = 0.3 + audioData.mid * 0.7;
      const bodyMesh = meshRef.current.children[0] as THREE.Mesh;
      if (bodyMesh && bodyMesh.material instanceof THREE.MeshPhongMaterial) {
        bodyMesh.material.emissive.setHSL(hue / 360, 0.8, intensity * 0.3);
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshPhongMaterial color={`hsl(${hue}, 70%, 60%)`} />
      </mesh>
      <mesh position={[0.4, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshPhongMaterial color={`hsl(${hue}, 70%, 50%)`} />
      </mesh>
    </group>
  );
}

// Coral component
function Coral({ position, audioData }: CoralProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const [baseColor] = useState<THREE.Color>(
    new THREE.Color().setHSL(Math.random() * 0.3 + 0.1, 0.8, 0.4)
  );

  useFrame((state: RootState) => {
    if (
      meshRef.current &&
      meshRef.current.material instanceof THREE.MeshPhongMaterial
    ) {
      // Glow based on treble
      const glow: number = audioData.treble * 2;
      meshRef.current.material.emissive.copy(baseColor).multiplyScalar(glow);

      // Gentle sway
      meshRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.1, 0.3, 1.5, 8]} />
      <meshPhongMaterial color={baseColor} />
    </mesh>
  );
}

// Bubble component
function Bubble({ audioData }: BubbleProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const [startY] = useState<number>(-8);
  const [x] = useState<number>((Math.random() - 0.5) * 16);
  const [z] = useState<number>((Math.random() - 0.5) * 16);
  const [speed] = useState<number>(0.5 + Math.random() * 0.5);

  useFrame((state: RootState) => {
    if (meshRef.current) {
      // Rise speed based on bass
      const bassBoost: number = 1 + audioData.bass * 3;
      meshRef.current.position.y += speed * bassBoost * 0.02;

      // Float motion
      meshRef.current.position.x =
        x + Math.sin(state.clock.elapsedTime + x) * 0.5;
      meshRef.current.position.z =
        z + Math.cos(state.clock.elapsedTime + z) * 0.5;

      // Reset when reaching top
      if (meshRef.current.position.y > 8) {
        meshRef.current.position.y = startY;
      }

      // Scale based on overall audio
      const scale: number = 0.8 + audioData.overall * 0.4;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[x, startY, z]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshPhongMaterial
        color="lightblue"
        transparent
        opacity={0.3}
        emissive="lightblue"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// Caustics effect (simplified)
function Caustics(): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state: RootState) => {
    if (
      meshRef.current &&
      meshRef.current.material instanceof THREE.MeshBasicMaterial
    ) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      meshRef.current.material.opacity =
        0.1 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 6, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <meshBasicMaterial
        color="lightblue"
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  );
}

// Main aquarium scene
function AquariumScene({ audioData }: AquariumSceneProps): JSX.Element {
  const { scene } = useThree();

  // Set background color
  useEffect(() => {
    scene.background = new THREE.Color(0x001133);
  }, [scene]);

  // Generate fish positions
  const fishPositions = useMemo<[number, number, number][]>(
    () =>
      Array.from({ length: 8 }, (): [number, number, number] => [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 12,
      ]),
    []
  );

  // Generate coral positions
  const coralPositions = useMemo<[number, number, number][]>(
    () =>
      Array.from({ length: 6 }, (): [number, number, number] => [
        (Math.random() - 0.5) * 14,
        -4,
        (Math.random() - 0.5) * 14,
      ]),
    []
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#004080" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        color="#80ccff"
        castShadow
      />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#40a0ff" />

      {/* Fish */}
      {fishPositions.map((pos: [number, number, number], i: number) => (
        <Fish key={i} position={pos} audioData={audioData} />
      ))}

      {/* Coral */}
      {coralPositions.map((pos: [number, number, number], i: number) => (
        <Coral key={i} position={pos} audioData={audioData} />
      ))}

      {/* Bubbles */}
      {Array.from({ length: 15 }, (_, i: number) => (
        <Bubble key={i} audioData={audioData} />
      ))}

      {/* Caustics */}
      <Caustics />

      {/* Ocean floor */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshPhongMaterial color="#2a4a3a" />
      </mesh>
    </>
  );
}

// Control panel
function Controls({
  onStart,
  isPlaying,
  audioData,
}: ControlsProps): JSX.Element {
  const barStyle: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: "12px",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 100,
        background: "rgba(0, 50, 100, 0.8)",
        padding: "20px",
        borderRadius: "10px",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", color: "#80ccff" }}>
        🐠 Audio Aquarium
      </h3>

      {!isPlaying ? (
        <button
          onClick={onStart}
          style={{
            background: "linear-gradient(45deg, #0080ff, #00ccff)",
            border: "none",
            padding: "12px 24px",
            borderRadius: "25px",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🎵 Start Audio Visualization
        </button>
      ) : (
        <div>
          <div style={{ marginBottom: "10px", fontSize: "14px" }}>
            <div style={barStyle}>
              🎵 Bass: {"█".repeat(Math.floor(audioData.bass * 10))}
            </div>
            <div style={barStyle}>
              🎹 Mid: {"█".repeat(Math.floor(audioData.mid * 10))}
            </div>
            <div style={barStyle}>
              🎼 Treble: {"█".repeat(Math.floor(audioData.treble * 10))}
            </div>
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            Speak, play music, or make sounds!
            <br />
            Bass → Bubbles | Treble → Fish dance & coral glow
          </div>
        </div>
      )}
    </div>
  );
}

// Main component
export default function AudioAquarium(): JSX.Element {
  // const { audioData, startAudio, isPlaying } = useAudioAnalyzer();

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* <Canvas camera={{ position: [0, 2, 10], fov: 60 }} shadows>
        <AquariumScene audioData={audioData} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
        />
      </Canvas>

      <Controls
        onStart={startAudio}
        isPlaying={isPlaying}
        audioData={audioData}
      /> */}

      <SectionVisualizerContainer />
    </div>
  );
}
