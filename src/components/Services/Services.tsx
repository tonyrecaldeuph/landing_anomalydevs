import { services } from '../../content/services';
import styles from './Services.module.css';

export function Services() {
  return (
    <section id="servicios" className="section-inner">
      <h2>Servicios</h2>
      <div className={styles.grid}>
        {services.map((service) => (
          <article className={styles.card} key={service.id}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
