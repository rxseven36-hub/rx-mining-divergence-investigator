import type {
  RXNormalizedCommodityPriceObservation,
} from "../data/normalization/normalized-commodity-price";

import type {
  RXCommodity,
} from "../types/commodity";

export interface RXCommodityPriceSeriesPoint {
  date: string;
  value: number;
  unit: string;
}

export interface RXCommodityPriceChange {
  first: {
    date: string;
    value: number;
    unit: string;
  };

  latest: {
    date: string;
    value: number;
    unit: string;
  };

  absoluteChange: number;

  percentageChange: number | null;

  observationCount: number;

  series: RXCommodityPriceSeriesPoint[];
}

export interface RXCommodityPriceAnalysis {
  status:
    | "COMMODITY_PRICE_EVIDENCE_AVAILABLE"
    | "NO_COMMODITY_PRICE_EVIDENCE";

  commodity:
    RXCommodity | null;

  period: {
    start: string | null;
    end: string | null;
  };

  price:
    RXCommodityPriceChange | null;

  observedRelationship:
    string;

  causalConclusion:
    "UNKNOWN";
}

function observationDate(
  observation:
    RXNormalizedCommodityPriceObservation,
): string {
  return observation.period.start ?? "";
}

/**
 * Deterministic analysis of already-admitted commodity-price
 * evidence.
 *
 * This layer only describes source-established price movement.
 *
 * It does NOT:
 * - infer bullish or bearish state;
 * - classify an anomaly;
 * - associate the commodity movement with a company;
 * - infer a mining relationship;
 * - explain an event;
 * - infer causality.
 */
export function analyzeCommodityPrice(
  admittedObservations:
    RXNormalizedCommodityPriceObservation[],
): RXCommodityPriceAnalysis {
  const observations =
    admittedObservations
      .filter(
        (observation) =>
          observation.metric === "PRICE" &&
          observation.semantic.state === "KNOWN",
      )
      .sort(
        (a, b) =>
          observationDate(a).localeCompare(
            observationDate(b),
          ),
      );

  if (observations.length === 0) {
    return {
      status:
        "NO_COMMODITY_PRICE_EVIDENCE",

      commodity:
        null,

      period: {
        start: null,
        end: null,
      },

      price:
        null,

      observedRelationship:
        "No admitted commodity-price observations are available for deterministic analysis.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const first =
    observations[0];

  const latest =
    observations[
      observations.length - 1
    ];

  if (!first || !latest) {
    return {
      status:
        "NO_COMMODITY_PRICE_EVIDENCE",

      commodity:
        null,

      period: {
        start: null,
        end: null,
      },

      price:
        null,

      observedRelationship:
        "No admitted commodity-price observations are available for deterministic analysis.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const absoluteChange =
    latest.value - first.value;

  const percentageChange =
    first.value === 0
      ? null
      : (
          absoluteChange /
          first.value
        ) * 100;

  const price:
    RXCommodityPriceChange = {
      first: {
        date:
          observationDate(first),

        value:
          first.value,

        unit:
          first.unit.symbol,
      },

      latest: {
        date:
          observationDate(latest),

        value:
          latest.value,

        unit:
          latest.unit.symbol,
      },

      absoluteChange,

      percentageChange,

      observationCount:
        observations.length,

      series:
        observations.map(
          (observation) => ({
            date:
              observationDate(
                observation,
              ),
            value:
              observation.value,
            unit:
              observation.unit.symbol,
          }),
        ),
    };

  const observedRelationship =
    first === latest
      ? `${first.commodity} has one admitted commodity-price observation at ${latest.value} ${latest.unit.symbol} on ${observationDate(latest)}.`
      : `${first.commodity} commodity price changed from ${first.value} ${first.unit.symbol} on ${observationDate(first)} to ${latest.value} ${latest.unit.symbol} on ${observationDate(latest)}.`;

  return {
    status:
      "COMMODITY_PRICE_EVIDENCE_AVAILABLE",

    commodity:
      first.commodity,

    period: {
      start:
        observationDate(first),

      end:
        observationDate(latest),
    },

    price,

    observedRelationship,

    causalConclusion:
      "UNKNOWN",
  };
}