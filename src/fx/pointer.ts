export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Viewport pixels → normalized device coordinates (x right, y up, both in [-1, 1]). */
export function pointerToNdc(clientX: number, clientY: number, width: number, height: number): { x: number; y: number } {
  if (width <= 0 || height <= 0) return { x: 0, y: 0 };
  return { x: (clientX / width) * 2 - 1, y: 1 - (clientY / height) * 2 };
}
