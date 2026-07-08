import { navSections } from '../../content/nav';
import styles from './Nav.module.css';

export function Nav() {
  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      <a className={styles.logo} href="#top">anomalydevs</a>
      <ul className={styles.links}>
        {navSections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
