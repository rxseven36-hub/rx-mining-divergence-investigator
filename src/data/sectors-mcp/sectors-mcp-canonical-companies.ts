import type {
  RXSectorsMcpCanonicalCompany,
} from "./sectors-mcp-company-enrichment";

const MCP_CANONICAL_COMPANIES: Record<
  string,
  RXSectorsMcpCanonicalCompany
> = {
  "ADMR.JK": {
    name: "PT Adaro Minerals Indonesia Tbk",
    slug: "pt-adaro-minerals-indonesia-tbk",
    symbol: "ADMR.JK",
  },

  "BUMI.JK": {
    name: "PT Bumi Resources Tbk",
    slug: "pt-bumi-resources-tbk",
    symbol: "BUMI.JK",
  },

  "BYAN.JK": {
    name: "PT Bayan Resources Tbk",
    slug: "pt-bayan-resources-tbk",
    symbol: "BYAN.JK",
  },

  "GEMS.JK": {
    name: "PT Golden Energy Mines Tbk",
    slug: "pt-golden-energy-mines-tbk",
    symbol: "GEMS.JK",
  },

  "ITMG.JK": {
    name: "PT Indo Tambangraya Megah Tbk",
    slug: "pt-indo-tambangraya-megah-tbk",
    symbol: "ITMG.JK",
  },
};

export function resolveSectorsMcpCanonicalCompany(
  ticker: string,
  sectorsSlug: string,
): RXSectorsMcpCanonicalCompany | null {
  const normalizedTicker =
    ticker.trim().toUpperCase();

  const company =
    MCP_CANONICAL_COMPANIES[
      normalizedTicker
    ];

  if (!company) {
    return null;
  }

  if (
    company.slug !==
    sectorsSlug.trim().toLowerCase()
  ) {
    return null;
  }

  return company;
}