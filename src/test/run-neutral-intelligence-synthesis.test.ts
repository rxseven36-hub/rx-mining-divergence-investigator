import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

import type {
  RXIntelligenceEvidencePack,
} from "../intelligence/context/intelligence-evidence-pack";

import {
  runNeutralIntelligenceSynthesis,
} from "../intelligence/synthesis/run-neutral-intelligence-synthesis";

function createPack():
  RXIntelligenceEvidencePack {
  return {
    planId:
      "PLAN-018D-6B",

    caseId:
      "CASE-018D-6B",

    evidence: [
      {
        evidenceId:
          "EV-OPERATIONAL-1",

        requestId:
          "REQ-OPERATIONAL-1",

        companyId:
          "COMPANY-A",

        source:
          "SECTORS",

        sourceReference:
          "source:operational:1",

        truthClass:
          "SOURCE_FACT",

        description:
          "Company operational evidence.",
      },

      {
        evidenceId:
          "EV-HISTORICAL-1",

        requestId:
          "REQ-HISTORICAL-1",

        companyId:
          "COMPANY-A",

        source:
          "SECTORS",

        sourceReference:
          "source:historical:1",

        truthClass:
          "SOURCE_FACT",

        description:
          "Company historical evidence.",
      },

      {
        evidenceId:
          "EV-MARKET-1",

        requestId:
          "REQ-MARKET-1",

        companyId:
          "COMPANY-A",

        source:
          "SECTORS",

        sourceReference:
          "source:market:1",

        truthClass:
          "SOURCE_FACT",

        description:
          "Company market evidence.",
      },
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

function createValidHypothesis() {
  return {
    caseId:
      "CASE-018D-6B",

    planId:
      "PLAN-018D-6B",

    hypothesisId:
      "HYPOTHESIS-018D-6B",

    statement:
      "Observed company divergence may warrant further investigation.",

    supportingEvidence: [
      {
        evidenceId:
          "EV-OPERATIONAL-1",

        requestId:
          "REQ-OPERATIONAL-1",
      },
    ],

    counterEvidence: [
      {
        evidenceId:
          "EV-HISTORICAL-1",

        requestId:
          "REQ-HISTORICAL-1",
      },
    ],

    alternativeExplanations: [
      "Operational timing may differ.",
    ],

    uncertainties: [
      "Available evidence does not establish causality.",
    ],

    causalConclusion:
      "UNKNOWN" as const,
  };
}

function createValidChallenge() {
  return {
    caseId:
      "CASE-018D-6B",

    planId:
      "PLAN-018D-6B",

    hypothesisId:
      "HYPOTHESIS-018D-6B",

    challengeId:
      "CHALLENGE-018D-6B",

    critique:
      "The observed divergence may have non-causal operational explanations.",

    challengingEvidence: [
      {
        evidenceId:
          "EV-MARKET-1",

        requestId:
          "REQ-MARKET-1",
      },
    ],

    unresolvedConcerns: [
      "The evidence remains insufficient for causal attribution.",
    ],

    causalConclusion:
      "UNKNOWN" as const,
  };
}

function createValidBrief() {
  return {
    caseId:
      "CASE-018D-6B",

    planId:
      "PLAN-018D-6B",

    briefId:
      "BRIEF-018D-6B",

    hypothesisId:
      "HYPOTHESIS-018D-6B",

    challengeId:
      "CHALLENGE-018D-6B",

    executiveSummary:
      "The evidence supports continued investigation while alternative explanations remain unresolved.",

    evidenceReferences: [
      {
        evidenceId:
          "EV-OPERATIONAL-1",

        requestId:
          "REQ-OPERATIONAL-1",
      },

      {
        evidenceId:
          "EV-MARKET-1",

        requestId:
          "REQ-MARKET-1",
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
      "UNKNOWN" as const,
  };
}

function createProvider(
  overrides:
    Partial<LLMProvider> = {}
): LLMProvider {
  return {
    async investigate() {
      throw new Error(
        "NOT_USED"
      );
    },

    async proposeHypothesis() {
      return createValidHypothesis();
    },

    async challengeHypothesis() {
      return createValidChallenge();
    },

    async synthesizeBrief() {
      return createValidBrief();
    },

    ...overrides,
  };
}

describe(
  "runNeutralIntelligenceSynthesis",
  () => {
    it(
      "completes the canonical neutral evidence-bounded synthesis chain",
      async () => {
        const calls:
          string[] = [];

        const provider =
          createProvider({
            async proposeHypothesis() {
              calls.push(
                "HYPOTHESIS"
              );

              return createValidHypothesis();
            },

            async challengeHypothesis() {
              calls.push(
                "CHALLENGE"
              );

              return createValidChallenge();
            },

            async synthesizeBrief() {
              calls.push(
                "BRIEF"
              );

              return createValidBrief();
            },
          });

        const pack =
          createPack();

        const result =
          await runNeutralIntelligenceSynthesis(
            provider,
            pack
          );

        expect(calls).toEqual([
          "HYPOTHESIS",
          "CHALLENGE",
          "BRIEF",
        ]);

        expect(result.status).toBe(
          "ACCEPTED"
        );

        if (
          result.status ===
          "ACCEPTED"
        ) {
          expect(result.stage).toBe(
            "COMPLETE"
          );

          expect(
            result.evidencePack
          ).toBe(
            pack
          );

          expect(
            result.hypothesis
          ).toEqual(
            createValidHypothesis()
          );

          expect(
            result.challenge
          ).toEqual(
            createValidChallenge()
          );

          expect(
            result.brief
          ).toEqual(
            createValidBrief()
          );

          expect(
            result.issues
          ).toEqual(
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
      "stops after a rejected hypothesis and does not execute later stages",
      async () => {
        const calls:
          string[] = [];

        const provider =
          createProvider({
            async proposeHypothesis() {
              calls.push(
                "HYPOTHESIS"
              );

              return {
                ...createValidHypothesis(),

                causalConclusion:
                  "ESTABLISHED",
              };
            },

            async challengeHypothesis() {
              calls.push(
                "CHALLENGE"
              );

              return createValidChallenge();
            },

            async synthesizeBrief() {
              calls.push(
                "BRIEF"
              );

              return createValidBrief();
            },
          });

        const pack =
          createPack();

        const result =
          await runNeutralIntelligenceSynthesis(
            provider,
            pack
          );

        expect(calls).toEqual([
          "HYPOTHESIS",
        ]);

        expect(result.status).toBe(
          "REJECTED"
        );

        if (
          result.status ===
            "REJECTED" &&
          result.stage ===
            "HYPOTHESIS"
        ) {
          expect(
            result.evidencePack
          ).toBe(
            pack
          );

          expect(
            result.hypothesis
          ).toBeNull();

          expect(
            result.challenge
          ).toBeNull();

          expect(
            result.brief
          ).toBeNull();

          expect(
            result.issues
          ).toEqual([
            "INVALID_OUTPUT",
          ]);

          expect(
            result.causalConclusion
          ).toBe(
            "UNKNOWN"
          );
        }
      }
    );

    it(
      "stops after a rejected challenge and preserves the accepted hypothesis",
      async () => {
        const calls:
          string[] = [];

        const provider =
          createProvider({
            async proposeHypothesis() {
              calls.push(
                "HYPOTHESIS"
              );

              return createValidHypothesis();
            },

            async challengeHypothesis() {
              calls.push(
                "CHALLENGE"
              );

              return {
                ...createValidChallenge(),

                hypothesisId:
                  "HYPOTHESIS-WRONG",
              };
            },

            async synthesizeBrief() {
              calls.push(
                "BRIEF"
              );

              return createValidBrief();
            },
          });

        const pack =
          createPack();

        const result =
          await runNeutralIntelligenceSynthesis(
            provider,
            pack
          );

        expect(calls).toEqual([
          "HYPOTHESIS",
          "CHALLENGE",
        ]);

        expect(result.status).toBe(
          "REJECTED"
        );

        if (
          result.status ===
            "REJECTED" &&
          result.stage ===
            "CHALLENGE"
        ) {
          expect(
            result.evidencePack
          ).toBe(
            pack
          );

          expect(
            result.hypothesis
          ).toEqual(
            createValidHypothesis()
          );

          expect(
            result.challenge
          ).toBeNull();

          expect(
            result.brief
          ).toBeNull();

          expect(
            result.issues
          ).toEqual([
            "HYPOTHESIS_MISMATCH",
          ]);

          expect(
            result.causalConclusion
          ).toBe(
            "UNKNOWN"
          );
        }
      }
    );

    it(
      "stops after a rejected brief and preserves the accepted reasoning chain",
      async () => {
        const calls:
          string[] = [];

        const provider =
          createProvider({
            async proposeHypothesis() {
              calls.push(
                "HYPOTHESIS"
              );

              return createValidHypothesis();
            },

            async challengeHypothesis() {
              calls.push(
                "CHALLENGE"
              );

              return createValidChallenge();
            },

            async synthesizeBrief() {
              calls.push(
                "BRIEF"
              );

              return {
                ...createValidBrief(),

                challengeId:
                  "CHALLENGE-WRONG",
              };
            },
          });

        const pack =
          createPack();

        const result =
          await runNeutralIntelligenceSynthesis(
            provider,
            pack
          );

        expect(calls).toEqual([
          "HYPOTHESIS",
          "CHALLENGE",
          "BRIEF",
        ]);

        expect(result.status).toBe(
          "REJECTED"
        );

        if (
          result.status ===
            "REJECTED" &&
          result.stage ===
            "BRIEF"
        ) {
          expect(
            result.evidencePack
          ).toBe(
            pack
          );

          expect(
            result.hypothesis
          ).toEqual(
            createValidHypothesis()
          );

          expect(
            result.challenge
          ).toEqual(
            createValidChallenge()
          );

          expect(
            result.brief
          ).toBeNull();

          expect(
            result.issues
          ).toEqual([
            "CHALLENGE_MISMATCH",
          ]);

          expect(
            result.causalConclusion
          ).toBe(
            "UNKNOWN"
          );
        }
      }
    );

    it(
      "propagates provider runtime failures instead of converting them to REJECTED",
      async () => {
        const provider =
          createProvider({
            async proposeHypothesis() {
              throw new Error(
                "PROVIDER_FAILURE"
              );
            },
          });

        await expect(
          runNeutralIntelligenceSynthesis(
            provider,
            createPack()
          )
        ).rejects.toThrow(
          "PROVIDER_FAILURE"
        );
      }
    );
  }
);