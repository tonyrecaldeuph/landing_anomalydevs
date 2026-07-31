import { useEffect, useRef, useState } from 'react';
import styles from './SoundToggle.module.css';

const STORAGE_KEY = 'anomalydevs:sound-enabled';
const AUDIO_SRC = '/audio/ambiente.mp3';
const TARGET_VOLUME = 0.4;
const FADE_IN_MS = 1200;
const FADE_OUT_MS = 400;

/** Linear volume ramp on the media element; returns a cancel function. */
function fadeTo(audio: HTMLAudioElement, target: number, ms: number, onDone?: () => void): () => void {
  const from = audio.volume;
  const startAt = performance.now();
  let raf = 0;
  // Progress uses performance.now() rather than the rAF timestamp: both sides
  // of the subtraction must share a clock (jsdom's rAF epoch differs).
  const tick = () => {
    const t = Math.min((performance.now() - startAt) / ms, 1);
    audio.volume = from + (target - from) * t;
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      onDone?.();
    }
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(() => window.localStorage.getItem(STORAGE_KEY) === 'true');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));

    if (!enabled) {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        cancelFadeRef.current?.();
        cancelFadeRef.current = fadeTo(audio, 0, FADE_OUT_MS, () => audio.pause());
      }
      return undefined;
    }

    // The track downloads only the first time sound is enabled — visitors who
    // never turn it on never pay its weight.
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(AUDIO_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audioRef.current = audio;
    }

    let removeRetry: (() => void) | null = null;
    cancelFadeRef.current?.();
    cancelFadeRef.current = fadeTo(audio, TARGET_VOLUME, FADE_IN_MS);
    audio.play()?.catch(() => {
      // Autoplay blocked (e.g. persisted preference on a fresh page load):
      // retry on the first user gesture, which lifts the restriction.
      const retry = () => {
        audioRef.current?.play().catch(() => {});
      };
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('keydown', retry, { once: true });
      removeRetry = () => {
        window.removeEventListener('pointerdown', retry);
        window.removeEventListener('keydown', retry);
      };
    });

    return () => {
      removeRetry?.();
    };
  }, [enabled]);

  useEffect(
    () => () => {
      cancelFadeRef.current?.();
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
    },
    [],
  );

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
