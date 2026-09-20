import type {
  RXNormalizedProductQualityObservation,
  RXProductQualityMetric,
} from "../data/normalization/normalize-mining-product-quality";

import type {
  RXMiningProductQualityEvidenceAdmissionResult,
} from "./admit-mining-product-quality-evidence";

export interface RXProductQualityProfile {
  productName: string;

  companyId: string;

  commodityType: string | null;

  commoditySubtype: string | null;

  sourcePerformanceYear: number | null;

  observations:
    RXNormalizedProductQualityObservation[];
}

export interface RXMiningProductQualityAnalysisResult {
  status:
    | "ANALYZED"
    | "INSUFFICIENT_EVIDENCE";

  companyId:
    string;

  sourcePerformanceYears:
    number[];

  products:
    RXProductQualityProfile[];

  productCount:
    number;

  observationCount:
    number;

  observedRelationship:
    string;

  /**
   * Product-quality evidence establishes reported
   * characteristics only.
   *
   * It does not establish why a product has those
   * characteristics or what caused any difference.
   */
  causalConclusion:
    "UNKNOWN";
}

const METRIC_ORDER:
  RXProductQualityMetric[] = [
    "CALORIFIC_VALUE",
    "TOTAL_MOISTURE",
    "ASH_ARB",
    "TOTAL_SULPHUR_ARB",
    "ASH_ADB",
    "TOTAL_SULPHUR_ADB",
    "VOLATILE_MATTER_ADB",
    "FIXED_CARBON_ADB",
  ];

function metricOrder(
  metric:
    RXProductQualityMetric,
): number {
  const index =
    METRIC_ORDER.indexOf(metric);

  return index === -1
    ? Number.MAX_SAFE_INTEGER
    : index;
}

function compareNullableYear(
  left:
    number | null,

  right:
    number | null,
): number {
  if (
    left === null &&
    right === null
  ) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
}

function sortObservations(
  observations:
    RXNormalizedProductQualityObservation[],
): RXNormalizedProductQualityObservation[] {
  return [...observations].sort(
    (left, right) => {
      const yearComparison =
        compareNullableYear(
          left.sourcePerformanceYear,
          right.sourcePerformanceYear,
        );

      if (yearComparison !== 0) {
        return yearComparison;
      }

      const metricComparison =
        metricOrder(left.metric) -
        metricOrder(right.metric);

      if (metricComparison !== 0) {
        return metricComparison;
      }

      return left.sourceField.localeCompare(
        right.sourceField,
      );
    },
  );
}

function profileKey(
  observation:
    RXNormalizedProductQualityObservation,
): string {
  return [
    observation.companyId,
    observation.commodityType ??
      "UNKNOWN-COMMODITY",
    observation.commoditySubtype ??
      "UNKNOWN-SUBTYPE",
    observation.productName,
  ].join("::");
}

function createProfiles(
  observations:
    RXNormalizedProductQualityObservation[],
): RXProductQualityProfile[] {
  const grouped =
    new Map<
      string,
      RXNormalizedProductQualityObservation[]
    >();

  for (const observation of observations) {
    const key =
      profileKey(observation);

    const existing =
      grouped.get(key) ?? [];

    existing.push(observation);

    grouped.set(
      key,
      existing,
    );
  }

  return [...grouped.values()]
    .map(
      (
        productObservations,
      ): RXProductQualityProfile => {
        const sorted =
          sortObservations(
            productObservations,
          );

        const representative =
          sorted[0];

        if (!representative) {
          throw new Error(
            "Product-quality profile cannot be created without observations.",
          );
        }

        const years =
          sorted
            .map(
              (observation) =>
                observation.sourcePerformanceYear,
            )
            .filter(
              (year): year is number =>
                typeof year === "number",
            );

        const latestYear =
          years.length > 0
            ? Math.max(...years)
            : null;

        return {
          productName:
            representative.productName,

          companyId:
            representative.companyId,

          commodityType:
            representative.commodityType,

          commoditySubtype:
            representative.commoditySubtype,

          sourcePerformanceYear:
            latestYear,

          observations:
            sorted,
        };
      },
    )
    .sort(
      (left, right) =>
        left.productName.localeCompare(
          right.productName,
        ),
    );
}

function uniqueYears(
  observations:
    RXNormalizedProductQualityObservation[],
): number[] {
  return [
    ...new Set(
      observations
        .map(
          (observation) =>
            observation.sourcePerformanceYear,
        )
        .filter(
          (year): year is number =>
            typeof year === "number",
        ),
    ),
  ].sort(
    (left, right) =>
      left - right,
  );
}

/**
 * Deterministically summarizes admitted mining
 * product-quality evidence.
 *
 * IMPORTANT:
 * - Consumes admitted observations only.
 * - Keeps products separate.
 * - Keeps ARB and ADB separate.
 * - Preserves source min/max ranges.
 * - Does not calculate midpoint or average quality.
 * - Does not rank products.
 * - Does not infer missing quality metrics.
 * - Does not manufacture causal conclusions.
 */
export function analyzeMiningProductQuality(
  admission:
    RXMiningProductQualityEvidenceAdmissionResult,
): RXMiningProductQualityAnalysisResult {
  if (
    admission.status !==
      "ADMITTED"
  ) {
    return {
      status:
        "INSUFFICIENT_EVIDENCE",

      companyId:
        "UNKNOWN",

      sourcePerformanceYears:
        [],

      products:
        [],

      productCount:
        0,

      observationCount:
        0,

      observedRelationship:
        "No admitted mining product-quality evidence is available for deterministic analysis.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const admitted =
    admission.admittedObservations;

  if (
    admitted.length === 0
  ) {
    return {
      status:
        "INSUFFICIENT_EVIDENCE",

      companyId:
        "UNKNOWN",

      sourcePerformanceYears:
        [],

      products:
        [],

      productCount:
        0,

      observationCount:
        0,

      observedRelationship:
        "No admitted mining product-quality observations are available for deterministic analysis.",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const companyId =
    admitted[0]?.companyId ??
    "UNKNOWN";

  const products =
    createProfiles(
      admitted,
    );

  const years =
    uniqueYears(
      admitted,
    );

  return {
    status:
      "ANALYZED",

    companyId,

    sourcePerformanceYears:
      years,

    products,

    productCount:
      products.length,

    observationCount:
      admitted.length,

    observedRelationship:
      `Admitted Sectors evidence reports ${admitted.length} product-quality observations across ${products.length} product profile${products.length === 1 ? "" : "s"}. RX preserves reported source ranges and does not derive an overall product-quality score.`,

    causalConclusion:
      "UNKNOWN",
  };
}