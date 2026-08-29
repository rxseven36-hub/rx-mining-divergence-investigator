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

    semanticDescription:
      "Nickel ore production",

    semantic: {
      state: "KNOWN",
      description:
        "Nickel ore production",
      basis:
        "Test fixture with explicitly validated mining-performance semantics.",
    },

    ...overrides,
  };
}

describe("compareObservations", () => {
  it("allows observations with explicitly known semantics", () => {
    const left = observation({
      id: "production",
      metric: "PRODUCTION",
    });

    const right = observation({
      id: "sales",
      metric: "SALES",
      value: 8.35,

      semanticDescription:
        "Nickel ore sales",

      semantic: {
        state: "KNOWN",
        description:
          "Nickel ore sales",
        basis:
          "Test fixture with explicitly validated mining-performance semantics.",
      },
    });

    const result =
      compareObservations(
        left,
        right
      );

    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("rejects UNKNOWN semantics even when semanticDescription exists", () => {
    const left = observation({
      id: "production",
      metric: "PRODUCTION",

      semanticDescription:
        "This description exists but proves nothing.",

      semantic: {
        state: "UNKNOWN",
        description:
          "This description exists but proves nothing.",
      },
    });

    const right = observation({
      id: "sales",
      metric: "SALES",
      value: 8.35,

      semanticDescription:
        "Nickel ore sales",

      semantic: {
        state: "KNOWN",
        description:
          "Nickel ore sales",
        basis:
          "Explicitly validated test semantics.",
      },
    });

    const result =
      compareObservations(
        left,
        right
      );

    expect(result.eligible).toBe(false);

    expect(result.reasons).toContain(
      "SEMANTICS_UNKNOWN"
    );
  });

  it("rejects KNOWN state when explicit semantic basis is missing", () => {
    const left = observation({
      semantic: {
        state: "KNOWN",
        description:
          "Nickel ore production",
      },
    });

    const right = observation({
      id: "sales",
      metric: "SALES",
      value: 8.35,
    });

    const result =
      compareObservations(
        left,
        right
      );

    expect(result.eligible).toBe(false);

    expect(result.reasons).toContain(
      "SEMANTICS_UNKNOWN"
    );
  });

  it("rejects wmt versus TNi even when both describe nickel", () => {
    const left = observation({
      commoditySubtype:
        "Limonite & Saprolite Ore",

      unit: {
        symbol: "wmt",
        dimension: "MASS",
      },
    });

    const right = observation({
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

      semantic: {
        state: "KNOWN",
        description:
          "Ferronickel sales",
        basis:
          "Explicitly validated test semantics.",
      },
    });

    const result =
      compareObservations(
        left,
        right
      );

    expect(result.eligible).toBe(false);

    expect(result.reasons).toContain(
      "UNIT_NOT_COMPARABLE"
    );

    expect(result.reasons).toContain(
      "RELATIONSHIP_INVALID"
    );
  });

  it("rejects null observations instead of treating them as zero", () => {
    const left = observation();

    const right = observation({
      metric: "SALES",
      value: null,
    });

    const result =
      compareObservations(
        left,
        right
      );

    expect(result.eligible).toBe(false);

    expect(result.reasons).toContain(
      "DATA_MISSING"
    );
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

    const result =
      compareObservations(
        left,
        right
      );

    expect(result.eligible).toBe(false);

    expect(result.reasons).toContain(
      "TIME_NOT_ALIGNED"
    );
  });
});