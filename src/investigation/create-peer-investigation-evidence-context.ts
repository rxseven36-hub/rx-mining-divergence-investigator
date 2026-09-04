import type {
  RXContextBoundPeerInvestigationEvidence,
  RXContextBoundPeerInvestigationEvidenceItem,
} from "./bind-admitted-peer-investigation-evidence-contexts";

export interface RXPeerInvestigationEvidenceContext {
  planId:
    string;

  caseId:
    string;

  /**
   * Already-admitted, canonically-bound evidence belonging
   * to the first peer company.
   */
  firstCompany:
    RXContextBoundPeerInvestigationEvidenceItem[];

  /**
   * Already-admitted, canonically-bound evidence belonging
   * to the second peer company.
   */
  secondCompany:
    RXContextBoundPeerInvestigationEvidenceItem[];

  /**
   * Already-admitted, canonically-bound evidence that is
   * deliberately shared across the peer comparison.
   */
  shared:
    RXContextBoundPeerInvestigationEvidenceItem[];

  /**
   * Derived only from the evidence actually exposed by this
   * context.
   */
  evidenceCount:
    number;

  /**
   * Grouping canonical peer evidence never establishes
   * causality.
   */
  causalConclusion:
    "UNKNOWN";
}

export type RXPeerInvestigationEvidenceContextCreationResult =
  | {
      status:
        "CREATED";

      context:
        RXPeerInvestigationEvidenceContext;

      issue:
        null;
    }
  | {
      status:
        "REJECTED";

      context:
        null;

      issue:
        "PEER_EVIDENCE_CONTEXT_NOT_BOUND";
    };

/**
 * Creates a peer-specific evidence context from evidence that
 * has already passed admission and canonical target binding.
 *
 * This boundary only groups evidence by its already-proven
 * peer target.
 *
 * It does NOT:
 * - re-run evidence admission or availability filtering,
 * - reconstruct or repair target identity,
 * - parse source references,
 * - inspect raw execution payloads,
 * - score, rank, compare, or detect divergence,
 * - create a generic intelligence context,
 * - call an API or LLM,
 * - infer causal explanations.
 */
export function createPeerInvestigationEvidenceContext(
  bound:
    RXContextBoundPeerInvestigationEvidence
): RXPeerInvestigationEvidenceContextCreationResult {
  if (bound.status !== "BOUND") {
    return {
      status:
        "REJECTED",

      context:
        null,

      issue:
        "PEER_EVIDENCE_CONTEXT_NOT_BOUND",
    };
  }

  const firstCompany =
    bound.evidence.filter(
      (item) =>
        item.target ===
        "FIRST_COMPANY"
    );

  const secondCompany =
    bound.evidence.filter(
      (item) =>
        item.target ===
        "SECOND_COMPANY"
    );

  const shared =
    bound.evidence.filter(
      (item) =>
        item.target ===
        "SHARED"
    );

  return {
    status:
      "CREATED",

    context: {
      planId:
        bound.planId,

      caseId:
        bound.caseId,

      firstCompany,

      secondCompany,

      shared,

      evidenceCount:
        firstCompany.length +
        secondCompany.length +
        shared.length,

      causalConclusion:
        "UNKNOWN",
    },

    issue:
      null,
  };
}
