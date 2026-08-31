import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../investigation/admit-mining-historical-performance-evidence";

import {
  detectAdmittedProductionSalesDivergence,
} from "../intelligence/detectors/detect-admitted-production-sales-divergence";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

function observation(
  id: string,
  metric:
    | "PRODUCTION"
    | "SALES",
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
      "Coal production",

    semantic: {
      state: "KNOWN",
      description:
        "Coal production",
      basis:
        "Test fixture with explicitly validated mining-performance semantics.",
    },
  };
}

function admittedResult(
  admittedObservations:
    RXNormalizedObservation[],
  observations:
    RXNormalizedObservation[] =
      admittedObservations
): RXMiningHistoricalPerformanceEvidenceAdmissionResult {
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

    observations,

    admittedObservations,
  };
}

describe(
  "detectAdmittedProductionSalesDivergence",
  () => {
    it(
      "runs the detector using admitted production and sales observations",
      () => {
        const production =
          observation(
            "production-2024",
            "PRODUCTION",
            48.11
          );

        const sales =
          observation(
            "sales-2024",
            "SALES",
            55.8
          );

        const result =
          detectAdmittedProductionSalesDivergence(
            admittedResult([
              production,
              sales,
            ])
          );

        expect(
          result.status
        ).toBe("RAN");

        if (
          result.status !== "RAN"
        ) {
          throw new Error(
            "Expected detector to run."
          );
        }

        expect(
          result.detectorResult.status
        ).toBe("DETECTED");

        expect(
          result.detectorResult
            .calculation
            ?.signedDifference
        ).toBeCloseTo(7.69);

        expect(
          result.detectorResult
            .causalExplanation
        ).toBe("UNKNOWN");
      }
    );

    it(
      "does not run when evidence admission was rejected",
      () => {
        const rejected:
          RXMiningHistoricalPerformanceEvidenceAdmissionResult =
          {
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

        const result =
          detectAdmittedProductionSalesDivergence(
            rejected
          );

        expect(
          result
        ).toEqual({
          status: "NOT_RUN",
          reason:
            "EVIDENCE_NOT_ADMITTED",
          detectorResult: null,
        });
      }
    );

    it(
      "never falls back to normalized observations that were not admitted",
      () => {
        const production =
          observation(
            "production-2024",
            "PRODUCTION",
            48.11
          );

        const sales =
          observation(
            "sales-2024",
            "SALES",
            55.8
          );

        const result =
          detectAdmittedProductionSalesDivergence(
            admittedResult(
              [production],
              [
                production,
                sales,
              ]
            )
          );

        expect(
          result
        ).toEqual({
          status: "NOT_RUN",
          reason:
            "SALES_NOT_ADMITTED",
          detectorResult: null,
        });
      }
    );
  }
);