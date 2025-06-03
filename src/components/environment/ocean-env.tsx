function OceanEnvironment() {
  return (
    <>
      {/* Ambient lighting for deep sea */}
      <ambientLight intensity={0.1} color={0x001122} />

      {/* Main directional light (moonlight filtering through water) */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.3}
        color={0x4488bb}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light from below (subtle bioluminescence) */}
      <directionalLight
        position={[0, -5, 2]}
        intensity={0.1}
        color={0x00ff88}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={[0x000811, 8, 25]} />

      {/* Ocean floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={0x001122} roughness={0.8} />
      </mesh>

      {/* Some floating particles for atmosphere */}
      <group>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 20,
              Math.random() * 10 - 2,
              (Math.random() - 0.5) * 20,
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={0x44aaff} transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default OceanEnvironment;
