export type RXInvestigationCapability =
  | "MINING_OPERATIONAL_CONTEXT"
  | "MINING_HISTORICAL_PERFORMANCE"
  | "COMMODITY_PRICE_HISTORY"
  | "COMPANY_MARKET_TRANSACTION_HISTORY";

export type RXCapabilityRequirementKind =
  | "COMPANY_OPERATIONAL"
  | "HISTORICAL_PERFORMANCE"
  | "COMMODITY_PRICE"
  | "MARKET_TRANSACTION";

export interface RXCapabilityDefinition {
  capability: RXInvestigationCapability;

  source: "SECTORS";

  requirementKind:
    RXCapabilityRequirementKind;

  description: string;

  /**
   * Registry describes logical RX capabilities.
   * It does not expose raw URLs to the investigation layer.
   */
  executionBoundary:
    "SECTORS_ADAPTER";

  enabled: boolean;
}