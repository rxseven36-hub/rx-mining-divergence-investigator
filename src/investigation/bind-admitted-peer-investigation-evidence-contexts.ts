import type {
  RXAdmittedPeerInvestigationEvidence,
  RXAdmittedPeerInvestigationEvidenceItem,
} from "./extract-admitted-peer-investigation-evidence";

import type {
  RXPeerInvestigationTargetContexts,
} from "./resolve-peer-investigation-target-contexts";

type RXPeerCanonicalCommodity =
  RXPeerInvestigationTargetContexts["shared"]["commodity"];

type RXPeerCanonicalPeriod =
  RXPeerInvestigationTargetContexts["shared"]["period"];

export type RXPeerEvidenceContextBindingIssue =
  | "FIRST_COMPANY_ID_MISMATCH"
  | "SECOND_COMPANY_ID_MISMATCH"
  | "SHARED_COMPANY_ID_PRESENT";

export interface RXContextBoundPeerInvestigationEvidenceItem {
  requestId:
    string;

  target:
    | "FIRST_COMPANY"
    | "SECOND_COMPANY"
    | "SHARED";

  /**
   * Shared peer evidence deliberately remains companyless.
   */
  companyId:
    string | null;

  /**
   * Canonical source identity preserved from the routed
   * execution lineage.
   */
  sourceReference:
    string;

  /**
   * Canonical comparison commodity comes only from the
   * already-resolved peer target contexts.
   */
  commodity:
    RXPeerCanonicalCommodity;

  /**
   * Canonical comparison period comes only from the
   * already-resolved peer target contexts.
   */
  period:
    RXPeerCanonicalPeriod;

  /**
   * Already-admitted evidence collection.
   *
   * This boundary never re-admits or reinterprets it.
   */
  collection:
    RXAdmittedPeerInvestigationEvidenceItem["collection"];
}

export interface RXPeerEvidenceContextBindingRejection {
  requestId:
    string;

  target:
    RXAdmittedPeerInvestigationEvidenceItem["target"];

  issue:
    RXPeerEvidenceContextBindingIssue;
}

export type RXContextBoundPeerInvestigationEvidence =
  | {
      status:
        "BOUND";

      planId:
        string;

      caseId:
        string;

      evidence:
        RXContextBoundPeerInvestigationEvidenceItem[];

      boundCount:
        number;

      rejections:
        [];

      /**
       * Context binding never establishes causality.
       */
      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "REJECTED";

      planId:
        string;

      caseId:
        string;

      /**
       * Context binding is a hard deterministic boundary.
       *
       * Any corrupted target identity rejects the complete
       * binding result instead of exposing partially bound
       * peer evidence.
       */
      evidence:
        [];

      boundCount:
        0;

      rejections:
        RXPeerEvidenceContextBindingRejection[];

      causalConclusion:
        "UNKNOWN";
    };

function validateItemIdentity(
  item:
    RXAdmittedPeerInvestigationEvidenceItem,
  contexts:
    RXPeerInvestigationTargetContexts
): RXPeerEvidenceContextBindingRejection | null {
  switch (item.target) {
    case "FIRST_COMPANY":
      return item.companyId ===
        contexts.firstCompany.companyId
        ? null
        : {
            requestId:
              item.requestId,

            target:
              item.target,

            issue:
              "FIRST_COMPANY_ID_MISMATCH",
          };

    case "SECOND_COMPANY":
      return item.companyId ===
        contexts.secondCompany.companyId
        ? null
        : {
            requestId:
              item.requestId,

            target:
              item.target,

            issue:
              "SECOND_COMPANY_ID_MISMATCH",
          };

    case "SHARED":
      return item.companyId ===
        null
        ? null
        : {
            requestId:
              item.requestId,

            target:
              item.target,

            issue:
              "SHARED_COMPANY_ID_PRESENT",
          };
  }
}

function bindItem(
  item:
    RXAdmittedPeerInvestigationEvidenceItem,
  contexts:
    RXPeerInvestigationTargetContexts
): RXContextBoundPeerInvestigationEvidenceItem {
  switch (item.target) {
    case "FIRST_COMPANY":
      return {
        requestId:
          item.requestId,

        target:
          item.target,

        companyId:
          item.companyId,

        sourceReference:
          item.sourceReference,

        commodity:
          contexts.firstCompany.commodity,

        period:
          structuredClone(
            contexts.firstCompany.period
          ),

        collection:
          item.collection,
      };

    case "SECOND_COMPANY":
      return {
        requestId:
          item.requestId,

        target:
          item.target,

        companyId:
          item.companyId,

        sourceReference:
          item.sourceReference,

        commodity:
          contexts.secondCompany.commodity,

        period:
          structuredClone(
            contexts.secondCompany.period
          ),

        collection:
          item.collection,
      };

    case "SHARED":
      return {
        requestId:
          item.requestId,

        target:
          item.target,

        companyId:
          null,

        sourceReference:
          item.sourceReference,

        commodity:
          contexts.shared.commodity,

        period:
          structuredClone(
            contexts.shared.period
          ),

        collection:
          item.collection,
      };
  }
}

/**
 * Binds already-admitted peer investigation evidence to
 * canonical target contexts that were resolved before
 * execution.
 *
 * This boundary:
 * - never reconstructs commodity or period from source strings,
 * - never repairs corrupted company identity,
 * - never re-runs evidence admission,
 * - never inspects raw execution payloads,
 * - never scores, ranks, compares, or detects divergence,
 * - never creates intelligence context,
 * - never calls an API or LLM,
 * - never infers causal explanations.
 */
export function bindAdmittedPeerInvestigationEvidenceContexts(
  admitted:
    RXAdmittedPeerInvestigationEvidence,
  contexts:
    RXPeerInvestigationTargetContexts
): RXContextBoundPeerInvestigationEvidence {
  const rejections =
    admitted.evidence.flatMap(
      (item) => {
        const rejection =
          validateItemIdentity(
            item,
            contexts
          );

        return rejection === null
          ? []
          : [
              rejection,
            ];
      }
    );

  if (rejections.length > 0) {
    return {
      status:
        "REJECTED",

      planId:
        admitted.planId,

      caseId:
        admitted.caseId,

      evidence: [],

      boundCount: 0,

      rejections,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const evidence =
    admitted.evidence.map(
      (item) =>
        bindItem(
          item,
          contexts
        )
    );

  return {
    status:
      "BOUND",

    planId:
      admitted.planId,

    caseId:
      admitted.caseId,

    evidence,

    boundCount:
      evidence.length,

    rejections: [],

    causalConclusion:
      "UNKNOWN",
  };
}
