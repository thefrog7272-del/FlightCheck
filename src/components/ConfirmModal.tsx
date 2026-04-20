import { useEffect, useRef } from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus the cancel button on mount (safer default)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      // Focus trap: Tab and Shift+Tab cycle between the two buttons
      if (e.key === 'Tab') {
        const focusable = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        if (focusable.length === 0) return;

        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);

        if (e.shiftKey) {
          e.preventDefault();
          const prev = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
          focusable[prev].focus();
        } else {
          e.preventDefault();
          const next = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
          focusable[next].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const confirmButtonClass = destructive
    ? `${styles.confirmButton} ${styles.confirmButtonDestructive}`
    : styles.confirmButton;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} ref={modalRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <h2 className={styles.title} id="confirm-title">{title}</h2>
        <p className={styles.message} id="confirm-message">{message}</p>
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={confirmButtonClass}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
