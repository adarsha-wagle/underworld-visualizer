import { KelpStrand } from "./kelp-strand";
import { WORLD } from "@/constants/world";
import { useMemo, memo } from "react";

interface KelpForestProps {
  count?: number;
}

function KelpForest({ count = 30 }: KelpForestProps) {
  const kelpStrands = useMemo(() => {
    const strands = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.width;
      const z = (Math.random() - 0.5) * WORLD.length;
      const y = -WORLD.height / 2 + Math.random() * 2; // slight variation around bottom
      const height = 14 + Math.random() * 10; // kelp height from 14 to 24

      strands.push({ position: [x, y, z] as [number, number, number], height });
    }

    return strands;
  }, [count]);

  return (
    <>
      {kelpStrands.map((kelp, index) => (
        <KelpStrand key={index} position={kelp.position} height={kelp.height} />
      ))}
    </>
  );
}

export default memo(KelpForest);
