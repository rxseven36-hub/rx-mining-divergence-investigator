import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

import {
  admitCommodityPriceEvidence,
} from "../investigation/admit-commodity-price-evidence";

function createRequest(
  capability:
    RXInvestigationDataRequest["capability"] =
      "COMMODITY_PRICE_HISTORY"
): RXInvestigationDataRequest {
  return {
    requestId:
      "RX-COMMODITY-R1",

    requirementId:
      "RX-COMMODITY-E1",

    source:
      "SECTORS",

    capability,

    purpose:
      "Collect commodity price context without asserting causality.",

    status:
      "PLANNED",
  };
}

describe(
  "admitCommodityPriceEvidence",
  () => {
    it(
      "admits aligned commodity price observations as SOURCE_FACT evidence",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:coal:2024",

            retrievedAt:
              "2026-08-30T00:00:00.000Z",

            payload: [
              {
                name:
                  "Coal",

                date:
                  "2024-01-01",

                price_usd_per_ton:
                  125.85,
              },

              {
                name:
                  "Coal",

                date:
                  "2024-02-01",

                price_usd_per_ton:
                  120.5,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "AVAILABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([]);

        expect(
          result.observations
        ).toHaveLength(2);

        expect(
          result.collection.evidence
        ).toHaveLength(2);

        expect(
          result.collection.evidence.every(
            (item) =>
              item.source ===
                "SECTORS" &&
              item.truthClass ===
                "SOURCE_FACT"
          )
        ).toBe(true);

        expect(
          result.collection
            .causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "treats an empty valid response as NO_DATA",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:coal:2024",

            payload: [],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "UNAVAILABLE"
        );

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
      "rejects transport-invalid payload without calling it NO_DATA",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:coal:2024",

            payload: {
              data: [],
            },
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "INVALID"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "INVALID_RESPONSE",
        ]);

        expect(
          result.collection.issues
        ).not.toContain(
          "NO_DATA"
        );
      }
    );

    it(
      "rejects an unsupported commodity as SEMANTICS_UNKNOWN",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:bauxite:2024",

            payload: [
              {
                name:
                  "Bauxite",

                date:
                  "2024-01-01",

                price_usd_per_ton:
                  50,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "SEMANTICS_UNKNOWN",
        ]);

        expect(
          result.observations
        ).toEqual([]);
      }
    );

    it(
      "rejects a commodity mismatch instead of silently filtering it",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:coal:2024",

            payload: [
              {
                name:
                  "Coal",

                date:
                  "2024-01-01",

                price_usd_per_ton:
                  125.85,
              },

              {
                name:
                  "Gold",

                date:
                  "2024-02-01",

                price_usd_per_ton:
                  2000,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

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
      "rejects observations outside the requested YEAR",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:coal:2024",

            payload: [
              {
                name:
                  "Coal",

                date:
                  "2023-12-01",

                price_usd_per_ton:
                  130,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

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
      }
    );

    it(
      "accepts observations inside an eligible multi-year RANGE",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "GOLD",

            requestedPeriod: {
              kind:
                "RANGE",

              start:
                "2023-01-01",

              end:
                "2024-12-31",
            },

            sourceReference:
              "sectors:commodity:gold:2023-2024",

            payload: [
              {
                name:
                  "Gold",

                date:
                  "2023-06-01",

                price_usd_per_ton:
                  1900,
              },

              {
                name:
                  "Gold",

                date:
                  "2024-06-01",

                price_usd_per_ton:
                  2300,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "AVAILABLE"
        );

        expect(
          result.observations
        ).toHaveLength(2);
      }
    );

    it(
      "rejects the wrong investigation capability",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(
                "MINING_HISTORICAL_PERFORMANCE"
              ),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:coal:2024",

            payload: [
              {
                name:
                  "Coal",

                date:
                  "2024-01-01",

                price_usd_per_ton:
                  125.85,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

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
      }
    );

    it(
      "preserves zero price as admissible source evidence",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COPPER",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:copper:2024",

            payload: [
              {
                name:
                  "Copper",

                date:
                  "2024-01-01",

                price_usd_per_ton:
                  0,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.observations[0]
            ?.value
        ).toBe(0);

        expect(
          result.collection.evidence
        ).toHaveLength(1);
      }
    );

    it(
      "never asserts a causal conclusion",
      () => {
        const result =
          admitCommodityPriceEvidence({
            request:
              createRequest(),

            requestedCommodity:
              "COAL",

            requestedPeriod: {
              kind:
                "YEAR",

              year:
                2024,
            },

            sourceReference:
              "sectors:commodity:coal:2024",

            payload: [
              {
                name:
                  "Coal",

                date:
                  "2024-01-01",

                price_usd_per_ton:
                  125.85,
              },
            ],
          });

        expect(
          result.collection
            .causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);