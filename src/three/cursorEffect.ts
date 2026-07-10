export interface CursorState {
  x: number;
  y: number;
  hovering: boolean;
  hoveringCTA: boolean;
}

export function createCursorOverlay(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  canvas.style.cursor = 'none';
  return canvas;
}

export function renderCursor(ctx: CanvasRenderingContext2D, state: CursorState, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  const { x, y, hovering, hoveringCTA } = state;

  if (!hovering) return;

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, hoveringCTA ? 30 : 15);
  gradient.addColorStop(0, 'rgba(51, 255, 119, 0.3)');
  gradient.addColorStop(1, 'rgba(51, 255, 119, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, hoveringCTA ? 30 : 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#33FF77';
  ctx.beginPath();
  ctx.arc(x, y, hoveringCTA ? 4 : 2.5, 0, Math.PI * 2);
  ctx.fill();
}
