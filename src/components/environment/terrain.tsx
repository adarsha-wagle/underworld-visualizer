import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
// import Effects from "../effects/effects";

// Type definitions
interface CoralFormationProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
}

interface KelpStrandProps {
  position: [number, number, number];
  height?: number;
}

interface BubbleStreamProps {
  position: [number, number, number];
  count?: number;
}

interface UnderwaterCausticsProps {
  position?: [number, number, number];
  intensity?: number;
}

interface SwimmingFishProps {
  count?: number;
}

interface MarineParticlesProps {
  count?: number;
}

// Underwater Ambient Effects
function UnderwaterAmbient() {
  const ambientRef = useRef<THREE.AmbientLight>(null!);

  useFrame((state) => {
    // Subtle color shifting for underwater atmosphere
    if (ambientRef.current) {
      const time = state.clock.elapsedTime;
      const intensity = 0.4 + Math.sin(time * 0.5) * 0.08;
      ambientRef.current.intensity = intensity;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} color="#ffffff" />
      <fog attach="fog" args={["#003355", 20, 120]} />
    </>
  );
}

// Enhanced Water Caustics for underwater environment
function UnderwaterCaustics({
  position = [0, 30, 0],
  intensity = 0.8,
}: UnderwaterCausticsProps) {
  const causticsRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const causticsVertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const causticsFragmentShader = `
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec2 st = vUv * 12.0;
      
      // Multiple layers of animated caustics
      float caustic1 = noise(st + uTime * 0.3);
      float caustic2 = noise(st * 2.0 - uTime * 0.4);
      float caustic3 = noise(st * 4.0 + uTime * 0.6);
      float caustic4 = noise(st * 0.5 + uTime * 0.2);
      
      float caustics = (caustic1 + caustic2 * 0.7 + caustic3 * 0.4 + caustic4 * 0.9) / 3.0;
      caustics = pow(caustics, 2.5) * uIntensity;
      
      // Underwater blue-green caustics color
      vec3 causticsColor = vec3(0.2, 0.6, 0.9) * caustics;
      causticsColor += vec3(0.1, 0.8, 0.7) * caustics * 0.5;
      
      gl_FragColor = vec4(causticsColor, caustics * 0.7);
    }
  `;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
    }),
    [intensity]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={causticsRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={causticsVertexShader}
        fragmentShader={causticsFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Swimming Fish Particles
function SwimmingFish({ count = 150 }: SwimmingFishProps) {
  const fishRef = useRef<THREE.Points>(null!);
  const velocities = useRef<Float32Array>(null);

  const fishData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread fish throughout the underwater world
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      // Random fish colors (tropical fish variety)
      const colorType = Math.random();
      if (colorType < 0.3) {
        colors[i * 3] = 1.0; // Orange fish
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.1;
      } else if (colorType < 0.6) {
        colors[i * 3] = 0.2; // Blue fish
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0; // Yellow fish
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.2;
      }

      // Random swimming velocities
      vels[i * 3] = (Math.random() - 0.5) * 0.02;
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    velocities.current = vels;
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!fishRef.current || !velocities.current) return;

    const positions = fishRef.current.geometry.attributes.position
      .array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      // Swimming motion with schooling behavior
      positions[i * 3] +=
        velocities.current[i * 3] + Math.sin(time + i) * 0.005;
      positions[i * 3 + 1] +=
        velocities.current[i * 3 + 1] + Math.cos(time * 0.7 + i) * 0.003;
      positions[i * 3 + 2] +=
        velocities.current[i * 3 + 2] + Math.sin(time * 0.5 + i) * 0.005;

      // Boundary checking - keep fish in bounds
      if (Math.abs(positions[i * 3]) > 60) {
        velocities.current[i * 3] *= -1;
      }
      if (positions[i * 3 + 1] > 30 || positions[i * 3 + 1] < -20) {
        velocities.current[i * 3 + 1] *= -1;
      }
      if (Math.abs(positions[i * 3 + 2]) > 60) {
        velocities.current[i * 3 + 2] *= -1;
      }
    }

    fishRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={fishRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[fishData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[fishData.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// Floating Particles (marine snow, plankton)
function MarineParticles({ count = 2000 }: MarineParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null!);

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 60 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      // Subtle marine particle colors
      const brightness = Math.random() * 0.5 + 0.3;
      colors[i * 3] = brightness * 0.7;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness * 1.2;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      // Gentle floating motion
      positions[i * 3] += Math.sin(time * 0.3 + i * 0.01) * 0.002;
      positions[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.02) * 0.003;
      positions[i * 3 + 2] += Math.cos(time * 0.4 + i * 0.015) * 0.002;

      // Slow downward drift
      positions[i * 3 + 1] -= 0.005;

      // Reset particles that drift too low
      if (positions[i * 3 + 1] < -30) {
        positions[i * 3 + 1] = 50;
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleData.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Underwater Terrain (seafloor)
function Seafloor() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 150, 150);
    const vertices = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];

      // Create underwater terrain with sandy hills and coral formations
      const height1 = Math.sin(x * 0.008) * Math.cos(z * 0.008) * 12;
      const height2 = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 4;
      const height3 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;

      vertices[i + 1] = height1 + height2 + height3 - 25;
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -25, 0]}
    >
      <meshStandardMaterial color="#2a6b4a" roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

// Underwater Coral Formations
function CoralFormation({
  position,
  color = "#ff6b6b",
  scale = 1,
}: CoralFormationProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle swaying motion like underwater plants
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.z =
        Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale}>
        <coneGeometry args={[2, 8, 6]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Soft coral glow */}
      <pointLight
        position={[0, 4, 0]}
        color={color}
        intensity={0.8}
        distance={20}
        decay={2}
      />
    </group>
  );
}

// Kelp Forest
function KelpStrand({ position, height = 15 }: KelpStrandProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      // Underwater kelp swaying
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.x = Math.sin(time * 0.8) * 0.3;
      meshRef.current.rotation.z = Math.cos(time * 0.6) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.2, 0.5, height, 8]} />
      <meshStandardMaterial
        color="#3d7a5d"
        roughness={0.6}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Bubble Streams
function BubbleStream({ position, count = 50 }: BubbleStreamProps) {
  const bubblesRef = useRef<THREE.Points>(null!);

  const bubbleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0] + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = position[1] - Math.random() * 20;
      positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
      sizes[i] = Math.random() * 0.5 + 0.2;
    }

    return { positions, sizes };
  }, [count, position]);

  useFrame(() => {
    if (!bubblesRef.current) return;

    const positions = bubblesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += 0.05 + Math.random() * 0.02;
      positions[i * 3] += Math.sin(positions[i * 3 + 1] * 0.1) * 0.01;

      if (positions[i * 3 + 1] > position[1] + 30) {
        positions[i * 3 + 1] = position[1] - 20;
        positions[i * 3] = position[0] + (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
      }
    }

    bubblesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={bubblesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[bubbleData.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#87CEEB"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Main Underwater Scene
function UnderwaterScene() {
  return (
    <>
      {/* <Effects /> */}
      <UnderwaterAmbient />

      {/* Underwater lighting setup */}
      <directionalLight
        position={[20, 40, 20]}
        intensity={0.8}
        color="#5FA8E2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Sunlight filtering down */}
      <spotLight
        position={[0, 50, 0]}
        target-position={[0, 0, 0]}
        color="#87CEEB"
        intensity={1.2}
        angle={Math.PI / 3}
        penumbra={0.8}
        distance={120}
      />

      {/* Multiple underwater area lights */}
      <pointLight
        position={[-30, 10, -20]}
        color="#20B2AA"
        intensity={0.6}
        distance={60}
      />
      <pointLight
        position={[30, 5, 20]}
        color="#4682B4"
        intensity={0.6}
        distance={60}
      />
      <pointLight
        position={[0, -10, 30]}
        color="#5F9EA0"
        intensity={0.5}
        distance={50}
      />

      {/* Additional bright lights for better visibility */}
      <pointLight
        position={[0, 20, 0]}
        color="#87CEEB"
        intensity={0.7}
        distance={80}
      />
      <pointLight
        position={[-20, 0, -30]}
        color="#40E0D0"
        intensity={0.5}
        distance={70}
      />
      <pointLight
        position={[40, 15, 10]}
        color="#00CED1"
        intensity={0.5}
        distance={70}
      />

      {/* Seafloor */}
      <Seafloor />

      {/* Underwater caustics */}
      <UnderwaterCaustics position={[0, 35, 0]} intensity={0.6} />

      {/* Coral formations */}
      <CoralFormation position={[-25, -15, -20]} color="#FF6B6B" scale={1.2} />
      <CoralFormation position={[20, -18, 15]} color="#4ECDC4" scale={0.8} />
      <CoralFormation position={[-15, -20, 30]} color="#45B7D1" scale={1.0} />
      <CoralFormation position={[35, -16, -10]} color="#FFA07A" scale={1.5} />
      <CoralFormation position={[0, -19, -35]} color="#98D8C8" scale={0.9} />
      <CoralFormation position={[-35, -17, 25]} color="#FF9A8B" scale={1.1} />

      {/* Kelp forest */}
      <KelpStrand position={[-40, -10, -5]} height={20} />
      <KelpStrand position={[-38, -12, -8]} height={18} />
      <KelpStrand position={[-42, -11, -2]} height={22} />
      <KelpStrand position={[25, -15, 25]} height={16} />
      <KelpStrand position={[28, -13, 22]} height={19} />
      <KelpStrand position={[22, -16, 28]} height={17} />

      {/* Bubble streams */}
      <BubbleStream position={[-30, -20, 10]} count={40} />
      <BubbleStream position={[15, -22, -25]} count={30} />
      <BubbleStream position={[0, -25, 0]} count={60} />

      {/* Marine life and particles */}
      <SwimmingFish count={100} />
      <MarineParticles count={1500} />

      {/* Title */}
      <Text
        position={[0, 20, -30]}
        fontSize={6}
        color="#4A90E2"
        anchorX="center"
        anchorY="middle"
      >
        UNDERWATER WORLD
      </Text>
    </>
  );
}

export default function UnderwaterExploration() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#001122" }}>
      <Canvas
        camera={{ position: [0, 0, 40], fov: 75 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#001122");
        }}
      >
        <UnderwaterScene />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={150}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  );
}
