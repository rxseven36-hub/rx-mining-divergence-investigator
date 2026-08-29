import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateSectorsOperationRequest,
} from "../data/sectors/validate-operation-request";

describe(
  "Sectors operation temporal validation boundary",
  () => {
    it(
      "accepts mining historical performance for a single year",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_MINING_HISTORICAL_PERFORMANCE",
            purpose:
              "Investigate historical mining performance",
            params: {
              sectorsSlug: "aadi",
              period: {
                kind: "YEAR",
                year: 2024,
              },
            },
          });

        expect(result).toEqual({
          valid: true,
          issues: [],
        });
      }
    );

    it(
      "rejects mining historical performance with a range",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_MINING_HISTORICAL_PERFORMANCE",
            purpose:
              "Investigate historical mining performance",
            params: {
              sectorsSlug: "aadi",
              period: {
                kind: "RANGE",
                start: "2023-01-01",
                end: "2024-12-31",
              },
            },
          });

        expect(result.valid).toBe(false);
        expect(result.issues).toContain(
          "PERIOD_INVALID"
        );
      }
    );

    it(
      "rejects commodity price range exceeding three years",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_COMMODITY_PRICE_HISTORY",
            purpose:
              "Investigate commodity price context",
            params: {
              commodity: "COAL",
              period: {
                kind: "RANGE",
                start: "2021-01-01",
                end: "2024-12-31",
              },
            },
          });

        expect(result.valid).toBe(false);
        expect(result.issues).toContain(
          "PERIOD_INVALID"
        );
      }
    );

    it(
      "accepts commodity price range within three years",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_COMMODITY_PRICE_HISTORY",
            purpose:
              "Investigate commodity price context",
            params: {
              commodity: "GOLD",
              period: {
                kind: "RANGE",
                start: "2022-01-01",
                end: "2024-12-31",
              },
            },
          });

        expect(result).toEqual({
          valid: true,
          issues: [],
        });
      }
    );

    it(
      "rejects market YEAR instead of silently expanding it",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            purpose:
              "Investigate market reaction",
            params: {
              ticker: "AADI",
              period: {
                kind: "YEAR",
                year: 2024,
              },
            },
          });

        expect(result.valid).toBe(false);
        expect(result.issues).toContain(
          "PERIOD_INVALID"
        );
      }
    );

    it(
      "rejects market range exceeding ninety days",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            purpose:
              "Investigate market reaction",
            params: {
              ticker: "AADI",
              period: {
                kind: "RANGE",
                start: "2024-01-01",
                end: "2024-03-31",
              },
            },
          });

        expect(result.valid).toBe(false);
        expect(result.issues).toContain(
          "PERIOD_INVALID"
        );
      }
    );

    it(
      "accepts explicit market range within ninety days",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            purpose:
              "Investigate market reaction",
            params: {
              ticker: "AADI",
              period: {
                kind: "RANGE",
                start: "2024-12-01",
                end: "2024-12-31",
              },
            },
          });

        expect(result).toEqual({
          valid: true,
          issues: [],
        });
      }
    );

    it(
      "does not duplicate PERIOD_INVALID when generic period shape is already invalid",
      () => {
        const result =
          validateSectorsOperationRequest({
            operation:
              "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            purpose:
              "Investigate market reaction",
            params: {
              ticker: "AADI",
              period: {
                kind: "RANGE",
                start: "",
                end: "",
              },
            },
          });

        expect(
          result.issues.filter(
            (issue) =>
              issue === "PERIOD_INVALID"
          )
        ).toHaveLength(1);
      }
    );
  }
);