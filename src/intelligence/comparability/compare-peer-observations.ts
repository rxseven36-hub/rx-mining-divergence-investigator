import type {
  RXNormalizedObservation,
} from "../../data/normalization/normalized-observation";

import {
  isSemanticKnowledgeKnown,
} from "../../data/normalization/semantic-state";

import type {
  RXPeerEligibilityResult,
} from "./peer-eligibility";

import type {
  RXPeerObservationComparabilityIssue,
  RXPeerObservationComparabilityResult,
} from "./peer-observation-comparability";

function samePeriod(
  left:
    RXNormalizedObservation,
  right:
    RXNormalizedObservation
): boolean {
  return (
    left.period.kind ===
      right.period.kind &&
    left.period.start ===
      right.period.start &&
    left.period.end ===
      right.period.end &&
    left.period.year ===
      right.period.year &&
    left.period.quarter ===
      right.period.quarter &&
    left.period.month ===
      right.period.month &&
    left.period.measurementYear ===
      right.period.measurementYear
  );
}

function peerPairMatches(
  leftCompanyId:
    string,
  rightCompanyId:
    string,
  eligibility:
    RXPeerEligibilityResult
): boolean {
  const direct =
    eligibility.leftCompanyId ===
      leftCompanyId &&
    eligibility.rightCompanyId ===
      rightCompanyId;

  const reverse =
    eligibility.leftCompanyId ===
      rightCompanyId &&
    eligibility.rightCompanyId ===
      leftCompanyId;

  return direct || reverse;
}

export function comparePeerObservations(
  left:
    RXNormalizedObservation,
  right:
    RXNormalizedObservation,
  peerEligibility:
    RXPeerEligibilityResult
): RXPeerObservationComparabilityResult {
  const issues:
    RXPeerObservationComparabilityIssue[] = [];

  if (
    peerEligibility.status !==
    "ELIGIBLE"
  ) {
    issues.push(
      "PEER_NOT_ELIGIBLE"
    );
  }

  if (
    !peerPairMatches(
      left.companyId,
      right.companyId,
      peerEligibility
    )
  ) {
    issues.push(
      "PEER_PAIR_MISMATCH"
    );
  }

  if (
    left.companyId ===
    right.companyId
  ) {
    issues.push(
      "SAME_COMPANY"
    );
  }

  if (
    left.metric !==
    right.metric
  ) {
    issues.push(
      "METRIC_NOT_ALIGNED"
    );
  }

  if (
    left.commodity !==
    right.commodity
  ) {
    issues.push(
      "COMMODITY_NOT_ALIGNED"
    );
  }

  if (
    left.commodity ===
      right.commodity &&
    !peerEligibility.sharedCommodities.includes(
      left.commodity
    )
  ) {
    issues.push(
      "COMMODITY_NOT_IN_PEER_BASIS"
    );
  }

  if (
    left.commoditySubtype !==
    right.commoditySubtype
  ) {
    issues.push(
      "COMMODITY_SUBTYPE_NOT_ALIGNED"
    );
  }

  if (
    left.value ===
      null ||
    right.value ===
      null
  ) {
    issues.push(
      "DATA_MISSING"
    );
  }

  if (
    !isSemanticKnowledgeKnown(
      left.semantic
    ) ||
    !isSemanticKnowledgeKnown(
      right.semantic
    )
  ) {
    issues.push(
      "SEMANTICS_UNKNOWN"
    );
  }

  if (
    left.unit.dimension ===
      "UNKNOWN" ||
    right.unit.dimension ===
      "UNKNOWN" ||
    left.unit.dimension !==
      right.unit.dimension ||
    left.unit.symbol !==
      right.unit.symbol
  ) {
    issues.push(
      "UNIT_NOT_COMPARABLE"
    );
  }

  if (
    !samePeriod(
      left,
      right
    )
  ) {
    issues.push(
      "TIME_NOT_ALIGNED"
    );
  }

  return {
    eligible:
      issues.length === 0,

    issues,

    causalConclusion:
      "UNKNOWN",
  };
}