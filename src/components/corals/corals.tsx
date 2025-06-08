import { CoralFormation } from "./coral-formation";
import { useMemo } from "react";
import { WORLD } from "@/constants/world";

interface CoralsProps {
  count?: number;
}

const coralColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#FF9A8B",
  "#F6D55C",
  "#C44D58",
];

function Corals({ count = 10 }: CoralsProps) {
  const corals = useMemo(() => {
    const formations = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * WORLD.width;
      const z = (Math.random() - 0.5) * WORLD.length;
      const y = -WORLD.height / 2 + Math.random() * 2; // near seafloor
      const color = coralColors[Math.floor(Math.random() * coralColors.length)];
      const scale = 0.8 + Math.random() * 0.8; // between 0.8 and 1.6

      formations.push({
        position: [x, y, z] as [number, number, number],
        color,
        scale,
      });
    }

    return formations;
  }, [count]);

  return (
    <>
      {corals.map((coral, index) => (
        <CoralFormation
          key={index}
          position={coral.position}
          color={coral.color}
          scale={coral.scale}
        />
      ))}
    </>
  );
}

export default Corals;
