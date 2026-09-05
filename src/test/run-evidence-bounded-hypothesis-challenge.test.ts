import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

import type {
  RXPeerIntelligenceEvidencePack,
} from "../intelligence/context/create-peer-intelligence-evidence-pack";

import type {
  RXEvidenceBoundedHypothesis,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisChallengeProviderInput,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis-challenge-provider-input";

import {
  runEvidenceBoundedHypothesisChallenge,
} from "../intelligence/hypothesis/run-evidence-bounded-hypothesis-challenge";

import type {
  RXAcceptedEvidenceBoundedHypothesisRunResult,
} from "../intelligence/hypothesis/run-evidence-bounded-hypothesis-challenge";

import {
  projectPeerIntelligenceEvidencePack,
} from "../intelligence/context/project-peer-intelligence-evidence-pack";

function createPack():
  RXPeerIntelligenceEvidencePack {
  return {
    planId:
      "PLAN-001",
    caseId:
      "CASE-001",
    commodity:
      "GOLD",
    period: {
      kind:
        "RANGE",
      start:
        "2025-01-01",
      end:
        "2025-12-31",
    },
    firstCompany: [
      {
        evidenceId:
          "EVIDENCE-001",
        requestId:
          "REQUEST-001",
        target:
          "FIRST_COMPANY",
        companyId:
          "COMPANY-001",
        source:
          "SECTORS",
        sourceReference:
          "source:first",
        truthClass:
          "SOURCE_FACT",
        description:
          "First company evidence",
      },
    ],
    secondCompany: [
      {
        evidenceId:
          "EVIDENCE-002",
        requestId:
          "REQUEST-002",
        target:
          "SECOND_COMPANY",
        companyId:
          "COMPANY-002",
        source:
          "SECTORS",
        sourceReference:
          "source:second",
        truthClass:
          "SOURCE_FACT",
        description:
          "Second company evidence",
      },
    ],
    shared: [
      {
        evidenceId:
          "EVIDENCE-003",
        requestId:
          "REQUEST-003",
        target:
          "SHARED",
        companyId:
          null,
        source:
          "SECTORS",
        sourceReference:
          "source:shared",
        truthClass:
          "SOURCE_FACT",
        description:
          "Shared evidence",
      },
    ],
    evidenceCount:
      3,
    causalConclusion:
      "UNKNOWN",
  };
}

function createHypothesis():
  RXEvidenceBoundedHypothesis {
  return {
    caseId:
      "CASE-001",
    planId:
      "PLAN-001",
    hypothesisId:
      "HYPOTHESIS-001",
    statement:
      "Observed divergence may reflect different operating conditions.",
    supportingEvidence: [
      {
        evidenceId:
          "EVIDENCE-001",
        requestId:
          "REQUEST-001",
      },
    ],
    counterEvidence: [
      {
        evidenceId:
          "EVIDENCE-002",
        requestId:
          "REQUEST-002",
      },
    ],
    alternativeExplanations: [
      "Commodity exposure may differ.",
    ],
    uncertainties: [
      "The available evidence does not establish causality.",
    ],
    causalConclusion:
      "UNKNOWN",
  };
}

function createAcceptedHypothesisRun():
  RXAcceptedEvidenceBoundedHypothesisRunResult {
  return {
    status:
      "ACCEPTED",
    hypothesis:
      createHypothesis(),
    issues: [],
    causalConclusion:
      "UNKNOWN",
  };
}

function createValidChallenge() {
  return {
    caseId:
      "CASE-001",
    planId:
      "PLAN-001",
    hypothesisId:
      "HYPOTHESIS-001",
    challengeId:
      "CHALLENGE-001",
    critique:
      "The hypothesis remains vulnerable to evidence from the second company.",
    challengingEvidence: [
      {
        evidenceId:
          "EVIDENCE-002",
        requestId:
          "REQUEST-002",
      },
    ],
    unresolvedConcerns: [
      "Operating context remains incomplete.",
    ],
    causalConclusion:
      "UNKNOWN" as const,
  };
}

function createProvider(
  output: unknown
): {
  provider:
    LLMProvider;
  challengeHypothesis:
    ReturnType<typeof vi.fn>;
} {
  const challengeHypothesis =
    vi.fn(
      async (
        _input:
          RXEvidenceBoundedHypothesisChallengeProviderInput
      ): Promise<unknown> =>
        output
    );

  const provider:
    LLMProvider = {
      async investigate(
        _input
      ): Promise<unknown> {
        return null;
      },

      async proposeHypothesis(
        _input
      ): Promise<unknown> {
        return null;
      },

      challengeHypothesis,

      async synthesizeBrief(
        _input: unknown
      ): Promise<unknown> {
        return null;
      },
    };

  return {
    provider,
    challengeHypothesis,
  };
}

describe(
  "runEvidenceBoundedHypothesisChallenge",
  () => {
    it(
      "supplies the exact neutral evidence projection and accepted hypothesis through the guarded provider boundary",
      async () => {
        const pack =
          createPack();

        const intelligencePack =
          projectPeerIntelligenceEvidencePack(
            pack
          );

        const hypothesisRun =
          createAcceptedHypothesisRun();

        const {
          provider,
          challengeHypothesis,
        } =
          createProvider(
            createValidChallenge()
          );

        const result =
          await runEvidenceBoundedHypothesisChallenge(
            provider,
            hypothesisRun,
            pack
          );

        expect(
          challengeHypothesis
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          challengeHypothesis
        ).toHaveBeenCalledWith({
          evidencePack:
            intelligencePack,
          hypothesis:
            hypothesisRun.hypothesis,
          causalConclusion:
            "UNKNOWN",
        });

        expect(result.status)
          .toBe(
            "ACCEPTED"
          );

        if (
          result.status ===
          "ACCEPTED"
        ) {
          expect(
            result.challenge.challengeId
          ).toBe(
            "CHALLENGE-001"
          );

          expect(
            result.issues
          ).toEqual([]);

          expect(
            result.causalConclusion
          ).toBe(
            "UNKNOWN"
          );
        }
      }
    );

    it(
      "rejects structurally invalid provider output",
      async () => {
        const {
          provider,
        } =
          createProvider({
            ...createValidChallenge(),
            causalConclusion:
              "ESTABLISHED",
          });

        const result =
          await runEvidenceBoundedHypothesisChallenge(
            provider,
            createAcceptedHypothesisRun(),
            createPack()
          );

        expect(result).toEqual({
          status:
            "REJECTED",
          challenge:
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
      "rejects a challenge bound to the wrong hypothesis",
      async () => {
        const {
          provider,
        } =
          createProvider({
            ...createValidChallenge(),
            hypothesisId:
              "HYPOTHESIS-OTHER",
          });

        const result =
          await runEvidenceBoundedHypothesisChallenge(
            provider,
            createAcceptedHypothesisRun(),
            createPack()
          );

        expect(result).toEqual({
          status:
            "REJECTED",
          challenge:
            null,
          issues: [
            "HYPOTHESIS_MISMATCH",
          ],
          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects challenging evidence outside the exact evidence pack",
      async () => {
        const {
          provider,
        } =
          createProvider({
            ...createValidChallenge(),
            challengingEvidence: [
              {
                evidenceId:
                  "EVIDENCE-UNKNOWN",
                requestId:
                  "REQUEST-UNKNOWN",
              },
            ],
          });

        const result =
          await runEvidenceBoundedHypothesisChallenge(
            provider,
            createAcceptedHypothesisRun(),
            createPack()
          );

        expect(result).toEqual({
          status:
            "REJECTED",
          challenge:
            null,
          issues: [
            "UNKNOWN_EVIDENCE",
          ],
          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "propagates provider runtime failures instead of misclassifying them as rejected challenge output",
      async () => {
        const pack =
          createPack();

        const intelligencePack =
          projectPeerIntelligenceEvidencePack(
            pack
          );

        const hypothesisRun =
          createAcceptedHypothesisRun();

        const provider:
          LLMProvider = {
            async investigate(
              _input
            ): Promise<unknown> {
              return null;
            },

            async proposeHypothesis(
              _input
            ): Promise<unknown> {
              return null;
            },

            async challengeHypothesis(
              _input
            ): Promise<unknown> {
              throw new Error(
                "provider unavailable"
              );
            },

            async synthesizeBrief(
              _input: unknown
            ): Promise<unknown> {
              return null;
            },
          };

        await expect(
          runEvidenceBoundedHypothesisChallenge(
            provider,
            hypothesisRun,
            pack
          )
        ).rejects.toThrow(
          "provider unavailable"
        );
      }
    );
  }
);
