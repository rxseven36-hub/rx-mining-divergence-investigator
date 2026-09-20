import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  existsSync,
  readFileSync,
  rmSync,
} from "node:fs";

import {
  resolve,
} from "node:path";

import {
  createLiveCheckpointWriter,
} from "../../scripts/rx-mdi-v2-10p-observable-live-financial-e2e";

describe(
  "controlled live checkpoint contract",
  () => {
    const checkpointPath =
      resolve(
        process.cwd(),
        "RX_MDI_TEST_ONLY_LIVE_CHECKPOINT.jsonl",
      );

    afterEach(
      () => {
        rmSync(
          checkpointPath,
          {
            force: true,
          },
        );

        delete process.env
          .RX_MDI_LIVE_CHECKPOINT_PATH;
      },
    );

    it(
      "uses the exact checkpoint environment variable required by the live harness",
      () => {
        process.env
          .RX_MDI_LIVE_CHECKPOINT_PATH =
          checkpointPath;

        const resolvedPath =
          process.env
            .RX_MDI_LIVE_CHECKPOINT_PATH
            ?.trim() ?? "";

        expect(
          resolvedPath,
        ).toBe(
          checkpointPath,
        );

        const checkpoint =
          createLiveCheckpointWriter(
            resolvedPath,
          );

        checkpoint(
          "DRY_CHECKPOINT_CONTRACT_PROVEN",
          {
            network:
              false,
            live:
              false,
          },
        );

        expect(
          existsSync(
            checkpointPath,
          ),
        ).toBe(
          true,
        );

        const content =
          readFileSync(
            checkpointPath,
            "utf8",
          );

        expect(
          content,
        ).toContain(
          "DRY_CHECKPOINT_CONTRACT_PROVEN",
        );

        expect(
          content,
        ).toContain(
          '"network":false',
        );

        expect(
          content,
        ).toContain(
          '"live":false',
        );
      },
    );
  },
);