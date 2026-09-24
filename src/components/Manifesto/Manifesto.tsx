import { manifestoContent } from '../../content/manifesto';
import { CountUp } from '../CountUp/CountUp';
import { Reveal } from '../Reveal/Reveal';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import styles from './Manifesto.module.css';

export function Manifesto() {
  return (
    <section id="manifiesto" className={`section-inner ${styles.manifesto}`}>
      <SectionHeading index={1} kicker="manifiesto" title={manifestoContent.heading} align="center" />
      <Reveal>
        <p className={styles.body}>{manifestoContent.body}</p>
      </Reveal>
      <div className={styles.stats}>
        {manifestoContent.stats.map((stat, i) => (
          <div className={styles.stat} key={stat.label}>
            <span className={styles.statTag} aria-hidden="true">{`M-0${i + 1}`}</span>
            <CountUp className={styles.statValue} value={stat.value} />
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statBar} aria-hidden="true" />
          </div>
        ))}
      </div>
      <ul className={styles.principles}>
        {manifestoContent.principles.map((principle) => (
          <li key={principle}>{principle}</li>
        ))}
      </ul>
    </section>
  );
}
