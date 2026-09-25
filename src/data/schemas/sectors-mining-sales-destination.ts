import { z } from "zod";

/**
 * Boundary schema for Sectors company sales-destination data.
 *
 * This validates provider transport shape only.
 * Destination labels are preserved verbatim.
 *
 * Null provider values remain null.
 * No missing revenue, volume, percentage, unit, or commodity
 * value is synthesized by RX.
 *
 * Unknown provider fields are preserved with passthrough().
 */

const nullableNumber = z
  .number()
  .nullable()
  .optional();

export const sectorsMiningSalesDestinationEntrySchema =
  z
    .object({
      revenue_usd:
        nullableNumber,

      percentage_of_total_revenue:
        nullableNumber,

      volume:
        nullableNumber,

      percentage_of_sales_volume:
        nullableNumber,

      commodity_type:
        z.string().nullable().optional(),

      unit:
        z.string().nullable().optional(),
    })
    .passthrough();

export const sectorsMiningSalesDestinationResponseSchema =
  z
    .object({
      year:
        z.number().int(),

      data:
        z.record(
          z.string(),
          sectorsMiningSalesDestinationEntrySchema
        ),
    })
    .passthrough();

export type SectorsMiningSalesDestinationEntry =
  z.infer<
    typeof sectorsMiningSalesDestinationEntrySchema
  >;

export type SectorsMiningSalesDestinationResponse =
  z.infer<
    typeof sectorsMiningSalesDestinationResponseSchema
  >;