import { WORLD } from "@/constants/world";
import { useGLTF } from "@react-three/drei";
const MODEL_PATH = "/models/ship.glb";

useGLTF.preload(MODEL_PATH);

const pos: [number, number, number] = [0, -WORLD.y / 2, WORLD.z / 2];

function Ship() {
  const shipGltf = useGLTF(MODEL_PATH);

  return (
    <group position={pos}>
      <primitive object={shipGltf.scene}></primitive>;
    </group>
  );
}

export default Ship;
