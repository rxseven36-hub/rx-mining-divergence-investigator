export const RX_FINANCIAL_REPORT_MCP_TOOL =
  "fetch-company-report" as const;

export const RX_FINANCIAL_REPORT_SECTIONS =
  [
    "financials",
    "valuation",
  ] as const;

export interface RXFinancialReportMcpRequest {
  tool:
    typeof RX_FINANCIAL_REPORT_MCP_TOOL;

  arguments: {
    symbol: string;

    sections:
      typeof RX_FINANCIAL_REPORT_SECTIONS;
  };
}

export type RXFinancialReportMcpBindingIssue =
  | "SYMBOL_REQUIRED";

export type RXFinancialReportMcpBindingResult =
  | {
      status: "BOUND";

      request:
        RXFinancialReportMcpRequest;

      issues: [];
    }
  | {
      status: "REJECTED";

      request: null;

      issues:
        RXFinancialReportMcpBindingIssue[];
    };

/**
 * Bind the verified Sectors MCP financial-report
 * capability without executing the MCP request.
 *
 * Verified live contract:
 * - tool: fetch-company-report
 * - symbol: canonical IDX symbol
 * - sections: financials + valuation
 *
 * No endpoint, API key, network call, or inference
 * exists in this binding layer.
 */
export function bindFinancialReportMcpRequest(
  symbol:
    string
): RXFinancialReportMcpBindingResult {
  const normalizedSymbol =
    symbol
      .trim()
      .toUpperCase();

  if (!normalizedSymbol) {
    return {
      status:
        "REJECTED",

      request:
        null,

      issues: [
        "SYMBOL_REQUIRED",
      ],
    };
  }

  return {
    status:
      "BOUND",

    request: {
      tool:
        RX_FINANCIAL_REPORT_MCP_TOOL,

      arguments: {
        symbol:
          normalizedSymbol,

        sections:
          RX_FINANCIAL_REPORT_SECTIONS,
      },
    },

    issues: [],
  };
}