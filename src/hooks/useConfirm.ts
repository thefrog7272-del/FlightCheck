import { useState, useCallback, createElement } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

interface ConfirmOptions {
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmState {
  title: string;
  message: string;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback(
    (title: string, message: string, options: ConfirmOptions = {}): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setState({ title, message, options, resolve });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    state?.resolve(false);
    setState(null);
  }, [state]);

  const ConfirmDialog = state
    ? createElement(ConfirmModal, {
        title: state.title,
        message: state.message,
        confirmLabel: state.options.confirmLabel,
        cancelLabel: state.options.cancelLabel,
        destructive: state.options.destructive,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      })
    : null;

  return { confirm, ConfirmDialog };
}
