"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DataState = "loading" | "live" | "cached" | "sample";

export interface LiveData<T> {
  data: T;
  state: DataState;
  /** ISO string of when the payload was fetched from source, if known. */
  fetchedAt: number | null;
  error: string | null;
  refresh: () => void;
}

interface CacheEntry {
  at: number;
  payload: unknown;
}

const CACHE_PREFIX = "orbiter-cache:";

function readCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, payload: unknown): boolean {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ at: Date.now(), payload } satisfies CacheEntry)
    );
    return true;
  } catch {
    return false; // quota exceeded — fine, cache is an optimization
  }
}

export interface UseLiveDataOptions<T> {
  /** Serve cached data without refetching if younger than this. */
  ttlMs?: number;
  /** Poll interval in ms (e.g. 5000 for ISS position). 0 = no polling. */
  pollMs?: number;
  /** Archived fallback shown (and clearly labeled) when source is unreachable. */
  fallback: T;
  /** Skip fetching (e.g. below-the-fold until visible). */
  enabled?: boolean;
}

/**
 * Honest data hook: live → cached → labeled sample, never silent fabrication.
 * Stale-while-revalidate: fresh cache renders instantly, source is verified in background.
 */
export function useLiveData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseLiveDataOptions<T>
): LiveData<T> {
  const { pollMs = 0, fallback, enabled = true } = options;
  const [data, setData] = useState<T>(fallback);
  const [state, setState] = useState<DataState>("loading");
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const mounted = useRef(true);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const cache = readCache(key);
    if (cache) {
      try {
        setData(cache.payload as T);
        setFetchedAt(cache.at);
        setState("cached"); // stale-while-revalidate: verified below, upgrades to live
      } catch {
        /* corrupt cache entry — ignore */
      }
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      try {
        const payload = await fetcher();
        if (cancelled || !mounted.current) return;
        setData(payload);
        setState("live");
        setFetchedAt(Date.now());
        setError(null);
        writeCache(key, payload);
      } catch (e) {
        if (cancelled || !mounted.current) return;
        const msg = e instanceof Error ? e.message : "Source unreachable";
        setError(msg);
        const haveCache = readCache(key);
        if (haveCache) {
          setState("cached");
        } else {
          setState("sample");
          setFetchedAt(null);
        }
      } finally {
        if (pollMs > 0 && !cancelled && mounted.current) {
          pollTimer = setTimeout(run, pollMs);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick, enabled]);

  return { data, state, fetchedAt, error, refresh };
}

/** Humanized age for badges: "just now", "4 min ago", "2 h ago". */
export function ageOf(fetchedAt: number | null): string | undefined {
  if (!fetchedAt) return undefined;
  const s = Math.max(0, Math.floor((Date.now() - fetchedAt) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
