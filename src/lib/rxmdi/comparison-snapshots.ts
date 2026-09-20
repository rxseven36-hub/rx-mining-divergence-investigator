export type ComparisonMetric = {
  value: string;
  period: string;
};

export type ComparisonCompany = {
  symbol: string;
  name: string;
  commodity: string;

  production: ComparisonMetric;
  sales: ComparisonMetric;
  reserves: ComparisonMetric;
  resources: ComparisonMetric;

  revenue: ComparisonMetric;
  netProfit: ComparisonMetric;
  netMargin: ComparisonMetric;

  priceMove: ComparisonMetric;
  foreignFlow: ComparisonMetric;
};

export const comparisonSnapshots: Record<string, ComparisonCompany> = {
  BUMI: {
    symbol: "BUMI",
    name: "PT Bumi Resources Tbk",
    commodity: "Thermal Coal",

    production: {
      value: "74.7 Mt",
      period: "2024",
    },
    sales: {
      value: "75.8 Mt",
      period: "2024",
    },
    reserves: {
      value: "2.354 Bt",
      period: "Measured 2024",
    },
    resources: {
      value: "6.817 Bt",
      period: "Measured 2024",
    },

    revenue: {
      value: "US$1.36B",
      period: "2024",
    },
    netProfit: {
      value: "US$90M",
      period: "2024",
    },
    netMargin: {
      value: "6.6%",
      period: "Derived · 2024",
    },

    priceMove: {
      value: "+14.59%",
      period: "12 Aug - 10 Sep 2026",
    },
    foreignFlow: {
      value: "+Rp143.58B",
      period: "12 Aug - 10 Sep 2026",
    },
  },

  BYAN: {
    symbol: "BYAN",
    name: "PT Bayan Resources Tbk",
    commodity: "Thermal Coal",

    production: {
      value: "50.5 Mt",
      period: "2024",
    },
    sales: {
      value: "56.2 Mt",
      period: "2024",
    },
    reserves: {
      value: "2.031 Bt",
      period: "Measured 2022",
    },
    resources: {
      value: "4.082 Bt",
      period: "Measured 2022",
    },

    revenue: {
      value: "US$3.45B",
      period: "2024",
    },
    netProfit: {
      value: "US$943M",
      period: "2024",
    },
    netMargin: {
      value: "27.4%",
      period: "Derived · 2024",
    },

    priceMove: {
      value: "+8.94%",
      period: "12 Aug - 10 Sep 2026",
    },
    foreignFlow: {
      value: "-Rp50.76B",
      period: "12 Aug - 10 Sep 2026",
    },
  },

  ITMG: {
    symbol: "ITMG",
    name: "PT Indo Tambangraya Megah Tbk",
    commodity: "Thermal Coal",

    production: {
      value: "20.2 Mt",
      period: "2024",
    },
    sales: {
      value: "24.0 Mt",
      period: "2024",
    },
    reserves: {
      value: "354.6 Mt",
      period: "Measured 2024",
    },
    resources: {
      value: "93 Mt",
      period: "Measured 2024",
    },

    revenue: {
      value: "US$2.30B",
      period: "2024",
    },
    netProfit: {
      value: "US$375.6M",
      period: "2024",
    },
    netMargin: {
      value: "16.3%",
      period: "Derived · 2024",
    },

    priceMove: {
      value: "+5.45%",
      period: "12 Aug - 10 Sep 2026",
    },
    foreignFlow: {
      value: "-Rp273.93B",
      period: "12 Aug - 10 Sep 2026",
    },
  },
};

export const goldenComparisonSymbols = ["BUMI", "BYAN", "ITMG"] as const;
