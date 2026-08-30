import {
  describe,
  expect,
  it,
} from "vitest";

import {
  normalizeMarketTransaction,
} from "../data/normalization/normalize-market-transaction";

describe(
  "normalizeMarketTransaction",
  () => {
    const officialItem = {
      symbol:
        "AADI.JK",

      date:
        "2024-12-20",

      close:
        9050,

      volume:
        12500000,

      market_cap:
        70500000000000,
    };

    it(
      "normalizes one DailyDataItem into three independent market observations",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        expect(
          result
        ).toHaveLength(3);

        expect(
          result.map(
            (observation) =>
              observation.metric
          )
        ).toEqual([
          "PRICE",
          "VOLUME",
          "MARKET_CAP",
        ]);
      }
    );

    it(
      "preserves the source symbol without manufacturing an RX companyId",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        for (
          const observation of result
        ) {
          expect(
            observation.symbol
          ).toBe(
            "AADI.JK"
          );

          expect(
            "companyId" in observation
          ).toBe(false);
        }
      }
    );

    it(
      "does not manufacture a mining commodity relationship",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        for (
          const observation of result
        ) {
          expect(
            "commodity" in observation
          ).toBe(false);
        }
      }
    );

    it(
      "normalizes close as PRICE in IDR",
      () => {
        const [price] =
          normalizeMarketTransaction(
            officialItem
          );

        expect(
          price
        ).toMatchObject({
          metric:
            "PRICE",

          value:
            9050,

          sourceField:
            "close",

          unit: {
            symbol:
              "IDR",

            dimension:
              "PRICE",

            raw:
              "close",
          },
        });
      }
    );

    it(
      "normalizes volume as VOLUME in shares",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        const volume =
          result.find(
            (observation) =>
              observation.metric ===
              "VOLUME"
          );

        expect(
          volume
        ).toMatchObject({
          metric:
            "VOLUME",

          value:
            12500000,

          sourceField:
            "volume",

          unit: {
            symbol:
              "shares",

            dimension:
              "VOLUME",

            raw:
              "volume",
          },
        });
      }
    );

    it(
      "normalizes market cap as MARKET_CAP in IDR",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        const marketCap =
          result.find(
            (observation) =>
              observation.metric ===
              "MARKET_CAP"
          );

        expect(
          marketCap
        ).toMatchObject({
          metric:
            "MARKET_CAP",

          value:
            70500000000000,

          sourceField:
            "market_cap",

          unit: {
            symbol:
              "IDR",

            dimension:
              "CURRENCY",

            raw:
              "market_cap",
          },
        });
      }
    );

    it(
      "normalizes the trading date as a DATE period without inventing a reporting year",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        for (
          const observation of result
        ) {
          expect(
            observation.period
          ).toEqual({
            kind:
              "DATE",

            start:
              "2024-12-20",

            end:
              "2024-12-20",

            rawLabel:
              "2024-12-20",
          });

          expect(
            observation.period.year
          ).toBeUndefined();

          expect(
            observation.period.measurementYear
          ).toBeUndefined();
        }
      }
    );

    it(
      "creates SOURCE_FACT evidence from Sectors",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem,
            {
              sourceReference:
                "sectors:daily:AADI:2024-12-20",

              retrievedAt:
                "2026-08-30T03:00:00.000Z",
            }
          );

        for (
          const observation of result
        ) {
          expect(
            observation.evidence
          ).toHaveLength(1);

          expect(
            observation.evidence[0]
          ).toMatchObject({
            provider:
              "SECTORS",

            source:
              "sectors:daily:AADI:2024-12-20",

            retrievedAt:
              "2026-08-30T03:00:00.000Z",

            truthClass:
              "SOURCE_FACT",
          });
        }
      }
    );

    it(
      "marks all official market field semantics as KNOWN",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        for (
          const observation of result
        ) {
          expect(
            observation.semantic.state
          ).toBe(
            "KNOWN"
          );
        }
      }
    );

    it(
      "preserves zero values as real source values",
      () => {
        const result =
          normalizeMarketTransaction({
            symbol:
              "AADI.JK",

            date:
              "2024-12-20",

            close:
              0,

            volume:
              0,

            market_cap:
              0,
          });

        expect(
          result.map(
            (observation) =>
              observation.value
          )
        ).toEqual([
          0,
          0,
          0,
        ]);
      }
    );

    it(
      "creates deterministic metric-specific observation identifiers",
      () => {
        const first =
          normalizeMarketTransaction(
            officialItem
          );

        const second =
          normalizeMarketTransaction({
            ...officialItem,

            close:
              9999,

            volume:
              999,

            market_cap:
              999999,
          });

        expect(
          first.map(
            (observation) =>
              observation.id
          )
        ).toEqual([
          "SECTORS:MARKET_TRANSACTION:AADI.JK:2024-12-20:PRICE",
          "SECTORS:MARKET_TRANSACTION:AADI.JK:2024-12-20:VOLUME",
          "SECTORS:MARKET_TRANSACTION:AADI.JK:2024-12-20:MARKET_CAP",
        ]);

        expect(
          second.map(
            (observation) =>
              observation.id
          )
        ).toEqual(
          first.map(
            (observation) =>
              observation.id
          )
        );
      }
    );

    it(
      "does not infer market direction, anomaly, or causal meaning",
      () => {
        const result =
          normalizeMarketTransaction(
            officialItem
          );

        for (
          const observation of result
        ) {
          const description =
            observation
              .semanticDescription
              .toLowerCase();

          expect(
            description
          ).not.toContain(
            "bullish"
          );

          expect(
            description
          ).not.toContain(
            "bearish"
          );

          expect(
            description
          ).not.toContain(
            "anomaly"
          );

          expect(
            description
          ).not.toContain(
            "cause"
          );
        }
      }
    );
  }
);