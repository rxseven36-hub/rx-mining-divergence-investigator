import {
  describe,
  expect,
  it,
} from "vitest";

import {
  admitMiningObStripEvidence,
} from "../investigation/admit-mining-ob-strip-evidence";

import {
  analyzeMiningObStrip,
} from "../investigation/analyze-mining-ob-strip";

const request = {
  requestId:
    "V2.4B-R1",

  requirementId:
    "V2.4B-E1",

  source:
    "SECTORS" as const,

  capability:
    "MINING_HISTORICAL_PERFORMANCE" as const,

  purpose:
    "Collect admitted overburden and strip-ratio evidence.",

  status:
    "PLANNED" as const,
};

const payload = {
  year:
    2024,

  data: [
    {
      year:
        2024,

      commodity_type:
        "Coal",

      commodity_sub_type:
        "Thermal Coal",

      commodity_stats: {
        unit:
          "Mt",

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
    },
  ],
};

describe(
  "Investigator V2.4B OB / Strip evidence and analysis",
  () => {
    it(
      "admits only OB and strip observations",
      () => {
        const result =
          admitMiningObStripEvidence({
            request,

            companyId:
              "BYAN",

            sourceReference:
              "LOCAL_V2_4B_FIXTURE",

            payload,
          });

        expect(
          result.status,
        ).toBe("ADMITTED");

        if (
          result.status !==
          "ADMITTED"
        ) {
          throw new Error(
            "Expected admitted evidence"
          );
        }

        expect(
          result.admittedObservations.map(
            (observation) =>
              observation.metric
          )
        ).toEqual([
          "OVERBURDEN",
          "STRIP_RATIO",
        ]);

        expect(
          result.admittedObservations.some(
            (observation) =>
              observation.metric ===
                "PRODUCTION" ||
              observation.metric ===
                "SALES" ||
              observation.metric ===
                "RESOURCE" ||
              observation.metric ===
                "RESERVE"
          )
        ).toBe(false);

        expect(
          result.collection.evidence
        ).toHaveLength(2);
      }
    );

    it(
      "keeps production-sales admission isolated",
      async () => {
        const {
          admitMiningHistoricalPerformanceEvidence,
        } = await import(
          "../investigation/admit-mining-historical-performance-evidence"
        );

        const result =
          admitMiningHistoricalPerformanceEvidence({
            request,

            companyId:
              "BYAN",

            sourceReference:
              "LOCAL_V2_4B_FIXTURE",

            payload,
          });

        expect(
          result.status,
        ).toBe("ADMITTED");

        if (
          result.status !==
          "ADMITTED"
        ) {
          throw new Error(
            "Expected historical admission"
          );
        }

        expect(
          result.admittedObservations.map(
            (observation) =>
              observation.metric
          )
        ).toEqual([
          "PRODUCTION",
          "SALES",
        ]);
      }
    );

    it(
      "produces deterministic OB / Strip analysis with unknown causality",
      () => {
        const admission =
          admitMiningObStripEvidence({
            request,

            companyId:
              "BYAN",

            sourceReference:
              "LOCAL_V2_4B_FIXTURE",

            payload,
          });

        const result =
          analyzeMiningObStrip(
            admission
          );

        expect(
          result.status
        ).toBe("ANALYZED");

        expect(
          result.companyId
        ).toBe("BYAN");

        expect(
          result.periodYear
        ).toBe(2024);

        expect(
          result.availability
        ).toBe(
          "BOTH_AVAILABLE"
        );

        expect(
          result.overburden?.value
        ).toBe(214.18);

        expect(
          result.overburden?.unit.dimension
        ).toBe("UNKNOWN");

        expect(
          result.stripRatio?.value
        ).toBe(4.51);

        expect(
          result.stripRatio?.unit.dimension
        ).toBe("RATIO");

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "does not invent a missing strip ratio",
      () => {
        const missingStrip = {
          ...payload,

          data: [
            {
              ...payload.data[0],

              commodity_stats: {
                ...payload.data[0]
                  .commodity_stats,

                strip_ratio:
                  null,
              },
            },
          ],
        };

        const admission =
          admitMiningObStripEvidence({
            request,

            companyId:
              "BYAN",

            sourceReference:
              "LOCAL_V2_4B_FIXTURE",

            payload:
              missingStrip,
          });

        const result =
          analyzeMiningObStrip(
            admission
          );

        expect(
          result.status
        ).toBe("ANALYZED");

        expect(
          result.availability
        ).toBe(
          "OVERBURDEN_ONLY"
        );

        expect(
          result.stripRatio
        ).toBeNull();

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "rejects the wrong capability",
      () => {
        const result =
          admitMiningObStripEvidence({
            request: {
              ...request,

              capability:
                "COMMODITY_PRICE_HISTORY",
            },

            companyId:
              "BYAN",

            sourceReference:
              "LOCAL_V2_4B_FIXTURE",

            payload,
          });

        expect(
          result.status
        ).toBe("REJECTED");

        expect(
          result.admittedObservations
        ).toEqual([]);
      }
    );
  }
);