import { useEffect, useCallback } from 'react';

export function useChecklistNavigation(enabled: boolean) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    const target = e.target as HTMLElement;
    // Only handle when focus is on a checklist item or the body
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="checkbox"]'));
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev]?.focus();
    }
  }, [enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
