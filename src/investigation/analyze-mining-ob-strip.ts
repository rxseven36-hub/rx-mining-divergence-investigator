import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  RXMiningObStripEvidenceAdmissionResult,
} from "./admit-mining-ob-strip-evidence";

export type RXObStripAvailability =
  | "BOTH_AVAILABLE"
  | "OVERBURDEN_ONLY"
  | "STRIP_RATIO_ONLY"
  | "NO_COMPARABLE_EVIDENCE";

export interface RXMiningObStripAnalysisResult {
  status:
    "ANALYZED" |
    "INSUFFICIENT_EVIDENCE";

  companyId:
    string;

  periodYear:
    number | null;

  overburden:
    RXNormalizedObservation | null;

  stripRatio:
    RXNormalizedObservation | null;

  availability:
    RXObStripAvailability;

  observedRelationship:
    string;

  /**
   * Deterministic evidence inspection does not establish
   * why the observations have these values.
   */
  causalConclusion:
    "UNKNOWN";
}

function latestObservation(
  observations:
    RXNormalizedObservation[],
  metric:
    "OVERBURDEN" |
    "STRIP_RATIO"
): RXNormalizedObservation | null {
  const candidates =
    observations.filter(
      (observation) =>
        observation.metric === metric &&
        observation.value !== null
    );

  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort(
    (left, right) =>
      (right.period.year ?? -1) -
      (left.period.year ?? -1)
  )[0] ?? null;
}

/**
 * Deterministically summarizes admitted OB / Strip evidence.
 *
 * This function:
 * - consumes admitted observations only;
 * - never reads broader unadmitted observations;
 * - never estimates missing values;
 * - never converts null to zero;
 * - never establishes causality.
 *
 * V2.4B intentionally describes availability and observed
 * values only. Historical trend/delta semantics can be added
 * later when a multi-period investigation case requires them.
 */
export function analyzeMiningObStrip(
  admission:
    RXMiningObStripEvidenceAdmissionResult
): RXMiningObStripAnalysisResult {
  if (
    admission.status !==
    "ADMITTED"
  ) {
    return {
      status:
        "INSUFFICIENT_EVIDENCE",

      companyId:
        "UNKNOWN",

      periodYear:
        null,

      overburden:
        null,

      stripRatio:
        null,

      availability:
        "NO_COMPARABLE_EVIDENCE",

      observedRelationship:
        "No admitted overburden or strip-ratio evidence is available for deterministic analysis.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const admitted =
    admission.admittedObservations;

  const overburden =
    latestObservation(
      admitted,
      "OVERBURDEN"
    );

  const stripRatio =
    latestObservation(
      admitted,
      "STRIP_RATIO"
    );

  const companyId =
    overburden?.companyId ??
    stripRatio?.companyId ??
    "UNKNOWN";

  const periodYear =
    overburden?.period.year ??
    stripRatio?.period.year ??
    null;

  if (
    overburden &&
    stripRatio
  ) {
    return {
      status:
        "ANALYZED",

      companyId,

      periodYear,

      overburden,

      stripRatio,

      availability:
        "BOTH_AVAILABLE",

      observedRelationship:
        `Admitted evidence reports overburden removal ${overburden.value} and strip ratio ${stripRatio.value} for the selected performance period.`,

      causalConclusion:
        "UNKNOWN",
    };
  }

  if (overburden) {
    return {
      status:
        "ANALYZED",

      companyId,

      periodYear,

      overburden,

      stripRatio:
        null,

      availability:
        "OVERBURDEN_ONLY",

      observedRelationship:
        `Admitted evidence reports overburden removal ${overburden.value}; no admitted strip-ratio value is available for the selected evidence.`,

      causalConclusion:
        "UNKNOWN",
    };
  }

  if (stripRatio) {
    return {
      status:
        "ANALYZED",

      companyId,

      periodYear,

      overburden:
        null,

      stripRatio,

      availability:
        "STRIP_RATIO_ONLY",

      observedRelationship:
        `Admitted evidence reports strip ratio ${stripRatio.value}; no admitted overburden-removal value is available for the selected evidence.`,

      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status:
      "INSUFFICIENT_EVIDENCE",

    companyId,

    periodYear,

    overburden:
      null,

    stripRatio:
      null,

    availability:
      "NO_COMPARABLE_EVIDENCE",

    observedRelationship:
      "No admitted overburden or strip-ratio values are available for deterministic analysis.",

    causalConclusion:
      "UNKNOWN",
  };
}