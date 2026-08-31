import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

import {
  createInvestigationPlan,
} from "../investigation/create-investigation-plan";

import {
  runAIInvestigator,
} from "../investigation/run-ai-investigator";



function investigationCase():
  RXInvestigationCase {
  return {
    caseId:
      "CASE-AADI-2024",

    companyId:
      "company-aadi",

    commodity:
      "Coal",

    periodLabel:
      "2024",

    detector:
      "PRODUCTION_VS_SALES",

    trigger: {
      detector:
        "PRODUCTION_VS_SALES",

      priorityScore:
        15.98,

      divergenceRatio:
        0.1598,

      rank:
        1,

      triggerType:
        "DETERMINISTIC_DIVERGENCE_PRIORITY",
    },

    sourceObservationIds: [
      "obs-production",
      "obs-sales",
    ],

    status:
      "QUEUED",

    truthState:
      "UNINVESTIGATED",

    unknowns: [],

    causalExplanation:
      "UNKNOWN",
  };
}

function providerWithOutput(
  output: unknown
): {
  provider: LLMProvider;
  investigate: ReturnType<
    typeof vi.fn
  >;
} {
  const investigate =
    vi.fn(
      async () =>
        output
    );

  const provider:
    LLMProvider = {
      investigate,

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
    investigate,
  };
}

describe(
  "runAIInvestigator",
  () => {
    it(
      "accepts a provider decision only after deterministic validation",
      async () => {
        const investigation =
          investigationCase();

        const plan =
          createInvestigationPlan(
            investigation
          );

        const firstRequest =
          plan.dataRequests[0];

        expect(
          firstRequest
        ).toBeDefined();

        const {
          provider,
          investigate,
        } =
          providerWithOutput({
            caseId:
              investigation.caseId,

            planId:
              plan.planId,

            actions: [
              {
                requestId:
                  firstRequest!
                    .requestId,

                priority: 1,

                rationale:
                  "Investigate the planned operational context first.",
              },
            ],

            unresolvedUnknowns: [
              "The cause of the divergence remains unknown.",
            ],

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runAIInvestigator(
            provider,
            {
              investigationCase:
                investigation,

              investigationPlan:
                plan,
            }
          );

        expect(
          investigate
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          investigate
        ).toHaveBeenCalledWith({
          investigationCase:
            investigation,

          investigationPlan:
            plan,
        });

        expect(
          result.status
        ).toBe("ACCEPTED");

        expect(
          result.decision
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
      "rejects malformed provider output without creating a trusted decision",
      async () => {
        const investigation =
          investigationCase();

        const plan =
          createInvestigationPlan(
            investigation
          );

        const {
          provider,
        } =
          providerWithOutput({
            caseId:
              investigation.caseId,

            planId:
              plan.planId,

            actions: null,

            unresolvedUnknowns: [],

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runAIInvestigator(
            provider,
            {
              investigationCase:
                investigation,

              investigationPlan:
                plan,
            }
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          decision: null,

          issues: [
            "INVALID_OUTPUT",
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects an AI-invented request outside the deterministic plan",
      async () => {
        const investigation =
          investigationCase();

        const plan =
          createInvestigationPlan(
            investigation
          );

        const {
          provider,
        } =
          providerWithOutput({
            caseId:
              investigation.caseId,

            planId:
              plan.planId,

            actions: [
              {
                requestId:
                  "AI-INVENTED-REQUEST",

                priority: 1,

                rationale:
                  "Try an invented request.",
              },
            ],

            unresolvedUnknowns: [],

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runAIInvestigator(
            provider,
            {
              investigationCase:
                investigation,

              investigationPlan:
                plan,
            }
          );

        expect(
          result.status
        ).toBe("REJECTED");

        expect(
          result.decision
        ).toBeNull();

        expect(
          result.issues
        ).toContain(
          "UNKNOWN_REQUEST"
        );
      }
    );

    it(
      "rejects an AI attempt to establish causality",
      async () => {
        const investigation =
          investigationCase();

        const plan =
          createInvestigationPlan(
            investigation
          );

        const {
          provider,
        } =
          providerWithOutput({
            caseId:
              investigation.caseId,

            planId:
              plan.planId,

            actions: [],

            unresolvedUnknowns: [],

            causalConclusion:
              "INVENTORY_DRAWDOWN",
          });

        const result =
          await runAIInvestigator(
            provider,
            {
              investigationCase:
                investigation,

              investigationPlan:
                plan,
            }
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          decision: null,

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
