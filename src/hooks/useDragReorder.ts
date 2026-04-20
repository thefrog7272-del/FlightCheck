import { useRef, useCallback } from 'react';

interface DragState {
  type: 'item' | 'phase';
  sourcePhaseId?: string;
  sourceIndex: number;
}

export function useDragReorder(
  onReorderItems: (phaseId: string, fromIndex: number, toIndex: number) => void,
  onReorderPhases: (fromIndex: number, toIndex: number) => void,
) {
  const dragState = useRef<DragState | null>(null);

  const handleDragStart = useCallback((type: 'item' | 'phase', sourceIndex: number, sourcePhaseId?: string) => {
    return (e: React.DragEvent) => {
      dragState.current = { type, sourcePhaseId, sourceIndex };
      e.dataTransfer.effectAllowed = 'move';
      const target = e.currentTarget as HTMLElement;
      target.style.opacity = '0.5';
    };
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    dragState.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropItem = useCallback((targetPhaseId: string, targetIndex: number) => {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const state = dragState.current;
      if (!state || state.type !== 'item' || state.sourcePhaseId !== targetPhaseId) return;
      if (state.sourceIndex !== targetIndex) {
        onReorderItems(targetPhaseId, state.sourceIndex, targetIndex);
      }
      dragState.current = null;
    };
  }, [onReorderItems]);

  const handleDropPhase = useCallback((targetIndex: number) => {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const state = dragState.current;
      if (!state || state.type !== 'phase') return;
      if (state.sourceIndex !== targetIndex) {
        onReorderPhases(state.sourceIndex, targetIndex);
      }
      dragState.current = null;
    };
  }, [onReorderPhases]);

  return { handleDragStart, handleDragEnd, handleDragOver, handleDropItem, handleDropPhase };
}
