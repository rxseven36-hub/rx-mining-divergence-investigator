import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  GeminiLLMProvider,
} from "../investigation/gemini-llm-provider";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

function createEvidencePack():
  Parameters<
    LLMProvider["proposeHypothesis"]
  >[0]["evidencePack"] {
  return {
    planId:
      "PLAN-1",

    caseId:
      "CASE-1",

    commodity:
      "NICKEL",

    period: {
      kind:
        "YEAR",

      year:
        2025,

      start:
        "2025-01-01",

      end:
        "2025-12-31",
    },

    firstCompany: [
      {
        evidenceId:
          "EVIDENCE-A",

        requestId:
          "REQUEST-A",

        target:
          "FIRST_COMPANY",

        companyId:
          "COMPANY-A",

        source:
          "SECTORS",

        sourceReference:
          "SOURCE-A",

        truthClass:
          "SOURCE_FACT",

        description:
          "Company A production increased.",
      },
    ],

    secondCompany: [
      {
        evidenceId:
          "EVIDENCE-B",

        requestId:
          "REQUEST-B",

        target:
          "SECOND_COMPANY",

        companyId:
          "COMPANY-B",

        source:
          "SECTORS",

        sourceReference:
          "SOURCE-B",

        truthClass:
          "SOURCE_FACT",

        description:
          "Company B production declined.",
      },
    ],

    shared: [],

    evidenceCount:
      2,

    causalConclusion:
      "UNKNOWN",
  };
}

function createResponse(
  output:
    Record<string, unknown>
): Response {
  return new Response(
    JSON.stringify({
      model:
        "gemini-3.6-flash",

      status:
        "completed",

      steps: [
        {
          type:
            "model_output",

          content: [
            {
              type:
                "text",

              text:
                JSON.stringify(
                  output
                ),
            },
          ],
        },
      ],
    }),
    {
      status:
        200,

      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );
}

function createProviderInput():
  Parameters<
    LLMProvider["proposeHypothesis"]
  >[0] {
  return {
    evidencePack:
      createEvidencePack(),

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "GeminiLLMProvider",
  () => {
    it(
      "calls Gemini Interactions API statelessly and returns an RX-owned hypothesis identity",
      async () => {
        const fetchImpl =
          vi.fn(
            async (
              _input:
                string | URL | Request,

              _init?:
                RequestInit
            ) =>
              createResponse({
                statement:
                  "The evidence may indicate a peer production divergence.",

                supportingEvidence: [
                  {
                    evidenceId:
                      "EVIDENCE-A",

                    requestId:
                      "REQUEST-A",
                  },
                ],

                counterEvidence:
                  [],

                alternativeExplanations: [
                  "Other operational factors may explain the divergence.",
                ],

                uncertainties: [
                  "Causality is not established.",
                ],
              })
          );

        const provider =
          new GeminiLLMProvider({
            apiKey:
              "test-key",

            fetchImpl,
          });

        const result =
          await provider.proposeHypothesis(
            createProviderInput()
          );

        expect(result)
          .toEqual({
            caseId:
              "CASE-1",

            planId:
              "PLAN-1",

            hypothesisId:
              "HYPOTHESIS-CASE-1",

            statement:
              "The evidence may indicate a peer production divergence.",

            supportingEvidence: [
              {
                evidenceId:
                  "EVIDENCE-A",

                requestId:
                  "REQUEST-A",
              },
            ],

            counterEvidence:
              [],

            alternativeExplanations: [
              "Other operational factors may explain the divergence.",
            ],

            uncertainties: [
              "Causality is not established.",
            ],

            causalConclusion:
              "UNKNOWN",
          });

        expect(fetchImpl)
          .toHaveBeenCalledTimes(
            1
          );

        const [
          endpoint,
          init,
        ] =
          fetchImpl.mock.calls[0];

        expect(endpoint)
          .toBe(
            "https://generativelanguage.googleapis.com/v1beta/interactions"
          );

        expect(init?.method)
          .toBe(
            "POST"
          );

        expect(init?.headers)
          .toEqual({
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              "test-key",
          });

        const body =
          JSON.parse(
            String(
              init?.body
            )
          );

        expect(body.model)
          .toBe(
            "gemini-3.6-flash"
          );

        expect(body.store)
          .toBe(
            false
          );

        expect(
          body.response_format
            .mime_type
        )
          .toBe(
            "application/json"
          );
      }
    );

    it(
      "preserves model evidence references instead of repairing invalid lineage",
      async () => {
        const provider =
          new GeminiLLMProvider({
            apiKey:
              "test-key",

            fetchImpl:
              async () =>
                createResponse({
                  statement:
                    "Candidate",

                  supportingEvidence: [
                    {
                      evidenceId:
                        "FABRICATED-EVIDENCE",

                      requestId:
                        "FABRICATED-REQUEST",
                    },
                  ],

                  counterEvidence:
                    [],

                  alternativeExplanations:
                    [],

                  uncertainties:
                    [],
                }),
          });

        const result =
          await provider.proposeHypothesis(
            createProviderInput()
          );

        expect(result)
          .toMatchObject({
            supportingEvidence: [
              {
                evidenceId:
                  "FABRICATED-EVIDENCE",

                requestId:
                  "FABRICATED-REQUEST",
              },
            ],
          });
      }
    );

    it(
      "preserves validated hypothesis identity through challenge generation",
      async () => {
        const provider =
          new GeminiLLMProvider({
            apiKey:
              "test-key",

            fetchImpl:
              async () =>
                createResponse({
                  critique:
                    "The evidence establishes association, not causality.",

                  challengingEvidence:
                    [],

                  unresolvedConcerns: [
                    "Causal contribution is not established.",
                  ],
                }),
          });

        const input:
          Parameters<
            LLMProvider["challengeHypothesis"]
          >[0] = {
          evidencePack:
            createEvidencePack(),

          hypothesis: {
            caseId:
              "CASE-1",

            planId:
              "PLAN-1",

            hypothesisId:
              "HYPOTHESIS-CASE-1",

            statement:
              "Candidate hypothesis",

            supportingEvidence:
              [],

            counterEvidence:
              [],

            alternativeExplanations:
              [],

            uncertainties:
              [],

            causalConclusion:
              "UNKNOWN",
          },

          causalConclusion:
            "UNKNOWN",
        };

        const result =
          await provider.challengeHypothesis(
            input
          );

        expect(result)
          .toMatchObject({
            caseId:
              "CASE-1",

            planId:
              "PLAN-1",

            hypothesisId:
              "HYPOTHESIS-CASE-1",

            challengeId:
              "CHALLENGE-HYPOTHESIS-CASE-1",

            causalConclusion:
              "UNKNOWN",
          });
      }
    );

    it(
      "preserves validated reasoning-chain identity through brief generation",
      async () => {
        const provider =
          new GeminiLLMProvider({
            apiKey:
              "test-key",

            fetchImpl:
              async () =>
                createResponse({
                  executiveSummary:
                    "A production divergence is observed, while causality remains unresolved.",

                  evidenceReferences:
                    [],

                  alternativeExplanations:
                    [],

                  uncertainties: [
                    "Causality is not established.",
                  ],

                  unresolvedConcerns: [
                    "Additional evidence is required.",
                  ],
                }),
          });

        const input:
          Parameters<
            LLMProvider["synthesizeBrief"]
          >[0] = {
          evidencePack:
            createEvidencePack(),

          hypothesis: {
            caseId:
              "CASE-1",

            planId:
              "PLAN-1",

            hypothesisId:
              "HYPOTHESIS-CASE-1",

            statement:
              "Candidate hypothesis",

            supportingEvidence:
              [],

            counterEvidence:
              [],

            alternativeExplanations:
              [],

            uncertainties:
              [],

            causalConclusion:
              "UNKNOWN",
          },

          challenge: {
            caseId:
              "CASE-1",

            planId:
              "PLAN-1",

            hypothesisId:
              "HYPOTHESIS-CASE-1",

            challengeId:
              "CHALLENGE-HYPOTHESIS-CASE-1",

            critique:
              "Challenge",

            challengingEvidence:
              [],

            unresolvedConcerns:
              [],

            causalConclusion:
              "UNKNOWN",
          },

          causalConclusion:
            "UNKNOWN",
        };

        const result =
          await provider.synthesizeBrief(
            input
          );

        expect(result)
          .toMatchObject({
            caseId:
              "CASE-1",

            planId:
              "PLAN-1",

            briefId:
              "BRIEF-HYPOTHESIS-CASE-1",

            hypothesisId:
              "HYPOTHESIS-CASE-1",

            challengeId:
              "CHALLENGE-HYPOTHESIS-CASE-1",

            causalConclusion:
              "UNKNOWN",
          });
      }
    );

    it(
      "propagates Gemini runtime failure without fabricating a fallback result",
      async () => {
        const provider =
          new GeminiLLMProvider({
            apiKey:
              "test-key",

            fetchImpl:
              async () =>
                new Response(
                  JSON.stringify({
                    error: {
                      message:
                        "quota exhausted",
                    },
                  }),
                  {
                    status:
                      429,

                    statusText:
                      "Too Many Requests",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                  }
                ),
          });

        await expect(
          provider.proposeHypothesis(
            createProviderInput()
          )
        )
          .rejects
          .toThrow(
            "Gemini interaction failed: quota exhausted"
          );
      }
    );

    it(
      "fails explicitly at the unsupported legacy investigate boundary",
      async () => {
        const provider =
          new GeminiLLMProvider({
            apiKey:
              "test-key",
          });

        await expect(
          provider.investigate(
            {} as Parameters<
              LLMProvider["investigate"]
            >[0]
          )
        )
          .rejects
          .toThrow(
            "does not support the legacy investigate boundary"
          );
      }
    );
  }
);
