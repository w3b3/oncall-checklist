import { useCallback, useState } from "react";

/** useState backed by localStorage, tolerant of private-mode failures. */
export const useLocalStorage = <T>(
  key: string,
  fallback: T
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  const persist = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep the in-memory value */
      }
    },
    [key]
  );

  return [value, persist];
};
