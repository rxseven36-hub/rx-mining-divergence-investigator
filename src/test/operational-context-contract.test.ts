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
  "mining operational context contract",
  () => {
    it(
      "accepts company-scoped operational context without a synthetic period",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
            operation:
              "GET_MINING_OPERATIONAL_CONTEXT",
            purpose:
              "Collect current mining operational context",
            params: {
              companyId: "AADI",
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
      "still requires companyId for operational context",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
            operation:
              "GET_MINING_OPERATIONAL_CONTEXT",
            purpose:
              "Collect current mining operational context",
            params: {
              companyId: "",
            },
          };

        const result =
          validateSectorsOperationRequest(
            request
          );

        expect(result.valid).toBe(false);
        expect(result.issues).toContain(
          "COMPANY_ID_REQUIRED"
        );

        expect(result.issues).not.toContain(
          "PERIOD_INVALID"
        );
      }
    );

    it(
      "keeps historical performance period-scoped",
      () => {
        const request:
          RXSectorsTypedOperationRequest = {
            operation:
              "GET_MINING_HISTORICAL_PERFORMANCE",
            purpose:
              "Collect annual mining performance",
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
  }
);