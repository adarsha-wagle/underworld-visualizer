import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats, Text } from "@react-three/drei";
import { Suspense } from "react";

import Loader from "@/components/loader/loader";

import AnglerFish from "../components/models/angler-fish";

import Lobster from "@/components/models/lobster";
import Particles from "@/components/particles/particles";
import Environment from "@/components/environment/environment";
import Obstacles from "@/components/obstacles/obstacles";
// import Turtle from "@/components/models/turtle";

function UnderWaterScene() {
  return (
    <>
      <Environment />
      <Obstacles />
      <Particles />
      <AnglerFish />
      <Lobster />
      <Text
        position={[-100, 5, 100]}
        fontSize={6}
        color="#4A90E2"
        anchorX="center"
        anchorY="middle"
      >
        UNDERWATER WORLD
      </Text>{" "}
      <Text
        position={[-100, 5, -100]}
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
      {/* <Player /> */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={400}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        target={[0, 0, 0]}
      />

      <Stats />
    </Canvas>
  );
}

export default SectionVisualizerContainer;
