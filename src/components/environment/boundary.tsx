import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD } from "@/constants/world";

function CausticsWall({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.7 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position} rotation={rotation}>
      {/* Vertical wall: width = WORLD.x or length, height = WORLD.y */}
      <planeGeometry args={[WORLD.x, WORLD.y]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uIntensity;
          varying vec2 vUv;

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
            float caustic1 = noise(st + uTime * 0.3);
            float caustic2 = noise(st * 2.0 - uTime * 0.4);
            float caustic3 = noise(st * 4.0 + uTime * 0.6);
            float caustic4 = noise(st * 0.5 + uTime * 0.2);
            float caustics = (caustic1 + caustic2 * 0.7 + caustic3 * 0.4 + caustic4 * 0.9) / 3.0;
            caustics = pow(caustics, 2.5) * uIntensity;

            vec3 color = vec3(0.2, 0.6, 0.9) * caustics + vec3(0.1, 0.8, 0.7) * caustics * 0.5;
            gl_FragColor = vec4(color, caustics * 0.7);
          }
        `}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function BoundaryCausticsWalls() {
  const halfW = WORLD.x / 2;
  const halfL = WORLD.z / 2;

  return (
    <>
      {/* +X wall */}
      <CausticsWall position={[halfW, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      {/* -X wall */}
      <CausticsWall position={[-halfW, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      {/* +Z wall */}
      <CausticsWall position={[0, 0, halfL]} rotation={[0, Math.PI, 0]} />
      {/* -Z wall */}
      <CausticsWall position={[0, 0, -halfL]} rotation={[0, 0, 0]} />
    </>
  );
}
