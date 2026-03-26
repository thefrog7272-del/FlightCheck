import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('shows and auto-dismisses toast', () => {
    const { result } = renderHook(() => useToast(1000));
    expect(result.current.toast).toBeNull();

    act(() => result.current.show('Hello'));
    expect(result.current.toast?.message).toBe('Hello');

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.toast).toBeNull();
  });

  it('supports action button', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useToast());

    act(() => result.current.show('Undo?', { label: 'Undo', onClick }));
    expect(result.current.toast?.action?.label).toBe('Undo');
  });

  it('dismisses immediately', () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.show('Test'));
    expect(result.current.toast).not.toBeNull();

    act(() => result.current.dismiss());
    expect(result.current.toast).toBeNull();
  });
});
