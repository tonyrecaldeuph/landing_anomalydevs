import { testimonials } from '../../content/testimonials';
import styles from './Testimonials.module.css';

export function Testimonials() {
  return (
    <section id="testimonios" className="section-inner">
      <h2>Testimonios</h2>
      <div className={styles.grid}>
        {testimonials.map((t) => (
          <article className={styles.card} key={t.id}>
            <p className={styles.quote}>&quot;{t.quote}&quot;</p>
            <div className={styles.person}>
              <span className={styles.badge}>{t.initials}</span>
              <div>
                <div className={styles.name}>{t.author}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
