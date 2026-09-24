import { PointerEvent, PropsWithChildren, useRef } from 'react';
import { computeTilt } from '../../fx/tilt';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './TiltCard.module.css';

interface TiltCardProps {
  className?: string;
  maxDeg?: number;
}

/**
 * Card that leans toward the pointer and carries a spotlight glare. It only writes CSS
 * variables (--rx, --ry, --glare-x, --glare-y); the consumer's CSS decides how they look.
 */
export function TiltCard({ className, maxDeg = 8, children }: PropsWithChildren<TiltCardProps>) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  function handleMove(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    const tilt = computeTilt(el.getBoundingClientRect(), e.clientX, e.clientY, reducedMotion ? 0 : maxDeg);
    el.style.setProperty('--rx', `${tilt.rotateX.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${tilt.rotateY.toFixed(2)}deg`);
    el.style.setProperty('--glare-x', `${tilt.glareX.toFixed(0)}%`);
    el.style.setProperty('--glare-y', `${tilt.glareY.toFixed(0)}%`);
    el.dataset.active = 'true';
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    delete el.dataset.active;
  }

  return (
    <article
      ref={ref}
      className={`${styles.tilt} ${className ?? ''}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <span className={styles.glare} aria-hidden="true" />
      {children}
    </article>
  );
}
