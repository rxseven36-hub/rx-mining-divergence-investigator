import type {
  SectorsJsonRequest,
} from "./sectors-http-client";

import type {
  RXSectorsTypedOperationRequest,
} from "./sectors-operation-request";

import {
  validateSectorsOperationRequest,
} from "./validate-operation-request";

export type RXSectorsRestCompileIssue =
  | "INVALID_OPERATION_REQUEST"
  | "CREDIT_COST_UNVERIFIED";

export type RXSectorsRestCompileResult =
  | {
      status: "COMPILED";
      request: SectorsJsonRequest;
      issues: [];
    }
  | {
      status: "REJECTED";
      request: null;
      issues: RXSectorsRestCompileIssue[];
    };

const VERIFIED_CREDIT_COST = {
  GET_MINING_OPERATIONAL_CONTEXT: 1,
  GET_COMMODITY_PRICE_HISTORY: 1,
  GET_COMPANY_MARKET_TRANSACTION_HISTORY: 1,
} as const;

const commodityNameByRX = {
  COAL: "Coal",
  GOLD: "Gold",
  NICKEL: "Nickel",
  COPPER: "Copper",
} as const;

function encodePathPart(
  value: string
): string {
  return encodeURIComponent(value);
}

function buildQuery(
  entries: Array<
    readonly [string, string | number]
  >
): string {
  const query = new URLSearchParams();

  for (const [key, value] of entries) {
    query.append(
      key,
      String(value)
    );
  }

  return query.toString();
}

function compileCommodityPeriod(
  period:
    Extract<
      RXSectorsTypedOperationRequest,
      {
        operation:
          "GET_COMMODITY_PRICE_HISTORY";
      }
    >["params"]["period"]
): {
  startYear: number;
  endYear: number;
} | null {
  if (
    period.kind === "YEAR" &&
    period.year !== undefined
  ) {
    return {
      startYear: period.year,
      endYear: period.year,
    };
  }

  if (
    period.kind === "RANGE" &&
    period.start &&
    period.end
  ) {
    const startYear =
      Number(period.start.slice(0, 4));

    const endYear =
      Number(period.end.slice(0, 4));

    if (
      Number.isInteger(startYear) &&
      Number.isInteger(endYear)
    ) {
      return {
        startYear,
        endYear,
      };
    }
  }

  return null;
}

export function compileSectorsRestRequest(
  operationRequest:
    RXSectorsTypedOperationRequest
): RXSectorsRestCompileResult {
  const validation =
    validateSectorsOperationRequest(
      operationRequest
    );

  if (!validation.valid) {
    return {
      status: "REJECTED",
      request: null,
      issues: [
        "INVALID_OPERATION_REQUEST",
      ],
    };
  }

  switch (operationRequest.operation) {
    case "GET_MINING_OPERATIONAL_CONTEXT": {
      const slug =
        encodePathPart(
          operationRequest.params.sectorsSlug
        );

      return {
        status: "COMPILED",
        request: {
          path:
            `/v2/mining/companies/${slug}/`,
          purpose:
            operationRequest.purpose,
          estimatedCredits:
            VERIFIED_CREDIT_COST
              .GET_MINING_OPERATIONAL_CONTEXT,
        },
        issues: [],
      };
    }

    case "GET_MINING_HISTORICAL_PERFORMANCE":
      /**
       * Endpoint semantics are known, but this compiler
       * intentionally refuses to create an executable
       * SectorsJsonRequest until the endpoint credit cost
       * has been independently verified.
       *
       * Never invent estimatedCredits merely to satisfy
       * the HTTP client contract.
       */
      return {
        status: "REJECTED",
        request: null,
        issues: [
          "CREDIT_COST_UNVERIFIED",
        ],
      };

    case "GET_COMMODITY_PRICE_HISTORY": {
      const period =
        compileCommodityPeriod(
          operationRequest.params.period
        );

      if (!period) {
        return {
          status: "REJECTED",
          request: null,
          issues: [
            "INVALID_OPERATION_REQUEST",
          ],
        };
      }

      const commodityName =
        commodityNameByRX[
          operationRequest.params.commodity
        ];

      const query = buildQuery([
        [
          "start_year",
          period.startYear,
        ],
        [
          "end_year",
          period.endYear,
        ],
      ]);

      return {
        status: "COMPILED",
        request: {
          path:
            `/v2/mining/commodities/${
              encodePathPart(
                commodityName
              )
            }/price/?${query}`,
          purpose:
            operationRequest.purpose,
          estimatedCredits:
            VERIFIED_CREDIT_COST
              .GET_COMMODITY_PRICE_HISTORY,
        },
        issues: [],
      };
    }

    case "GET_COMPANY_MARKET_TRANSACTION_HISTORY": {
      const {
        ticker,
        period,
      } = operationRequest.params;

      if (
        period.kind !== "RANGE" ||
        !period.start ||
        !period.end
      ) {
        return {
          status: "REJECTED",
          request: null,
          issues: [
            "INVALID_OPERATION_REQUEST",
          ],
        };
      }

      const query = buildQuery([
        ["start", period.start],
        ["end", period.end],
      ]);

      return {
        status: "COMPILED",
        request: {
          path:
            `/v2/daily/${
              encodePathPart(ticker)
            }/?${query}`,
          purpose:
            operationRequest.purpose,
          estimatedCredits:
            VERIFIED_CREDIT_COST
              .GET_COMPANY_MARKET_TRANSACTION_HISTORY,
        },
        issues: [],
      };
    }
  }
}
