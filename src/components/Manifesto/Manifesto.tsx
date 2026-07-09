import { manifestoContent } from '../../content/manifesto';
import { Reveal } from '../Reveal/Reveal';
import styles from './Manifesto.module.css';

export function Manifesto() {
  return (
    <section id="manifiesto" className={`section-inner ${styles.manifesto}`}>
      <Reveal>
        <h2>{manifestoContent.heading}</h2>
      </Reveal>
      <Reveal>
        <p className={styles.body}>{manifestoContent.body}</p>
      </Reveal>
      <div className={styles.stats}>
        {manifestoContent.stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
