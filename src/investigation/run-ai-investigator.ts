import type {
  RXAIInvestigatorDecision,
  RXAIInvestigatorInput,
} from "./ai-investigator";

import type {
  LLMProvider,
} from "./llm-provider";

import type {
  RXAIInvestigatorDecisionIssue,
} from "./validate-ai-investigator-decision";

import {
  validateAIInvestigatorDecision,
} from "./validate-ai-investigator-decision";

export type RXAIInvestigatorRunResult =
  | {
      status: "ACCEPTED";

      decision:
        RXAIInvestigatorDecision;

      issues: [];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status: "REJECTED";

      decision: null;

      issues:
        RXAIInvestigatorDecisionIssue[];

      causalConclusion:
        "UNKNOWN";
    };

/**
 * Guarded orchestration boundary for AI investigation.
 *
 * This function:
 * - supplies read-only case + plan context to the provider,
 * - treats provider output as untrusted runtime data,
 * - validates it against the deterministic plan,
 * - exposes a typed decision only after validation.
 *
 * This function does NOT:
 * - execute investigation requests,
 * - call Sectors directly,
 * - collect or create evidence,
 * - create capabilities,
 * - establish causality.
 */
export async function runAIInvestigator(
  provider: LLMProvider,
  input: RXAIInvestigatorInput
): Promise<RXAIInvestigatorRunResult> {
  const candidate =
    await provider.investigate(
      input
    );

  const validation =
    validateAIInvestigatorDecision(
      candidate,
      input.investigationPlan
    );

  if (!validation.valid) {
    return {
      status: "REJECTED",
      decision: null,
      issues:
        validation.issues,
      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status: "ACCEPTED",
    decision:
      validation.decision,
    issues: [],
    causalConclusion:
      "UNKNOWN",
  };
}
