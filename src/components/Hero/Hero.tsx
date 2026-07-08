import { heroContent } from '../../content/hero';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <span className={styles.eyebrow}>{heroContent.eyebrow}</span>
      <h1 className={styles.headline}>{heroContent.headline}</h1>
      <p className={styles.subheadline}>{heroContent.subheadline}</p>
      <div className={styles.ctas}>
        <a className={styles.ctaPrimary} href={heroContent.primaryCta.href}>
          {heroContent.primaryCta.label}
        </a>
        <a className={styles.ctaSecondary} href={heroContent.secondaryCta.href}>
          {heroContent.secondaryCta.label}
        </a>
      </div>
      <span className={styles.scrollHint}>{heroContent.scrollHint}</span>
    </section>
  );
}
