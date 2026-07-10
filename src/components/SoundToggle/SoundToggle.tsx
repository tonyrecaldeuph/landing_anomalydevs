import { useEffect, useRef, useState } from 'react';
import styles from './SoundToggle.module.css';

const STORAGE_KEY = 'anomalydevs:sound-enabled';
const FREQ_BY_CLUSTER = [110, 130, 155, 175, 195, 220];

interface SoundToggleProps {
  activeCluster?: number;
}

export function SoundToggle({ activeCluster = 0 }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(() => window.localStorage.getItem(STORAGE_KEY) === 'true');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));

    if (enabled) {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = FREQ_BY_CLUSTER[activeCluster] || 110;
      gain.gain.value = 0;
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.2);
      audioCtxRef.current = ctx;
      gainRef.current = gain;
      oscillatorRef.current = oscillator;

      return () => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        oscillator.stop(ctx.currentTime + 0.3);
        ctx.close();
      };
    }

    return undefined;
  }, [enabled, activeCluster]);

  useEffect(() => {
    if (enabled && oscillatorRef.current) {
      oscillatorRef.current.frequency.value = FREQ_BY_CLUSTER[activeCluster] || 110;
    }
  }, [activeCluster, enabled]);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={enabled}
      onClick={() => setEnabled((v) => !v)}
    >
      {enabled ? 'Sonido: activado' : 'Sonido: desactivado'}
    </button>
  );
}
