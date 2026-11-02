/* Mission fact base — dates, outcomes and status per NASA mission pages
   (nasa.gov, jpl.nasa.gov). status: "active" | "completed" | "upcoming". */

export interface Mission {
  id: string;
  name: string;
  agency: string;
  status: "active" | "completed" | "upcoming";
  launch: string;
  end?: string;
  target: string;
  type: "Planetary" | "Deep Space" | "Human Spaceflight" | "Astrophysics" | "Earth Science" | "Planetary Defense";
  highlight: string;
  description: string;
  fact: string;
  sourceUrl: string;
  imageQuery: string;
}

export const MISSIONS: Mission[] = [
  {
    id: "apollo11",
    name: "Apollo 11",
    agency: "NASA",
    status: "completed",
    launch: "Jul 16, 1969",
    end: "Jul 24, 1969",
    target: "The Moon",
    type: "Human Spaceflight",
    highlight: "First crewed landing on another world",
    description:
      "Armstrong and Aldrin spent 21.5 hours on the lunar surface in the Eagle lander while Collins orbited above. Returned 21.5 kg of lunar samples.",
    fact: "The landing had roughly 30 seconds of fuel margin remaining.",
    sourceUrl: "https://www.nasa.gov/mission/apollo-11/",
    imageQuery: "apollo 11 moon surface",
  },
  {
    id: "voyager1",
    name: "Voyager 1",
    agency: "NASA/JPL",
    status: "active",
    launch: "Sep 5, 1977",
    target: "Interstellar space",
    type: "Deep Space",
    highlight: "The most distant human-made object",
    description:
      "After touring Jupiter and Saturn, Voyager 1 crossed the heliopause in August 2012 and is now returning data from interstellar space. Its 1970s-era RTG still powers four instruments.",
    fact: "Signals take more than 23 hours one-way at light speed.",
    sourceUrl: "https://science.nasa.gov/mission/voyager/",
    imageQuery: "voyager spacecraft jupiter",
  },
  {
    id: "voyager2",
    name: "Voyager 2",
    agency: "NASA/JPL",
    status: "active",
    launch: "Aug 20, 1977",
    target: "Interstellar space",
    type: "Deep Space",
    highlight: "The only spacecraft to visit Uranus and Neptune",
    description:
      "The grand tour: Jupiter (1979), Saturn (1981), Uranus (1986), Neptune (1989) — then the heliopause in November 2018. Still transmitting from interstellar space.",
    fact: "Discovered 16 moons and the Great Dark Spot of Neptune.",
    sourceUrl: "https://science.nasa.gov/mission/voyager/",
    imageQuery: "voyager neptune",
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    agency: "NASA/ESA",
    status: "active",
    launch: "Apr 24, 1990",
    target: "Low Earth orbit",
    type: "Astrophysics",
    highlight: "Three decades of cosmic discovery",
    description:
      "After a 1993 servicing mission corrected its mirror, Hubble delivered the Deep Fields, refined the expansion rate of the universe, and still performs ~1.3 million observations per year.",
    fact: "Has made over 1.6 million observations of 50,000+ celestial targets.",
    sourceUrl: "https://science.nasa.gov/mission/hubble/",
    imageQuery: "hubble telescope galaxy",
  },
  {
    id: "iss",
    name: "International Space Station",
    agency: "NASA/ESA/JAXA/CSA/Roscosmos",
    status: "active",
    launch: "Nov 20, 1998",
    target: "Low Earth orbit",
    type: "Human Spaceflight",
    highlight: "Continuously crewed since November 2000",
    description:
      "A 109-meter orbital laboratory assembling physics, biology and Earth science in microgravity, orbiting every ~92 minutes at 400 km altitude.",
    fact: "Has been visited by astronauts from more than 20 countries.",
    sourceUrl: "https://www.nasa.gov/international-space-station/",
    imageQuery: "international space station orbit",
  },
  {
    id: "cassini",
    name: "Cassini–Huygens",
    agency: "NASA/ESA/ASI",
    status: "completed",
    launch: "Oct 15, 1997",
    end: "Sep 15, 2017",
    target: "Saturn system",
    type: "Planetary",
    highlight: "13 years orbiting Saturn; landed on Titan",
    description:
      "Discovered water-ice geysers on Enceladus and methane lakes on Titan, then dove between Saturn and its rings 22 times before its Grand Finale atmospheric entry.",
    fact: "Huygens is the most distant landing of any human spacecraft.",
    sourceUrl: "https://science.nasa.gov/mission/cassini/",
    imageQuery: "cassini saturn rings",
  },
  {
    id: "curiosity",
    name: "Mars Science Laboratory — Curiosity",
    agency: "NASA/JPL",
    status: "active",
    launch: "Nov 26, 2011",
    target: "Mars — Gale Crater",
    type: "Planetary",
    highlight: "Reading a billion years of Martian climate history",
    description:
      "The car-sized rover sky-crane landed in Gale Crater in August 2012 and has been climbing Mount Sharp since, documenting ancient lakes and organic chemistry.",
    fact: "Confirms Mars once held long-lived habitable freshwater environments.",
    sourceUrl: "https://science.nasa.gov/mission/msl-curiosity/",
    imageQuery: "curiosity rover mars",
  },
  {
    id: "newhorizons",
    name: "New Horizons",
    agency: "NASA/APL",
    status: "active",
    launch: "Jan 19, 2006",
    target: "Pluto & Kuiper Belt",
    type: "Planetary",
    highlight: "First exploration of Pluto",
    description:
      "Revealed Pluto's nitrogen glaciers and hazy blue atmosphere in July 2015, then flew past the contact binary Arrokoth on New Year's Day 2019.",
    fact: "Launched at the highest departure speed of any spacecraft.",
    sourceUrl: "https://science.nasa.gov/mission/new-horizons/",
    imageQuery: "pluto new horizons",
  },
  {
    id: "parker",
    name: "Parker Solar Probe",
    agency: "NASA/APL",
    status: "active",
    launch: "Aug 12, 2018",
    target: "The Sun's corona",
    type: "Deep Space",
    highlight: "First spacecraft to 'touch' the Sun",
    description:
      "Using repeated Venus gravity assists, Parker dips inside the corona to sample the solar wind where it is born, protected by an 11.4 cm carbon heat shield.",
    fact: "Flew within 6.1 million km of the surface at 191 km/s — the fastest human-made object.",
    sourceUrl: "https://science.nasa.gov/mission/parker-solar-probe/",
    imageQuery: "parker solar probe sun corona",
  },
  {
    id: "perseverance",
    name: "Mars 2020 — Perseverance & Ingenuity",
    agency: "NASA/JPL",
    status: "active",
    launch: "Jul 30, 2020",
    target: "Mars — Jezero Crater",
    type: "Planetary",
    highlight: "Caching samples for Earth return; first flight on Mars",
    description:
      "Perseverance is collecting rock cores from an ancient river delta. Its helicopter Ingenuity made 72 powered flights before its rotor ended service in January 2024.",
    fact: "MOXIE produced breathable oxygen from Martian CO₂.",
    sourceUrl: "https://science.nasa.gov/mission/mars-2020-perseverance/",
    imageQuery: "perseverance rover jezero",
  },
  {
    id: "jwst",
    name: "James Webb Space Telescope",
    agency: "NASA/ESA/CSA",
    status: "active",
    launch: "Dec 25, 2021",
    target: "Sun–Earth L2",
    type: "Astrophysics",
    highlight: "Infrared views of the first galaxies",
    description:
      "A 6.5-meter segmented gold-coated mirror observing from beyond the Moon at L2. It studies exoplanet atmospheres, star formation and galaxies from the universe's first 300 million years.",
    fact: "Must be kept below −233 °C, shielded by a tennis-court-sized sunshield.",
    sourceUrl: "https://science.nasa.gov/mission/webb/",
    imageQuery: "james webb telescope nebula",
  },
  {
    id: "artemis1",
    name: "Artemis I",
    agency: "NASA",
    status: "completed",
    launch: "Nov 16, 2022",
    end: "Dec 11, 2022",
    target: "Lunar flyby",
    type: "Human Spaceflight",
    highlight: "SLS and Orion qualified for crewed flight",
    description:
      "An uncrewed Orion capsule flew around the Moon and returned at 39,900 km/h, testing the heat shield for Artemis II and III.",
    fact: "Orion traveled farther from Earth than any previous crew-capable spacecraft.",
    sourceUrl: "https://www.nasa.gov/mission/artemis-i/",
    imageQuery: "artemis SLS orion moon",
  },
  {
    id: "dart",
    name: "DART",
    agency: "NASA/APL",
    status: "completed",
    launch: "Nov 24, 2021",
    end: "Sep 26, 2022",
    target: "Asteroid Dimorphos",
    type: "Planetary Defense",
    highlight: "Humanity's first planetary-defense impact",
    description:
      "DART struck the moonlet of asteroid 65803 Didymos at 22,500 km/h and shortened its orbital period by 32–33 minutes — proving kinetic deflection works.",
    fact: "Impact momentum was amplified ~3× by recoil of ejected debris.",
    sourceUrl: "https://science.nasa.gov/mission/dart/",
    imageQuery: "dart asteroid impact dimorphos",
  },
  {
    id: "osirisrex",
    name: "OSIRIS-REx → OSIRIS-APEX",
    agency: "NASA",
    status: "active",
    launch: "Sep 8, 2016",
    target: "Asteroid Bennu → Apophis",
    type: "Planetary",
    highlight: "Returned 121.6 g of pristine asteroid",
    description:
      "The first U.S. asteroid sample return landed at Utah Test Range in September 2023 with Bennu material rich in water and organics. The spacecraft now flies on to Apophis.",
    fact: "Bennu samples contain phosphates suggestive of an ocean-world origin.",
    sourceUrl: "https://science.nasa.gov/mission/osiris-rex/",
    imageQuery: "osiris rex asteroid bennu",
  },
  {
    id: "lucy",
    name: "Lucy",
    agency: "NASA",
    status: "active",
    launch: "Oct 16, 2021",
    target: "Jupiter Trojan asteroids",
    type: "Planetary",
    highlight: "A 12-year tour of eight asteroids",
    description:
      "Lucy will fly by one main-belt and seven Trojan asteroids — fossils of planet formation trapped in Jupiter's orbit — through 2033.",
    fact: "Named for the fossil that rewrote human origins; so too may the Trojans.",
    sourceUrl: "https://science.nasa.gov/mission/lucy/",
    imageQuery: "lucy spacecraft trojan asteroid",
  },
  {
    id: "europaclipper",
    name: "Europa Clipper",
    agency: "NASA/JPL",
    status: "active",
    launch: "Oct 14, 2024",
    target: "Jupiter's moon Europa",
    type: "Planetary",
    highlight: "Hunting habitability beneath an ice shell",
    description:
      "The largest spacecraft NASA has built for a planetary mission. After a Mars assist in 2025 it cruises to Jupiter, arriving 2030 for ~49 flybys of Europa.",
    fact: "Its ice-penetrating radar will sound Europa's shell down to the ocean.",
    sourceUrl: "https://science.nasa.gov/mission/europa-clipper/",
    imageQuery: "europa clipper jupiter ice",
  },
];
