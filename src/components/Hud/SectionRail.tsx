import { sectionLabels } from '../../content/nav';
import styles from './Hud.module.css';

interface SectionRailProps {
  activeCluster: number;
  onNavigate: (index: number) => void;
}

/** Vertical waypoint rail: one node per section, the active one lit. */
export function SectionRail({ activeCluster, onNavigate }: SectionRailProps) {
  return (
    <nav className={styles.rail} aria-label="Secciones">
      <ol>
        {sectionLabels.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              className={styles.waypoint}
              aria-label={`Ir a ${label}`}
              aria-current={i === activeCluster ? 'true' : undefined}
              onClick={() => onNavigate(i)}
            >
              <span className={styles.waypointIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.waypointLabel} aria-hidden="true">
                {label}
              </span>
              <span className={styles.waypointNode} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
