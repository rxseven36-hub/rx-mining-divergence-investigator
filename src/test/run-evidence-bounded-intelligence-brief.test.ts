import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

import type {
  RXPeerIntelligenceEvidencePack,
} from "../intelligence/context/create-peer-intelligence-evidence-pack";

import type {
  RXAcceptedEvidenceBoundedHypothesisRunResult,
} from "../intelligence/hypothesis/run-evidence-bounded-hypothesis-challenge";

import {
  runEvidenceBoundedIntelligenceBrief,
} from "../intelligence/synthesis/run-evidence-bounded-intelligence-brief";

import type {
  RXAcceptedEvidenceBoundedHypothesisChallengeRunResult,
} from "../intelligence/synthesis/run-evidence-bounded-intelligence-brief";

function createPack():
  RXPeerIntelligenceEvidencePack {
  return {
    planId:
      "PLAN-017P",
    caseId:
      "CASE-017P",
    commodity:
      "GOLD",
    period: {
      kind:
        "QUARTER",
      year:
        2026,
      quarter:
        2,
      rawLabel:
        "2026-Q2",
    },
    firstCompany: [
      {
        evidenceId:
          "EV-FIRST-1",
        requestId:
          "REQ-FIRST-1",
        target:
          "FIRST_COMPANY",
        companyId:
          "COMPANY-A",
        source:
          "SECTORS",
        sourceReference:
          "source:first:1",
        truthClass:
          "SOURCE_FACT",
        description:
          "First company evidence.",
      },
    ],
    secondCompany: [
      {
        evidenceId:
          "EV-SECOND-1",
        requestId:
          "REQ-SECOND-1",
        target:
          "SECOND_COMPANY",
        companyId:
          "COMPANY-B",
        source:
          "SECTORS",
        sourceReference:
          "source:second:1",
        truthClass:
          "SOURCE_FACT",
        description:
          "Second company evidence.",
      },
    ],
    shared: [
      {
        evidenceId:
          "EV-SHARED-1",
        requestId:
          "REQ-SHARED-1",
        target:
          "SHARED",
        companyId:
          null,
        source:
          "SECTORS",
        sourceReference:
          "source:shared:1",
        truthClass:
          "SOURCE_FACT",
        description:
          "Shared evidence.",
      },
    ],
    evidenceCount:
      3,
    causalConclusion:
      "UNKNOWN",
  };
}

function createHypothesisRun():
  RXAcceptedEvidenceBoundedHypothesisRunResult {
  return {
    status:
      "ACCEPTED",
    hypothesis: {
      caseId:
        "CASE-017P",
      planId:
        "PLAN-017P",
      hypothesisId:
        "HYPOTHESIS-017P",
      statement:
        "Observed peer divergence may warrant further investigation.",
      supportingEvidence: [
        {
          evidenceId:
            "EV-FIRST-1",
          requestId:
            "REQ-FIRST-1",
        },
      ],
      counterEvidence: [
        {
          evidenceId:
            "EV-SECOND-1",
          requestId:
            "REQ-SECOND-1",
        },
      ],
      alternativeExplanations: [
        "Operational timing may differ.",
      ],
      uncertainties: [
        "Available evidence does not establish causality.",
      ],
      causalConclusion:
        "UNKNOWN",
    },
    issues: [],
    causalConclusion:
      "UNKNOWN",
  };
}

function createChallengeRun():
  RXAcceptedEvidenceBoundedHypothesisChallengeRunResult {
  return {
    status:
      "ACCEPTED",
    challenge: {
      caseId:
        "CASE-017P",
      planId:
        "PLAN-017P",
      hypothesisId:
        "HYPOTHESIS-017P",
      challengeId:
        "CHALLENGE-017P",
      critique:
        "The observed divergence may have non-causal operational explanations.",
      challengingEvidence: [
        {
          evidenceId:
            "EV-SHARED-1",
          requestId:
            "REQ-SHARED-1",
        },
      ],
      unresolvedConcerns: [
        "The evidence remains insufficient for causal attribution.",
      ],
      causalConclusion:
        "UNKNOWN",
    },
    issues: [],
    causalConclusion:
      "UNKNOWN",
  };
}

function createValidBrief() {
  return {
    caseId:
      "CASE-017P",
    planId:
      "PLAN-017P",
    briefId:
      "BRIEF-017P",
    hypothesisId:
      "HYPOTHESIS-017P",
    challengeId:
      "CHALLENGE-017P",
    executiveSummary:
      "The evidence supports continued investigation while alternative explanations remain unresolved.",
    evidenceReferences: [
      {
        evidenceId:
          "EV-FIRST-1",
        requestId:
          "REQ-FIRST-1",
      },
      {
        evidenceId:
          "EV-SHARED-1",
        requestId:
          "REQ-SHARED-1",
      },
    ],
    alternativeExplanations: [
      "Operational timing may differ.",
    ],
    uncertainties: [
      "Available evidence does not establish causality.",
    ],
    unresolvedConcerns: [
      "The evidence remains insufficient for causal attribution.",
    ],
    causalConclusion:
      "UNKNOWN",
  };
}

function createProvider(
  synthesizeBrief:
    LLMProvider["synthesizeBrief"]
): LLMProvider {
  return {
    async investigate() {
      throw new Error(
        "NOT_USED"
      );
    },

    async proposeHypothesis() {
      throw new Error(
        "NOT_USED"
      );
    },

    async challengeHypothesis() {
      throw new Error(
        "NOT_USED"
      );
    },

    synthesizeBrief,
  };
}

describe(
  "runEvidenceBoundedIntelligenceBrief",
  () => {
    it(
      "accepts a valid brief and passes the exact validated reasoning chain to the provider",
      async () => {
        const pack =
          createPack();

        const hypothesisRun =
          createHypothesisRun();

        const challengeRun =
          createChallengeRun();

        let receivedInput:
          Parameters<
            LLMProvider["synthesizeBrief"]
          >[0] | null =
          null;

        const provider =
          createProvider(
            async (input) => {
              receivedInput =
                input;

              return createValidBrief();
            }
          );

        const result =
          await runEvidenceBoundedIntelligenceBrief(
            provider,
            hypothesisRun,
            challengeRun,
            pack
          );

        expect(receivedInput).toEqual({
          evidencePack:
            pack,
          hypothesis:
            hypothesisRun.hypothesis,
          challenge:
            challengeRun.challenge,
          causalConclusion:
            "UNKNOWN",
        });

        expect(result.status).toBe(
          "ACCEPTED"
        );

        if (
          result.status ===
          "ACCEPTED"
        ) {
          expect(result.brief).toEqual(
            createValidBrief()
          );

          expect(result.issues).toEqual(
            []
          );

          expect(
            result.causalConclusion
          ).toBe(
            "UNKNOWN"
          );
        }
      }
    );

    it(
      "rejects provider output that attempts to establish causality",
      async () => {
        const provider =
          createProvider(
            async () => ({
              ...createValidBrief(),
              causalConclusion:
                "ESTABLISHED",
            })
          );

        const result =
          await runEvidenceBoundedIntelligenceBrief(
            provider,
            createHypothesisRun(),
            createChallengeRun(),
            createPack()
          );

        expect(result).toEqual({
          status:
            "REJECTED",
          brief:
            null,
          issues: [
            "INVALID_OUTPUT",
          ],
          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects a brief bound to the wrong challenge",
      async () => {
        const provider =
          createProvider(
            async () => ({
              ...createValidBrief(),
              challengeId:
                "CHALLENGE-WRONG",
            })
          );

        const result =
          await runEvidenceBoundedIntelligenceBrief(
            provider,
            createHypothesisRun(),
            createChallengeRun(),
            createPack()
          );

        expect(result).toEqual({
          status:
            "REJECTED",
          brief:
            null,
          issues: [
            "CHALLENGE_MISMATCH",
          ],
          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects evidence that exists in the pack but is outside the validated reasoning chain",
      async () => {
        const provider =
          createProvider(
            async () => ({
              ...createValidBrief(),
              evidenceReferences: [
                {
                  evidenceId:
                    "EV-FIRST-1",
                  requestId:
                    "REQ-FIRST-1",
                },
                {
                  evidenceId:
                    "EV-SECOND-1",
                  requestId:
                    "REQ-SECOND-1",
                },
              ],
            })
          );

        const hypothesisRun =
          createHypothesisRun();

        hypothesisRun.hypothesis.counterEvidence =
          [];

        const result =
          await runEvidenceBoundedIntelligenceBrief(
            provider,
            hypothesisRun,
            createChallengeRun(),
            createPack()
          );

        expect(result).toEqual({
          status:
            "REJECTED",
          brief:
            null,
          issues: [
            "EVIDENCE_OUTSIDE_REASONING_CHAIN",
          ],
          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "propagates provider runtime failures instead of converting them to REJECTED",
      async () => {
        const provider =
          createProvider(
            async () => {
              throw new Error(
                "PROVIDER_FAILURE"
              );
            }
          );

        await expect(
          runEvidenceBoundedIntelligenceBrief(
            provider,
            createHypothesisRun(),
            createChallengeRun(),
            createPack()
          )
        ).rejects.toThrow(
          "PROVIDER_FAILURE"
        );
      }
    );
  }
);
