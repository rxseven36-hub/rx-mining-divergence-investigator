import type {
  RXCollectedEvidenceItem,
} from "../../investigation/evidence-collection";

/**
 * Minimal canonical evidence item exposed to the
 * evidence-bounded intelligence layer.
 *
 * This contract is intentionally investigation-mode neutral.
 *
 * It does not encode peer/company comparison semantics.
 * Those semantics remain authoritative in the investigation
 * layer that produced and admitted the evidence.
 */
export interface RXIntelligenceEvidencePackItem {
  evidenceId:
    string;

  requestId:
    string;

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

/**
 * Minimal canonical evidence pack accepted by shared
 * evidence-bounded reasoning gates.
 *
 * Evidence has already passed its investigation-specific
 * admission and projection boundaries before reaching here.
 *
 * This contract does NOT:
 * - collect or admit evidence,
 * - establish company or peer comparability,
 * - score or rank divergence,
 * - infer causality,
 * - grant AI authority over canonical evidence.
 */
export interface RXIntelligenceEvidencePack {
  planId:
    string;

  caseId:
    string;

  evidence:
    RXIntelligenceEvidencePackItem[];

  /**
   * Intelligence synthesis never establishes causality.
   */
  causalConclusion:
    "UNKNOWN";
}
