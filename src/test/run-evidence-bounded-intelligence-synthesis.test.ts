import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

import type {
  RXContextBoundPeerInvestigationEvidenceItem,
} from "../investigation/bind-admitted-peer-investigation-evidence-contexts";

import type {
  RXPeerInvestigationEvidenceContext,
} from "../investigation/create-peer-investigation-evidence-context";

import {
  runEvidenceBoundedIntelligenceSynthesis,
} from "../intelligence/synthesis/run-evidence-bounded-intelligence-synthesis";

function createBoundItem(
  overrides:
    Partial<RXContextBoundPeerInvestigationEvidenceItem> = {}
): RXContextBoundPeerInvestigationEvidenceItem {
  return {
    requestId:
      "REQ-FIRST-1",

    target:
      "FIRST_COMPANY",

    companyId:
      "COMPANY-A",

    sourceReference:
      "source-request:first:1",

    commodity:
      "GOLD" as never,

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

    collection: {
      requestId:
        "REQ-FIRST-1",

      requirementId:
        "REQUIREMENT-FIRST-1",

      capability:
        "MINING_OPERATIONAL_CONTEXT" as never,

      status:
        "AVAILABLE",

      evidence: [
        {
          evidenceId:
            "EV-FIRST-1",

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

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    ...overrides,
  };
}

function createContext():
  RXPeerInvestigationEvidenceContext {
  return {
    planId:
      "PLAN-017Q",

    caseId:
      "CASE-017Q",

    firstCompany: [
      createBoundItem(),
    ],

    secondCompany: [
      createBoundItem({
        requestId:
          "REQ-SECOND-1",

        target:
          "SECOND_COMPANY",

        companyId:
          "COMPANY-B",

        sourceReference:
          "source-request:second:1",

        collection: {
          ...createBoundItem().collection,

          requestId:
            "REQ-SECOND-1",

          requirementId:
            "REQUIREMENT-SECOND-1",

          evidence: [
            {
              evidenceId:
                "EV-SECOND-1",

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
        },
      }),
    ],

    shared: [
      createBoundItem({
        requestId:
          "REQ-SHARED-1",

        target:
          "SHARED",

        companyId:
          null,

        sourceReference:
          "source-request:shared:1",

        collection: {
          ...createBoundItem().collection,

          requestId:
            "REQ-SHARED-1",

          requirementId:
            "REQUIREMENT-SHARED-1",

          evidence: [
            {
              evidenceId:
                "EV-SHARED-1",

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
        },
      }),
    ],

    evidenceCount:
      3,

    causalConclusion:
      "UNKNOWN",
  };
}

function createEmptyContext():
  RXPeerInvestigationEvidenceContext {
  return {
    planId:
      "PLAN-017Q",

    caseId:
      "CASE-017Q",

    firstCompany: [],
    secondCompany: [],
    shared: [],

    evidenceCount:
      0,

    causalConclusion:
      "UNKNOWN",
  };
}

function createValidHypothesis() {
  return {
    caseId:
      "CASE-017Q",

    planId:
      "PLAN-017Q",

    hypothesisId:
      "HYPOTHESIS-017Q",

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
      "UNKNOWN" as const,
  };
}

function createValidChallenge() {
  return {
    caseId:
      "CASE-017Q",

    planId:
      "PLAN-017Q",

    hypothesisId:
      "HYPOTHESIS-017Q",

    challengeId:
      "CHALLENGE-017Q",

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
      "UNKNOWN" as const,
  };
}

function createValidBrief() {
  return {
    caseId:
      "CASE-017Q",

    planId:
      "PLAN-017Q",

    briefId:
      "BRIEF-017Q",

    hypothesisId:
      "HYPOTHESIS-017Q",

    challengeId:
      "CHALLENGE-017Q",

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
  "runEvidenceBoundedIntelligenceSynthesis",
  () => {
    it(
      "completes the canonical evidence-bounded synthesis chain",
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

        const result =
          await runEvidenceBoundedIntelligenceSynthesis(
            provider,
            createContext()
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
            result.evidencePack.evidenceCount
          ).toBe(
            3
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
      "stops before provider execution when evidence-pack creation is rejected",
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

        const result =
          await runEvidenceBoundedIntelligenceSynthesis(
            provider,
            createEmptyContext()
          );

        expect(calls).toEqual(
          []
        );

        expect(result).toEqual({
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
            "PEER_EVIDENCE_CONTEXT_EMPTY",
          ],

          causalConclusion:
            "UNKNOWN",
        });
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

        const result =
          await runEvidenceBoundedIntelligenceSynthesis(
            provider,
            createContext()
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
          ).not.toBeNull();

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

        const result =
          await runEvidenceBoundedIntelligenceSynthesis(
            provider,
            createContext()
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
          ).not.toBeNull();

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

        const result =
          await runEvidenceBoundedIntelligenceSynthesis(
            provider,
            createContext()
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
          ).not.toBeNull();

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
          runEvidenceBoundedIntelligenceSynthesis(
            provider,
            createContext()
          )
        ).rejects.toThrow(
          "PROVIDER_FAILURE"
        );
      }
    );
  }
);
