import { Canvas } from "@react-three/fiber";
import { Stats, Text } from "@react-three/drei";
import { Suspense } from "react";

import Loader from "@/components/loader/loader";

import { isDevelopment } from "@/constants/env";

import Particles from "@/components/particles/particles";
import Environment from "@/components/environment/environment";
import Obstacles from "@/components/obstacles/obstacles";
import Player from "@/components/player/player";
import { WORLD } from "@/constants/world";
// import Turtle from "@/components/models/turtle";

function UnderWaterScene() {
  return (
    <>
      <Environment />
      <Obstacles />
      <Particles />
      <Text
        position={[-WORLD.x, WORLD.y / 2, WORLD.z]}
        fontSize={6}
        color="#4A90E2"
        anchorX="center"
        anchorY="middle"
      >
        UNDERWATER WORLD
      </Text>
      <Text
        position={[-WORLD.x, WORLD.y / 2, -WORLD.z]}
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

function SectionVisualizerContainer() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#001122");
      }}
    >
      <Suspense fallback={<Loader />}>
        <UnderWaterScene />
      </Suspense>
      <Player />

      {isDevelopment && <Stats />}
    </Canvas>
  );
}

export default SectionVisualizerContainer;
