import {
  describe,
  expect,
  it,
} from "vitest";

import {
  analyzeCommodityPrice,
} from "../investigation/analyze-commodity-price";

import type {
  RXNormalizedCommodityPriceObservation,
} from "../data/normalization/normalized-commodity-price";

function observation(
  date: string,
  value: number,
): RXNormalizedCommodityPriceObservation {
  return {
    id:
      `SECTORS:COMMODITY_PRICE:COAL:${date}`,

    commodity:
      "COAL",

    metric:
      "PRICE",

    value,

    unit: {
      symbol:
        "USD/metric ton",

      dimension:
        "PRICE",

      raw:
        "price_usd_per_ton",
    },

    period: {
      kind:
        "DATE",

      start:
        date,

      end:
        date,

      rawLabel:
        date,
    },

    evidence: [],

    sourceField:
      "price_usd_per_ton",

    semanticDescription:
      "Commodity market price in USD per metric ton.",

    semantic: {
      state:
        "KNOWN",

      description:
        "Commodity market price in USD per metric ton.",

      basis:
        "Official Sectors CommodityPriceItem field price_usd_per_ton.",
    },
  };
}

describe(
  "analyzeCommodityPrice",
  () => {
    it(
      "describes first-to-latest admitted commodity price movement deterministically",
      () => {
        const result =
          analyzeCommodityPrice([
            observation(
              "2024-03-01",
              120,
            ),
            observation(
              "2024-01-01",
              100,
            ),
            observation(
              "2024-02-01",
              110,
            ),
          ]);

        expect(result.status).toBe(
          "COMMODITY_PRICE_EVIDENCE_AVAILABLE",
        );

        expect(result.commodity).toBe(
          "COAL",
        );

        expect(result.period).toEqual({
          start:
            "2024-01-01",
          end:
            "2024-03-01",
        });

        expect(result.price).toEqual({
          first: {
            date:
              "2024-01-01",
            value:
              100,
            unit:
              "USD/metric ton",
          },

          latest: {
            date:
              "2024-03-01",
            value:
              120,
            unit:
              "USD/metric ton",
          },

          absoluteChange:
            20,

          percentageChange:
            20,

          observationCount:
            3,
        });

        expect(
          result.observedRelationship,
        ).toContain(
          "COAL commodity price changed from 100",
        );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "preserves a zero baseline without manufacturing a percentage change",
      () => {
        const result =
          analyzeCommodityPrice([
            observation(
              "2024-01-01",
              0,
            ),
            observation(
              "2024-02-01",
              25,
            ),
          ]);

        expect(
          result.price
            ?.absoluteChange,
        ).toBe(
          25,
        );

        expect(
          result.price
            ?.percentageChange,
        ).toBeNull();

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "describes a single admitted point without inventing movement",
      () => {
        const result =
          analyzeCommodityPrice([
            observation(
              "2024-06-01",
              125.85,
            ),
          ]);

        expect(
          result.price
            ?.observationCount,
        ).toBe(
          1,
        );

        expect(
          result.price
            ?.absoluteChange,
        ).toBe(
          0,
        );

        expect(
          result.observedRelationship,
        ).toContain(
          "one admitted commodity-price observation",
        );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "returns explicit no-evidence state for an empty admitted set",
      () => {
        const result =
          analyzeCommodityPrice([]);

        expect(result.status).toBe(
          "NO_COMMODITY_PRICE_EVIDENCE",
        );

        expect(result.commodity).toBeNull();

        expect(result.price).toBeNull();

        expect(result.period).toEqual({
          start:
            null,
          end:
            null,
        });

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "does not contain causal or directional market conclusions",
      () => {
        const result =
          analyzeCommodityPrice([
            observation(
              "2024-01-01",
              100,
            ),
            observation(
              "2024-02-01",
              140,
            ),
          ]);

        const serialized =
          JSON.stringify(result)
            .toLowerCase();

        expect(serialized).not.toContain(
          "bullish",
        );

        expect(serialized).not.toContain(
          "bearish",
        );

        expect(serialized).not.toContain(
          "anomaly",
        );

        expect(serialized).not.toContain(
          "caused by",
        );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );
  },
);