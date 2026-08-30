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
  implementation:
    (
      request:
        SectorsJsonRequest
    ) => Promise<unknown>
): {
  adapter:
    SectorsAdapter;

  requestJsonSpy:
    ReturnType<
      typeof vi.fn
    >;
} {
  const requestJsonSpy =
    vi.fn(
      implementation
    );

  const adapter:
    SectorsAdapter = {
    async requestJson<T>(
      request:
        SectorsJsonRequest
    ): Promise<T> {
      return (
        await requestJsonSpy(
          request
        )
      ) as T;
    },
  };

  return {
    adapter,
    requestJsonSpy,
  };
}

function createReadyCommodityRequest():
  RXPreparedInvestigationRequest {
  return {
    status:
      "READY",

    request: {
      requestId:
        "RX-COMMODITY-R1",

      requirementId:
        "RX-COMMODITY-E1",

      source:
        "SECTORS",

      capability:
        "COMMODITY_PRICE_HISTORY",

      purpose:
        "Collect commodity price history.",

      status:
        "PLANNED",
    },

    executionDecision: {
      requestId:
        "RX-COMMODITY-R1",

      requirementId:
        "RX-COMMODITY-E1",

      capability:
        "COMMODITY_PRICE_HISTORY",

      status:
        "READY",

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    operation: {
      operation:
        "GET_COMMODITY_PRICE_HISTORY",

      purpose:
        "Collect commodity price history.",

      params: {
        commodity:
          "COAL",

        period: {
          kind:
            "YEAR",

          year:
            2024,
        },
      },
    },

    bindingIssues: [],
  };
}

describe(
  "executePreparedInvestigationRequest commodity admission",
  () => {
    it(
      "routes executed commodity price history through its evidence admission boundary",
      async () => {
        const request =
          createReadyCommodityRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => [
            {
              name:
                "Coal",

              date:
                "2024-01-01",

              price_usd_per_ton:
                125.85,
            },

            {
              name:
                "Coal",

              date:
                "2024-02-01",

              price_usd_per_ton:
                120.5,
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
                "sectors:commodity:coal:2024",

              retrievedAt:
                "2026-08-30T00:00:00.000Z",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(
          1
        );

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
        ).toHaveLength(2);

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
      "routes a valid empty commodity response to evidence rejection as NO_DATA",
      async () => {
        const request =
          createReadyCommodityRequest();

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
                "sectors:commodity:coal:2024",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(
          1
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
      "rejects an executed transport-invalid commodity payload",
      async () => {
        const request =
          createReadyCommodityRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => ({
            data: [],
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
                "sectors:commodity:coal:2024",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          result.status
        ).toBe(
          "EVIDENCE_REJECTED"
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
      "rejects executed commodity evidence that does not match the prepared commodity",
      async () => {
        const request =
          createReadyCommodityRequest();

        const {
          adapter,
        } = createAdapter(
          async () => [
            {
              name:
                "Gold",

              date:
                "2024-01-01",

              price_usd_per_ton:
                2000,
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
                "sectors:commodity:coal:2024",
            }
          );

        expect(
          result.status
        ).toBe(
          "EVIDENCE_REJECTED"
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
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);

        expect(
          result.evidenceCollection
            ?.evidence
        ).toEqual([]);
      }
    );

    it(
      "rejects executed commodity evidence outside the prepared period",
      async () => {
        const request =
          createReadyCommodityRequest();

        const {
          adapter,
        } = createAdapter(
          async () => [
            {
              name:
                "Coal",

              date:
                "2023-12-01",

              price_usd_per_ton:
                130,
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
                "sectors:commodity:coal:2024",
            }
          );

        expect(
          result.status
        ).toBe(
          "EVIDENCE_REJECTED"
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
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);