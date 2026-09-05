import {
  RXEvidenceBoundedIntelligenceBriefSchema,
} from "./evidence-bounded-intelligence-brief-schema";

import type {
  RXEvidenceBoundedIntelligenceBrief,
  RXIntelligenceBriefEvidenceReference,
} from "./evidence-bounded-intelligence-brief";

import type {
  RXEvidenceBoundedHypothesis,
  RXHypothesisEvidenceReference,
} from "../hypothesis/evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisChallenge,
  RXHypothesisChallengeEvidenceReference,
} from "../hypothesis/evidence-bounded-hypothesis-challenge";

import type {
  RXPeerIntelligenceEvidencePack,
  RXPeerIntelligenceEvidencePackItem,
} from "../context/create-peer-intelligence-evidence-pack";

export type RXEvidenceBoundedIntelligenceBriefIssue =
  | "INVALID_OUTPUT"
  | "CASE_MISMATCH"
  | "PLAN_MISMATCH"
  | "HYPOTHESIS_MISMATCH"
  | "CHALLENGE_MISMATCH"
  | "UNKNOWN_EVIDENCE"
  | "EVIDENCE_REQUEST_MISMATCH"
  | "EVIDENCE_OUTSIDE_REASONING_CHAIN"
  | "DUPLICATE_EVIDENCE_REFERENCE";

export type RXEvidenceBoundedIntelligenceBriefValidation =
  | {
      valid: true;
      brief:
        RXEvidenceBoundedIntelligenceBrief;
      issues: [];
    }
  | {
      valid: false;
      brief: null;
      issues:
        RXEvidenceBoundedIntelligenceBriefIssue[];
    };

type RXReasoningEvidenceReference =
  | RXHypothesisEvidenceReference
  | RXHypothesisChallengeEvidenceReference
  | RXIntelligenceBriefEvidenceReference;

function referenceKey(
  reference:
    RXReasoningEvidenceReference
): string {
  return JSON.stringify([
    reference.evidenceId,
    reference.requestId,
  ]);
}

function hasDuplicateReferences(
  references:
    RXIntelligenceBriefEvidenceReference[]
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
    RXIntelligenceBriefEvidenceReference
): boolean {
  return evidence.some(
    (item) =>
      item.evidenceId ===
        reference.evidenceId &&
      item.requestId ===
        reference.requestId
  );
}

function createReasoningReferenceKeys(
  hypothesis:
    RXEvidenceBoundedHypothesis,
  challenge:
    RXEvidenceBoundedHypothesisChallenge
): Set<string> {
  return new Set(
    [
      ...hypothesis.supportingEvidence,
      ...hypothesis.counterEvidence,
      ...challenge.challengingEvidence,
    ].map(referenceKey)
  );
}

export function validateEvidenceBoundedIntelligenceBrief(
  candidate: unknown,
  hypothesis:
    RXEvidenceBoundedHypothesis,
  challenge:
    RXEvidenceBoundedHypothesisChallenge,
  pack:
    RXPeerIntelligenceEvidencePack
): RXEvidenceBoundedIntelligenceBriefValidation {
  const parsed =
    RXEvidenceBoundedIntelligenceBriefSchema
      .safeParse(candidate);

  if (!parsed.success) {
    return {
      valid: false,
      brief: null,
      issues: [
        "INVALID_OUTPUT",
      ],
    };
  }

  const brief:
    RXEvidenceBoundedIntelligenceBrief =
      parsed.data;

  const issues:
    RXEvidenceBoundedIntelligenceBriefIssue[] =
      [];

  if (
    brief.caseId !==
      pack.caseId ||
    brief.caseId !==
      hypothesis.caseId ||
    brief.caseId !==
      challenge.caseId
  ) {
    issues.push(
      "CASE_MISMATCH"
    );
  }

  if (
    brief.planId !==
      pack.planId ||
    brief.planId !==
      hypothesis.planId ||
    brief.planId !==
      challenge.planId
  ) {
    issues.push(
      "PLAN_MISMATCH"
    );
  }

  if (
    brief.hypothesisId !==
      hypothesis.hypothesisId ||
    brief.hypothesisId !==
      challenge.hypothesisId
  ) {
    issues.push(
      "HYPOTHESIS_MISMATCH"
    );
  }

  if (
    brief.challengeId !==
    challenge.challengeId
  ) {
    issues.push(
      "CHALLENGE_MISMATCH"
    );
  }

  const evidence =
    flattenEvidence(pack);

  if (
    brief.evidenceReferences.some(
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
    brief.evidenceReferences.some(
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

  const reasoningReferenceKeys =
    createReasoningReferenceKeys(
      hypothesis,
      challenge
    );

  if (
    brief.evidenceReferences.some(
      (reference) =>
        hasExactEvidenceReference(
          evidence,
          reference
        ) &&
        !reasoningReferenceKeys.has(
          referenceKey(reference)
        )
    )
  ) {
    issues.push(
      "EVIDENCE_OUTSIDE_REASONING_CHAIN"
    );
  }

  if (
    hasDuplicateReferences(
      brief.evidenceReferences
    )
  ) {
    issues.push(
      "DUPLICATE_EVIDENCE_REFERENCE"
    );
  }

  if (issues.length > 0) {
    return {
      valid: false,
      brief: null,
      issues,
    };
  }

  return {
    valid: true,
    brief,
    issues: [],
  };
}
