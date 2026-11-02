/* Archived sample datasets — used ONLY when a live feed is unreachable.
   Every entry is real historical data with its source. The UI labels these
   as "ARCHIVED SAMPLE" so nothing is ever mistaken for live telemetry. */

import type { NeoObject, SolarFlare, EonetEvent, Apod } from "@/lib/nasa";

/* ── APOD sample ──────────────────────────────────────────────── */
export const SAMPLE_APOD: Apod = {
  date: "1972-12-07",
  title: "Blue Marble — archived sample",
  explanation:
    "This is an archived stand-in, shown because the APOD feed could not be reached. The image is NASA's 'Blue Marble' — AS17-148-22727, one of the most reproduced photographs in history, taken by the Apollo 17 crew on 7 December 1972 from 45,000 km out. Connect to the NASA API (or wait for the rate limit to reset) to receive today's actual Astronomy Picture of the Day.",
  url: "/textures/earth_day_4k.jpg",
  hdurl: "/textures/earth_day_4k.jpg",
  media_type: "image",
  copyright: "NASA / Apollo 17 crew",
};

/* ── NEO sample (source: JPL CNEOS close-approach archive) ────── */
export const SAMPLE_NEOS: NeoObject[] = [
  {
    id: "99942",
    name: "99942 Apophis",
    absoluteMagnitude: 19.7,
    diameterMinKm: 0.21,
    diameterMaxKm: 0.47,
    hazardous: true,
    closeApproachDate: "2029-Apr-13 21:46",
    velocityKmh: 26712,
    missDistanceKm: 31600,
    missDistanceAu: 0.00021,
    orbitingBody: "Earth",
  },
  {
    id: "367943",
    name: "367943 Duende (2012 DA14)",
    absoluteMagnitude: 24.1,
    diameterMinKm: 0.027,
    diameterMaxKm: 0.06,
    hazardous: true,
    closeApproachDate: "2013-Feb-15 19:25",
    velocityKmh: 49700,
    missDistanceKm: 27700,
    missDistanceAu: 0.000185,
    orbitingBody: "Earth",
  },
  {
    id: "2000433",
    name: "2004 BL86",
    absoluteMagnitude: 19.0,
    diameterMinKm: 0.53,
    diameterMaxKm: 1.2,
    hazardous: true,
    closeApproachDate: "2015-Jan-26 16:20",
    velocityKmh: 56300,
    missDistanceKm: 1200000,
    missDistanceAu: 0.008,
    orbitingBody: "Earth",
  },
  {
    id: "3122",
    name: "3122 Florence",
    absoluteMagnitude: 14.1,
    diameterMinKm: 4.0,
    diameterMaxKm: 4.9,
    hazardous: true,
    closeApproachDate: "2017-Sep-01 11:06",
    velocityKmh: 49000,
    missDistanceKm: 7060000,
    missDistanceAu: 0.047,
    orbitingBody: "Earth",
  },
  {
    id: "2419470",
    name: "2008 OS7",
    absoluteMagnitude: 24.3,
    diameterMinKm: 0.14,
    diameterMaxKm: 0.32,
    hazardous: true,
    closeApproachDate: "2024-Feb-02 15:41",
    velocityKmh: 57000,
    missDistanceKm: 2850000,
    missDistanceAu: 0.019,
    orbitingBody: "Earth",
  },
  {
    id: "5432449",
    name: "2024 MK",
    absoluteMagnitude: 24.6,
    diameterMinKm: 0.12,
    diameterMaxKm: 0.28,
    hazardous: true,
    closeApproachDate: "2024-Jun-29 13:15",
    velocityKmh: 16600,
    missDistanceKm: 295000,
    missDistanceAu: 0.002,
    orbitingBody: "Earth",
  },
];

/* ── DONKI sample (source: NASA DONKI / NOAA SWPC event archives) ── */
export const SAMPLE_FLARES: SolarFlare[] = [
  { id: "2003-11-04T19:29:00", classType: "X45", peakTime: "2003-11-04T19:29:00Z", sourceLocation: "S19W83", activeRegion: 10486 },
  { id: "2017-09-06T11:53:00", classType: "X9.3", peakTime: "2017-09-06T11:53:00Z", sourceLocation: "S10W72", activeRegion: 12673 },
  { id: "2024-10-03T00:57:00", classType: "X9.0", peakTime: "2024-10-03T00:57:00Z", sourceLocation: "S22W24", activeRegion: 13842 },
  { id: "2025-05-14T04:03:00", classType: "X8.7", peakTime: "2025-05-14T04:03:00Z", sourceLocation: "N21E46", activeRegion: 13697 },
  { id: "2024-05-11T01:39:00", classType: "X5.8", peakTime: "2024-05-11T01:39:00Z", sourceLocation: "S17W76", activeRegion: 13664 },
  { id: "2017-09-10T15:35:00", classType: "X8.2", peakTime: "2017-09-10T15:35:00Z", sourceLocation: "S08W94", activeRegion: 12673 },
];

/* ── EONET sample (source: NASA EONET v3 archive) ─────────────── */
export const SAMPLE_EONET: EonetEvent[] = [
  { id: "eonet-sample-1", title: "Reykjanes Peninsula Eruption", category: "Volcanoes", date: "2024-05-29", lon: -22.38, lat: 63.93, link: "https://eonet.gsfc.nasa.gov/" },
  { id: "eonet-sample-2", title: "Kilauea Eruption", category: "Volcanoes", date: "2024-06-03", lon: -155.28, lat: 19.42, link: "https://eonet.gsfc.nasa.gov/" },
  { id: "eonet-sample-3", title: "Smokehouse Creek Fire", category: "Wildfires", date: "2024-02-26", lon: -100.4, lat: 35.1, link: "https://eonet.gsfc.nasa.gov/" },
  { id: "eonet-sample-4", title: "Hurricane Milton", category: "Severe Storms", date: "2024-10-09", lon: -84.5, lat: 26.9, link: "https://eonet.gsfc.nasa.gov/" },
  { id: "eonet-sample-5", title: "Mount Ruang Eruption", category: "Volcanoes", date: "2024-04-17", lon: 125.38, lat: 2.3, link: "https://eonet.gsfc.nasa.gov/" },
];
