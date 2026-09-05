import type {
  LLMProvider,
} from "../../investigation/llm-provider";

import type {
  RXIntelligenceEvidencePack,
} from "../context/intelligence-evidence-pack";

import type {
  RXEvidenceBoundedHypothesis,
} from "./evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisProviderInput,
} from "./evidence-bounded-hypothesis-provider-input";

import type {
  RXEvidenceBoundedHypothesisIssue,
} from "./validate-evidence-bounded-hypothesis";

import {
  validateEvidenceBoundedHypothesis,
} from "./validate-evidence-bounded-hypothesis";

export type RXEvidenceBoundedHypothesisRunResult =
  | {
      status: "ACCEPTED";
      hypothesis:
        RXEvidenceBoundedHypothesis;
      issues: [];
      causalConclusion:
        "UNKNOWN";
    }
  | {
      status: "REJECTED";
      hypothesis: null;
      issues:
        RXEvidenceBoundedHypothesisIssue[];
      causalConclusion:
        "UNKNOWN";
    };

/**
 * Guarded orchestration boundary for an AI-proposed,
 * evidence-bounded hypothesis.
 *
 * This function:
 * - constructs the provider input from the canonical
 *   AI-safe evidence pack,
 * - treats provider output as untrusted runtime data,
 * - validates the proposal against the exact evidence pack,
 * - exposes a typed hypothesis only after validation.
 *
 * This function does NOT:
 * - collect or admit evidence,
 * - modify the evidence pack,
 * - execute investigation requests,
 * - challenge the hypothesis,
 * - synthesize an intelligence brief,
 * - establish causality.
 */
export async function runEvidenceBoundedHypothesis(
  provider: LLMProvider,
  pack: RXIntelligenceEvidencePack
): Promise<RXEvidenceBoundedHypothesisRunResult> {
  const input:
    RXEvidenceBoundedHypothesisProviderInput = {
      evidencePack:
        pack,

      causalConclusion:
        "UNKNOWN",
    };

  const candidate =
    await provider.proposeHypothesis(
      input
    );

  const validation =
    validateEvidenceBoundedHypothesis(
      candidate,
      pack
    );

  if (!validation.valid) {
    return {
      status: "REJECTED",
      hypothesis: null,
      issues:
        validation.issues,
      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status: "ACCEPTED",
    hypothesis:
      validation.hypothesis,
    issues: [],
    causalConclusion:
      "UNKNOWN",
  };
}
