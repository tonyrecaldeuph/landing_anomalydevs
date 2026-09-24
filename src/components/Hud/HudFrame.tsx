import { useEffect, useState } from 'react';
import { sectionLabels } from '../../content/nav';
import { sectionReadout } from '../../fx/readout';
import { ScrambleText } from '../ScrambleText/ScrambleText';
import styles from './Hud.module.css';

interface HudFrameProps {
  activeCluster: number;
}

const clockFormat = new Intl.DateTimeFormat('es-EC', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'America/Guayaquil',
});

function useClock(): string {
  const [now, setNow] = useState(() => clockFormat.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(clockFormat.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Decorative mission-control frame: corner brackets, section readout, live clock. */
export function HudFrame({ activeCluster }: HudFrameProps) {
  const clock = useClock();
  const readout = sectionReadout(activeCluster, sectionLabels.length, sectionLabels[activeCluster] ?? '');
  const progress = sectionLabels.length > 1 ? activeCluster / (sectionLabels.length - 1) : 0;

  return (
    <div className={styles.frame}>
      <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.br}`} aria-hidden="true" />

      <div className={styles.readout} aria-live="polite">
        <span className={styles.blip} aria-hidden="true" />
        <ScrambleText key={readout} text={readout} durationMs={500} />
      </div>

      <div className={styles.telemetry} aria-hidden="true">
        <span>UIO · UTC−5 {clock}</span>
        <span className={styles.signal}>
          SEÑAL <i /> <i /> <i /> <i />
        </span>
      </div>

      <div className={styles.progress} aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
