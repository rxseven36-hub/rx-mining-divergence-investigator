import { z } from "zod";

/**
 * Boundary schema for Sectors Daily Transaction Data.
 *
 * Contract source:
 * Official Sectors OpenAPI endpoint:
 *   GET /v2/daily/{symbol}/
 *
 * operationId:
 *   daily_retrieve
 *
 * HTTP 200 transport shape:
 *   DailyDataItem[]
 *
 * Official endpoint semantics:
 * - IDX symbol is supplied through the path.
 * - start/end use YYYY-MM-DD.
 * - maximum requested window is 90 days.
 * - the endpoint returns daily close price,
 *   trading volume, and market capitalization.
 *
 * IMPORTANT:
 * This schema validates transport shape only.
 *
 * A transport-valid daily market record is NOT
 * automatically admissible investigation evidence.
 *
 * Requested-symbol alignment, temporal alignment,
 * normalization, semantic validation, and evidence
 * admission belong to later investigation boundaries.
 *
 * Unknown item fields are preserved with passthrough()
 * for forward compatibility.
 */

export const sectorsMarketTransactionItemSchema =
  z
    .object({
      /**
       * Required, non-null IDX ticker symbol.
       *
       * Example:
       *   BBCA.JK
       */
      symbol:
        z.string(),

      /**
       * Required, non-null trading date.
       *
       * OpenAPI format:
       *   date
       */
      date:
        z.iso.date(),

      /**
       * Required, non-null closing price.
       *
       * Official semantic unit:
       *   IDR
       *
       * OpenAPI type:
       *   integer
       */
      close:
        z.number().int(),

      /**
       * Required, non-null trading volume.
       *
       * Official semantic unit:
       *   shares
       *
       * OpenAPI type:
       *   integer
       */
      volume:
        z.number().int(),

      /**
       * Required, non-null market capitalization.
       *
       * Official semantic unit:
       *   IDR
       *
       * OpenAPI type:
       *   integer
       */
      market_cap:
        z.number().int(),
    })
    .passthrough();

/**
 * The endpoint returns DailyDataItem records directly
 * as an array. There is no top-level response wrapper.
 *
 * An empty array is transport-valid.
 * Whether it means NO_DATA is decided later at the
 * evidence-admission boundary.
 */
export const sectorsMarketTransactionResponseSchema =
  z.array(
    sectorsMarketTransactionItemSchema
  );

export type SectorsMarketTransactionItem =
  z.infer<
    typeof sectorsMarketTransactionItemSchema
  >;

export type SectorsMarketTransactionResponse =
  z.infer<
    typeof sectorsMarketTransactionResponseSchema
  >;