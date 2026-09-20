import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  runServerIntegratedInvestigation,
} from "../investigation/run-server-integrated-investigation";

import type {
  RXInvestigationServerRuntime,
} from "../investigation/create-investigation-server-runtime";

describe(
  "server integrated investigation hanging close",
  () => {
    it(
      "keeps the known server-level hang reproducible when an arbitrary runtime close never resolves",
      async () => {
        const neverClosing =
          new Promise<void>(() => {
            // Intentionally unresolved.
          });

        const runtime = {
          adapter: {
            requestJson:
              vi.fn(),
          },

          mcpCaller: {
            callTool:
              vi.fn(),
          },

          close:
            vi.fn(
              () => neverClosing,
            ),
        } satisfies RXInvestigationServerRuntime;

        const applicationResult = {
          status:
            "COMPLETED" as const,

          stage:
            "DETERMINISTIC_INVESTIGATION" as const,

          investigationCase: {
            caseId:
              "CASE-BUMI-2024",

            companyId:
              "BUMI",

            commodity:
              "COAL" as const,

            periodLabel:
              "2024",

            detector:
              "PRODUCTION_VS_SALES" as const,

            trigger: {
              detector:
                "PRODUCTION_VS_SALES" as const,

              triggerType:
                "DETERMINISTIC_DIVERGENCE_PRIORITY" as const,

              priorityScore:
                1,

              divergenceRatio:
                0.2,

              rank:
                1,

              type:
                "PRODUCTION_SALES_DIVERGENCE" as const,
            },

            sourceObservationIds:
              [],

            status:
              "QUEUED" as const,

            truthState:
              "UNINVESTIGATED" as const,

            unknowns:
              [],

            causalExplanation:
              "UNKNOWN" as const,
          },

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
                "UNKNOWN" as const,
            },

            financial:
              [],

            summary: {
              restRequestCount:
                0,

              restEvidenceAdmittedCount:
                0,

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
                0,

              financialAnalyzedCount:
                0,

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
              "UNKNOWN" as const,
          },

          causalConclusion:
            "UNKNOWN" as const,
        };

        const promise =
          runServerIntegratedInvestigation(
            {
              sectorsApiKey:
                "TEST-ONLY",

              investigationCase:
                applicationResult.investigationCase,

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
            },
            {
              createRuntime:
                async () => runtime,

              runApplication:
                async () => applicationResult,
            },
          );

        const observed =
          await Promise.race([
            promise.then(
              () => "RETURNED" as const,
            ),

            new Promise<"TIMED_OUT">(
              (resolve) => {
                setTimeout(
                  () => resolve(
                    "TIMED_OUT",
                  ),
                  50,
                );
              },
            ),
          ]);

        expect(
          observed,
        ).toBe(
          "TIMED_OUT",
        );

        expect(
          runtime.close,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );
  },
);