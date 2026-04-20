import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  const key = 'test-key';
  const initialValue = { foo: 'bar' };

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with initialValue when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toEqual(initialValue);
    expect(window.localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('initializes with value from localStorage when present', () => {
    const storedValue = { foo: 'stored' };
    window.localStorage.setItem(key, JSON.stringify(storedValue));
    
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toEqual(storedValue);
  });

  it('updates localStorage when state changes', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    const newValue = { foo: 'updated' };
    
    act(() => {
      result.current[1](newValue);
    });
    
    expect(result.current[0]).toEqual(newValue);
    expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual(newValue);
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('handles functional updates', () => {
    const { result } = renderHook(() => useLocalStorage<number>(key, 0));
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem(key)).toBe('1');
  });
});
