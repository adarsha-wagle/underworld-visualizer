// Returns the smallest angle difference between a and b
export function deltaAngle(a: number, b: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

// Interpolates angle from a to b smoothly
export function lerpAngle(a: number, b: number, t: number): number {
  return a + deltaAngle(a, b) * t;
}
