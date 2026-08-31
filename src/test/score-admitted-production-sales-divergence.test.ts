import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../investigation/admit-mining-historical-performance-evidence";

import {
  scoreAdmittedProductionSalesDivergence,
} from "../intelligence/priority/score-admitted-production-sales-divergence";

function observation(
  id: string,
  metric: "PRODUCTION" | "SALES",
  value: number
): RXNormalizedObservation {
  return {
    id,

    companyId: "aadi",

    commodity: "COAL",

    metric,

    value,

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
      `Coal ${metric.toLowerCase()}`,

    semantic: {
      state: "KNOWN",
      description:
        `Coal ${metric.toLowerCase()}`,
      basis:
        "Regression test fixture",
    },
  };
}

function admittedResult(
  admittedObservations:
    RXNormalizedObservation[]
): Extract<
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
  { status: "ADMITTED"}
>{
  return {
    status: "ADMITTED",

    collection: {
      requestId:
        "test-request",

      requirementId:
        "test-requirement",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status: "AVAILABLE",

      evidence: [],

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    observations:
      [...admittedObservations],

    admittedObservations:
      [...admittedObservations],
  };
}

function rejectedResult():
  RXMiningHistoricalPerformanceEvidenceAdmissionResult {
  return {
    status: "REJECTED",

    collection: {
      requestId:
        "test-request",

      requirementId:
        "test-requirement",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status: "INVALID",

      evidence: [],

      issues: [
        "INVALID_RESPONSE",
      ],

      causalConclusion:
        "UNKNOWN",
    },

    observations: [],

    admittedObservations: [],
  };
}

describe(
  "scoreAdmittedProductionSalesDivergence",
  () => {
    it("runs admitted evidence through detection and deterministic priority scoring", () => {
      const admission =
        admittedResult([
          observation(
            "production",
            "PRODUCTION",
            48.11
          ),

          observation(
            "sales",
            "SALES",
            55.8
          ),
        ]);

      const result =
        scoreAdmittedProductionSalesDivergence(
          admission
        );

      expect(result.status).toBe(
        "SCORED"
      );

      if (result.status !== "SCORED") {
        throw new Error(
          "Expected scoring to run"
        );
      }

      expect(
        result.detectorResult.status
      ).toBe("DETECTED");

      expect(
        result.priorityResult.status
      ).toBe("SCORABLE");

      expect(
        result.priorityResult
          .divergenceRatio
      ).toBeCloseTo(
        7.69 / 48.11,
        8
      );

      expect(
        result.priorityResult.score
      ).toBeCloseTo(
        (
          100 *
          (7.69 / 48.11)
        ) /
          (
            1 +
            7.69 / 48.11
          ),
        8
      );

      expect(
        result.priorityResult
          .causalExplanation
      ).toBe("UNKNOWN");
    });

    it("does not run scoring when evidence admission was rejected", () => {
      const result =
        scoreAdmittedProductionSalesDivergence(
          rejectedResult()
        );

      expect(result).toEqual({
        status: "NOT_RUN",

        reason:
          "EVIDENCE_NOT_ADMITTED",

        detectorResult: null,

        priorityResult: null,
      });
    });

    it("does not bypass admittedObservations to obtain missing sales evidence", () => {
      const production =
        observation(
          "production",
          "PRODUCTION",
          48.11
        );

      const sales =
        observation(
          "sales",
          "SALES",
          55.8
        );

      const admission:
        RXMiningHistoricalPerformanceEvidenceAdmissionResult =
        {
          ...admittedResult([
            production,
          ]),

          observations: [
            production,
            sales,
          ],

          admittedObservations: [
            production,
          ],
        };

      const result =
        scoreAdmittedProductionSalesDivergence(
          admission
        );

      expect(result).toEqual({
        status: "NOT_RUN",

        reason:
          "SALES_NOT_ADMITTED",

        detectorResult: null,

        priorityResult: null,
      });
    });

    it("preserves an unscorable detector result instead of inventing a score", () => {
      const admission =
        admittedResult([
          observation(
            "production",
            "PRODUCTION",
            0
          ),

          observation(
            "sales",
            "SALES",
            10
          ),
        ]);

      const result =
        scoreAdmittedProductionSalesDivergence(
          admission
        );

      expect(result.status).toBe(
        "SCORED"
      );

      if (result.status !== "SCORED") {
        throw new Error(
          "Expected scoring to run"
        );
      }

      expect(
        result.detectorResult.status
      ).toBe("DETECTED");

      expect(
        result.priorityResult.status
      ).toBe("UNSCORABLE");

      expect(
        result.priorityResult.score
      ).toBeNull();

      expect(
        result.priorityResult
          .divergenceRatio
      ).toBeNull();

      expect(
        result.priorityResult
          .unscorableReasons
      ).toContain(
        "RATIO_UNDEFINED"
      );
    });
  }
);
