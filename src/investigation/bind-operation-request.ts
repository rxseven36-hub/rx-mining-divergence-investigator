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
  ticker?: RXCompany["symbol"];
  commodity: RXCommodity;
  period: RXTimePeriod;
}

export type RXBindOperationRequestIssue =
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
  capability: RXInvestigationCapability,
  purpose: string,
  context: RXInvestigationOperationContext
): RXBindOperationRequestResult {
  const operation =
    resolveSectorsOperation(capability);

  switch (operation) {
    case "GET_MINING_OPERATIONAL_CONTEXT":
      return {
        status: "BOUND",
        request: {
          operation,
          purpose,
          params: {
            companyId: context.companyId,
            period: context.period,
          },
        },
        issues: [],
      };

    case "GET_MINING_HISTORICAL_PERFORMANCE":
      return {
        status: "BOUND",
        request: {
          operation,
          purpose,
          params: {
            companyId: context.companyId,
            period: context.period,
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
            commodity: context.commodity,
            period: context.period,
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
          issues: ["TICKER_REQUIRED"],
        };
      }

      return {
        status: "BOUND",
        request: {
          operation,
          purpose,
          params: {
            ticker: context.ticker,
            period: context.period,
          },
        },
        issues: [],
      };
  }
}