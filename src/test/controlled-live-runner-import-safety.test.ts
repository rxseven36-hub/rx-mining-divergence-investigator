import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

describe(
  "controlled live runner import safety",
  () => {
    it(
      "does not execute controlled live work merely because the module is imported",
      async () => {
        const previousGuard =
          process.env.RX_MDI_EXECUTE_CONTROLLED_LIVE;

        const previousKey =
          process.env.SECTORS_API_KEY;

        const previousCheckpoint =
          process.env.RX_MDI_LIVE_CHECKPOINT_PATH;

        process.env.RX_MDI_EXECUTE_CONTROLLED_LIVE =
          "1";

        process.env.SECTORS_API_KEY =
          "IMPORT-SAFETY-NETWORK-MUST-NOT-RUN";

        process.env.RX_MDI_LIVE_CHECKPOINT_PATH =
          "IMPORT-SAFETY-CHECKPOINT-MUST-NOT-BE-WRITTEN.txt";

        const fetchSpy =
          vi.spyOn(
            globalThis,
            "fetch",
          );

        try {
          await import(
            "../../scripts/rx-mdi-v2-10p-observable-live-financial-e2e"
          );

          expect(
            fetchSpy,
          ).not.toHaveBeenCalled();
        } finally {
          fetchSpy.mockRestore();

          if (
            previousGuard === undefined
          ) {
            delete process.env
              .RX_MDI_EXECUTE_CONTROLLED_LIVE;
          } else {
            process.env
              .RX_MDI_EXECUTE_CONTROLLED_LIVE =
              previousGuard;
          }

          if (
            previousKey === undefined
          ) {
            delete process.env
              .SECTORS_API_KEY;
          } else {
            process.env
              .SECTORS_API_KEY =
              previousKey;
          }

          if (
            previousCheckpoint === undefined
          ) {
            delete process.env
              .RX_MDI_LIVE_CHECKPOINT_PATH;
          } else {
            process.env
              .RX_MDI_LIVE_CHECKPOINT_PATH =
              previousCheckpoint;
          }
        }
      },
    );
  },
);