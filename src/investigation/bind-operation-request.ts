import type {
  RXCommodity,
} from "../types/commodity";

import type {
  RXCompany,
} from "../types/company";

import type {
  RXTimePeriod,
} from "../types/time";

import {
  resolveSectorsOperation,
} from "../data/sectors/sectors-operation";

import type {
  RXSectorsTypedOperationRequest,
} from "../data/sectors/sectors-operation-request";

import type {
  RXInvestigationCapability,
} from "./capability";

export interface RXInvestigationOperationContext {
  companyId: RXCompany["id"];
  sectorsSlug?: RXCompany["sectorsSlug"];
  ticker?: RXCompany["symbol"];
  commodity: RXCommodity;
  period: RXTimePeriod;
}

/**
 * Minimal context required by operation binding itself.
 *
 * Company identity is optional because shared peer context
 * does not represent one company.
 *
 * When companyId is supplied by broader investigation
 * context, the binder deliberately ignores it. It must
 * never substitute companyId for sectorsSlug or ticker.
 */
export type RXInvestigationOperationBindingContext =
  Pick<
    RXInvestigationOperationContext,
    | "sectorsSlug"
    | "ticker"
    | "commodity"
    | "period"
  > &
  Partial<
    Pick<
      RXInvestigationOperationContext,
      "companyId"
    >
  >;

export type RXBindOperationRequestIssue =
  | "SECTORS_SLUG_REQUIRED"
  | "TICKER_REQUIRED";

export type RXBindOperationRequestResult =
  | {
      status: "BOUND";
      request: RXSectorsTypedOperationRequest;
      issues: [];
    }
  | {
      status: "REJECTED";
      request: null;
      issues: RXBindOperationRequestIssue[];
    };

export function bindInvestigationOperationRequest(
  capability:
    RXInvestigationCapability,
  purpose:
    string,
  context:
    RXInvestigationOperationBindingContext
): RXBindOperationRequestResult {
  const operation =
    resolveSectorsOperation(
      capability
    );

  switch (operation) {
    case "GET_MINING_OPERATIONAL_CONTEXT":
      if (
        !context.sectorsSlug ||
        !context.sectorsSlug.trim()
      ) {
        return {
          status: "REJECTED",
          request: null,
          issues: [
            "SECTORS_SLUG_REQUIRED",
          ],
        };
      }

      return {
        status: "BOUND",
        request: {
          operation,
          purpose,
          params: {
            sectorsSlug:
              context.sectorsSlug,
          },
        },
        issues: [],
      };

    case "GET_MINING_HISTORICAL_PERFORMANCE":
      if (
        !context.sectorsSlug ||
        !context.sectorsSlug.trim()
      ) {
        return {
          status: "REJECTED",
          request: null,
          issues: [
            "SECTORS_SLUG_REQUIRED",
          ],
        };
      }

      return {
        status: "BOUND",
        request: {
          operation,
          purpose,
          params: {
            sectorsSlug:
              context.sectorsSlug,

            period:
              context.period,
          },
        },
        issues: [],
      };

    case "GET_COMMODITY_PRICE_HISTORY":
      return {
        status: "BOUND",
        request: {
          operation,
          purpose,
          params: {
            commodity:
              context.commodity,

            period:
              context.period,
          },
        },
        issues: [],
      };

    case "GET_COMPANY_MARKET_TRANSACTION_HISTORY":
      if (
        !context.ticker ||
        !context.ticker.trim()
      ) {
        return {
          status: "REJECTED",
          request: null,
          issues: [
            "TICKER_REQUIRED",
          ],
        };
      }

      return {
        status: "BOUND",
        request: {
          operation,
          purpose,
          params: {
            ticker:
              context.ticker,

            period:
              context.period,
          },
        },
        issues: [],
      };
  }
}