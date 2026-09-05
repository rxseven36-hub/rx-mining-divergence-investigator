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

import {
  runEvidenceBoundedHypothesis,
} from "../intelligence/hypothesis/run-evidence-bounded-hypothesis";

import {
  projectPeerIntelligenceEvidencePack,
} from "../intelligence/context/project-peer-intelligence-evidence-pack";

function evidencePack():
  RXPeerIntelligenceEvidencePack {
  return {
    planId:
      "PLAN-PEER-001",

    caseId:
      "CASE-PEER-001",

    commodity:
      "COAL",

    period: {
      kind: "RANGE",
      start:
        "2025-01-01",
      end:
        "2025-12-31",
    },

    firstCompany: [
      {
        evidenceId:
          "EVIDENCE-FIRST-001",

        requestId:
          "REQUEST-FIRST-001",

        target:
          "FIRST_COMPANY",

        companyId:
          "company-first",

        source:
          "SECTORS",

        sourceReference:
          "sectors:first:001",

        truthClass:
          "SOURCE_FACT",

        description:
          "First-company admitted evidence.",
      },
    ],

    secondCompany: [
      {
        evidenceId:
          "EVIDENCE-SECOND-001",

        requestId:
          "REQUEST-SECOND-001",

        target:
          "SECOND_COMPANY",

        companyId:
          "company-second",

        source:
          "SECTORS",

        sourceReference:
          "sectors:second:001",

        truthClass:
          "SOURCE_FACT",

        description:
          "Second-company admitted evidence.",
      },
    ],

    shared: [],

    evidenceCount: 2,

    causalConclusion:
      "UNKNOWN",
  };
}

function providerWithHypothesisOutput(
  output: unknown
): {
  provider: LLMProvider;
  proposeHypothesis: ReturnType<
    typeof vi.fn
  >;
} {
  const proposeHypothesis =
    vi.fn(
      async () =>
        output
    );

  const provider:
    LLMProvider = {
      async investigate(
        _input: unknown
      ): Promise<unknown> {
        return null;
      },

      proposeHypothesis,

      async challengeHypothesis(
        _input: unknown
      ): Promise<unknown> {
        return null;
      },

      async synthesizeBrief(
        _input: unknown
      ): Promise<unknown> {
        return null;
      },
    };

  return {
    provider,
    proposeHypothesis,
  };
}

describe(
  "runEvidenceBoundedHypothesis",
  () => {
    it(
      "supplies the exact neutral evidence projection through the guarded provider input",
      async () => {
        const pack =
          evidencePack();

        const intelligencePack =
          projectPeerIntelligenceEvidencePack(
            pack
          );

        const {
          provider,
          proposeHypothesis,
        } =
          providerWithHypothesisOutput({
            caseId:
              pack.caseId,

            planId:
              pack.planId,

            hypothesisId:
              "HYPOTHESIS-001",

            statement:
              "The admitted evidence may reflect an operational divergence.",

            supportingEvidence: [
              {
                evidenceId:
                  "EVIDENCE-FIRST-001",

                requestId:
                  "REQUEST-FIRST-001",
              },
            ],

            counterEvidence: [],

            alternativeExplanations: [
              "Timing differences may explain the observed divergence.",
            ],

            uncertainties: [
              "The underlying cause remains unresolved.",
            ],

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runEvidenceBoundedHypothesis(
            provider,
            intelligencePack
          );

        expect(
          proposeHypothesis
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          proposeHypothesis
        ).toHaveBeenCalledWith({
          evidencePack:
            intelligencePack,

          causalConclusion:
            "UNKNOWN",
        });

        expect(
          result.status
        ).toBe("ACCEPTED");

        expect(
          result.hypothesis
        ).not.toBeNull();

        expect(
          result.issues
        ).toEqual([]);

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "rejects malformed provider output without exposing a trusted hypothesis",
      async () => {
        const pack =
          evidencePack();

        const intelligencePack =
          projectPeerIntelligenceEvidencePack(
            pack
          );

        const {
          provider,
        } =
          providerWithHypothesisOutput({
            caseId:
              pack.caseId,

            planId:
              pack.planId,

            hypothesisId:
              "HYPOTHESIS-001",

            statement:
              "Malformed hypothesis.",

            supportingEvidence:
              null,

            counterEvidence: [],

            alternativeExplanations: [],

            uncertainties: [],

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runEvidenceBoundedHypothesis(
            provider,
            intelligencePack
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          hypothesis: null,

          issues: [
            "INVALID_OUTPUT",
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects a hypothesis that references evidence outside the supplied pack",
      async () => {
        const pack =
          evidencePack();

        const intelligencePack =
          projectPeerIntelligenceEvidencePack(
            pack
          );

        const {
          provider,
        } =
          providerWithHypothesisOutput({
            caseId:
              pack.caseId,

            planId:
              pack.planId,

            hypothesisId:
              "HYPOTHESIS-001",

            statement:
              "Proposal using invented evidence.",

            supportingEvidence: [
              {
                evidenceId:
                  "AI-INVENTED-EVIDENCE",

                requestId:
                  "AI-INVENTED-REQUEST",
              },
            ],

            counterEvidence: [],

            alternativeExplanations: [],

            uncertainties: [
              "The invented reference is not canonical evidence.",
            ],

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runEvidenceBoundedHypothesis(
            provider,
            intelligencePack
          );

        expect(
          result.status
        ).toBe("REJECTED");

        expect(
          result.hypothesis
        ).toBeNull();

        expect(
          result.issues
        ).toContain(
          "UNKNOWN_EVIDENCE"
        );
      }
    );

    it(
      "rejects a hypothesis whose case or plan does not match the evidence pack",
      async () => {
        const pack =
          evidencePack();

        const intelligencePack =
          projectPeerIntelligenceEvidencePack(
            pack
          );

        const {
          provider,
        } =
          providerWithHypothesisOutput({
            caseId:
              "AI-INVENTED-CASE",

            planId:
              "AI-INVENTED-PLAN",

            hypothesisId:
              "HYPOTHESIS-001",

            statement:
              "Proposal outside the canonical case and plan.",

            supportingEvidence: [],

            counterEvidence: [],

            alternativeExplanations: [],

            uncertainties: [],

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runEvidenceBoundedHypothesis(
            provider,
            intelligencePack
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          hypothesis: null,

          issues: [
            "CASE_MISMATCH",
            "PLAN_MISMATCH",
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects an AI attempt to establish causality",
      async () => {
        const pack =
          evidencePack();

        const intelligencePack =
          projectPeerIntelligenceEvidencePack(
            pack
          );

        const {
          provider,
        } =
          providerWithHypothesisOutput({
            caseId:
              pack.caseId,

            planId:
              pack.planId,

            hypothesisId:
              "HYPOTHESIS-001",

            statement:
              "AI attempts a causal conclusion.",

            supportingEvidence: [],

            counterEvidence: [],

            alternativeExplanations: [],

            uncertainties: [],

            causalConclusion:
              "ESTABLISHED",
          });

        const result =
          await runEvidenceBoundedHypothesis(
            provider,
            intelligencePack
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          hypothesis: null,

          issues: [
            "INVALID_OUTPUT",
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );
  }
);