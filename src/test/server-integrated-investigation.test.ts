import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createInvestigationServerRuntime,
} from "../investigation/create-investigation-server-runtime";

import {
  runServerIntegratedInvestigation,
} from "../investigation/run-server-integrated-investigation";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

import type {
  RXInvestigationOperationContext,
} from "../investigation/bind-operation-request";

const investigationCase:
  RXInvestigationCase = {
  caseId:
    "CASE-BUMI-2024",

  companyId:
    "BUMI",

  commodity:
    "COAL",

  periodLabel:
    "2024",

  detector:
    "PRODUCTION_VS_SALES",

  trigger: {
    detector:
      "PRODUCTION_VS_SALES",

    priorityScore:
      50,

    divergenceRatio:
      0.2,

    rank:
      1,

    triggerType:
      "DETERMINISTIC_DIVERGENCE_PRIORITY",
  },

  sourceObservationIds: [
    "OBS-PRODUCTION",
    "OBS-SALES",
  ],

  status:
    "QUEUED",

  truthState:
    "UNINVESTIGATED",

  unknowns:
    [],

  causalExplanation:
    "UNKNOWN",
};

const operationContext:
  RXInvestigationOperationContext = {
  companyId:
    "BUMI",

  sectorsSlug:
    "bumi-resources-tbk",

  ticker:
    "BUMI",

  commodity:
    "COAL",

  period: {
    kind:
      "YEAR",

    year:
      2024,
  },
};

describe(
  "investigation server transport composition",
  () => {
    it(
      "creates independent REST and MCP provider boundaries without executing tools",
      async () => {
        const adapter = {
          requestJson:
            vi.fn(),
        };

        const caller = {
          callTool:
            vi.fn(),
        };

        const close =
          vi.fn()
            .mockResolvedValue(
              undefined,
            );

        const createRestAdapter =
          vi.fn()
            .mockReturnValue(
              adapter,
            );

        const openMcpSession =
          vi.fn()
            .mockResolvedValue({
              caller,
              close,
            });

        const runtime =
          await createInvestigationServerRuntime(
            {
              sectorsApiKey:
                "  server-key  ",

              restEstimatedCreditBudget:
                4,
            },
            {
              createRestAdapter,
              openMcpSession,
            },
          );

        expect(
          createRestAdapter,
        ).toHaveBeenCalledWith(
          "server-key",
          4,
        );

        expect(
          openMcpSession,
        ).toHaveBeenCalledWith({
          apiKey:
            "server-key",

          endpoint:
            undefined,
        });

        expect(
          runtime.adapter,
        ).toBe(
          adapter,
        );

        expect(
          runtime.mcpCaller,
        ).toBe(
          caller,
        );

        expect(
          adapter.requestJson,
        ).not.toHaveBeenCalled();

        expect(
          caller.callTool,
        ).not.toHaveBeenCalled();

        await runtime.close();

        expect(
          close,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "runs the application and always closes runtime resources",
      async () => {
        const close =
          vi.fn()
            .mockResolvedValue(
              undefined,
            );

        const adapter = {
          requestJson:
            vi.fn(),
        };

        const caller = {
          callTool:
            vi.fn(),
        };

        const createRuntime =
          vi.fn()
            .mockResolvedValue({
              adapter,
              mcpCaller:
                caller,
              close,
            });

        const runApplication =
          vi.fn()
            .mockResolvedValue({
              status:
                "COMPLETED",

              stage:
                "DETERMINISTIC_INVESTIGATION",

              investigationCase,

              execution: {
                planId:
                  "PLAN-BUMI-2024",

                caseId:
                  "CASE-BUMI-2024",

                rest: {
                  planId:
                    "PLAN-BUMI-2024",

                  caseId:
                    "CASE-BUMI-2024",

                  outcomes:
                    [],

                  summary: {
                    totalCount:
                      4,

                    evidenceAdmittedCount:
                      4,

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
                },

                financial:
                  [],

                summary: {
                  restRequestCount:
                    4,

                  restEvidenceAdmittedCount:
                    4,

                  restEvidenceRejectedCount:
                    0,

                  restExecutionFailedCount:
                    0,

                  restExecutionRejectedCount:
                    0,

                  restSkippedCount:
                    0,

                  restAdmissionNotSupportedCount:
                    0,

                  financialRequestCount:
                    1,

                  financialAnalyzedCount:
                    1,

                  financialEvidenceRejectedCount:
                    0,

                  financialExecutionFailedCount:
                    0,

                  financialPreparationRejectedCount:
                    0,

                  financialBindingRejectedCount:
                    0,
                },

                causalConclusion:
                  "UNKNOWN",
              },

              causalConclusion:
                "UNKNOWN",
            });

        const result =
          await runServerIntegratedInvestigation(
            {
              sectorsApiKey:
                "server-key",

              investigationCase,

              operationContext,
            },
            {
              createRuntime,
              runApplication,
            },
          );

        expect(
          createRuntime,
        ).toHaveBeenCalledWith({
          sectorsApiKey:
            "server-key",

          mcpEndpoint:
            undefined,

          restEstimatedCreditBudget:
            undefined,
        });

        expect(
          runApplication,
        ).toHaveBeenCalledWith(
          adapter,
          caller,
          {
            investigationCase,
            operationContext,
            retrievedAt:
              undefined,
          },
        );

        expect(
          result.status,
        ).toBe(
          "COMPLETED",
        );

        expect(
          close,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "closes runtime resources when application execution throws",
      async () => {
        const close =
          vi.fn()
            .mockResolvedValue(
              undefined,
            );

        const createRuntime =
          vi.fn()
            .mockResolvedValue({
              adapter: {
                requestJson:
                  vi.fn(),
              },

              mcpCaller: {
                callTool:
                  vi.fn(),
              },

              close,
            });

        const runApplication =
          vi.fn()
            .mockRejectedValue(
              new Error(
                "application failure",
              ),
            );

        await expect(
          runServerIntegratedInvestigation(
            {
              sectorsApiKey:
                "server-key",

              investigationCase,

              operationContext,
            },
            {
              createRuntime,
              runApplication,
            },
          ),
        ).rejects.toThrow(
          "application failure",
        );

        expect(
          close,
        ).toHaveBeenCalledTimes(1);
      },
    );
  },
);