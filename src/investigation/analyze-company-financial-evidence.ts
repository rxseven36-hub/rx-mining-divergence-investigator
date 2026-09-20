import type {
  RXFinancialEvidenceFamily,
  RXNormalizedFinancialObservation,
} from "../data/normalization/normalize-company-financial-report";

export interface RXFinancialMetricAnalysis {
  family:
    RXFinancialEvidenceFamily;

  metric:
    string;

  firstYear:
    number;

  firstValue:
    number | null;

  latestYear:
    number;

  latestValue:
    number | null;

  absoluteChange:
    number | null;

  percentageChange:
    number | null;

  observationCount:
    number;
}

export interface RXCompanyFinancialAnalysis {
  status:
    "ANALYZED" |
    "NO_FINANCIAL_EVIDENCE";

  companyId:
    string | null;

  period: {
    startYear:
      number | null;

    endYear:
      number | null;
  };

  metrics:
    RXFinancialMetricAnalysis[];

  observedRelationship:
    string;

  causalConclusion:
    "UNKNOWN";
}

function percentageChange(
  first:
    number | null,

  latest:
    number | null,
): number | null {
  if (
    first === null ||
    latest === null ||
    first === 0
  ) {
    return null;
  }

  return (
    ((latest - first) / Math.abs(first)) *
    100
  );
}

/**
 * Deterministic financial analyzer.
 *
 * It compares only admitted provider observations.
 * It does not:
 * - infer currency;
 * - recompute financial ratios;
 * - score company quality;
 * - infer causality;
 * - interpret valuation as cheap/expensive;
 * - repair provider values.
 */
export function analyzeCompanyFinancialEvidence(
  observations:
    RXNormalizedFinancialObservation[],
): RXCompanyFinancialAnalysis {
  if (observations.length === 0) {
    return {
      status:
        "NO_FINANCIAL_EVIDENCE",

      companyId:
        null,

      period: {
        startYear:
          null,

        endYear:
          null,
      },

      metrics:
        [],

      observedRelationship:
        "No admitted financial observations are available for deterministic analysis.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const sorted =
    [...observations].sort(
      (a, b) =>
        a.sourceYear -
        b.sourceYear,
    );

  const groups =
    new Map<
      string,
      RXNormalizedFinancialObservation[]
    >();

  for (const observation of sorted) {
    const key =
      `${observation.family}:${observation.metric}`;

    const current =
      groups.get(key) ?? [];

    current.push(
      observation,
    );

    groups.set(
      key,
      current,
    );
  }

  const metrics:
    RXFinancialMetricAnalysis[] = [];

  for (const group of groups.values()) {
    const first =
      group[0];

    const latest =
      group[group.length - 1];

    if (!first || !latest) {
      continue;
    }

    const absoluteChange =
      first.value !== null &&
      latest.value !== null
        ? latest.value - first.value
        : null;

    metrics.push({
      family:
        first.family,

      metric:
        first.metric,

      firstYear:
        first.sourceYear,

      firstValue:
        first.value,

      latestYear:
        latest.sourceYear,

      latestValue:
        latest.value,

      absoluteChange,

      percentageChange:
        percentageChange(
          first.value,
          latest.value,
        ),

      observationCount:
        group.length,
    });
  }

  metrics.sort(
    (a, b) =>
      a.family.localeCompare(
        b.family,
      ) ||
      a.metric.localeCompare(
        b.metric,
      ),
  );

  return {
    status:
      "ANALYZED",

    companyId:
      sorted[0]?.companyId ??
      null,

    period: {
      startYear:
        sorted[0]?.sourceYear ??
        null,

      endYear:
        sorted[
          sorted.length - 1
        ]?.sourceYear ??
        null,
    },

    metrics,

    observedRelationship:
      "Deterministic comparison of admitted provider-supplied financial observations across available source years.",

    causalConclusion:
      "UNKNOWN",
  };
}