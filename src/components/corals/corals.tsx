import { CoralFormation } from "./coral-formation";

function Corals() {
  return (
    <>
      <CoralFormation position={[-25, -15, -20]} color="#FF6B6B" scale={1.2} />
      <CoralFormation position={[20, -18, 15]} color="#4ECDC4" scale={0.8} />
      <CoralFormation position={[-15, -20, 30]} color="#45B7D1" scale={1.0} />
      <CoralFormation position={[35, -16, -10]} color="#FFA07A" scale={1.5} />
      <CoralFormation position={[0, -19, -35]} color="#98D8C8" scale={0.9} />
      <CoralFormation position={[-35, -17, 25]} color="#FF9A8B" scale={1.1} />
    </>
  );
}

export default Corals;
