import {
  describe,
  expect,
  it,
} from "vitest";

import {
  sectorsCommodityPriceItemSchema,
  sectorsCommodityPriceResponseSchema,
} from "../data/schemas/sectors-commodity-price";

describe(
  "Sectors commodity price transport contract",
  () => {
    it(
      "accepts the official CommodityPriceItem shape",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          });

        expect(
          result.success
        ).toBe(true);
      }
    );

    it(
      "accepts the official response as a direct array",
      () => {
        const result =
          sectorsCommodityPriceResponseSchema.safeParse([
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
          sectorsCommodityPriceResponseSchema.safeParse(
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
          sectorsCommodityPriceResponseSchema.safeParse({
            data: [
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
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing commodity name",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.safeParse({
            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing date",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            price_usd_per_ton:
              125.85,
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing price",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              "2024-01-01",
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects null required values",
      () => {
        expect(
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              null,

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          }).success
        ).toBe(false);

        expect(
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              null,

            price_usd_per_ton:
              125.85,
          }).success
        ).toBe(false);

        expect(
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              null,
          }).success
        ).toBe(false);
      }
    );

    it(
      "rejects a non-date string for date",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              "not-a-date",

            price_usd_per_ton:
              125.85,
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
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              "2024-01-01T12:00:00Z",

            price_usd_per_ton:
              125.85,
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a non-number price",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              "125.85",
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "preserves unknown item fields for forward compatibility",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.safeParse({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,

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
      "does not invent currency or unit transport fields",
      () => {
        const result =
          sectorsCommodityPriceItemSchema.parse({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          });

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