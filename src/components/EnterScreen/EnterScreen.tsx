import { useEffect, useState } from 'react';
import { BOOT_LINES, bootProgress, visibleBootLines } from '../../fx/boot';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { BrandMark } from '../BrandMark/BrandMark';
import styles from './EnterScreen.module.css';

interface EnterScreenProps {
  onEnter: () => void;
}

const BOOT_MS = 2600;
const EXIT_MS = 600;

function useBootProgress(): number {
  const reducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(reducedMotion ? 100 : 0);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(100);
      return undefined;
    }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const next = bootProgress(performance.now() - start, BOOT_MS);
      setProgress(next);
      if (next < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return progress;
}

/**
 * Boot screen: the brand symbol draws itself while a system log fills in. Entering is
 * always available (the boot is theater, not a gate) and doubles as the audio unlock gesture.
 */
export function EnterScreen({ onEnter }: EnterScreenProps) {
  const [leaving, setLeaving] = useState(false);
  const progress = useBootProgress();
  const lines = visibleBootLines(progress);
  const ready = progress >= 100;

  useEffect(() => {
    if (!leaving) return undefined;
    const t = setTimeout(onEnter, EXIT_MS);
    return () => clearTimeout(t);
  }, [leaving, onEnter]);

  const enter = () => setLeaving(true);

  return (
    <div className={styles.overlay} data-leaving={leaving ? 'true' : undefined} onClick={enter}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.scan} aria-hidden="true" />

      <div className={styles.core}>
        <div className={styles.emblem}>
          <span className={styles.orbit} aria-hidden="true" />
          <span className={`${styles.orbit} ${styles.orbitInner}`} aria-hidden="true" />
          <BrandMark className={styles.mark} animated />
        </div>

        <h1 className={styles.logo}>Anomalydevs</h1>
        <p className={styles.tagline}>Software que no sigue el molde</p>

        <div className={styles.console} aria-hidden="true">
          {BOOT_LINES.map((line, i) => (
            <div key={line} className={styles.line} data-on={i < lines.length ? 'true' : undefined}>
              <span className={styles.ok}>{i === BOOT_LINES.length - 1 ? '[ !! ]' : '[ OK ]'}</span> {line}
            </div>
          ))}
        </div>

        <div
          className={styles.bar}
          role="progressbar"
          aria-label="Inicializando sistema"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <div className={styles.percent} aria-hidden="true">
          {String(progress).padStart(3, '0')}%
        </div>

        <button
          type="button"
          className={styles.enter}
          data-ready={ready ? 'true' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            enter();
          }}
        >
          Haz clic para entrar
        </button>
      </div>
    </div>
  );
}
