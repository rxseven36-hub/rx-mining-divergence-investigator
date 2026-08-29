import type {
  RXInvestigationCapability,
} from "../../investigation/capability";

export type RXSectorsOperation =
  | "GET_MINING_OPERATIONAL_CONTEXT"
  | "GET_MINING_HISTORICAL_PERFORMANCE"
  | "GET_COMMODITY_PRICE_HISTORY"
  | "GET_COMPANY_MARKET_TRANSACTION_HISTORY";

const operationByCapability:
  Record<
    RXInvestigationCapability,
    RXSectorsOperation
  > = {
    MINING_OPERATIONAL_CONTEXT:
      "GET_MINING_OPERATIONAL_CONTEXT",

    MINING_HISTORICAL_PERFORMANCE:
      "GET_MINING_HISTORICAL_PERFORMANCE",

    COMMODITY_PRICE_HISTORY:
      "GET_COMMODITY_PRICE_HISTORY",

    COMPANY_MARKET_TRANSACTION_HISTORY:
      "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
  };

/**
 * Maps logical RX investigation capability
 * to an internal typed Sectors operation.
 *
 * No URL or HTTP detail crosses into the
 * investigation layer.
 */
export function resolveSectorsOperation(
  capability:
    RXInvestigationCapability
): RXSectorsOperation {
  return operationByCapability[
    capability
  ];
}