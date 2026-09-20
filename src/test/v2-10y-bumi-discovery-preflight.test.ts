import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compileSectorsRestRequest,
} from "../data/sectors/sectors-rest-request-compiler";

describe(
  "V2.10Y BUMI FY2024 discovery request preflight",
  () => {
    it(
      "compiles the exact canonical BUMI FY2024 historical-performance request without execution",
      () => {
        const compiled =
          compileSectorsRestRequest({
            operation:
              "GET_MINING_HISTORICAL_PERFORMANCE",

            purpose:
              "Establish admissible production-sales divergence for integrated investigation.",

            params: {
              sectorsSlug:
                "pt-bumi-resources-tbk",

              period: {
                kind:
                  "YEAR",

                year:
                  2024,
              },
            },
          });

        expect(
          compiled.status,
        ).toBe(
          "COMPILED",
        );

        if (
          compiled.status !== "COMPILED"
        ) {
          throw new Error(
            `BUMI_DISCOVERY_COMPILE_REJECTED:${compiled.issues.join("|")}`,
          );
        }

        expect(
          compiled.request.path,
        ).toBe(
          "/v2/mining/companies/performance/pt-bumi-resources-tbk/?year=2024",
        );

        expect(
          compiled.request.purpose,
        ).toBe(
          "Establish admissible production-sales divergence for integrated investigation.",
        );

        expect(
          compiled.request.estimatedCredits,
        ).toBe(
          1,
        );

        process.stdout.write(
          `\nV2_10Y_COMPILED_REQUEST=${JSON.stringify({
            path:
              compiled.request.path,

            purpose:
              compiled.request.purpose,

            estimatedCredits:
              compiled.request.estimatedCredits,
          })}\n`,
        );
      },
    );
  },
);