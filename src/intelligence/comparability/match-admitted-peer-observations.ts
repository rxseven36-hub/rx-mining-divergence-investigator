import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../../investigation/admit-mining-historical-performance-evidence";

import type {
  RXNormalizedObservation,
} from "../../data/normalization/normalized-observation";

import type {
  RXPeerEligibilityResult,
} from "./peer-eligibility";

import type {
  RXPeerObservationComparabilityResult,
} from "./peer-observation-comparability";

import {
  comparePeerObservations,
} from "./compare-peer-observations";

export interface RXAdmittedPeerObservationMatch {
  leftObservation:
    RXNormalizedObservation;

  rightObservation:
    RXNormalizedObservation;

  comparability:
    RXPeerObservationComparabilityResult;
}

export interface MatchAdmittedPeerObservationsInput {
  leftAdmission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult;

  rightAdmission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult;

  peerEligibility:
    RXPeerEligibilityResult;
}

export function matchAdmittedPeerObservations(
  input:
    MatchAdmittedPeerObservationsInput
): RXAdmittedPeerObservationMatch[] {
  if (
    input.leftAdmission.status !==
      "ADMITTED" ||
    input.rightAdmission.status !==
      "ADMITTED"
  ) {
    return [];
  }

  const matches:
    RXAdmittedPeerObservationMatch[] = [];

  for (
    const leftObservation
    of input.leftAdmission.admittedObservations
  ) {
    for (
      const rightObservation
      of input.rightAdmission.admittedObservations
    ) {
      const comparability =
        comparePeerObservations(
          leftObservation,
          rightObservation,
          input.peerEligibility
        );

      if (!comparability.eligible) {
        continue;
      }

      matches.push({
        leftObservation:
          structuredClone(
            leftObservation
          ),

        rightObservation:
          structuredClone(
            rightObservation
          ),

        comparability:
          structuredClone(
            comparability
          ),
      });
    }
  }

  return matches;
}
