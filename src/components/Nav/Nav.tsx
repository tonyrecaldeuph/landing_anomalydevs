import { navSections } from '../../content/nav';
import { SoundToggle } from '../SoundToggle/SoundToggle';
import styles from './Nav.module.css';

/** content/nav.ts starts at "Servicios" — Hero (0) and Manifiesto (1) have no nav entry. */
const NAV_CLUSTER_OFFSET = 2;

interface NavProps {
  activeCluster: number;
  onNavigate: (index: number) => void;
}

export function Nav({ activeCluster, onNavigate }: NavProps) {
  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      <a
        className={styles.logo}
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onNavigate(0);
        }}
      >
        anomalydevs
      </a>
      <ul className={styles.links}>
        {navSections.map((section, i) => {
          const clusterIndex = i + NAV_CLUSTER_OFFSET;
          const isActive = activeCluster === clusterIndex;
          return (
            <li key={section.id}>
              <button
                type="button"
                className={styles.link}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onNavigate(clusterIndex)}
              >
                {section.label}
              </button>
            </li>
          );
        })}
      </ul>
      <SoundToggle activeCluster={activeCluster} />
    </nav>
  );
}
