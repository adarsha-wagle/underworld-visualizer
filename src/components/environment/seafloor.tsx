import { useRef, useMemo } from "react";
import * as THREE from "three";

function Seafloor() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 150, 150);
    const vertices = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];

      // Create underwater terrain with sandy hills and coral formations
      const height1 = Math.sin(x * 0.008) * Math.cos(z * 0.008) * 12;
      const height2 = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 4;
      const height3 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;

      vertices[i + 1] = height1 + height2 + height3 - 25;
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -25, 0]}
    >
      <meshStandardMaterial color="#2a6b4a" roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

export default Seafloor;
