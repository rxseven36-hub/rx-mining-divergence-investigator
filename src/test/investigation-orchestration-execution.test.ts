import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  executeInvestigationOrchestration,
} from "../investigation/execute-investigation-orchestration";

import {
  executePreparedInvestigation,
} from "../investigation/execute-prepared-investigation";

import {
  executeFinancialReportMcp,
} from "../investigation/execute-financial-report-mcp";

import type {
  RXPreparedInvestigationOrchestration,
} from "../investigation/prepare-investigation-orchestration";

vi.mock(
  "../investigation/execute-prepared-investigation",
  () => ({
    executePreparedInvestigation:
      vi.fn(),
  }),
);

vi.mock(
  "../investigation/execute-financial-report-mcp",
  () => ({
    executeFinancialReportMcp:
      vi.fn(),
  }),
);

const executeRestMock =
  vi.mocked(
    executePreparedInvestigation,
  );

const executeFinancialMock =
  vi.mocked(
    executeFinancialReportMcp,
  );

function preparedOrchestration():
  RXPreparedInvestigationOrchestration {
  return {
    planId:
      "PLAN-BUMI",

    caseId:
      "CASE-BUMI",

    rest: {
      planId:
        "PLAN-BUMI",

      caseId:
        "CASE-BUMI",

      requests:
        [],

      readyCount:
        0,

      rejectedCount:
        0,

      causalConclusion:
        "UNKNOWN",
    },

    mcp: [
      {
        status:
          "READY",

        request: {
          requestId:
            "CASE-BUMI-R5",

          requirementId:
            "CASE-BUMI-E5",

          source:
            "SECTORS",

          capability:
            "COMPANY_FINANCIAL_REPORT",

          purpose:
            "Collect provider-supplied financial context.",

          status:
            "PLANNED",
        },

        requirement: {
          requirementId:
            "CASE-BUMI-E5",

          questionId:
            "CASE-BUMI-Q5",

          kind:
            "FINANCIAL_REPORT",

          description:
            "Provider-supplied financial evidence.",

          required:
            false,
        },

        executionDecision: {
          requestId:
            "CASE-BUMI-R5",

          requirementId:
            "CASE-BUMI-E5",

          capability:
            "COMPANY_FINANCIAL_REPORT",

          status:
            "READY",

          issues:
            [],

          causalConclusion:
            "UNKNOWN",
        },

        mcpRequest: {
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
        },

        bindingIssues:
          [],
      },
    ],

    restRequestCount:
      0,

    mcpRequestCount:
      1,

    rejectedMcpCount:
      0,

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "executeInvestigationOrchestration",
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();

        executeRestMock.mockResolvedValue({
          planId:
            "PLAN-BUMI",

          caseId:
            "CASE-BUMI",

          outcomes:
            [],

          summary: {
            totalCount:
              0,

            evidenceAdmittedCount:
              0,

            evidenceRejectedCount:
              0,

            executionFailedCount:
              0,

            executionRejectedCount:
              0,

            skippedCount:
              0,

            admissionNotSupportedCount:
              0,
          },

          causalConclusion:
            "UNKNOWN",
        });

        executeFinancialMock.mockResolvedValue({
          status:
            "ANALYZED",

          request: {
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
          },

          payload: {
            symbol:
              "BUMI.JK",
          },

          admission: {
            status:
              "ADMITTED",

            observations:
              [],

            admittedObservations:
              [],

            issues:
              [],
          },

          analysis: {
            status:
              "ANALYZED",

            companyId:
              "BUMI",

            period: {
              startYear:
                2020,

              endYear:
                2021,
            },

            metrics:
              [],

            observedRelationship:
              "Provider financial observations admitted for deterministic analysis.",

            causalConclusion:
              "UNKNOWN",
          },

          issue:
            null,

          causalConclusion:
            "UNKNOWN",
        });
      },
    );

    it(
      "executes REST and Financial through separate boundaries",
      async () => {
        const prepared =
          preparedOrchestration();

        const result =
          await executeInvestigationOrchestration(
            undefined as never,
            undefined as never,
            prepared,
            {
              companyId:
                "BUMI",

              symbol:
                "BUMI",

              retrievedAt:
                "2026-09-19T00:00:00.000Z",
            },
          );

        expect(
          executeRestMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          executeFinancialMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          executeFinancialMock,
        ).toHaveBeenCalledWith(
          undefined,
          {
            companyId:
              "BUMI",

            symbol:
              "BUMI",

            sourceReference:
              "sectors-mcp:company-financial-report:BUMI:CASE-BUMI-R5",

            retrievedAt:
              "2026-09-19T00:00:00.000Z",
          },
        );

        expect(
          result.planId,
        ).toBe(
          "PLAN-BUMI",
        );

        expect(
          result.caseId,
        ).toBe(
          "CASE-BUMI",
        );

        expect(
          result.summary
            .financialRequestCount,
        ).toBe(1);

        expect(
          result.summary
            .financialAnalyzedCount,
        ).toBe(1);

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "preserves the REST result when Financial execution fails",
      async () => {
        executeRestMock.mockResolvedValueOnce({
          planId:
            "PLAN-BUMI",

          caseId:
            "CASE-BUMI",

          outcomes:
            [],

          summary: {
            totalCount:
              4,

            evidenceAdmittedCount:
              3,

            evidenceRejectedCount:
              1,

            executionFailedCount:
              0,

            executionRejectedCount:
              0,

            skippedCount:
              0,

            admissionNotSupportedCount:
              0,
          },

          causalConclusion:
            "UNKNOWN",
        });

        executeFinancialMock.mockResolvedValueOnce({
          status:
            "EXECUTION_FAILED",

          request: {
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
          },

          payload:
            null,

          admission:
            null,

          analysis:
            null,

          issue:
            "MCP_TEST_FAILURE",

          causalConclusion:
            "UNKNOWN",
        });

        const result =
          await executeInvestigationOrchestration(
            undefined as never,
            undefined as never,
            preparedOrchestration(),
            {
              companyId:
                "BUMI",

              symbol:
                "BUMI",
            },
          );

        expect(
          result.rest.summary.totalCount,
        ).toBe(4);

        expect(
          result.rest.summary
            .evidenceAdmittedCount,
        ).toBe(3);

        expect(
          result.summary
            .financialExecutionFailedCount,
        ).toBe(1);

        expect(
          result.summary
            .financialAnalyzedCount,
        ).toBe(0);

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "does not invoke Financial executor when MCP preparation was rejected",
      async () => {
        const prepared =
          preparedOrchestration();

        const ready =
          prepared.mcp[0];

        if (
          ready.status !==
          "READY"
        ) {
          throw new Error(
            "Expected READY fixture."
          );
        }

        prepared.mcp = [
          {
            status:
              "REJECTED",

            request:
              ready.request,

            requirement:
              ready.requirement,

            executionDecision:
              ready.executionDecision,

            mcpRequest:
              null,

            bindingIssues: [
              "SYMBOL_REQUIRED",
            ],
          },
        ];

        prepared.rejectedMcpCount =
          1;

        const result =
          await executeInvestigationOrchestration(
            undefined as never,
            undefined as never,
            prepared,
            {
              companyId:
                "BUMI",

              symbol:
                "",
            },
          );

        expect(
          executeRestMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          executeFinancialMock,
        ).not.toHaveBeenCalled();

        expect(
          result.financial[0].status,
        ).toBe(
          "PREPARATION_REJECTED",
        );

        expect(
          result.summary
            .financialPreparationRejectedCount,
        ).toBe(1);

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "keeps Financial evidence rejection non-causal and non-fatal",
      async () => {
        executeFinancialMock.mockResolvedValueOnce({
          status:
            "EVIDENCE_REJECTED",

          request: {
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
          },

          payload: {
            unexpected:
              true,
          },

          admission: {
            status:
              "REJECTED",

            observations:
              [],

            admittedObservations:
              [],

            issues: [
              "NO_ADMISSIBLE_FINANCIAL_EVIDENCE",
            ],
          },

          analysis:
            null,

          issue:
            null,

          causalConclusion:
            "UNKNOWN",
        });

        const result =
          await executeInvestigationOrchestration(
            undefined as never,
            undefined as never,
            preparedOrchestration(),
            {
              companyId:
                "BUMI",

              symbol:
                "BUMI",
            },
          );

        expect(
          result.summary
            .financialEvidenceRejectedCount,
        ).toBe(1);

        expect(
          result.summary
            .financialExecutionFailedCount,
        ).toBe(0);

        expect(
          result.summary
            .financialAnalyzedCount,
        ).toBe(0);

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );
  },
);