import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXSectorsTypedOperationRequest,
} from "../data/sectors/sectors-operation-request";

import {
  validateSectorsOperationRequest,
} from "../data/sectors/validate-operation-request";

describe(
  "validateSectorsOperationRequest",
  () => {
    it(
      "accepts a valid mining company operation",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_OPERATIONAL_CONTEXT",
          purpose:
            "Collect operational context.",
          params: {
            sectorsSlug: "aadi",
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          )
        ).toEqual({
          valid: true,
          issues: [],
        });
      }
    );

    it(
      "accepts a valid commodity operation",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_COMMODITY_PRICE_HISTORY",
          purpose:
            "Collect coal price context.",
          params: {
            commodity: "COAL",
            period: {
              kind: "RANGE",
              start: "2024-01-01",
              end: "2024-12-31",
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).valid
        ).toBe(true);
      }
    );

    it(
      "accepts market transaction request with ticker",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
          purpose:
            "Collect market reaction.",
          params: {
            ticker: "AADI",
            period: {
              kind: "RANGE",
              start: "2024-12-01",
              end: "2024-12-31",
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          )
        ).toEqual({
          valid: true,
          issues: [],
        });
      }
    );

    it(
      "rejects empty purpose",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_HISTORICAL_PERFORMANCE",
          purpose: "   ",
          params: {
            sectorsSlug: "aadi",
            period: {
              kind: "YEAR",
              year: 2024,
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).issues
        ).toContain("PURPOSE_REQUIRED");
      }
    );

    it(
      "rejects empty mining company id",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_HISTORICAL_PERFORMANCE",
          purpose:
            "Collect historical evidence.",
          params: {
            sectorsSlug: "   ",
            period: {
              kind: "YEAR",
              year: 2024,
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).issues
        ).toContain(
          "SECTORS_SLUG_REQUIRED"
        );
      }
    );

    it(
      "rejects empty market ticker",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
          purpose:
            "Collect market evidence.",
          params: {
            ticker: "   ",
            period: {
              kind: "RANGE",
              start: "2024-12-01",
              end: "2024-12-31",
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).issues
        ).toContain("TICKER_REQUIRED");
      }
    );

    it(
      "rejects UNKNOWN period",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_HISTORICAL_PERFORMANCE",
          purpose:
            "Collect operational context.",
          params: {
            sectorsSlug: "aadi",
            period: {
              kind: "UNKNOWN",
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).issues
        ).toContain("PERIOD_INVALID");
      }
    );

    it(
      "rejects invalid month",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_HISTORICAL_PERFORMANCE",
          purpose:
            "Collect operational context.",
          params: {
            sectorsSlug: "aadi",
            period: {
              kind: "MONTH",
              year: 2024,
              month: 13,
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).issues
        ).toContain("PERIOD_INVALID");
      }
    );

    it(
      "rejects invalid quarter",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_HISTORICAL_PERFORMANCE",
          purpose:
            "Collect operational context.",
          params: {
            sectorsSlug: "aadi",
            period: {
              kind: "QUARTER",
              year: 2024,
              quarter: 5,
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).issues
        ).toContain("PERIOD_INVALID");
      }
    );

    it(
      "rejects incomplete range",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_COMMODITY_PRICE_HISTORY",
          purpose:
            "Collect commodity context.",
          params: {
            commodity: "GOLD",
            period: {
              kind: "RANGE",
              start: "2024-01-01",
            },
          },
        };

        expect(
          validateSectorsOperationRequest(
            request
          ).issues
        ).toContain("PERIOD_INVALID");
      }
    );
  }
);