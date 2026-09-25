import type {
  SectorsMiningSalesDestinationResponse,
} from "../schemas/sectors-mining-sales-destination";

export interface RXNormalizedMiningSalesDestinationObservation {
  id: string;

  companyId: string;

  year: number;

  /**
   * Provider destination key preserved verbatim.
   *
   * It may represent a country, region, or another
   * provider-defined geography label.
   */
  destinationLabel: string;

  revenueUsd:
    number | null;

  percentageOfTotalRevenue:
    number | null;

  volume:
    number | null;

  percentageOfSalesVolume:
    number | null;

  commodityType:
    string | null;

  unit:
    string | null;

  sourceField:
    "data";

  semantic: {
    state: "KNOWN";

    description:
      "Provider-reported sales destination observation";

    basis:
      "SECTORS_SALES_DESTINATION";
  };

  evidence: [
    {
      source: "SECTORS";
      kind: "SOURCE_FACT";
    },
  ];
}

function nullableNumber(
  value: number | null | undefined
): number | null {
  return typeof value === "number"
    ? value
    : null;
}

function nullableString(
  value: string | null | undefined
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

function observationIdPart(
  value: string
): string {
  return encodeURIComponent(value);
}

/**
 * Normalizes provider sales-destination rows without
 * inventing missing values or geography semantics.
 *
 * No percentage is recomputed.
 * No revenue is derived.
 * No volume is derived.
 * No destination label is reclassified.
 * No causal explanation is inferred.
 */
export function normalizeMiningSalesDestination(
  companyId: string,
  response:
    SectorsMiningSalesDestinationResponse
): RXNormalizedMiningSalesDestinationObservation[] {
  return Object.entries(response.data)
    .sort(
      ([left], [right]) =>
        left.localeCompare(right)
    )
    .map(
      ([destinationLabel, entry]) => ({
        id: [
          "sales-destination",
          observationIdPart(companyId),
          response.year,
          observationIdPart(destinationLabel),
        ].join(":"),

        companyId,

        year:
          response.year,

        destinationLabel,

        revenueUsd:
          nullableNumber(
            entry.revenue_usd
          ),

        percentageOfTotalRevenue:
          nullableNumber(
            entry.percentage_of_total_revenue
          ),

        volume:
          nullableNumber(
            entry.volume
          ),

        percentageOfSalesVolume:
          nullableNumber(
            entry.percentage_of_sales_volume
          ),

        commodityType:
          nullableString(
            entry.commodity_type
          ),

        unit:
          nullableString(
            entry.unit
          ),

        sourceField:
          "data",

        semantic: {
          state:
            "KNOWN",

          description:
            "Provider-reported sales destination observation",

          basis:
            "SECTORS_SALES_DESTINATION",
        },

        evidence: [
          {
            source:
              "SECTORS",

            kind:
              "SOURCE_FACT",
          },
        ],
      })
    );
}