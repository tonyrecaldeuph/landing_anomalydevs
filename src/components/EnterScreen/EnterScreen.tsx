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
      <h1 className={styles.logo} aria-hidden="true">anomalydevs</h1>
      <span className={styles.hint}>Haz clic para entrar</span>
    </button>
  );
}
