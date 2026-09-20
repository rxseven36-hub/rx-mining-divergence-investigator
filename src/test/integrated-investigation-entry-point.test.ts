import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  runIntegratedInvestigationEntryPoint,
} from "../investigation/run-integrated-investigation-entry-point";

const liveShapedPayload = {
  year:
    2024,

  available_years: [
    2024,
  ],

  company_name:
    "Bumi Resources Tbk",

  symbol:
    "BUMI",

  data: [
    {
      year:
        2024,

      commodity_type:
        "COAL",

      commodity_stats: {
        unit:
          "Mt",

        production_volume:
          80,

        sales_volume:
          100,

        overburden_removal_volume:
          700,

        strip_ratio:
          9,
      },
    },
  ],
};

function createDependencies() {
  const adapter = {
    requestJson:
      vi.fn(),
  };

  const createDiscoveryAdapter =
    vi.fn()
      .mockReturnValue(
        adapter,
      );

  const executeDiscovery =
    vi.fn()
      .mockResolvedValue({
        status:
          "EXECUTED",

        data:
          liveShapedPayload,

        estimatedCreditCost:
          1,
      });

  const runIntegrated =
    vi.fn()
      .mockResolvedValue({
        status:
          "COMPLETED",

        stage:
          "DETERMINISTIC_INVESTIGATION",

        investigationCase: {
          caseId:
            "placeholder",
        },

        execution: {
          planId:
            "PLAN",

          caseId:
            "CASE",

          rest: {
            planId:
              "PLAN",

            caseId:
              "CASE",

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

  return {
    adapter,
    createDiscoveryAdapter,
    executeDiscovery,
    runIntegrated,
  };
}

describe(
  "integrated investigation canonical entry point",
  () => {
    it(
      "uses admitted discovery to create a canonical case before integrated execution",
      async () => {
        const dependencies =
          createDependencies();

        const result =
          await runIntegratedInvestigationEntryPoint(
            {
              sectorsApiKey:
                " server-key ",

              companyId:
                " BUMI ",

              sectorsSlug:
                " bumi-resources-tbk ",

              ticker:
                " BUMI ",

              commodity:
                "COAL",

              year:
                2024,
            },
            dependencies,
          );

        expect(
          result.status,
        ).toBe(
          "COMPLETED",
        );

        if (
          result.status !==
            "COMPLETED"
        ) {
          throw new Error(
            "EXPECTED_COMPLETED_ENTRY_POINT",
          );
        }

        expect(
          result.investigationCase.status,
        ).toBe(
          "QUEUED",
        );

        expect(
          result.investigationCase.truthState,
        ).toBe(
          "UNINVESTIGATED",
        );

        expect(
          result.investigationCase.causalExplanation,
        ).toBe(
          "UNKNOWN",
        );

        expect(
          result.investigationCase.trigger.triggerType,
        ).toBe(
          "DETERMINISTIC_DIVERGENCE_PRIORITY",
        );

        expect(
          dependencies.runIntegrated,
        ).toHaveBeenCalledTimes(1);

        const integratedInput =
          dependencies.runIntegrated
            .mock.calls[0][0];

        expect(
          integratedInput.investigationCase,
        ).toBe(
          result.investigationCase,
        );

        expect(
          integratedInput.operationContext,
        ).toEqual({
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
        });

        expect(
          dependencies.createDiscoveryAdapter,
        ).toHaveBeenCalledWith(
          "server-key",
        );
      },
    );

    it(
      "rejects discovery execution failure before case creation",
      async () => {
        const dependencies =
          createDependencies();

        dependencies.executeDiscovery
          .mockResolvedValue({
            status:
              "EXECUTION_FAILED",

            issues: [
              "provider failure",
            ],
          });

        const result =
          await runIntegratedInvestigationEntryPoint(
            {
              sectorsApiKey:
                "server-key",

              companyId:
                "BUMI",

              sectorsSlug:
                "bumi-resources-tbk",

              ticker:
                "BUMI",

              commodity:
                "COAL",

              year:
                2024,
            },
            dependencies,
          );

        expect(
          result.status,
        ).toBe(
          "REJECTED",
        );

        if (
          result.status !==
            "REJECTED"
        ) {
          throw new Error(
            "EXPECTED_REJECTED_ENTRY_POINT",
          );
        }

        expect(
          result.stage,
        ).toBe(
          "DISCOVERY_EXECUTION",
        );

        expect(
          dependencies.runIntegrated,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "does not create a case when admitted evidence is not scorable",
      async () => {
        const dependencies =
          createDependencies();

        dependencies.executeDiscovery
          .mockResolvedValue({
            status:
              "EXECUTED",

            data: {
              company_name:
                "Bumi Resources Tbk",

              symbol:
                "BUMI",

              commodity_stats: {
                production:
                  null,

                sales:
                  null,
              },
            },

            estimatedCreditCost:
              1,
          });

        const result =
          await runIntegratedInvestigationEntryPoint(
            {
              sectorsApiKey:
                "server-key",

              companyId:
                "BUMI",

              sectorsSlug:
                "bumi-resources-tbk",

              ticker:
                "BUMI",

              commodity:
                "COAL",

              year:
                2024,
            },
            dependencies,
          );

        expect(
          result.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          dependencies.runIntegrated,
        ).not.toHaveBeenCalled();
      },
    );
  },
);