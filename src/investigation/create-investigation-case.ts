import type {
  RXPriorityResult,
} from "../intelligence/priority/priority-result";

import type {
  RXInvestigationCase,
} from "./investigation-case";

export type RXCaseCreationFailure =
  | "PRIORITY_NOT_SCORABLE"
  | "PRIORITY_SCORE_MISSING"
  | "DIVERGENCE_RATIO_MISSING"
  | "RANK_MISSING"
  | "RANK_INVALID";

export type RXCaseCreationResult =
  | {
      ok: true;
      case: RXInvestigationCase;
      reasons: [];
    }
  | {
      ok: false;
      case: null;
      reasons: RXCaseCreationFailure[];
    };

function normalizeCasePart(
  value: string | undefined
): string {
  if (!value) {
    return "NA";
  }

  return value
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase() || "NA";
}

function createCaseId(
  priority: RXPriorityResult
): string {
  return [
    "RX",
    normalizeCasePart(priority.companyId),
    normalizeCasePart(priority.commodity),
    normalizeCasePart(
      priority.commoditySubtype
    ),
    normalizeCasePart(
      priority.periodLabel
    ),
    String(priority.rank),
  ].join("-");
}

export function createInvestigationCase(
  priority: RXPriorityResult
): RXCaseCreationResult {
  const reasons:
    RXCaseCreationFailure[] = [];

  if (priority.status !== "SCORABLE") {
    reasons.push(
      "PRIORITY_NOT_SCORABLE"
    );
  }

  if (
    priority.score === null ||
    !Number.isFinite(priority.score)
  ) {
    reasons.push(
      "PRIORITY_SCORE_MISSING"
    );
  }

  if (
    priority.divergenceRatio === null ||
    !Number.isFinite(
      priority.divergenceRatio
    )
  ) {
    reasons.push(
      "DIVERGENCE_RATIO_MISSING"
    );
  }

  if (
    priority.rank === undefined
  ) {
    reasons.push("RANK_MISSING");
  } else if (
    !Number.isInteger(priority.rank) ||
    priority.rank < 1
  ) {
    reasons.push("RANK_INVALID");
  }

  if (reasons.length > 0) {
    return {
      ok: false,
      case: null,
      reasons,
    };
  }

  /**
   * Guarded above. These values are now proven present
   * and finite for case creation.
   */
  const priorityScore =
    priority.score as number;

  const divergenceRatio =
    priority.divergenceRatio as number;

  const rank =
    priority.rank as number;

  return {
    ok: true,

    case: {
      caseId:
        createCaseId(priority),

      companyId:
        priority.companyId,

      commodity:
        priority.commodity,

      commoditySubtype:
        priority.commoditySubtype,

      periodLabel:
        priority.periodLabel,

      detector:
        priority.detector,

      trigger: {
        detector:
          priority.detector,

        priorityScore,

        divergenceRatio,

        rank,

        triggerType:
          "DETERMINISTIC_DIVERGENCE_PRIORITY",
      },

      sourceObservationIds: [
        ...priority.sourceObservationIds,
      ],

      status: "QUEUED",

      truthState:
        "UNINVESTIGATED",

      unknowns: [],

      causalExplanation:
        "UNKNOWN",
    },

    reasons: [],
  };
}