import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bindInvestigationOperationRequest,
} from "../investigation/bind-operation-request";

const context = {
  companyId: "company-aadi",
  ticker: "AADI",
  commodity: "COAL" as const,
  period: {
    kind: "YEAR" as const,
    year: 2024,
  },
};

describe(
  "bindInvestigationOperationRequest",
  () => {
    it(
      "binds operational capability with company id",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "MINING_OPERATIONAL_CONTEXT",
            "Collect operational context.",
            context
          );

        expect(result).toEqual({
          status: "BOUND",
          request: {
            operation:
              "GET_MINING_OPERATIONAL_CONTEXT",
            purpose:
              "Collect operational context.",
            params: {
              companyId: "company-aadi",
              period: context.period,
            },
          },
          issues: [],
        });
      }
    );

    it(
      "binds historical capability with company id",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "MINING_HISTORICAL_PERFORMANCE",
            "Collect historical performance.",
            context
          );

        expect(result.status).toBe(
          "BOUND"
        );

        if (result.status !== "BOUND") {
          throw new Error(
            "Expected bound request"
          );
        }

        expect(result.request.params).toEqual({
          companyId: "company-aadi",
          period: context.period,
        });
      }
    );

    it(
      "binds commodity capability with canonical commodity",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "COMMODITY_PRICE_HISTORY",
            "Collect commodity context.",
            context
          );

        expect(result).toEqual({
          status: "BOUND",
          request: {
            operation:
              "GET_COMMODITY_PRICE_HISTORY",
            purpose:
              "Collect commodity context.",
            params: {
              commodity: "COAL",
              period: context.period,
            },
          },
          issues: [],
        });
      }
    );

    it(
      "binds market capability with ticker instead of company id",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "COMPANY_MARKET_TRANSACTION_HISTORY",
            "Collect market reaction.",
            context
          );

        expect(result).toEqual({
          status: "BOUND",
          request: {
            operation:
              "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            purpose:
              "Collect market reaction.",
            params: {
              ticker: "AADI",
              period: context.period,
            },
          },
          issues: [],
        });
      }
    );

    it(
      "rejects market binding when ticker is unavailable",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "COMPANY_MARKET_TRANSACTION_HISTORY",
            "Collect market reaction.",
            {
              ...context,
              ticker: undefined,
            }
          );

        expect(result).toEqual({
          status: "REJECTED",
          request: null,
          issues: ["TICKER_REQUIRED"],
        });
      }
    );

    it(
      "does not substitute company id for a missing ticker",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "COMPANY_MARKET_TRANSACTION_HISTORY",
            "Collect market reaction.",
            {
              companyId: "AADI",
              commodity: "COAL",
              period: context.period,
            }
          );

        expect(result.status).toBe(
          "REJECTED"
        );
      }
    );
  }
);