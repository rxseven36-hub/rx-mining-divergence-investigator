import { z } from "zod";

/**
 * Boundary schema for Sectors Commodity Price History.
 *
 * Contract source:
 * Official Sectors OpenAPI endpoint:
 *   GET /v2/mining/commodities/{commodity_name}/price/
 *
 * HTTP 200 transport shape:
 *   CommodityPriceItem[]
 *
 * IMPORTANT:
 * This schema validates transport shape only.
 *
 * A transport-valid price record is NOT automatically
 * admissible investigation evidence.
 *
 * Semantic validation, requested-commodity alignment,
 * temporal alignment, and evidence admission belong to
 * later investigation boundaries.
 *
 * Unknown item fields are preserved with passthrough()
 * for forward compatibility.
 */

export const sectorsCommodityPriceItemSchema =
  z
    .object({
      /**
       * Required, non-null commodity name.
       */
      name:
        z.string(),

      /**
       * Required, non-null ISO calendar date.
       *
       * OpenAPI format:
       *   date
       *
       * Zod validates the transport date format here.
       */
      date:
        z.iso.date(),

      /**
       * Required, non-null price.
       *
       * Official semantic unit:
       *   USD per metric ton.
       *
       * The transport payload itself exposes the unit
       * through the field name rather than a separate
       * currency/unit field.
       */
      price_usd_per_ton:
        z.number(),
    })
    .passthrough();

/**
 * The endpoint returns the price records directly
 * as an array. There is no top-level response wrapper.
 */
export const sectorsCommodityPriceResponseSchema =
  z.array(
    sectorsCommodityPriceItemSchema
  );

export type SectorsCommodityPriceItem =
  z.infer<
    typeof sectorsCommodityPriceItemSchema
  >;

export type SectorsCommodityPriceResponse =
  z.infer<
    typeof sectorsCommodityPriceResponseSchema
  >;