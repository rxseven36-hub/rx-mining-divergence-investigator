import type {
  RXGeologicalMetric,
  RXNormalizedGeologicalObservation,
} from "../data/normalization/normalize-mining-resources-reserves";

import type {
  RXMiningResourcesReservesEvidenceAdmissionResult,
} from "./admit-mining-resources-reserves-evidence";

export type RXResourcesReservesAvailability =
  | "BOTH_TOTALS_AVAILABLE"
  | "RESOURCE_ONLY"
  | "RESERVE_ONLY"
  | "COMPONENTS_ONLY"
  | "NO_GEOLOGICAL_EVIDENCE";

export interface RXMiningResourcesReservesAnalysisResult {
  status:
    | "ANALYZED"
    | "INSUFFICIENT_EVIDENCE";

  companyId:
    string;

  measurementYear:
    number | null;

  sourcePerformanceYear:
    number | null;

  totalResource:
    RXNormalizedGeologicalObservation | null;

  totalReserve:
    RXNormalizedGeologicalObservation | null;

  resourceComponents:
    RXNormalizedGeologicalObservation[];

  reserveComponents:
    RXNormalizedGeologicalObservation[];

  availability:
    RXResourcesReservesAvailability;

  observedRelationship:
    string;

  /**
   * Geological evidence establishes reported quantities,
   * not why those quantities have those values.
   */
  causalConclusion:
    "UNKNOWN";
}

const RESOURCE_COMPONENTS:
  RXGeologicalMetric[] = [
    "MEASURED_RESOURCE",
    "INDICATED_RESOURCE",
    "INFERRED_RESOURCE",
  ];

const RESERVE_COMPONENTS:
  RXGeologicalMetric[] = [
    "PROVEN_RESERVE",
    "PROBABLE_RESERVE",
  ];

function latestObservation(
  observations:
    RXNormalizedGeologicalObservation[],

  metric:
    RXGeologicalMetric,
): RXNormalizedGeologicalObservation | null {
  const candidates =
    observations.filter(
      (observation) =>
        observation.metric === metric,
    );

  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort(
    (left, right) =>
      (right.measurementYear ?? -1) -
      (left.measurementYear ?? -1),
  )[0] ?? null;
}

function latestComponents(
  observations:
    RXNormalizedGeologicalObservation[],

  metrics:
    RXGeologicalMetric[],
): RXNormalizedGeologicalObservation[] {
  return metrics.flatMap(
    (metric) => {
      const observation =
        latestObservation(
          observations,
          metric,
        );

      return observation
        ? [observation]
        : [];
    },
  );
}

/**
 * Deterministically summarizes admitted geological evidence.
 *
 * This function:
 * - consumes admitted observations only;
 * - never reads broader performance observations;
 * - never derives totals from components;
 * - never derives components from totals;
 * - never substitutes performance year for geological
 *   measurement year;
 * - never estimates missing values;
 * - never establishes causality.
 */
export function analyzeMiningResourcesReserves(
  admission:
    RXMiningResourcesReservesEvidenceAdmissionResult,
): RXMiningResourcesReservesAnalysisResult {
  if (
    admission.status !==
    "ADMITTED"
  ) {
    return {
      status:
        "INSUFFICIENT_EVIDENCE",

      companyId:
        "UNKNOWN",

      measurementYear:
        null,

      sourcePerformanceYear:
        null,

      totalResource:
        null,

      totalReserve:
        null,

      resourceComponents:
        [],

      reserveComponents:
        [],

      availability:
        "NO_GEOLOGICAL_EVIDENCE",

      observedRelationship:
        "No admitted resource or reserve evidence is available for deterministic geological analysis.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const admitted =
    admission.admittedObservations;

  const totalResource =
    latestObservation(
      admitted,
      "TOTAL_RESOURCE",
    );

  const totalReserve =
    latestObservation(
      admitted,
      "TOTAL_RESERVE",
    );

  const resourceComponents =
    latestComponents(
      admitted,
      RESOURCE_COMPONENTS,
    );

  const reserveComponents =
    latestComponents(
      admitted,
      RESERVE_COMPONENTS,
    );

  const representative =
    totalResource ??
    totalReserve ??
    resourceComponents[0] ??
    reserveComponents[0] ??
    null;

  const companyId =
    representative?.companyId ??
    "UNKNOWN";

  const measurementYear =
    representative?.measurementYear ??
    null;

  const sourcePerformanceYear =
    representative?.sourcePerformanceYear ??
    null;

  if (
    totalResource &&
    totalReserve
  ) {
    return {
      status:
        "ANALYZED",

      companyId,

      measurementYear,

      sourcePerformanceYear,

      totalResource,

      totalReserve,

      resourceComponents,

      reserveComponents,

      availability:
        "BOTH_TOTALS_AVAILABLE",

      observedRelationship:
        `Admitted geological evidence reports total resources ${totalResource.value} Mt and total reserves ${totalReserve.value} Mt${measurementYear === null ? "" : ` for geological measurement year ${measurementYear}`}.`,

      causalConclusion:
        "UNKNOWN",
    };
  }

  if (totalResource) {
    return {
      status:
        "ANALYZED",

      companyId,

      measurementYear,

      sourcePerformanceYear,

      totalResource,

      totalReserve:
        null,

      resourceComponents,

      reserveComponents,

      availability:
        "RESOURCE_ONLY",

      observedRelationship:
        `Admitted geological evidence reports total resources ${totalResource.value} Mt; no admitted total-reserve value is available for the selected evidence.`,

      causalConclusion:
        "UNKNOWN",
    };
  }

  if (totalReserve) {
    return {
      status:
        "ANALYZED",

      companyId,

      measurementYear,

      sourcePerformanceYear,

      totalResource:
        null,

      totalReserve,

      resourceComponents,

      reserveComponents,

      availability:
        "RESERVE_ONLY",

      observedRelationship:
        `Admitted geological evidence reports total reserves ${totalReserve.value} Mt; no admitted total-resource value is available for the selected evidence.`,

      causalConclusion:
        "UNKNOWN",
    };
  }

  if (
    resourceComponents.length > 0 ||
    reserveComponents.length > 0
  ) {
    return {
      status:
        "ANALYZED",

      companyId,

      measurementYear,

      sourcePerformanceYear,

      totalResource:
        null,

      totalReserve:
        null,

      resourceComponents,

      reserveComponents,

      availability:
        "COMPONENTS_ONLY",

      observedRelationship:
        "Admitted geological component evidence is available, but RX does not derive an unreported total resource or total reserve from those components.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status:
      "INSUFFICIENT_EVIDENCE",

    companyId,

    measurementYear,

    sourcePerformanceYear,

    totalResource:
      null,

    totalReserve:
      null,

    resourceComponents:
      [],

    reserveComponents:
      [],

    availability:
      "NO_GEOLOGICAL_EVIDENCE",

    observedRelationship:
      "No admitted resource or reserve values are available for deterministic geological analysis.",

    causalConclusion:
      "UNKNOWN",
  };
}