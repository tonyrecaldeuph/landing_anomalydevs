import { testimonials } from '../../content/testimonials';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { TiltCard } from '../TiltCard/TiltCard';
import styles from './Testimonials.module.css';

const WAVE_BARS = 24;

export function Testimonials() {
  return (
    <section id="testimonios" className="section-inner">
      <SectionHeading index={4} kicker="señales entrantes" title="Testimonios" />
      <div className={styles.grid}>
        {testimonials.map((t, i) => (
          <TiltCard className={styles.card} key={t.id} maxDeg={4}>
            <div className={styles.header} aria-hidden="true">
              <span className={styles.live} />
              <span>{`TRANSMISIÓN · CANAL ${String(i + 1).padStart(2, '0')}`}</span>
            </div>
            <div className={styles.wave} aria-hidden="true">
              {Array.from({ length: WAVE_BARS }, (_, b) => (
                <i key={b} style={{ animationDelay: `${(b * 83 + i * 170) % 1200}ms` }} />
              ))}
            </div>
            <p className={styles.quote}>&quot;{t.quote}&quot;</p>
            <div className={styles.person}>
              <span className={styles.badge}>{t.initials}</span>
              <div>
                <div className={styles.name}>{t.author}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
