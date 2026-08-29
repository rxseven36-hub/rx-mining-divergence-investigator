import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bindInvestigationOperationRequest,
} from "../investigation/bind-operation-request";

const context = {
  companyId: "AADI",

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
      "binds operational capability to company params",
      () => {
        const request =
          bindInvestigationOperationRequest(
            "MINING_OPERATIONAL_CONTEXT",
            "Collect operational context.",
            context
          );

        expect(request).toEqual({
          operation:
            "GET_MINING_OPERATIONAL_CONTEXT",

          purpose:
            "Collect operational context.",

          params: {
            companyId: "AADI",

            period: {
              kind: "YEAR",
              year: 2024,
            },
          },
        });
      }
    );

    it(
      "binds historical capability to company params",
      () => {
        const request =
          bindInvestigationOperationRequest(
            "MINING_HISTORICAL_PERFORMANCE",
            "Collect historical performance.",
            context
          );

        expect(request.operation).toBe(
          "GET_MINING_HISTORICAL_PERFORMANCE"
        );

        expect(request.params).toEqual({
          companyId: "AADI",
          period: context.period,
        });
      }
    );

    it(
      "binds commodity capability to commodity params",
      () => {
        const request =
          bindInvestigationOperationRequest(
            "COMMODITY_PRICE_HISTORY",
            "Collect commodity context.",
            context
          );

        expect(request).toEqual({
          operation:
            "GET_COMMODITY_PRICE_HISTORY",

          purpose:
            "Collect commodity context.",

          params: {
            commodity: "COAL",
            period: context.period,
          },
        });
      }
    );

    it(
      "binds market capability to company params",
      () => {
        const request =
          bindInvestigationOperationRequest(
            "COMPANY_MARKET_TRANSACTION_HISTORY",
            "Collect market reaction.",
            context
          );

        expect(request.operation).toBe(
          "GET_COMPANY_MARKET_TRANSACTION_HISTORY"
        );

        expect(request.params).toEqual({
          companyId: "AADI",
          period: context.period,
        });
      }
    );
  }
);