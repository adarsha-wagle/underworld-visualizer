import { WORLD } from "@/constants/world";
import { memo, useMemo } from "react";
import SeaCoral from "./sea-coral";

interface IRedCoralsProps {
  count?: number;
}

function SpawnSeaCorals({ count = 4 }: IRedCoralsProps) {
  const seaCorals = useMemo(() => {
    const items = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.x;
      const z = (Math.random() - 0.5) * WORLD.z;
      const y = -WORLD.y;

      items.push({ position: [x, y, z] as [number, number, number] });
    }

    return items;
  }, [count]);

  return (
    <>
      {seaCorals.map((coral, index) => (
        <SeaCoral key={index} position={coral.position} />
      ))}
    </>
  );
}

export default memo(SpawnSeaCorals);
