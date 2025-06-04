function Lights() {
  return (
    <>
      <directionalLight
        position={[20, 40, 20]}
        intensity={0.8}
        color="#5FA8E2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Sunlight filtering down */}
      <spotLight
        position={[0, 50, 0]}
        target-position={[0, 0, 0]}
        color="#87CEEB"
        intensity={1.2}
        angle={Math.PI / 3}
        penumbra={0.8}
        distance={120}
      />

      {/* Multiple underwater area lights */}
      <pointLight
        position={[-30, 10, -20]}
        color="#20B2AA"
        intensity={0.6}
        distance={60}
      />
      <pointLight
        position={[30, 5, 20]}
        color="#4682B4"
        intensity={0.6}
        distance={60}
      />
      <pointLight
        position={[0, -10, 30]}
        color="#5F9EA0"
        intensity={0.5}
        distance={50}
      />

      {/* Additional bright lights for better visibility */}
      <pointLight
        position={[0, 20, 0]}
        color="#87CEEB"
        intensity={0.7}
        distance={80}
      />
      <pointLight
        position={[-20, 0, -30]}
        color="#40E0D0"
        intensity={0.5}
        distance={70}
      />
      <pointLight
        position={[40, 15, 10]}
        color="#00CED1"
        intensity={0.5}
        distance={70}
      />
    </>
  );
}

export default Lights;
