import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../../investigation/admit-mining-historical-performance-evidence";

import {
  detectAdmittedProductionSalesDivergence,
} from "../detectors/detect-admitted-production-sales-divergence";

import type {
  RXDetectorResult,
} from "../detectors/detector-result";

import type {
  RXPriorityResult,
} from "./priority-result";

import {
  scoreDivergence,
} from "./score-divergence";

export type RXAdmittedProductionSalesPriorityResult =
  | {
      status: "SCORED";

      detectorResult:
        RXDetectorResult;

      priorityResult:
        RXPriorityResult;
    }
  | {
      status: "NOT_RUN";

      reason:
        | "EVIDENCE_NOT_ADMITTED"
        | "PRODUCTION_NOT_ADMITTED"
        | "SALES_NOT_ADMITTED";

      detectorResult: null;

      priorityResult: null;
    };

/**
 * Runs the deterministic production-versus-sales
 * intelligence path from admitted evidence through
 * divergence detection and priority scoring.
 *
 * Truth boundary:
 *
 * - Only observations explicitly admitted by the
 *   historical-performance admission boundary may
 *   reach the detector.
 *
 * - If detection is not allowed to run, scoring is
 *   also not allowed to run.
 *
 * - The priority result preserves the semantics of
 *   scoreDivergence. A SCORED wrapper does not imply
 *   that the underlying result is SCORABLE.
 *
 * - Priority scoring establishes divergence magnitude
 *   only. It does not establish causality or absolute
 *   financial/business materiality.
 */
export function scoreAdmittedProductionSalesDivergence(
  admission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult
): RXAdmittedProductionSalesPriorityResult {
  const detection =
    detectAdmittedProductionSalesDivergence(
      admission
    );

  if (detection.status === "NOT_RUN") {
    return {
      status: "NOT_RUN",

      reason:
        detection.reason,

      detectorResult: null,

      priorityResult: null,
    };
  }

  const detectorResult =
    detection.detectorResult;

  return {
    status: "SCORED",

    detectorResult,

    priorityResult:
      scoreDivergence(
        detectorResult
      ),
  };
}
