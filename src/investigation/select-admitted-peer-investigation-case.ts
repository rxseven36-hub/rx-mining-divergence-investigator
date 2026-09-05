import type {
  RXMiningOperationalContextEvidenceAdmissionResult,
} from "./admit-mining-operational-context-evidence";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "./admit-mining-historical-performance-evidence";

import {
  createTypedIntelligenceEvidence,
} from "../intelligence/context/create-typed-intelligence-evidence";

import {
  evaluatePeerEligibility,
} from "../intelligence/comparability/evaluate-peer-eligibility";

import {
  buildAdmittedPeerInvestigationQueue,
} from "./build-admitted-peer-investigation-queue";

import type {
  RXPeerInvestigationCase,
} from "./peer-investigation-case";

export interface RXAdmittedPeerInvestigationCaseSelectionInput {
  leftCompanyId:
    string;

  rightCompanyId:
    string;

  leftOperationalAdmission:
    RXMiningOperationalContextEvidenceAdmissionResult;

  rightOperationalAdmission:
    RXMiningOperationalContextEvidenceAdmissionResult;

  leftHistoricalAdmission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult;

  rightHistoricalAdmission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult;
}

export type RXAdmittedPeerInvestigationCaseSelectionResult =
  | {
      status:
        "SELECTED";

      investigationCase:
        RXPeerInvestigationCase;

      peerEligibility:
        ReturnType<
          typeof evaluatePeerEligibility
        >;

      queue:
        ReturnType<
          typeof buildAdmittedPeerInvestigationQueue
        >;

      causalConclusion:
        "UNKNOWN";

      issues:
        [];
    }
  | {
      status:
        "REJECTED";

      investigationCase:
        null;

      peerEligibility:
        ReturnType<
          typeof evaluatePeerEligibility
        >;

      queue:
        ReturnType<
          typeof buildAdmittedPeerInvestigationQueue
        > | null;

      causalConclusion:
        "UNKNOWN";

      issues:
        string[];
    };

/**
 * Selects the highest-ranked canonical peer investigation case
 * from evidence that has already passed RX admission boundaries.
 *
 * This application composition deliberately does NOT:
 * - call Sectors,
 * - admit evidence,
 * - manufacture operational facts,
 * - manufacture commodity identity,
 * - calculate peer eligibility independently,
 * - compare observations independently,
 * - calculate divergence independently,
 * - score or rank priorities independently,
 * - manufacture an investigation case,
 * - call AI,
 * - establish causality.
 */
export function selectAdmittedPeerInvestigationCase(
  input:
    RXAdmittedPeerInvestigationCaseSelectionInput
): RXAdmittedPeerInvestigationCaseSelectionResult {
  const operationalEvidence = [
    ...createTypedIntelligenceEvidence({
      kind:
        "OPERATIONAL",

      admission:
        input.leftOperationalAdmission,
    }),

    ...createTypedIntelligenceEvidence({
      kind:
        "OPERATIONAL",

      admission:
        input.rightOperationalAdmission,
    }),
  ];

  const peerEligibility =
    evaluatePeerEligibility({
      leftCompanyId:
        input.leftCompanyId,

      rightCompanyId:
        input.rightCompanyId,

      evidence:
        operationalEvidence,
    });

  if (
    peerEligibility.status !==
      "ELIGIBLE"
  ) {
    return {
      status:
        "REJECTED",

      investigationCase:
        null,

      peerEligibility,

      queue:
        null,

      causalConclusion:
        "UNKNOWN",

      issues: [
        ...peerEligibility.issues,
      ],
    };
  }

  if (
    input.leftHistoricalAdmission.status !==
      "ADMITTED" ||
    input.rightHistoricalAdmission.status !==
      "ADMITTED"
  ) {
    const issues:
      string[] = [];

    if (
      input.leftHistoricalAdmission.status !==
        "ADMITTED"
    ) {
      issues.push(
        "LEFT_HISTORICAL_EVIDENCE_NOT_ADMITTED"
      );
    }

    if (
      input.rightHistoricalAdmission.status !==
        "ADMITTED"
    ) {
      issues.push(
        "RIGHT_HISTORICAL_EVIDENCE_NOT_ADMITTED"
      );
    }

    return {
      status:
        "REJECTED",

      investigationCase:
        null,

      peerEligibility,

      queue:
        null,

      causalConclusion:
        "UNKNOWN",

      issues,
    };
  }

  const queue =
    buildAdmittedPeerInvestigationQueue({
      leftAdmission:
        input.leftHistoricalAdmission,

      rightAdmission:
        input.rightHistoricalAdmission,

      peerEligibility,
    });

  const investigationCase =
    queue.cases[0] ?? null;

  if (
    investigationCase === null
  ) {
    return {
      status:
        "REJECTED",

      investigationCase:
        null,

      peerEligibility,

      queue,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "NO_CANONICAL_PEER_INVESTIGATION_CASE",
      ],
    };
  }

  return {
    status:
      "SELECTED",

    investigationCase,

    peerEligibility,

    queue,

    causalConclusion:
      "UNKNOWN",

    issues: [],
  };
}