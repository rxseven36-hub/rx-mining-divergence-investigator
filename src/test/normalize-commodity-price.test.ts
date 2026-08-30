import {
  describe,
  expect,
  it,
} from "vitest";

import {
  normalizeCommodityPrice,
} from "../data/normalization/normalize-commodity-price";

describe(
  "normalizeCommodityPrice",
  () => {
    it(
      "normalizes an official Coal price item into a commodity market observation",
      () => {
        const result =
          normalizeCommodityPrice(
            {
              name:
                "Coal",

              date:
                "2024-01-01",

              price_usd_per_ton:
                125.85,
            },
            {
              sourceReference:
                "sectors:commodity:coal",

              retrievedAt:
                "2026-08-30T00:00:00.000Z",
            }
          );

        expect(
          result
        ).not.toBeNull();

        expect(
          result?.commodity
        ).toBe("COAL");

        expect(
          result?.metric
        ).toBe("PRICE");

        expect(
          result?.value
        ).toBe(125.85);
      }
    );

    it(
      "does not attach a companyId to a market commodity price",
      () => {
        const result =
          normalizeCommodityPrice({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          });

        expect(
          result
        ).not.toBeNull();

        expect(
          "companyId" in (result ?? {})
        ).toBe(false);
      }
    );

    it(
      "normalizes the official price semantics as USD per metric ton",
      () => {
        const result =
          normalizeCommodityPrice({
            name:
              "Gold",

            date:
              "2024-02-01",

            price_usd_per_ton:
              2000,
          });

        expect(
          result?.unit
        ).toEqual({
          symbol:
            "USD/metric ton",

          dimension:
            "PRICE",

          raw:
            "price_usd_per_ton",
        });

        expect(
          result?.sourceField
        ).toBe(
          "price_usd_per_ton"
        );

        expect(
          result?.semantic.state
        ).toBe("KNOWN");

        expect(
          result?.semantic.basis
        ).toBe(
          "Official Sectors CommodityPriceItem field price_usd_per_ton."
        );
      }
    );

    it(
      "normalizes the source date as a DATE period without inventing a reporting year",
      () => {
        const result =
          normalizeCommodityPrice({
            name:
              "Nickel",

            date:
              "2024-03-15",

            price_usd_per_ton:
              16500,
          });

        expect(
          result?.period
        ).toEqual({
          kind:
            "DATE",

          start:
            "2024-03-15",

          end:
            "2024-03-15",

          rawLabel:
            "2024-03-15",
        });

        expect(
          result?.period.year
        ).toBeUndefined();

        expect(
          result?.period.measurementYear
        ).toBeUndefined();
      }
    );

    it(
      "creates SOURCE_FACT evidence from Sectors",
      () => {
        const result =
          normalizeCommodityPrice(
            {
              name:
                "Copper",

              date:
                "2024-04-01",

              price_usd_per_ton:
                9000,
            },
            {
              sourceReference:
                "sectors:commodity:copper:2024",

              retrievedAt:
                "2026-08-30T01:02:03.000Z",
            }
          );

        expect(
          result?.evidence
        ).toHaveLength(1);

        expect(
          result?.evidence[0]
        ).toMatchObject({
          provider:
            "SECTORS",

          source:
            "sectors:commodity:copper:2024",

          retrievedAt:
            "2026-08-30T01:02:03.000Z",

          truthClass:
            "SOURCE_FACT",
        });
      }
    );

    it(
      "preserves zero as a real price value",
      () => {
        const result =
          normalizeCommodityPrice({
            name:
              "Coal",

            date:
              "2024-05-01",

            price_usd_per_ton:
              0,
          });

        expect(
          result?.value
        ).toBe(0);
      }
    );

    it(
      "rejects an unsupported commodity instead of inventing an RX commodity",
      () => {
        const result =
          normalizeCommodityPrice({
            name:
              "Bauxite",

            date:
              "2024-01-01",

            price_usd_per_ton:
              50,
          });

        expect(
          result
        ).toBeNull();
      }
    );

    it(
      "normalizes supported commodity names case-insensitively through the existing commodity normalizer",
      () => {
        const result =
          normalizeCommodityPrice({
            name:
              "  cOaL  ",

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          });

        expect(
          result?.commodity
        ).toBe("COAL");
      }
    );

    it(
      "creates deterministic observation identifiers from commodity and source date",
      () => {
        const first =
          normalizeCommodityPrice({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          });

        const second =
          normalizeCommodityPrice({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              130,
          });

        expect(
          first?.id
        ).toBe(
          "SECTORS:COMMODITY_PRICE:COAL:2024-01-01"
        );

        expect(
          second?.id
        ).toBe(
          first?.id
        );
      }
    );

    it(
      "does not infer company relationship or causal meaning",
      () => {
        const result =
          normalizeCommodityPrice({
            name:
              "Coal",

            date:
              "2024-01-01",

            price_usd_per_ton:
              125.85,
          });

        expect(
          result?.semanticDescription
            .toLowerCase()
        ).not.toContain(
          "company"
        );

        expect(
          result?.semanticDescription
            .toLowerCase()
        ).not.toContain(
          "cause"
        );
      }
    );
  }
);