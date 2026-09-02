import type {
  RXNormalizedObservation,
} from "../../data/normalization/normalized-observation";

import type {
  RXPeerObservationComparabilityResult,
} from "./peer-observation-comparability";

import type {
  RXPeerDivergenceSignal,
} from "./peer-divergence-signal";

function calculateRelativeDifference(
  leftValue: number,
  rightValue: number
): number | null {
  const denominator =
    Math.abs(rightValue);

  if (denominator === 0) {
    return null;
  }

  return (
    leftValue - rightValue
  ) / denominator;
}

export function createPeerDivergenceSignal(
  left:
    RXNormalizedObservation,
  right:
    RXNormalizedObservation,
  comparability:
    RXPeerObservationComparabilityResult
): RXPeerDivergenceSignal {
  if (
    !comparability.eligible ||
    left.value === null ||
    right.value === null
  ) {
    return {
      status:
        "NOT_COMPARABLE",

      leftCompanyId:
        left.companyId,

      rightCompanyId:
        right.companyId,

      metric:
        left.metric === right.metric
          ? left.metric
          : null,

      commodity:
        left.commodity === right.commodity
          ? left.commodity
          : null,

      leftValue:
        null,

      rightValue:
        null,

      absoluteDifference:
        null,

      relativeDifference:
        null,

      comparability,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const absoluteDifference =
    Math.abs(
      left.value -
        right.value
    );

  const relativeDifference =
    calculateRelativeDifference(
      left.value,
      right.value
    );

  return {
    status:
      "COMPARABLE",

    leftCompanyId:
      left.companyId,

    rightCompanyId:
      right.companyId,

    metric:
      left.metric,

    commodity:
      left.commodity,

    leftValue:
      left.value,

    rightValue:
      right.value,

    absoluteDifference,

    relativeDifference,

    comparability,

    causalConclusion:
      "UNKNOWN",
  };
}
