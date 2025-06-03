// components/Terrain.tsx
import { useMemo } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

const terrainWidth = 100;
const terrainDepth = 100;
const segments = 100;
const maxHeight = 2;

const TERRAIN_COLOR = "#ffda75";

export default function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      terrainWidth,
      terrainDepth,
      segments,
      segments
    );
    geo.rotateX(-Math.PI / 2); // Make it horizontal

    const noise2D = createNoise2D();

    for (let i = 0; i < geo.attributes.position.count; i++) {
      const x = geo.attributes.position.getX(i);
      const z = geo.attributes.position.getZ(i);
      const y = noise2D(x * 0.05, z * 0.05) * maxHeight;

      geo.attributes.position.setY(i, y);
    }

    geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;

    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color={TERRAIN_COLOR} />
    </mesh>
  );
}
