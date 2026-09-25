import type {
  RXNormalizedMiningSalesDestinationObservation,
} from "../data/normalization/normalize-mining-sales-destination";

import type {
  RXMiningSalesDestinationEvidenceAdmissionResult,
} from "./admit-mining-sales-destination-evidence";

export interface RXMiningSalesDestinationAnalysisResult {
  status:
    | "ANALYZED"
    | "INSUFFICIENT_EVIDENCE";

  companyId:
    string;

  years:
    number[];

  destinations:
    RXNormalizedMiningSalesDestinationObservation[];

  destinationCount:
    number;

  observationCount:
    number;

  observationsWithRevenue:
    number;

  observationsWithRevenueShare:
    number;

  observationsWithVolume:
    number;

  observationsWithVolumeShare:
    number;

  observedRelationship:
    string;

  causalConclusion:
    "UNKNOWN";
}

function insufficient(
  message:
    string
): RXMiningSalesDestinationAnalysisResult {
  return {
    status:
      "INSUFFICIENT_EVIDENCE",

    companyId:
      "UNKNOWN",

    years:
      [],

    destinations:
      [],

    destinationCount:
      0,

    observationCount:
      0,

    observationsWithRevenue:
      0,

    observationsWithRevenueShare:
      0,

    observationsWithVolume:
      0,

    observationsWithVolumeShare:
      0,

    observedRelationship:
      message,

    causalConclusion:
      "UNKNOWN",
  };
}

/**
 * Deterministically summarizes admitted provider facts.
 *
 * IMPORTANT:
 * - destinationLabel remains provider-defined;
 * - null values remain null;
 * - no missing percentage is calculated;
 * - no domestic/export classification is invented;
 * - no concentration score or ranking is created;
 * - no causal explanation is inferred.
 */
export function analyzeMiningSalesDestination(
  admission:
    RXMiningSalesDestinationEvidenceAdmissionResult
): RXMiningSalesDestinationAnalysisResult {
  if (
    admission.status !==
      "ADMITTED"
  ) {
    return insufficient(
      "No admitted mining sales-destination evidence is available for deterministic analysis."
    );
  }

  const admitted =
    admission.admittedObservations;

  if (admitted.length === 0) {
    return insufficient(
      "No admitted mining sales-destination observations are available for deterministic analysis."
    );
  }

  const destinations =
    [...admitted].sort(
      (left, right) =>
        left.destinationLabel.localeCompare(
          right.destinationLabel
        )
    );

  const years = [
    ...new Set(
      destinations.map(
        (observation) =>
          observation.year
      )
    ),
  ].sort(
    (left, right) =>
      left - right
  );

  const companyId =
    destinations[0]?.companyId ??
    "UNKNOWN";

  const observationsWithRevenue =
    destinations.filter(
      (observation) =>
        observation.revenueUsd !== null
    ).length;

  const observationsWithRevenueShare =
    destinations.filter(
      (observation) =>
        observation.percentageOfTotalRevenue !==
        null
    ).length;

  const observationsWithVolume =
    destinations.filter(
      (observation) =>
        observation.volume !== null
    ).length;

  const observationsWithVolumeShare =
    destinations.filter(
      (observation) =>
        observation.percentageOfSalesVolume !==
        null
    ).length;

  return {
    status:
      "ANALYZED",

    companyId,

    years,

    destinations,

    destinationCount:
      destinations.length,

    observationCount:
      destinations.length,

    observationsWithRevenue,

    observationsWithRevenueShare,

    observationsWithVolume,

    observationsWithVolumeShare,

    observedRelationship:
      `Admitted Sectors evidence reports ${destinations.length} provider-defined sales-destination observations. RX preserves provider destination labels and reported fields without deriving missing values or causal explanations.`,

    causalConclusion:
      "UNKNOWN",
  };
}