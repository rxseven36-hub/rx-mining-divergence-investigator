import type {
  RXEvidenceCollectionResult,
} from "./evidence-collection";

import type {
  RXExecutedPeerInvestigationRequests,
} from "./execute-resolved-peer-investigation-requests";

export interface RXAdmittedPeerInvestigationEvidenceItem {
  requestId:
    string;

  target:
    | "FIRST_COMPANY"
    | "SECOND_COMPANY"
    | "SHARED";

  /**
   * Shared peer evidence deliberately has no company identity.
   */
  companyId:
    string | null;

  /**
   * Canonical source identity already resolved before execution.
   */
  sourceReference:
    string;

  /**
   * Evidence collection already admitted by the canonical
   * single-request execution boundary.
   *
   * This extraction boundary must never re-admit or reinterpret it.
   */
  collection:
    RXEvidenceCollectionResult;
}

export interface RXAdmittedPeerInvestigationEvidence {
  planId:
    string;

  caseId:
    string;

  evidence:
    RXAdmittedPeerInvestigationEvidenceItem[];

  admittedCount:
    number;

  /**
   * Evidence extraction only exposes already-admitted evidence.
   *
   * It does NOT:
   * - inspect raw execution payloads,
   * - re-run evidence admission,
   * - score or rank evidence,
   * - compare peer evidence,
   * - infer causal explanations,
   * - call an LLM.
   */
  causalConclusion:
    "UNKNOWN";
}

/**
 * Extracts already-admitted evidence from resolved peer
 * investigation execution outcomes.
 *
 * Outer execution must have reached the canonical routed
 * execution boundary, and the inner execution outcome must
 * explicitly report EVIDENCE_ADMITTED.
 *
 * All other outcomes remain excluded.
 */
export function extractAdmittedPeerInvestigationEvidence(
  execution:
    RXExecutedPeerInvestigationRequests
): RXAdmittedPeerInvestigationEvidence {
  const evidence =
    execution.outcomes.flatMap(
      (outcome) => {
        if (
          outcome.status !==
          "EXECUTED"
        ) {
          return [];
        }

        if (
          outcome.executionOutcome.status !==
          "EVIDENCE_ADMITTED"
        ) {
          return [];
        }

        return [
          {
            requestId:
              outcome.routing.context
                .requestId,

            target:
              outcome.routing.context
                .target,

            companyId:
              outcome.routing.context
                .companyId,

            sourceReference:
              outcome.routing.context
                .sourceReference,

            collection:
              outcome.executionOutcome
                .evidenceCollection,
          },
        ];
      }
    );

  return {
    planId:
      execution.planId,

    caseId:
      execution.caseId,

    evidence,

    admittedCount:
      evidence.length,

    causalConclusion:
      "UNKNOWN",
  };
}
