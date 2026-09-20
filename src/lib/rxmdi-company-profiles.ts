export type CompanyProfile = {
  ticker: string;
  name: string;
  shortName: string;
  category: string;
  listing: string;
  logo: string;
  summary: string;
  business: string[];
  verifiedFacts: { label: string; value: string }[];
  sourceLabel: string;
  sourceUrl: string;
};

export const companyProfiles: Record<string, CompanyProfile> = {
  AADI: {
    ticker: "AADI",
    name: "PT Adaro Andalan Indonesia Tbk",
    shortName: "Adaro Andalan Indonesia",
    category: "COAL",
    listing: "IDX: AADI",
    logo: "/company-logos/aadi.png",
    summary:
      "Indonesian coal mining company within the Adaro group ecosystem, with operating exposure centered on thermal coal production and related mining activities.",
    business: [
      "Coal mining",
      "Mining operations",
      "Coal sales",
      "Integrated mining activities",
    ],
    verifiedFacts: [
      { label: "PUBLIC MARKET", value: "Indonesia Stock Exchange" },
      { label: "TICKER", value: "AADI" },
      { label: "CORE EXPOSURE", value: "Coal mining" },
      { label: "CURRENT RX MDI PATH", value: "Live investigation case" },
    ],
    sourceLabel: "Adaro Andalan Indonesia official corporate materials",
    sourceUrl: "https://adaroindonesia.com/",
  },
  BUMI: {
    ticker: "BUMI",
    name: "PT Bumi Resources Tbk",
    shortName: "Bumi Resources",
    category: "COAL / MINING",
    listing: "IDX: BUMI",
    logo: "/company-logos/bumi-resources.png",
    summary:
      "Indonesian energy and mining company with major coal operations through subsidiaries including Kaltim Prima Coal and Arutmin Indonesia.",
    business: [
      "Coal mining",
      "Energy & mining operations",
      "Minerals / non-coal interests",
    ],
    verifiedFacts: [
      { label: "PUBLIC MARKET", value: "Indonesia Stock Exchange" },
      { label: "TICKER", value: "BUMI" },
      { label: "CORE EXPOSURE", value: "Coal mining" },
      { label: "MAJOR COAL UNITS", value: "KPC · Arutmin" },
    ],
    sourceLabel: "BUMI official company profile",
    sourceUrl: "https://www.bumiresources.com/en/about-us",
  },

  ADRO: {
    ticker: "ADRO",
    name: "PT Alamtri Resources Indonesia Tbk",
    shortName: "AlamTri Resources Indonesia",
    category: "MINING / ENERGY",
    listing: "IDX: ADRO",
    logo: "/company-logos/adro.png",
    summary:
      "Public holding company focused on metallurgical coal mining, mineral processing, mining services, power generation, and renewable-energy businesses.",
    business: [
      "Metallurgical coal",
      "Mineral processing",
      "Mining services",
      "Power & renewable energy",
    ],
    verifiedFacts: [
      { label: "PUBLIC MARKET", value: "Indonesia Stock Exchange" },
      { label: "TICKER", value: "ADRO" },
      { label: "STRUCTURE", value: "Holding company" },
      { label: "BUSINESS PILLARS", value: "AlamTri Geo · AlamTri Eco" },
    ],
    sourceLabel: "AlamTri official corporate overview",
    sourceUrl: "https://www.alamtri.com/",
  },

  ITMG: {
    ticker: "ITMG",
    name: "PT Indo Tambangraya Megah Tbk",
    shortName: "Indo Tambangraya Megah",
    category: "COAL / ENERGY",
    listing: "IDX: ITMG",
    logo: "/company-logos/itmg.png",
    summary:
      "Mining and energy company whose subsidiaries operate across coal mining, mining services, coal trading, fuel trading, energy marketing, and power generation.",
    business: [
      "Coal mining",
      "Mining services",
      "Coal & fuel trading",
      "Energy & power generation",
    ],
    verifiedFacts: [
      { label: "PUBLIC MARKET", value: "Indonesia Stock Exchange" },
      { label: "TICKER", value: "ITMG" },
      { label: "CORE EXPOSURE", value: "Coal & energy" },
      { label: "HEAD OFFICE", value: "Jakarta" },
    ],
    sourceLabel: "ITMG official financial statements / company information",
    sourceUrl: "https://www.itmg.co.id/",
  },

  PTBA: {
    ticker: "PTBA",
    name: "PT Bukit Asam (Persero) Tbk",
    shortName: "Bukit Asam",
    category: "COAL",
    listing: "IDX: PTBA",
    logo: "/company-logos/ptba.png",
    summary:
      "Indonesian state-owned coal mining company with an integrated business spanning mining, processing, logistics, trading, and related energy activities.",
    business: [
      "Coal mining",
      "Coal processing",
      "Logistics & trading",
      "Energy-related activities",
    ],
    verifiedFacts: [
      { label: "PUBLIC MARKET", value: "Indonesia Stock Exchange" },
      { label: "TICKER", value: "PTBA" },
      { label: "CORE EXPOSURE", value: "Coal" },
      { label: "STATUS", value: "Persero / state-owned" },
    ],
    sourceLabel: "PTBA official company information",
    sourceUrl: "https://www.ptba.co.id/",
  },

  ANTM: {
    ticker: "ANTM",
    name: "PT Aneka Tambang Tbk",
    shortName: "ANTAM",
    category: "DIVERSIFIED MINING",
    listing: "IDX: ANTM",
    logo: "/company-logos/antm.png",
    summary:
      "Indonesian diversified mining and minerals-processing company with vertically integrated activities from exploration and mining through processing, marketing, and trading.",
    business: [
      "Nickel",
      "Gold",
      "Bauxite",
      "Minerals processing & trading",
    ],
    verifiedFacts: [
      { label: "PUBLIC MARKET", value: "Indonesia Stock Exchange" },
      { label: "TICKER", value: "ANTM" },
      { label: "CORE EXPOSURE", value: "Nickel · Gold · Bauxite" },
      { label: "BUSINESS MODEL", value: "Integrated mining & processing" },
    ],
    sourceLabel: "ANTAM official company information",
    sourceUrl: "https://www.antam.com/",
  },
};
