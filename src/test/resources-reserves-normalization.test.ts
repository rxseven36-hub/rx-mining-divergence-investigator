import {
  describe,
  expect,
  it,
} from "vitest";

import {
  normalizeMiningResourcesReserves,
} from "../data/normalization/normalize-mining-resources-reserves";

describe(
  "resources/reserves geological normalization",
  () => {
    it(
      "normalizes explicit live geological fields with Mt semantics",
      () => {
        const observations =
          normalizeMiningResourcesReserves({
            companyId:
              "rx-company-byan",

            source:
              "SECTORS_TEST",

            row: {
              year: 2024,

              commodity_type:
                "Coal",

              commodity_stats: {
                resources_reserves: {
                  measurement_year:
                    2022,

                  total_reserves_Mt:
                    240.946,

                  total_resources_Mt:
                    266.55,
                },
              },
            },
          });

        expect(
          observations,
        ).toHaveLength(2);

        expect(
          observations,
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              metric:
                "TOTAL_RESERVE",

              value:
                240.946,

              measurementYear:
                2022,

              sourcePerformanceYear:
                2024,

              unit: {
                symbol: "Mt",
                dimension: "MASS",
              },
            }),

            expect.objectContaining({
              metric:
                "TOTAL_RESOURCE",

              value:
                266.55,

              measurementYear:
                2022,

              sourcePerformanceYear:
                2024,

              unit: {
                symbol: "Mt",
                dimension: "MASS",
              },
            }),
          ]),
        );
      },
    );

    it(
      "does not replace geological measurement year with performance year",
      () => {
        const observations =
          normalizeMiningResourcesReserves({
            companyId:
              "rx-company-test",

            source:
              "SECTORS_TEST",

            row: {
              year: 2024,

              commodity_type:
                "Coal",

              commodity_stats: {
                resources_reserves: {
                  measurement_year:
                    2021,

                  total_resources_Mt:
                    100,
                },
              },
            },
          });

        expect(
          observations[0]?.measurementYear,
        ).toBe(2021);

        expect(
          observations[0]?.sourcePerformanceYear,
        ).toBe(2024);
      },
    );

    it(
      "does not invent missing or null geological values",
      () => {
        const observations =
          normalizeMiningResourcesReserves({
            companyId:
              "rx-company-test",

            source:
              "SECTORS_TEST",

            row: {
              year: 2024,

              commodity_stats: {
                resources_reserves: {
                  measurement_year:
                    2024,

                  total_resources_Mt:
                    null,

                  total_reserves_Mt:
                    50,
                },
              },
            },
          });

        expect(
          observations,
        ).toHaveLength(1);

        expect(
          observations[0]?.metric,
        ).toBe(
          "TOTAL_RESERVE",
        );

        expect(
          observations[0]?.value,
        ).toBe(50);
      },
    );

    it(
      "does not derive totals or components",
      () => {
        const observations =
          normalizeMiningResourcesReserves({
            companyId:
              "rx-company-test",

            source:
              "SECTORS_TEST",

            row: {
              commodity_stats: {
                resources_reserves: {
                  measurement_year:
                    2024,

                  measured_resources_Mt:
                    10,

                  indicated_resources_Mt:
                    20,
                },
              },
            },
          });

        expect(
          observations.map(
            (item) => item.metric,
          ),
        ).toEqual([
          "MEASURED_RESOURCE",
          "INDICATED_RESOURCE",
        ]);

        expect(
          observations.some(
            (item) =>
              item.metric ===
              "TOTAL_RESOURCE",
          ),
        ).toBe(false);
      },
    );

    it(
      "keeps missing measurement year explicit instead of borrowing row year",
      () => {
        const observations =
          normalizeMiningResourcesReserves({
            companyId:
              "rx-company-test",

            source:
              "SECTORS_TEST",

            row: {
              year: 2024,

              commodity_stats: {
                resources_reserves: {
                  total_reserves_Mt:
                    75,
                },
              },
            },
          });

        expect(
          observations[0]?.measurementYear,
        ).toBeNull();

        expect(
          observations[0]?.sourcePerformanceYear,
        ).toBe(2024);
      },
    );
  },
);