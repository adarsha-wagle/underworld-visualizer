import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PointerLockControls } from "@react-three/drei";
import { useKeyboardControls } from "../../hooks/use-keyboard-controls";

const CAMERA_ROTATION_SPEED = 0.2;
const PLAYER_SPEED = 5; // base speed in units/sec
const SHIFT_MULTIPLIER = 2;
const SMOOTHING = 0.1; // lower = smoother (0.05-0.15 is good range)

// Define your world boundaries
const WORLD_BOUNDS = {
  minX: -100,
  maxX: 100,
  minY: -15,
  maxY: 15,
  minZ: -100,
  maxZ: 100,
};

function Player() {
  const ref = useRef<THREE.Group>(null!);
  const controlsRef = useRef<any>(null);
  const shake = useRef<THREE.Vector3>(new THREE.Vector3());
  const shakeTimer = useRef<number>(0);
  const { camera } = useThree();
  const { forward, backward, left, right, shift } = useKeyboardControls();

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
    const speed = shift ? PLAYER_SPEED * SHIFT_MULTIPLIER : PLAYER_SPEED;
    direction.multiplyScalar(speed);

    // Smooth velocity change (lerp current velocity toward target direction)
    velocity.current.lerp(direction, SMOOTHING);

    // Store current position before movement
    const currentPos = ref.current.position.clone();

    // Apply movement
    ref.current.position.addScaledVector(velocity.current, delta);

    // Clamp position within world bounds
    ref.current.position.x = THREE.MathUtils.clamp(
      ref.current.position.x,
      WORLD_BOUNDS.minX,
      WORLD_BOUNDS.maxX
    );
    ref.current.position.y = THREE.MathUtils.clamp(
      ref.current.position.y,
      WORLD_BOUNDS.minY,
      WORLD_BOUNDS.maxY
    );
    ref.current.position.z = THREE.MathUtils.clamp(
      ref.current.position.z,
      WORLD_BOUNDS.minZ,
      WORLD_BOUNDS.maxZ
    );

    const boundaryHit =
      ref.current.position.x !== currentPos.x + velocity.current.x * delta ||
      ref.current.position.y !== currentPos.y + velocity.current.y * delta ||
      ref.current.position.z !== currentPos.z + velocity.current.z * delta;

    if (boundaryHit) {
      velocity.current.set(0, 0, 0);

      shake.current.set(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      shakeTimer.current = 0.15; // seconds
    }

    // Apply camera shake
    if (shakeTimer.current > 0) {
      shakeTimer.current -= delta;

      camera.position.add(shake.current);
      shake.current.multiplyScalar(0.9); // decay
    }

    // Optional: Stop velocity when hitting a boundary
    // // This prevents the player from "sliding" along walls
    // if (ref.current.position.x !== currentPos.x + velocity.current.x * delta) {
    //   velocity.current.x = 0;
    // }
    // if (ref.current.position.y !== currentPos.y + velocity.current.y * delta) {
    //   velocity.current.y = 0;
    // }
    // if (ref.current.position.z !== currentPos.z + velocity.current.z * delta) {
    //   velocity.current.z = 0;
    // }
  });

  return (
    <group ref={ref}>
      <primitive object={camera} />
      <PointerLockControls ref={controlsRef} />
    </group>
  );
}

export default Player;
