import type {
  LLMProvider,
} from "../../investigation/llm-provider";

import type {
  RXPeerIntelligenceEvidencePack,
} from "../context/create-peer-intelligence-evidence-pack";

import type {
  RXAcceptedEvidenceBoundedHypothesisRunResult,
  RXEvidenceBoundedHypothesisChallengeRunResult,
} from "../hypothesis/run-evidence-bounded-hypothesis-challenge";

import type {
  RXEvidenceBoundedIntelligenceBrief,
} from "./evidence-bounded-intelligence-brief";

import type {
  RXEvidenceBoundedIntelligenceBriefProviderInput,
} from "./evidence-bounded-intelligence-brief-provider-input";

import type {
  RXEvidenceBoundedIntelligenceBriefIssue,
} from "./validate-evidence-bounded-intelligence-brief";

import {
  validateEvidenceBoundedIntelligenceBrief,
} from "./validate-evidence-bounded-intelligence-brief";

import {
  projectPeerIntelligenceEvidencePack,
} from "../context/project-peer-intelligence-evidence-pack";

export type RXAcceptedEvidenceBoundedHypothesisChallengeRunResult =
  Extract<
    RXEvidenceBoundedHypothesisChallengeRunResult,
    {
      status: "ACCEPTED";
    }
  >;

export type RXEvidenceBoundedIntelligenceBriefRunResult =
  | {
      status: "ACCEPTED";
      brief:
        RXEvidenceBoundedIntelligenceBrief;
      issues: [];
      causalConclusion:
        "UNKNOWN";
    }
  | {
      status: "REJECTED";
      brief: null;
      issues:
        RXEvidenceBoundedIntelligenceBriefIssue[];
      causalConclusion:
        "UNKNOWN";
    };

/**
 * Guarded orchestration boundary for an AI-synthesized,
 * evidence-bounded intelligence brief.
 *
 * This function:
 * - accepts only the ACCEPTED branches of the hypothesis and
 *   adversarial-challenge runners,
 * - constructs provider input from the exact canonical evidence
 *   pack and accepted reasoning chain,
 * - treats provider output as untrusted runtime data,
 * - validates the brief against that reasoning chain and pack,
 * - exposes a typed intelligence brief only after validation.
 *
 * This function does NOT:
 * - collect or admit evidence,
 * - modify the evidence pack,
 * - modify or replace the accepted hypothesis,
 * - modify or replace the accepted challenge,
 * - create new evidence or reasoning authority,
 * - establish causality.
 *
 * Provider/runtime failures are intentionally not converted into
 * REJECTED. REJECTED means the provider returned candidate output
 * that failed the RX intelligence-brief trust boundary.
 */
export async function runEvidenceBoundedIntelligenceBrief(
  provider:
    LLMProvider,
  hypothesisRun:
    RXAcceptedEvidenceBoundedHypothesisRunResult,
  challengeRun:
    RXAcceptedEvidenceBoundedHypothesisChallengeRunResult,
  pack:
    RXPeerIntelligenceEvidencePack
): Promise<RXEvidenceBoundedIntelligenceBriefRunResult> {
  const hypothesis =
    hypothesisRun.hypothesis;

  const challenge =
    challengeRun.challenge;
  const intelligencePack =
    projectPeerIntelligenceEvidencePack(
      pack
    );
  const input:
    RXEvidenceBoundedIntelligenceBriefProviderInput = {
      evidencePack:
        intelligencePack,
      hypothesis,
      challenge,
      causalConclusion:
        "UNKNOWN",
    };

  const candidate =
    await provider.synthesizeBrief(
      input
    );

  const validation =
    validateEvidenceBoundedIntelligenceBrief(
      candidate,
      hypothesis,
      challenge,
      intelligencePack
    );

  if (!validation.valid) {
    return {
      status:
        "REJECTED",
      brief:
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
    brief:
      validation.brief,
    issues: [],
    causalConclusion:
      "UNKNOWN",
  };
}
