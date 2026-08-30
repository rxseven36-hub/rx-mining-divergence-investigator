import {
  describe,
  expect,
  it,
} from "vitest";

import {
  sectorsMarketTransactionItemSchema,
  sectorsMarketTransactionResponseSchema,
} from "../data/schemas/sectors-market-transaction";

describe(
  "Sectors market transaction transport contract",
  () => {
    const officialItem = {
      symbol:
        "BBCA.JK",

      date:
        "2025-05-02",

      close:
        8975,

      volume:
        92219000,

      market_cap:
        1095329638012500,
    };

    it(
      "accepts the official DailyDataItem shape",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse(
            officialItem
          );

        expect(
          result.success
        ).toBe(true);
      }
    );

    it(
      "accepts the official response as a direct array",
      () => {
        const result =
          sectorsMarketTransactionResponseSchema.safeParse([
            officialItem,

            {
              symbol:
                "BBCA.JK",

              date:
                "2025-05-05",

              close:
                9000,

              volume:
                80000000,

              market_cap:
                1098382500000000,
            },
          ]);

        expect(
          result.success
        ).toBe(true);

        if (
          result.success
        ) {
          expect(
            result.data
          ).toHaveLength(2);
        }
      }
    );

    it(
      "accepts an empty response array as transport-valid",
      () => {
        const result =
          sectorsMarketTransactionResponseSchema.safeParse(
            []
          );

        expect(
          result.success
        ).toBe(true);
      }
    );

    it(
      "rejects an object wrapper because the official response is an array",
      () => {
        const result =
          sectorsMarketTransactionResponseSchema.safeParse({
            data: [
              officialItem,
            ],
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing symbol",
      () => {
        const {
          symbol: _symbol,
          ...withoutSymbol
        } = officialItem;

        const result =
          sectorsMarketTransactionItemSchema.safeParse(
            withoutSymbol
          );

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing date",
      () => {
        const {
          date: _date,
          ...withoutDate
        } = officialItem;

        const result =
          sectorsMarketTransactionItemSchema.safeParse(
            withoutDate
          );

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing close",
      () => {
        const {
          close: _close,
          ...withoutClose
        } = officialItem;

        const result =
          sectorsMarketTransactionItemSchema.safeParse(
            withoutClose
          );

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing volume",
      () => {
        const {
          volume: _volume,
          ...withoutVolume
        } = officialItem;

        const result =
          sectorsMarketTransactionItemSchema.safeParse(
            withoutVolume
          );

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing market cap",
      () => {
        const {
          market_cap:
            _marketCap,
          ...withoutMarketCap
        } = officialItem;

        const result =
          sectorsMarketTransactionItemSchema.safeParse(
            withoutMarketCap
          );

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects null required values",
      () => {
        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,
            symbol: null,
          }).success
        ).toBe(false);

        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,
            date: null,
          }).success
        ).toBe(false);

        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,
            close: null,
          }).success
        ).toBe(false);

        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,
            volume: null,
          }).success
        ).toBe(false);

        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,
            market_cap: null,
          }).success
        ).toBe(false);
      }
    );

    it(
      "rejects a non-date string for date",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            date:
              "not-a-date",
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a datetime because the official field format is date",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            date:
              "2025-05-02T12:00:00Z",
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects non-integer close",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            close:
              8975.5,
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects non-integer volume",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            volume:
              92219000.5,
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects non-integer market cap",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            market_cap:
              1095329638012500.5,
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects numeric strings for integer fields",
      () => {
        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            close:
              "8975",
          }).success
        ).toBe(false);

        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            volume:
              "92219000",
          }).success
        ).toBe(false);

        expect(
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            market_cap:
              "1095329638012500",
          }).success
        ).toBe(false);
      }
    );

    it(
      "preserves zero numeric values instead of treating them as missing",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse({
            symbol:
              "BBCA.JK",

            date:
              "2025-05-02",

            close:
              0,

            volume:
              0,

            market_cap:
              0,
          });

        expect(
          result.success
        ).toBe(true);

        if (
          result.success
        ) {
          expect(
            result.data.close
          ).toBe(0);

          expect(
            result.data.volume
          ).toBe(0);

          expect(
            result.data.market_cap
          ).toBe(0);
        }
      }
    );

    it(
      "preserves unknown item fields for forward compatibility",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.safeParse({
            ...officialItem,

            future_field:
              "preserved",
          });

        expect(
          result.success
        ).toBe(true);

        if (
          result.success
        ) {
          expect(
            result.data.future_field
          ).toBe(
            "preserved"
          );
        }
      }
    );

    it(
      "does not invent OHLC fields absent from the official transport contract",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.parse(
            officialItem
          );

        expect(
          "open" in result
        ).toBe(false);

        expect(
          "high" in result
        ).toBe(false);

        expect(
          "low" in result
        ).toBe(false);
      }
    );

    it(
      "does not invent currency or unit transport fields",
      () => {
        const result =
          sectorsMarketTransactionItemSchema.parse(
            officialItem
          );

        expect(
          "currency" in result
        ).toBe(false);

        expect(
          "unit" in result
        ).toBe(false);
      }
    );
  }
);