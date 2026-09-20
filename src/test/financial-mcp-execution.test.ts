import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  RXSectorsMcpToolCaller,
} from "../data/sectors-mcp/sectors-mcp-company-enrichment";

import {
  executeFinancialReportMcp,
} from "../investigation/execute-financial-report-mcp";

function financialPayload() {
  return {
    symbol:
      "BUMI.JK",

    company_name:
      "Bumi Resources Tbk",

    financials: {
      historical_financials: [
        {
          year:
            2023,

          revenue:
            100,

          earnings:
            10,
        },

        {
          year:
            2024,

          revenue:
            120,

          earnings:
            15,
        },
      ],

      historical_financial_ratio: [
        {
          year:
            "2023",

          leverage: {
            debt_to_equity_ratio:
              0.5,
          },

          profitability: {
            roe:
              0.01,
          },
        },

        {
          year:
            "2024",

          leverage: {
            debt_to_equity_ratio:
              0.45,
          },

          profitability: {
            roe:
              0.02,
          },
        },
      ],
    },

    valuation: {
      historical_valuation: [
        {
          year:
            2023,

          pe:
            20,

          pb:
            0.7,
        },

        {
          year:
            2024,

          pe:
            40,

          pb:
            0.9,

          enterprise_to_ebitda:
            9.6,
        },
      ],
    },
  };
}

function fakeCaller(
  implementation:
    (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<unknown>,
): {
  caller:
    RXSectorsMcpToolCaller;

  callToolSpy:
    ReturnType<typeof vi.fn>;
} {
  const callToolSpy =
    vi.fn(
      implementation,
    );

  const caller:
    RXSectorsMcpToolCaller = {
    async callTool(
      name,
      args,
    ) {
      return callToolSpy(
        name,
        args,
      );
    },
  };

  return {
    caller,
    callToolSpy,
  };
}

describe(
  "financial MCP execution boundary",
  () => {
    it(
      "executes only the verified financial MCP request and analyzes admitted evidence",
      async () => {
        const {
          caller,
          callToolSpy,
        } = fakeCaller(
          async () => ({
            structuredContent:
              financialPayload(),
          }),
        );

        const result =
          await executeFinancialReportMcp(
            caller,
            {
              companyId:
                "rx-company-bumi",

              symbol:
                " bumi ",

              sourceReference:
                "sectors-mcp:fetch-company-report:BUMI",

              retrievedAt:
                "2026-09-18T00:00:00.000Z",
            },
          );

        expect(
          callToolSpy,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          callToolSpy,
        ).toHaveBeenCalledWith(
          "fetch-company-report",
          {
            symbol:
              "BUMI",

            sections: [
              "financials",
              "valuation",
            ],
          },
        );

        expect(
          result.status,
        ).toBe(
          "ANALYZED",
        );

        if (
          result.status !==
          "ANALYZED"
        ) {
          throw new Error(
            "Expected analyzed financial result.",
          );
        }

        expect(
          result.admission.status,
        ).toBe(
          "ADMITTED",
        );

        expect(
          result.analysis.status,
        ).toBe(
          "ANALYZED",
        );

        expect(
          result.analysis.period,
        ).toEqual({
          startYear:
            2023,

          endYear:
            2024,
        });

        const revenue =
          result.analysis.metrics.find(
            (item) =>
              item.family ===
                "FINANCIAL_STATEMENT" &&
              item.metric ===
                "revenue",
          );

        expect(
          revenue?.firstValue,
        ).toBe(
          100,
        );

        expect(
          revenue?.latestValue,
        ).toBe(
          120,
        );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );

        expect(
          result.analysis
            .causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "materializes text MCP content before admission",
      async () => {
        const {
          caller,
        } = fakeCaller(
          async () => ({
            content: [
              {
                type:
                  "text",

                text:
                  JSON.stringify(
                    financialPayload(),
                  ),
              },
            ],
          }),
        );

        const result =
          await executeFinancialReportMcp(
            caller,
            {
              companyId:
                "rx-company-bumi",

              symbol:
                "BUMI",

              sourceReference:
                "SECTORS_TEST",
            },
          );

        expect(
          result.status,
        ).toBe(
          "ANALYZED",
        );
      },
    );

    it(
      "rejects missing symbol before calling MCP",
      async () => {
        const {
          caller,
          callToolSpy,
        } = fakeCaller(
          async () => {
            throw new Error(
              "must not execute",
            );
          },
        );

        const result =
          await executeFinancialReportMcp(
            caller,
            {
              companyId:
                "rx-company-bumi",

              symbol:
                "   ",

              sourceReference:
                "SECTORS_TEST",
            },
          );

        expect(
          callToolSpy,
        ).not.toHaveBeenCalled();

        expect(
          result.status,
        ).toBe(
          "BINDING_REJECTED",
        );

        expect(
          result.issue,
        ).toBe(
          "SYMBOL_REQUIRED",
        );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "keeps MCP execution failure outside evidence vocabulary",
      async () => {
        const {
          caller,
          callToolSpy,
        } = fakeCaller(
          async () => {
            throw new Error(
              "simulated MCP failure",
            );
          },
        );

        const result =
          await executeFinancialReportMcp(
            caller,
            {
              companyId:
                "rx-company-bumi",

              symbol:
                "BUMI",

              sourceReference:
                "SECTORS_TEST",
            },
          );

        expect(
          callToolSpy,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          result.status,
        ).toBe(
          "EXECUTION_FAILED",
        );

        expect(
          result.issue,
        ).toBe(
          "simulated MCP failure",
        );

        expect(
          result.admission,
        ).toBeNull();

        expect(
          result.analysis,
        ).toBeNull();

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "rejects executed but inadmissible MCP payload without analyzing it",
      async () => {
        const {
          caller,
        } = fakeCaller(
          async () => ({
            structuredContent: {
              symbol:
                "BUMI.JK",

              financials: {
                eps:
                  3.65,
              },

              valuation: {
                intrinsic_value:
                  -156,
              },
            },
          }),
        );

        const result =
          await executeFinancialReportMcp(
            caller,
            {
              companyId:
                "rx-company-bumi",

              symbol:
                "BUMI",

              sourceReference:
                "SECTORS_TEST",
            },
          );

        expect(
          result.status,
        ).toBe(
          "EVIDENCE_REJECTED",
        );

        if (
          result.status !==
          "EVIDENCE_REJECTED"
        ) {
          throw new Error(
            "Expected rejected evidence.",
          );
        }

        expect(
          result.admission.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          result.admission.issues,
        ).toContain(
          "NO_ADMISSIBLE_FINANCIAL_EVIDENCE",
        );

        expect(
          result.analysis,
        ).toBeNull();

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );
  },
);