import type {
  RXCommodity,
} from "../../types/commodity";

import type {
  RXCompany,
} from "../../types/company";

import type {
  RXTimePeriod,
} from "../../types/time";

export interface RXMiningCompanyOperationParams {
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
    RXMiningCompanyOperationParams;

  GET_MINING_HISTORICAL_PERFORMANCE:
    RXMiningCompanyOperationParams;

  GET_COMMODITY_PRICE_HISTORY:
    RXCommodityOperationParams;

  GET_COMPANY_MARKET_TRANSACTION_HISTORY:
    RXMarketTransactionOperationParams;
}

export type RXSectorsOperationParams<
  TOperation extends keyof RXSectorsOperationParamsMap,
> = RXSectorsOperationParamsMap[TOperation];