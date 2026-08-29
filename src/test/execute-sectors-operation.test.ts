import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  SectorsJsonRequest,
} from "../data/sectors/sectors-http-client";

import {
  executeSectorsOperation,
} from "../data/sectors/execute-sectors-operation";

describe(
  "executeSectorsOperation",
  () => {
    it(
      "executes only the compiled request through the Sectors adapter",
      async () => {
        const requestJson = vi.fn();

        const adapter: SectorsAdapter = {
          async requestJson<T>(
            request: SectorsJsonRequest
          ) {
            requestJson(request);

            return {
              slug: "aadi",
              name:
                "PT Adaro Andalan Indonesia Tbk",
            } as T;
          },
        };

        const result =
          await executeSectorsOperation<{
            slug: string;
            name: string;
          }>(
            adapter,
            {
              operation:
                "GET_MINING_OPERATIONAL_CONTEXT",
              purpose:
                "Collect operational context.",
              params: {
                sectorsSlug: "aadi",
              },
            }
          );

        expect(result).toEqual({
          status: "EXECUTED",
          data: {
            slug: "aadi",
            name:
              "PT Adaro Andalan Indonesia Tbk",
          },
          issues: [],
          cause: null,
        });

        expect(
          requestJson
        ).toHaveBeenCalledTimes(1);

        expect(
          requestJson
        ).toHaveBeenCalledWith({
          path:
            "/v2/mining/companies/aadi/",
          purpose:
            "Collect operational context.",
          estimatedCredits: 1,
        });
      }
    );

    it(
      "does not call the adapter when compilation rejects the operation",
      async () => {
        const requestJson =
          vi.fn();

        const adapter: SectorsAdapter = {
          async requestJson<T>(
            request: SectorsJsonRequest
          ) {
            requestJson(request);

            throw new Error(
              "Adapter must not be called"
            );
          },
        };

        const result =
          await executeSectorsOperation(
            adapter,
            {
              operation:
                "GET_MINING_HISTORICAL_PERFORMANCE",
              purpose:
                "Collect historical mining performance.",
              params: {
                sectorsSlug: "aadi",
                period: {
                  kind: "YEAR",
                  year: 2024,
                },
              },
            }
          );

        expect(result).toEqual({
          status: "REJECTED",
          data: null,
          issues: [
            "CREDIT_COST_UNVERIFIED",
          ],
          cause: null,
        });

        expect(
          requestJson
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "does not call the adapter for an invalid typed operation request",
      async () => {
        const requestJson =
          vi.fn();

        const adapter: SectorsAdapter = {
          async requestJson<T>(
            request: SectorsJsonRequest
          ) {
            requestJson(request);

            throw new Error(
              "Adapter must not be called"
            );
          },
        };

        const result =
          await executeSectorsOperation(
            adapter,
            {
              operation:
                "GET_MINING_OPERATIONAL_CONTEXT",
              purpose:
                "Collect operational context.",
              params: {
                sectorsSlug: "   ",
              },
            }
          );

        expect(result).toEqual({
          status: "REJECTED",
          data: null,
          issues: [
            "INVALID_OPERATION_REQUEST",
          ],
          cause: null,
        });

        expect(
          requestJson
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "preserves adapter failure as a FAILED execution result",
      async () => {
        const adapterFailure =
          new Error(
            "simulated adapter failure"
          );

        const requestJson =
          vi.fn();

        const adapter: SectorsAdapter = {
          async requestJson<T>(
            request: SectorsJsonRequest
          ) {
            requestJson(request);

            throw adapterFailure;
          },
        };

        const result =
          await executeSectorsOperation(
            adapter,
            {
              operation:
                "GET_COMMODITY_PRICE_HISTORY",
              purpose:
                "Collect coal price context.",
              params: {
                commodity: "COAL",
                period: {
                  kind: "YEAR",
                  year: 2024,
                },
              },
            }
          );

        expect(result.status).toBe(
          "FAILED"
        );

        if (
          result.status === "FAILED"
        ) {
          expect(
            result.data
          ).toBeNull();

          expect(
            result.issues
          ).toEqual([]);

          expect(
            result.cause
          ).toBe(
            adapterFailure
          );
        }

        expect(
          requestJson
        ).toHaveBeenCalledTimes(1);
      }
    );

    it(
      "passes market requests only after deterministic compilation",
      async () => {
        const requestJson = vi.fn();

        const adapter: SectorsAdapter = {
          async requestJson<T>(
            request: SectorsJsonRequest
          ) {
            requestJson(request);

            return {
              data: [],
            } as T;
          },
        };

        const result =
          await executeSectorsOperation(
            adapter,
            {
              operation:
                "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
              purpose:
                "Inspect market reaction.",
              params: {
                ticker: "AADI",
                period: {
                  kind: "RANGE",
                  start:
                    "2024-12-05",
                  end:
                    "2024-12-20",
                },
              },
            }
          );

        expect(
          result.status
        ).toBe(
          "EXECUTED"
        );

        expect(
          requestJson
        ).toHaveBeenCalledTimes(1);

        expect(
          requestJson
        ).toHaveBeenCalledWith({
          path:
            "/v2/daily/AADI/?start=2024-12-05&end=2024-12-20",
          purpose:
            "Inspect market reaction.",
          estimatedCredits: 1,
        });
      }
    );
  }
);