import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getCapabilityDefinition,
} from "../investigation/capability-registry";

import {
  resolveSectorsOperation,
} from "../data/sectors/sectors-operation";

import {
  bindFinancialReportMcpRequest,
  RX_FINANCIAL_REPORT_MCP_TOOL,
  RX_FINANCIAL_REPORT_SECTIONS,
} from "../data/sectors-mcp/financial-report-request";

describe(
  "financial capability boundary",
  () => {
    it(
      "registers financial report as an enabled MCP-backed capability",
      () => {
        const definition =
          getCapabilityDefinition(
            "COMPANY_FINANCIAL_REPORT"
          );

        expect(
          definition
        ).toEqual({
          capability:
            "COMPANY_FINANCIAL_REPORT",

          source:
            "SECTORS",

          requirementKind:
            "FINANCIAL_REPORT",

          description:
            "Collect provider-supplied company financial statements, financial ratios, and valuation evidence.",

          executionBoundary:
            "SECTORS_MCP_ADAPTER",

          enabled:
            true,
        });
      }
    );

    it(
      "preserves every existing REST capability mapping",
      () => {
        expect(
          resolveSectorsOperation(
            "MINING_OPERATIONAL_CONTEXT"
          )
        ).toBe(
          "GET_MINING_OPERATIONAL_CONTEXT"
        );

        expect(
          resolveSectorsOperation(
            "MINING_HISTORICAL_PERFORMANCE"
          )
        ).toBe(
          "GET_MINING_HISTORICAL_PERFORMANCE"
        );

        expect(
          resolveSectorsOperation(
            "COMMODITY_PRICE_HISTORY"
          )
        ).toBe(
          "GET_COMMODITY_PRICE_HISTORY"
        );

        expect(
          resolveSectorsOperation(
            "COMPANY_MARKET_TRANSACTION_HISTORY"
          )
        ).toBe(
          "GET_COMPANY_MARKET_TRANSACTION_HISTORY"
        );
      }
    );

    it(
      "binds the verified financial MCP tool contract deterministically",
      () => {
        const result =
          bindFinancialReportMcpRequest(
            " bumi "
          );

        expect(
          result.status
        ).toBe(
          "BOUND"
        );

        if (
          result.status !==
          "BOUND"
        ) {
          throw new Error(
            "Expected financial MCP request to bind."
          );
        }

        expect(
          result.request
        ).toEqual({
          tool:
            "fetch-company-report",

          arguments: {
            symbol:
              "BUMI",

            sections: [
              "financials",
              "valuation",
            ],
          },
        });

        expect(
          result.request.tool
        ).toBe(
          RX_FINANCIAL_REPORT_MCP_TOOL
        );

        expect(
          result.request.arguments.sections
        ).toEqual(
          RX_FINANCIAL_REPORT_SECTIONS
        );
      }
    );

    it(
      "rejects an empty financial symbol before execution",
      () => {
        expect(
          bindFinancialReportMcpRequest(
            "   "
          )
        ).toEqual({
          status:
            "REJECTED",

          request:
            null,

          issues: [
            "SYMBOL_REQUIRED",
          ],
        });
      }
    );
  }
);