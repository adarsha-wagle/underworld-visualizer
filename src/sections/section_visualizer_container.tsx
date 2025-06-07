import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats, Text } from "@react-three/drei";
import { Suspense } from "react";

import Loader from "@/components/loader/loader";

import AnglerFish from "../components/models/angler-fish";

import UnderwaterAmbient from "../components/environment/underwater-ambient";
import Lights from "../components/environment/lights";
import Seafloor from "../components/environment/seafloor";
import UnderwaterCaustics from "../components/environment/underwater-caustics";
import Corals from "../components/corals/corals";
import KelpForest from "../components/kelp-forest/kelp-forest";
import Bubbles from "../components/bubbles/bubbles";
import MarineParticles from "../components/particles/marine-particles";
import SwimmingFish from "../components/particles/swimming-fish";
// import Player from "@/components/player/player";
import Effects from "@/components/effects/effects";
import SeaHorse from "@/components/models/seahorse";
import GoldFish from "@/components/models/gold-fish";
import SeaCoral from "@/components/models/sea-coral";
import Coral from "@/components/models/coral";
import RedCoral from "@/components/models/red-coral";
import AnemoneCoral from "@/components/models/anemone-coral";
import Lobster from "@/components/models/lobster";

function UnderWaterScene() {
  return (
    <>
      <Effects />
      <UnderwaterAmbient />
      <UnderwaterCaustics />
      <Lights />
      <Seafloor />
      <Corals />
      <KelpForest />
      <Bubbles />
      <AnglerFish />
      <SeaHorse />
      <GoldFish />
      <AnemoneCoral />
      {/* <SeaCoral /> */}
      <Lobster />
      <RedCoral />
      <SwimmingFish />
      <Coral />
      <Text
        position={[-100, 5, 100]} // near left edge
        fontSize={6}
        color="#4A90E2"
        anchorX="center"
        anchorY="middle"
      >
        UNDERWATER WORLD
      </Text>{" "}
      <Text
        position={[-100, 5, -100]} // near left edge
        fontSize={6}
        color="#4A90E2"
        anchorX="center"
        anchorY="middle"
      >
        UNDERWATER WORLD
      </Text>
      <MarineParticles />
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
