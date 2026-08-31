import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXAIInvestigatorDecision,
} from "../investigation/ai-investigator";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

import {
  createInvestigationPlan,
} from "../investigation/create-investigation-plan";

import {
  validateAIInvestigatorDecision,
} from "../investigation/validate-ai-investigator-decision";

function investigationCase():
  RXInvestigationCase {
  return {
    caseId:
      "RX-AADI-JK-COAL-2024-1",

    companyId: "AADI.JK",

    commodity: "COAL",

    periodLabel: "2024",

    detector:
      "PRODUCTION_VS_SALES",

    trigger: {
      detector:
        "PRODUCTION_VS_SALES",

      priorityScore: 15,

      divergenceRatio: 0.18,

      rank: 1,

      triggerType:
        "DETERMINISTIC_DIVERGENCE_PRIORITY",
    },

    sourceObservationIds: [
      "production",
      "sales",
    ],

    status: "QUEUED",

    truthState:
      "UNINVESTIGATED",

    unknowns: [],

    causalExplanation:
      "UNKNOWN",
  };
}

function validDecision():
  RXAIInvestigatorDecision {
  const plan =
    createInvestigationPlan(
      investigationCase()
    );

  return {
    caseId:
      plan.caseId,

    planId:
      plan.planId,

    actions:
      plan.dataRequests.map(
        (request, index) => ({
          requestId:
            request.requestId,

          priority:
            index + 1,

          rationale:
            `Investigate ${request.requestId} within the existing plan.`,
        })
      ),

    unresolvedUnknowns: [
      "The cause of the detected divergence remains unknown.",
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "validateAIInvestigatorDecision",
  () => {
    it(
      "accepts and returns a bounded valid decision",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision =
          validDecision();

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(result).toEqual({
          valid: true,
          decision,
          issues: [],
        });
      }
    );

    it(
      "rejects malformed untrusted AI output",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const result =
          validateAIInvestigatorDecision(
            {
              ...validDecision(),
              actions: null,
            },
            plan
          );

        expect(result).toEqual({
          valid: false,
          decision: null,
          issues: [
            "INVALID_OUTPUT",
          ],
        });
      }
    );

    it(
      "rejects a causal conclusion invented by AI",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const result =
          validateAIInvestigatorDecision(
            {
              ...validDecision(),
              causalConclusion:
                "INVENTORY_DRAWDOWN",
            },
            plan
          );

        expect(result).toEqual({
          valid: false,
          decision: null,
          issues: [
            "INVALID_OUTPUT",
          ],
        });
      }
    );

    it(
      "rejects unexpected output fields",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const result =
          validateAIInvestigatorDecision(
            {
              ...validDecision(),
              inventedEvidence:
                "Sales rose because inventory fell.",
            },
            plan
          );

        expect(result).toEqual({
          valid: false,
          decision: null,
          issues: [
            "INVALID_OUTPUT",
          ],
        });
      }
    );

    it(
      "rejects case and plan identity mismatches",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision = {
          ...validDecision(),

          caseId:
            "CASE-OTHER",

          planId:
            "PLAN-OTHER",
        };

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(
          result.issues
        ).toContain(
          "CASE_MISMATCH"
        );

        expect(
          result.issues
        ).toContain(
          "PLAN_MISMATCH"
        );

        expect(
          result.valid
        ).toBe(false);
      }
    );

    it(
      "rejects requests not created by the deterministic plan",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision =
          validDecision();

        decision.actions = [
          ...decision.actions,
          {
            requestId:
              "AI-INVENTED-REQUEST",

            priority: 99,

            rationale:
              "Invented request must be rejected.",
          },
        ];

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(
          result.issues
        ).toContain(
          "UNKNOWN_REQUEST"
        );
      }
    );

    it(
      "rejects duplicate request selections",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision =
          validDecision();

        decision.actions = [
          decision.actions[0]!,
          {
            ...decision.actions[0]!,
            priority: 2,
          },
        ];

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(
          result.issues
        ).toContain(
          "DUPLICATE_REQUEST"
        );
      }
    );

    it(
      "rejects invalid runtime priorities",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision = {
          ...validDecision(),

          actions: [
            {
              ...validDecision()
                .actions[0],

              priority: "one",
            },
          ],
        };

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(result).toEqual({
          valid: false,
          decision: null,
          issues: [
            "INVALID_OUTPUT",
          ],
        });
      }
    );

    it(
      "rejects duplicate priorities",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision =
          validDecision();

        decision.actions[1] = {
          ...decision.actions[1]!,
          priority:
            decision.actions[0]!
              .priority,
        };

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(
          result.issues
        ).toContain(
          "DUPLICATE_PRIORITY"
        );
      }
    );

    it(
      "rejects blank rationales at the runtime boundary",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision = {
          ...validDecision(),

          actions: [
            {
              ...validDecision()
                .actions[0],

              rationale: "   ",
            },
          ],
        };

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(result).toEqual({
          valid: false,
          decision: null,
          issues: [
            "INVALID_OUTPUT",
          ],
        });
      }
    );

    it(
      "rejects duplicate unresolved unknowns after normalization",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase()
          );

        const decision =
          validDecision();

        decision.unresolvedUnknowns = [
          "Cause remains unknown",
          "  cause remains unknown  ",
        ];

        const result =
          validateAIInvestigatorDecision(
            decision,
            plan
          );

        expect(
          result.issues
        ).toContain(
          "DUPLICATE_UNKNOWN"
        );
      }
    );
  }
);