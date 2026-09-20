import {
  describe,
  expect,
  it,
} from "vitest";

import {
  admitMiningResourcesReservesEvidence,
} from "../investigation/admit-mining-resources-reserves-evidence";

import {
  analyzeMiningResourcesReserves,
} from "../investigation/analyze-mining-resources-reserves";

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
      "REQ-RR-1",

    requirementId:
      "REQ-GEOLOGY",

    capability,

    status:
      "PLANNED",
  } as RXInvestigationDataRequest;
}

describe(
  "resources/reserves evidence admission and analysis",
  () => {
    it(
      "admits explicit live geological totals and preserves geological year",
      () => {
        const admission =
          admitMiningResourcesReservesEvidence({
            request:
              createRequest(),

            companyId:
              "rx-company-byan",

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
                    resources_reserves: {
                      measurement_year:
                        2022,

                      total_resources_Mt:
                        266.55,

                      total_reserves_Mt:
                        240.946,
                    },
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
            "Expected geological admission",
          );
        }

        expect(
          admission.admittedObservations,
        ).toHaveLength(2);

        expect(
          admission.admittedObservations.every(
            (observation) =>
              observation.measurementYear ===
                2022 &&
              observation.sourcePerformanceYear ===
                2024,
          ),
        ).toBe(true);

        const analysis =
          analyzeMiningResourcesReserves(
            admission,
          );

        expect(
          analysis.availability,
        ).toBe(
          "BOTH_TOTALS_AVAILABLE",
        );

        expect(
          analysis.totalResource?.value,
        ).toBe(266.55);

        expect(
          analysis.totalReserve?.value,
        ).toBe(240.946);

        expect(
          analysis.measurementYear,
        ).toBe(2022);

        expect(
          analysis.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "does not admit production sales or OB strip observations",
      () => {
        const admission =
          admitMiningResourcesReservesEvidence({
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

                  commodity_stats: {
                    production_volume:
                      50,

                    sales_volume:
                      55,

                    overburden_removal_volume:
                      200,

                    strip_ratio:
                      4.5,

                    resources_reserves: {
                      measurement_year:
                        2023,

                      total_resources_Mt:
                        500,
                    },
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
            "Expected geological admission",
          );
        }

        expect(
          admission.admittedObservations,
        ).toHaveLength(1);

        expect(
          admission.admittedObservations[0]
            ?.metric,
        ).toBe(
          "TOTAL_RESOURCE",
        );
      },
    );

    it(
      "rejects payload with no admissible geological values",
      () => {
        const admission =
          admitMiningResourcesReservesEvidence({
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

                  commodity_stats: {
                    resources_reserves: {
                      measurement_year:
                        2024,

                      total_resources_Mt:
                        null,

                      total_reserves_Mt:
                        null,
                    },
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
      "describes components without deriving missing totals",
      () => {
        const admission =
          admitMiningResourcesReservesEvidence({
            request:
              createRequest(),

            companyId:
              "rx-company-test",

            sourceReference:
              "SECTORS_TEST",

            payload: {
              data: [
                {
                  commodity_type:
                    "Coal",

                  commodity_stats: {
                    resources_reserves: {
                      measurement_year:
                        2024,

                      measured_resources_Mt:
                        10,

                      indicated_resources_Mt:
                        20,

                      proven_reserves_Mt:
                        5,
                    },
                  },
                },
              ],
            },
          });

        const analysis =
          analyzeMiningResourcesReserves(
            admission,
          );

        expect(
          analysis.availability,
        ).toBe(
          "COMPONENTS_ONLY",
        );

        expect(
          analysis.totalResource,
        ).toBeNull();

        expect(
          analysis.totalReserve,
        ).toBeNull();

        expect(
          analysis.resourceComponents,
        ).toHaveLength(2);

        expect(
          analysis.reserveComponents,
        ).toHaveLength(1);
      },
    );

    it(
      "rejects the wrong capability",
      () => {
        const admission =
          admitMiningResourcesReservesEvidence({
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
  },
);