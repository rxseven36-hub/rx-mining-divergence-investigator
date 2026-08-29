import {
  describe,
  expect,
  it,
} from "vitest";

import {
  bindInvestigationOperationRequest,
} from "../investigation/bind-operation-request";

const contextWithoutSectorsSlug = {
  companyId: "company-aadi",
  ticker: "AADI",
  commodity: "COAL" as const,
  period: {
    kind: "YEAR" as const,
    year: 2024,
  },
};

describe(
  "Sectors mining slug boundary",
  () => {
    it(
      "does not use RX companyId as operational-context fallback",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "MINING_OPERATIONAL_CONTEXT",
            "Collect operational context.",
            contextWithoutSectorsSlug
          );

        expect(result).toEqual({
          status: "REJECTED",
          request: null,
          issues: [
            "SECTORS_SLUG_REQUIRED",
          ],
        });
      }
    );

    it(
      "does not use RX companyId as historical-performance fallback",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "MINING_HISTORICAL_PERFORMANCE",
            "Collect historical performance.",
            contextWithoutSectorsSlug
          );

        expect(result).toEqual({
          status: "REJECTED",
          request: null,
          issues: [
            "SECTORS_SLUG_REQUIRED",
          ],
        });
      }
    );

    it(
      "binds Sectors slug independently from RX companyId",
      () => {
        const result =
          bindInvestigationOperationRequest(
            "MINING_OPERATIONAL_CONTEXT",
            "Collect operational context.",
            {
              ...contextWithoutSectorsSlug,
              sectorsSlug: "aadi",
            }
          );

        expect(result).toEqual({
          status: "BOUND",
          request: {
            operation:
              "GET_MINING_OPERATIONAL_CONTEXT",
            purpose:
              "Collect operational context.",
            params: {
              sectorsSlug: "aadi",
            },
          },
          issues: [],
        });
      }
    );
  }
);