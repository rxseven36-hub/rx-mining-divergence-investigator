import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXDetectorResult,
} from "../intelligence/detectors/detector-result";

import {
  divergenceRatioToPriorityScore,
  scoreDivergence,
} from "../intelligence/priority/score-divergence";

function detectedResult(
  ratio: number | null
): RXDetectorResult {
  return {
    detector:
      "PRODUCTION_VS_SALES",

    status: "DETECTED",

    companyId: "ANTM.JK",

    commodity: "NICKEL",

    commoditySubtype:
      "Limonite & Saprolite Ore",

    periodLabel: "2024",

    sourceObservationIds: [
      "production",
      "sales",
    ],

    calculation: {
      production: 9.94,
      sales: 8.35,
      signedDifference: -1.59,
      absoluteDifference: 1.59,
      differenceRatioOfProduction:
        ratio,
      direction:
        "PRODUCTION_ABOVE_SALES",
    },

    skipReasons: [],

    causalExplanation:
      "UNKNOWN",
  };
}

describe(
  "divergenceRatioToPriorityScore",
  () => {
    it("maps zero ratio to zero", () => {
      expect(
        divergenceRatioToPriorityScore(
          0
        )
      ).toBe(0);
    });

    it("maps ratio 1 to score 50", () => {
      expect(
        divergenceRatioToPriorityScore(
          1
        )
      ).toBe(50);
    });

    it("preserves ordering for larger ratios", () => {
      const small =
        divergenceRatioToPriorityScore(
          0.1
        );

      const medium =
        divergenceRatioToPriorityScore(
          0.5
        );

      const large =
        divergenceRatioToPriorityScore(
          2
        );

      expect(small).toBeLessThan(
        medium
      );

      expect(medium).toBeLessThan(
        large
      );

      expect(large).toBeLessThan(
        100
      );
    });

    it("rejects invalid ratios", () => {
      expect(
        () =>
          divergenceRatioToPriorityScore(
            -1
          )
      ).toThrow();

      expect(
        () =>
          divergenceRatioToPriorityScore(
            Number.POSITIVE_INFINITY
          )
      ).toThrow();
    });
  }
);

describe("scoreDivergence", () => {
  it("scores a detected divergence deterministically", () => {
    const ratio =
      1.59 / 9.94;

    const result =
      scoreDivergence(
        detectedResult(ratio)
      );

    expect(result.status).toBe(
      "SCORABLE"
    );

    expect(
      result.divergenceRatio
    ).toBeCloseTo(
      ratio,
      8
    );

    expect(result.score).toBeCloseTo(
      (100 * ratio) /
        (1 + ratio),
      8
    );

    expect(
      result.causalExplanation
    ).toBe("UNKNOWN");
  });

  it("does not score an undefined zero-denominator ratio", () => {
    const result =
      scoreDivergence(
        detectedResult(null)
      );

    expect(result.status).toBe(
      "UNSCORABLE"
    );

    expect(result.score).toBeNull();

    expect(
      result.unscorableReasons
    ).toContain(
      "RATIO_UNDEFINED"
    );
  });

  it("does not score skipped detector results", () => {
    const skipped:
      RXDetectorResult = {
        detector:
          "PRODUCTION_VS_SALES",

        status: "SKIPPED",

        companyId: "AMMN.JK",

        commodity: "COPPER",

        periodLabel: "2024",

        sourceObservationIds: [
          "production",
          "sales",
        ],

        skipReasons: [
          "DATA_MISSING",
        ],

        causalExplanation:
          "UNKNOWN",
      };

    const result =
      scoreDivergence(skipped);

    expect(result.status).toBe(
      "UNSCORABLE"
    );

    expect(result.score).toBeNull();

    expect(
      result.unscorableReasons
    ).toEqual([
      "DETECTOR_NOT_DETECTED",
    ]);
  });

  it("does not score NO_DIVERGENCE as a priority case", () => {
    const noDivergence:
      RXDetectorResult = {
        ...detectedResult(0),

        status:
          "NO_DIVERGENCE",
      };

    const result =
      scoreDivergence(
        noDivergence
      );

    expect(result.status).toBe(
      "UNSCORABLE"
    );

    expect(result.score).toBeNull();
  });
});