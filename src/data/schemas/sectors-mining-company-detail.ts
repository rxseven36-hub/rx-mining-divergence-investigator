import { z } from "zod";

/**
 * Boundary schema for Sectors Mining Company Detail.
 *
 * Contract source:
 * Official Sectors OpenAPI schema:
 *   MiningCompanyDetail
 *
 * IMPORTANT:
 * This schema validates transport shape only.
 *
 * A transport-valid field is NOT automatically
 * admissible investigation evidence.
 *
 * Unknown fields are preserved with passthrough()
 * for forward compatibility.
 *
 * The official OpenAPI contract currently defines
 * mining_license and mining_contract items only as
 * generic objects with additional properties.
 *
 * Therefore RX deliberately does NOT invent required
 * nested license or contract fields here.
 */

const genericObjectSchema = z
  .object({})
  .passthrough();

export const sectorsMiningCompanyDetailSchema =
  z
    .object({
      name:
        z.string(),

      slug:
        z.string(),

      /**
       * Required key, nullable value.
       *
       * "required" and "non-null" are different
       * transport guarantees.
       */
      symbol:
        z.string().nullable(),

      company_type:
        z.string(),

      operation_province:
        z.string().nullable(),

      operation_district:
        z.string().nullable(),

      key_operation:
        z.string(),

      activities:
        z.array(
          z.string()
        ),

      commodity_type:
        z.array(
          z.string()
        ),

      mining_license:
        z.array(
          genericObjectSchema
        ),

      mining_contract:
        z.array(
          genericObjectSchema
        ),

      mining_site_count:
        z.number().int(),

      representative_address:
        z.string().nullable(),

      website:
        z.string().nullable(),

      phone_number:
        z.string().nullable(),

      email:
        z.string().nullable(),
    })
    .passthrough();

export type SectorsMiningCompanyDetail =
  z.infer<
    typeof sectorsMiningCompanyDetailSchema
  >;