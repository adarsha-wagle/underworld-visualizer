import { WORLD } from "@/constants/world";
import { useMemo, memo } from "react";
import RedCoral from "./red-coral";

interface ISpawnRedCoralsProps {
  count?: number;
}

const halfBoundX = WORLD.x / 2;
const halfBoundZ = WORLD.z / 2;
const halfBoundY = WORLD.y / 2;

function SpawnRedCorals({ count = 10 }: ISpawnRedCoralsProps) {
  const redCorals = useMemo(() => {
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
      {redCorals.map((coral, index) => (
        <RedCoral key={index} position={coral.position} />
      ))}
    </>
  );
}

export default memo(SpawnRedCorals);
