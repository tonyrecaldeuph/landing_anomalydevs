import { services } from '../../content/services';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { TiltCard } from '../TiltCard/TiltCard';
import { ServiceIcon } from './ServiceIcon';
import styles from './Services.module.css';

export function Services() {
  return (
    <section id="servicios" className="section-inner">
      <SectionHeading index={2} kicker="capacidades" title="Servicios" />
      <div className={styles.grid}>
        {services.map((service, i) => (
          <TiltCard className={styles.card} key={service.id}>
            <div className={styles.top}>
              <span className={styles.iconWrap}>
                <ServiceIcon id={service.id} className={styles.icon} />
              </span>
              <span className={styles.index} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <span className={styles.scan} aria-hidden="true" />
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
