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
      "accepts a valid company operation request",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_OPERATIONAL_CONTEXT",

          purpose:
            "Collect operational context for a divergence investigation.",

          params: {
            companyId: "AADI",

            period: {
              kind: "YEAR",
              year: 2024,
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
      "accepts a valid commodity operation request",
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
      "rejects an empty purpose",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_HISTORICAL_PERFORMANCE",

          purpose: "   ",

          params: {
            companyId: "AADI",

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
      "rejects an empty company id",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_COMPANY_MARKET_TRANSACTION_HISTORY",

          purpose:
            "Collect market reaction evidence.",

          params: {
            companyId: "   ",

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
          "COMPANY_ID_REQUIRED"
        );
      }
    );

    it(
      "rejects UNKNOWN period",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
          operation:
            "GET_MINING_OPERATIONAL_CONTEXT",

          purpose:
            "Collect operational context.",

          params: {
            companyId: "AADI",

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
            "GET_MINING_OPERATIONAL_CONTEXT",

          purpose:
            "Collect operational context.",

          params: {
            companyId: "AADI",

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
            "GET_MINING_OPERATIONAL_CONTEXT",

          purpose:
            "Collect operational context.",

          params: {
            companyId: "AADI",

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