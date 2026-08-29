import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateOperationTemporalEligibility,
} from "../data/sectors/operation-temporal-eligibility";

describe(
  "evaluateOperationTemporalEligibility",
  () => {
    it(
      "accepts YEAR for mining operational context",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_MINING_OPERATIONAL_CONTEXT",
            {
              kind: "YEAR",
              year: 2024,
            }
          )
        ).toEqual({
          eligible: true,
          issues: [],
        });
      }
    );

    it(
      "accepts YEAR for mining historical performance",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_MINING_HISTORICAL_PERFORMANCE",
            {
              kind: "YEAR",
              year: 2023,
            }
          ).eligible
        ).toBe(true);
      }
    );

    it(
      "rejects RANGE for mining performance operations",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_MINING_HISTORICAL_PERFORMANCE",
            {
              kind: "RANGE",
              start: "2023-01-01",
              end: "2024-12-31",
            }
          ).issues
        ).toContain("YEAR_REQUIRED");
      }
    );

    it(
      "accepts one YEAR for commodity price",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMMODITY_PRICE_HISTORY",
            {
              kind: "YEAR",
              year: 2024,
            }
          ).eligible
        ).toBe(true);
      }
    );

    it(
      "accepts commodity range spanning three calendar years",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMMODITY_PRICE_HISTORY",
            {
              kind: "RANGE",
              start: "2022-01-01",
              end: "2024-12-31",
            }
          )
        ).toEqual({
          eligible: true,
          issues: [],
        });
      }
    );

    it(
      "rejects commodity range exceeding three calendar years",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMMODITY_PRICE_HISTORY",
            {
              kind: "RANGE",
              start: "2021-01-01",
              end: "2024-12-31",
            }
          ).issues
        ).toContain(
          "COMMODITY_RANGE_EXCEEDS_3_YEARS"
        );
      }
    );

    it(
      "rejects reversed commodity range",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMMODITY_PRICE_HISTORY",
            {
              kind: "RANGE",
              start: "2024-01-01",
              end: "2023-12-31",
            }
          ).issues
        ).toContain(
          "RANGE_ORDER_INVALID"
        );
      }
    );

    it(
      "accepts explicit market date range within 90 days",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            {
              kind: "RANGE",
              start: "2024-12-01",
              end: "2024-12-31",
            }
          )
        ).toEqual({
          eligible: true,
          issues: [],
        });
      }
    );

    it(
      "accepts exactly 90 inclusive days for market data",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            {
              kind: "RANGE",
              start: "2024-01-01",
              end: "2024-03-30",
            }
          ).eligible
        ).toBe(true);
      }
    );

    it(
      "rejects market date range over 90 days",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            {
              kind: "RANGE",
              start: "2024-01-01",
              end: "2024-03-31",
            }
          ).issues
        ).toContain(
          "MARKET_RANGE_EXCEEDS_90_DAYS"
        );
      }
    );

    it(
      "rejects YEAR for market data instead of silently expanding it",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            {
              kind: "YEAR",
              year: 2024,
            }
          ).issues
        ).toContain(
          "DATE_RANGE_REQUIRED"
        );
      }
    );

    it(
      "rejects malformed market dates",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            {
              kind: "RANGE",
              start: "2024-02-30",
              end: "2024-03-10",
            }
          ).issues
        ).toContain(
          "DATE_RANGE_REQUIRED"
        );
      }
    );

    it(
      "rejects reversed market range",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            {
              kind: "RANGE",
              start: "2024-03-10",
              end: "2024-03-01",
            }
          ).issues
        ).toContain(
          "RANGE_ORDER_INVALID"
        );
      }
    );

    it(
      "rejects MONTH for commodity endpoint",
      () => {
        expect(
          evaluateOperationTemporalEligibility(
            "GET_COMMODITY_PRICE_HISTORY",
            {
              kind: "MONTH",
              year: 2024,
              month: 1,
            }
          ).issues
        ).toContain(
          "YEAR_RANGE_REQUIRED"
        );
      }
    );
  }
);