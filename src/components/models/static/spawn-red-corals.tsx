import { WORLD } from "@/constants/world";
import { useMemo, memo } from "react";
import RedCoral from "./red-coral";

interface ISpawnRedCoralsProps {
  count?: number;
}

function SpawnRedCorals({ count = 10 }: ISpawnRedCoralsProps) {
  const redCorals = useMemo(() => {
    const strands = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.x;
      const z = (Math.random() - 0.5) * WORLD.z;
      const y = -WORLD.y / 2; // slight variation around bottom

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
