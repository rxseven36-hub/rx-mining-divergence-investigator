import type { RXMetricKind } from "@/types/metrics";

import type { SectorsMiningPerformanceRow } from "../schemas/sectors-mining-performance";

export interface ExtractedMiningMetric {
  metric: RXMetricKind;
  sourceField: string;
  value: number | null;
}

const hasOwn = (
  value: object,
  key: PropertyKey
): boolean => Object.prototype.hasOwnProperty.call(value, key);

export function extractMiningMetrics(
  row: SectorsMiningPerformanceRow
): ExtractedMiningMetric[] {
  const result: ExtractedMiningMetric[] = [];

  if (hasOwn(row, "production")) {
    result.push({
      metric: "PRODUCTION",
      sourceField: "production",
      value: row.production ?? null,
    });
  }

  if (hasOwn(row, "sales")) {
    result.push({
      metric: "SALES",
      sourceField: "sales",
      value: row.sales ?? null,
    });
  }

  if (hasOwn(row, "resources")) {
    result.push({
      metric: "RESOURCE",
      sourceField: "resources",
      value: row.resources ?? null,
    });
  }

  if (hasOwn(row, "reserves")) {
    result.push({
      metric: "RESERVE",
      sourceField: "reserves",
      value: row.reserves ?? null,
    });
  }

  if (hasOwn(row, "total_resources_Mt")) {
    result.push({
      metric: "RESOURCE",
      sourceField: "total_resources_Mt",
      value: row.total_resources_Mt ?? null,
    });
  }

  if (hasOwn(row, "total_reserves_Mt")) {
    result.push({
      metric: "RESERVE",
      sourceField: "total_reserves_Mt",
      value: row.total_reserves_Mt ?? null,
    });
  }

  return result;
}