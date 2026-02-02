import { WORLD } from "@/constants/world";
import { useMemo, memo } from "react";
import AnemoneCoral from "./anemone-coral";

interface IRedCoralsProps {
  count?: number;
}

const halfBoundX = WORLD.x / 1.2;
const halfBoundZ = WORLD.z / 1.2;
const halfBoundY = WORLD.y / 1.2;

function SpawnAnemoneCorals({ count = 50 }: IRedCoralsProps) {
  const anemoneCorals = useMemo(() => {
    const strands = [];

    for (let i = 0; i < count; i++) {
      const randX = Math.random() - Math.random();
      const randZ = Math.random() - Math.random();
      const x = randX * halfBoundX;
      const z = randZ * halfBoundZ;
      const y = -halfBoundY + Math.random() * 2;

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
