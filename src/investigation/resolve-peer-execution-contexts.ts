import type {
  RXPreparedPeerInvestigationRequest,
  RXPreparedPeerInvestigationRequests,
} from "./prepare-peer-investigation-requests";

import type {
  RXPeerInvestigationTargetContexts,
} from "./resolve-peer-investigation-target-contexts";

export type RXPeerExecutionContextResolutionIssue =
  | "FIRST_COMPANY_ID_MISMATCH"
  | "SECOND_COMPANY_ID_MISMATCH"
  | "SHARED_TARGET_COMPANY_ID_PRESENT";

export interface RXPeerPreparedRequestExecutionContext {
  requestId: string;

  target:
    | "FIRST_COMPANY"
    | "SECOND_COMPANY"
    | "SHARED";

  /**
   * Company identity exists only when execution belongs
   * to one canonical peer company.
   *
   * Shared comparison requests deliberately remain
   * companyless.
   */
  companyId:
    string | null;

  /**
   * Deterministic audit/source reference derived from
   * the already-bound typed operation.
   */
  sourceReference:
    string;
}

export type RXPeerPreparedRequestExecutionRouting =
  | {
      status: "ROUTED";

      preparedRequest:
        Extract<
          RXPreparedPeerInvestigationRequest,
          {
            status: "READY";
          }
        >;

      context:
        RXPeerPreparedRequestExecutionContext;

      issues: [];
    }
  | {
      /**
       * Preparation rejection remains a hard boundary.
       *
       * No execution context is produced.
       */
      status: "SKIPPED";

      preparedRequest:
        Extract<
          RXPreparedPeerInvestigationRequest,
          {
            status: "REJECTED";
          }
        >;

      context: null;

      issue:
        "PREPARED_REQUEST_REJECTED";
    }
  | {
      /**
       * The prepared request was READY, but execution
       * routing detected corrupted target identity.
       */
      status: "REJECTED";

      preparedRequest:
        Extract<
          RXPreparedPeerInvestigationRequest,
          {
            status: "READY";
          }
        >;

      context: null;

      issues:
        RXPeerExecutionContextResolutionIssue[];
    };

export interface RXResolvedPeerExecutionContexts {
  planId:
    string;

  caseId:
    string;

  requests:
    RXPeerPreparedRequestExecutionRouting[];

  routedCount:
    number;

  skippedCount:
    number;

  rejectedCount:
    number;

  /**
   * Peer execution-context resolution performs only
   * deterministic routing.
   *
   * It does NOT:
   * - execute Sectors operations,
   * - consume API credits,
   * - collect evidence,
   * - call an LLM,
   * - infer causal explanations.
   */
  causalConclusion:
    "UNKNOWN";
}

type RXReadyPreparedPeerInvestigationRequest =
  Extract<
    RXPreparedPeerInvestigationRequest,
    {
      status: "READY";
    }
  >;

function buildSourceReference(
  prepared:
    RXReadyPreparedPeerInvestigationRequest
): string {
  switch (
    prepared.operation.operation
  ) {
    case "GET_MINING_OPERATIONAL_CONTEXT":
      return [
        "sectors",
        "mining-operational-context",
        prepared.operation.params
          .sectorsSlug,
      ].join(":");

    case "GET_MINING_HISTORICAL_PERFORMANCE": {
      const period =
        prepared.operation.params.period;

      const periodReference =
        period.kind === "YEAR"
          ? String(
              period.year ??
                "unknown-year"
            )
          : "unknown-period";

      return [
        "sectors",
        "mining-performance",
        prepared.operation.params
          .sectorsSlug,
        periodReference,
      ].join(":");
    }

    case "GET_COMMODITY_PRICE_HISTORY":
      return [
        "sectors",
        "commodity-price",
        prepared.operation.params
          .commodity,
        prepared.request.requestId,
      ].join(":");

    case "GET_COMPANY_MARKET_TRANSACTION_HISTORY":
      return [
        "sectors",
        "market-transaction",
        prepared.operation.params
          .ticker,
        prepared.request.requestId,
      ].join(":");
  }
}

function routeReadyPreparedRequest(
  prepared:
    RXReadyPreparedPeerInvestigationRequest,
  contexts:
    RXPeerInvestigationTargetContexts
): RXPeerPreparedRequestExecutionRouting {
  const request =
    prepared.request;

  const issues:
    RXPeerExecutionContextResolutionIssue[] =
      [];

  switch (request.target) {
    case "FIRST_COMPANY":
      if (
        request.targetCompanyId !==
        contexts.firstCompany.companyId
      ) {
        issues.push(
          "FIRST_COMPANY_ID_MISMATCH"
        );
      }

      if (issues.length > 0) {
        return {
          status: "REJECTED",

          preparedRequest:
            prepared,

          context: null,

          issues,
        };
      }

      return {
        status: "ROUTED",

        preparedRequest:
          prepared,

        context: {
          requestId:
            request.requestId,

          target:
            request.target,

          companyId:
            contexts.firstCompany
              .companyId,

          sourceReference:
            buildSourceReference(
              prepared
            ),
        },

        issues: [],
      };

    case "SECOND_COMPANY":
      if (
        request.targetCompanyId !==
        contexts.secondCompany.companyId
      ) {
        issues.push(
          "SECOND_COMPANY_ID_MISMATCH"
        );
      }

      if (issues.length > 0) {
        return {
          status: "REJECTED",

          preparedRequest:
            prepared,

          context: null,

          issues,
        };
      }

      return {
        status: "ROUTED",

        preparedRequest:
          prepared,

        context: {
          requestId:
            request.requestId,

          target:
            request.target,

          companyId:
            contexts.secondCompany
              .companyId,

          sourceReference:
            buildSourceReference(
              prepared
            ),
        },

        issues: [],
      };

    case "SHARED":
      if (
        request.targetCompanyId !==
        null
      ) {
        issues.push(
          "SHARED_TARGET_COMPANY_ID_PRESENT"
        );
      }

      if (issues.length > 0) {
        return {
          status: "REJECTED",

          preparedRequest:
            prepared,

          context: null,

          issues,
        };
      }

      return {
        status: "ROUTED",

        preparedRequest:
          prepared,

        context: {
          requestId:
            request.requestId,

          target:
            request.target,

          companyId: null,

          sourceReference:
            buildSourceReference(
              prepared
            ),
        },

        issues: [],
      };
  }
}

/**
 * Resolves deterministic execution routing for already
 * prepared peer investigation requests.
 *
 * READY requests receive canonical peer execution identity.
 * REJECTED preparation results remain skipped and never
 * receive execution context.
 *
 * Shared requests deliberately receive companyId = null.
 *
 * No Sectors execution, evidence admission, API call, LLM
 * call, or causal inference occurs here.
 */
export function resolvePeerExecutionContexts(
  prepared:
    RXPreparedPeerInvestigationRequests,
  contexts:
    RXPeerInvestigationTargetContexts
): RXResolvedPeerExecutionContexts {
  const requests:
    RXPeerPreparedRequestExecutionRouting[] =
      prepared.requests.map(
        (request) => {
          if (
            request.status ===
            "REJECTED"
          ) {
            return {
              status:
                "SKIPPED",

              preparedRequest:
                request,

              context: null,

              issue:
                "PREPARED_REQUEST_REJECTED",
            };
          }

          return routeReadyPreparedRequest(
            request,
            contexts
          );
        }
      );

  const routedCount =
    requests.filter(
      (request) =>
        request.status ===
        "ROUTED"
    ).length;

  const skippedCount =
    requests.filter(
      (request) =>
        request.status ===
        "SKIPPED"
    ).length;

  const rejectedCount =
    requests.filter(
      (request) =>
        request.status ===
        "REJECTED"
    ).length;

  return {
    planId:
      prepared.planId,

    caseId:
      prepared.caseId,

    requests,

    routedCount,

    skippedCount,

    rejectedCount,

    causalConclusion:
      "UNKNOWN",
  };
}