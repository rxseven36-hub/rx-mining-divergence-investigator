import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  runIntegratedInvestigation,
} from "../investigation/run-integrated-investigation";

import {
  projectIntegratedInvestigationResponse,
} from "../investigation/integrated-investigation-response";

import {
  createInvestigationPlan,
} from "../investigation/create-investigation-plan";

import {
  prepareInvestigationOrchestration,
} from "../investigation/prepare-investigation-orchestration";

import {
  executeInvestigationOrchestration,
} from "../investigation/execute-investigation-orchestration";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

import type {
  RXInvestigationOperationContext,
} from "../investigation/bind-operation-request";

vi.mock(
  "../investigation/create-investigation-plan",
  () => ({
    createInvestigationPlan:
      vi.fn(),
  }),
);

vi.mock(
  "../investigation/prepare-investigation-orchestration",
  () => ({
    prepareInvestigationOrchestration:
      vi.fn(),
  }),
);

vi.mock(
  "../investigation/execute-investigation-orchestration",
  () => ({
    executeInvestigationOrchestration:
      vi.fn(),
  }),
);

const createPlanMock =
  vi.mocked(
    createInvestigationPlan,
  );

const prepareMock =
  vi.mocked(
    prepareInvestigationOrchestration,
  );

const executeMock =
  vi.mocked(
    executeInvestigationOrchestration,
  );

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
  "integrated investigation application composition",
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();

        createPlanMock.mockReturnValue(
          {
            planId:
              "PLAN-BUMI-2024",

            caseId:
              "CASE-BUMI-2024",

            questions:
              [],

            evidenceRequirements:
              [],

            dataRequests:
              [],

            status:
              "PLANNED",

            stopConditions:
              [],

            causalConclusion:
              "UNKNOWN",
          },
        );

        prepareMock.mockReturnValue(
          {
            planId:
              "PLAN-BUMI-2024",

            caseId:
              "CASE-BUMI-2024",

            rest: {
              planId:
                "PLAN-BUMI-2024",

              caseId:
                "CASE-BUMI-2024",

              requests:
                [],

              readyCount:
                0,

              rejectedCount:
                0,

              causalConclusion:
                "UNKNOWN",
            },

            mcp:
              [],

            restRequestCount:
              4,

            mcpRequestCount:
              1,

            rejectedMcpCount:
              0,

            causalConclusion:
              "UNKNOWN",
          },
        );

        executeMock.mockResolvedValue(
          {
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
        );
      },
    );

    it(
      "composes planner preparation and execution in canonical order",
      async () => {
        const adapter = {
          requestJson:
            vi.fn(),
        };

        const mcpCaller = {
          callTool:
            vi.fn(),
        };

        const result =
          await runIntegratedInvestigation(
            adapter,
            mcpCaller,
            {
              investigationCase,

              operationContext,

              retrievedAt:
                "2026-09-19T00:00:00.000Z",
            },
          );

        expect(
          createPlanMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          createPlanMock,
        ).toHaveBeenCalledWith(
          investigationCase,
        );

        expect(
          prepareMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          executeMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          executeMock,
        ).toHaveBeenCalledWith(
          adapter,
          mcpCaller,
          expect.any(Object),
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
          result.status,
        ).toBe(
          "COMPLETED",
        );

        expect(
          result.stage,
        ).toBe(
          "DETERMINISTIC_INVESTIGATION",
        );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "does not execute provider transports itself",
      async () => {
        const adapter = {
          requestJson:
            vi.fn(),
        };

        const mcpCaller = {
          callTool:
            vi.fn(),
        };

        await runIntegratedInvestigation(
          adapter,
          mcpCaller,
          {
            investigationCase,
            operationContext,
          },
        );

        expect(
          adapter.requestJson,
        ).not.toHaveBeenCalled();

        expect(
          mcpCaller.callTool,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "projects a stable API-facing deterministic response",
      async () => {
        const result =
          await runIntegratedInvestigation(
            {
              requestJson:
                vi.fn(),
            },
            {
              callTool:
                vi.fn(),
            },
            {
              investigationCase,
              operationContext,
            },
          );

        const response =
          projectIntegratedInvestigationResponse(
            result,
          );

        expect(
          response.status,
        ).toBe(
          "ACCEPTED",
        );

        expect(
          response.stage,
        ).toBe(
          "DETERMINISTIC_INVESTIGATION",
        );

        expect(
          response.caseId,
        ).toBe(
          "CASE-BUMI-2024",
        );

        expect(
          response.planId,
        ).toBe(
          "PLAN-BUMI-2024",
        );

        expect(
          response.evidenceExecution
            .summary
            .restRequestCount,
        ).toBe(4);

        expect(
          response.evidenceExecution
            .summary
            .financialRequestCount,
        ).toBe(1);

        expect(
          response.evidenceExecution
            .summary
            .financialAnalyzedCount,
        ).toBe(1);

        expect(
          response.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );
  },
);