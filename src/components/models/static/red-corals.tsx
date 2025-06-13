import { WORLD } from "@/constants/world";
import { useMemo, memo } from "react";
import RedCoral from "./red-coral";

interface IRedCoralsProps {
  count?: number;
}

function RedCorals({ count = 10 }: IRedCoralsProps) {
  const redCorals = useMemo(() => {
    const strands = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.width;
      const z = (Math.random() - 0.5) * WORLD.length;
      const y = -WORLD.height / 2; // slight variation around bottom

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

export default memo(RedCorals);
