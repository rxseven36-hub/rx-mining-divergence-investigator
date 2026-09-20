export type RXInvestigationCapability =
  | "MINING_OPERATIONAL_CONTEXT"
  | "MINING_HISTORICAL_PERFORMANCE"
  | "COMMODITY_PRICE_HISTORY"
  | "COMPANY_MARKET_TRANSACTION_HISTORY"
  | "COMPANY_FINANCIAL_REPORT";

export type RXCapabilityRequirementKind =
  | "COMPANY_OPERATIONAL"
  | "HISTORICAL_PERFORMANCE"
  | "COMMODITY_PRICE"
  | "MARKET_TRANSACTION"
  | "FINANCIAL_REPORT";

export type RXCapabilityExecutionBoundary =
  | "SECTORS_ADAPTER"
  | "SECTORS_MCP_ADAPTER";

export interface RXCapabilityDefinition {
  capability: RXInvestigationCapability;

  source: "SECTORS";

  requirementKind:
    RXCapabilityRequirementKind;

  description: string;

  /**
   * Registry describes logical RX capabilities.
   * It does not expose raw URLs to the investigation layer.
   *
   * REST-backed Sectors capabilities use SECTORS_ADAPTER.
   * MCP-backed Sectors capabilities use SECTORS_MCP_ADAPTER.
   */
  executionBoundary:
    RXCapabilityExecutionBoundary;

  enabled: boolean;
}