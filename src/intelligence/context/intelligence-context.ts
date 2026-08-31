import type {
  RXEvidenceCollectionResult,
} from "../../investigation/evidence-collection";

export type RXIntelligenceEvidenceScope =
  | "OPERATIONAL"
  | "HISTORICAL"
  | "COMMODITY"
  | "MARKET";

export interface RXIntelligenceSubject {
  companyId: string;
  commodity: string;
  periodLabel: string;
}

export interface RXIntelligenceEvidenceGroup {
  scope: RXIntelligenceEvidenceScope;

  /**
   * Only evidence collections that have already passed
   * their admission boundary may enter intelligence context.
   *
   * Presence in this context means admitted for contextual
   * use only. It does NOT establish causality between groups.
   */
  relationship:
    "ADMITTED_FOR_CONTEXT";

  collection:
    RXEvidenceCollectionResult;
}

export interface RXIntelligenceContext {
  subject:
    RXIntelligenceSubject;

  evidenceGroups:
    RXIntelligenceEvidenceGroup[];

  /**
   * Intelligence context groups admitted evidence.
   *
   * It does not infer, score, compare, detect divergence,
   * or manufacture causal explanations.
   */
  causalConclusion:
    "UNKNOWN";
}