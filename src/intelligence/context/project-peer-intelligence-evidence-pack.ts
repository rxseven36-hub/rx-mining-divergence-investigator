import type {
  RXPeerIntelligenceEvidencePack,
} from "./create-peer-intelligence-evidence-pack";

import type {
  RXIntelligenceEvidencePack,
  RXIntelligenceEvidencePackItem,
} from "./intelligence-evidence-pack";

type RXPeerEvidenceProjectionInput =
  Pick<
    RXPeerIntelligenceEvidencePack,
    | "planId"
    | "caseId"
    | "firstCompany"
    | "secondCompany"
    | "shared"
  >;

/**
 * Projects an already canonical peer intelligence evidence pack
 * into the investigation-mode-neutral evidence contract used by
 * shared evidence-bounded reasoning gates.
 *
 * Important:
 * - peer semantics remain authoritative in the peer pack,
 * - no evidence is added, removed, deduplicated, or reclassified,
 * - evidence ordering remains deterministic,
 * - no comparison, scoring, inference, API call, or LLM call occurs.
 */
export function projectPeerIntelligenceEvidencePack(
  pack:
    RXPeerEvidenceProjectionInput
): RXIntelligenceEvidencePack {
  const evidence:
    RXIntelligenceEvidencePackItem[] = [
      ...pack.firstCompany,
      ...pack.secondCompany,
      ...pack.shared,
    ].map(
      (item) => ({
        evidenceId:
          item.evidenceId,

        requestId:
          item.requestId,

        companyId:
          item.companyId,

        source:
          item.source,

        sourceReference:
          item.sourceReference,

        truthClass:
          item.truthClass,

        description:
          item.description,
      })
    );

  return {
    planId:
      pack.planId,

    caseId:
      pack.caseId,

    evidence,

    causalConclusion:
      "UNKNOWN",
  };
}
