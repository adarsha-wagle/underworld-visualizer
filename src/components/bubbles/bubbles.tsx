import { WORLD } from "@/constants/world";
import BubbleStream from "./bubble-stream";
import { memo } from "react";

// Utility to generate a random position on the ground level
function randomGroundPosition(): [number, number, number] {
  const x = Math.random() * WORLD.x - WORLD.x / 2;
  const y = -WORLD.y / 2; // fixed to ground level
  const z = Math.random() * WORLD.z - WORLD.z / 2;

  return [x, y, z];
}

const STREAM_COUNT = 15;

function Bubbles() {
  const streamPositions = Array.from({ length: STREAM_COUNT }, () =>
    randomGroundPosition()
  );

  return (
    <>
      {streamPositions.map((pos, i) => (
        <BubbleStream
          key={i}
          position={pos}
          count={30 + Math.floor(Math.random() * 30)} // 30–60 bubbles per stream
        />
      ))}
    </>
  );
}

export default memo(Bubbles);
