export interface CursorState {
  x: number;
  y: number;
  hovering: boolean;
  hoveringCTA: boolean;
}

/** Trailing ring position and radius, eased toward the pointer every frame. */
export interface CursorRing {
  x: number;
  y: number;
  radius: number;
}

const RING_FOLLOW = 0.18;
const RING_RADIUS = 16;
const RING_RADIUS_CTA = 30;

export function createCursorOverlay(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  canvas.style.cursor = 'none';
  return canvas;
}

export function stepRing(ring: CursorRing, state: CursorState): CursorRing {
  const targetRadius = state.hoveringCTA ? RING_RADIUS_CTA : RING_RADIUS;
  return {
    x: ring.x + (state.x - ring.x) * RING_FOLLOW,
    y: ring.y + (state.y - ring.y) * RING_FOLLOW,
    radius: ring.radius + (targetRadius - ring.radius) * RING_FOLLOW,
  };
}

export function renderCursor(
  ctx: CanvasRenderingContext2D,
  state: CursorState,
  ring: CursorRing,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  if (!state.hovering) return;

  const { x, y, hoveringCTA } = state;

  // Soft halo under the ring.
  const halo = ctx.createRadialGradient(ring.x, ring.y, 0, ring.x, ring.y, ring.radius * 1.6);
  halo.addColorStop(0, hoveringCTA ? 'rgba(51, 255, 119, 0.18)' : 'rgba(51, 255, 119, 0.08)');
  halo.addColorStop(1, 'rgba(51, 255, 119, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(ring.x, ring.y, ring.radius * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Ring with four HUD ticks.
  ctx.strokeStyle = hoveringCTA ? 'rgba(157, 255, 192, 0.95)' : 'rgba(51, 255, 119, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
  ctx.stroke();
  const tick = 5;
  ctx.beginPath();
  ctx.moveTo(ring.x - ring.radius - tick, ring.y);
  ctx.lineTo(ring.x - ring.radius + 2, ring.y);
  ctx.moveTo(ring.x + ring.radius - 2, ring.y);
  ctx.lineTo(ring.x + ring.radius + tick, ring.y);
  ctx.moveTo(ring.x, ring.y - ring.radius - tick);
  ctx.lineTo(ring.x, ring.y - ring.radius + 2);
  ctx.moveTo(ring.x, ring.y + ring.radius - 2);
  ctx.lineTo(ring.x, ring.y + ring.radius + tick);
  ctx.stroke();

  // Precise dot exactly on the pointer.
  ctx.fillStyle = '#33FF77';
  ctx.shadowColor = '#33FF77';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x, y, hoveringCTA ? 3 : 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
