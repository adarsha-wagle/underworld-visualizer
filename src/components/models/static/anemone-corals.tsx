import { WORLD } from "@/constants/world";
import { useMemo, memo } from "react";
import AnemoneCoral from "./anemone-coral";

interface IRedCoralsProps {
  count?: number;
}

function AnemoneCorals({ count = 30 }: IRedCoralsProps) {
  const anemoneCorals = useMemo(() => {
    const strands = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.width;
      const z = (Math.random() - 0.5) * WORLD.length;
      const y = -WORLD.height;

      strands.push({ position: [x, y, z] as [number, number, number] });
    }

    return strands;
  }, [count]);

  return (
    <>
      {anemoneCorals.map((coral, index) => (
        <AnemoneCoral key={index} position={coral.position} />
      ))}
    </>
  );
}

export default memo(AnemoneCorals);
