import { useEffect, useState } from 'react';
import styles from './EnterScreen.module.css';

interface EnterScreenProps {
  onEnter: () => void;
}

export function EnterScreen({ onEnter }: EnterScreenProps) {
  const [visible, setVisible] = useState(true);

  function handleClick() {
    setVisible(false);
  }

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        onEnter();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [visible, onEnter]);

  if (!visible) return null;

  return (
    <button type="button" className={styles.overlay} onClick={handleClick}>
      <svg className={styles.logo} viewBox="0 0 200 40" aria-hidden="true">
        <text x="0" y="32" fill="none" stroke="#33FF77" strokeWidth="1" fontSize="32" fontFamily="monospace" letterSpacing="4">
          anomalydevs
        </text>
      </svg>
      <span className={styles.hint}>Haz clic para entrar</span>
    </button>
  );
}
