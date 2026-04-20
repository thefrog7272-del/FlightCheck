import styles from './Toast.module.css';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss: () => void;
}

export function Toast({ message, action, onDismiss }: ToastProps) {
  return (
    <div className={styles.toast}>
      <span className={styles.message}>{message}</span>
      {action && (
        <button className={styles.action} onClick={() => { action.onClick(); onDismiss(); }}>
          {action.label}
        </button>
      )}
      <button className={styles.close} onClick={onDismiss}>
        <X size={14} />
      </button>
    </div>
  );
}
