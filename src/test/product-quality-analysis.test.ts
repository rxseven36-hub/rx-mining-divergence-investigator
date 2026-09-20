import {
  describe,
  expect,
  it,
} from "vitest";

import {
  admitMiningProductQualityEvidence,
} from "../investigation/admit-mining-product-quality-evidence";

import {
  analyzeMiningProductQuality,
} from "../investigation/analyze-mining-product-quality";

import type {
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

function createRequest(
  capability:
    RXInvestigationDataRequest["capability"] =
      "MINING_HISTORICAL_PERFORMANCE",
): RXInvestigationDataRequest {
  return {
    requestId:
      "REQ-PQ-ANALYSIS-1",

    requirementId:
      "REQ-PRODUCT-QUALITY",

    source:
      "SECTORS",

    capability,

    purpose:
      "Collect admitted mining product-quality evidence.",

    status:
      "PLANNED",
  };
}

function createAdmission() {
  return admitMiningProductQualityEvidence({
    request:
      createRequest(),

    companyId:
      "rx-company-test",

    sourceReference:
      "SECTORS_TEST",

    payload: {
      data: [
        {
          year:
            2024,

          commodity_type:
            "Coal",

          commodity_sub_type:
            "Thermal Coal",

          commodity_stats: {
            products: [
              {
                product_name:
                  "Product B",

                calorific_value_kcal: {
                  min:
                    5000,

                  max:
                    5200,
                },

                total_moisture_pct: {
                  min:
                    20,

                  max:
                    24,
                },

                ash_content_adb: {
                  min:
                    3,

                  max:
                    5,
                },
              },

              {
                product_name:
                  "Product A",

                calorific_value_kcal: {
                  min:
                    4000,

                  max:
                    4200,
                },

                ash_content_arb: {
                  min:
                    5,

                  max:
                    7,
                },

                total_sulphur_arb: {
                  min:
                    0.2,

                  max:
                    0.4,
                },

                total_sulphur_adb: {
                  min:
                    0.1,

                  max:
                    0.3,
                },

                volatile_matter_adb: {
                  min:
                    38,

                  max:
                    42,
                },

                fixed_carbon_adb: {
                  min:
                    40,

                  max:
                    45,
                },
              },
            ],
          },
        },
      ],
    },
  });
}

describe(
  "product-quality deterministic analysis",
  () => {
    it(
      "analyzes admitted evidence and groups observations by product",
      () => {
        const admission =
          createAdmission();

        expect(
          admission.status,
        ).toBe("ADMITTED");

        const analysis =
          analyzeMiningProductQuality(
            admission,
          );

        expect(
          analysis.status,
        ).toBe("ANALYZED");

        expect(
          analysis.companyId,
        ).toBe(
          "rx-company-test",
        );

        expect(
          analysis.productCount,
        ).toBe(2);

        expect(
          analysis.observationCount,
        ).toBe(9);

        expect(
          analysis.products.map(
            (product) =>
              product.productName,
          ),
        ).toEqual([
          "Product A",
          "Product B",
        ]);

        expect(
          analysis.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "preserves source ranges without creating midpoint or score",
      () => {
        const analysis =
          analyzeMiningProductQuality(
            createAdmission(),
          );

        const productB =
          analysis.products.find(
            (product) =>
              product.productName ===
              "Product B",
          );

        const calorific =
          productB?.observations.find(
            (observation) =>
              observation.metric ===
              "CALORIFIC_VALUE",
          );

        expect(
          calorific?.min,
        ).toBe(5000);

        expect(
          calorific?.max,
        ).toBe(5200);

        expect(
          Object.prototype.hasOwnProperty.call(
            calorific ?? {},
            "midpoint",
          ),
        ).toBe(false);

        expect(
          Object.prototype.hasOwnProperty.call(
            analysis,
            "score",
          ),
        ).toBe(false);
      },
    );

    it(
      "keeps ARB and ADB metrics separate",
      () => {
        const analysis =
          analyzeMiningProductQuality(
            createAdmission(),
          );

        const productA =
          analysis.products.find(
            (product) =>
              product.productName ===
              "Product A",
          );

        const metrics =
          productA?.observations.map(
            (observation) =>
              observation.metric,
          ) ?? [];

        expect(metrics).toContain(
          "ASH_ARB",
        );

        expect(metrics).toContain(
          "TOTAL_SULPHUR_ARB",
        );

        expect(metrics).toContain(
          "TOTAL_SULPHUR_ADB",
        );

        expect(
          metrics.filter(
            (metric) =>
              metric ===
                "TOTAL_SULPHUR_ARB",
          ),
        ).toHaveLength(1);

        expect(
          metrics.filter(
            (metric) =>
              metric ===
                "TOTAL_SULPHUR_ADB",
          ),
        ).toHaveLength(1);
      },
    );

    it(
      "orders metrics deterministically inside a product",
      () => {
        const analysis =
          analyzeMiningProductQuality(
            createAdmission(),
          );

        const productA =
          analysis.products.find(
            (product) =>
              product.productName ===
              "Product A",
          );

        expect(
          productA?.observations.map(
            (observation) =>
              observation.metric,
          ),
        ).toEqual([
          "CALORIFIC_VALUE",
          "ASH_ARB",
          "TOTAL_SULPHUR_ARB",
          "TOTAL_SULPHUR_ADB",
          "VOLATILE_MATTER_ADB",
          "FIXED_CARBON_ADB",
        ]);
      },
    );

    it(
      "retains source performance year as context",
      () => {
        const analysis =
          analyzeMiningProductQuality(
            createAdmission(),
          );

        expect(
          analysis.sourcePerformanceYears,
        ).toEqual([
          2024,
        ]);

        expect(
          analysis.products.every(
            (product) =>
              product.sourcePerformanceYear ===
                2024,
          ),
        ).toBe(true);
      },
    );

    it(
      "does not use production sales geology or strip-ratio data",
      () => {
        const admission =
          admitMiningProductQualityEvidence({
            request:
              createRequest(),

            companyId:
              "rx-company-test",

            sourceReference:
              "SECTORS_TEST",

            payload: {
              data: [
                {
                  year:
                    2024,

                  commodity_stats: {
                    production_volume:
                      100,

                    sales_volume:
                      95,

                    overburden_removal_volume:
                      900,

                    strip_ratio:
                      9,

                    resources_reserves: {
                      measurement_year:
                        2024,

                      total_resources_Mt:
                        500,

                      total_reserves_Mt:
                        300,
                    },

                    products: [
                      {
                        product_name:
                          "Product A",

                        calorific_value_kcal: {
                          min:
                            4500,

                          max:
                            4700,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          });

        const analysis =
          analyzeMiningProductQuality(
            admission,
          );

        expect(
          analysis.status,
        ).toBe("ANALYZED");

        expect(
          analysis.observationCount,
        ).toBe(1);

        expect(
          analysis.products[0]
            ?.observations[0]
            ?.metric,
        ).toBe(
          "CALORIFIC_VALUE",
        );
      },
    );

    it(
      "returns insufficient evidence for rejected admission",
      () => {
        const admission =
          admitMiningProductQualityEvidence({
            request:
              createRequest(),

            companyId:
              "rx-company-test",

            sourceReference:
              "SECTORS_TEST",

            payload: {
              data: [
                {
                  year:
                    2024,

                  commodity_stats: {
                    products: [
                      {
                        product_name:
                          "Product A",

                        calorific_value_kcal:
                          null,
                      },
                    ],
                  },
                },
              ],
            },
          });

        expect(
          admission.status,
        ).toBe("REJECTED");

        const analysis =
          analyzeMiningProductQuality(
            admission,
          );

        expect(
          analysis.status,
        ).toBe(
          "INSUFFICIENT_EVIDENCE",
        );

        expect(
          analysis.productCount,
        ).toBe(0);

        expect(
          analysis.observationCount,
        ).toBe(0);

        expect(
          analysis.products,
        ).toEqual([]);

        expect(
          analysis.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "does not manufacture causal conclusions",
      () => {
        const analysis =
          analyzeMiningProductQuality(
            createAdmission(),
          );

        expect(
          analysis.causalConclusion,
        ).toBe("UNKNOWN");

        expect(
          analysis.observedRelationship,
        ).toContain(
          "does not derive an overall product-quality score",
        );
      },
    );
  },
);