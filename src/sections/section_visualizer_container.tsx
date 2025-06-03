import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Stats,
  FirstPersonControls,
  PointerLockControls,
} from "@react-three/drei";

import AnglerFish from "../components/models/angler-fish";
import OceanEnvironment from "../components/environment/ocean-env";
import Player from "../components/player/player";

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
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} />
      <AnglerFish />
      {/* <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        target={[0, 0, 0]}
      /> */}
      <Stats />
      <OceanEnvironment />
      <Player />
      {/* <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/underwater_01_1k.hdr"
        background={false}
      /> */}
    </Canvas>
  );
}

export default SectionVisualizerContainer;
