"use client";

import { useLiveData } from "./use-live-data";
import {
  fetchIssPosition,
  fetchIssTrack,
  fetchIssCrew,
  type IssPosition,
  type TrackPoint,
  type CrewMember,
} from "@/lib/iss";

const SAMPLE_POSITION: IssPosition = {
  lat: -4.5895,
  lon: 137.4417,
  altitudeKm: 421.5,
  velocityKmh: 27580,
  timestamp: Date.parse("2024-06-01T12:00:00Z") / 1000,
  visibility: "daylight",
};

const SAMPLE_TRACK: TrackPoint[] = Array.from({ length: 20 }, (_, i) => {
  // parametric 51.6°-inclination circle as a visual stand-in, clearly labeled as sample
  const t = (i / 19) * 2 * Math.PI;
  return {
    lat: 51.6 * Math.sin(t),
    lon: ((((i / 19) * 360 + 137.4417) % 360) + 540) % 360 - 180,
    t: 0,
  };
});

export function useIssPosition() {
  return useLiveData<IssPosition>("iss-position", fetchIssPosition, {
    pollMs: 5000,
    fallback: SAMPLE_POSITION,
  });
}

export function useIssTrack() {
  return useLiveData<TrackPoint[]>("iss-track", () => fetchIssTrack(95, 5), {
    pollMs: 20 * 60_000, // refresh the predicted path every 20 min
    fallback: SAMPLE_TRACK,
  });
}

export function useIssCrew() {
  return useLiveData<CrewMember[]>("iss-crew", fetchIssCrew, {
    fallback: [],
  });
}
