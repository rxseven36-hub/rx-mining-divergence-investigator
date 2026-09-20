import {
  describe,
  expect,
  it,
} from "vitest";

import {
  admitCompanyFinancialEvidence,
} from "../investigation/admit-company-financial-evidence";

import {
  analyzeCompanyFinancialEvidence,
} from "../investigation/analyze-company-financial-evidence";

function liveShapeFixture() {
  return {
    symbol:
      "BUMI.JK",

    company_name:
      "Bumi Resources Tbk",

    financials: {
      eps:
        3.6512836632569425,

      historical_eps: {
        "2024": {
          eps:
            2.936007032163935,

          eps_growth:
            5.4644,
        },
      },

      historical_financials: [
        {
          year:
            2023,

          revenue:
            100,

          earnings:
            10,

          industry_breakdown:
            null,
        },

        {
          year:
            2024,

          revenue:
            120,

          earnings:
            15,

          total_assets:
            500,
        },
      ],

      historical_financial_ratio: [
        {
          year:
            "2023",

          leverage: {
            debt_to_equity_ratio:
              0.5,
          },

          liquidity: {
            current_ratio:
              0.9,
          },

          efficiency: {
            total_asset_turnover:
              0.4,
          },

          profitability: {
            roe:
              0.01,
          },
        },

        {
          year:
            "2024",

          leverage: {
            debt_to_equity_ratio:
              0.45,
          },

          liquidity: {
            current_ratio:
              1.0,
          },

          efficiency: {
            total_asset_turnover:
              0.33,
          },

          profitability: {
            roe:
              0.02,
          },
        },
      ],

      yoy_quarter_earnings_growth:
        14.06,

      yoy_quarter_revenue_growth:
        0.5,
    },

    valuation: {
      last_close_price:
        193,

      latest_close_date:
        "2026-09-18",

      forward_pe:
        null,

      intrinsic_value:
        -156,

      historical_valuation: [
        {
          year:
            2023,

          pe:
            20,

          pb:
            0.7,

          pb_peer_avg:
            1.0,

          pe_peer_avg:
            8.5,
        },

        {
          year:
            2024,

          pe:
            40,

          pb:
            0.9,

          enterprise_to_ebitda:
            9.6,

          pb_peer_avg:
            0.93,

          pe_peer_avg:
            8.67,
        },
      ],
    },
  };
}

describe(
  "financial evidence live-contract alignment",
  () => {
    it(
      "accepts verified nested financials and valuation shape",
      () => {
        const result =
          admitCompanyFinancialEvidence({
            companyId:
              "rx-company-bumi",

            sourceReference:
              "sectors-mcp:fetch-company-report:BUMI",

            payload:
              liveShapeFixture(),
          });

        expect(
          result.status,
        ).toBe(
          "ADMITTED",
        );
      },
    );

    it(
      "flattens nested ratio families and converts source year safely",
      () => {
        const result =
          admitCompanyFinancialEvidence({
            companyId:
              "rx-company-bumi",

            sourceReference:
              "SECTORS_TEST",

            payload:
              liveShapeFixture(),
          });

        expect(
          result.status,
        ).toBe(
          "ADMITTED",
        );

        if (
          result.status !==
          "ADMITTED"
        ) {
          throw new Error(
            "Expected financial evidence.",
          );
        }

        const roe =
          result.admittedObservations.find(
            (item) =>
              item.family ===
                "FINANCIAL_RATIO" &&
              item.metric ===
                "roe" &&
              item.sourceYear ===
                2024,
          );

        expect(
          roe?.value,
        ).toBe(
          0.02,
        );

        expect(
          roe?.sourceField,
        ).toContain(
          ".profitability.roe",
        );
      },
    );

    it(
      "does not admit unapproved or semantically opaque fields",
      () => {
        const result =
          admitCompanyFinancialEvidence({
            companyId:
              "rx-company-bumi",

            sourceReference:
              "SECTORS_TEST",

            payload:
              liveShapeFixture(),
          });

        expect(
          result.status,
        ).toBe(
          "ADMITTED",
        );

        if (
          result.status !==
          "ADMITTED"
        ) {
          throw new Error(
            "Expected financial evidence.",
          );
        }

        const metrics =
          result.admittedObservations.map(
            (item) =>
              item.metric,
          );

        expect(metrics).not.toContain(
          "industry_breakdown",
        );

        expect(metrics).not.toContain(
          "eps",
        );

        expect(metrics).not.toContain(
          "intrinsic_value",
        );

        expect(metrics).not.toContain(
          "pb_peer_avg",
        );

        expect(metrics).not.toContain(
          "pe_peer_avg",
        );

        expect(metrics).not.toContain(
          "last_close_price",
        );

        expect(metrics).not.toContain(
          "yoy_quarter_earnings_growth",
        );
      },
    );

    it(
      "preserves null values and does not invent units",
      () => {
        const payload =
          liveShapeFixture();

        payload.financials
          .historical_financials[1]
          .earnings =
            null as unknown as number;

        const result =
          admitCompanyFinancialEvidence({
            companyId:
              "rx-company-bumi",

            sourceReference:
              "SECTORS_TEST",

            payload,
          });

        expect(
          result.status,
        ).toBe(
          "ADMITTED",
        );

        if (
          result.status !==
          "ADMITTED"
        ) {
          throw new Error(
            "Expected financial evidence.",
          );
        }

        const earnings =
          result.admittedObservations.find(
            (item) =>
              item.metric ===
                "earnings" &&
              item.sourceYear ===
                2024,
          );

        expect(
          earnings?.value,
        ).toBeNull();

        expect(
          result.admittedObservations.every(
            (item) =>
              item.unit.symbol ===
                null &&
              item.unit.dimension ===
                "UNSPECIFIED",
          ),
        ).toBe(true);
      },
    );

    it(
      "deterministically compares admitted historical observations",
      () => {
        const admission =
          admitCompanyFinancialEvidence({
            companyId:
              "rx-company-bumi",

            sourceReference:
              "SECTORS_TEST",

            payload:
              liveShapeFixture(),
          });

        expect(
          admission.status,
        ).toBe(
          "ADMITTED",
        );

        if (
          admission.status !==
          "ADMITTED"
        ) {
          throw new Error(
            "Expected financial evidence.",
          );
        }

        const analysis =
          analyzeCompanyFinancialEvidence(
            admission.admittedObservations,
          );

        expect(
          analysis.status,
        ).toBe(
          "ANALYZED",
        );

        expect(
          analysis.period,
        ).toEqual({
          startYear:
            2023,

          endYear:
            2024,
        });

        const revenue =
          analysis.metrics.find(
            (item) =>
              item.family ===
                "FINANCIAL_STATEMENT" &&
              item.metric ===
                "revenue",
          );

        expect(
          revenue?.firstValue,
        ).toBe(
          100,
        );

        expect(
          revenue?.latestValue,
        ).toBe(
          120,
        );

        expect(
          revenue?.absoluteChange,
        ).toBe(
          20,
        );

        expect(
          revenue?.percentageChange,
        ).toBeCloseTo(
          20,
        );

        expect(
          analysis.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );

        expect(
          analysis.observedRelationship,
        ).not.toMatch(
          /cause|caused|because|bullish|bearish|cheap|expensive/i,
        );
      },
    );

    it(
      "returns explicit no-evidence analysis",
      () => {
        expect(
          analyzeCompanyFinancialEvidence(
            [],
          ),
        ).toEqual({
          status:
            "NO_FINANCIAL_EVIDENCE",

          companyId:
            null,

          period: {
            startYear:
              null,

            endYear:
              null,
          },

          metrics:
            [],

          observedRelationship:
            "No admitted financial observations are available for deterministic analysis.",

          causalConclusion:
            "UNKNOWN",
        });
      },
    );

    it(
      "rejects the obsolete root-level synthetic contract",
      () => {
        const result =
          admitCompanyFinancialEvidence({
            companyId:
              "rx-company-bumi",

            sourceReference:
              "SECTORS_TEST",

            payload: {
              historical_financials: [
                {
                  year:
                    2024,

                  revenue:
                    100,
                },
              ],
            },
          });

        expect(
          result.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          result.issues,
        ).toContain(
          "NO_ADMISSIBLE_FINANCIAL_EVIDENCE",
        );
      },
    );
  },
);