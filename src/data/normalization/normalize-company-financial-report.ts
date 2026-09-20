import type {
  SectorsCompanyFinancialReport,
} from "../schemas/sectors-company-financial-report";

export type RXFinancialEvidenceFamily =
  | "FINANCIAL_STATEMENT"
  | "FINANCIAL_RATIO"
  | "VALUATION";

export interface RXNormalizedFinancialObservation {
  id: string;

  companyId: string;

  family:
    RXFinancialEvidenceFamily;

  metric:
    string;

  value:
    number | null;

  sourceYear:
    number;

  sourceField:
    string;

  unit: {
    symbol: null;
    dimension: "UNSPECIFIED";
  };

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

export interface NormalizeCompanyFinancialReportInput {
  companyId: string;

  report:
    SectorsCompanyFinancialReport;

  source:
    string;

  retrievedAt?: string;
}

const FINANCIAL_STATEMENT_FIELDS = [
  "tax",
  "ebit",
  "ebitda",
  "revenue",
  "earnings",
  "net_debt",
  "cash_only",
  "total_debt",
  "inventories",
  "fixed_assets",
  "gross_profit",
  "total_assets",
  "total_equity",
  "net_cash_flow",
  "operating_pnl",
  "current_assets",
  "free_cash_flow",
  "long_term_debt",
  "prepaid_assets",
  "cost_of_revenue",
  "short_term_debt",
  "operating_expense",
  "retained_earnings",
  "total_liabilities",
  "outstanding_shares",
  "capital_expenditure",
  "current_liabilities",
  "earnings_before_tax",
  "financing_cash_flow",
  "investing_cash_flow",
  "operating_cash_flow",
  "cash_and_equivalents",
  "net_increased_decreased",
  "non_current_liabilities",
  "non_operating_income_or_loss",
  "total_cash_and_due_from_banks",
  "interest_expense_non_operating",
] as const;

const RATIO_FIELDS = {
  leverage: [
    "debt_to_asset_ratio",
    "debt_to_equity_ratio",
    "cash_flow_to_debt_ratio",
    "interest_coverage_ratio",
  ],

  liquidity: [
    "current_ratio",
    "operating_cash_flow_margin",
  ],

  efficiency: [
    "fixed_asset_turnover",
    "total_asset_turnover",
  ],

  profitability: [
    "roa",
    "roe",
    "net_profit_margin",
    "gross_profit_margin",
    "operating_profit_margin",
  ],
} as const;

const VALUATION_FIELDS = [
  "pb",
  "pe",
  "ps",
  "pcf",
  "peg",
  "enterprise_to_ebitda",
  "enterprise_to_revenue",
] as const;

function createObservation(
  input:
    NormalizeCompanyFinancialReportInput,

  family:
    RXFinancialEvidenceFamily,

  metric:
    string,

  value:
    number | null,

  year:
    number,

  sourceField:
    string,
): RXNormalizedFinancialObservation {
  return {
    id: [
      input.companyId,
      family,
      year,
      metric,
    ].join(":"),

    companyId:
      input.companyId,

    family,

    metric,

    value,

    sourceYear:
      year,

    sourceField,

    unit: {
      symbol:
        null,

      dimension:
        "UNSPECIFIED",
    },

    semantic: {
      state:
        "KNOWN",

      description:
        `${metric} reported by Sectors for ${year}`,

      basis:
        `Direct provider-supplied field ${sourceField}. Currency or unit is not inferred by RX.`,
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
  };
}

function normalizeStatements(
  input:
    NormalizeCompanyFinancialReportInput,
): RXNormalizedFinancialObservation[] {
  const rows =
    input.report.financials
      ?.historical_financials;

  if (!rows) {
    return [];
  }

  const observations:
    RXNormalizedFinancialObservation[] = [];

  rows.forEach(
    (row, rowIndex) => {
      for (
        const field
        of FINANCIAL_STATEMENT_FIELDS
      ) {
        const value =
          row[field];

        if (
          typeof value !== "number" &&
          value !== null
        ) {
          continue;
        }

        observations.push(
          createObservation(
            input,
            "FINANCIAL_STATEMENT",
            field,
            value,
            row.year,
            `financials.historical_financials[${rowIndex}].${field}`,
          ),
        );
      }
    },
  );

  return observations;
}

function normalizeRatios(
  input:
    NormalizeCompanyFinancialReportInput,
): RXNormalizedFinancialObservation[] {
  const rows =
    input.report.financials
      ?.historical_financial_ratio;

  if (!rows) {
    return [];
  }

  const observations:
    RXNormalizedFinancialObservation[] = [];

  rows.forEach(
    (row, rowIndex) => {
      const year =
        Number(row.year);

      if (!Number.isInteger(year)) {
        return;
      }

      for (
        const family
        of Object.keys(
          RATIO_FIELDS,
        ) as Array<
          keyof typeof RATIO_FIELDS
        >
      ) {
        const group =
          row[family];

        if (!group) {
          continue;
        }

        for (
          const field
          of RATIO_FIELDS[family]
        ) {
          const value =
            group[field];

          if (
            typeof value !== "number" &&
            value !== null
          ) {
            continue;
          }

          observations.push(
            createObservation(
              input,
              "FINANCIAL_RATIO",
              field,
              value,
              year,
              `financials.historical_financial_ratio[${rowIndex}].${family}.${field}`,
            ),
          );
        }
      }
    },
  );

  return observations;
}

function normalizeValuation(
  input:
    NormalizeCompanyFinancialReportInput,
): RXNormalizedFinancialObservation[] {
  const rows =
    input.report.valuation
      ?.historical_valuation;

  if (!rows) {
    return [];
  }

  const observations:
    RXNormalizedFinancialObservation[] = [];

  rows.forEach(
    (row, rowIndex) => {
      for (
        const field
        of VALUATION_FIELDS
      ) {
        const value =
          row[field];

        if (
          typeof value !== "number" &&
          value !== null
        ) {
          continue;
        }

        observations.push(
          createObservation(
            input,
            "VALUATION",
            field,
            value,
            row.year,
            `valuation.historical_valuation[${rowIndex}].${field}`,
          ),
        );
      }
    },
  );

  return observations;
}

/**
 * Normalize only explicitly verified provider fields.
 *
 * Deliberately excluded:
 * - top-level EPS;
 * - historical EPS;
 * - quarterly growth fields;
 * - intrinsic value;
 * - forward PE;
 * - last-close snapshot;
 * - peer averages;
 * - unknown passthrough fields;
 * - industry_breakdown.
 *
 * RX does not invent currency/unit and does not
 * recompute provider-supplied ratios.
 */
export function normalizeCompanyFinancialReport(
  input:
    NormalizeCompanyFinancialReportInput,
): RXNormalizedFinancialObservation[] {
  return [
    ...normalizeStatements(
      input,
    ),

    ...normalizeRatios(
      input,
    ),

    ...normalizeValuation(
      input,
    ),
  ];
}