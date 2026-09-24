import { ScrambleText } from '../ScrambleText/ScrambleText';
import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  index: number;
  kicker: string;
  title: string;
  align?: 'start' | 'center';
}

/** Section title block: "// 02 — kicker" line above a decoding h2. */
export function SectionHeading({ index, kicker, title, align = 'start' }: SectionHeadingProps) {
  return (
    <header className={styles.heading} data-align={align}>
      <span className={styles.kicker}>
        <span className={styles.index}>{`// ${String(index).padStart(2, '0')}`}</span>
        <span className={styles.rule} aria-hidden="true" />
        {kicker}
      </span>
      <ScrambleText as="h2" className={styles.title} text={title} durationMs={700} />
    </header>
  );
}
