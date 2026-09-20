import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createLiveCheckpointWriter,
  runObservableControlledLive,
} from "../../scripts/rx-mdi-v2-10p-observable-live-financial-e2e";

const liveEnabled =
  process.env
    .RX_MDI_EXECUTE_CONTROLLED_LIVE ===
  "1";

describe(
  "RX MDI controlled live financial E2E",
  () => {
    it.skipIf(
      !liveEnabled,
    )(
      "requires a completed deterministic investigation with analyzed financial evidence",
      async () => {
        const sectorsApiKey =
          process.env
            .SECTORS_API_KEY
            ?.trim() ?? "";

        const checkpointPath =
          process.env
            .RX_MDI_LIVE_CHECKPOINT_PATH
            ?.trim() ?? "";

        expect(
          sectorsApiKey.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          checkpointPath.length,
        ).toBeGreaterThan(
          0,
        );

        const checkpoint =
          createLiveCheckpointWriter(
            checkpointPath,
          );

        const result =
          await runObservableControlledLive(
            sectorsApiKey,
            checkpoint,
          );

        checkpoint(
          "VITEST_LIVE_HARNESS_RETURNED",
          {
            status:
              result.status,

            stage:
              result.stage,

            issues:
              result.issues,
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

        if (
          result.status !== "COMPLETED"
        ) {
          throw new Error(
            `LIVE_E2E_NOT_COMPLETED:${result.stage}:${result.issues.join("|")}`,
          );
        }

        expect(
          result.integrated.status,
        ).toBe(
          "COMPLETED",
        );

        expect(
          result.integrated.execution.summary
            .financialRequestCount,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.integrated.execution.summary
            .financialAnalyzedCount,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.integrated.execution.summary
            .financialEvidenceRejectedCount,
        ).toBe(
          0,
        );

        expect(
          result.integrated.execution.summary
            .financialExecutionFailedCount,
        ).toBe(
          0,
        );
      },
      120_000,
    );
  },
);