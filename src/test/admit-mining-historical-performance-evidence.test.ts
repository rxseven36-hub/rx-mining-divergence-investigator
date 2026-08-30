import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

import {
  admitMiningHistoricalPerformanceEvidence,
} from "../investigation/admit-mining-historical-performance-evidence";

const request:
  RXInvestigationDataRequest = {
  requestId:
    "RX-TEST-R2",

  requirementId:
    "RX-TEST-E2",

  source:
    "SECTORS",

  capability:
    "MINING_HISTORICAL_PERFORMANCE",

  purpose:
    "Collect comparable historical production and sales evidence.",

  status:
    "PLANNED",
};

const liveShapedPayload = {
  year: 2024,

  available_years: [
    2024,
    2023,
  ],

  data: [
    {
      year: 2024,

      commodity_type:
        "Coal",

      commodity_sub_type:
        "Thermal Coal",

      commodity_stats: {
        unit:
          "Mt",

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

          total_reserves_Mt:
            819,

          total_resources_Mt:
            4374,
        },

        products: [],
      },
    },
  ],
};

describe(
  "admitMiningHistoricalPerformanceEvidence",
  () => {
    it(
      "admits validated production and sales source evidence",
      () => {
        const result =
          admitMiningHistoricalPerformanceEvidence({
            request,

            companyId:
              "company-internal-001",

            sourceReference:
              "sectors:mining-performance:aadi:2024",

            payload:
              liveShapedPayload,

            retrievedAt:
              "2026-08-30T00:00:00.000Z",
          });

        expect(
          result.status
        ).toBe("ADMITTED");

        expect(
          result.collection.status
        ).toBe("AVAILABLE");

        expect(
          result.collection.issues
        ).toEqual([]);

        expect(
          result.collection.evidence
        ).toHaveLength(2);

        expect(
          result.collection.evidence.every(
            (item) =>
              item.truthClass ===
              "SOURCE_FACT"
          )
        ).toBe(true);

        expect(
          result.collection
            .causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "preserves production and sales values from the validated live-shaped contract",
      () => {
        const result =
          admitMiningHistoricalPerformanceEvidence({
            request,

            companyId:
              "company-internal-001",

            sourceReference:
              "sectors:mining-performance:aadi:2024",

            payload:
              liveShapedPayload,
          });

        const production =
          result.observations.find(
            (observation) =>
              observation.metric ===
              "PRODUCTION"
          );

        const sales =
          result.observations.find(
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
          production?.semantic.state
        ).toBe("KNOWN");

        expect(
          sales?.semantic.state
        ).toBe("KNOWN");
      }
    );

    it(
      "does not admit nested resource and reserve fields as active historical evidence",
      () => {
        const result =
          admitMiningHistoricalPerformanceEvidence({
            request,

            companyId:
              "company-internal-001",

            sourceReference:
              "sectors:mining-performance:aadi:2024",

            payload:
              liveShapedPayload,
          });

        const admittedMetrics =
          result.collection.evidence.map(
            (item) =>
              item.description
          );

        expect(
          admittedMetrics.some(
            (description) =>
              description.includes(
                "RESOURCE"
              )
          )
        ).toBe(false);

        expect(
          admittedMetrics.some(
            (description) =>
              description.includes(
                "RESERVE"
              )
          )
        ).toBe(false);
      }
    );

    it(
      "rejects transport-invalid payloads instead of manufacturing evidence",
      () => {
        const result =
          admitMiningHistoricalPerformanceEvidence({
            request,

            companyId:
              "company-internal-001",

            sourceReference:
              "sectors:mining-performance:aadi:2024",

            payload: {
              data:
                "not-an-array",
            },
          });

        expect(
          result.status
        ).toBe("REJECTED");

        expect(
          result.collection.status
        ).toBe("INVALID");

        expect(
          result.collection.evidence
        ).toEqual([]);

        expect(
          result.collection.issues
        ).toEqual([
          "INVALID_RESPONSE",
        ]);
      }
    );

    it(
      "treats a valid empty response as unavailable rather than invalid",
      () => {
        const result =
          admitMiningHistoricalPerformanceEvidence({
            request,

            companyId:
              "company-internal-001",

            sourceReference:
              "sectors:mining-performance:aadi:2024",

            payload: {
              year: 2024,
              available_years: [],
              data: [],
            },
          });

        expect(
          result.status
        ).toBe("REJECTED");

        expect(
          result.collection.status
        ).toBe("UNAVAILABLE");

        expect(
          result.collection.issues
        ).toEqual([
          "NO_DATA",
        ]);

        expect(
          result.collection.evidence
        ).toEqual([]);
      }
    );

    it(
      "rejects a capability mismatch before admitting evidence",
      () => {
        const wrongRequest:
          RXInvestigationDataRequest = {
          ...request,

          capability:
            "COMMODITY_PRICE_HISTORY",
        };

        const result =
          admitMiningHistoricalPerformanceEvidence({
            request:
              wrongRequest,

            companyId:
              "company-internal-001",

            sourceReference:
              "sectors:mining-performance:aadi:2024",

            payload:
              liveShapedPayload,
          });

        expect(
          result.status
        ).toBe("REJECTED");

        expect(
          result.collection.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);

        expect(
          result.collection.evidence
        ).toEqual([]);
      }
    );

    it(
      "keeps causal conclusion UNKNOWN after evidence admission",
      () => {
        const result =
          admitMiningHistoricalPerformanceEvidence({
            request,

            companyId:
              "company-internal-001",

            sourceReference:
              "sectors:mining-performance:aadi:2024",

            payload:
              liveShapedPayload,
          });

        expect(
          result.collection
            .causalConclusion
        ).toBe("UNKNOWN");
      }
    );
  }
);