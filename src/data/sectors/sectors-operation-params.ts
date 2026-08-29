import type {
  RXCommodity,
} from "../../types/commodity";

import type {
  RXCompany,
} from "../../types/company";

import type {
  RXTimePeriod,
} from "../../types/time";

/**
 * Current mining company operational context is
 * company-scoped rather than period-scoped.
 *
 * Do not add a synthetic period merely to satisfy
 * another endpoint's temporal contract.
 */
export interface RXMiningOperationalContextParams {
  companyId: RXCompany["id"];
}

/**
 * Historical mining performance is explicitly
 * period-scoped.
 */
export interface RXMiningHistoricalPerformanceParams {
  companyId: RXCompany["id"];
  period: RXTimePeriod;
}

export interface RXCommodityOperationParams {
  commodity: RXCommodity;
  period: RXTimePeriod;
}

export interface RXMarketTransactionOperationParams {
  /**
   * Sectors daily transaction endpoint uses
   * an IDX ticker, not the mining company ID.
   */
  ticker: NonNullable<RXCompany["symbol"]>;
  period: RXTimePeriod;
}

export interface RXSectorsOperationParamsMap {
  GET_MINING_OPERATIONAL_CONTEXT:
    RXMiningOperationalContextParams;

  GET_MINING_HISTORICAL_PERFORMANCE:
    RXMiningHistoricalPerformanceParams;

  GET_COMMODITY_PRICE_HISTORY:
    RXCommodityOperationParams;

  GET_COMPANY_MARKET_TRANSACTION_HISTORY:
    RXMarketTransactionOperationParams;
}

export type RXSectorsOperationParams<
  TOperation extends keyof RXSectorsOperationParamsMap,
> = RXSectorsOperationParamsMap[TOperation];