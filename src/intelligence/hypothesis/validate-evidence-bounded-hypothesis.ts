import {
  RXEvidenceBoundedHypothesisSchema,
} from "./evidence-bounded-hypothesis-schema";

import type {
  RXEvidenceBoundedHypothesis,
  RXHypothesisEvidenceReference,
} from "./evidence-bounded-hypothesis";

import type {
  RXPeerIntelligenceEvidencePack,
  RXPeerIntelligenceEvidencePackItem,
} from "../context/create-peer-intelligence-evidence-pack";

export type RXEvidenceBoundedHypothesisIssue =
  | "INVALID_OUTPUT"
  | "CASE_MISMATCH"
  | "PLAN_MISMATCH"
  | "UNKNOWN_EVIDENCE"
  | "EVIDENCE_REQUEST_MISMATCH"
  | "DUPLICATE_EVIDENCE_REFERENCE"
  | "CONFLICTING_EVIDENCE_REFERENCE";

export type RXEvidenceBoundedHypothesisValidation =
  | {
      valid: true;
      hypothesis: RXEvidenceBoundedHypothesis;
      issues: [];
    }
  | {
      valid: false;
      hypothesis: null;
      issues: RXEvidenceBoundedHypothesisIssue[];
    };

function referenceKey(
  reference: RXHypothesisEvidenceReference
): string {
  return JSON.stringify([
    reference.evidenceId,
    reference.requestId,
  ]);
}

function hasDuplicateReferences(
  references: RXHypothesisEvidenceReference[]
): boolean {
  const keys =
    references.map(referenceKey);

  return (
    new Set(keys).size !==
    keys.length
  );
}

function createEvidenceIndex(
  pack: RXPeerIntelligenceEvidencePack
): Map<
  string,
  RXPeerIntelligenceEvidencePackItem
> {
  const evidence =
    [
      ...pack.firstCompany,
      ...pack.secondCompany,
      ...pack.shared,
    ];

  return new Map(
    evidence.map(
      (item) => [
        item.evidenceId,
        item,
      ]
    )
  );
}

export function validateEvidenceBoundedHypothesis(
  candidate: unknown,
  pack: RXPeerIntelligenceEvidencePack
): RXEvidenceBoundedHypothesisValidation {
  const parsed =
    RXEvidenceBoundedHypothesisSchema
      .safeParse(candidate);

  if (!parsed.success) {
    return {
      valid: false,
      hypothesis: null,
      issues: [
        "INVALID_OUTPUT",
      ],
    };
  }

  const hypothesis:
    RXEvidenceBoundedHypothesis =
      parsed.data;

  const issues:
    RXEvidenceBoundedHypothesisIssue[] =
      [];

  if (
    hypothesis.caseId !==
    pack.caseId
  ) {
    issues.push(
      "CASE_MISMATCH"
    );
  }

  if (
    hypothesis.planId !==
    pack.planId
  ) {
    issues.push(
      "PLAN_MISMATCH"
    );
  }

  const evidenceIndex =
    createEvidenceIndex(pack);

  const allReferences = [
    ...hypothesis.supportingEvidence,
    ...hypothesis.counterEvidence,
  ];

  if (
    allReferences.some(
      (reference) =>
        !evidenceIndex.has(
          reference.evidenceId
        )
    )
  ) {
    issues.push(
      "UNKNOWN_EVIDENCE"
    );
  }

  if (
    allReferences.some(
      (reference) => {
        const evidence =
          evidenceIndex.get(
            reference.evidenceId
          );

        return (
          evidence !== undefined &&
          evidence.requestId !==
            reference.requestId
        );
      }
    )
  ) {
    issues.push(
      "EVIDENCE_REQUEST_MISMATCH"
    );
  }

  if (
    hasDuplicateReferences(
      allReferences
    )
  ) {
    issues.push(
      "DUPLICATE_EVIDENCE_REFERENCE"
    );
  }

  const supportingKeys =
    new Set(
      hypothesis.supportingEvidence.map(
        referenceKey
      )
    );

  if (
    hypothesis.counterEvidence.some(
      (reference) =>
        supportingKeys.has(
          referenceKey(reference)
        )
    )
  ) {
    issues.push(
      "CONFLICTING_EVIDENCE_REFERENCE"
    );
  }

  if (issues.length > 0) {
    return {
      valid: false,
      hypothesis: null,
      issues,
    };
  }

  return {
    valid: true,
    hypothesis,
    issues: [],
  };
}
