import { KelpStrand } from "./kelp-strand";

function KelpForest() {
  return (
    <>
      <KelpStrand position={[-40, -10, -5]} height={20} />
      <KelpStrand position={[-38, -12, -8]} height={18} />
      <KelpStrand position={[-42, -11, -2]} height={22} />
      <KelpStrand position={[25, -15, 25]} height={16} />
      <KelpStrand position={[28, -13, 22]} height={19} />
      <KelpStrand position={[22, -16, 28]} height={17} />{" "}
    </>
  );
}

export default KelpForest;
