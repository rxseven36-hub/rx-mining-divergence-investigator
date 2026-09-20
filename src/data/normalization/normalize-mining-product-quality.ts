import type {
  SectorsMiningPerformanceRow,
  SectorsMiningProduct,
} from "../schemas/sectors-mining-performance";

export type RXProductQualityMetric =
  | "CALORIFIC_VALUE"
  | "TOTAL_MOISTURE"
  | "ASH_ARB"
  | "TOTAL_SULPHUR_ARB"
  | "ASH_ADB"
  | "TOTAL_SULPHUR_ADB"
  | "VOLATILE_MATTER_ADB"
  | "FIXED_CARBON_ADB";

export interface RXNormalizedProductQualityObservation {
  id: string;

  companyId: string;

  commodityType: string | null;

  commoditySubtype: string | null;

  productName: string;

  metric: RXProductQualityMetric;

  min: number | null;

  max: number | null;

  unit: {
    symbol: "kcal/kg" | "%";
    dimension:
      | "ENERGY_PER_MASS"
      | "PERCENTAGE";
  };

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

export interface NormalizeMiningProductQualityInput {
  companyId: string;

  row: SectorsMiningPerformanceRow;

  source: string;

  retrievedAt?: string;
}

interface QualityFieldDefinition {
  field:
    | "calorific_value_kcal"
    | "total_moisture_pct"
    | "ash_content_arb"
    | "total_sulphur_arb"
    | "ash_content_adb"
    | "total_sulphur_adb"
    | "volatile_matter_adb"
    | "fixed_carbon_adb";

  metric: RXProductQualityMetric;

  description: string;

  unit: RXNormalizedProductQualityObservation["unit"];
}

const QUALITY_FIELDS: QualityFieldDefinition[] = [
  {
    field: "calorific_value_kcal",
    metric: "CALORIFIC_VALUE",
    description: "Calorific value",
    unit: {
      symbol: "kcal/kg",
      dimension: "ENERGY_PER_MASS",
    },
  },
  {
    field: "total_moisture_pct",
    metric: "TOTAL_MOISTURE",
    description: "Total moisture",
    unit: {
      symbol: "%",
      dimension: "PERCENTAGE",
    },
  },
  {
    field: "ash_content_arb",
    metric: "ASH_ARB",
    description: "Ash content ARB",
    unit: {
      symbol: "%",
      dimension: "PERCENTAGE",
    },
  },
  {
    field: "total_sulphur_arb",
    metric: "TOTAL_SULPHUR_ARB",
    description: "Total sulphur ARB",
    unit: {
      symbol: "%",
      dimension: "PERCENTAGE",
    },
  },
  {
    field: "ash_content_adb",
    metric: "ASH_ADB",
    description: "Ash content ADB",
    unit: {
      symbol: "%",
      dimension: "PERCENTAGE",
    },
  },
  {
    field: "total_sulphur_adb",
    metric: "TOTAL_SULPHUR_ADB",
    description: "Total sulphur ADB",
    unit: {
      symbol: "%",
      dimension: "PERCENTAGE",
    },
  },
  {
    field: "volatile_matter_adb",
    metric: "VOLATILE_MATTER_ADB",
    description: "Volatile matter ADB",
    unit: {
      symbol: "%",
      dimension: "PERCENTAGE",
    },
  },
  {
    field: "fixed_carbon_adb",
    metric: "FIXED_CARBON_ADB",
    description: "Fixed carbon ADB",
    unit: {
      symbol: "%",
      dimension: "PERCENTAGE",
    },
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

function normalizeProduct(
  input: NormalizeMiningProductQualityInput,
  product: SectorsMiningProduct,
  productIndex: number,
): RXNormalizedProductQualityObservation[] {
  const productName =
    typeof product.product_name === "string" &&
    product.product_name.trim().length > 0
      ? product.product_name.trim()
      : `UNNAMED_PRODUCT_${productIndex + 1}`;

  const sourcePerformanceYear =
    typeof input.row.year === "number"
      ? input.row.year
      : null;

  const commodityType =
    typeof input.row.commodity_type === "string"
      ? input.row.commodity_type
      : null;

  const commoditySubtype =
    typeof input.row.commodity_sub_type === "string"
      ? input.row.commodity_sub_type
      : null;

  const observations:
    RXNormalizedProductQualityObservation[] = [];

  for (const definition of QUALITY_FIELDS) {
    if (
      !hasOwn(
        product,
        definition.field,
      )
    ) {
      continue;
    }

    const range =
      product[definition.field];

    if (
      !range ||
      typeof range !== "object"
    ) {
      continue;
    }

    const min =
      typeof range.min === "number"
        ? range.min
        : null;

    const max =
      typeof range.max === "number"
        ? range.max
        : null;

    if (
      min === null &&
      max === null
    ) {
      continue;
    }

    const sourceField =
      `commodity_stats.products[${productIndex}].${definition.field}`;

    observations.push({
      id: [
        input.companyId,
        productName,
        definition.metric,
        sourcePerformanceYear ??
          "UNKNOWN-PERFORMANCE-YEAR",
        sourceField,
      ].join(":"),

      companyId:
        input.companyId,

      commodityType,

      commoditySubtype,

      productName,

      metric:
        definition.metric,

      min,

      max,

      unit:
        definition.unit,

      sourcePerformanceYear,

      sourceField,

      semantic: {
        state: "KNOWN",

        description:
          `${definition.description} reported by Sectors for product ${productName}`,

        basis:
          `Validated RX mapping from explicit Sectors product-quality field ${sourceField}.`,
      },

      evidence: [
        {
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
    });
  }

  return observations;
}

/**
 * Dedicated normalizer for mining product quality.
 *
 * IMPORTANT:
 * - Reads only commodity_stats.products[].
 * - Product identity remains explicit.
 * - ARB and ADB fields remain distinct.
 * - Source min/max ranges are preserved.
 * - RX never derives a midpoint from a range.
 * - null is not zero.
 * - Missing fields are not invented.
 * - Performance year is source context only.
 * - No causal conclusion is created here.
 */
export function normalizeMiningProductQuality(
  input: NormalizeMiningProductQualityInput,
): RXNormalizedProductQualityObservation[] {
  const products =
    input.row.commodity_stats?.products;

  if (
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return [];
  }

  return products.flatMap(
    (product, index) =>
      normalizeProduct(
        input,
        product,
        index,
      ),
  );
}