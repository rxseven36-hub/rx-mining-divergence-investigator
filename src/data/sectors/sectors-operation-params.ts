import type {
  RXCommodity,
} from "../../types/commodity";

import type {
  RXCompany,
} from "../../types/company";

import type {
  RXTimePeriod,
} from "../../types/time";

export interface RXCompanyOperationParams {
  companyId: RXCompany["id"];
  period: RXTimePeriod;
}

export interface RXCommodityOperationParams {
  commodity: RXCommodity;
  period: RXTimePeriod;
}

export interface RXSectorsOperationParamsMap {
  GET_MINING_OPERATIONAL_CONTEXT:
    RXCompanyOperationParams;

  GET_MINING_HISTORICAL_PERFORMANCE:
    RXCompanyOperationParams;

  GET_COMMODITY_PRICE_HISTORY:
    RXCommodityOperationParams;

  GET_COMPANY_MARKET_TRANSACTION_HISTORY:
    RXCompanyOperationParams;
}

export type RXSectorsOperationParams<
  TOperation extends keyof RXSectorsOperationParamsMap,
> = RXSectorsOperationParamsMap[TOperation];