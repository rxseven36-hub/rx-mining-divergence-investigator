import type {
  LLMProvider,
} from "../../investigation/llm-provider";

import type {
  RXIntelligenceEvidencePack,
} from "../context/intelligence-evidence-pack";
import type {
  RXEvidenceBoundedHypothesisChallenge,
} from "./evidence-bounded-hypothesis-challenge";

import type {
  RXEvidenceBoundedHypothesisChallengeProviderInput,
} from "./evidence-bounded-hypothesis-challenge-provider-input";

import type {
  RXEvidenceBoundedHypothesisRunResult,
} from "./run-evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisChallengeIssue,
} from "./validate-evidence-bounded-hypothesis-challenge";

import {
  validateEvidenceBoundedHypothesisChallenge,
} from "./validate-evidence-bounded-hypothesis-challenge";

export type RXAcceptedEvidenceBoundedHypothesisRunResult =
  Extract<
    RXEvidenceBoundedHypothesisRunResult,
    {
      status: "ACCEPTED";
    }
  >;

export type RXEvidenceBoundedHypothesisChallengeRunResult =
  | {
      status: "ACCEPTED";
      challenge:
        RXEvidenceBoundedHypothesisChallenge;
      issues: [];
      causalConclusion:
        "UNKNOWN";
    }
  | {
      status: "REJECTED";
      challenge: null;
      issues:
        RXEvidenceBoundedHypothesisChallengeIssue[];
      causalConclusion:
        "UNKNOWN";
    };

/**
 * Guarded orchestration boundary for an AI-generated
 * adversarial challenge to an already accepted hypothesis.
 *
 * This function:
 * - accepts only the ACCEPTED branch of the hypothesis runner,
 * - constructs provider input from the exact canonical evidence
 *   pack and accepted hypothesis,
 * - treats provider output as untrusted runtime data,
 * - validates the challenge against that hypothesis and pack,
 * - exposes a typed challenge only after validation.
 *
 * This function does NOT:
 * - collect or admit evidence,
 * - modify the evidence pack,
 * - modify or replace the accepted hypothesis,
 * - create a second hypothesis,
 * - synthesize an intelligence brief,
 * - establish causality.
 *
 * Provider/runtime failures are intentionally not converted into
 * REJECTED. REJECTED means the provider returned candidate output
 * that failed the RX challenge trust boundary.
 */
export async function runEvidenceBoundedHypothesisChallenge(
  provider:
    LLMProvider,
  hypothesisRun:
    RXAcceptedEvidenceBoundedHypothesisRunResult,
  pack:
    RXIntelligenceEvidencePack
): Promise<RXEvidenceBoundedHypothesisChallengeRunResult> {
  const hypothesis =
    hypothesisRun.hypothesis;

  const input:
    RXEvidenceBoundedHypothesisChallengeProviderInput = {
      evidencePack:
        pack,
      hypothesis,
      causalConclusion:
        "UNKNOWN",
    };

  const candidate =
    await provider.challengeHypothesis(
      input
    );

  const validation =
    validateEvidenceBoundedHypothesisChallenge(
      candidate,
      hypothesis,
      pack
    );

  if (!validation.valid) {
    return {
      status:
        "REJECTED",
      challenge:
        null,
      issues:
        validation.issues,
      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status:
      "ACCEPTED",
    challenge:
      validation.challenge,
    issues: [],
    causalConclusion:
      "UNKNOWN",
  };
}
