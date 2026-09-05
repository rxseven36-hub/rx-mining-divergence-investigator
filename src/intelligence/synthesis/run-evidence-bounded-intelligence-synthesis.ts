import type {
  LLMProvider,
} from "../../investigation/llm-provider";

import type {
  RXPeerInvestigationEvidenceContext,
} from "../../investigation/create-peer-investigation-evidence-context";

import type {
  RXPeerIntelligenceEvidencePack,
} from "../context/create-peer-intelligence-evidence-pack";

import {
  createPeerIntelligenceEvidencePack,
} from "../context/create-peer-intelligence-evidence-pack";

import {
  projectPeerIntelligenceEvidencePack,
} from "../context/project-peer-intelligence-evidence-pack";

import type {
  RXEvidenceBoundedHypothesis,
} from "../hypothesis/evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisIssue,
} from "../hypothesis/validate-evidence-bounded-hypothesis";

import {
  runEvidenceBoundedHypothesis,
} from "../hypothesis/run-evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisChallenge,
} from "../hypothesis/evidence-bounded-hypothesis-challenge";

import type {
  RXEvidenceBoundedHypothesisChallengeIssue,
} from "../hypothesis/validate-evidence-bounded-hypothesis-challenge";

import {
  runEvidenceBoundedHypothesisChallenge,
} from "../hypothesis/run-evidence-bounded-hypothesis-challenge";

import type {
  RXEvidenceBoundedIntelligenceBrief,
} from "./evidence-bounded-intelligence-brief";

import type {
  RXEvidenceBoundedIntelligenceBriefIssue,
} from "./validate-evidence-bounded-intelligence-brief";

import {
  runEvidenceBoundedIntelligenceBrief,
} from "./run-evidence-bounded-intelligence-brief";

export type RXEvidenceBoundedIntelligenceSynthesisRunResult =
  | {
      status:
        "ACCEPTED";

      stage:
        "COMPLETE";

      evidencePack:
        RXPeerIntelligenceEvidencePack;

      hypothesis:
        RXEvidenceBoundedHypothesis;

      challenge:
        RXEvidenceBoundedHypothesisChallenge;

      brief:
        RXEvidenceBoundedIntelligenceBrief;

      issues: [];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "REJECTED";

      stage:
        "EVIDENCE_PACK";

      evidencePack:
        null;

      hypothesis:
        null;

      challenge:
        null;

      brief:
        null;

      issues: [
        "PEER_EVIDENCE_CONTEXT_EMPTY",
      ];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "REJECTED";

      stage:
        "HYPOTHESIS";

      evidencePack:
        RXPeerIntelligenceEvidencePack;

      hypothesis:
        null;

      challenge:
        null;

      brief:
        null;

      issues:
        RXEvidenceBoundedHypothesisIssue[];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "REJECTED";

      stage:
        "CHALLENGE";

      evidencePack:
        RXPeerIntelligenceEvidencePack;

      hypothesis:
        RXEvidenceBoundedHypothesis;

      challenge:
        null;

      brief:
        null;

      issues:
        RXEvidenceBoundedHypothesisChallengeIssue[];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "REJECTED";

      stage:
        "BRIEF";

      evidencePack:
        RXPeerIntelligenceEvidencePack;

      hypothesis:
        RXEvidenceBoundedHypothesis;

      challenge:
        RXEvidenceBoundedHypothesisChallenge;

      brief:
        null;

      issues:
        RXEvidenceBoundedIntelligenceBriefIssue[];

      causalConclusion:
        "UNKNOWN";
    };

/**
 * Canonical orchestration boundary for evidence-bounded
 * peer intelligence synthesis.
 *
 * This function composes already-established RX trust
 * boundaries in sequence:
 *
 * canonical peer evidence context
 * -> intelligence evidence pack
 * -> accepted hypothesis
 * -> accepted adversarial challenge
 * -> accepted intelligence brief
 *
 * Each stage is fail-fast. A rejected stage prevents all
 * later intelligence stages from executing.
 *
 * This function does NOT:
 * - collect or admit evidence,
 * - execute investigation requests,
 * - reconstruct or repair evidence identity,
 * - modify the canonical evidence context or evidence pack,
 * - create independent hypotheses or challenges,
 * - call provider methods directly,
 * - score, rank, compare, or detect divergence,
 * - establish causality.
 *
 * Provider/runtime failures are intentionally allowed to
 * propagate from the guarded stage runners. REJECTED means
 * a deterministic RX trust boundary rejected candidate
 * output, not that provider execution failed.
 */
export async function runEvidenceBoundedIntelligenceSynthesis(
  provider:
    LLMProvider,
  context:
    RXPeerInvestigationEvidenceContext
): Promise<RXEvidenceBoundedIntelligenceSynthesisRunResult> {
  const packResult =
    createPeerIntelligenceEvidencePack(
      context
    );

  if (
    packResult.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "EVIDENCE_PACK",

      evidencePack:
        null,

      hypothesis:
        null,

      challenge:
        null,

      brief:
        null,

      issues: [
        packResult.issue,
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  const evidencePack =
    packResult.pack;

  const intelligencePack =
    projectPeerIntelligenceEvidencePack(
      evidencePack
    );

  const hypothesisRun =
    await runEvidenceBoundedHypothesis(
      provider,
      intelligencePack
    );

  if (
    hypothesisRun.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "HYPOTHESIS",

      evidencePack,

      hypothesis:
        null,

      challenge:
        null,

      brief:
        null,

      issues:
        hypothesisRun.issues,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const hypothesis =
    hypothesisRun.hypothesis;

  const challengeRun =
    await runEvidenceBoundedHypothesisChallenge(
      provider,
      hypothesisRun,
      intelligencePack
    );

  if (
    challengeRun.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "CHALLENGE",

      evidencePack,

      hypothesis,

      challenge:
        null,

      brief:
        null,

      issues:
        challengeRun.issues,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const challenge =
    challengeRun.challenge;

  const briefRun =
    await runEvidenceBoundedIntelligenceBrief(
      provider,
      hypothesisRun,
      challengeRun,
      intelligencePack
    );

  if (
    briefRun.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "BRIEF",

      evidencePack,

      hypothesis,

      challenge,

      brief:
        null,

      issues:
        briefRun.issues,

      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status:
      "ACCEPTED",

    stage:
      "COMPLETE",

    evidencePack,

    hypothesis,

    challenge,

    brief:
      briefRun.brief,

    issues: [],

    causalConclusion:
      "UNKNOWN",
  };
}
