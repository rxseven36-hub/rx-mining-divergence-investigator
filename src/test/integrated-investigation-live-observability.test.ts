import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createLiveCheckpointWriter,
} from "../../scripts/rx-mdi-v2-10p-observable-live-financial-e2e";

import {
  existsSync,
  readFileSync,
  unlinkSync,
} from "node:fs";

import {
  join,
} from "node:path";

describe(
  "controlled live observability",
  () => {
    it(
      "persists checkpoints immediately in execution order",
      () => {
        const path =
          join(
            process.cwd(),
            "RX_MDI_V2_10P_TEST_CHECKPOINT.jsonl",
          );

        if (
          existsSync(
            path,
          )
        ) {
          unlinkSync(
            path,
          );
        }

        const checkpoint =
          createLiveCheckpointWriter(
            path,
          );

        checkpoint(
          "RUN_STARTED",
          {
            target:
              "BUMI",
          },
        );

        checkpoint(
          "DISCOVERY_REQUEST_STARTED",
        );

        checkpoint(
          "DISCOVERY_REQUEST_FINISHED",
          {
            status:
              "EXECUTED",
          },
        );

        const rows =
          readFileSync(
            path,
            "utf8",
          )
            .trim()
            .split("\n")
            .map(
              (line) =>
                JSON.parse(
                  line,
                ) as {
                  checkpoint:
                    string;
                },
            );

        expect(
          rows.map(
            (row) =>
              row.checkpoint,
          ),
        ).toEqual([
          "RUN_STARTED",
          "DISCOVERY_REQUEST_STARTED",
          "DISCOVERY_REQUEST_FINISHED",
        ]);

        unlinkSync(
          path,
        );
      },
    );
  },
);