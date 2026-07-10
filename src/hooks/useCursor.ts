import { useEffect, useRef, useCallback } from 'react';
import { createCursorOverlay, renderCursor, CursorState } from '../three/cursorEffect';

const CTA_SELECTORS = 'a, button, [role="button"], input, textarea';

export function useCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stateRef = useRef<CursorState>({ x: 0, y: 0, hovering: false, hoveringCTA: false });
  const rafRef = useRef(0);

  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = createCursorOverlay();
    canvasRef.current = canvas;
    document.body.appendChild(canvas);
    document.body.style.cursor = 'none';

    const ctx = canvas.getContext('2d')!;
    ctxRef.current = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function render() {
      rafRef.current = requestAnimationFrame(render);
      renderCursor(ctx, stateRef.current, canvas.width, canvas.height);
    }
    render();

    function handleMouse(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const isCTA = target.matches?.(CTA_SELECTORS) || target.closest?.(CTA_SELECTORS) !== null;
      stateRef.current = { x: e.clientX, y: e.clientY, hovering: true, hoveringCTA: isCTA };
    }

    function handleLeave() {
      stateRef.current = { ...stateRef.current, hovering: false, hoveringCTA: false };
    }

    document.addEventListener('mousemove', handleMouse);
    document.addEventListener('mouseleave', handleLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('resize', handleResize);
      canvas.remove();
      document.body.style.cursor = '';
    };
  }, [handleResize]);
}
