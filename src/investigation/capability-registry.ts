import type {
  RXCapabilityDefinition,
  RXInvestigationCapability,
} from "./capability";

const definitions:
  RXCapabilityDefinition[] = [
  {
    capability:
      "MINING_OPERATIONAL_CONTEXT",

    source: "SECTORS",

    requirementKind:
      "COMPANY_OPERATIONAL",

    description:
      "Collect mining operational evidence relevant to an investigation case.",

    executionBoundary:
      "SECTORS_ADAPTER",

    enabled: true,
  },

  {
    capability:
      "MINING_HISTORICAL_PERFORMANCE",

    source: "SECTORS",

    requirementKind:
      "HISTORICAL_PERFORMANCE",

    description:
      "Collect comparable historical mining production and sales evidence.",

    executionBoundary:
      "SECTORS_ADAPTER",

    enabled: true,
  },

  {
    capability:
      "COMMODITY_PRICE_HISTORY",

    source: "SECTORS",

    requirementKind:
      "COMMODITY_PRICE",

    description:
      "Collect commodity price history for contextual investigation.",

    executionBoundary:
      "SECTORS_ADAPTER",

    enabled: true,
  },

  {
    capability:
      "COMPANY_MARKET_TRANSACTION_HISTORY",

    source: "SECTORS",

    requirementKind:
      "MARKET_TRANSACTION",

    description:
      "Collect company market transaction history for contextual investigation.",

    executionBoundary:
      "SECTORS_ADAPTER",

    enabled: true,
  },
];

export const RX_CAPABILITY_REGISTRY:
  readonly RXCapabilityDefinition[] =
    Object.freeze(
      definitions.map(
        (definition) =>
          Object.freeze({
            ...definition,
          })
      )
    );

export function getCapabilityDefinition(
  capability:
    RXInvestigationCapability
):
  RXCapabilityDefinition | undefined {
  return RX_CAPABILITY_REGISTRY.find(
    (definition) =>
      definition.capability ===
      capability
  );
}

export function isCapabilityEnabled(
  capability:
    RXInvestigationCapability
): boolean {
  return (
    getCapabilityDefinition(
      capability
    )?.enabled === true
  );
}