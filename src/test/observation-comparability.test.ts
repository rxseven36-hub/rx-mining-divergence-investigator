import { describe, expect, it } from "vitest";

import type { RXNormalizedObservation } from "../data/normalization/normalized-observation";
import { compareObservations } from "../intelligence/comparability/compare-observations";

function observation(
  overrides: Partial<RXNormalizedObservation> = {}
): RXNormalizedObservation {
  return {
    id: "obs-1",
    companyId: "company-1",
    commodity: "NICKEL",
    commoditySubtype: "Limonite & Saprolite Ore",
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
    semanticDescription: "Nickel ore production",
    ...overrides,
  };
}

describe("compareObservations", () => {
  it("allows semantically aligned observations", () => {
    const left = observation({
      id: "production",
      metric: "PRODUCTION",
    });

    const right = observation({
      id: "sales",
      metric: "SALES",
      value: 8.35,
    });

    const result = compareObservations(left, right);

    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("rejects wmt versus TNi even when both describe nickel", () => {
    const left = observation({
      commoditySubtype: "Limonite & Saprolite Ore",
      unit: {
        symbol: "wmt",
        dimension: "MASS",
      },
    });

    const right = observation({
      commoditySubtype: "Ferronickel",
      metric: "SALES",
      value: 19452,
      unit: {
        symbol: "TNi",
        dimension: "CONTAINED_METAL",
      },
      semanticDescription: "Ferronickel sales",
    });

    const result = compareObservations(left, right);

    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("UNIT_NOT_COMPARABLE");
    expect(result.reasons).toContain("RELATIONSHIP_INVALID");
  });

  it("rejects null observations instead of treating them as zero", () => {
    const left = observation();

    const right = observation({
      metric: "SALES",
      value: null,
    });

    const result = compareObservations(left, right);

    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("DATA_MISSING");
  });

  it("rejects different reporting years", () => {
    const left = observation({
      period: {
        kind: "YEAR",
        year: 2023,
      },
    });

    const right = observation({
      metric: "SALES",
      period: {
        kind: "YEAR",
        year: 2024,
      },
    });

    const result = compareObservations(left, right);

    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("TIME_NOT_ALIGNED");
  });
});