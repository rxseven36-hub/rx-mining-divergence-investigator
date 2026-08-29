import type { RXNormalizedObservation } from "./normalized-observation";

import type { SectorsMiningPerformanceRow } from "../schemas/sectors-mining-performance";

import { normalizeCommodity } from "./normalize-commodity";
import { normalizeUnit } from "./normalize-unit";
import { extractMiningMetrics } from "./extract-mining-metrics";

export interface NormalizeMiningPerformanceInput {
  companyId: string;
  row: SectorsMiningPerformanceRow;
  source: string;
  retrievedAt?: string;
}

function resolveCommoditySubtype(
  row: SectorsMiningPerformanceRow
): string | undefined {
  return (
    row.product_type ??
    row.subtype ??
    row.product ??
    undefined
  );
}

function semanticDescription(
  metric: string,
  commodity: string,
  subtype?: string
): string {
  const scope = subtype
    ? `${commodity} / ${subtype}`
    : commodity;

  return `${scope} ${metric.toLowerCase()}`;
}

export function normalizeMiningPerformanceRow(
  input: NormalizeMiningPerformanceInput
): RXNormalizedObservation[] {
  const commodityRaw =
    input.row.commodity_type ??
    input.row.commodity;

  const commodity = normalizeCommodity(commodityRaw);

  /**
   * Unsupported or unknown commodity is not silently coerced.
   *
   * Aluminium/Bauxite remains outside the locked MVP universe.
   */
  if (!commodity) {
    return [];
  }

  const unit = normalizeUnit(input.row.unit);

  const subtype = resolveCommoditySubtype(input.row);

  const metrics = extractMiningMetrics(input.row);

  return metrics.map((metric, index) => ({
    id: [
      input.companyId,
      commodity,
      subtype ?? "GENERAL",
      metric.sourceField,
      input.row.year ?? "UNKNOWN-YEAR",
      index,
    ].join(":"),

    companyId: input.companyId,

    commodity,

    commoditySubtype: subtype,

    metric: metric.metric,

    value: metric.value,

    unit,

    period: {
      kind:
        typeof input.row.year === "number"
          ? "YEAR"
          : "UNKNOWN",

      year: input.row.year,

      measurementYear:
        input.row.measurement_year ?? undefined,
    },

    evidence: [
      {
        id: [
          "sectors",
          input.companyId,
          metric.sourceField,
          input.row.year ?? "unknown",
        ].join(":"),

        provider: "SECTORS",
        source: input.source,
        retrievedAt: input.retrievedAt,
        truthClass: "SOURCE_FACT",
      },
    ],

    sourceField: metric.sourceField,

    semanticDescription: semanticDescription(
      metric.metric,
      commodity,
      subtype
    ),
  }));
}