import type {
  RXEvidenceCollectionResult,
} from "../../investigation/evidence-collection";

import type {
  RXIntelligenceContext,
  RXIntelligenceEvidenceGroup,
  RXIntelligenceEvidenceScope,
  RXIntelligenceSubject,
} from "./intelligence-context";

export interface RXIntelligenceContextEvidenceInput {
  scope:
    RXIntelligenceEvidenceScope;

  /**
   * Admission status belongs to the admission boundary that
   * produced this collection.
   *
   * The context builder does not attempt to re-admit evidence.
   */
  admissionStatus:
    "ADMITTED" | "REJECTED";

  collection:
    RXEvidenceCollectionResult;
}

export interface CreateRXIntelligenceContextInput {
  subject:
    RXIntelligenceSubject;

  evidence:
    RXIntelligenceContextEvidenceInput[];
}

function isAdmittedAvailableEvidence(
  input:
    RXIntelligenceContextEvidenceInput
): boolean {
  return (
    input.admissionStatus ===
      "ADMITTED" &&
    input.collection.status ===
      "AVAILABLE"
  );
}

function createEvidenceGroup(
  input:
    RXIntelligenceContextEvidenceInput
): RXIntelligenceEvidenceGroup {
  return {
    scope:
      input.scope,

    relationship:
      "ADMITTED_FOR_CONTEXT",

    collection: {
      ...input.collection,

      evidence:
        input.collection.evidence.map(
          (item) => ({
            ...item,
          })
        ),

      issues: [
        ...input.collection.issues,
      ],
    },
  };
}

export function createRXIntelligenceContext(
  input:
    CreateRXIntelligenceContextInput
): RXIntelligenceContext {
  const evidenceGroups =
    input.evidence
      .filter(
        isAdmittedAvailableEvidence
      )
      .map(
        createEvidenceGroup
      );

  return {
    subject: {
      ...input.subject,
    },

    evidenceGroups,

    causalConclusion:
      "UNKNOWN",
  };
}