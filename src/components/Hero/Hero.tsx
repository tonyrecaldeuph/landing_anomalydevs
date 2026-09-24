import { MouseEvent, useContext } from 'react';
import { heroContent } from '../../content/hero';
import { NavigationContext, SECTION_INDEX_BY_HASH } from '../../hooks/navigationContext';
import { MagneticButton } from '../MagneticButton/MagneticButton';
import { ScrambleText } from '../ScrambleText/ScrambleText';
import styles from './Hero.module.css';

export function Hero() {
  const navigateTo = useContext(NavigationContext);

  const flyTo = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    const index = SECTION_INDEX_BY_HASH[href];
    if (index === undefined) return;
    e.preventDefault();
    navigateTo(index);
  };

  return (
    <section id="top" className={styles.hero}>
      <span className={styles.status}>
        <span className={styles.pulse} aria-hidden="true" />
        {heroContent.status}
      </span>

      <ScrambleText as="h1" className={styles.headline} text={heroContent.headline} delayMs={250} durationMs={1400} replayOnHover />

      <p className={styles.subheadline}>{heroContent.subheadline}</p>
      <p className={styles.body}>{heroContent.body}</p>

      <div className={styles.ctas}>
        <MagneticButton
          className={styles.ctaPrimary}
          href={heroContent.primaryCta.href}
          onClick={flyTo(heroContent.primaryCta.href)}
        >
          {heroContent.primaryCta.label}
          <span className={styles.arrow} aria-hidden="true">→</span>
        </MagneticButton>
        <MagneticButton
          className={styles.ctaSecondary}
          href={heroContent.secondaryCta.href}
          onClick={flyTo(heroContent.secondaryCta.href)}
        >
          {heroContent.secondaryCta.label}
        </MagneticButton>
      </div>

      <div className={styles.ticker}>
        <ul className={styles.track} aria-label="Tecnologías">
          {heroContent.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <ul className={styles.track} aria-hidden="true">
          {heroContent.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </div>

      <span className={styles.scrollHint}>
        <span className={styles.mouse} aria-hidden="true" />
        {heroContent.scrollHint}
      </span>
    </section>
  );
}
