import { WORLD } from "@/constants/world";
import { useMemo } from "react";
import SeaCoral from "./sea-coral";

interface IRedCoralsProps {
  count?: number;
}

function SeaCorals({ count = 4 }: IRedCoralsProps) {
  const seaCorals = useMemo(() => {
    const items = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.width;
      const z = (Math.random() - 0.5) * WORLD.length;
      const y = -WORLD.height;

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

export default SeaCorals;
