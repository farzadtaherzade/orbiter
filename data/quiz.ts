export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  category: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which planet in the Solar System has the most confirmed moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    answer: 1,
    explanation:
      "Saturn leads with 274 recognized moons (2025), overtaking Jupiter's 95 after 128 newly confirmed detections were announced in March 2025.",
    category: "Solar System",
  },
  {
    question: "How long does sunlight take to reach Earth?",
    options: ["8 seconds", "80 seconds", "8 minutes 20 seconds", "8 hours"],
    answer: 2,
    explanation:
      "Light travels 150 million km (1 AU) in about 499 seconds — roughly 8 minutes 20 seconds. You always see the Sun as it was, not as it is.",
    category: "Physics",
  },
  {
    question: "How long does one orbit of the International Space Station take?",
    options: ["~45 minutes", "~92 minutes", "~4 hours", "~24 hours"],
    answer: 1,
    explanation:
      "At ~400 km altitude and 27,600 km/h, the ISS completes an orbit in about 92 minutes — astronauts see 16 sunrises and sunsets per day.",
    category: "Human Spaceflight",
  },
  {
    question: "Who was the first human in space?",
    options: ["Neil Armstrong", "Alan Shepard", "Yuri Gagarin", "John Glenn"],
    answer: 2,
    explanation:
      "Soviet cosmonaut Yuri Gagarin orbited Earth aboard Vostok 1 on April 12, 1961 — a 108-minute flight that opened human spaceflight.",
    category: "History",
  },
  {
    question: "Which planet is the hottest in the Solar System?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    answer: 1,
    explanation:
      "Venus, not Mercury. Its 92-bar CO₂ atmosphere drives a runaway greenhouse effect, holding surface temperatures near 464 °C — hot enough to melt lead.",
    category: "Solar System",
  },
  {
    question: "A light-year measures…",
    options: ["Time", "Brightness", "Distance", "Mass"],
    answer: 2,
    explanation:
      "A light-year is the distance light covers in one year: about 9.46 trillion kilometers. The nearest star system, Alpha Centauri, is 4.24 light-years away.",
    category: "Physics",
  },
  {
    question: "On which planet does a single day last longer than its entire year?",
    options: ["Venus", "Mercury", "Uranus", "Neptune"],
    answer: 0,
    explanation:
      "Venus rotates once every 243 Earth days but orbits the Sun in 225. Its rotation is also retrograde — the Sun rises in the west there.",
    category: "Solar System",
  },
  {
    question: "The Great Red Spot on Jupiter is…",
    options: [
      "A volcanic caldera",
      "A storm larger than Earth, raging for centuries",
      "An impact crater",
      "A shadow of Jupiter's moons",
    ],
    answer: 1,
    explanation:
      "It's a high-pressure anticyclone wider than Earth, observed continuously since at least 1831 and possibly since the 1660s.",
    category: "Solar System",
  },
  {
    question: "What is the boundary around a black hole beyond which nothing can escape?",
    options: ["Photosphere", "Corona", "Event horizon", "Chromosphere"],
    answer: 2,
    explanation:
      "The event horizon is the point of no return where escape velocity exceeds light speed. Nothing inside — not even light — can ever exit.",
    category: "Astrophysics",
  },
  {
    question: "Where did NASA's Perseverance rover land on Mars?",
    options: ["Gale Crater", "Jezero Crater", "Utopia Planitia", "Hellas Basin"],
    answer: 1,
    explanation:
      "Jezero Crater — an ancient lake bed with a preserved river delta, chosen for its astrobiology potential. Curiosity landed in Gale Crater in 2012.",
    category: "Mars",
  },
  {
    question: "The observable universe is approximately how wide?",
    options: ["13.8 billion light-years", "93 billion light-years", "4.2 billion light-years", "1 trillion light-years"],
    answer: 1,
    explanation:
      "Cosmic expansion carried the earliest light-emitting regions far beyond 13.8 billion light-years — the observable volume is ~93 billion light-years across.",
    category: "Cosmology",
  },
  {
    question: "What is the most abundant element in the universe?",
    options: ["Oxygen", "Carbon", "Hydrogen", "Helium"],
    answer: 2,
    explanation:
      "Hydrogen — about 74% of ordinary matter by mass, forged in the Big Bang. Helium is second at ~24%.",
    category: "Cosmology",
  },
  {
    question: "What did NASA's DART mission demonstrate in 2022?",
    options: [
      "Fusion power in orbit",
      "Deflecting an asteroid by kinetic impact",
      "Mining an asteroid",
      "Landing on a comet",
    ],
    answer: 1,
    explanation:
      "DART struck asteroid Dimorphos at ~22,500 km/h and shortened its orbit around Didymos by 32–33 minutes — humanity's first successful planetary-defense test.",
    category: "Planetary Defense",
  },
  {
    question: "Betelgeuse, the bright red star in Orion, is a…",
    options: ["White dwarf", "Red supergiant", "Neutron star", "Main-sequence dwarf"],
    answer: 1,
    explanation:
      "A red supergiant roughly 700–1,000 times the Sun's diameter. If placed at the Sun's position, its surface would reach past Jupiter's orbit.",
    category: "Stars",
  },
  {
    question: "The James Webb Space Telescope primarily observes which part of the spectrum?",
    options: ["X-ray", "Ultraviolet", "Visible light", "Infrared"],
    answer: 3,
    explanation:
      "Infrared (0.6–28.3 µm). Redshifted light from the first galaxies, and exoplanet thermal emission, are best seen in IR — so Webb's instruments are chilled below 40 K at L2.",
    category: "Astrophysics",
  },
];
