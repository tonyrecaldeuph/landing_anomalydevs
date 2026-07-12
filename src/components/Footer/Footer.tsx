import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <span className={styles.wordmark}>Anomalydevs</span>
      <span className={styles.copyright}>© {year} AnomalyDevs. Todos los derechos reservados.</span>
    </footer>
  );
}
