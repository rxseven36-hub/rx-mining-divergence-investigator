import type {
  RXCommodity,
} from "../types/commodity";

import type {
  RXInvestigationCase,
} from "./investigation-case";

import type {
  RXIntegratedInvestigationRunResult,
} from "./run-integrated-investigation";

import {
  runServerIntegratedInvestigation,
} from "./run-server-integrated-investigation";

import {
  projectIntegratedInvestigationResponse,
} from "./integrated-investigation-response";

export interface RXIntegratedInvestigationHttpBody {
  investigationCase?:
    RXInvestigationCase;

  companyId?:
    string;

  sectorsSlug?:
    string;

  ticker?:
    string;

  commodity?:
    RXCommodity;

  year?:
    number;
}

export interface RXIntegratedInvestigationHttpSuccess {
  httpStatus:
    200;

  body:
    ReturnType<
      typeof projectIntegratedInvestigationResponse
    >;
}

export interface RXIntegratedInvestigationHttpFailure {
  httpStatus:
    400 | 503 | 502;

  body: {
    status:
      "REJECTED";

    stage:
      "REQUEST" |
      "CONFIGURATION" |
      "RUNTIME";

    causalConclusion:
      "UNKNOWN";

    issues:
      string[];
  };
}

export type RXIntegratedInvestigationHttpResult =
  | RXIntegratedInvestigationHttpSuccess
  | RXIntegratedInvestigationHttpFailure;

export interface RXIntegratedInvestigationHttpDependencies {
  runServer(
    input: {
      sectorsApiKey:
        string;

      investigationCase:
        RXInvestigationCase;

      operationContext: {
        companyId:
          string;

        sectorsSlug:
          string;

        ticker:
          string;

        commodity:
          RXCommodity;

        period: {
          kind:
            "YEAR";

          year:
            number;
        };
      };

      retrievedAt?:
        string;

      restEstimatedCreditBudget?:
        number;
    },
  ): Promise<RXIntegratedInvestigationRunResult>;

  projectResponse(
    result:
      RXIntegratedInvestigationRunResult,
  ): ReturnType<
    typeof projectIntegratedInvestigationResponse
  >;
}

function defaultDependencies():
  RXIntegratedInvestigationHttpDependencies {
  return {
    runServer:
      runServerIntegratedInvestigation,

    projectResponse:
      projectIntegratedInvestigationResponse,
  };
}

function isNonEmptyString(
  value:
    unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  );
}

function isCommodity(
  value:
    unknown,
): value is RXCommodity {
  return (
    value ===
      "COAL" ||
    value ===
      "GOLD" ||
    value ===
      "NICKEL" ||
    value ===
      "TIN" ||
    value ===
      "COPPER" ||
    value ===
      "BAUXITE" ||
    value ===
      "IRON"
  );
}

function isCanonicalInvestigationCase(
  value:
    unknown,
): value is RXInvestigationCase {
  if (
    typeof value !==
      "object" ||
    value ===
      null
  ) {
    return false;
  }

  const candidate =
    value as Partial<
      RXInvestigationCase
    >;

  return (
    isNonEmptyString(
      candidate.caseId,
    ) &&
    isNonEmptyString(
      candidate.companyId,
    ) &&
    isNonEmptyString(
      candidate.commodity,
    ) &&
    isNonEmptyString(
      candidate.periodLabel,
    ) &&
    candidate.detector ===
      "PRODUCTION_VS_SALES" &&
    candidate.status ===
      "QUEUED" &&
    candidate.truthState ===
      "UNINVESTIGATED" &&
    candidate.causalExplanation ===
      "UNKNOWN" &&
    Array.isArray(
      candidate.sourceObservationIds,
    ) &&
    Array.isArray(
      candidate.unknowns,
    ) &&
    typeof candidate.trigger ===
      "object" &&
    candidate.trigger !==
      null &&
    candidate.trigger.detector ===
      "PRODUCTION_VS_SALES" &&
    candidate.trigger.triggerType ===
      "DETERMINISTIC_DIVERGENCE_PRIORITY" &&
    Number.isFinite(
      candidate.trigger.priorityScore,
    ) &&
    Number.isFinite(
      candidate.trigger.divergenceRatio,
    ) &&
    Number.isInteger(
      candidate.trigger.rank,
    )
  );
}

/**
 * Pure HTTP/application boundary.
 *
 * Important:
 *
 * - This layer does NOT create investigation cases.
 * - The case must already come from the canonical deterministic
 *   investigation queue.
 * - No provider transport is constructed here.
 * - Server execution is dependency-injectable for dry route tests.
 */
export async function handleIntegratedInvestigationHttp(
  sectorsApiKey:
    string | undefined,

  body:
    RXIntegratedInvestigationHttpBody,

  dependencies:
    RXIntegratedInvestigationHttpDependencies =
      defaultDependencies(),
): Promise<RXIntegratedInvestigationHttpResult> {
  if (
    !isNonEmptyString(
      sectorsApiKey,
    )
  ) {
    return {
      httpStatus:
        503,

      body: {
        status:
          "REJECTED",

        stage:
          "CONFIGURATION",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "SECTORS_CONFIGURATION_MISSING",
        ],
      },
    };
  }

  if (
    !isCanonicalInvestigationCase(
      body.investigationCase,
    ) ||
    !isNonEmptyString(
      body.companyId,
    ) ||
    !isNonEmptyString(
      body.sectorsSlug,
    ) ||
    !isNonEmptyString(
      body.ticker,
    ) ||
    !isCommodity(
      body.commodity,
    ) ||
    typeof body.year !==
      "number" ||
    !Number.isInteger(
      body.year,
    ) ||
    body.year <
      1900 ||
    body.year >
      2100
  ) {
    return {
      httpStatus:
        400,

      body: {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVALID_INTEGRATED_INVESTIGATION_REQUEST",
        ],
      },
    };
  }

  const companyId =
    body.companyId.trim();

  const ticker =
    body.ticker.trim();

  const sectorsSlug =
    body.sectorsSlug.trim();

  /**
   * Cross-boundary attribution guard.
   *
   * The caller cannot submit a canonical case for one company
   * while asking provider execution for another company.
   */
  if (
    body.investigationCase.companyId.trim() !==
      companyId ||
    body.investigationCase.commodity !==
      body.commodity ||
    body.investigationCase.periodLabel !==
      String(body.year)
  ) {
    return {
      httpStatus:
        400,

      body: {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVESTIGATION_CASE_CONTEXT_MISMATCH",
        ],
      },
    };
  }

  try {
    const result =
      await dependencies.runServer({
        sectorsApiKey:
          sectorsApiKey.trim(),

        investigationCase:
          body.investigationCase,

        operationContext: {
          companyId,

          sectorsSlug,

          ticker,

          commodity:
            body.commodity,

          period: {
            kind:
              "YEAR",

            year:
              body.year,
          },
        },

        restEstimatedCreditBudget:
          4,
      });

    return {
      httpStatus:
        200,

      body:
        dependencies.projectResponse(
          result,
        ),
    };
  } catch {
    return {
      httpStatus:
        502,

      body: {
        status:
          "REJECTED",

        stage:
          "RUNTIME",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INTEGRATED_INVESTIGATION_RUNTIME_FAILURE",
        ],
      },
    };
  }
}