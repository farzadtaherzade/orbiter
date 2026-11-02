"use client";

import { useSyncExternalStore } from "react";

let clockListeners: (() => void)[] = [];
let clockInterval: ReturnType<typeof setInterval> | null = null;

function subscribeClock(cb: () => void) {
  clockListeners.push(cb);
  if (!clockInterval) {
    clockInterval = setInterval(() => clockListeners.forEach((l) => l()), 1000);
  }
  return () => {
    clockListeners = clockListeners.filter((l) => l !== cb);
    if (clockListeners.length === 0 && clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  };
}

/** Seconds-resolution UTC clock, shared across all subscribers. */
export function useNowSeconds(): number | null {
  return useSyncExternalStore(
    subscribeClock,
    () => Math.floor(Date.now() / 1000),
    () => null // server snapshot — renders placeholder until hydration
  );
}

/** The current time, client-only. Null during prerender/hydration. */
export function useNow(): Date | null {
  const s = useNowSeconds();
  return s === null ? null : new Date(s * 1000);
}
