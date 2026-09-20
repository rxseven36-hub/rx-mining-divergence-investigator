import {
  describe,
  expect,
  it,
} from "vitest";

import {
  extractMiningMetrics,
} from "../data/normalization/extract-mining-metrics";

import {
  normalizeMiningPerformanceRow,
} from "../data/normalization/normalize-mining-performance";

import type {
  SectorsMiningPerformanceRow,
} from "../data/schemas/sectors-mining-performance";

const liveRow:
  SectorsMiningPerformanceRow = {
    year: 2024,

    commodity_type:
      "Coal",

    commodity_sub_type:
      "Thermal Coal",

    commodity_stats: {
      unit: "Mt",

      production_volume:
        50.5,

      sales_volume:
        56.2,

      overburden_removal_volume:
        214.18,

      strip_ratio:
        4.51,

      resources_reserves: {
        measurement_year:
          2023,

        total_resources_Mt:
          1000,

        total_reserves_Mt:
          500,
      },
    },
  };

describe(
  "Investigator V2.4 OB / Strip normalization",
  () => {
    it(
      "extracts live OB and strip ratio without activating nested geology",
      () => {
        const metrics =
          extractMiningMetrics(
            liveRow,
          );

        expect(
          metrics,
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              metric:
                "OVERBURDEN",

              sourceField:
                "commodity_stats.overburden_removal_volume",

              value:
                214.18,
            }),

            expect.objectContaining({
              metric:
                "STRIP_RATIO",

              sourceField:
                "commodity_stats.strip_ratio",

              value:
                4.51,
            }),
          ]),
        );

        expect(
          metrics.some(
            (metric) =>
              metric.metric ===
                "RESOURCE" ||
              metric.metric ===
                "RESERVE",
          ),
        ).toBe(false);
      },
    );

    it(
      "preserves explicit null instead of coercing to zero",
      () => {
        const metrics =
          extractMiningMetrics({
            ...liveRow,

            commodity_stats: {
              ...liveRow.commodity_stats!,

              overburden_removal_volume:
                null,

              strip_ratio:
                null,
            },
          });

        expect(
          metrics.find(
            (metric) =>
              metric.metric ===
              "OVERBURDEN",
          )?.value,
        ).toBeNull();

        expect(
          metrics.find(
            (metric) =>
              metric.metric ===
              "STRIP_RATIO",
          )?.value,
        ).toBeNull();
      },
    );

    it(
      "activates OB and strip semantics without inventing OB unit",
      () => {
        const observations =
          normalizeMiningPerformanceRow({
            companyId:
              "BYAN",

            row:
              liveRow,

            source:
              "LOCAL_V2_4_FIXTURE",
          });

        const ob =
          observations.find(
            (item) =>
              item.metric ===
              "OVERBURDEN",
          );

        const strip =
          observations.find(
            (item) =>
              item.metric ===
              "STRIP_RATIO",
          );

        expect(ob).toBeDefined();
        expect(strip).toBeDefined();

        expect(
          ob?.value,
        ).toBe(214.18);

        expect(
          ob?.semantic.state,
        ).toBe("KNOWN");

        expect(
          ob?.unit.symbol,
        ).toBe("UNKNOWN");

        expect(
          ob?.unit.dimension,
        ).toBe("UNKNOWN");

        expect(
          strip?.value,
        ).toBe(4.51);

        expect(
          strip?.semantic.state,
        ).toBe("KNOWN");

        expect(
          strip?.unit.symbol,
        ).toBe("ratio");

        expect(
          strip?.unit.dimension,
        ).toBe("RATIO");
      },
    );

    it(
      "uses performance year and does not borrow geological measurement year",
      () => {
        const observations =
          normalizeMiningPerformanceRow({
            companyId:
              "BYAN",

            row:
              liveRow,

            source:
              "LOCAL_V2_4_FIXTURE",
          });

        const ob =
          observations.find(
            (item) =>
              item.metric ===
              "OVERBURDEN",
          );

        const strip =
          observations.find(
            (item) =>
              item.metric ===
              "STRIP_RATIO",
          );

        expect(
          ob?.period.year,
        ).toBe(2024);

        expect(
          strip?.period.year,
        ).toBe(2024);

        expect(
          ob?.period.measurementYear,
        ).toBeUndefined();

        expect(
          strip?.period.measurementYear,
        ).toBeUndefined();

        expect(
          observations.some(
            (item) =>
              item.metric ===
                "RESOURCE" ||
              item.metric ===
                "RESERVE",
          ),
        ).toBe(false);
      },
    );
  },
);