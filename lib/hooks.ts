"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, api } from "./client";

/**
 * Small fetch hook. The URL (with its query string) is the cache key — change
 * the URL and it refetches; call `reload()` after a mutation. Pass the app-wide
 * `version` counter as `refreshKey` to also refetch when another screen changes
 * shared data.
 */
export function useFetch<T>(url: string | null, refreshKey?: unknown) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(url !== null);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    const ticket = ++latest.current;
    setLoading(true);
    try {
      const result = await api.get<T>(url);
      if (ticket === latest.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (ticket === latest.current) {
        // 401 is handled globally by the lock screen.
        if (!(err instanceof ApiError && err.status === 401)) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      }
    } finally {
      if (ticket === latest.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refreshKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}

/** Trailing debounce — keeps per-keystroke searches off the network. */
export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Persisted-to-localStorage state, SSR-safe. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt values */
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
    },
    [key]
  );

  return [value, update, hydrated] as const;
}
