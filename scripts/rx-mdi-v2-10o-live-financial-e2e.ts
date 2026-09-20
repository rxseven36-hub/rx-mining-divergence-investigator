import {
  RestSectorsAdapter,
} from "../src/data/sectors/sectors-adapter";

import {
  SectorsCreditBudget,
} from "../src/data/sectors/credit-budget";

import {
  SectorsHttpClient,
} from "../src/data/sectors/sectors-http-client";

import {
  executeSectorsOperation,
} from "../src/data/sectors/execute-sectors-operation";

import {
  runIntegratedInvestigationEntryPoint,
} from "../src/investigation/run-integrated-investigation-entry-point";

import {
  runServerIntegratedInvestigation,
} from "../src/investigation/run-server-integrated-investigation";

async function main() {
  const sectorsApiKey =
    process.env.SECTORS_API_KEY?.trim() ?? "";

  if (!sectorsApiKey) {
    throw new Error(
      "SECTORS_API_KEY_NOT_PRESENT",
    );
  }

  let discoveryAdapterCount = 0;
  let discoveryExecutionCount = 0;
  let integratedExecutionCount = 0;

  const result =
    await runIntegratedInvestigationEntryPoint(
      {
        sectorsApiKey,

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

        retrievedAt:
          new Date().toISOString(),

        restEstimatedCreditBudget:
          4,
      },
      {
        createDiscoveryAdapter(
          apiKey,
        ) {
          discoveryAdapterCount += 1;

          const client =
            new SectorsHttpClient({
              apiKey,

              creditBudget:
                new SectorsCreditBudget(
                  1,
                ),
            });

          return new RestSectorsAdapter(
            client,
          );
        },

        async executeDiscovery(
          adapter,
          request,
        ) {
          discoveryExecutionCount += 1;

          return executeSectorsOperation(
            adapter,
            request,
          );
        },

        async runIntegrated(
          input,
        ) {
          integratedExecutionCount += 1;

          return runServerIntegratedInvestigation(
            input,
          );
        },
      },
    );

  const safeSummary = {
    proof:
      "RX_MDI_V2_10O_CONTROLLED_LIVE_FINANCIAL_E2E",

    target: {
      companyId:
        "BUMI",

      year:
        2024,

      commodity:
        "COAL",
    },

    executionControl: {
      discoveryAdapterCount,
      discoveryExecutionCount,
      integratedExecutionCount,

      aiSynthesis:
        false,

      genericMcpEnrichment:
        false,
    },

    result,
  };

  process.stdout.write(
    JSON.stringify(
      safeSummary,
      null,
      2,
    ),
  );
}

main().catch(
  (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    process.stderr.write(
      JSON.stringify(
        {
          proof:
            "RX_MDI_V2_10O_CONTROLLED_LIVE_FINANCIAL_E2E",

          status:
            "FAILED",

          error:
            message,

          aiSynthesis:
            false,

          genericMcpEnrichment:
            false,
        },
        null,
        2,
      ),
    );

    process.exitCode = 1;
  },
);