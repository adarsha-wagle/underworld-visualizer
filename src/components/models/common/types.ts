import * as THREE from "three";

export interface IDynamicModel {
  id: number;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  rotation: THREE.Euler;
  position: THREE.Vector3;

  targetDirection: THREE.Vector3;
  hasReachedTarget: boolean;
  targetThreshold: number;
  targetPosition: THREE.Vector3;

  behaviorTimer: number;

  turningSpeed: number;

  currentSpeed: number;
  desiredSpeed: number;

  targetRotationY: number;
  currentRotationY: number;
}
