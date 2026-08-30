import { describe, expect, it } from "vitest";

import {
  sectorsMiningPerformanceResponseSchema,
  sectorsMiningPerformanceRowSchema,
} from "../data/schemas/sectors-mining-performance";

import {
  normalizeMiningPerformanceRow,
} from "../data/normalization/normalize-mining-performance";

describe(
  "Sectors mining performance verified live contract",
  () => {
    const liveAadi2024Payload = {
      year: 2024,

      available_years: [
        2019,
        2020,
        2021,
        2022,
        2023,
        2024,
      ],

      data: [
        {
          year: 2024,

          commodity_type: "Coal",

          commodity_sub_type:
            "Sub-bituminous & Metallurgical Coal",

          commodity_stats: {
            unit: "Mt",

            mining_operation_status:
              "production",

            production_volume:
              48.11,

            sales_volume:
              55.8,

            overburden_removal_volume:
              214.18,

            strip_ratio:
              4.51,

            resources_reserves: {
              measurement_year:
                2024,

              probable_reserves_Mt:
                356,

              proven_reserves_Mt:
                463,

              total_reserves_Mt:
                819,

              inferred_resources_Mt:
                640.6,

              indicated_resources_Mt:
                962,

              measured_resources_Mt:
                3176,

              total_resources_Mt:
                4374,
            },

            products: [
              {
                product_name:
                  "Envirocoal -North Tutupan",

                calorific_value_kcal: {
                  min: 4843,
                  max: 4843,
                },

                total_moisture_pct: {
                  min: 27.1,
                  max: 27.1,
                },

                ash_content_arb:
                  null,

                total_sulphur_arb:
                  null,

                ash_content_adb: {
                  min: 2.1,
                  max: 2.1,
                },

                total_sulphur_adb: {
                  min: 0.1,
                  max: 0.1,
                },

                volatile_matter_adb: {
                  min: 39.7,
                  max: 39.7,
                },

                fixed_carbon_adb:
                  null,
              },
            ],
          },
        },
      ],
    };

    it(
      "accepts the verified nested Sectors performance shape",
      () => {
        const parsed =
          sectorsMiningPerformanceResponseSchema.parse(
            liveAadi2024Payload
          );

        expect(
          parsed.year
        ).toBe(2024);

        expect(
          parsed.data
        ).toHaveLength(1);

        const row =
          parsed.data?.[0];

        expect(
          row?.year
        ).toBe(2024);

        expect(
          row?.commodity_type
        ).toBe("Coal");

        expect(
          row?.commodity_sub_type
        ).toBe(
          "Sub-bituminous & Metallurgical Coal"
        );

        expect(
          row?.commodity_stats?.unit
        ).toBe("Mt");

        expect(
          row?.commodity_stats
            ?.mining_operation_status
        ).toBe("production");

        expect(
          row?.commodity_stats
            ?.production_volume
        ).toBe(48.11);

        expect(
          row?.commodity_stats
            ?.sales_volume
        ).toBe(55.8);

        expect(
          row?.commodity_stats
            ?.overburden_removal_volume
        ).toBe(214.18);

        expect(
          row?.commodity_stats
            ?.strip_ratio
        ).toBe(4.51);

        expect(
          row?.commodity_stats
            ?.resources_reserves
            ?.measurement_year
        ).toBe(2024);

        expect(
          row?.commodity_stats
            ?.resources_reserves
            ?.total_reserves_Mt
        ).toBe(819);

        expect(
          row?.commodity_stats
            ?.resources_reserves
            ?.total_resources_Mt
        ).toBe(4374);

        expect(
          row?.commodity_stats
            ?.products
        ).toHaveLength(1);

        expect(
          row?.commodity_stats
            ?.products?.[0]
            ?.product_name
        ).toBe(
          "Envirocoal -North Tutupan"
        );
      }
    );

    it(
      "normalizes live production and sales as known source facts",
      () => {
        const parsed =
          sectorsMiningPerformanceResponseSchema.parse(
            liveAadi2024Payload
          );

        const row =
          parsed.data?.[0];

        expect(
          row
        ).toBeDefined();

        if (!row) {
          throw new Error(
            "Expected verified AADI performance row."
          );
        }

        const observations =
          normalizeMiningPerformanceRow({
            companyId:
              "rx-company-aadi",

            row,

            source:
              "sectors-live-contract-fixture",

            retrievedAt:
              "2026-08-30T00:00:00.000Z",
          });

        expect(
          observations
        ).toHaveLength(2);

        const production =
          observations.find(
            (observation) =>
              observation.metric ===
              "PRODUCTION"
          );

        const sales =
          observations.find(
            (observation) =>
              observation.metric ===
              "SALES"
          );

        expect(
          production
        ).toBeDefined();

        expect(
          sales
        ).toBeDefined();

        expect(
          production?.value
        ).toBe(48.11);

        expect(
          production?.unit
        ).toMatchObject({
          symbol: "Mt",
          dimension: "MASS",
          raw: "Mt",
        });

        expect(
          production?.commodity
        ).toBe("COAL");

        expect(
          production
            ?.commoditySubtype
        ).toBe(
          "Sub-bituminous & Metallurgical Coal"
        );

        expect(
          production?.period.kind
        ).toBe("YEAR");

        expect(
          production?.period.year
        ).toBe(2024);

        /**
         * The nested resources/reserves measurement year
         * belongs to geological evidence.
         *
         * It MUST NOT silently become the measurement year
         * of production or sales observations.
         */
        expect(
          production?.period
            .measurementYear
        ).toBeUndefined();

        expect(
          production?.sourceField
        ).toBe(
          "commodity_stats.production_volume"
        );

        expect(
          production?.semantic.state
        ).toBe("KNOWN");

        expect(
          production?.evidence[0]
            ?.truthClass
        ).toBe("SOURCE_FACT");

        expect(
          sales?.value
        ).toBe(55.8);

        expect(
          sales?.unit
        ).toMatchObject({
          symbol: "Mt",
          dimension: "MASS",
          raw: "Mt",
        });

        expect(
          sales?.commodity
        ).toBe("COAL");

        expect(
          sales
            ?.commoditySubtype
        ).toBe(
          "Sub-bituminous & Metallurgical Coal"
        );

        expect(
          sales?.period.kind
        ).toBe("YEAR");

        expect(
          sales?.period.year
        ).toBe(2024);

        expect(
          sales?.period
            .measurementYear
        ).toBeUndefined();

        expect(
          sales?.sourceField
        ).toBe(
          "commodity_stats.sales_volume"
        );

        expect(
          sales?.semantic.state
        ).toBe("KNOWN");

        expect(
          sales?.evidence[0]
            ?.truthClass
        ).toBe("SOURCE_FACT");
      }
    );

    it(
      "does not activate nested resource and reserve metrics yet",
      () => {
        const parsed =
          sectorsMiningPerformanceResponseSchema.parse(
            liveAadi2024Payload
          );

        const row =
          parsed.data?.[0];

        if (!row) {
          throw new Error(
            "Expected verified AADI performance row."
          );
        }

        const observations =
          normalizeMiningPerformanceRow({
            companyId:
              "rx-company-aadi",

            row,

            source:
              "sectors-live-contract-fixture",
          });

        expect(
          observations.some(
            (observation) =>
              observation.metric ===
              "RESOURCE"
          )
        ).toBe(false);

        expect(
          observations.some(
            (observation) =>
              observation.metric ===
              "RESERVE"
          )
        ).toBe(false);
      }
    );

    it(
      "prefers verified live fields over legacy provisional fields",
      () => {
        const parsed =
          sectorsMiningPerformanceRowSchema.parse({
            ...liveAadi2024Payload.data[0],

            /**
             * Deliberately conflicting legacy values.
             *
             * Verified live nested fields MUST win.
             */
            unit:
              "LEGACY_UNIT",

            production:
              999,

            sales:
              888,

            subtype:
              "LEGACY_SUBTYPE",
          });

        const observations =
          normalizeMiningPerformanceRow({
            companyId:
              "rx-company-aadi",

            row: parsed,

            source:
              "precedence-test",
          });

        expect(
          observations
        ).toHaveLength(2);

        const production =
          observations.find(
            (observation) =>
              observation.metric ===
              "PRODUCTION"
          );

        const sales =
          observations.find(
            (observation) =>
              observation.metric ===
              "SALES"
          );

        expect(
          production?.value
        ).toBe(48.11);

        expect(
          sales?.value
        ).toBe(55.8);

        expect(
          production?.unit
        ).toMatchObject({
          symbol: "Mt",
          dimension: "MASS",
          raw: "Mt",
        });

        expect(
          sales?.unit
        ).toMatchObject({
          symbol: "Mt",
          dimension: "MASS",
          raw: "Mt",
        });

        expect(
          production
            ?.commoditySubtype
        ).toBe(
          "Sub-bituminous & Metallurgical Coal"
        );

        expect(
          production?.sourceField
        ).toBe(
          "commodity_stats.production_volume"
        );

        expect(
          sales?.sourceField
        ).toBe(
          "commodity_stats.sales_volume"
        );
      }
    );
  }
);