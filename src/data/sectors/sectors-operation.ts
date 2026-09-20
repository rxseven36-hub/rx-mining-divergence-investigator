import type {
  RXInvestigationCapability,
} from "../../investigation/capability";

export type RXSectorsOperation =
  | "GET_MINING_OPERATIONAL_CONTEXT"
  | "GET_MINING_HISTORICAL_PERFORMANCE"
  | "GET_COMMODITY_PRICE_HISTORY"
  | "GET_COMPANY_MARKET_TRANSACTION_HISTORY";

export type RXSectorsRestCapability =
  Exclude<
    RXInvestigationCapability,
    "COMPANY_FINANCIAL_REPORT"
  >;

const operationByCapability:
  Record<
    RXSectorsRestCapability,
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
 * Maps REST-backed logical RX investigation
 * capabilities to internal typed Sectors operations.
 *
 * MCP-backed capabilities are intentionally excluded.
 * No URL or HTTP detail crosses into the
 * investigation layer.
 */
export function resolveSectorsOperation(
  capability:
    RXSectorsRestCapability
): RXSectorsOperation {
  return operationByCapability[
    capability
  ];
}