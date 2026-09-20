export const RX_INVESTIGATION_PATHS = [
  "production-sales",
  "site-license",
  "ob-strip",
  "resources-reserves",
  "market",
  "commodity-context",
  "product-quality",
] as const;

export type RXInvestigationPath =
  (typeof RX_INVESTIGATION_PATHS)[number];

export interface RXInvestigationPathDefinition {
  path:
    RXInvestigationPath;

  label:
    string;

  description:
    string;

  primaryCapability:
    | "MINING_HISTORICAL_PERFORMANCE"
    | "MINING_OPERATIONAL_CONTEXT"
    | "COMPANY_MARKET_TRANSACTION_HISTORY"
    | "COMMODITY_PRICE_HISTORY";
}

const definitions:
  Record<
    RXInvestigationPath,
    RXInvestigationPathDefinition
  > = {
  "production-sales": {
    path:
      "production-sales",

    label:
      "Production / Sales",

    description:
      "Investigate an observed production-sales divergence using admitted historical and contextual evidence.",

    primaryCapability:
      "MINING_HISTORICAL_PERFORMANCE",
  },

  "site-license": {
    path:
      "site-license",

    label:
      "Site / License",

    description:
      "Investigate reported mining-site, license, and contract context using admitted operational evidence.",

    primaryCapability:
      "MINING_OPERATIONAL_CONTEXT",
  },

  "ob-strip": {
    path:
      "ob-strip",

    label:
      "OB / Strip Ratio",

    description:
      "Investigate admitted overburden-removal and strip-ratio observations without inferring causality.",

    primaryCapability:
      "MINING_HISTORICAL_PERFORMANCE",
  },

  "resources-reserves": {
    path:
      "resources-reserves",

    label:
      "Resources / Reserves",

    description:
      "Investigate admitted geological resources and reserves while preserving their independent measurement-year semantics.",

    primaryCapability:
      "MINING_HISTORICAL_PERFORMANCE",
  },

  "market": {
    path:
      "market",

    label:
      "Market",

    description:
      "Investigate admitted daily closing-price, trading-volume, and market-capitalization observations without inferring causality.",

    primaryCapability:
      "COMPANY_MARKET_TRANSACTION_HISTORY",
  },

  "commodity-context": {
    path:
      "commodity-context",

    label:
      "Commodity Context",

    description:
      "Investigate admitted commodity-price movement as standalone market context without manufacturing a relationship to any company.",

    primaryCapability:
      "COMMODITY_PRICE_HISTORY",
  },

  "product-quality": {
    path:
      "product-quality",

    label:
      "Product Quality",

    description:
      "Investigate admitted mining product-quality observations while preserving product identity, source ranges, and ARB/ADB basis.",

    primaryCapability:
      "MINING_HISTORICAL_PERFORMANCE",
  },
};

export function isInvestigationPath(
  value:
    unknown,
): value is RXInvestigationPath {
  return (
    typeof value === "string" &&
    (
      RX_INVESTIGATION_PATHS as
        readonly string[]
    ).includes(value)
  );
}

export function getInvestigationPathDefinition(
  path:
    RXInvestigationPath,
): RXInvestigationPathDefinition {
  return definitions[path];
}