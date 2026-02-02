import { WORLD } from "@/constants/world";
import { memo, useMemo } from "react";
import SmallCoral from "./small-coral";

interface IRedSpawnSmallCoralsProps {
  count?: number;
}

const halfBoundX = WORLD.x / 1.2;
const halfBoundZ = WORLD.z / 1.2;
const halfBoundY = WORLD.y / 1.2;

function SpawnSmallCorals({ count = 70 }: IRedSpawnSmallCoralsProps) {
  const smallCorals = useMemo(() => {
    const items = [];

    for (let i = 0; i < count; i++) {
      const randX = Math.random() - Math.random();
      const randZ = Math.random() - Math.random();
      const x = randX * halfBoundX;
      const z = randZ * halfBoundZ;
      const y = -halfBoundY + Math.random() * 2;

      items.push({ position: [x, y, z] as [number, number, number] });
    }

    return items;
  }, [count]);

  return (
    <>
      {smallCorals.map((smallCoral, index) => (
        <SmallCoral key={index} position={smallCoral.position} />
      ))}
    </>
  );
}

export default memo(SpawnSmallCorals);
