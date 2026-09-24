import styles from './BrandMark.module.css';

interface BrandMarkProps {
  className?: string;
  /** Draws the strokes in on mount (boot screen). */
  animated?: boolean;
}

/** The "A" symbol from the brand kit (04-simbolo), drawn with strokes so it can animate. */
export function BrandMark({ className, animated = false }: BrandMarkProps) {
  return (
    <svg
      className={`${styles.mark} ${className ?? ''}`}
      data-animated={animated ? 'true' : undefined}
      viewBox="-60 -80 220 250"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.stroke} pathLength={1} d="M-38 146 L138 146" strokeWidth={24} />
      <path className={styles.stroke} pathLength={1} d="M-14 146 L50 -46 L114 146" strokeWidth={36} />
      <path className={styles.stroke} pathLength={1} d="M18 74 L82 74" strokeWidth={32} />
      <circle className={styles.node} cx={50} cy={-46} r={20} />
    </svg>
  );
}
