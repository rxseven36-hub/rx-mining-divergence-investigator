import type {
  RXNormalizedObservation,
} from "../../data/normalization/normalized-observation";

import type {
  RXPeerEligibilityResult,
} from "./peer-eligibility";

import {
  comparePeerObservations,
} from "./compare-peer-observations";

import type {
  RXPeerRelativePositionResult,
} from "./peer-relative-position";

export interface RXPeerRelativePositionCandidate {
  observation:
    RXNormalizedObservation;

  peerEligibility:
    RXPeerEligibilityResult;
}

export interface CalculatePeerRelativePositionInput {
  target:
    RXNormalizedObservation;

  peers:
    RXPeerRelativePositionCandidate[];
}

function mean(
  values:
    number[]
): number {
  return (
    values.reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    ) /
    values.length
  );
}

function median(
  values:
    number[]
): number {
  const sorted =
    [...values].sort(
      (
        left,
        right
      ) =>
        left - right
    );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 ===
    1
  ) {
    return sorted[
      middle
    ];
  }

  return (
    sorted[
      middle - 1
    ] +
    sorted[
      middle
    ]
  ) / 2;
}

export function calculatePeerRelativePosition(
  input:
    CalculatePeerRelativePositionInput
): RXPeerRelativePositionResult {
  const validPeers:
    RXNormalizedObservation[] = [];

  const rejectedPeers:
    RXPeerRelativePositionResult["rejectedPeers"] = [];

  for (
    const candidate
    of input.peers
  ) {
    const comparability =
      comparePeerObservations(
        input.target,
        candidate.observation,
        candidate.peerEligibility
      );

    if (
      comparability.eligible
    ) {
      validPeers.push(
        candidate.observation
      );

      continue;
    }

    rejectedPeers.push({
      observationId:
        candidate.observation.id,

      companyId:
        candidate.observation.companyId,

      comparabilityIssues:
        [...comparability.issues],
    });
  }

  if (
    validPeers.length === 0
  ) {
    return {
      status:
        "NOT_POSITIONED",

      targetObservationId:
        input.target.id,

      targetCompanyId:
        input.target.companyId,

      targetValue:
        input.target.value,

      peerCount:
        0,

      peerMean:
        null,

      peerMedian:
        null,

      differenceFromPeerMean:
        null,

      differenceFromPeerMedian:
        null,

      peersBelowTarget:
        0,

      peersEqualTarget:
        0,

      peersAboveTarget:
        0,

      includedPeerObservationIds:
        [],

      rejectedPeers,

      issues: [
        "NO_VALID_PEERS",
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  const peerValues =
    validPeers.map(
      (peer) =>
        peer.value
    );

  /**
   * Every peer reaching this point has passed
   * comparePeerObservations().
   *
   * That contract requires both target and peer values
   * to be non-null before comparability can be eligible.
   */
  const numericPeerValues =
    peerValues as number[];

  const targetValue =
    input.target.value as number;

  const peerMean =
    mean(
      numericPeerValues
    );

  const peerMedian =
    median(
      numericPeerValues
    );

  return {
    status:
      "POSITIONED",

    targetObservationId:
      input.target.id,

    targetCompanyId:
      input.target.companyId,

    targetValue,

    peerCount:
      numericPeerValues.length,

    peerMean,

    peerMedian,

    differenceFromPeerMean:
      targetValue -
      peerMean,

    differenceFromPeerMedian:
      targetValue -
      peerMedian,

    peersBelowTarget:
      numericPeerValues.filter(
        (value) =>
          value <
          targetValue
      ).length,

    peersEqualTarget:
      numericPeerValues.filter(
        (value) =>
          value ===
          targetValue
      ).length,

    peersAboveTarget:
      numericPeerValues.filter(
        (value) =>
          value >
          targetValue
      ).length,

    includedPeerObservationIds:
      validPeers.map(
        (peer) =>
          peer.id
      ),

    rejectedPeers,

    issues:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}