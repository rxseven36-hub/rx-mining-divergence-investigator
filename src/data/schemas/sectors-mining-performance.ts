import { z } from "zod";

/**
 * Boundary schema for Sectors mining performance data.
 *
 * IMPORTANT:
 * This schema validates transport shape only.
 * It does NOT claim that every field has known business semantics.
 *
 * Unknown fields are preserved with passthrough().
 */

const nullableNumber = z
  .number()
  .nullable()
  .optional();

const nullableRangeSchema = z
  .object({
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
  })
  .passthrough()
  .nullable()
  .optional();

export const sectorsMiningProductSchema = z
  .object({
    product_name:
      z.string().nullable().optional(),

    calorific_value_kcal:
      nullableRangeSchema,

    total_moisture_pct:
      nullableRangeSchema,

    ash_content_arb:
      nullableRangeSchema,

    total_sulphur_arb:
      nullableRangeSchema,

    ash_content_adb:
      nullableRangeSchema,

    total_sulphur_adb:
      nullableRangeSchema,

    volatile_matter_adb:
      nullableRangeSchema,

    fixed_carbon_adb:
      nullableRangeSchema,
  })
  .passthrough();

export const sectorsMiningResourcesReservesSchema =
  z
    .object({
      measurement_year:
        z.number().int().nullable().optional(),

      probable_reserves_Mt:
        nullableNumber,

      proven_reserves_Mt:
        nullableNumber,

      total_reserves_Mt:
        nullableNumber,

      inferred_resources_Mt:
        nullableNumber,

      indicated_resources_Mt:
        nullableNumber,

      measured_resources_Mt:
        nullableNumber,

      total_resources_Mt:
        nullableNumber,
    })
    .passthrough();

export const sectorsMiningCommodityStatsSchema =
  z
    .object({
      unit:
        z.string().nullable().optional(),

      mining_operation_status:
        z.string().nullable().optional(),

      production_volume:
        nullableNumber,

      sales_volume:
        nullableNumber,

      overburden_removal_volume:
        nullableNumber,

      strip_ratio:
        nullableNumber,

      resources_reserves:
        sectorsMiningResourcesReservesSchema
          .nullable()
          .optional(),

      products:
        z
          .array(
            sectorsMiningProductSchema
          )
          .nullable()
          .optional(),
    })
    .passthrough();

export const sectorsMiningPerformanceRowSchema =
  z
    .object({
      year:
        z.number().int().optional(),

      commodity_type:
        z.string().nullable().optional(),

      commodity_sub_type:
        z.string().nullable().optional(),

      commodity_stats:
        sectorsMiningCommodityStatsSchema
          .nullable()
          .optional(),

      /**
       * Legacy/provisional transport fields.
       *
       * Keep these temporarily so existing fixtures and
       * tests remain compatible while RX transitions to
       * the verified live Sectors contract.
       *
       * They MUST NOT take precedence over verified live
       * fields when both are present.
       */
      commodity:
        z.string().nullable().optional(),

      product:
        z.string().nullable().optional(),

      product_type:
        z.string().nullable().optional(),

      subtype:
        z.string().nullable().optional(),

      unit:
        z.string().nullable().optional(),

      production:
        nullableNumber,

      sales:
        nullableNumber,

      overburden:
        nullableNumber,

      strip_ratio:
        nullableNumber,

      resources:
        nullableNumber,

      reserves:
        nullableNumber,

      total_resources_Mt:
        nullableNumber,

      total_reserves_Mt:
        nullableNumber,

      measurement_year:
        z.number().int().nullable().optional(),
    })
    .passthrough();

export const sectorsMiningPerformanceResponseSchema =
  z
    .object({
      /**
       * Verified from live historical-performance
       * response captured for AADI 2024.
       */
      year:
        z.number().int().optional(),

      available_years:
        z
          .array(
            z.number().int()
          )
          .optional(),

      data:
        z
          .array(
            sectorsMiningPerformanceRowSchema
          )
          .optional(),

      /**
       * Retained as optional compatibility fields.
       */
      company_name:
        z.string().optional(),

      symbol:
        z.string().nullable().optional(),
    })
    .passthrough();

export type SectorsMiningProduct =
  z.infer<
    typeof sectorsMiningProductSchema
  >;

export type SectorsMiningResourcesReserves =
  z.infer<
    typeof sectorsMiningResourcesReservesSchema
  >;

export type SectorsMiningCommodityStats =
  z.infer<
    typeof sectorsMiningCommodityStatsSchema
  >;

export type SectorsMiningPerformanceRow =
  z.infer<
    typeof sectorsMiningPerformanceRowSchema
  >;

export type SectorsMiningPerformanceResponse =
  z.infer<
    typeof sectorsMiningPerformanceResponseSchema
  >;