// Static dataset — demand scores updated daily by scraper via useLiveData hook

export const DATA = [
  {
    id: 1, name: "Pflegefachmann", nameEn: "Nursing Professional",
    industry: "Healthcare", icon: "🏥",
    demand: 97, competition: 22, acceptance: 91,
    salaryMin: 1200, salaryMax: 1400, salaryScore: 72, growth: 95,
    langLevel: "B1", langScore: 70,
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
    description: "Acute shortage across all German states. Federal programs actively recruit international nurses. Fast-track recognition pathways available.",
    tags: ["High Demand", "Easy Entry", "Job Security"], shortage: 38,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Pflegefachmann",
      ausbildungDe:"https://www.ausbildung.de/berufe/pflegefachmann/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-pflegefachmann/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/pflegefachmann",
    },
  },
  {
    id: 2, name: "Fachinformatiker", nameEn: "IT Specialist",
    industry: "IT", icon: "💻",
    demand: 94, competition: 58, acceptance: 72,
    salaryMin: 1000, salaryMax: 1200, salaryScore: 65, growth: 98,
    langLevel: "B2", langScore: 60,
    cities: ["Berlin", "Munich", "Hamburg", "Stuttgart", "Düsseldorf"],
    description: "Germany's most future-proof Ausbildung. Tech sector growth outpacing talent supply. Remote work options post-qualification.",
    tags: ["Future-Proof", "High Growth", "Remote Possible"], shortage: 31,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Fachinformatiker",
      ausbildungDe:"https://www.ausbildung.de/berufe/fachinformatiker/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-fachinformatiker/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/fachinformatiker",
    },
  },
  {
    id: 3, name: "Mechatroniker", nameEn: "Mechatronics Technician",
    industry: "Engineering", icon: "⚙️",
    demand: 88, competition: 45, acceptance: 78,
    salaryMin: 900, salaryMax: 1100, salaryScore: 60, growth: 85,
    langLevel: "B1", langScore: 70,
    cities: ["Stuttgart", "Munich", "Wolfsburg", "Ingolstadt", "Bremen"],
    description: "Core of German manufacturing excellence. Automotive and robotics sectors guarantee long-term demand. BMW, VW, Bosch actively hiring.",
    tags: ["Manufacturing", "Automotive", "Stable"], shortage: 29,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Mechatroniker",
      ausbildungDe:"https://www.ausbildung.de/berufe/mechatroniker/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-mechatroniker/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/mechatroniker",
    },
  },
  {
    id: 4, name: "Elektroniker", nameEn: "Electronics Technician",
    industry: "Engineering", icon: "⚡",
    demand: 91, competition: 38, acceptance: 83,
    salaryMin: 950, salaryMax: 1150, salaryScore: 62, growth: 88,
    langLevel: "B1", langScore: 70,
    cities: ["Munich", "Stuttgart", "Frankfurt", "Nuremberg", "Dresden"],
    description: "Energy transition (Energiewende) creating explosive demand. Solar, wind, and smart grid infrastructure all require trained Elektroniker.",
    tags: ["Green Energy", "High Demand", "Future-Proof"], shortage: 34,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Elektroniker",
      ausbildungDe:"https://www.ausbildung.de/berufe/elektroniker/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-elektroniker/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/elektroniker",
    },
  },
  {
    id: 5, name: "Industriemechaniker", nameEn: "Industrial Mechanic",
    industry: "Engineering", icon: "🔧",
    demand: 86, competition: 35, acceptance: 85,
    salaryMin: 900, salaryMax: 1050, salaryScore: 58, growth: 80,
    langLevel: "A2", langScore: 85,
    cities: ["Ruhr Area", "Stuttgart", "Munich", "Hannover", "Leipzig"],
    description: "One of the lowest language barriers for technical trades. Hands-on work means A2 German is often sufficient to start.",
    tags: ["Low Language Req.", "Easy Entry", "Manual Trades"], shortage: 27,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Industriemechaniker",
      ausbildungDe:"https://www.ausbildung.de/berufe/industriemechaniker/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-industriemechaniker/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/industriemechaniker",
    },
  },
  {
    id: 6, name: "Fachkraft Lagerlogistik", nameEn: "Warehouse Logistics",
    industry: "Logistics", icon: "📦",
    demand: 89, competition: 28, acceptance: 88,
    salaryMin: 850, salaryMax: 1000, salaryScore: 52, growth: 76,
    langLevel: "A2", langScore: 85,
    cities: ["Berlin", "Hamburg", "Frankfurt", "Cologne", "Leipzig"],
    description: "E-commerce boom driving unprecedented demand. Amazon, DHL, DB Schenker offering Ausbildung with immediate employment.",
    tags: ["Easiest Entry", "A2 German", "Immediate Jobs"], shortage: 33,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Fachkraft+f%C3%BCr+Lagerlogistik",
      ausbildungDe:"https://www.ausbildung.de/berufe/fachkraft-lagerlogistik/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-fachkraft-lagerlogistik/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/fachkraft-fuer-lagerlogistik",
    },
  },
  {
    id: 7, name: "Altenpflege", nameEn: "Elderly Care",
    industry: "Healthcare", icon: "❤️",
    demand: 96, competition: 18, acceptance: 93,
    salaryMin: 1100, salaryMax: 1350, salaryScore: 68, growth: 92,
    langLevel: "B1", langScore: 70,
    cities: ["All major cities", "Rural areas", "Bavaria", "NRW"],
    description: "Aging demographic creates structural, permanent demand. Highest acceptance rate among international applicants. State-funded training available.",
    tags: ["Highest Acceptance", "Permanent Demand", "State Support"], shortage: 42,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Altenpfleger",
      ausbildungDe:"https://www.ausbildung.de/berufe/altenpfleger/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-altenpfleger/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/altenpfleger",
    },
  },
  {
    id: 8, name: "Kfz-Mechatroniker", nameEn: "Automotive Mechatronics",
    industry: "Automotive", icon: "🚗",
    demand: 85, competition: 52, acceptance: 74,
    salaryMin: 900, salaryMax: 1100, salaryScore: 60, growth: 78,
    langLevel: "B1", langScore: 70,
    cities: ["Stuttgart", "Munich", "Wolfsburg", "Ingolstadt", "Cologne"],
    description: "EV transition creating demand for retraining. Hybrid expertise commands premium. Dealerships competing for talent across Germany.",
    tags: ["Automotive", "EV Transition", "Premium Brands"], shortage: 25,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Kfz-Mechatroniker",
      ausbildungDe:"https://www.ausbildung.de/berufe/kfz-mechatroniker/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-kfz-mechatroniker/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/kfz-mechatroniker",
    },
  },
  {
    id: 9, name: "Hotelfachmann", nameEn: "Hotel Management",
    industry: "Hospitality", icon: "🏨",
    demand: 78, competition: 62, acceptance: 68,
    salaryMin: 750, salaryMax: 950, salaryScore: 45, growth: 72,
    langLevel: "B2", langScore: 60,
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Heidelberg"],
    description: "Tourism recovery post-COVID driving hiring surge. International applicants with English skills have strong advantage in city hotels.",
    tags: ["Tourism Rebound", "English Advantage", "International"], shortage: 22,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Hotelfachmann",
      ausbildungDe:"https://www.ausbildung.de/berufe/hotelfachmann/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-hotelfachmann/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/hotelfachmann",
    },
  },
  {
    id: 10, name: "Bau / Maurer", nameEn: "Construction / Masonry",
    industry: "Construction", icon: "🏗️",
    demand: 92, competition: 30, acceptance: 86,
    salaryMin: 1000, salaryMax: 1200, salaryScore: 65, growth: 84,
    langLevel: "A2", langScore: 85,
    cities: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Stuttgart"],
    description: "Housing crisis means construction cannot slow down. Low language barrier, fast employment. Overtime premiums common.",
    tags: ["Housing Crisis Demand", "A2 German", "Overtime Pay"], shortage: 36,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Maurer",
      ausbildungDe:"https://www.ausbildung.de/berufe/maurer/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-maurer/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/maurer",
    },
  },
  {
    id: 11, name: "Tiefbaufacharbeiter", nameEn: "Civil Engineering Worker",
    industry: "Construction", icon: "🚧",
    demand: 93, competition: 24, acceptance: 89,
    salaryMin: 1050, salaryMax: 1250, salaryScore: 67, growth: 86,
    langLevel: "A2", langScore: 85,
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Leipzig"],
    description: "Massive infrastructure investment by German federal government (roads, rail, tunnels, pipelines). Chronic shortage with virtually no youth applicants. Ideal for international applicants with physical fitness. SOKA-BAU social fund provides extra benefits.",
    tags: ["Infrastructure Boom", "A2 German", "Federal Investment", "SOKA-BAU Benefits"], shortage: 39,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Tiefbaufacharbeiter",
      ausbildungDe:"https://www.ausbildung.de/berufe/tiefbaufacharbeiter/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-tiefbau/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/tiefbaufacharbeiter",
      extra:       "https://www.bau-berufe.eu/ausbildung/tiefbaufacharbeiter/",
    },
  },
  {
    id: 12, name: "Bauzeichner", nameEn: "Architectural / Construction Drafter",
    industry: "Construction", icon: "📐",
    demand: 84, competition: 41, acceptance: 79,
    salaryMin: 850, salaryMax: 1050, salaryScore: 56, growth: 82,
    langLevel: "B1", langScore: 70,
    cities: ["Berlin", "Munich", "Hamburg", "Stuttgart", "Düsseldorf", "Frankfurt"],
    description: "Office-based construction career — ideal for those who want to work in Bau without physical labour. Uses CAD software (AutoCAD, Revit). Specializations in Architektur, Ingenieurbau, or Tief- und Straßenbau. Growing demand as firms digitize with BIM (Building Information Modelling).",
    tags: ["Office Work", "CAD / BIM", "No Heavy Labour", "Digital Future"], shortage: 28,
    links: {
      ba:          "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=4&was=Bauzeichner",
      ausbildungDe:"https://www.ausbildung.de/berufe/bauzeichner/",
      stepstone:   "https://www.stepstone.de/jobs/ausbildung-bauzeichner/in-deutschland",
      azubi:       "https://www.azubi.de/ausbildungsplatz/bauzeichner",
    },
  },
];

export function computeScore(item) {
  return Math.round(
    0.35 * item.demand +
    0.25 * item.acceptance +
    0.20 * (100 - item.competition) +
    0.10 * item.salaryScore +
    0.10 * item.growth
  );
}

export const LANG_ORDER    = ["A1", "A2", "B1", "B2", "C1"];
export const langToNum     = (l) => LANG_ORDER.indexOf(l);
export const scoreColor    = (s) => s >= 85 ? "#22c55e" : s >= 70 ? "#f59e0b" : s >= 55 ? "#06b6d4" : "#ef4444";
export const scoreLabel    = (s) => s >= 85 ? "ELITE"   : s >= 70 ? "STRONG"  : s >= 55 ? "GOOD"    : "MODERATE";
export const industryColor = {
  Healthcare: "#ec4899", IT: "#06b6d4", Engineering: "#f59e0b",
  Automotive: "#8b5cf6", Logistics: "#10b981", Hospitality: "#f97316", Construction: "#84cc16",
};