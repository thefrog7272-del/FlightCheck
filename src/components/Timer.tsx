import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import styles from './Timer.module.css';

interface TimerProps {
  elapsed: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  bestTime?: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function Timer({ elapsed, isRunning, onStart, onPause, onReset, bestTime }: TimerProps) {
  return (
    <div className={styles.timer}>
      <Clock size={16} className={styles.icon} />
      <span className={styles.time}>{formatTime(elapsed)}</span>
      {isRunning ? (
        <button className={styles.button} onClick={onPause} title="Pause">
          <Pause size={14} />
        </button>
      ) : (
        <button className={styles.button} onClick={onStart} title="Start">
          <Play size={14} />
        </button>
      )}
      <button className={styles.button} onClick={onReset} title="Reset timer">
        <RotateCcw size={14} />
      </button>
      {bestTime && bestTime > 0 && (
        <span className={styles.best} title="Personal best">
          Best: {formatTime(bestTime)}
        </span>
      )}
    </div>
  );
}
