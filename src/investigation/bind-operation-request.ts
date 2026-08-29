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
  commodity: RXCommodity;
  period: RXTimePeriod;
}

export function bindInvestigationOperationRequest(
  capability: RXInvestigationCapability,
  purpose: string,
  context: RXInvestigationOperationContext
): RXSectorsTypedOperationRequest {
  const operation =
    resolveSectorsOperation(capability);

  switch (operation) {
    case "GET_MINING_OPERATIONAL_CONTEXT":
      return {
        operation,
        purpose,
        params: {
          companyId: context.companyId,
          period: context.period,
        },
      };

    case "GET_MINING_HISTORICAL_PERFORMANCE":
      return {
        operation,
        purpose,
        params: {
          companyId: context.companyId,
          period: context.period,
        },
      };

    case "GET_COMMODITY_PRICE_HISTORY":
      return {
        operation,
        purpose,
        params: {
          commodity: context.commodity,
          period: context.period,
        },
      };

    case "GET_COMPANY_MARKET_TRANSACTION_HISTORY":
      return {
        operation,
        purpose,
        params: {
          companyId: context.companyId,
          period: context.period,
        },
      };
  }
}