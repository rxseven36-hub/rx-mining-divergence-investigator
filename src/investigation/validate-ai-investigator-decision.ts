import {
  RXAIInvestigatorDecisionSchema,
} from "./ai-investigator-schema";

import type {
  RXAIInvestigatorDecision,
} from "./ai-investigator";

import type {
  RXInvestigationPlan,
} from "./investigation-plan";

export type RXAIInvestigatorDecisionIssue =
  | "INVALID_OUTPUT"
  | "CASE_MISMATCH"
  | "PLAN_MISMATCH"
  | "UNKNOWN_REQUEST"
  | "DUPLICATE_REQUEST"
  | "DUPLICATE_PRIORITY"
  | "DUPLICATE_UNKNOWN";

export type RXAIInvestigatorDecisionValidation =
  | {
      valid: true;

      decision:
        RXAIInvestigatorDecision;

      issues: [];
    }
  | {
      valid: false;

      decision: null;

      issues:
        RXAIInvestigatorDecisionIssue[];
    };

function hasDuplicates(
  values: string[]
): boolean {
  return (
    new Set(values).size !==
    values.length
  );
}

/**
 * Validates untrusted AI output before it is allowed
 * to enter the typed investigation domain.
 *
 * Validation happens in two stages:
 *
 * 1. Runtime shape validation through Zod.
 * 2. Deterministic relationship validation against
 *    the original investigation plan.
 *
 * The AI cannot create requests outside the plan
 * or establish a causal conclusion here.
 */
export function validateAIInvestigatorDecision(
  candidate: unknown,
  plan:
    RXInvestigationPlan
): RXAIInvestigatorDecisionValidation {
  const parsed =
    RXAIInvestigatorDecisionSchema
      .safeParse(candidate);

  if (!parsed.success) {
    return {
      valid: false,
      decision: null,
      issues: [
        "INVALID_OUTPUT",
      ],
    };
  }

  const decision:
    RXAIInvestigatorDecision =
      parsed.data;

  const issues:
    RXAIInvestigatorDecisionIssue[] =
      [];

  if (
    decision.caseId !==
    plan.caseId
  ) {
    issues.push(
      "CASE_MISMATCH"
    );
  }

  if (
    decision.planId !==
    plan.planId
  ) {
    issues.push(
      "PLAN_MISMATCH"
    );
  }

  const plannedRequestIds =
    new Set(
      plan.dataRequests.map(
        (request) =>
          request.requestId
      )
    );

  const actionRequestIds =
    decision.actions.map(
      (action) =>
        action.requestId
    );

  if (
    actionRequestIds.some(
      (requestId) =>
        !plannedRequestIds.has(
          requestId
        )
    )
  ) {
    issues.push(
      "UNKNOWN_REQUEST"
    );
  }

  if (
    hasDuplicates(
      actionRequestIds
    )
  ) {
    issues.push(
      "DUPLICATE_REQUEST"
    );
  }

  const priorities =
    decision.actions.map(
      (action) =>
        String(action.priority)
    );

  if (
    hasDuplicates(
      priorities
    )
  ) {
    issues.push(
      "DUPLICATE_PRIORITY"
    );
  }

  const normalizedUnknowns =
    decision.unresolvedUnknowns.map(
      (unknown) =>
        unknown
          .trim()
          .toLowerCase()
    );

  if (
    hasDuplicates(
      normalizedUnknowns
    )
  ) {
    issues.push(
      "DUPLICATE_UNKNOWN"
    );
  }

  if (issues.length > 0) {
    return {
      valid: false,
      decision: null,
      issues,
    };
  }

  return {
    valid: true,
    decision,
    issues: [],
  };
}