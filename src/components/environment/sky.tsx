import { Sky } from "@react-three/drei";

function CustomSky() {
  return (
    <Sky
      sunPosition={[100, 20, 100]}
      distance={450000}
      turbidity={10}
      rayleigh={2}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />
  );
}

export default CustomSky;
