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

export const sectorsMiningPerformanceRowSchema = z
  .object({
    year: z.number().int().optional(),

    commodity: z.string().nullable().optional(),
    commodity_type: z.string().nullable().optional(),

    product: z.string().nullable().optional(),
    product_type: z.string().nullable().optional(),
    subtype: z.string().nullable().optional(),

    unit: z.string().nullable().optional(),

    production: z.number().nullable().optional(),
    sales: z.number().nullable().optional(),

    overburden: z.number().nullable().optional(),
    strip_ratio: z.number().nullable().optional(),

    resources: z.number().nullable().optional(),
    reserves: z.number().nullable().optional(),

    total_resources_Mt: z.number().nullable().optional(),
    total_reserves_Mt: z.number().nullable().optional(),

    measurement_year: z.number().int().nullable().optional(),
  })
  .passthrough();

export const sectorsMiningPerformanceResponseSchema = z
  .object({
    company_name: z.string().optional(),
    symbol: z.string().nullable().optional(),

    available_years: z.array(z.number().int()).optional(),

    data: z.array(sectorsMiningPerformanceRowSchema).optional(),
  })
  .passthrough();

export type SectorsMiningPerformanceRow = z.infer<
  typeof sectorsMiningPerformanceRowSchema
>;

export type SectorsMiningPerformanceResponse = z.infer<
  typeof sectorsMiningPerformanceResponseSchema
>;