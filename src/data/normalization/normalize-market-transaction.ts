import type {
  SectorsMarketTransactionItem,
} from "../schemas/sectors-market-transaction";

import type {
  RXNormalizedMarketTransactionObservation,
} from "./normalized-market-transaction";

export interface NormalizeMarketTransactionOptions {
  sourceReference?: string;

  retrievedAt?: string;
}

function createPeriod(
  date: string
): RXNormalizedMarketTransactionObservation["period"] {
  return {
    kind:
      "DATE",

    start:
      date,

    end:
      date,

    rawLabel:
      date,
  };
}

/**
 * Normalize one transport-valid Sectors DailyDataItem.
 *
 * One DailyDataItem contains three independent market facts:
 *
 * - close;
 * - volume;
 * - market_cap.
 *
 * They are deliberately normalized into separate
 * observations so downstream comparability and divergence
 * logic can reason about each metric independently.
 *
 * IMPORTANT:
 * This boundary does NOT:
 *
 * - manufacture an RX companyId;
 * - attach a mining commodity;
 * - infer market direction;
 * - infer anomaly;
 * - infer causality;
 * - determine evidence admissibility.
 *
 * Those decisions belong to later boundaries.
 */
export function normalizeMarketTransaction(
  item:
    SectorsMarketTransactionItem,
  options:
    NormalizeMarketTransactionOptions = {}
): RXNormalizedMarketTransactionObservation[] {
  const sourceReference =
    options.sourceReference ??
    "Sectors Daily Transaction Data";

  const period =
    createPeriod(
      item.date
    );

  const baseId =
    [
      "SECTORS",
      "MARKET_TRANSACTION",
      item.symbol,
      item.date,
    ].join(":");

  const priceObservation:
    RXNormalizedMarketTransactionObservation = {
      id:
        `${baseId}:PRICE`,

      symbol:
        item.symbol,

      metric:
        "PRICE",

      value:
        item.close,

      unit: {
        symbol:
          "IDR",

        dimension:
          "PRICE",

        raw:
          "close",
      },

      period,

      evidence: [
        {
          id:
            `${baseId}:PRICE:SOURCE`,

          provider:
            "SECTORS",

          source:
            sourceReference,

          retrievedAt:
            options.retrievedAt,

          truthClass:
            "SOURCE_FACT",

          note:
            "Official Sectors DailyDataItem field close.",
        },
      ],

      sourceField:
        "close",

      semanticDescription:
        "Daily closing price in IDR.",

      semantic: {
        state:
          "KNOWN",

        description:
          "Daily closing price in IDR.",

        basis:
          "Official Sectors DailyDataItem field close.",
      },
    };

  const volumeObservation:
    RXNormalizedMarketTransactionObservation = {
      id:
        `${baseId}:VOLUME`,

      symbol:
        item.symbol,

      metric:
        "VOLUME",

      value:
        item.volume,

      unit: {
        symbol:
          "shares",

        dimension:
          "VOLUME",

        raw:
          "volume",
      },

      period,

      evidence: [
        {
          id:
            `${baseId}:VOLUME:SOURCE`,

          provider:
            "SECTORS",

          source:
            sourceReference,

          retrievedAt:
            options.retrievedAt,

          truthClass:
            "SOURCE_FACT",

          note:
            "Official Sectors DailyDataItem field volume.",
        },
      ],

      sourceField:
        "volume",

      semanticDescription:
        "Daily trading volume in shares.",

      semantic: {
        state:
          "KNOWN",

        description:
          "Daily trading volume in shares.",

        basis:
          "Official Sectors DailyDataItem field volume.",
      },
    };

  const marketCapObservation:
    RXNormalizedMarketTransactionObservation = {
      id:
        `${baseId}:MARKET_CAP`,

      symbol:
        item.symbol,

      metric:
        "MARKET_CAP",

      value:
        item.market_cap,

      unit: {
        symbol:
          "IDR",

        dimension:
          "CURRENCY",

        raw:
          "market_cap",
      },

      period,

      evidence: [
        {
          id:
            `${baseId}:MARKET_CAP:SOURCE`,

          provider:
            "SECTORS",

          source:
            sourceReference,

          retrievedAt:
            options.retrievedAt,

          truthClass:
            "SOURCE_FACT",

          note:
            "Official Sectors DailyDataItem field market_cap.",
        },
      ],

      sourceField:
        "market_cap",

      semanticDescription:
        "Market capitalization in IDR.",

      semantic: {
        state:
          "KNOWN",

        description:
          "Market capitalization in IDR.",

        basis:
          "Official Sectors DailyDataItem field market_cap.",
      },
    };

  return [
    priceObservation,
    volumeObservation,
    marketCapObservation,
  ];
}