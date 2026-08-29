import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import {
  detectProductionSalesDivergence,
} from "../intelligence/detectors/production-sales-divergence";

function observation(
  overrides:
    Partial<RXNormalizedObservation> = {}
): RXNormalizedObservation {
  return {
    id: "obs",

    companyId: "ANTM.JK",

    commodity: "NICKEL",

    commoditySubtype:
      "Limonite & Saprolite Ore",

    metric: "PRODUCTION",

    value: 9.94,

    unit: {
      symbol: "wmt",
      dimension: "MASS",
    },

    period: {
      kind: "YEAR",
      year: 2024,
    },

    evidence: [],

    semanticDescription:
      "Nickel ore production",

    ...overrides,
  };
}

describe(
  "detectProductionSalesDivergence",
  () => {
    it("detects ANTAM-style production versus sales divergence", () => {
      const production =
        observation({
          id: "production",
          metric: "PRODUCTION",
          value: 9.94,
        });

      const sales =
        observation({
          id: "sales",
          metric: "SALES",
          value: 8.35,
          semanticDescription:
            "Nickel ore sales",
        });

      const result =
        detectProductionSalesDivergence(
          production,
          sales
        );

      expect(result.status).toBe(
        "DETECTED"
      );

      expect(
        result.calculation
          ?.signedDifference
      ).toBeCloseTo(-1.59, 8);

      expect(
        result.calculation
          ?.absoluteDifference
      ).toBeCloseTo(1.59, 8);

      expect(
        result.calculation
          ?.differenceRatioOfProduction
      ).toBeCloseTo(
        1.59 / 9.94,
        8
      );

      expect(
        result.calculation?.direction
      ).toBe(
        "PRODUCTION_ABOVE_SALES"
      );

      expect(
        result.causalExplanation
      ).toBe("UNKNOWN");
    });

    it("works when observations are supplied in reverse order", () => {
      const production =
        observation({
          id: "production",
          metric: "PRODUCTION",
        });

      const sales =
        observation({
          id: "sales",
          metric: "SALES",
          value: 8.35,
          semanticDescription:
            "Nickel ore sales",
        });

      const result =
        detectProductionSalesDivergence(
          sales,
          production
        );

      expect(result.status).toBe(
        "DETECTED"
      );

      expect(
        result.calculation?.production
      ).toBe(9.94);

      expect(
        result.calculation?.sales
      ).toBe(8.35);
    });

    it("skips AMMN-style null sales instead of treating null as zero", () => {
      const production =
        observation({
          companyId: "AMMN.JK",
          commodity: "COPPER",
          commoditySubtype: undefined,
          metric: "PRODUCTION",
          value: 179.1,
          unit: {
            symbol: "kton",
            dimension: "MASS",
          },
          semanticDescription:
            "Copper production",
        });

      const sales =
        observation({
          companyId: "AMMN.JK",
          commodity: "COPPER",
          commoditySubtype: undefined,
          metric: "SALES",
          value: null,
          unit: {
            symbol: "kton",
            dimension: "MASS",
          },
          semanticDescription:
            "Copper sales",
        });

      const result =
        detectProductionSalesDivergence(
          production,
          sales
        );

      expect(result.status).toBe(
        "SKIPPED"
      );

      expect(
        result.skipReasons
      ).toContain(
        "DATA_MISSING"
      );

      expect(
        result.calculation
      ).toBeUndefined();
    });

    it("skips wmt versus TNi", () => {
      const production =
        observation({
          commoditySubtype:
            "Limonite Ore",

          metric: "PRODUCTION",

          unit: {
            symbol: "wmt",
            dimension: "MASS",
          },
        });

      const sales =
        observation({
          commoditySubtype:
            "Ferronickel",

          metric: "SALES",

          value: 19452,

          unit: {
            symbol: "TNi",
            dimension:
              "CONTAINED_METAL",
          },

          semanticDescription:
            "Ferronickel sales",
        });

      const result =
        detectProductionSalesDivergence(
          production,
          sales
        );

      expect(result.status).toBe(
        "SKIPPED"
      );

      expect(
        result.skipReasons
      ).toContain(
        "UNIT_NOT_COMPARABLE"
      );

      expect(
        result.skipReasons
      ).toContain(
        "RELATIONSHIP_INVALID"
      );
    });

    it("skips different reporting years", () => {
      const production =
        observation({
          metric: "PRODUCTION",
          period: {
            kind: "YEAR",
            year: 2023,
          },
        });

      const sales =
        observation({
          metric: "SALES",
          value: 8.35,
          period: {
            kind: "YEAR",
            year: 2024,
          },
          semanticDescription:
            "Nickel ore sales",
        });

      const result =
        detectProductionSalesDivergence(
          production,
          sales
        );

      expect(result.status).toBe(
        "SKIPPED"
      );

      expect(
        result.skipReasons
      ).toContain(
        "TIME_NOT_ALIGNED"
      );
    });

    it("rejects a wrong metric pair", () => {
      const first =
        observation({
          metric: "PRODUCTION",
        });

      const second =
        observation({
          metric: "RESERVE",
          value: 100,
          semanticDescription:
            "Nickel reserves",
        });

      const result =
        detectProductionSalesDivergence(
          first,
          second
        );

      expect(result.status).toBe(
        "SKIPPED"
      );

      expect(
        result.skipReasons
      ).toEqual([
        "WRONG_METRIC_PAIR",
      ]);
    });

    it("returns NO_DIVERGENCE when comparable values are equal", () => {
      const production =
        observation({
          metric: "PRODUCTION",
          value: 10,
        });

      const sales =
        observation({
          metric: "SALES",
          value: 10,
          semanticDescription:
            "Nickel ore sales",
        });

      const result =
        detectProductionSalesDivergence(
          production,
          sales
        );

      expect(result.status).toBe(
        "NO_DIVERGENCE"
      );

      expect(
        result.calculation
          ?.absoluteDifference
      ).toBe(0);

      expect(
        result.calculation?.direction
      ).toBe("BALANCED");
    });

    it("does not divide by zero when production is zero", () => {
      const production =
        observation({
          metric: "PRODUCTION",
          value: 0,
        });

      const sales =
        observation({
          metric: "SALES",
          value: 5,
          semanticDescription:
            "Nickel ore sales",
        });

      const result =
        detectProductionSalesDivergence(
          production,
          sales
        );

      expect(result.status).toBe(
        "DETECTED"
      );

      expect(
        result.calculation
          ?.absoluteDifference
      ).toBe(5);

      expect(
        result.calculation
          ?.differenceRatioOfProduction
      ).toBeNull();

      expect(
        result.calculation?.direction
      ).toBe(
        "SALES_ABOVE_PRODUCTION"
      );
    });
  }
);