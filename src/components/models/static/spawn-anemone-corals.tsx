import { WORLD } from "@/constants/world";
import { useMemo, memo } from "react";
import AnemoneCoral from "./anemone-coral";

interface IRedCoralsProps {
  count?: number;
}

function SpawnAnemoneCorals({ count = 30 }: IRedCoralsProps) {
  const anemoneCorals = useMemo(() => {
    const strands = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.x;
      const z = (Math.random() - 0.5) * WORLD.z;
      const y = -WORLD.y;

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

export default memo(SpawnAnemoneCorals);
