import * as THREE from "three";

export type TDolphinBehavior =
  | "swim"
  | "whistle"
  | "zigzag"
  | "hunt"
  | "follow";

export interface IDolphin {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  behavior: TDolphinBehavior;
  speed: number;
  rotation: THREE.Euler;
  behaviorTimer: number;
  // New AI properties
  target?: THREE.Vector3;
  targetReachDistance: number;
  maxSpeed: number;
  acceleration: THREE.Vector3;
  maxForce: number;
  wanderAngle: number;
  lastTargetUpdate: number;
  targetUpdateInterval: number;
}

export class DolphinAI {
  private static readonly SEEK_WEIGHT = 1.0;
  private static readonly WANDER_WEIGHT = 0.3;
  private static readonly ARRIVAL_RADIUS = 2.0;
  private static readonly WANDER_RADIUS = 1.5;
  private static readonly WANDER_DISTANCE = 3.0;
  private static readonly VERTICAL_MOVEMENT_SCALE = 0.4;

  // Steering behavior: Seek target with realistic underwater movement
  static seek(dolphin: IDolphin, target: THREE.Vector3): THREE.Vector3 {
    const desired = target.clone().sub(dolphin.position);
    const distance = desired.length();

    // If we're close enough, consider target reached
    if (distance < dolphin.targetReachDistance) {
      return new THREE.Vector3(0, 0, 0);
    }

    // Normalize and scale to max speed
    desired.normalize().multiplyScalar(dolphin.maxSpeed);

    // Calculate steering force
    const steer = desired.sub(dolphin.velocity);
    steer.clampLength(0, dolphin.maxForce);

    return steer;
  }

  // Arrival behavior: Slow down when approaching target
  static arrive(dolphin: IDolphin, target: THREE.Vector3): THREE.Vector3 {
    const desired = target.clone().sub(dolphin.position);
    const distance = desired.length();

    if (distance < dolphin.targetReachDistance) {
      return new THREE.Vector3(0, 0, 0);
    }

    let speed = dolphin.maxSpeed;

    // Slow down when approaching
    if (distance < this.ARRIVAL_RADIUS) {
      speed = dolphin.maxSpeed * (distance / this.ARRIVAL_RADIUS);
    }

    desired.normalize().multiplyScalar(speed);
    const steer = desired.sub(dolphin.velocity);
    steer.clampLength(0, dolphin.maxForce);

    return steer;
  }

  // Wander behavior: Add natural swimming variation
  static wander(dolphin: IDolphin): THREE.Vector3 {
    // Update wander angle
    dolphin.wanderAngle += (Math.random() - 0.5) * 0.3;

    // Calculate wander target
    const wanderTarget = dolphin.velocity.clone().normalize();
    wanderTarget.multiplyScalar(this.WANDER_DISTANCE);

    // Add random offset
    const offset = new THREE.Vector3(
      Math.cos(dolphin.wanderAngle) * this.WANDER_RADIUS,
      Math.cos(dolphin.wanderAngle * 1.3) *
        this.WANDER_RADIUS *
        this.VERTICAL_MOVEMENT_SCALE,
      Math.sin(dolphin.wanderAngle) * this.WANDER_RADIUS
    );

    wanderTarget.add(offset);
    wanderTarget.add(dolphin.position);

    return this.seek(dolphin, wanderTarget);
  }

  // Generate natural swimming target positions
  static generateSwimmingTarget(
    currentPos: THREE.Vector3,
    worldBounds: any
  ): THREE.Vector3 {
    const target = new THREE.Vector3();

    // Generate target within world bounds
    target.x = (Math.random() - 0.5) * worldBounds.width * 0.8;
    target.z = (Math.random() - 0.5) * worldBounds.height * 0.8;

    // Dolphins prefer deeper water, but occasionally surface
    const surfaceChance = Math.random();
    if (surfaceChance < 0.1) {
      // Occasionally go to surface
      target.y = Math.random() * 1;
    } else {
      // Stay in deeper water
      target.y = -1 - Math.random() * 3;
    }

    return target;
  }

  // Update dolphin AI behavior
  static update(
    dolphin: IDolphin,
    deltaTime: number,
    currentTime: number,
    worldBounds: any
  ): void {
    // Check if we need a new target
    if (
      !dolphin.target ||
      dolphin.position.distanceTo(dolphin.target) <
        dolphin.targetReachDistance ||
      currentTime - dolphin.lastTargetUpdate > dolphin.targetUpdateInterval
    ) {
      dolphin.target = this.generateSwimmingTarget(
        dolphin.position,
        worldBounds
      );
      dolphin.lastTargetUpdate = currentTime;
    }

    // Calculate steering forces
    let steeringForce = new THREE.Vector3();

    if (dolphin.target) {
      // Combine arrival and wander behaviors
      const arrivalForce = this.arrive(dolphin, dolphin.target);
      const wanderForce = this.wander(dolphin);

      // Weight the forces
      arrivalForce.multiplyScalar(this.SEEK_WEIGHT);
      wanderForce.multiplyScalar(this.WANDER_WEIGHT);

      // Combine forces
      steeringForce.add(arrivalForce);
      steeringForce.add(wanderForce);
    } else {
      // Just wander if no target
      steeringForce = this.wander(dolphin);
    }

    // Apply steering force to acceleration
    dolphin.acceleration.add(steeringForce);

    // Update velocity
    dolphin.velocity.add(
      dolphin.acceleration.clone().multiplyScalar(deltaTime)
    );
    dolphin.velocity.clampLength(0, dolphin.maxSpeed);

    // Update position
    dolphin.position.add(dolphin.velocity.clone().multiplyScalar(deltaTime));

    // Update direction for rotation
    if (dolphin.velocity.length() > 0.1) {
      dolphin.direction.copy(dolphin.velocity).normalize();
    }

    // Calculate realistic rotation
    const angle = Math.atan2(dolphin.direction.x, dolphin.direction.z);
    dolphin.rotation.y = angle;

    // Add pitch based on vertical movement (more realistic diving/surfacing)
    dolphin.rotation.x = -dolphin.direction.y * 0.8;

    // Add slight roll for banking in turns
    const turnRate = dolphin.velocity
      .clone()
      .cross(dolphin.acceleration)
      .length();
    dolphin.rotation.z =
      Math.sin(currentTime * 0.001 + dolphin.id) * 0.1 + turnRate * 0.2;

    // Reset acceleration
    dolphin.acceleration.set(0, 0, 0);

    // Update behavior timer
    dolphin.behaviorTimer += deltaTime;
  }
}
