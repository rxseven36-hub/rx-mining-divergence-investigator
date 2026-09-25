import {
  describe,
  expect,
  it,
} from "vitest";

import {
  analyzeMarketTransactions,
} from "../investigation/analyze-market-transactions";

import {
  analyzeCommodityPrice,
} from "../investigation/analyze-commodity-price";

import type {
  RXNormalizedMarketTransactionObservation,
} from "../data/normalization/normalized-market-transaction";

import type {
  RXNormalizedCommodityPriceObservation,
} from "../data/normalization/normalized-commodity-price";

function marketObservation(
  date: string,
  value: number,
): RXNormalizedMarketTransactionObservation {
  return {
    id: `TEST:PRICE:${date}`,
    symbol: "BUMI.JK",
    metric: "PRICE",
    value,

    unit: {
      symbol: "IDR",
      dimension: "PRICE",
      raw: "IDR",
    },

    period: {
      kind: "DATE",
      start: date,
      end: date,
      rawLabel: date,
    },

    evidence: [],
    sourceField: "close",

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

function commodityObservation(
  date: string,
  value: number,
): RXNormalizedCommodityPriceObservation {
  return {
    id:
      `TEST:COMMODITY:COAL:${date}`,

    commodity: "COAL",
    metric: "PRICE",
    value,

    unit: {
      symbol: "USD/metric ton",
      dimension: "PRICE",
      raw: "price_usd_per_ton",
    },

    period: {
      kind: "DATE",
      start: date,
      end: date,
      rawLabel: date,
    },

    evidence: [],
    sourceField:
      "price_usd_per_ton",

    semanticDescription:
      "Test commodity price fact.",

    semantic: {
      state: "KNOWN",
      description:
        "Test commodity price fact.",
      basis:
        "Test fixture.",
    },
  };
}

describe(
  "deterministic presentation time-series contract",
  () => {
    it(
      "exposes market series in chronological order without changing deterministic summary",
      () => {
        const result =
          analyzeMarketTransactions([
            marketObservation(
              "2026-09-03",
              103,
            ),
            marketObservation(
              "2026-09-01",
              100,
            ),
            marketObservation(
              "2026-09-02",
              101,
            ),
          ]);

        expect(
          result.price?.series,
        ).toEqual([
          {
            date: "2026-09-01",
            value: 100,
            unit: "IDR",
          },
          {
            date: "2026-09-02",
            value: 101,
            unit: "IDR",
          },
          {
            date: "2026-09-03",
            value: 103,
            unit: "IDR",
          },
        ]);

        expect(
          result.price?.first.value,
        ).toBe(100);

        expect(
          result.price?.latest.value,
        ).toBe(103);

        expect(
          result.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "exposes commodity price series in chronological order without manufacturing causality",
      () => {
        const result =
          analyzeCommodityPrice([
            commodityObservation(
              "2024-03-01",
              120,
            ),
            commodityObservation(
              "2024-01-01",
              100,
            ),
            commodityObservation(
              "2024-02-01",
              110,
            ),
          ]);

        expect(
          result.price?.series,
        ).toEqual([
          {
            date: "2024-01-01",
            value: 100,
            unit: "USD/metric ton",
          },
          {
            date: "2024-02-01",
            value: 110,
            unit: "USD/metric ton",
          },
          {
            date: "2024-03-01",
            value: 120,
            unit: "USD/metric ton",
          },
        ]);

        expect(
          result.causalConclusion,
        ).toBe("UNKNOWN");

        expect(
          JSON.stringify(result)
            .toLowerCase(),
        ).not.toMatch(
          /bullish|bearish|caused by|anomaly/,
        );
      },
    );
  },
);