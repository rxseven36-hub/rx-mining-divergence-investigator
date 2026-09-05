import type {
  LLMProvider,
} from "../../investigation/llm-provider";

import type {
  RXPeerIntelligenceEvidencePack,
} from "../context/create-peer-intelligence-evidence-pack";

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

import {
  projectPeerIntelligenceEvidencePack,
} from "../context/project-peer-intelligence-evidence-pack";

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
  pack: RXPeerIntelligenceEvidencePack
): Promise<RXEvidenceBoundedHypothesisRunResult> {
  const intelligencePack =
    projectPeerIntelligenceEvidencePack(
      pack
    );

  const input:
    RXEvidenceBoundedHypothesisProviderInput = {
      evidencePack:
        intelligencePack,

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
      intelligencePack
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
