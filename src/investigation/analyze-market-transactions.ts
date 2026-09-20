import type {
  RXNormalizedMarketTransactionObservation,
} from "../data/normalization/normalized-market-transaction";

type RXMarketMetric =
  | "PRICE"
  | "VOLUME"
  | "MARKET_CAP";

export interface RXMarketMetricChange {
  metric: RXMarketMetric;

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
}

export interface RXMarketTransactionAnalysis {
  status:
    | "MARKET_EVIDENCE_AVAILABLE"
    | "NO_MARKET_EVIDENCE";

  symbol: string | null;

  period: {
    start: string | null;
    end: string | null;
  };

  price: RXMarketMetricChange | null;

  volume: RXMarketMetricChange | null;

  marketCap: RXMarketMetricChange | null;

  observedRelationship: string;

  causalConclusion: "UNKNOWN";
}

function observationDate(
  observation: RXNormalizedMarketTransactionObservation,
): string {
  return observation.period.start ?? "";
}

function analyzeMetric(
  observations: RXNormalizedMarketTransactionObservation[],
  metric: RXMarketMetric,
): RXMarketMetricChange | null {
  const matching = observations
    .filter(
      (observation) =>
        observation.metric === metric &&
        observation.semantic.state === "KNOWN",
    )
    .sort((a, b) =>
      observationDate(a).localeCompare(
        observationDate(b),
      ),
    );

  if (matching.length === 0) {
    return null;
  }

  const first = matching[0];
  const latest = matching[matching.length - 1];

  if (!first || !latest) {
    return null;
  }

  const absoluteChange =
    latest.value - first.value;

  const percentageChange =
    first.value === 0
      ? null
      : (absoluteChange / first.value) * 100;

  return {
    metric,

    first: {
      date: observationDate(first),
      value: first.value,
      unit: first.unit.symbol,
    },

    latest: {
      date: observationDate(latest),
      value: latest.value,
      unit: latest.unit.symbol,
    },

    absoluteChange,

    percentageChange,

    observationCount: matching.length,
  };
}

function describeMetric(
  analysis: RXMarketMetricChange | null,
  label: string,
): string | null {
  if (!analysis) {
    return null;
  }

  if (
    analysis.first.date === analysis.latest.date
  ) {
    return `${label} has one admitted point at ${analysis.latest.value} ${analysis.latest.unit} on ${analysis.latest.date}.`;
  }

  return `${label} changed from ${analysis.first.value} ${analysis.first.unit} on ${analysis.first.date} to ${analysis.latest.value} ${analysis.latest.unit} on ${analysis.latest.date}.`;
}

export function analyzeMarketTransactions(
  admittedObservations:
    RXNormalizedMarketTransactionObservation[],
): RXMarketTransactionAnalysis {
  const observations =
    admittedObservations
      .filter(
        (observation) =>
          observation.semantic.state === "KNOWN",
      )
      .sort((a, b) =>
        observationDate(a).localeCompare(
          observationDate(b),
        ),
      );

  if (observations.length === 0) {
    return {
      status: "NO_MARKET_EVIDENCE",

      symbol: null,

      period: {
        start: null,
        end: null,
      },

      price: null,
      volume: null,
      marketCap: null,

      observedRelationship:
        "No admitted market observations are available for deterministic analysis.",

      causalConclusion: "UNKNOWN",
    };
  }

  const firstObservation = observations[0];
  const latestObservation =
    observations[observations.length - 1];

  const price =
    analyzeMetric(observations, "PRICE");

  const volume =
    analyzeMetric(observations, "VOLUME");

  const marketCap =
    analyzeMetric(observations, "MARKET_CAP");

  const descriptions = [
    describeMetric(price, "Closing price"),
    describeMetric(volume, "Trading volume"),
    describeMetric(
      marketCap,
      "Market capitalization",
    ),
  ].filter(
    (value): value is string =>
      value !== null,
  );

  return {
    status: "MARKET_EVIDENCE_AVAILABLE",

    symbol:
      firstObservation?.symbol ?? null,

    period: {
      start:
        firstObservation
          ? observationDate(firstObservation)
          : null,

      end:
        latestObservation
          ? observationDate(latestObservation)
          : null,
    },

    price,
    volume,
    marketCap,

    observedRelationship:
      descriptions.join(" "),

    causalConclusion: "UNKNOWN",
  };
}