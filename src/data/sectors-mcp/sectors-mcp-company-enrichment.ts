import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

export interface RXSectorsMcpCanonicalCompany {
  name: string;
  slug: string;
  symbol: string;
}

export interface RXSectorsMcpToolCaller {
  callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown>;
}

interface RXCanonicalCandidate {
  name: string;
  slug: string;
  symbol: string;
  raw: Record<string, unknown>;
}

export type RXSectorsMcpCompanyEnrichmentResult =
  | {
      status: "OK";
      provider: "sectors-mcp";
      entity: RXSectorsMcpCanonicalCompany & {
        resolved: true;
      };
      toolsUsed: string[];
      enrichment: {
        miningCompanyDetail: unknown;
        companyReport: unknown;
      };
    }
  | {
      status: "UNRESOLVED";
      provider: "sectors-mcp";
      entity: RXSectorsMcpCanonicalCompany & {
        resolved: false;
      };
      toolsUsed: string[];
      enrichment: null;
      issue: string;
    }
  | {
      status: "DEGRADED";
      provider: "sectors-mcp";
      entity: RXSectorsMcpCanonicalCompany & {
        resolved: boolean;
      };
      toolsUsed: string[];
      enrichment: null;
      issue: string;
    };

function normalizeName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeSymbol(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/\.JK$/, "");
}

function asRecord(
  value: unknown,
): Record<string, unknown> | null {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return null;
}

function stringField(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value.trim();
    }
  }

  return null;
}

function parseMaybeJson(
  value: string,
): unknown {
  const trimmed = value.trim();

  if (
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function materializeToolResult(
  value: unknown,
): unknown {
  const record = asRecord(value);

  if (!record) {
    return value;
  }

  if (record.structuredContent !== undefined) {
    return record.structuredContent;
  }

  if (Array.isArray(record.content)) {
    const items = record.content.map((item) => {
      const content = asRecord(item);

      if (
        content?.type === "text" &&
        typeof content.text === "string"
      ) {
        return parseMaybeJson(content.text);
      }

      return item;
    });

    return items.length === 1
      ? items[0]
      : items;
  }

  return value;
}

function collectRecords(
  value: unknown,
  output: Record<string, unknown>[],
  depth = 0,
): void {
  if (depth > 10) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectRecords(
        item,
        output,
        depth + 1,
      );
    }

    return;
  }

  const record = asRecord(value);

  if (!record) {
    return;
  }

  output.push(record);

  for (const nested of Object.values(record)) {
    collectRecords(
      nested,
      output,
      depth + 1,
    );
  }
}

function candidateFromRecord(
  record: Record<string, unknown>,
): RXCanonicalCandidate | null {
  const name =
    stringField(record, [
      "name",
      "company_name",
      "companyName",
    ]);

  const slug =
    stringField(record, [
      "slug",
      "company_slug",
      "companySlug",
    ]);

  const symbol =
    stringField(record, [
      "symbol",
      "ticker",
      "idx_symbol",
      "idxSymbol",
    ]);

  if (!name || !slug || !symbol) {
    return null;
  }

  return {
    name,
    slug,
    symbol,
    raw: record,
  };
}

function canonicalMatch(
  candidate: RXCanonicalCandidate,
  expected: RXSectorsMcpCanonicalCompany,
): boolean {
  return (
    normalizeName(candidate.name) ===
      normalizeName(expected.name) &&
    normalizeSlug(candidate.slug) ===
      normalizeSlug(expected.slug) &&
    normalizeSymbol(candidate.symbol) ===
      normalizeSymbol(expected.symbol)
  );
}

function findCanonicalCandidate(
  payload: unknown,
  expected: RXSectorsMcpCanonicalCompany,
): RXCanonicalCandidate | null {
  const records: Record<string, unknown>[] = [];

  collectRecords(
    materializeToolResult(payload),
    records,
  );

  for (const record of records) {
    const candidate =
      candidateFromRecord(record);

    if (
      candidate &&
      canonicalMatch(candidate, expected)
    ) {
      return candidate;
    }
  }

  return null;
}

function detailHasCanonicalConflict(
  payload: unknown,
  expected: RXSectorsMcpCanonicalCompany,
): boolean {
  const records: Record<string, unknown>[] = [];

  collectRecords(
    materializeToolResult(payload),
    records,
  );

  for (const record of records) {
    const slug =
      stringField(record, [
        "slug",
        "company_slug",
        "companySlug",
      ]);

    const symbol =
      stringField(record, [
        "symbol",
        "ticker",
        "idx_symbol",
        "idxSymbol",
      ]);

    const name =
      stringField(record, [
        "name",
        "company_name",
        "companyName",
      ]);

    const looksLikeCompany =
      slug !== null ||
      symbol !== null;

    if (!looksLikeCompany) {
      continue;
    }

    if (
      slug !== null &&
      normalizeSlug(slug) !==
        normalizeSlug(expected.slug)
    ) {
      return true;
    }

    if (
      symbol !== null &&
      normalizeSymbol(symbol) !==
        normalizeSymbol(expected.symbol)
    ) {
      return true;
    }

    if (
      name !== null &&
      slug !== null &&
      normalizeName(name) !==
        normalizeName(expected.name)
    ) {
      return true;
    }
  }

  return false;
}

export async function enrichSectorsMcpCompanyWithCaller(
  caller: RXSectorsMcpToolCaller,
  company: RXSectorsMcpCanonicalCompany,
): Promise<RXSectorsMcpCompanyEnrichmentResult> {
  const toolsUsed: string[] = [];

  let searchResult: unknown;

  try {
    toolsUsed.push(
      "fetch-mining-companies",
    );

    searchResult =
      await caller.callTool(
        "fetch-mining-companies",
        {
          keyword:
            normalizeSymbol(company.symbol),
          limit: 20,
        },
      );
  } catch (error) {
    return {
      status: "DEGRADED",
      provider: "sectors-mcp",
      entity: {
        ...company,
        resolved: false,
      },
      toolsUsed,
      enrichment: null,
      issue:
        error instanceof Error
          ? error.message
          : "MCP_ENTITY_RESOLUTION_FAILURE",
    };
  }

  const canonical =
    findCanonicalCandidate(
      searchResult,
      company,
    );

  if (!canonical) {
    return {
      status: "UNRESOLVED",
      provider: "sectors-mcp",
      entity: {
        ...company,
        resolved: false,
      },
      toolsUsed,
      enrichment: null,
      issue:
        "CANONICAL_ENTITY_NOT_CONFIRMED",
    };
  }

  try {
    toolsUsed.push(
      "fetch-mining-company-detail",
    );

    const detailRaw =
      await caller.callTool(
        "fetch-mining-company-detail",
        {
          slug: company.slug,
        },
      );

    const detail =
      materializeToolResult(
        detailRaw,
      );

    if (
      detailHasCanonicalConflict(
        detail,
        company,
      )
    ) {
      return {
        status: "UNRESOLVED",
        provider: "sectors-mcp",
        entity: {
          ...company,
          resolved: false,
        },
        toolsUsed,
        enrichment: null,
        issue:
          "MCP_DETAIL_CANONICAL_CONFLICT",
      };
    }

    toolsUsed.push(
      "fetch-company-report",
    );

    const reportRaw =
      await caller.callTool(
        "fetch-company-report",
        {
          symbol:
            normalizeSymbol(
              company.symbol,
            ),
          sections: [
            "overview",
            "financials",
            "ownership",
            "valuation",
          ],
        },
      );

    const companyReport =
      materializeToolResult(
        reportRaw,
      );

    return {
      status: "OK",
      provider: "sectors-mcp",
      entity: {
        ...company,
        resolved: true,
      },
      toolsUsed,
      enrichment: {
        miningCompanyDetail:
          detail,
        companyReport,
      },
    };
  } catch (error) {
    return {
      status: "DEGRADED",
      provider: "sectors-mcp",
      entity: {
        ...company,
        resolved: true,
      },
      toolsUsed,
      enrichment: null,
      issue:
        error instanceof Error
          ? error.message
          : "MCP_ENRICHMENT_FAILURE",
    };
  }
}

export async function runSectorsMcpCompanyEnrichment(
  input: {
    apiKey: string;
    company:
      RXSectorsMcpCanonicalCompany;
    endpoint?: string;
  },
): Promise<RXSectorsMcpCompanyEnrichmentResult> {
  const apiKey =
    input.apiKey.trim();

  if (apiKey.length === 0) {
    throw new Error(
      "SECTORS_API_KEY is required",
    );
  }

  const client =
    new Client(
      {
        name:
          "rx-mdi-sectors-mcp",
        version:
          "0.1.0",
      },
      {
        versionNegotiation: {
          mode: "auto",
        },
      },
    );

  const transport =
    new StreamableHTTPClientTransport(
      new URL(
        input.endpoint ??
          "https://sectors-mcp.supertype.ai/mcp",
      ),
      {
        requestInit: {
          headers: {
            Authorization:
              `Bearer ${apiKey}`,
          },
        },
      },
    );

  try {
    await client.connect(
      transport,
    );

    return await enrichSectorsMcpCompanyWithCaller(
      {
        async callTool(
          name,
          args,
        ) {
          return client.callTool({
            name,
            arguments: args,
          });
        },
      },
      input.company,
    );
  } finally {
    try {
      await transport
        .terminateSession();
    } catch {
      // Session termination is best-effort.
    }

    await client.close();
  }
}
