import {
  describe,
  expect,
  it,
} from "vitest";

import {
  compileSectorsRestRequest,
} from "../data/sectors/sectors-rest-request-compiler";

describe(
  "compileSectorsRestRequest",
  () => {
    it(
      "compiles mining operational context using the Sectors slug",
      () => {
        const result =
          compileSectorsRestRequest({
            operation:
              "GET_MINING_OPERATIONAL_CONTEXT",
            purpose:
              "Collect operational context.",
            params: {
              sectorsSlug:
                "pt-adaro-andalan-indonesia-tbk",
            },
          });

        expect(result).toEqual({
          status: "COMPILED",
          request: {
            path:
              "/v2/mining/companies/pt-adaro-andalan-indonesia-tbk/",
            purpose:
              "Collect operational context.",
            estimatedCredits: 1,
          },
          issues: [],
        });
      }
    );

    it(
      "encodes mining slug as a path component",
      () => {
        const result =
          compileSectorsRestRequest({
            operation:
              "GET_MINING_OPERATIONAL_CONTEXT",
            purpose:
              "Verify path encoding.",
            params: {
              sectorsSlug:
                "company slug/test",
            },
          });

        expect(result.status).toBe(
          "COMPILED"
        );

        if (
          result.status === "COMPILED"
        ) {
          expect(
            result.request.path
          ).toBe(
            "/v2/mining/companies/company%20slug%2Ftest/"
          );
        }
      }
    );

    it(
      "fails closed for historical performance while credit cost is unverified",
      () => {
        const result =
          compileSectorsRestRequest({
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
          });

        expect(result).toEqual({
          status: "REJECTED",
          request: null,
          issues: [
            "CREDIT_COST_UNVERIFIED",
          ],
        });
      }
    );

    it(
      "compiles commodity YEAR into an inclusive one-year query",
      () => {
        const result =
          compileSectorsRestRequest({
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
          });

        expect(result).toEqual({
          status: "COMPILED",
          request: {
            path:
              "/v2/mining/commodities/Coal/price/?start_year=2024&end_year=2024",
            purpose:
              "Collect coal price context.",
            estimatedCredits: 1,
          },
          issues: [],
        });
      }
    );

    it(
      "maps RX commodity names to official Sectors path names",
      () => {
        const cases = [
          ["COAL", "Coal"],
          ["GOLD", "Gold"],
          ["NICKEL", "Nickel"],
          ["COPPER", "Copper"],
        ] as const;

        for (
          const [
            commodity,
            expectedName,
          ] of cases
        ) {
          const result =
            compileSectorsRestRequest({
              operation:
                "GET_COMMODITY_PRICE_HISTORY",
              purpose:
                `Collect ${commodity} context.`,
              params: {
                commodity,
                period: {
                  kind: "YEAR",
                  year: 2024,
                },
              },
            });

          expect(result.status).toBe(
            "COMPILED"
          );

          if (
            result.status ===
            "COMPILED"
          ) {
            expect(
              result.request.path
            ).toBe(
              `/v2/mining/commodities/${expectedName}/price/?start_year=2024&end_year=2024`
            );
          }
        }
      }
    );

    it(
      "compiles an eligible commodity year range deterministically",
      () => {
        const result =
          compileSectorsRestRequest({
            operation:
              "GET_COMMODITY_PRICE_HISTORY",
            purpose:
              "Collect nickel price history.",
            params: {
              commodity: "NICKEL",
              period: {
                kind: "RANGE",
                start: "2022-01-01",
                end: "2024-12-31",
              },
            },
          });

        expect(result.status).toBe(
          "COMPILED"
        );

        if (
          result.status === "COMPILED"
        ) {
          expect(
            result.request.path
          ).toBe(
            "/v2/mining/commodities/Nickel/price/?start_year=2022&end_year=2024"
          );
        }
      }
    );

    it(
      "compiles market transaction history with explicit dates",
      () => {
        const result =
          compileSectorsRestRequest({
            operation:
              "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            purpose:
              "Inspect market reaction.",
            params: {
              ticker: "AADI",
              period: {
                kind: "RANGE",
                start: "2024-12-05",
                end: "2024-12-20",
              },
            },
          });

        expect(result).toEqual({
          status: "COMPILED",
          request: {
            path:
              "/v2/daily/AADI/?start=2024-12-05&end=2024-12-20",
            purpose:
              "Inspect market reaction.",
            estimatedCredits: 1,
          },
          issues: [],
        });
      }
    );

    it(
      "encodes market ticker as a path component",
      () => {
        const result =
          compileSectorsRestRequest({
            operation:
              "GET_COMPANY_MARKET_TRANSACTION_HISTORY",
            purpose:
              "Verify ticker encoding.",
            params: {
              ticker: "AA/DI",
              period: {
                kind: "RANGE",
                start: "2024-12-05",
                end: "2024-12-06",
              },
            },
          });

        expect(result.status).toBe(
          "COMPILED"
        );

        if (
          result.status === "COMPILED"
        ) {
          expect(
            result.request.path
          ).toBe(
            "/v2/daily/AA%2FDI/?start=2024-12-05&end=2024-12-06"
          );
        }
      }
    );

    it(
      "rejects invalid operation requests before compiling a REST path",
      () => {
        const result =
          compileSectorsRestRequest({
            operation:
              "GET_MINING_OPERATIONAL_CONTEXT",
            purpose:
              "Collect operational context.",
            params: {
              sectorsSlug: "   ",
            },
          });

        expect(result).toEqual({
          status: "REJECTED",
          request: null,
          issues: [
            "INVALID_OPERATION_REQUEST",
          ],
        });
      }
    );
  }
);
