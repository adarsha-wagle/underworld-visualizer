import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD } from "@/constants/world";

interface IUnderwaterCausticsProps {
  position?: [number, number, number];
  intensity?: number;
}

function UnderwaterCaustics({
  position = [0, WORLD.height, 0],
  intensity = 0.8,
}: IUnderwaterCausticsProps) {
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
      <planeGeometry args={[WORLD.width, WORLD.length]} />
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

export default UnderwaterCaustics;
