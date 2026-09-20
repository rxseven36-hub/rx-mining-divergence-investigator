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
      "executes compiled historical performance through the Sectors adapter",
      async () => {
        const requestJson = vi.fn();

        const adapter: SectorsAdapter = {
          async requestJson<T>(
            request: SectorsJsonRequest
          ) {
            requestJson(request);

            return {
              year: 2024,
              available_years: [
                2023,
                2024,
              ],
              data: [],
            } as T;
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
                sectorsSlug:
                  "pt-adaro-andalan-indonesia-tbk",
                period: {
                  kind: "YEAR",
                  year: 2024,
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
            "/v2/mining/companies/performance/pt-adaro-andalan-indonesia-tbk/?year=2024",
          purpose:
            "Collect historical mining performance.",
          estimatedCredits: 1,
        });
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
      "preserves a generic adapter failure without inventing typed provider metadata",
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
          ).toEqual([
            "MESSAGE:simulated adapter failure",
          ]);

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
      "projects bounded typed HTTP failure metadata while preserving the original cause",
      async () => {
        const httpFailure =
          Object.assign(
            new Error(
              "Sectors returned HTTP 404"
            ),
            {
              code:
                "HTTP_ERROR",
              status:
                404,
              retryAfter:
                undefined,
            },
          );

        const adapter: SectorsAdapter = {
          async requestJson<T>() {
            throw httpFailure;
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
                sectorsSlug:
                  "pt-bumi-resources-tbk",
                period: {
                  kind:
                    "YEAR",
                  year:
                    2024,
                },
              },
            }
          );

        expect(result).toEqual({
          status:
            "FAILED",
          data:
            null,
          issues: [
            "HTTP_ERROR",
            "HTTP_STATUS:404",
            "MESSAGE:Sectors returned HTTP 404",
          ],
          cause:
            httpFailure,
        });
      }
    );

    it(
      "projects network failure code and bounded message without inventing HTTP status",
      async () => {
        const networkFailure =
          Object.assign(
            new Error(
              "Sectors request failed before receiving an HTTP response"
            ),
            {
              code:
                "NETWORK_ERROR",
            },
          );

        const adapter: SectorsAdapter = {
          async requestJson<T>() {
            throw networkFailure;
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
                sectorsSlug:
                  "pt-bumi-resources-tbk",
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
            result.issues
          ).toEqual([
            "NETWORK_ERROR",
            "MESSAGE:Sectors request failed before receiving an HTTP response",
          ]);

          expect(
            result.cause
          ).toBe(
            networkFailure
          );
        }
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