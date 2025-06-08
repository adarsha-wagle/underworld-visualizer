import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats, Text } from "@react-three/drei";
import { Suspense } from "react";

import Loader from "@/components/loader/loader";

import AnglerFish from "../components/models/angler-fish";

import Lights from "../components/environment/lights";
import Seafloor from "../components/environment/seafloor";
import Corals from "../components/corals/corals";
import KelpForest from "../components/kelp-forest/kelp-forest";
import Bubbles from "../components/bubbles/bubbles";
import SeaHorse from "@/components/models/seahorse";
import GoldFish from "@/components/models/gold-fish";
import Coral from "@/components/models/coral";
import RedCoral from "@/components/models/red-coral";
import AnemoneCoral from "@/components/models/anemone-coral";
import Lobster from "@/components/models/lobster";
import Whale from "@/components/models/whale";
import Shark from "@/components/models/shark";
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
      <SeaHorse />
      <GoldFish />
      <AnemoneCoral />
      <Shark />
      <Lobster />
      <Whale />
      <RedCoral />
      <Coral />
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
