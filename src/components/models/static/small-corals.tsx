import { WORLD } from "@/constants/world";
import { memo, useMemo } from "react";
import SmallCoral from "./small-coral";

interface IRedSmallCoralsProps {
  count?: number;
}

function SmallCorals({ count = 40 }: IRedSmallCoralsProps) {
  const smallCorals = useMemo(() => {
    const items = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.x;
      const z = (Math.random() - 0.5) * WORLD.z;
      const y = -WORLD.y + Math.random() * 2;

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

export default memo(SmallCorals);
