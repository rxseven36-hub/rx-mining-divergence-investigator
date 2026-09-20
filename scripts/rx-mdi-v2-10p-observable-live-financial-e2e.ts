import {
  appendFileSync,
  writeFileSync,
} from "node:fs";

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

export type RXLiveCheckpointWriter =
  (
    checkpoint: string,
    detail?: Record<string, unknown>,
  ) => void;

export function createLiveCheckpointWriter(
  path: string,
): RXLiveCheckpointWriter {
  writeFileSync(
    path,
    "",
    {
      encoding: "utf8",
    },
  );

  return (
    checkpoint,
    detail = {},
  ) => {
    appendFileSync(
      path,
      `${JSON.stringify({
        at: new Date().toISOString(),
        checkpoint,
        ...detail,
      })}\n`,
      {
        encoding: "utf8",
      },
    );
  };
}

export async function runObservableControlledLive(
  sectorsApiKey: string,
  checkpoint: RXLiveCheckpointWriter,
) {
  checkpoint(
    "RUN_STARTED",
    {
      target: "BUMI",
      year: 2024,
      aiSynthesis: false,
      genericMcpEnrichment: false,
    },
  );

  const result =
    await runIntegratedInvestigationEntryPoint(
      {
        sectorsApiKey,

        companyId: "BUMI",

        sectorsSlug:
          "pt-bumi-resources-tbk",

        ticker: "BUMI",

        commodity: "COAL",

        year: 2024,

        retrievedAt:
          new Date().toISOString(),

        restEstimatedCreditBudget: 4,
      },
      {
        createDiscoveryAdapter(
          apiKey,
        ) {
          checkpoint(
            "DISCOVERY_ADAPTER_CREATED",
          );

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
          checkpoint(
            "DISCOVERY_REQUEST_STARTED",
            {
              operation:
                request.operation,
            },
          );

          try {
            const execution =
              await executeSectorsOperation(
                adapter,
                request,
              );

            checkpoint(
              "DISCOVERY_REQUEST_FINISHED",
              {
                status:
                  execution.status,

                issues:
                  execution.issues,
              },
            );

            return execution;
          } catch (error) {
            checkpoint(
              "DISCOVERY_REQUEST_THROWN",
              {
                error:
                  error instanceof Error
                    ? error.message
                    : String(error),
              },
            );

            throw error;
          }
        },

        async runIntegrated(
          input,
        ) {
          checkpoint(
            "CANONICAL_CASE_CREATED",
            {
              caseId:
                input.investigationCase.caseId,

              companyId:
                input.investigationCase.companyId,
            },
          );

          checkpoint(
            "INTEGRATED_RAILWAY_STARTED",
          );

          try {
            const integrated =
              await runServerIntegratedInvestigation(
                input,
              );

            checkpoint(
              "INTEGRATED_RAILWAY_FINISHED",
              {
                status:
                  integrated.status,

                financialRequestCount:
                  integrated.execution.summary
                    .financialRequestCount,

                financialAnalyzedCount:
                  integrated.execution.summary
                    .financialAnalyzedCount,

                financialEvidenceRejectedCount:
                  integrated.execution.summary
                    .financialEvidenceRejectedCount,

                financialExecutionFailedCount:
                  integrated.execution.summary
                    .financialExecutionFailedCount,
              },
            );

            return integrated;
          } catch (error) {
            checkpoint(
              "INTEGRATED_RAILWAY_THROWN",
              {
                error:
                  error instanceof Error
                    ? error.message
                    : String(error),
              },
            );

            throw error;
          }
        },
      },
    );

  checkpoint(
    "ENTRY_POINT_FINISHED",
    {
      status:
        result.status,

      stage:
        result.stage,

      issues:
        result.issues,
    },
  );

  return result;
}

async function main() {
  const sectorsApiKey =
    process.env.SECTORS_API_KEY?.trim() ?? "";

  if (!sectorsApiKey) {
    throw new Error(
      "SECTORS_API_KEY_NOT_PRESENT",
    );
  }

  const checkpointPath =
    process.env
      .RX_MDI_LIVE_CHECKPOINT_PATH
      ?.trim();

  if (!checkpointPath) {
    throw new Error(
      "RX_MDI_LIVE_CHECKPOINT_PATH_NOT_PRESENT",
    );
  }

  const checkpoint =
    createLiveCheckpointWriter(
      checkpointPath,
    );

  try {
    const result =
      await runObservableControlledLive(
        sectorsApiKey,
        checkpoint,
      );

    checkpoint(
      "RUN_COMPLETED",
    );

    process.stdout.write(
      JSON.stringify(
        {
          proof:
            "RX_MDI_V2_10P_OBSERVABLE_CONTROLLED_LIVE",

          result,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    checkpoint(
      "RUN_FAILED",
      {
        error:
          message,
      },
    );

    process.stderr.write(
      JSON.stringify(
        {
          proof:
            "RX_MDI_V2_10P_OBSERVABLE_CONTROLLED_LIVE",

          status:
            "FAILED",

          error:
            message,
        },
        null,
        2,
      ),
    );

    process.exitCode = 1;
  }
}