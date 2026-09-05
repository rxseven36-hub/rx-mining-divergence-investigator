import type {
  RXIntelligenceEvidencePack,
  RXIntelligenceEvidencePackItem,
} from "./intelligence-evidence-pack";

import type {
  RXPreparedInvestigationExecutionResult,
} from "../../investigation/execute-prepared-investigation";

export interface RXInvestigationIntelligenceEvidenceProjectionInput {
  companyId: string;

  execution:
    RXPreparedInvestigationExecutionResult;
}

/**
 * Projects already-admitted single-company investigation
 * evidence into the investigation-mode-neutral intelligence
 * evidence contract.
 *
 * This boundary does not collect, admit, reinterpret,
 * deduplicate, score, rank, compare, or infer evidence.
 *
 * Outcome order and evidence order are preserved exactly.
 */
export function projectInvestigationIntelligenceEvidencePack(
  input:
    RXInvestigationIntelligenceEvidenceProjectionInput
): RXIntelligenceEvidencePack {
  const evidence:
    RXIntelligenceEvidencePackItem[] =
      [];

  for (
    const outcome
    of input.execution.outcomes
  ) {
    if (
      outcome.status !==
      "EVIDENCE_ADMITTED"
    ) {
      continue;
    }

    for (
      const item
      of outcome.evidenceCollection.evidence
    ) {
      evidence.push({
        evidenceId:
          item.evidenceId,

        requestId:
          outcome.evidenceCollection.requestId,

        companyId:
          input.companyId,

        source:
          item.source,

        sourceReference:
          item.sourceReference,

        truthClass:
          item.truthClass,

        description:
          item.description,
      });
    }
  }

  return {
    planId:
      input.execution.planId,

    caseId:
      input.execution.caseId,

    evidence,

    causalConclusion:
      "UNKNOWN",
  };
}