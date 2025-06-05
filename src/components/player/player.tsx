import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PointerLockControls } from "@react-three/drei";
import { useKeyboardControls } from "../../hooks/use-keyboard-controls";

const CAMERA_ROTATION_SPEED = 0.2;
const PLAYER_SPEED = 5; // base speed in units/sec
const SMOOTHING = 0.1; // lower = smoother (0.05-0.15 is good range)

function Player() {
  const ref = useRef<THREE.Group>(null!);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { forward, backward, left, right } = useKeyboardControls();

  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.pointerSpeed = CAMERA_ROTATION_SPEED;
    }
  }, []);

  useFrame((_, delta) => {
    const direction = new THREE.Vector3();

    // Create movement vectors in local space
    const frontVector = new THREE.Vector3(
      0,
      0,
      Number(backward) - Number(forward)
    );
    const sideVector = new THREE.Vector3(Number(right) - Number(left), 0, 0);

    // Combine the movement vectors
    direction.addVectors(frontVector, sideVector).normalize();

    // Transform the direction based on camera's full rotation (not just Y-axis)
    direction.applyQuaternion(camera.quaternion);

    // Scale by speed
    direction.multiplyScalar(PLAYER_SPEED);

    // Smooth velocity change (lerp current velocity toward target direction)
    velocity.current.lerp(direction, SMOOTHING);

    // Apply movement
    ref.current.position.addScaledVector(velocity.current, delta);
  });

  return (
    <group ref={ref}>
      <primitive object={camera} />
      <PointerLockControls ref={controlsRef} />
    </group>
  );
}

export default Player;
