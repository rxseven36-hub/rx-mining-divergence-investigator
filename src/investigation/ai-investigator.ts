import type {
  RXInvestigationCase,
} from "./investigation-case";

import type {
  RXInvestigationPlan,
} from "./investigation-plan";

/**
 * Read-only context supplied to the AI investigator.
 *
 * The deterministic investigation case and plan remain
 * the source of truth. The AI may reason over them but
 * must not redefine them.
 */
export interface RXAIInvestigatorInput {
  investigationCase:
    RXInvestigationCase;

  investigationPlan:
    RXInvestigationPlan;
}

export interface RXAIInvestigationAction {
  /**
   * Must reference an existing requestId from
   * investigationPlan.dataRequests.
   */
  requestId: string;

  /**
   * Lower number means earlier investigation priority.
   *
   * This controls investigation order only.
   * It is not a materiality, confidence, or probability score.
   */
  priority: number;

  /**
   * AI explanation for why this already-planned request
   * should receive this investigation priority.
   *
   * Rationale is reasoning, not evidence and not
   * a causal fact.
   */
  rationale: string;
}

export interface RXAIInvestigatorDecision {
  caseId: string;

  planId: string;

  /**
   * AI may prioritize only requests that already exist
   * in the deterministic investigation plan.
   */
  actions:
    RXAIInvestigationAction[];

  /**
   * Questions or uncertainties that remain unresolved.
   *
   * Unknowns must remain explicit rather than being
   * converted into unsupported conclusions.
   */
  unresolvedUnknowns:
    string[];

  /**
   * The AI-investigator planning stage is never allowed
   * to establish causality.
   */
  causalConclusion:
    "UNKNOWN";
}