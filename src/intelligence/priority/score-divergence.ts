import type {
  RXDetectorResult,
} from "../detectors/detector-result";

import type {
  RXPriorityResult,
} from "./priority-result";

function basePriorityResult(
  detectorResult: RXDetectorResult
) {
  return {
    detector:
      detectorResult.detector,

    detectorStatus:
      detectorResult.status,

    companyId:
      detectorResult.companyId,

    commodity:
      detectorResult.commodity,

    commoditySubtype:
      detectorResult.commoditySubtype,

    periodLabel:
      detectorResult.periodLabel,

    sourceObservationIds:
      [...detectorResult.sourceObservationIds],

    causalExplanation:
      "UNKNOWN" as const,
  };
}

/**
 * Converts a non-negative divergence ratio into
 * a bounded deterministic priority score.
 *
 * score = 100 * ratio / (1 + ratio)
 *
 * This preserves ordering while preventing very
 * large ratios from producing unbounded scores.
 *
 * IMPORTANT:
 * This score represents divergence magnitude only.
 * It does NOT establish financial/business materiality.
 */
export function divergenceRatioToPriorityScore(
  ratio: number
): number {
  if (
    !Number.isFinite(ratio) ||
    ratio < 0
  ) {
    throw new Error(
      "Divergence ratio must be a finite non-negative number"
    );
  }

  return (
    (100 * ratio) /
    (1 + ratio)
  );
}

export function scoreDivergence(
  detectorResult: RXDetectorResult
): RXPriorityResult {
  const base =
    basePriorityResult(detectorResult);

  if (
    detectorResult.status !==
    "DETECTED"
  ) {
    return {
      ...base,

      status: "UNSCORABLE",

      score: null,

      divergenceRatio: null,

      unscorableReasons: [
        "DETECTOR_NOT_DETECTED",
      ],
    };
  }

  if (!detectorResult.calculation) {
    return {
      ...base,

      status: "UNSCORABLE",

      score: null,

      divergenceRatio: null,

      unscorableReasons: [
        "CALCULATION_MISSING",
      ],
    };
  }

  const ratio =
    detectorResult.calculation
      .differenceRatioOfProduction;

  if (ratio === null) {
    return {
      ...base,

      status: "UNSCORABLE",

      score: null,

      divergenceRatio: null,

      unscorableReasons: [
        "RATIO_UNDEFINED",
      ],
    };
  }

  if (
    !Number.isFinite(ratio) ||
    ratio < 0
  ) {
    return {
      ...base,

      status: "UNSCORABLE",

      score: null,

      divergenceRatio: ratio,

      unscorableReasons: [
        "RATIO_INVALID",
      ],
    };
  }

  return {
    ...base,

    status: "SCORABLE",

    score:
      divergenceRatioToPriorityScore(
        ratio
      ),

    divergenceRatio: ratio,

    unscorableReasons: [],
  };
}