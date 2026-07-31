import { MouseEvent, useContext } from 'react';
import { heroContent } from '../../content/hero';
import { NavigationContext, SECTION_INDEX_BY_HASH } from '../../hooks/navigationContext';
import { MagneticButton } from '../MagneticButton/MagneticButton';
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
      <span className={styles.eyebrow}>{heroContent.eyebrow}</span>
      <h1 className={styles.headline}>{heroContent.headline}</h1>
      <p className={styles.subheadline}>{heroContent.subheadline}</p>
      <div className={styles.ctas}>
        <MagneticButton
          className={styles.ctaPrimary}
          href={heroContent.primaryCta.href}
          onClick={flyTo(heroContent.primaryCta.href)}
        >
          {heroContent.primaryCta.label}
        </MagneticButton>
        <MagneticButton
          className={styles.ctaSecondary}
          href={heroContent.secondaryCta.href}
          onClick={flyTo(heroContent.secondaryCta.href)}
        >
          {heroContent.secondaryCta.label}
        </MagneticButton>
      </div>
      <span className={styles.scrollHint}>{heroContent.scrollHint}</span>
    </section>
  );
}
