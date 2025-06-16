import * as THREE from "three";
import type { IDolphin } from "./dolphin";
import Dolphin from "./dolphin";

// const BEHAVIORS: TDolphinBehavior[] = ["swim", "whistle", "zigzag"];
// const TOTAL_DOLPHINS = 10;

const dolphinData: IDolphin = {
  id: 1,
  behavior: "swim",
  position: new THREE.Vector3(0, -2, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  direction: new THREE.Vector3(1, 0, 0).normalize(),
  rotation: new THREE.Euler(0, 0, 0),
  speed: 3, // More realistic speed
  behaviorTimer: 0,

  targetDirection: new THREE.Vector3(1, 0, 0).normalize(),
  hasReachedTarget: false,
  targetThreshold: 5.0,

  targetPosition: new THREE.Vector3(0, 0, 20), // Will be initialized in move()

  turningSpeed: 1.0,
  avoidanceDistance: 12,
  currentSpeed: 3,
  desiredSpeed: 3,
  targetDistance: 40,
};

function SpawnDolphins() {
  return (
    <>
      <Dolphin dolphin={dolphinData} />
      <Dolphin dolphin={dolphinData} />
    </>
  );
}

export default SpawnDolphins;
