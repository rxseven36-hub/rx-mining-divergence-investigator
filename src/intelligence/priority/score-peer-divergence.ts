import type {
  RXPeerDivergenceSignal,
} from "../comparability/peer-divergence-signal";

import type {
  RXPeerDivergencePriorityResult,
} from "./peer-divergence-priority";

import {
  divergenceRatioToPriorityScore,
} from "./score-divergence";

function basePeerPriorityResult(
  signal:
    RXPeerDivergenceSignal
) {
  return {
    leftCompanyId:
      signal.leftCompanyId,

    rightCompanyId:
      signal.rightCompanyId,

    leftObservationId:
      signal.leftObservationId,

    rightObservationId:
      signal.rightObservationId,

    metric:
      signal.metric,

    commodity:
      signal.commodity,

    leftCommoditySubtype:
      signal.leftCommoditySubtype,

    rightCommoditySubtype:
      signal.rightCommoditySubtype,

    leftUnit: {
      ...signal.leftUnit,
    },

    rightUnit: {
      ...signal.rightUnit,
    },

    leftPeriod: {
      ...signal.leftPeriod,
    },

    rightPeriod: {
      ...signal.rightPeriod,
    },

    causalConclusion:
      "UNKNOWN" as const,
  };
}

export function scorePeerDivergence(
  signal:
    RXPeerDivergenceSignal
): RXPeerDivergencePriorityResult {
  const base =
    basePeerPriorityResult(
      signal
    );

  if (
    signal.status !==
    "COMPARABLE"
  ) {
    return {
      ...base,

      status:
        "UNSCORABLE",

      score:
        null,

      divergenceMagnitude:
        null,

      unscorableReasons: [
        "SIGNAL_NOT_COMPARABLE",
      ],
    };
  }

  const relativeDifference =
    signal.relativeDifference;

  if (
    relativeDifference === null
  ) {
    return {
      ...base,

      status:
        "UNSCORABLE",

      score:
        null,

      divergenceMagnitude:
        null,

      unscorableReasons: [
        "RELATIVE_DIFFERENCE_UNDEFINED",
      ],
    };
  }

  if (
    !Number.isFinite(
      relativeDifference
    )
  ) {
    return {
      ...base,

      status:
        "UNSCORABLE",

      score:
        null,

      divergenceMagnitude:
        null,

      unscorableReasons: [
        "RELATIVE_DIFFERENCE_INVALID",
      ],
    };
  }

  const divergenceMagnitude =
    Math.abs(
      relativeDifference
    );

  if (
    divergenceMagnitude === 0
  ) {
    return {
      ...base,

      status:
        "UNSCORABLE",

      score:
        null,

      divergenceMagnitude:
        0,

      unscorableReasons: [
        "NO_DIVERGENCE",
      ],
    };
  }

  return {
    ...base,

    status:
      "SCORABLE",

    score:
      divergenceRatioToPriorityScore(
        divergenceMagnitude
      ),

    divergenceMagnitude,

    unscorableReasons:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}
