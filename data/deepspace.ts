/* Featured deep-sky objects — image queries target the NASA Image Library. */

export interface DeepSkyObject {
  name: string;
  catalog: string;
  kind: "Nebula" | "Galaxy" | "Black Hole" | "Star Cluster" | "Galaxy Cluster";
  distance: string;
  size: string;
  constellation: string;
  description: string;
  fact: string;
  imageQuery: string;
  accent: string;
}

export const DEEP_SKY_OBJECTS: DeepSkyObject[] = [
  {
    name: "Orion Nebula",
    catalog: "M42",
    kind: "Nebula",
    distance: "1,344 light-years",
    size: "24 light-years",
    constellation: "Orion",
    description:
      "The closest massive star factory to Earth — thousands of young stars igniting inside a glowing womb of hydrogen gas, visible to the naked eye as the middle 'star' of Orion's sword.",
    fact: "The Trapezium cluster at its core is younger than 2 million years.",
    imageQuery: "orion nebula",
    accent: "#7dd3fc",
  },
  {
    name: "Eagle Nebula — Pillars of Creation",
    catalog: "M16",
    kind: "Nebula",
    distance: "6,500 light-years",
    size: "7 light-years (pillars)",
    constellation: "Serpens",
    description:
      "Towers of cold gas and dust being simultaneously eroded and illuminated by newborn stars. Re-imaged by JWST in 2022, revealing embedded protostars in infrared.",
    fact: "The pillars we photograph may already have been destroyed by a supernova.",
    imageQuery: "pillars of creation eagle nebula",
    accent: "#4ade80",
  },
  {
    name: "Andromeda Galaxy",
    catalog: "M31",
    kind: "Galaxy",
    distance: "2.5 million light-years",
    size: "220,000 light-years",
    constellation: "Andromeda",
    description:
      "Our nearest large galactic neighbor — a trillion stars in a spiral 2.5 million light-years away, the farthest object visible to the unaided eye.",
    fact: "It will merge with the Milky Way in ~4.5 billion years.",
    imageQuery: "andromeda galaxy",
    accent: "#c084fc",
  },
  {
    name: "M87* — First Black Hole Photographed",
    catalog: "Virgo A",
    kind: "Black Hole",
    distance: "53.5 million light-years",
    size: "Event horizon ~40 billion km",
    constellation: "Virgo",
    description:
      "The supermassive black hole at the heart of galaxy M87, imaged by the Event Horizon Telescope in April 2019. Its mass is 6.5 billion Suns, and its jet extends 5,000 light-years.",
    fact: "The EHT's resolving power was equivalent to reading a newspaper in New York from Paris.",
    imageQuery: "black hole m87 event horizon",
    accent: "#fb923c",
  },
  {
    name: "Sagittarius A*",
    catalog: "Sgr A*",
    kind: "Black Hole",
    distance: "26,000 light-years",
    size: "4.3 million solar masses",
    constellation: "Sagittarius",
    description:
      "The Milky Way's own central black hole, imaged by the EHT in 2022. Stars orbiting it at up to 3% of light speed were the key evidence for its existence (2020 Nobel Prize).",
    fact: "It swallows surprisingly little — accreting less than 1% of nearby gas.",
    imageQuery: "sagittarius a black hole galactic center",
    accent: "#f472b6",
  },
  {
    name: "Crab Nebula",
    catalog: "M1",
    kind: "Nebula",
    distance: "6,500 light-years",
    size: "11 light-years",
    constellation: "Taurus",
    description:
      "The wreckage of a supernova witnessed by Chinese astronomers in 1054 CE. At its heart spins a pulsar 30 times per second, powering the nebula like a lighthouse.",
    fact: "Expansion is still measurable from year to year — 1,500 km/s.",
    imageQuery: "crab nebula supernova",
    accent: "#93c5fd",
  },
  {
    name: "Whirlpool Galaxy",
    catalog: "M51",
    kind: "Galaxy",
    distance: "31 million light-years",
    size: "76,000 light-years",
    constellation: "Canes Venatici",
    description:
      "The textbook grand-design spiral, sharpened by a gravitational duet with its companion galaxy NGC 5195 tugging at one arm.",
    fact: "The first 'nebula' in which a spiral structure was recognized (1845, Lord Rosse).",
    imageQuery: "whirlpool galaxy m51",
    accent: "#67e8f9",
  },
  {
    name: "Webb's First Deep Field",
    catalog: "SMACS 0723",
    kind: "Galaxy Cluster",
    distance: "4.6 billion light-years (lens)",
    size: "Contains galaxies 13+ Gly away",
    constellation: "Volans",
    description:
      "Thousands of galaxies in a patch of sky the size of a grain of sand held at arm's length. Foreground cluster mass bends spacetime itself, magnifying the universe behind it.",
    fact: "Some arcs within it show galaxies as they were 13.1 billion years ago.",
    imageQuery: "webb deep field smacs",
    accent: "#a5b4fc",
  },
];
