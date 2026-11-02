/* Mars surface features, rover sites and a discovery timeline.
   Coordinates: planetographic, east-positive, per NASA/JPL datasets. */

export interface MarsFeature {
  name: string;
  kind: "volcano" | "canyon" | "crater" | "region" | "rover" | "lander";
  lat: number;
  lon: number;
  detail: string;
}

export const MARS_FEATURES: MarsFeature[] = [
  { name: "Olympus Mons", kind: "volcano", lat: 18.65, lon: 226.2, detail: "The tallest volcano in the Solar System — 21.9 km high, roughly 2.5× Everest, with a caldera ~80 km wide." },
  { name: "Valles Marineris", kind: "canyon", lat: -13.9, lon: 301.5, detail: "A canyon system over 4,000 km long and up to 7 km deep — it would stretch across the continental United States." },
  { name: "Hellas Planitia", kind: "crater", lat: -42.4, lon: 70.5, detail: "A 2,300 km impact basin 7 km deep, among the largest confirmed impact structures in the Solar System." },
  { name: "Gale Crater — Curiosity", kind: "rover", lat: -4.5895, lon: 137.44, detail: "Curiosity (NASA) landed here in August 2012. The 5.5 km mountain inside, Aeolis Mons, records ~1 billion years of Martian climate history." },
  { name: "Jezero Crater — Perseverance", kind: "rover", lat: 18.44, lon: 77.7, detail: "Perseverance (NASA) landed in February 2021 in this ancient lake bed. Its delta preserves some of the best-preserved signs of Mars's wet past." },
  { name: "Utopia Planitia — Zhurong", kind: "rover", lat: 25.1, lon: 109.9, detail: "China's Zhurong rover (CNSA) operated here from May 2021 until entering hibernation in May 2022. It found evidence of hydrated minerals at shallow depth." },
  { name: "Elysium Planitia — InSight", kind: "lander", lat: 4.5, lon: 135.62, detail: "The InSight lander (NASA) recorded over 1,300 marsquakes here from 2018 to 2022, revealing Mars has a molten outer core." },
  { name: "Elysium Mons", kind: "volcano", lat: 25.02, lon: 147.21, detail: "The largest volcano of the Elysium province — 12.6 km high, with a single 14 km caldera." },
  { name: "Tharsis Bulge", kind: "region", lat: 1.5, lon: 255.0, detail: "A volcanic plateau hosting Olympus, Ascraeus, Pavonis and Arsia Mons in a remarkable near-straight line." },
  { name: "Planum Australe (South Pole)", kind: "region", lat: -88, lon: 30, detail: "The southern ice cap — water ice beneath a seasonal CO₂ frost layer, with buried polar layered deposits." },
];

export interface Rover {
  id: "curiosity" | "perseverance" | "opportunity";
  name: string;
  agency: string;
  landed: string;
  status: "active" | "completed";
  site: string;
  distanceKm: string;
  highlights: string[];
}

export const ROVERS: Rover[] = [
  {
    id: "curiosity",
    name: "Curiosity",
    agency: "NASA · Mars Science Laboratory",
    landed: "Aug 6, 2012",
    status: "active",
    site: "Gale Crater",
    distanceKm: "30+ km",
    highlights: [
      "Confirmed ancient freshwater lake environments",
      "Detected seasonal methane cycles and organic molecules",
      "Still climbing Mount Sharp through sulfate-bearing layers",
    ],
  },
  {
    id: "perseverance",
    name: "Perseverance",
    agency: "NASA · Mars 2020",
    landed: "Feb 18, 2021",
    status: "active",
    site: "Jezero Crater",
    distanceKm: "30+ km",
    highlights: [
      "Caching rock cores for the Mars Sample Return campaign",
      "MOXIE made oxygen from atmospheric CO₂",
      "Investigating the 'Cheyava Falls' potential biosignature (2024–25)",
    ],
  },
  {
    id: "opportunity",
    name: "Opportunity",
    agency: "NASA · MER-B",
    landed: "Jan 25, 2004",
    status: "completed",
    site: "Meridiani Planum",
    distanceKm: "45.16 km",
    highlights: [
      "Operated 14.5 years on a 90-day design life",
      "Found hematite 'blueberries' — evidence of ancient water",
      "Silenced June 2018 by a planet-girdling dust storm",
    ],
  },
];

export interface MarsDiscovery {
  year: string;
  title: string;
  detail: string;
}

export const MARS_TIMELINE: MarsDiscovery[] = [
  { year: "2012", title: "Sky-crane landing", detail: "Curiosity touches down in Gale Crater using the boldest EDL system ever flown." },
  { year: "2014", title: "Organics confirmed", detail: "Curiosity finds chlorobenzene and dichloroalkanes in drilled mudstone — Martian organics at last." },
  { year: "2015", title: "Briny slopes", detail: "MRO's spectrometer links recurring slope lineae to flows of salty liquid water." },
  { year: "2018", title: "Underground ice", detail: "Radar reveals thick sheets of nearly pure water ice buried beneath mid-latitude plains." },
  { year: "2021", title: "First flight, first oxygen", detail: "Ingenuity flies on another planet; MOXIE splits Martian CO₂ into breathable oxygen." },
  { year: "2022", title: "Delta camp", detail: "Perseverance reaches Jezero's river delta — exactly the sediments astrobiologists hoped for." },
  { year: "2024", title: "Leopard spots", detail: "The 'Cheyava Falls' sample shows reaction fronts and phosphate mineralogy flagged as a potential biosignature." },
  { year: "2025", title: "Potential biosignature", detail: "NASA announces the Sapphire Canyon sample's mineral textures as its strongest candidate yet — abiotic explanations not yet ruled out." },
];
