import type {
  RXInvestigationPlan,
} from "./investigation-plan";

export type RXInvestigationPlanIssue =
  | "NO_QUESTIONS"
  | "NO_EVIDENCE_REQUIREMENTS"
  | "NO_DATA_REQUESTS"
  | "NO_REQUIRED_EVIDENCE"
  | "ORPHAN_EVIDENCE_REQUIREMENT"
  | "ORPHAN_DATA_REQUEST"
  | "DUPLICATE_QUESTION_ID"
  | "DUPLICATE_REQUIREMENT_ID"
  | "DUPLICATE_REQUEST_ID"
  | "NO_STOP_CONDITIONS";

export interface RXInvestigationPlanValidation {
  valid: boolean;

  issues:
    RXInvestigationPlanIssue[];
}

function hasDuplicates(
  values: string[]
): boolean {
  return (
    new Set(values).size !==
    values.length
  );
}

export function validateInvestigationPlan(
  plan: RXInvestigationPlan
): RXInvestigationPlanValidation {
  const issues:
    RXInvestigationPlanIssue[] = [];

  if (plan.questions.length === 0) {
    issues.push("NO_QUESTIONS");
  }

  if (
    plan.evidenceRequirements
      .length === 0
  ) {
    issues.push(
      "NO_EVIDENCE_REQUIREMENTS"
    );
  }

  if (
    plan.dataRequests.length === 0
  ) {
    issues.push(
      "NO_DATA_REQUESTS"
    );
  }

  if (
    !plan.evidenceRequirements.some(
      (item) => item.required
    )
  ) {
    issues.push(
      "NO_REQUIRED_EVIDENCE"
    );
  }

  const questionIds =
    plan.questions.map(
      (item) => item.questionId
    );

  const requirementIds =
    plan.evidenceRequirements.map(
      (item) => item.requirementId
    );

  const requestIds =
    plan.dataRequests.map(
      (item) => item.requestId
    );

  if (
    hasDuplicates(questionIds)
  ) {
    issues.push(
      "DUPLICATE_QUESTION_ID"
    );
  }

  if (
    hasDuplicates(requirementIds)
  ) {
    issues.push(
      "DUPLICATE_REQUIREMENT_ID"
    );
  }

  if (
    hasDuplicates(requestIds)
  ) {
    issues.push(
      "DUPLICATE_REQUEST_ID"
    );
  }

  const questionSet =
    new Set(questionIds);

  if (
    plan.evidenceRequirements.some(
      (item) =>
        !questionSet.has(
          item.questionId
        )
    )
  ) {
    issues.push(
      "ORPHAN_EVIDENCE_REQUIREMENT"
    );
  }

  const requirementSet =
    new Set(requirementIds);

  if (
    plan.dataRequests.some(
      (item) =>
        !requirementSet.has(
          item.requirementId
        )
    )
  ) {
    issues.push(
      "ORPHAN_DATA_REQUEST"
    );
  }

  if (
    plan.stopConditions.length === 0
  ) {
    issues.push(
      "NO_STOP_CONDITIONS"
    );
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}