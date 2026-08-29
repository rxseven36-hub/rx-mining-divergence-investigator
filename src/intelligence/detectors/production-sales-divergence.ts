import type {
  RXNormalizedObservation,
} from "../../data/normalization/normalized-observation";

import {
  compareObservations,
} from "../comparability/compare-observations";

import type {
  RXDetectorResult,
  RXDetectorSkipReason,
  RXDivergenceDirection,
} from "./detector-result";

function periodLabel(
  observation: RXNormalizedObservation
): string {
  const period = observation.period;

  if (
    period.kind === "YEAR" &&
    typeof period.year === "number"
  ) {
    return String(period.year);
  }

  if (period.rawLabel) {
    return period.rawLabel;
  }

  return "UNKNOWN";
}

function mapComparabilityReasons(
  reasons: string[]
): RXDetectorSkipReason[] {
  return reasons.filter(
    (
      reason
    ): reason is RXDetectorSkipReason =>
      reason === "DATA_MISSING" ||
      reason === "SEMANTICS_UNKNOWN" ||
      reason === "UNIT_NOT_COMPARABLE" ||
      reason === "TIME_NOT_ALIGNED" ||
      reason === "RELATIONSHIP_INVALID"
  );
}

function divergenceDirection(
  signedDifference: number
): RXDivergenceDirection {
  if (signedDifference > 0) {
    return "SALES_ABOVE_PRODUCTION";
  }

  if (signedDifference < 0) {
    return "PRODUCTION_ABOVE_SALES";
  }

  return "BALANCED";
}

export function detectProductionSalesDivergence(
  first: RXNormalizedObservation,
  second: RXNormalizedObservation
): RXDetectorResult {
  const observations = [first, second];

  const production = observations.find(
    (observation) =>
      observation.metric === "PRODUCTION"
  );

  const sales = observations.find(
    (observation) =>
      observation.metric === "SALES"
  );

  const baseResult = {
    detector:
      "PRODUCTION_VS_SALES" as const,

    companyId:
      first.companyId,

    commodity:
      first.commodity,

    commoditySubtype:
      first.commoditySubtype,

    periodLabel:
      periodLabel(first),

    sourceObservationIds:
      observations.map(
        (observation) => observation.id
      ),

    causalExplanation:
      "UNKNOWN" as const,
  };

  if (!production || !sales) {
    return {
      ...baseResult,

      status: "SKIPPED",

      skipReasons: [
        "WRONG_METRIC_PAIR",
      ],
    };
  }

  const comparability =
    compareObservations(
      production,
      sales
    );

  if (!comparability.eligible) {
    return {
      ...baseResult,

      status: "SKIPPED",

      skipReasons:
        mapComparabilityReasons(
          comparability.reasons
        ),
    };
  }

  /**
   * compareObservations guarantees non-null values
   * when eligible.
   */
  const productionValue =
    production.value as number;

  const salesValue =
    sales.value as number;

  const signedDifference =
    salesValue - productionValue;

  const absoluteDifference =
    Math.abs(signedDifference);

  const differenceRatioOfProduction =
    productionValue === 0
      ? null
      : absoluteDifference /
        Math.abs(productionValue);

  const direction =
    divergenceDirection(
      signedDifference
    );

  return {
    ...baseResult,

    status:
      absoluteDifference === 0
        ? "NO_DIVERGENCE"
        : "DETECTED",

    calculation: {
      production:
        productionValue,

      sales:
        salesValue,

      signedDifference,

      absoluteDifference,

      differenceRatioOfProduction,

      direction,
    },

    skipReasons: [],
  };
}