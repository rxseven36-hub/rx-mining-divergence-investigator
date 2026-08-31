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

import type {
  RXPreparedInvestigationRequest,
} from "../investigation/prepare-investigation-requests";

import {
  executePreparedInvestigationRequest,
} from "../investigation/execute-prepared-investigation-request";

function createAdapter(
  implementation: (
    request: SectorsJsonRequest
  ) => Promise<unknown>
): {
  adapter: SectorsAdapter;
  requestJsonSpy: ReturnType<typeof vi.fn>;
} {
  const requestJsonSpy =
    vi.fn(implementation);

  const adapter: SectorsAdapter = {
    async requestJson<T>(
      request: SectorsJsonRequest
    ): Promise<T> {
      return (
        await requestJsonSpy(request)
      ) as T;
    },
  };

  return {
    adapter,
    requestJsonSpy,
  };
}

function createReadyMarketRequest():
  RXPreparedInvestigationRequest {
  const requestId =
    "RX-TEST-MARKET-R1";

  const requirementId =
    "RX-TEST-MARKET-E1";

  const capability =
    "COMPANY_MARKET_TRANSACTION_HISTORY" as const;

  return {
    status: "READY",

    request: {
      requestId,
      requirementId,
      source: "SECTORS",
      capability,
      purpose:
        "Collect company market transaction history.",
      status: "PLANNED",
    },

    executionDecision: {
      requestId,
      requirementId,
      capability,
      status: "READY",
      issues: [],
      causalConclusion:
        "UNKNOWN",
    },

    operation: {
      operation:
        "GET_COMPANY_MARKET_TRANSACTION_HISTORY",

      purpose:
        "Collect company market transaction history.",

      params: {
        ticker: "AADI",

        period: {
          kind: "RANGE",
          start: "2024-12-01",
          end: "2024-12-31",
        },
      },
    },

    bindingIssues: [],
  };
}

const alignedPayload = [
  {
    symbol: "AADI.JK",
    date: "2024-12-02",
    close: 7050,
    volume: 1000000,
    market_cap: 55000000000000,
  },
  {
    symbol: "AADI",
    date: "2024-12-03",
    close: 7100,
    volume: 1200000,
    market_cap: 55400000000000,
  },
];

describe(
  "executePreparedInvestigationRequest market evidence routing",
  () => {
    it(
      "routes executed market transaction history through its evidence admission boundary",
      async () => {
        const request =
          createReadyMarketRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => alignedPayload
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:daily:AADI:2024-12",

              retrievedAt:
                "2026-08-30T00:00:00.000Z",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(1);

        expect(
          result.status
        ).toBe(
          "EVIDENCE_ADMITTED"
        );

        expect(
          result.execution?.status
        ).toBe(
          "EXECUTED"
        );

        expect(
          result.evidenceCollection
            ?.status
        ).toBe(
          "AVAILABLE"
        );

        expect(
          result.evidenceCollection
            ?.issues
        ).toEqual([]);

        expect(
          result.evidenceCollection
            ?.evidence
        ).toHaveLength(6);

        expect(
          result.evidenceCollection
            ?.evidence.every(
              (item) =>
                item.source ===
                  "SECTORS" &&
                item.truthClass ===
                  "SOURCE_FACT"
            )
        ).toBe(true);

        expect(
          result.evidenceCollection
            ?.causalConclusion
        ).toBe(
          "UNKNOWN"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "rejects malformed executed market payload instead of treating it as no data",
      async () => {
        const request =
          createReadyMarketRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => ({
            data: alignedPayload,
          })
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:daily:AADI:invalid",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(1);

        expect(
          result.status
        ).toBe(
          "EVIDENCE_REJECTED"
        );

        expect(
          result.execution?.status
        ).toBe(
          "EXECUTED"
        );

        expect(
          result.evidenceCollection
            ?.status
        ).toBe(
          "INVALID"
        );

        expect(
          result.evidenceCollection
            ?.issues
        ).toEqual([
          "INVALID_RESPONSE",
        ]);

        expect(
          result.evidenceCollection
            ?.issues
        ).not.toContain(
          "NO_DATA"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "preserves an empty valid market response as unavailable no data evidence",
      async () => {
        const request =
          createReadyMarketRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => []
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:daily:AADI:empty",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(1);

        expect(
          result.status
        ).toBe(
          "EVIDENCE_REJECTED"
        );

        expect(
          result.execution?.status
        ).toBe(
          "EXECUTED"
        );

        expect(
          result.evidenceCollection
            ?.status
        ).toBe(
          "UNAVAILABLE"
        );

        expect(
          result.evidenceCollection
            ?.issues
        ).toEqual([
          "NO_DATA",
        ]);

        expect(
          result.evidenceCollection
            ?.evidence
        ).toEqual([]);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "rejects executed market evidence when the returned symbol does not match the requested ticker",
      async () => {
        const request =
          createReadyMarketRequest();

        const {
          adapter,
        } = createAdapter(
          async () => [
            {
              symbol: "BBCA",
              date: "2024-12-02",
              close: 10000,
              volume: 1000000,
              market_cap:
                100000000000000,
            },
          ]
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:daily:AADI:mismatch",
            }
          );

        expect(
          result.status
        ).toBe(
          "EVIDENCE_REJECTED"
        );

        expect(
          result.execution?.status
        ).toBe(
          "EXECUTED"
        );

        expect(
          result.evidenceCollection
            ?.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.evidenceCollection
            ?.issues
        ).toContain(
          "RELATIONSHIP_INVALID"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "keeps transport failure separate from evidence no data",
      async () => {
        const request =
          createReadyMarketRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => {
            throw new Error(
              "simulated transport failure"
            );
          }
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:daily:AADI:failure",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(1);

        expect(
          result.status
        ).toBe(
          "EXECUTION_FAILED"
        );

        expect(
          result.evidenceCollection
        ).toBeNull();

        expect(
          result.issue
        ).toBe(
          "SECTORS_EXECUTION_FAILED"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);