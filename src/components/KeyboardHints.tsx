import styles from './KeyboardHints.module.css';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? '\u2318' : 'Ctrl';

interface Shortcut {
  keys: string;
  label: string;
}

const shortcuts: Shortcut[] = [
  { keys: `${mod}+E`, label: 'Edit' },
  { keys: `${mod}+S`, label: 'Download' },
  { keys: `${mod}+P`, label: 'Print' },
  { keys: 'Esc', label: 'Close' },
];

export function KeyboardHints() {
  return (
    <div className={styles.bar}>
      {shortcuts.map(s => (
        <span key={s.keys} className={styles.hint}>
          <kbd className={styles.kbd}>{s.keys}</kbd> {s.label}
        </span>
      ))}
    </div>
  );
}
