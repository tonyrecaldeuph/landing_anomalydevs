export interface TiltRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Tilt {
  rotateX: number;
  rotateY: number;
  /** Glare position in percent of the card, 0–100. */
  glareX: number;
  glareY: number;
}

const FLAT: Tilt = { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Tilt that makes a card lean toward the pointer, at most maxDeg on each axis. */
export function computeTilt(rect: TiltRect, clientX: number, clientY: number, maxDeg: number): Tilt {
  if (rect.width <= 0 || rect.height <= 0) return { ...FLAT };
  const u = clamp01((clientX - rect.left) / rect.width);
  const v = clamp01((clientY - rect.top) / rect.height);
  return {
    rotateY: (u - 0.5) * 2 * maxDeg,
    rotateX: (0.5 - v) * 2 * maxDeg,
    glareX: u * 100,
    glareY: v * 100,
  };
}
