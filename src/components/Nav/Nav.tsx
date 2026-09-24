import { navSections } from '../../content/nav';
import { SECTION_INDEX_BY_HASH } from '../../hooks/navigationContext';
import { BrandMark } from '../BrandMark/BrandMark';
import { ScrambleText } from '../ScrambleText/ScrambleText';
import { SoundToggle } from '../SoundToggle/SoundToggle';
import styles from './Nav.module.css';

/** content/nav.ts starts at "Servicios" — Hero (0) and Manifiesto (1) have no nav entry. */
const NAV_CLUSTER_OFFSET = 2;
const CONTACT_CLUSTER = SECTION_INDEX_BY_HASH['#contacto'];

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
        <BrandMark className={styles.mark} />
        <span>Anomalydevs</span>
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
                <ScrambleText text={section.label} durationMs={420} replayOnHover />
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.actions}>
        <SoundToggle />
        <button type="button" className={styles.cta} onClick={() => onNavigate(CONTACT_CLUSTER)}>
          Hablemos
        </button>
      </div>
    </nav>
  );
}
