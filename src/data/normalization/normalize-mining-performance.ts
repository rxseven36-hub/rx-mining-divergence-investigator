import type {
  RXNormalizedObservation,
} from "./normalized-observation";

import type {
  RXSemanticKnowledge,
} from "./semantic-state";

import type {
  SectorsMiningPerformanceRow,
} from "../schemas/sectors-mining-performance";

import {
  normalizeCommodity,
} from "./normalize-commodity";

import {
  normalizeUnit,
} from "./normalize-unit";

import {
  extractMiningMetrics,
} from "./extract-mining-metrics";

export interface NormalizeMiningPerformanceInput {
  companyId: string;

  row: SectorsMiningPerformanceRow;

  source: string;

  retrievedAt?: string;
}

function resolveCommoditySubtype(
  row: SectorsMiningPerformanceRow
): string | undefined {
  /**
   * Verified live Sectors field takes precedence.
   *
   * Legacy/provisional fields remain fallback-only
   * during contract migration.
   */
  return (
    row.commodity_sub_type ??
    row.product_type ??
    row.subtype ??
    row.product ??
    undefined
  );
}

function resolveUnit(
  row: SectorsMiningPerformanceRow
) {
  /**
   * Verified live Sectors contract:
   *
   * row.commodity_stats.unit
   *
   * Legacy row.unit is fallback-only.
   */
  return normalizeUnit(
    row.commodity_stats?.unit ??
      row.unit
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

function semanticKnowledge(
  metric: string,
  description: string,
  sourceField: string
): RXSemanticKnowledge {
  /**
   * Production and sales are the only
   * mining-performance semantics activated for the
   * current detector.
   *
   * Their KNOWN state is tied to explicit source-field
   * mappings rather than merely to the presence of a
   * human-readable semanticDescription.
   */
  if (
    metric === "PRODUCTION" ||
    metric === "SALES"
  ) {
    return {
      state: "KNOWN",

      description,

      basis:
        `Validated RX mapping from Sectors mining performance field ${sourceField}.`,
    };
  }

  /**
   * Resource/reserve observations remain conservative
   * until field-level geological semantics, units and
   * measurement-year alignment are activated.
   */
  return {
    state: "UNKNOWN",

    description,
  };
}

export function normalizeMiningPerformanceRow(
  input: NormalizeMiningPerformanceInput
): RXNormalizedObservation[] {
  const commodityRaw =
    input.row.commodity_type ??
    input.row.commodity;

  const commodity =
    normalizeCommodity(
      commodityRaw
    );

  /**
   * Unsupported or unknown commodity is not silently
   * coerced.
   *
   * Aluminium/Bauxite remains outside the locked MVP
   * universe.
   */
  if (!commodity) {
    return [];
  }

  const unit =
    resolveUnit(
      input.row
    );

  const subtype =
    resolveCommoditySubtype(
      input.row
    );

  const metrics =
    extractMiningMetrics(
      input.row
    );

  return metrics.map(
    (metric, index) => {
      const description =
        semanticDescription(
          metric.metric,
          commodity,
          subtype
        );

      return {
        id: [
          input.companyId,
          commodity,
          subtype ?? "GENERAL",
          metric.sourceField,
          input.row.year ??
            "UNKNOWN-YEAR",
          index,
        ].join(":"),

        companyId:
          input.companyId,

        commodity,

        commoditySubtype:
          subtype,

        metric:
          metric.metric,

        value:
          metric.value,

        unit,

        period: {
          kind:
            typeof input.row.year ===
            "number"
              ? "YEAR"
              : "UNKNOWN",

          year:
            input.row.year,

          /**
           * Do NOT copy nested
           * resources_reserves.measurement_year here.
           *
           * That timestamp belongs specifically to the
           * geological resource/reserve evidence and
           * must not silently become the measurement
           * year of production/sales observations.
           *
           * Legacy measurement_year remains supported
           * only for legacy flat observations.
           */
          measurementYear:
            input.row
              .measurement_year ??
            undefined,
        },

        evidence: [
          {
            id: [
              "sectors",
              input.companyId,
              metric.sourceField,
              input.row.year ??
                "unknown",
            ].join(":"),

            provider:
              "SECTORS",

            source:
              input.source,

            retrievedAt:
              input.retrievedAt,

            truthClass:
              "SOURCE_FACT",
          },
        ],

        sourceField:
          metric.sourceField,

        semanticDescription:
          description,

        semantic:
          semanticKnowledge(
            metric.metric,
            description,
            metric.sourceField
          ),
      };
    }
  );
}