import { describe, expect, it } from "vitest";

import { normalizeMiningPerformanceRow } from "../data/normalization/normalize-mining-performance";

describe("normalizeMiningPerformanceRow", () => {
  it("normalizes ANTAM-style nickel ore production and sales", () => {
    const observations = normalizeMiningPerformanceRow({
      companyId: "ANTM.JK",
      source: "sectors:mining-company-performance",
      row: {
        year: 2024,
        commodity: "Nickel",
        product_type: "Limonite & Saprolite Ore",
        unit: "wmt",
        production: 9.94,
        sales: 8.35,
      },
    });

    expect(observations).toHaveLength(2);

    expect(observations[0]).toMatchObject({
      companyId: "ANTM.JK",
      commodity: "NICKEL",
      commoditySubtype: "Limonite & Saprolite Ore",
      metric: "PRODUCTION",
      value: 9.94,
    });

    expect(observations[1]).toMatchObject({
      metric: "SALES",
      value: 8.35,
    });
  });

  it("preserves AMMN-style missing sales as null", () => {
    const observations = normalizeMiningPerformanceRow({
      companyId: "AMMN.JK",
      source: "sectors:mining-company-performance",
      row: {
        year: 2024,
        commodity: "Copper",
        unit: "kton",
        production: 179.1,
        sales: null,
      },
    });

    const sales = observations.find(
      (observation) => observation.metric === "SALES"
    );

    expect(sales).toBeDefined();
    expect(sales?.value).toBeNull();
  });

  it("keeps TNi separate from wmt semantics", () => {
    const observations = normalizeMiningPerformanceRow({
      companyId: "ANTM.JK",
      source: "sectors:mining-company-performance",
      row: {
        year: 2024,
        commodity: "Nickel",
        product_type: "Ferronickel",
        unit: "TNi",
        production: 20103,
        sales: 19452,
      },
    });

    expect(observations[0].unit).toMatchObject({
      symbol: "TNi",
      dimension: "CONTAINED_METAL",
    });

    expect(observations[0].commoditySubtype).toBe(
      "Ferronickel"
    );
  });

  it("rejects unsupported commodity from normalized MVP universe", () => {
    const observations = normalizeMiningPerformanceRow({
      companyId: "ALUMINIUM-TEST",
      source: "sectors:mining-company-performance",
      row: {
        year: 2024,
        commodity: "Aluminium",
        unit: "Mt",
        production: 1,
      },
    });

    expect(observations).toEqual([]);
  });

  it("keeps unknown unit semantics unknown", () => {
    const observations = normalizeMiningPerformanceRow({
      companyId: "TEST",
      source: "sectors:mining-company-performance",
      row: {
        year: 2024,
        commodity: "Gold",
        unit: "mystery-unit",
        production: 10,
      },
    });

    expect(observations[0].unit.dimension).toBe("UNKNOWN");
  });
});