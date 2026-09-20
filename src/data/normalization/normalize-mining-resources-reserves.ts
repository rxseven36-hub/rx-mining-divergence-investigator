import type {
  SectorsMiningPerformanceRow,
} from "../schemas/sectors-mining-performance";

export type RXGeologicalMetric =
  | "TOTAL_RESOURCE"
  | "MEASURED_RESOURCE"
  | "INDICATED_RESOURCE"
  | "INFERRED_RESOURCE"
  | "TOTAL_RESERVE"
  | "PROVEN_RESERVE"
  | "PROBABLE_RESERVE";

export interface RXNormalizedGeologicalObservation {
  id: string;

  companyId: string;

  metric: RXGeologicalMetric;

  value: number;

  unit: {
    symbol: "Mt";
    dimension: "MASS";
  };

  measurementYear: number | null;

  sourcePerformanceYear: number | null;

  sourceField: string;

  semantic: {
    state: "KNOWN";
    description: string;
    basis: string;
  };

  evidence: [
    {
      provider: "SECTORS";
      source: string;
      retrievedAt?: string;
      truthClass: "SOURCE_FACT";
    },
  ];
}

export interface NormalizeMiningResourcesReservesInput {
  companyId: string;

  row: SectorsMiningPerformanceRow;

  source: string;

  retrievedAt?: string;
}

interface GeologicalFieldDefinition {
  field:
    | "total_resources_Mt"
    | "measured_resources_Mt"
    | "indicated_resources_Mt"
    | "inferred_resources_Mt"
    | "total_reserves_Mt"
    | "proven_reserves_Mt"
    | "probable_reserves_Mt";

  metric: RXGeologicalMetric;

  description: string;
}

const GEOLOGICAL_FIELDS: GeologicalFieldDefinition[] = [
  {
    field: "total_resources_Mt",
    metric: "TOTAL_RESOURCE",
    description: "Total resources",
  },
  {
    field: "measured_resources_Mt",
    metric: "MEASURED_RESOURCE",
    description: "Measured resources",
  },
  {
    field: "indicated_resources_Mt",
    metric: "INDICATED_RESOURCE",
    description: "Indicated resources",
  },
  {
    field: "inferred_resources_Mt",
    metric: "INFERRED_RESOURCE",
    description: "Inferred resources",
  },
  {
    field: "total_reserves_Mt",
    metric: "TOTAL_RESERVE",
    description: "Total reserves",
  },
  {
    field: "proven_reserves_Mt",
    metric: "PROVEN_RESERVE",
    description: "Proven reserves",
  },
  {
    field: "probable_reserves_Mt",
    metric: "PROBABLE_RESERVE",
    description: "Probable reserves",
  },
];

const hasOwn = (
  value: object,
  key: PropertyKey,
): boolean =>
  Object.prototype.hasOwnProperty.call(
    value,
    key,
  );

/**
 * Dedicated normalizer for geological resources/reserves.
 *
 * IMPORTANT:
 * - Geological measurement year comes only from
 *   commodity_stats.resources_reserves.measurement_year.
 * - row.year is retained only as source-performance context.
 * - Mt is established by the explicit canonical field names.
 * - null is not zero.
 * - Missing fields are not invented.
 * - Totals and category components are not derived from
 *   one another.
 */
export function normalizeMiningResourcesReserves(
  input: NormalizeMiningResourcesReservesInput,
): RXNormalizedGeologicalObservation[] {
  const geological =
    input.row.commodity_stats?.resources_reserves;

  if (!geological) {
    return [];
  }

  const measurementYear =
    typeof geological.measurement_year === "number"
      ? geological.measurement_year
      : null;

  const sourcePerformanceYear =
    typeof input.row.year === "number"
      ? input.row.year
      : null;

  const observations:
    RXNormalizedGeologicalObservation[] = [];

  for (const definition of GEOLOGICAL_FIELDS) {
    if (
      !hasOwn(
        geological,
        definition.field,
      )
    ) {
      continue;
    }

    const value =
      geological[definition.field];

    if (typeof value !== "number") {
      continue;
    }

    const sourceField =
      `commodity_stats.resources_reserves.${definition.field}`;

    observations.push({
      id: [
        input.companyId,
        definition.metric,
        measurementYear ??
          "UNKNOWN-MEASUREMENT-YEAR",
        sourceField,
      ].join(":"),

      companyId:
        input.companyId,

      metric:
        definition.metric,

      value,

      unit: {
        symbol: "Mt",
        dimension: "MASS",
      },

      measurementYear,

      sourcePerformanceYear,

      sourceField,

      semantic: {
        state: "KNOWN",

        description:
          `${definition.description} reported by Sectors`,

        basis:
          `Validated RX mapping from explicit Sectors geological field ${sourceField}.`,
      },

      evidence: [
        {
          provider: "SECTORS",
          source:
            input.source,
          retrievedAt:
            input.retrievedAt,
          truthClass:
            "SOURCE_FACT",
        },
      ],
    });
  }

  return observations;
}