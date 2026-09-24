import { BrandMark } from '../BrandMark/BrandMark';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <BrandMark className={styles.mark} />
        <span className={styles.wordmark}>Anomalydevs</span>
      </div>
      <span className={styles.status}>
        <span className={styles.dot} aria-hidden="true" /> Todos los sistemas operativos
      </span>
      <span className={styles.copyright}>© {year} AnomalyDevs. Todos los derechos reservados.</span>
    </footer>
  );
}
