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
 * Sectors mining company endpoints use the
 * Sectors company slug, not RX's internal company ID.
 */
export interface RXMiningOperationalContextParams {
  sectorsSlug: NonNullable<RXCompany["sectorsSlug"]>;
}

/**
 * Historical mining performance is period-scoped
 * and uses the Sectors company slug.
 */
export interface RXMiningHistoricalPerformanceParams {
  sectorsSlug: NonNullable<RXCompany["sectorsSlug"]>;
  period: RXTimePeriod;
}

export interface RXCommodityOperationParams {
  commodity: RXCommodity;
  period: RXTimePeriod;
}

export interface RXMarketTransactionOperationParams {
  /**
   * Sectors daily transaction endpoint uses
   * an IDX ticker, not RX's internal company ID.
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