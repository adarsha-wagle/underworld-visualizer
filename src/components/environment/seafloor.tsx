import { WORLD } from "@/constants/world";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Seafloor() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const width = WORLD.width;
    const height = WORLD.length;
    const segments = 100;

    const geo = new THREE.PlaneGeometry(width, height, segments, segments);
    const position = geo.attributes.position;
    const colors = [];

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);

      // Elevation variation
      const h1 = Math.sin(x * 0.008) * Math.cos(z * 0.008) * 10;
      const h2 = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 3;
      const h3 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.5;

      const heightY = h1 + h2 + h3 - 25;
      position.setY(i, heightY);

      // Color gradient based on height
      const normHeight = (heightY + 25) / 14; // normalize to 0-1 range
      const baseColor = new THREE.Color().setHSL(
        0.35 - normHeight * 0.1,
        0.4,
        0.35 + normHeight * 0.1
      );
      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    position.needsUpdate = true;

    return geo;
  }, []);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -25, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
        metalness={0.02}
        transparent
        opacity={0.98}
      />
    </mesh>
  );
}

export default Seafloor;
