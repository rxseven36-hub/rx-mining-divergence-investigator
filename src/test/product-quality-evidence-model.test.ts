import {
  describe,
  expect,
  it,
} from "vitest";

import {
  normalizeMiningProductQuality,
} from "../data/normalization/normalize-mining-product-quality";

import {
  admitMiningProductQualityEvidence,
} from "../investigation/admit-mining-product-quality-evidence";

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
      "REQ-PQ-1",

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

describe(
  "product-quality evidence model",
  () => {
    it(
      "normalizes explicit product-quality ranges without deriving midpoint",
      () => {
        const observations =
          normalizeMiningProductQuality({
            companyId:
              "rx-company-aadi",

            source:
              "SECTORS_TEST",

            row: {
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
                      "Envirocoal -North Tutupan",

                    calorific_value_kcal: {
                      min:
                        4843,

                      max:
                        4843,
                    },

                    total_moisture_pct: {
                      min:
                        27.1,

                      max:
                        27.1,
                    },

                    ash_content_adb: {
                      min:
                        2.1,

                      max:
                        2.1,
                    },

                    total_sulphur_adb: {
                      min:
                        0.1,

                      max:
                        0.1,
                    },

                    volatile_matter_adb: {
                      min:
                        39.7,

                      max:
                        39.7,
                    },

                    fixed_carbon_adb:
                      null,
                  },
                ],
              },
            },
          });

        expect(
          observations,
        ).toHaveLength(5);

        const calorific =
          observations.find(
            (item) =>
              item.metric ===
              "CALORIFIC_VALUE",
          );

        expect(
          calorific,
        ).toEqual(
          expect.objectContaining({
            companyId:
              "rx-company-aadi",

            productName:
              "Envirocoal -North Tutupan",

            metric:
              "CALORIFIC_VALUE",

            min:
              4843,

            max:
              4843,

            sourcePerformanceYear:
              2024,

            unit: {
              symbol:
                "kcal/kg",

              dimension:
                "ENERGY_PER_MASS",
            },
          }),
        );

        expect(
          Object.prototype.hasOwnProperty.call(
            calorific ?? {},
            "value",
          ),
        ).toBe(false);
      },
    );

    it(
      "preserves ARB and ADB as different metrics",
      () => {
        const observations =
          normalizeMiningProductQuality({
            companyId:
              "rx-company-test",

            source:
              "SECTORS_TEST",

            row: {
              year:
                2024,

              commodity_stats: {
                products: [
                  {
                    product_name:
                      "Coal Product A",

                    ash_content_arb: {
                      min:
                        4,

                      max:
                        6,
                    },

                    ash_content_adb: {
                      min:
                        3,

                      max:
                        5,
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
                  },
                ],
              },
            },
          });

        expect(
          observations.map(
            (item) => item.metric,
          ),
        ).toEqual([
          "ASH_ARB",
          "TOTAL_SULPHUR_ARB",
          "ASH_ADB",
          "TOTAL_SULPHUR_ADB",
        ]);
      },
    );

    it(
      "preserves one-sided source ranges and does not invent missing bounds",
      () => {
        const observations =
          normalizeMiningProductQuality({
            companyId:
              "rx-company-test",

            source:
              "SECTORS_TEST",

            row: {
              commodity_stats: {
                products: [
                  {
                    product_name:
                      "Coal Product B",

                    total_moisture_pct: {
                      min:
                        20,

                      max:
                        null,
                    },

                    fixed_carbon_adb: {
                      min:
                        null,

                      max:
                        45,
                    },

                    volatile_matter_adb: {
                      min:
                        null,

                      max:
                        null,
                    },
                  },
                ],
              },
            },
          });

        expect(
          observations,
        ).toHaveLength(2);

        expect(
          observations[0],
        ).toEqual(
          expect.objectContaining({
            metric:
              "TOTAL_MOISTURE",

            min:
              20,

            max:
              null,
          }),
        );

        expect(
          observations[1],
        ).toEqual(
          expect.objectContaining({
            metric:
              "FIXED_CARBON_ADB",

            min:
              null,

            max:
              45,
          }),
        );
      },
    );

    it(
      "keeps different products as separate evidence",
      () => {
        const observations =
          normalizeMiningProductQuality({
            companyId:
              "rx-company-test",

            source:
              "SECTORS_TEST",

            row: {
              year:
                2024,

              commodity_stats: {
                products: [
                  {
                    product_name:
                      "Product A",

                    calorific_value_kcal: {
                      min:
                        4000,

                      max:
                        4200,
                    },
                  },
                  {
                    product_name:
                      "Product B",

                    calorific_value_kcal: {
                      min:
                        5000,

                      max:
                        5200,
                    },
                  },
                ],
              },
            },
          });

        expect(
          observations,
        ).toHaveLength(2);

        expect(
          observations.map(
            (item) =>
              item.productName,
          ),
        ).toEqual([
          "Product A",
          "Product B",
        ]);

        expect(
          observations[0]?.id,
        ).not.toBe(
          observations[1]?.id,
        );
      },
    );

    it(
      "admits only dedicated product-quality observations",
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
              year:
                2024,

              data: [
                {
                  year:
                    2024,

                  commodity_type:
                    "Coal",

                  commodity_stats: {
                    production_volume:
                      50,

                    sales_volume:
                      48,

                    overburden_removal_volume:
                      200,

                    strip_ratio:
                      4.2,

                    resources_reserves: {
                      measurement_year:
                        2024,

                      total_resources_Mt:
                        500,
                    },

                    products: [
                      {
                        product_name:
                          "Coal Product A",

                        calorific_value_kcal: {
                          min:
                            4800,

                          max:
                            5000,
                        },

                        total_moisture_pct: {
                          min:
                            25,

                          max:
                            28,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          });

        expect(
          admission.status,
        ).toBe("ADMITTED");

        if (
          admission.status !==
            "ADMITTED"
        ) {
          throw new Error(
            "Expected product-quality admission",
          );
        }

        expect(
          admission.admittedObservations,
        ).toHaveLength(2);

        expect(
          admission.admittedObservations.every(
            (item) =>
              item.productName ===
                "Coal Product A",
          ),
        ).toBe(true);

        expect(
          admission.collection.status,
        ).toBe("AVAILABLE");

        expect(
          admission.collection.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "rejects payload with products but no admissible quality values",
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
                          "Coal Product A",

                        calorific_value_kcal:
                          null,

                        total_moisture_pct: {
                          min:
                            null,

                          max:
                            null,
                        },
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

        expect(
          admission.collection.issues,
        ).toContain(
          "SEMANTICS_UNKNOWN",
        );
      },
    );

    it(
      "rejects wrong capability",
      () => {
        const admission =
          admitMiningProductQualityEvidence({
            request:
              createRequest(
                "MINING_OPERATIONAL_CONTEXT",
              ),

            companyId:
              "rx-company-test",

            sourceReference:
              "SECTORS_TEST",

            payload: {
              data: [],
            },
          });

        expect(
          admission.status,
        ).toBe("REJECTED");

        expect(
          admission.collection.issues,
        ).toContain(
          "RELATIONSHIP_INVALID",
        );
      },
    );

    it(
      "rejects invalid transport payload",
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
              data:
                "NOT_AN_ARRAY",
            },
          });

        expect(
          admission.status,
        ).toBe("REJECTED");

        expect(
          admission.collection.status,
        ).toBe("INVALID");

        expect(
          admission.collection.issues,
        ).toContain(
          "INVALID_RESPONSE",
        );
      },
    );
  },
);