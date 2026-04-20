import { useState, useCallback, useRef } from 'react';

interface ToastState {
  message: string;
  action?: { label: string; onClick: () => void };
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, action });
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, [duration]);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, show, dismiss };
}
