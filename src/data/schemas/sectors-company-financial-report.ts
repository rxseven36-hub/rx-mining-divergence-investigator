import { z } from "zod";

const nullableNumber =
  z.number().nullable();

const financialRowSchema =
  z
    .object({
      year:
        z.number().int(),

      tax:
        nullableNumber.optional(),

      ebit:
        nullableNumber.optional(),

      ebitda:
        nullableNumber.optional(),

      revenue:
        nullableNumber.optional(),

      earnings:
        nullableNumber.optional(),

      net_debt:
        nullableNumber.optional(),

      cash_only:
        nullableNumber.optional(),

      total_debt:
        nullableNumber.optional(),

      inventories:
        nullableNumber.optional(),

      fixed_assets:
        nullableNumber.optional(),

      gross_profit:
        nullableNumber.optional(),

      total_assets:
        nullableNumber.optional(),

      total_equity:
        nullableNumber.optional(),

      net_cash_flow:
        nullableNumber.optional(),

      operating_pnl:
        nullableNumber.optional(),

      current_assets:
        nullableNumber.optional(),

      free_cash_flow:
        nullableNumber.optional(),

      long_term_debt:
        nullableNumber.optional(),

      prepaid_assets:
        nullableNumber.optional(),

      cost_of_revenue:
        nullableNumber.optional(),

      short_term_debt:
        nullableNumber.optional(),

      operating_expense:
        nullableNumber.optional(),

      retained_earnings:
        nullableNumber.optional(),

      total_liabilities:
        nullableNumber.optional(),

      outstanding_shares:
        nullableNumber.optional(),

      capital_expenditure:
        nullableNumber.optional(),

      current_liabilities:
        nullableNumber.optional(),

      earnings_before_tax:
        nullableNumber.optional(),

      financing_cash_flow:
        nullableNumber.optional(),

      investing_cash_flow:
        nullableNumber.optional(),

      operating_cash_flow:
        nullableNumber.optional(),

      cash_and_equivalents:
        nullableNumber.optional(),

      net_increased_decreased:
        nullableNumber.optional(),

      non_current_liabilities:
        nullableNumber.optional(),

      non_operating_income_or_loss:
        nullableNumber.optional(),

      total_cash_and_due_from_banks:
        nullableNumber.optional(),

      interest_expense_non_operating:
        nullableNumber.optional(),
    })
    .passthrough();

const leverageSchema =
  z
    .object({
      debt_to_asset_ratio:
        nullableNumber.optional(),

      debt_to_equity_ratio:
        nullableNumber.optional(),

      cash_flow_to_debt_ratio:
        nullableNumber.optional(),

      interest_coverage_ratio:
        nullableNumber.optional(),
    })
    .passthrough();

const liquiditySchema =
  z
    .object({
      current_ratio:
        nullableNumber.optional(),

      operating_cash_flow_margin:
        nullableNumber.optional(),
    })
    .passthrough();

const efficiencySchema =
  z
    .object({
      fixed_asset_turnover:
        nullableNumber.optional(),

      total_asset_turnover:
        nullableNumber.optional(),
    })
    .passthrough();

const profitabilitySchema =
  z
    .object({
      roa:
        nullableNumber.optional(),

      roe:
        nullableNumber.optional(),

      net_profit_margin:
        nullableNumber.optional(),

      gross_profit_margin:
        nullableNumber.optional(),

      operating_profit_margin:
        nullableNumber.optional(),
    })
    .passthrough();

const financialRatioRowSchema =
  z
    .object({
      year:
        z.string().regex(/^\d{4}$/),

      leverage:
        leverageSchema.optional(),

      liquidity:
        liquiditySchema.optional(),

      efficiency:
        efficiencySchema.optional(),

      profitability:
        profitabilitySchema.optional(),
    })
    .passthrough();

const valuationRowSchema =
  z
    .object({
      year:
        z.number().int(),

      pb:
        nullableNumber.optional(),

      pe:
        nullableNumber.optional(),

      ps:
        nullableNumber.optional(),

      pcf:
        nullableNumber.optional(),

      peg:
        nullableNumber.optional(),

      enterprise_to_ebitda:
        nullableNumber.optional(),

      enterprise_to_revenue:
        nullableNumber.optional(),
    })
    .passthrough();

const financialsSchema =
  z
    .object({
      eps:
        nullableNumber.optional(),

      historical_eps:
        z.record(
          z.string(),
          z
            .object({
              eps:
                nullableNumber.optional(),

              eps_growth:
                nullableNumber.optional(),
            })
            .passthrough(),
        ).optional(),

      historical_financials:
        z.array(
          financialRowSchema,
        ).optional(),

      historical_financial_ratio:
        z.array(
          financialRatioRowSchema,
        ).optional(),

      yoy_quarter_earnings_growth:
        nullableNumber.optional(),

      yoy_quarter_revenue_growth:
        nullableNumber.optional(),
    })
    .passthrough();

const valuationSchema =
  z
    .object({
      last_close_price:
        nullableNumber.optional(),

      latest_close_date:
        z.string().nullable().optional(),

      daily_close_change:
        nullableNumber.optional(),

      forward_pe:
        nullableNumber.optional(),

      intrinsic_value:
        nullableNumber.optional(),

      historical_valuation:
        z.array(
          valuationRowSchema,
        ).optional(),
    })
    .passthrough();

export const sectorsCompanyFinancialReportSchema =
  z
    .object({
      symbol:
        z.string().optional(),

      company_name:
        z.string().optional(),

      financials:
        financialsSchema.optional(),

      valuation:
        valuationSchema.optional(),
    })
    .passthrough();

export type SectorsCompanyFinancialReport =
  z.infer<
    typeof sectorsCompanyFinancialReportSchema
  >;