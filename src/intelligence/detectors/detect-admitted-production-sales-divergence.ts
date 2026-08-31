import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../../investigation/admit-mining-historical-performance-evidence";

import type {
  RXDetectorResult,
} from "./detector-result";

import {
  detectProductionSalesDivergence,
} from "./production-sales-divergence";

export type RXAdmittedProductionSalesDetectionResult =
  | {
      status: "RAN";

      detectorResult:
        RXDetectorResult;
    }
  | {
      status: "NOT_RUN";

      reason:
        | "EVIDENCE_NOT_ADMITTED"
        | "PRODUCTION_NOT_ADMITTED"
        | "SALES_NOT_ADMITTED";

      detectorResult: null;
    };

export function detectAdmittedProductionSalesDivergence(
  admission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult
): RXAdmittedProductionSalesDetectionResult {
  /**
   * Rejected evidence never receives permission to
   * enter deterministic intelligence.
   */
  if (admission.status !== "ADMITTED") {
    return {
      status: "NOT_RUN",
      reason:
        "EVIDENCE_NOT_ADMITTED",
      detectorResult: null,
    };
  }

  /**
   * Only observations explicitly admitted by the
   * historical-performance evidence boundary may
   * enter this detector.
   *
   * Never fall back to admission.observations.
   */
  const production =
    admission.admittedObservations.find(
      (observation) =>
        observation.metric ===
        "PRODUCTION"
    );

  if (!production) {
    return {
      status: "NOT_RUN",
      reason:
        "PRODUCTION_NOT_ADMITTED",
      detectorResult: null,
    };
  }

  const sales =
    admission.admittedObservations.find(
      (observation) =>
        observation.metric ===
        "SALES"
    );

  if (!sales) {
    return {
      status: "NOT_RUN",
      reason:
        "SALES_NOT_ADMITTED",
      detectorResult: null,
    };
  }

  return {
    status: "RAN",

    detectorResult:
      detectProductionSalesDivergence(
        production,
        sales
      ),
  };
}