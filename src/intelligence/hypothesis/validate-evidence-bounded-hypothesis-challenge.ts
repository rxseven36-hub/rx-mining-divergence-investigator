import {
  RXEvidenceBoundedHypothesisChallengeSchema,
} from "./evidence-bounded-hypothesis-challenge-schema";

import type {
  RXEvidenceBoundedHypothesisChallenge,
  RXHypothesisChallengeEvidenceReference,
} from "./evidence-bounded-hypothesis-challenge";

import type {
  RXEvidenceBoundedHypothesis,
} from "./evidence-bounded-hypothesis";

import type {
  RXPeerIntelligenceEvidencePack,
  RXPeerIntelligenceEvidencePackItem,
} from "../context/create-peer-intelligence-evidence-pack";

export type RXEvidenceBoundedHypothesisChallengeIssue =
  | "INVALID_OUTPUT"
  | "CASE_MISMATCH"
  | "PLAN_MISMATCH"
  | "HYPOTHESIS_MISMATCH"
  | "UNKNOWN_EVIDENCE"
  | "EVIDENCE_REQUEST_MISMATCH"
  | "DUPLICATE_EVIDENCE_REFERENCE";

export type RXEvidenceBoundedHypothesisChallengeValidation =
  | {
      valid: true;
      challenge:
        RXEvidenceBoundedHypothesisChallenge;
      issues: [];
    }
  | {
      valid: false;
      challenge: null;
      issues:
        RXEvidenceBoundedHypothesisChallengeIssue[];
    };

function referenceKey(
  reference:
    RXHypothesisChallengeEvidenceReference
): string {
  return JSON.stringify([
    reference.evidenceId,
    reference.requestId,
  ]);
}

function hasDuplicateReferences(
  references:
    RXHypothesisChallengeEvidenceReference[]
): boolean {
  const keys =
    references.map(referenceKey);

  return (
    new Set(keys).size !==
    keys.length
  );
}

function flattenEvidence(
  pack:
    RXPeerIntelligenceEvidencePack
): RXPeerIntelligenceEvidencePackItem[] {
  return [
    ...pack.firstCompany,
    ...pack.secondCompany,
    ...pack.shared,
  ];
}

function hasEvidenceId(
  evidence:
    RXPeerIntelligenceEvidencePackItem[],
  evidenceId:
    string
): boolean {
  return evidence.some(
    (item) =>
      item.evidenceId ===
      evidenceId
  );
}

function hasExactEvidenceReference(
  evidence:
    RXPeerIntelligenceEvidencePackItem[],
  reference:
    RXHypothesisChallengeEvidenceReference
): boolean {
  return evidence.some(
    (item) =>
      item.evidenceId ===
        reference.evidenceId &&
      item.requestId ===
        reference.requestId
  );
}

export function validateEvidenceBoundedHypothesisChallenge(
  candidate: unknown,
  hypothesis:
    RXEvidenceBoundedHypothesis,
  pack:
    RXPeerIntelligenceEvidencePack
): RXEvidenceBoundedHypothesisChallengeValidation {
  const parsed =
    RXEvidenceBoundedHypothesisChallengeSchema
      .safeParse(candidate);

  if (!parsed.success) {
    return {
      valid: false,
      challenge: null,
      issues: [
        "INVALID_OUTPUT",
      ],
    };
  }

  const challenge:
    RXEvidenceBoundedHypothesisChallenge =
      parsed.data;

  const issues:
    RXEvidenceBoundedHypothesisChallengeIssue[] =
      [];

  if (
    challenge.caseId !==
      pack.caseId ||
    challenge.caseId !==
      hypothesis.caseId
  ) {
    issues.push(
      "CASE_MISMATCH"
    );
  }

  if (
    challenge.planId !==
      pack.planId ||
    challenge.planId !==
      hypothesis.planId
  ) {
    issues.push(
      "PLAN_MISMATCH"
    );
  }

  if (
    challenge.hypothesisId !==
    hypothesis.hypothesisId
  ) {
    issues.push(
      "HYPOTHESIS_MISMATCH"
    );
  }

  const evidence =
    flattenEvidence(pack);

  if (
    challenge.challengingEvidence.some(
      (reference) =>
        !hasEvidenceId(
          evidence,
          reference.evidenceId
        )
    )
  ) {
    issues.push(
      "UNKNOWN_EVIDENCE"
    );
  }

  if (
    challenge.challengingEvidence.some(
      (reference) =>
        hasEvidenceId(
          evidence,
          reference.evidenceId
        ) &&
        !hasExactEvidenceReference(
          evidence,
          reference
        )
    )
  ) {
    issues.push(
      "EVIDENCE_REQUEST_MISMATCH"
    );
  }

  if (
    hasDuplicateReferences(
      challenge.challengingEvidence
    )
  ) {
    issues.push(
      "DUPLICATE_EVIDENCE_REFERENCE"
    );
  }

  if (issues.length > 0) {
    return {
      valid: false,
      challenge: null,
      issues,
    };
  }

  return {
    valid: true,
    challenge,
    issues: [],
  };
}
