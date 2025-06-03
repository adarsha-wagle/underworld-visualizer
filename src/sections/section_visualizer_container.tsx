import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";

import AnglerFish from "../components/models/angler-fish";
import OceanEnvironment from "../components/environment/ocean";
// import Player from "../components/player/player";
import Terrain from "../components/environment/terrain";
import CustomSky from "../components/environment/sky";

function SectionVisualizerContainer() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        castShadow
        intensity={1.2}
        position={[10, 20, 10]}
        color="#ffe0b2" // Warm sunlight color
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <AnglerFish />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        target={[0, 0, 0]}
      />
      <CustomSky />
      <Stats />
      {/* <OceanEnvironment /> */}
      {/* <Terrain /> */}
      {/* <Player /> */}
    </Canvas>
  );
}

export default SectionVisualizerContainer;
