export type CoverageState = "verified" | "partial" | "none";

export type CompanyCoverage = {
  ticker: string;
  symbol: string;
  name: string;
  route: string;
  visibleInDirectory: boolean;
  source: {
    companyDetail: CoverageState;
    financials: CoverageState;
    performance: CoverageState;
    ownership: CoverageState;
    salesDestination: CoverageState;
    market: CoverageState;
    newsTimeline: CoverageState;
    investigation: CoverageState;
  };
  notes: string[];
};

export const companyCoverageRegistry: Record<string, CompanyCoverage> = {
  AADI: {
    ticker: "AADI",
    symbol: "AADI.JK",
    name: "PT Adaro Andalan Indonesia Tbk",
    route: "/companies/AADI",
    visibleInDirectory: true,
    source: {
      companyDetail: "partial",
      financials: "partial",
      performance: "verified",
      ownership: "none",
      salesDestination: "none",
      market: "partial",
      newsTimeline: "none",
      investigation: "verified",
    },
    notes: [
      "Live mining-performance recon exists for FY2024.",
      "AADI appears in the collected BUMI peer dataset.",
      "AADI is the current live investigation case.",
    ],
  },

  BUMI: {
    ticker: "BUMI",
    symbol: "BUMI.JK",
    name: "PT Bumi Resources Tbk",
    route: "/companies/BUMI",
    visibleInDirectory: true,
    source: {
      companyDetail: "verified",
      financials: "verified",
      performance: "verified",
      ownership: "verified",
      salesDestination: "verified",
      market: "verified",
      newsTimeline: "verified",
      investigation: "partial",
    },
    notes: [
      "Golden Company Page source set is available.",
      "Collected company report, market core and 2026 timeline data exist.",
    ],
  },

  ITMG: {
    ticker: "ITMG",
    symbol: "ITMG.JK",
    name: "PT Indo Tambangraya Megah Tbk",
    route: "/companies/ITMG",
    visibleInDirectory: true,
    source: {
      companyDetail: "verified",
      financials: "verified",
      performance: "verified",
      ownership: "verified",
      salesDestination: "verified",
      market: "verified",
      newsTimeline: "none",
      investigation: "partial",
    },
    notes: [
      "Collected company detail, FY2024 financials/performance, ownership and sales destination exist.",
      "Collected market-core files exist.",
    ],
  },

  ADMR: {
    ticker: "ADMR",
    symbol: "ADMR.JK",
    name: "PT Alamtri Minerals Indonesia Tbk",
    route: "/companies/ADMR",
    visibleInDirectory: true,
    source: {
      companyDetail: "verified",
      financials: "verified",
      performance: "verified",
      ownership: "verified",
      salesDestination: "none",
      market: "partial",
      newsTimeline: "none",
      investigation: "partial",
    },
    notes: [
      "Collected company detail, FY2024 financials/performance and ownership exist.",
      "ADMR appears in the collected BUMI peer dataset.",
    ],
  },

  BYAN: {
    ticker: "BYAN",
    symbol: "BYAN.JK",
    name: "PT Bayan Resources Tbk",
    route: "/companies/BYAN",
    visibleInDirectory: true,
    source: {
      companyDetail: "verified",
      financials: "verified",
      performance: "verified",
      ownership: "verified",
      salesDestination: "verified",
      market: "verified",
      newsTimeline: "none",
      investigation: "partial",
    },
    notes: [
      "Collected company detail, FY2024 financials/performance, ownership and sales destination exist.",
      "Collected market-core files exist.",
    ],
  },

  GEMS: {
    ticker: "GEMS",
    symbol: "GEMS.JK",
    name: "PT Golden Energy Mines Tbk",
    route: "/companies/GEMS",
    visibleInDirectory: true,
    source: {
      companyDetail: "verified",
      financials: "verified",
      performance: "verified",
      ownership: "verified",
      salesDestination: "verified",
      market: "partial",
      newsTimeline: "none",
      investigation: "partial",
    },
    notes: [
      "Collected company detail, FY2024 financials/performance, ownership and sales destination exist.",
      "GEMS appears in the collected BUMI peer dataset.",
    ],
  },

  ADRO: {
    ticker: "ADRO",
    symbol: "ADRO.JK",
    name: "PT Alamtri Resources Indonesia Tbk",
    route: "/companies/ADRO",
    visibleInDirectory: true,
    source: {
      companyDetail: "partial",
      financials: "partial",
      performance: "none",
      ownership: "none",
      salesDestination: "none",
      market: "partial",
      newsTimeline: "none",
      investigation: "none",
    },
    notes: [
      "Public company profile page exists in RX MDI.",
      "ADRO appears in the collected BUMI peer dataset.",
    ],
  },

  PTBA: {
    ticker: "PTBA",
    symbol: "PTBA.JK",
    name: "PT Bukit Asam Tbk",
    route: "/companies/PTBA",
    visibleInDirectory: true,
    source: {
      companyDetail: "partial",
      financials: "partial",
      performance: "none",
      ownership: "none",
      salesDestination: "none",
      market: "partial",
      newsTimeline: "none",
      investigation: "none",
    },
    notes: [
      "Public company profile page exists in RX MDI.",
      "PTBA appears in the collected BUMI peer dataset.",
    ],
  },

  ANTM: {
    ticker: "ANTM",
    symbol: "ANTM.JK",
    name: "PT Aneka Tambang Tbk",
    route: "/companies/ANTM",
    visibleInDirectory: true,
    source: {
      companyDetail: "partial",
      financials: "none",
      performance: "none",
      ownership: "none",
      salesDestination: "none",
      market: "none",
      newsTimeline: "none",
      investigation: "none",
    },
    notes: [
      "Public company profile page exists in RX MDI.",
      "No competition-grade Sectors coverage bundle has been collected yet.",
    ],
  },
};

export const companyCoverageList = Object.values(companyCoverageRegistry);

export const directoryCompanies = companyCoverageList.filter(
  (company) => company.visibleInDirectory,
);

export function getCompanyCoverage(ticker: string) {
  return companyCoverageRegistry[ticker.toUpperCase()] ?? null;
}

export function countCoverage(company: CompanyCoverage) {
  const states = Object.values(company.source);

  return {
    verified: states.filter((state) => state === "verified").length,
    partial: states.filter((state) => state === "partial").length,
    none: states.filter((state) => state === "none").length,
    total: states.length,
  };
}

export function coverageScore(company: CompanyCoverage) {
  const states = Object.values(company.source);
  const points = states.reduce((sum, state) => {
    if (state === "verified") return sum + 1;
    if (state === "partial") return sum + 0.5;
    return sum;
  }, 0);

  return Number((points / states.length).toFixed(3));
}

