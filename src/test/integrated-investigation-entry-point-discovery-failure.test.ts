import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  runIntegratedInvestigationEntryPoint,
} from "../investigation/run-integrated-investigation-entry-point";

function createBaseInput() {
  return {
    sectorsApiKey:
      "TEST-ONLY",

    companyId:
      "BUMI",

    sectorsSlug:
      "pt-bumi-resources-tbk",

    ticker:
      "BUMI",

    commodity:
      "COAL" as const,

    year:
      2024,
  };
}

describe(
  "V2.10S discovery failure preservation",
  () => {
    it(
      "preserves provider failure issues together with execution status",
      async () => {
        const runIntegrated =
          vi.fn();

        const result =
          await runIntegratedInvestigationEntryPoint(
            createBaseInput(),
            {
              createDiscoveryAdapter() {
                return {} as never;
              },

              async executeDiscovery() {
                return {
                  status:
                    "EXECUTION_FAILED",

                  issues: [
                    "HTTP_ERROR",
                    "HTTP_STATUS:404",
                    "provider failure",
                  ],
                } as never;
              },

              runIntegrated,
            },
          );

        expect(
          result.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          result.stage,
        ).toBe(
          "DISCOVERY_EXECUTION",
        );

        expect(
          result.issues,
        ).toEqual([
          "EXECUTION_FAILED",
          "HTTP_ERROR",
          "HTTP_STATUS:404",
          "provider failure",
        ]);

        expect(
          runIntegrated,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "keeps status-only fallback when provider issues are absent",
      async () => {
        const result =
          await runIntegratedInvestigationEntryPoint(
            createBaseInput(),
            {
              createDiscoveryAdapter() {
                return {} as never;
              },

              async executeDiscovery() {
                return {
                  status:
                    "EXECUTION_FAILED",
                } as never;
              },

              async runIntegrated() {
                throw new Error(
                  "INTEGRATED_MUST_NOT_RUN",
                );
              },
            },
          );

        expect(
          result.issues,
        ).toEqual([
          "EXECUTION_FAILED",
        ]);
      },
    );

    it(
      "filters non-string and blank provider issues",
      async () => {
        const result =
          await runIntegratedInvestigationEntryPoint(
            createBaseInput(),
            {
              createDiscoveryAdapter() {
                return {} as never;
              },

              async executeDiscovery() {
                return {
                  status:
                    "FAILED",

                  issues: [
                    "",
                    "   ",
                    null,
                    404,
                    "HTTP_STATUS:404",
                  ],
                } as never;
              },

              async runIntegrated() {
                throw new Error(
                  "INTEGRATED_MUST_NOT_RUN",
                );
              },
            },
          );

        expect(
          result.issues,
        ).toEqual([
          "FAILED",
          "HTTP_STATUS:404",
        ]);
      },
    );
  },
);