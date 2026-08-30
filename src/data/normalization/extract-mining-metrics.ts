import type {
  RXMetricKind,
} from "@/types/metrics";

import type {
  SectorsMiningPerformanceRow,
} from "../schemas/sectors-mining-performance";

export interface ExtractedMiningMetric {
  metric: RXMetricKind;

  sourceField: string;

  value: number | null;
}

const hasOwn = (
  value: object,
  key: PropertyKey
): boolean =>
  Object.prototype.hasOwnProperty.call(
    value,
    key
  );

/**
 * Extract deterministic detector-ready metrics from
 * a Sectors mining-performance row.
 *
 * VERIFIED LIVE CONTRACT:
 *
 * row.commodity_stats.production_volume
 * row.commodity_stats.sales_volume
 *
 * Live fields always take precedence over provisional
 * legacy fields when both exist.
 *
 * IMPORTANT:
 * - Missing field != null field.
 * - null MUST NOT become zero.
 * - Resource/reserve metrics from the nested live
 *   contract are intentionally NOT activated here yet.
 */
export function extractMiningMetrics(
  row: SectorsMiningPerformanceRow
): ExtractedMiningMetric[] {
  const result:
    ExtractedMiningMetric[] = [];

  const stats =
    row.commodity_stats;

  if (
    stats &&
    hasOwn(
      stats,
      "production_volume"
    )
  ) {
    result.push({
      metric: "PRODUCTION",

      sourceField:
        "commodity_stats.production_volume",

      value:
        stats.production_volume ??
        null,
    });
  } else if (
    hasOwn(
      row,
      "production"
    )
  ) {
    result.push({
      metric: "PRODUCTION",

      sourceField:
        "production",

      value:
        row.production ?? null,
    });
  }

  if (
    stats &&
    hasOwn(
      stats,
      "sales_volume"
    )
  ) {
    result.push({
      metric: "SALES",

      sourceField:
        "commodity_stats.sales_volume",

      value:
        stats.sales_volume ??
        null,
    });
  } else if (
    hasOwn(
      row,
      "sales"
    )
  ) {
    result.push({
      metric: "SALES",

      sourceField:
        "sales",

      value:
        row.sales ?? null,
    });
  }

  /**
   * Legacy resource/reserve extraction is retained only
   * for compatibility with existing provisional fixtures.
   *
   * The verified nested live resource/reserve contract is
   * deliberately NOT activated yet because it carries its
   * own measurement_year and requires field-specific
   * semantic/unit eligibility rules.
   */
  if (
    hasOwn(
      row,
      "resources"
    )
  ) {
    result.push({
      metric: "RESOURCE",

      sourceField:
        "resources",

      value:
        row.resources ?? null,
    });
  }

  if (
    hasOwn(
      row,
      "reserves"
    )
  ) {
    result.push({
      metric: "RESERVE",

      sourceField:
        "reserves",

      value:
        row.reserves ?? null,
    });
  }

  if (
    hasOwn(
      row,
      "total_resources_Mt"
    )
  ) {
    result.push({
      metric: "RESOURCE",

      sourceField:
        "total_resources_Mt",

      value:
        row.total_resources_Mt ??
        null,
    });
  }

  if (
    hasOwn(
      row,
      "total_reserves_Mt"
    )
  ) {
    result.push({
      metric: "RESERVE",

      sourceField:
        "total_reserves_Mt",

      value:
        row.total_reserves_Mt ??
        null,
    });
  }

  return result;
}