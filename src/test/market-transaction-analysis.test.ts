import {
  describe,
  expect,
  it,
} from "vitest";

import {
  analyzeMarketTransactions,
} from "../investigation/analyze-market-transactions";

import type {
  RXNormalizedMarketTransactionObservation,
} from "../data/normalization/normalized-market-transaction";

function observation(
  metric:
    | "PRICE"
    | "VOLUME"
    | "MARKET_CAP",
  date: string,
  value: number,
  unit: string,
): RXNormalizedMarketTransactionObservation {
  return {
    id: `TEST:${metric}:${date}`,

    symbol: "BUMI.JK",

    metric,

    value,

    unit: {
      symbol: unit,

      dimension:
        metric === "PRICE"
          ? "PRICE"
          : metric === "VOLUME"
            ? "VOLUME"
            : "CURRENCY",

      raw: unit,
    },

    period: {
      kind: "DATE",
      start: date,
      end: date,
      rawLabel: date,
    },

    evidence: [],

    sourceField:
      metric === "PRICE"
        ? "close"
        : metric === "VOLUME"
          ? "volume"
          : "market_cap",

    semanticDescription:
      "Test admitted market fact.",

    semantic: {
      state: "KNOWN",
      description:
        "Test admitted market fact.",
      basis:
        "Test fixture.",
    },
  };
}

describe(
  "deterministic market transaction analysis",
  () => {
    it(
      "describes first-to-latest admitted market facts without causality",
      () => {
        const result =
          analyzeMarketTransactions([
            observation(
              "PRICE",
              "2026-09-01",
              100,
              "IDR",
            ),
            observation(
              "VOLUME",
              "2026-09-01",
              1000,
              "shares",
            ),
            observation(
              "MARKET_CAP",
              "2026-09-01",
              100000,
              "IDR",
            ),
            observation(
              "PRICE",
              "2026-09-05",
              110,
              "IDR",
            ),
            observation(
              "VOLUME",
              "2026-09-05",
              800,
              "shares",
            ),
            observation(
              "MARKET_CAP",
              "2026-09-05",
              110000,
              "IDR",
            ),
          ]);

        expect(result.status).toBe(
          "MARKET_EVIDENCE_AVAILABLE",
        );

        expect(result.symbol).toBe(
          "BUMI.JK",
        );

        expect(result.period).toEqual({
          start: "2026-09-01",
          end: "2026-09-05",
        });

        expect(
          result.price?.absoluteChange,
        ).toBe(10);

        expect(
          result.price?.percentageChange,
        ).toBeCloseTo(10);

        expect(
          result.volume?.absoluteChange,
        ).toBe(-200);

        expect(
          result.marketCap?.absoluteChange,
        ).toBe(10000);

        expect(
          result.causalConclusion,
        ).toBe("UNKNOWN");

        expect(
          result.observedRelationship,
        ).not.toMatch(
          /bullish|bearish|cause|caused|because|anomaly/i,
        );
      },
    );

    it(
      "returns null percentage change when the first value is zero",
      () => {
        const result =
          analyzeMarketTransactions([
            observation(
              "VOLUME",
              "2026-09-01",
              0,
              "shares",
            ),
            observation(
              "VOLUME",
              "2026-09-02",
              100,
              "shares",
            ),
          ]);

        expect(
          result.volume?.absoluteChange,
        ).toBe(100);

        expect(
          result.volume?.percentageChange,
        ).toBeNull();
      },
    );

    it(
      "handles partial admitted metrics without inventing missing facts",
      () => {
        const result =
          analyzeMarketTransactions([
            observation(
              "PRICE",
              "2026-09-01",
              100,
              "IDR",
            ),
            observation(
              "PRICE",
              "2026-09-02",
              105,
              "IDR",
            ),
          ]);

        expect(result.price).not.toBeNull();

        expect(result.volume).toBeNull();

        expect(
          result.marketCap,
        ).toBeNull();

        expect(
          result.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "returns explicit no-evidence state for an empty admitted set",
      () => {
        const result =
          analyzeMarketTransactions([]);

        expect(result).toEqual({
          status: "NO_MARKET_EVIDENCE",

          symbol: null,

          period: {
            start: null,
            end: null,
          },

          price: null,
          volume: null,
          marketCap: null,

          observedRelationship:
            "No admitted market observations are available for deterministic analysis.",

          causalConclusion: "UNKNOWN",
        });
      },
    );
  },
);