export type HistoricalOperationalPoint = {
  year: number;
  production: number | null;
  sales: number | null;
};

export type CompanyHistoricalSnapshot = {
  symbol: string;
  unit: "Mt";
  sourceLabel: string;
  points: HistoricalOperationalPoint[];
};

const HISTORICAL_OPERATIONAL_SNAPSHOTS: Record<
  string,
  CompanyHistoricalSnapshot
> = {
  ADMR: {
    symbol: "ADMR",
    unit: "Mt",
    sourceLabel: "Admitted historical operational observations",
    points: [
      { year: 2020, production: 1.88, sales: 1.4 },
      { year: 2021, production: 2.3, sales: 2.3 },
      { year: 2022, production: 3.37, sales: 3.2 },
      { year: 2023, production: 5.11, sales: 4.46 },
      { year: 2024, production: 6.63, sales: 5.62 },
    ],
  },

  BUMI: {
    symbol: "BUMI",
    unit: "Mt",
    sourceLabel: "Admitted historical operational observations",
    points: [
      { year: 2020, production: 81.1, sales: 81.5 },
      { year: 2021, production: 78.8, sales: 79.4 },
      { year: 2022, production: 71.9, sales: 69.4 },
      { year: 2023, production: 77.8, sales: 78.7 },
      { year: 2024, production: 74.7, sales: 75.8 },
    ],
  },

  BYAN: {
    symbol: "BYAN",
    unit: "Mt",
    sourceLabel: "Admitted historical operational observations",
    points: [
      { year: 2020, production: 30.2, sales: null },
      { year: 2021, production: 37.6, sales: 40.4 },
      { year: 2022, production: 38.9, sales: 39.9 },
      { year: 2023, production: 49.7, sales: 47.2 },
      { year: 2024, production: 50.5, sales: 56.2 },
    ],
  },

  GEMS: {
    symbol: "GEMS",
    unit: "Mt",
    sourceLabel: "Admitted historical operational observations",
    points: [
      { year: 2020, production: 33.46, sales: 33.96 },
      { year: 2021, production: 29.11, sales: 29.49 },
      { year: 2022, production: 38.4, sales: 38.86 },
      { year: 2023, production: 46.12, sales: 46.89 },
      { year: 2024, production: 50.69, sales: 51.86 },
    ],
  },

  ITMG: {
    symbol: "ITMG",
    unit: "Mt",
    sourceLabel: "Admitted historical operational observations",
    points: [
      { year: 2020, production: 18.4, sales: 21.2 },
      { year: 2021, production: 18.2, sales: 20.1 },
      { year: 2022, production: 16.6, sales: 18.9 },
      { year: 2023, production: 16.88, sales: 20.9 },
      { year: 2024, production: 20.2, sales: 24.0 },
    ],
  },
};

export function getHistoricalOperationalSnapshot(
  symbol: string,
): CompanyHistoricalSnapshot | null {
  return HISTORICAL_OPERATIONAL_SNAPSHOTS[
    symbol.trim().toUpperCase()
  ] ?? null;
}