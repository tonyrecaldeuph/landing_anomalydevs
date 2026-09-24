import { useCallback, useEffect, useRef, useState } from 'react';
import { scrambleFrame } from '../fx/scramble';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface ScrambleOptions {
  delayMs?: number;
  durationMs?: number;
}

/** Decodes `text` from glyphs to its final form; `replay` restarts the effect (e.g. on hover). */
export function useScramble(text: string, { delayMs = 0, durationMs = 900 }: ScrambleOptions = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() => (reducedMotion ? text : scrambleFrame(text, 0)));
  const rafRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const run = useCallback(
    (delay: number) => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      if (reducedMotion) {
        setDisplay(text);
        return;
      }
      timerRef.current = setTimeout(() => {
        const start = performance.now();
        const tick = () => {
          const progress = (performance.now() - start) / durationMs;
          setDisplay(scrambleFrame(text, progress));
          if (progress < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }, delay);
    },
    [text, durationMs, reducedMotion],
  );

  useEffect(() => {
    run(delayMs);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [run, delayMs]);

  const replay = useCallback(() => run(0), [run]);
  return { display, replay };
}
