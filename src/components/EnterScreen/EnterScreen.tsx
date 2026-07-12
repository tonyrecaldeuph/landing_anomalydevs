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
      <div className={styles.brand} aria-hidden="true">
        <svg className={styles.icon} viewBox="-104.77 -105.27 309.54 309.54">
          <path
            d="M-38.00 146.00 L138.00 146.00"
            fill="none"
            stroke="#33FF77"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M-14.00 146.00 L50.00 -46.00 L114.00 146.00"
            fill="none"
            stroke="#33FF77"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.00 74.00 L82.00 74.00"
            fill="none"
            stroke="#33FF77"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="-46" r="20" fill="#CFFFE0" />
        </svg>
        <h1 className={styles.logo}>Anomalydevs</h1>
      </div>
      <span className={styles.hint}>Haz clic para entrar</span>
    </button>
  );
}
