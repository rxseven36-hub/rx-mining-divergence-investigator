import type {
  RXIntegratedInvestigationRunResult,
} from "./run-integrated-investigation";

export interface RXIntegratedInvestigationApiResponse {
  status:
    "ACCEPTED";

  stage:
    "DETERMINISTIC_INVESTIGATION";

  caseId:
    string;

  planId:
    string;

  investigationCase:
    RXIntegratedInvestigationRunResult[
      "investigationCase"
    ];

  evidenceExecution: {
    rest:
      RXIntegratedInvestigationRunResult[
        "execution"
      ]["rest"];

    financial:
      RXIntegratedInvestigationRunResult[
        "execution"
      ]["financial"];

    summary:
      RXIntegratedInvestigationRunResult[
        "execution"
      ]["summary"];
  };

  causalConclusion:
    "UNKNOWN";
}

/**
 * Stable application/API projection.
 *
 * HTTP routes and UI consumers should consume this projection
 * rather than depending directly on planner/preparer internals.
 *
 * No synthesis, ranking, scoring, or causal inference occurs here.
 */
export function projectIntegratedInvestigationResponse(
  result:
    RXIntegratedInvestigationRunResult,
): RXIntegratedInvestigationApiResponse {
  return {
    status:
      "ACCEPTED",

    stage:
      "DETERMINISTIC_INVESTIGATION",

    caseId:
      result.execution.caseId,

    planId:
      result.execution.planId,

    investigationCase:
      result.investigationCase,

    evidenceExecution: {
      rest:
        result.execution.rest,

      financial:
        result.execution.financial,

      summary:
        result.execution.summary,
    },

    causalConclusion:
      "UNKNOWN",
  };
}