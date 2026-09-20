import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  handleIntegratedInvestigationHttp,
} from "../investigation/handle-integrated-investigation-http";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

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

const validBody = {
  investigationCase,

  companyId:
    "BUMI",

  sectorsSlug:
    "bumi-resources-tbk",

  ticker:
    "BUMI",

  commodity:
    "COAL" as const,

  year:
    2024,
};

describe(
  "integrated investigation HTTP boundary",
  () => {
    it(
      "executes an already-canonical investigation case",
      async () => {
        const runServer =
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

        const projectResponse =
          vi.fn()
            .mockReturnValue({
              status:
                "ACCEPTED",

              stage:
                "DETERMINISTIC_INVESTIGATION",

              caseId:
                "CASE-BUMI-2024",

              planId:
                "PLAN-BUMI-2024",

              investigationCase,

              evidenceExecution: {
                rest:
                  null,

                financial:
                  [],

                summary: {
                  restRequestCount:
                    4,

                  financialRequestCount:
                    1,
                },
              },

              causalConclusion:
                "UNKNOWN",
            });

        const result =
          await handleIntegratedInvestigationHttp(
            " server-key ",
            validBody,
            {
              runServer,
              projectResponse,
            },
          );

        expect(
          result.httpStatus,
        ).toBe(200);

        expect(
          runServer,
        ).toHaveBeenCalledTimes(1);

        expect(
          runServer,
        ).toHaveBeenCalledWith({
          sectorsApiKey:
            "server-key",

          investigationCase,

          operationContext: {
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
          },

          restEstimatedCreditBudget:
            4,
        });

        expect(
          result.body.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "rejects missing configuration before server execution",
      async () => {
        const runServer =
          vi.fn();

        const result =
          await handleIntegratedInvestigationHttp(
            undefined,
            validBody,
            {
              runServer,

              projectResponse:
                vi.fn(),
            },
          );

        expect(
          result.httpStatus,
        ).toBe(503);

        expect(
          runServer,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "rejects non-canonical case input before server execution",
      async () => {
        const runServer =
          vi.fn();

        const result =
          await handleIntegratedInvestigationHttp(
            "server-key",
            {
              ...validBody,

              investigationCase: {
                ...investigationCase,

                causalExplanation:
                  "KNOWN",
              } as unknown as RXInvestigationCase,
            },
            {
              runServer,

              projectResponse:
                vi.fn(),
            },
          );

        expect(
          result.httpStatus,
        ).toBe(400);

        expect(
          runServer,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "rejects case and execution context mismatch",
      async () => {
        const runServer =
          vi.fn();

        const result =
          await handleIntegratedInvestigationHttp(
            "server-key",
            {
              ...validBody,

              companyId:
                "ADMR",
            },
            {
              runServer,

              projectResponse:
                vi.fn(),
            },
          );

        expect(
          result.httpStatus,
        ).toBe(400);

        if (
          result.body.status !==
            "REJECTED"
        ) {
          throw new Error(
            "EXPECTED_REJECTED_RESPONSE",
          );
        }

        expect(
          result.body.issues,
        ).toEqual([
          "INVESTIGATION_CASE_CONTEXT_MISMATCH",
        ]);

        expect(
          runServer,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "fails closed when server execution throws",
      async () => {
        const runServer =
          vi.fn()
            .mockRejectedValue(
              new Error(
                "runtime failure",
              ),
            );

        const result =
          await handleIntegratedInvestigationHttp(
            "server-key",
            validBody,
            {
              runServer,

              projectResponse:
                vi.fn(),
            },
          );

        expect(
          result.httpStatus,
        ).toBe(502);

        expect(
          result.body,
        ).toEqual({
          status:
            "REJECTED",

          stage:
            "RUNTIME",

          causalConclusion:
            "UNKNOWN",

          issues: [
            "INTEGRATED_INVESTIGATION_RUNTIME_FAILURE",
          ],
        });
      },
    );
  },
);