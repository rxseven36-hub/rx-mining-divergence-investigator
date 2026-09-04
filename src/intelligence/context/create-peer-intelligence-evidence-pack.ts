import type {
  RXPeerInvestigationEvidenceContext,
} from "../../investigation/create-peer-investigation-evidence-context";

import type {
  RXContextBoundPeerInvestigationEvidenceItem,
} from "../../investigation/bind-admitted-peer-investigation-evidence-contexts";

import type {
  RXCollectedEvidenceItem,
} from "../../investigation/evidence-collection";

type RXPeerIntelligenceEvidenceTarget =
  RXContextBoundPeerInvestigationEvidenceItem["target"];

type RXPeerIntelligenceCommodity =
  RXContextBoundPeerInvestigationEvidenceItem["commodity"];

type RXPeerIntelligencePeriod =
  RXContextBoundPeerInvestigationEvidenceItem["period"];

export interface RXPeerIntelligenceEvidencePackItem {
  evidenceId:
    string;

  requestId:
    string;

  target:
    RXPeerIntelligenceEvidenceTarget;

  companyId:
    string | null;

  source:
    RXCollectedEvidenceItem["source"];

  sourceReference:
    string;

  truthClass:
    RXCollectedEvidenceItem["truthClass"];

  description:
    string;
}

export interface RXPeerIntelligenceEvidencePack {
  planId:
    string;

  caseId:
    string;

  commodity:
    RXPeerIntelligenceCommodity;

  period:
    RXPeerIntelligencePeriod;

  firstCompany:
    RXPeerIntelligenceEvidencePackItem[];

  secondCompany:
    RXPeerIntelligenceEvidencePackItem[];

  shared:
    RXPeerIntelligenceEvidencePackItem[];

  /**
   * Number of individual evidence facts exposed to the
   * intelligence layer, not the number of collections.
   */
  evidenceCount:
    number;

  /**
   * Projection of evidence never establishes causality.
   */
  causalConclusion:
    "UNKNOWN";
}

export type RXPeerIntelligenceEvidencePackCreationResult =
  | {
      status:
        "CREATED";

      pack:
        RXPeerIntelligenceEvidencePack;

      issue:
        null;
    }
  | {
      status:
        "REJECTED";

      pack:
        null;

      issue:
        "PEER_EVIDENCE_CONTEXT_EMPTY";
    };

function projectCollectionEvidence(
  bound:
    RXContextBoundPeerInvestigationEvidenceItem
): RXPeerIntelligenceEvidencePackItem[] {
  return bound.collection.evidence.map(
    (evidence) => ({
      evidenceId:
        evidence.evidenceId,

      requestId:
        bound.requestId,

      target:
        bound.target,

      companyId:
        bound.companyId,

      source:
        evidence.source,

      sourceReference:
        evidence.sourceReference,

      truthClass:
        evidence.truthClass,

      description:
        evidence.description,
    })
  );
}

/**
 * Creates the minimal deterministic evidence pack that may be
 * supplied to later intelligence-synthesis boundaries.
 *
 * The canonical peer investigation context remains the trusted
 * source. This function only projects explicitly allowlisted
 * evidence fields.
 *
 * It does NOT:
 * - expose entire evidence collections or raw execution payloads,
 * - expose collection status, issues, capabilities, or requirements,
 * - re-run evidence admission,
 * - reconstruct identity or parse source references,
 * - score, rank, compare, or detect divergence,
 * - generate or challenge hypotheses,
 * - call an API or LLM,
 * - infer causality.
 */
export function createPeerIntelligenceEvidencePack(
  context:
    RXPeerInvestigationEvidenceContext
): RXPeerIntelligenceEvidencePackCreationResult {
  const canonicalItem =
    context.firstCompany[0] ??
    context.secondCompany[0] ??
    context.shared[0];

  if (canonicalItem === undefined) {
    return {
      status:
        "REJECTED",

      pack:
        null,

      issue:
        "PEER_EVIDENCE_CONTEXT_EMPTY",
    };
  }

  const firstCompany =
    context.firstCompany.flatMap(
      projectCollectionEvidence
    );

  const secondCompany =
    context.secondCompany.flatMap(
      projectCollectionEvidence
    );

  const shared =
    context.shared.flatMap(
      projectCollectionEvidence
    );

  return {
    status:
      "CREATED",

    pack: {
      planId:
        context.planId,

      caseId:
        context.caseId,

      commodity:
        canonicalItem.commodity,

      period:
        structuredClone(
          canonicalItem.period
        ),

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
