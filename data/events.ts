/* Cosmic events reference data.
   Meteor shower data: American Meteor Society / IMO annual calendar.
   Eclipse data: NASA Eclipse Web Site (Espenak & Meeus). */

export interface MeteorShower {
  name: string;
  startMonth: number; // 1-based
  startDay: number;
  endMonth: number;
  endDay: number;
  peakMonth: number;
  peakDay: number;
  zhr: number; // Zenithal Hourly Rate
  parent: string;
  bestFrom: string;
}

export const METEOR_SHOWERS: MeteorShower[] = [
  { name: "Quadrantids", startMonth: 12, startDay: 28, endMonth: 1, endDay: 12, peakMonth: 1, peakDay: 3, zhr: 110, parent: "Asteroid 2003 EH1", bestFrom: "Northern Hemisphere" },
  { name: "Lyrids", startMonth: 4, startDay: 14, endMonth: 4, endDay: 30, peakMonth: 4, peakDay: 22, zhr: 18, parent: "Comet C/1861 G1 Thatcher", bestFrom: "Northern Hemisphere" },
  { name: "Eta Aquariids", startMonth: 4, startDay: 19, endMonth: 5, endDay: 28, peakMonth: 5, peakDay: 5, zhr: 50, parent: "Comet 1P/Halley", bestFrom: "Southern Hemisphere" },
  { name: "Southern Delta Aquariids", startMonth: 7, startDay: 12, endMonth: 8, endDay: 23, peakMonth: 7, peakDay: 30, zhr: 25, parent: "Comet 96P/Machholz", bestFrom: "Southern tropics" },
  { name: "Perseids", startMonth: 7, startDay: 17, endMonth: 8, endDay: 24, peakMonth: 8, peakDay: 12, zhr: 100, parent: "Comet 109P/Swift-Tuttle", bestFrom: "Northern Hemisphere" },
  { name: "Orionids", startMonth: 10, startDay: 2, endMonth: 11, endDay: 7, peakMonth: 10, peakDay: 21, zhr: 20, parent: "Comet 1P/Halley", bestFrom: "Both hemispheres" },
  { name: "Leonids", startMonth: 11, startDay: 6, endMonth: 11, endDay: 30, peakMonth: 11, peakDay: 17, zhr: 15, parent: "Comet 55P/Tempel–Tuttle", bestFrom: "Both hemispheres" },
  { name: "Geminids", startMonth: 12, startDay: 4, endMonth: 12, endDay: 20, peakMonth: 12, peakDay: 14, zhr: 150, parent: "Asteroid 3200 Phaethon", bestFrom: "Both hemispheres" },
  { name: "Ursids", startMonth: 12, startDay: 16, endMonth: 12, endDay: 26, peakMonth: 12, peakDay: 22, zhr: 10, parent: "Comet 8P/Tuttle", bestFrom: "Northern Hemisphere" },
];

/** Is the shower's annual window active on this date (wraps around New Year). */
export function isShowerActive(s: MeteorShower, date: Date): boolean {
  const y = date.getFullYear();
  const start = new Date(y, s.startMonth - 1, s.startDay);
  const end = new Date(s.endMonth < s.startMonth ? y + 1 : y, s.endMonth - 1, s.endDay);
  return date >= start && date <= end;
}

export interface Eclipse {
  date: string; // ISO
  kind: "solar" | "lunar";
  type: string; // Total / Annular / Partial / Penumbral
  magnitude: string;
  path: string;
  note?: string;
}

/* Next eclipse season from late 2026 onward. */
export const UPCOMING_ECLIPSES: Eclipse[] = [
  { date: "2027-02-06", kind: "solar", type: "Annular", magnitude: "0.928", path: "Southern Chile → Argentina → Atlantic", note: "Ring of fire over Patagonia" },
  { date: "2027-02-20", kind: "lunar", type: "Penumbral", magnitude: "0.928", path: "Americas, Europe, Africa" },
  { date: "2027-08-02", kind: "solar", type: "Total", magnitude: "1.079", path: "Spain → Morocco → Egypt → Saudi Arabia", note: "6m 23s of totality — the longest until 2114" },
  { date: "2027-08-17", kind: "lunar", type: "Penumbral", magnitude: "0.905", path: "Pacific, Americas" },
  { date: "2028-01-12", kind: "solar", type: "Partial", magnitude: "0.437", path: "North America, Atlantic" },
  { date: "2028-07-22", kind: "solar", type: "Total", magnitude: "1.056", path: "Australia → New Zealand", note: "Totality over Sydney" },
  { date: "2028-12-31", kind: "lunar", type: "Total", magnitude: "1.246", path: "Europe, Africa, Asia", note: "New Year's Eve total lunar eclipse" },
];
