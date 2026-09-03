import {
  createPeerComparisonIdentity,
} from "../intelligence/comparability/peer-comparison-identity";

import {
  evaluatePeerPriorityOrientation,
} from "../intelligence/priority/peer-priority-orientation";

import type {
  RXRankedPeerDivergencePriorityResult,
} from "../intelligence/priority/rank-peer-priorities";

import {
  createPeerDivergenceInvestigationSubject,
} from "./investigation-subject";

import type {
  RXPeerInvestigationCase,
} from "./peer-investigation-case";

export type RXPeerCaseCreationFailure =
  | "PRIORITY_NOT_CANONICAL"
  | "PRIORITY_SCORE_INVALID"
  | "DIVERGENCE_MAGNITUDE_MISSING"
  | "DIVERGENCE_MAGNITUDE_INVALID"
  | "RANK_INVALID";

export type RXPeerCaseCreationResult =
  | {
      ok:
        true;

      case:
        RXPeerInvestigationCase;

      reasons:
        [];
    }
  | {
      ok:
        false;

      case:
        null;

      reasons:
        RXPeerCaseCreationFailure[];
    };

function normalizeCasePart(
  value:
    string
): string {
  return (
    value
      .trim()
      .replace(
        /[^A-Za-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .toUpperCase() ||
    "NA"
  );
}

function createPeerCaseId(
  comparisonIdentityKey:
    string,
  rank:
    number
): string {
  return [
    "RX",
    "PEER",
    normalizeCasePart(
      comparisonIdentityKey
    ),
    String(
      rank
    ),
  ].join(
    "-"
  );
}

export function createPeerInvestigationCase(
  priority:
    RXRankedPeerDivergencePriorityResult
): RXPeerCaseCreationResult {
  const reasons:
    RXPeerCaseCreationFailure[] =
      [];

  const orientation =
    evaluatePeerPriorityOrientation(
      priority
    );

  if (
    !orientation.isCanonical
  ) {
    reasons.push(
      "PRIORITY_NOT_CANONICAL"
    );
  }

  if (
    !Number.isFinite(
      priority.score
    )
  ) {
    reasons.push(
      "PRIORITY_SCORE_INVALID"
    );
  }

  if (
    priority.divergenceMagnitude ===
    null
  ) {
    reasons.push(
      "DIVERGENCE_MAGNITUDE_MISSING"
    );
  } else if (
    !Number.isFinite(
      priority.divergenceMagnitude
    )
  ) {
    reasons.push(
      "DIVERGENCE_MAGNITUDE_INVALID"
    );
  }

  if (
    !Number.isInteger(
      priority.rank
    ) ||
    priority.rank < 1
  ) {
    reasons.push(
      "RANK_INVALID"
    );
  }

  if (
    reasons.length > 0
  ) {
    return {
      ok:
        false,

      case:
        null,

      reasons,
    };
  }

  const comparisonIdentity =
    createPeerComparisonIdentity(
      priority
    );

  const subject =
    createPeerDivergenceInvestigationSubject(
      priority.leftCompanyId,
      priority.rightCompanyId
    );

  const divergenceMagnitude =
    priority.divergenceMagnitude as number;

  return {
    ok:
      true,

    case: {
      caseId:
        createPeerCaseId(
          comparisonIdentity.key,
          priority.rank
        ),

      subject,

      comparisonIdentityKey:
        comparisonIdentity.key,

      metric:
        priority.metric,

      commodity:
        priority.commodity,

      leftCommoditySubtype:
        priority.leftCommoditySubtype,

      rightCommoditySubtype:
        priority.rightCommoditySubtype,

      leftUnit: {
        ...priority.leftUnit,
      },

      rightUnit: {
        ...priority.rightUnit,
      },

      leftPeriod: {
        ...priority.leftPeriod,
      },

      rightPeriod: {
        ...priority.rightPeriod,
      },

      leftObservationId:
        priority.leftObservationId,

      rightObservationId:
        priority.rightObservationId,

      trigger: {
        priorityScore:
          priority.score,

        divergenceMagnitude,

        rank:
          priority.rank,

        triggerType:
          "DETERMINISTIC_PEER_DIVERGENCE_PRIORITY",
      },

      status:
        "QUEUED",

      truthState:
        "UNINVESTIGATED",

      unknowns:
        [],

      causalExplanation:
        "UNKNOWN",
    },

    reasons:
      [],
  };
}