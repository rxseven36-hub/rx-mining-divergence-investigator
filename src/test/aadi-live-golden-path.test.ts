import {
  describe,
  expect,
  it,
} from "vitest";

import {
  sectorsMiningPerformanceResponseSchema,
} from "../data/schemas/sectors-mining-performance";

import {
  normalizeMiningPerformanceRow,
} from "../data/normalization/normalize-mining-performance";

import {
  compareObservations,
} from "../intelligence/comparability/compare-observations";

import {
  detectProductionSalesDivergence,
} from "../intelligence/detectors/production-sales-divergence";

import {
  scoreDivergence,
} from "../intelligence/priority/score-divergence";

import {
  rankPriorities,
} from "../intelligence/priority/rank-priorities";

/**
 * Golden-path regression fixture derived from the
 * verified Sectors mining-performance response shape
 * captured for AADI 2024.
 *
 * IMPORTANT:
 * This is a local deterministic fixture.
 *
 * No API request is performed by this test.
 * No AI is used.
 * No causal explanation is inferred.
 */
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

      commodity_type:
        "Coal",

      commodity_sub_type:
        "Sub-bituminous & Metallurgical Coal",

      commodity_stats: {
        unit:
          "Mt",

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

function buildNormalizedObservations() {
  const parsed =
    sectorsMiningPerformanceResponseSchema.parse(
      liveAadi2024Payload
    );

  const row =
    parsed.data?.[0];

  if (!row) {
    throw new Error(
      "Expected verified AADI 2024 performance row."
    );
  }

  return normalizeMiningPerformanceRow({
    companyId:
      "rx-company-aadi",

    row,

    source:
      "verified-aadi-2024-live-contract-fixture",

    retrievedAt:
      "2026-08-30T00:00:00.000Z",
  });
}

describe(
  "AADI 2024 verified live golden path",
  () => {
    it(
      "produces comparable production and sales observations",
      () => {
        const observations =
          buildNormalizedObservations();

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

        if (
          !production ||
          !sales
        ) {
          throw new Error(
            "Expected production and sales observations."
          );
        }

        expect(
          production.value
        ).toBe(48.11);

        expect(
          sales.value
        ).toBe(55.8);

        expect(
          production.unit
        ).toMatchObject({
          symbol: "Mt",
          dimension: "MASS",
          raw: "Mt",
        });

        expect(
          sales.unit
        ).toMatchObject({
          symbol: "Mt",
          dimension: "MASS",
          raw: "Mt",
        });

        expect(
          production.semantic.state
        ).toBe("KNOWN");

        expect(
          sales.semantic.state
        ).toBe("KNOWN");

        const comparability =
          compareObservations(
            production,
            sales
          );

        expect(
          comparability.eligible
        ).toBe(true);

        expect(
          comparability.reasons
        ).toEqual([]);
      }
    );

    it(
      "detects the deterministic production-sales divergence without causal inference",
      () => {
        const observations =
          buildNormalizedObservations();

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

        if (
          !production ||
          !sales
        ) {
          throw new Error(
            "Expected production and sales observations."
          );
        }

        const result =
          detectProductionSalesDivergence(
            production,
            sales
          );

        expect(
          result.status
        ).toBe("DETECTED");

        expect(
          result.skipReasons
        ).toEqual([]);

        expect(
          result.causalExplanation
        ).toBe("UNKNOWN");

        expect(
          result.periodLabel
        ).toBe("2024");

        expect(
          result.commodity
        ).toBe("COAL");

        expect(
          result.commoditySubtype
        ).toBe(
          "Sub-bituminous & Metallurgical Coal"
        );

        expect(
          result.calculation
        ).toBeDefined();

        expect(
          result.calculation?.production
        ).toBeCloseTo(
          48.11,
          10
        );

        expect(
          result.calculation?.sales
        ).toBeCloseTo(
          55.8,
          10
        );

        expect(
          result.calculation
            ?.signedDifference
        ).toBeCloseTo(
          7.69,
          10
        );

        expect(
          result.calculation
            ?.absoluteDifference
        ).toBeCloseTo(
          7.69,
          10
        );

        expect(
          result.calculation
            ?.differenceRatioOfProduction
        ).toBeCloseTo(
          7.69 / 48.11,
          10
        );

        expect(
          result.calculation?.direction
        ).toBe(
          "SALES_ABOVE_PRODUCTION"
        );
      }
    );

    it(
      "scores and ranks the detected divergence deterministically",
      () => {
        const observations =
          buildNormalizedObservations();

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

        if (
          !production ||
          !sales
        ) {
          throw new Error(
            "Expected production and sales observations."
          );
        }

        const detectorResult =
          detectProductionSalesDivergence(
            production,
            sales
          );

        const priority =
          scoreDivergence(
            detectorResult
          );

        expect(
          priority.status
        ).toBe("SCORABLE");

        expect(
          priority.causalExplanation
        ).toBe("UNKNOWN");

        expect(
          priority.divergenceRatio
        ).toBeCloseTo(
          7.69 / 48.11,
          10
        );

        const expectedRatio =
          7.69 / 48.11;

        const expectedScore =
          (100 * expectedRatio) /
          (1 + expectedRatio);

        expect(
          priority.score
        ).toBeCloseTo(
          expectedScore,
          10
        );

        const ranked =
          rankPriorities([
            priority,
          ]);

        expect(
          ranked
        ).toHaveLength(1);

        expect(
          ranked[0]?.status
        ).toBe("SCORABLE");

        expect(
          ranked[0]?.rank
        ).toBe(1);

        expect(
          ranked[0]?.score
        ).toBeCloseTo(
          expectedScore,
          10
        );

        expect(
          ranked[0]
            ?.causalExplanation
        ).toBe("UNKNOWN");
      }
    );

    it(
      "preserves the RX truth boundary across the golden path",
      () => {
        const observations =
          buildNormalizedObservations();

        expect(
          observations.every(
            (observation) =>
              observation.evidence.every(
                (evidence) =>
                  evidence.truthClass ===
                  "SOURCE_FACT"
              )
          )
        ).toBe(true);

        expect(
          observations.every(
            (observation) =>
              observation.semantic.state ===
              "KNOWN"
          )
        ).toBe(true);

        /**
         * Geological resource/reserve values exist in
         * the live source payload but are deliberately
         * not activated as normalized observations yet.
         */
        expect(
          observations.some(
            (observation) =>
              observation.metric ===
              "RESOURCE" ||
              observation.metric ===
              "RESERVE"
          )
        ).toBe(false);

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

        if (
          !production ||
          !sales
        ) {
          throw new Error(
            "Expected production and sales observations."
          );
        }

        const detectorResult =
          detectProductionSalesDivergence(
            production,
            sales
          );

        const priority =
          scoreDivergence(
            detectorResult
          );

        expect(
          detectorResult
            .causalExplanation
        ).toBe("UNKNOWN");

        expect(
          priority
            .causalExplanation
        ).toBe("UNKNOWN");
      }
    );
  }
);