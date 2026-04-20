import { useEffect } from 'react';

export interface KeyboardShortcutConfig {
  onEscape?: () => void;
  onToggleEdit?: () => void;
  onDownloadCsv?: () => void;
  onPrint?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutConfig) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) {
        // Only allow Escape when focused on an input
        if (e.key === 'Escape' && config.onEscape) {
          config.onEscape();
        }
        return;
      }

      const mod = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape' && config.onEscape) {
        config.onEscape();
        return;
      }

      if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        config.onToggleEdit?.();
        return;
      }

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        config.onDownloadCsv?.();
        return;
      }

      if (mod && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        config.onPrint?.();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [config]);
}
