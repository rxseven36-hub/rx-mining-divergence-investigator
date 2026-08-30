import type {
  SectorsCommodityPriceItem,
} from "../schemas/sectors-commodity-price";

import {
  normalizeCommodity,
} from "./normalize-commodity";

import type {
  RXNormalizedCommodityPriceObservation,
} from "./normalized-commodity-price";

export interface NormalizeCommodityPriceOptions {
  sourceReference?: string;

  retrievedAt?: string;
}

/**
 * Normalize one transport-valid Sectors CommodityPriceItem.
 *
 * Transport validity and semantic normalization remain
 * separate boundaries:
 *
 * - the transport schema proves required fields/types;
 * - this normalizer proves whether RX recognizes the
 *   commodity and can establish canonical semantics.
 *
 * Unsupported commodity names are deliberately rejected
 * instead of being coerced into an RX commodity.
 */
export function normalizeCommodityPrice(
  item:
    SectorsCommodityPriceItem,
  options:
    NormalizeCommodityPriceOptions = {}
): RXNormalizedCommodityPriceObservation | null {
  const commodity =
    normalizeCommodity(
      item.name
    );

  if (!commodity) {
    return null;
  }

  const sourceReference =
    options.sourceReference ??
    "Sectors Commodity Price History";

  const observationId =
    [
      "SECTORS",
      "COMMODITY_PRICE",
      commodity,
      item.date,
    ].join(":");

  return {
    id:
      observationId,

    commodity,

    metric:
      "PRICE",

    value:
      item.price_usd_per_ton,

    unit: {
      symbol:
        "USD/metric ton",

      dimension:
        "PRICE",

      raw:
        "price_usd_per_ton",
    },

    period: {
      kind:
        "DATE",

      start:
        item.date,

      end:
        item.date,

      rawLabel:
        item.date,
    },

    evidence: [
      {
        id:
          `${observationId}:SOURCE`,

        provider:
          "SECTORS",

        source:
          sourceReference,

        retrievedAt:
          options.retrievedAt,

        truthClass:
          "SOURCE_FACT",

        note:
          "Official Sectors commodity price field price_usd_per_ton.",
      },
    ],

    sourceField:
      "price_usd_per_ton",

    semanticDescription:
      "Commodity market price in USD per metric ton.",

    semantic: {
      state:
        "KNOWN",

      description:
        "Commodity market price in USD per metric ton.",

      basis:
        "Official Sectors CommodityPriceItem field price_usd_per_ton.",
    },
  };
}