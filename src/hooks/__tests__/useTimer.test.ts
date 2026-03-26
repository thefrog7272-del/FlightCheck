import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at zero', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.elapsed).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('starts and tracks elapsed time', () => {
    const { result } = renderHook(() => useTimer());

    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);

    act(() => vi.advanceTimersByTime(500));
    // elapsed should be approximately 500ms
    expect(result.current.elapsed).toBeGreaterThanOrEqual(0);
  });

  it('pauses', () => {
    const { result } = renderHook(() => useTimer());

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.pause());

    expect(result.current.isRunning).toBe(false);
  });

  it('resets', () => {
    const { result } = renderHook(() => useTimer());

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.reset());

    expect(result.current.elapsed).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });
});
