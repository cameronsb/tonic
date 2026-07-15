import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for localStorage persistence with type safety
 *
 * Features:
 * - Type-safe read/write
 * - Automatic JSON serialization
 * - Error handling
 * - Cross-tab synchronization via the native `storage` event
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Keep the latest value in a ref so `setValue` can stay referentially stable
  // (deps: [key]) while still resolving functional updates against fresh state.
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function (like useState)
        const valueToStore =
          value instanceof Function ? value(storedValueRef.current) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Keep defaultValue reachable from the storage handler without re-subscribing.
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  // Listen for native storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;

      // A `null` newValue means the key was removed in another tab
      // (e.g. a "reset settings" that clears storage) — fall back to defaults.
      if (e.newValue === null) {
        setStoredValue(defaultValueRef.current);
        return;
      }

      try {
        setStoredValue(JSON.parse(e.newValue));
      } catch (error) {
        console.error(`Error parsing storage event for key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}
