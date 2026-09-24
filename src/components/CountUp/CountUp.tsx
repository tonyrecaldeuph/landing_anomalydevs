import { useEffect, useMemo, useRef, useState } from 'react';
import { formatStat, parseStat } from '../../fx/stat';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface CountUpProps {
  value: string;
  className?: string;
  durationMs?: number;
}

/** Counts a stat like "+30" or "100%" up from zero once it scrolls into view. */
export function CountUp({ value, className, durationMs = 1600 }: CountUpProps) {
  const stat = useMemo(() => parseStat(value), [value]);
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() => (reducedMotion ? value : formatStat(stat, 0)));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return undefined;
    }
    let raf = 0;
    const start = () => {
      const t0 = performance.now();
      const tick = () => {
        const progress = (performance.now() - t0) / durationMs;
        setDisplay(formatStat(stat, progress));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      start();
      return () => cancelAnimationFrame(raf);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        start();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stat, value, durationMs, reducedMotion]);

  return (
    <span className={className} ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
