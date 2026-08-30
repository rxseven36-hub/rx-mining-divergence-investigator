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
      request: SectorsJsonRequest
    ) => Promise<unknown>
): {
  adapter: SectorsAdapter;
  requestJsonSpy:
    ReturnType<typeof vi.fn>;
} {
  const requestJsonSpy =
    vi.fn(implementation);

  const adapter:
    SectorsAdapter = {
    async requestJson<T>(
      request: SectorsJsonRequest
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

function createReadyMiningRequest():
  RXPreparedInvestigationRequest {
  return {
    status:
      "READY",

    request: {
      requestId:
        "RX-TEST-R2",

      requirementId:
        "RX-TEST-E2",

      source:
        "SECTORS",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      purpose:
        "Collect historical mining performance evidence.",

      status:
        "PLANNED",
    },

    executionDecision: {
      requestId:
        "RX-TEST-R2",

      requirementId:
        "RX-TEST-E2",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status:
        "READY",

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    operation: {
      operation:
        "GET_MINING_HISTORICAL_PERFORMANCE",

      purpose:
        "Collect historical mining performance evidence.",

      params: {
        sectorsSlug:
          "pt-adaro-andalan-indonesia-tbk",

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

function createReadyOperationalContextRequest():
  RXPreparedInvestigationRequest {
  return {
    status:
      "READY",

    request: {
      requestId:
        "RX-TEST-R1",

      requirementId:
        "RX-TEST-E1",

      source:
        "SECTORS",

      capability:
        "MINING_OPERATIONAL_CONTEXT",

      purpose:
        "Collect mining operational context evidence.",

      status:
        "PLANNED",
    },

    executionDecision: {
      requestId:
        "RX-TEST-R1",

      requirementId:
        "RX-TEST-E1",

      capability:
        "MINING_OPERATIONAL_CONTEXT",

      status:
        "READY",

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    operation: {
      operation:
        "GET_MINING_OPERATIONAL_CONTEXT",

      purpose:
        "Collect mining operational context evidence.",

      params: {
        sectorsSlug:
          "pt-adaro-andalan-indonesia-tbk",
      },
    },

    bindingIssues: [],
  };
}

function createReadyCommodityRequest():
  RXPreparedInvestigationRequest {
  return {
    status:
      "READY",

    request: {
      requestId:
        "RX-TEST-R3",

      requirementId:
        "RX-TEST-E3",

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
        "RX-TEST-R3",

      requirementId:
        "RX-TEST-E3",

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

const liveShapedPayload = {
  year:
    2024,

  available_years: [
    2024,
    2023,
  ],

  data: [
    {
      year:
        2024,

      commodity_type:
        "Coal",

      commodity_sub_type:
        "Thermal Coal",

      commodity_stats: {
        unit:
          "Mt",

        production_volume:
          48.11,

        sales_volume:
          55.8,

        overburden_removal_volume:
          214.18,

        strip_ratio:
          4.51,

        resources_reserves: {
          measurement_year:
            2024,

          total_reserves_Mt:
            819,

          total_resources_Mt:
            4374,
        },

        products: [],
      },
    },
  ],
};

const operationalContextPayload = {
  name:
    "PT Adaro Andalan Indonesia Tbk",

  slug:
    "pt-adaro-andalan-indonesia-tbk",

  symbol:
    "AADI.JK",

  company_type:
    "Holding",

  operation_province:
    "Jakarta",

  operation_district:
    "Jakarta Selatan",

  key_operation:
    "Coal Trading",

  activities: [
    "Trading",
  ],

  commodity_type: [
    "Coal",
  ],

  mining_license: [],

  mining_contract: [],

  mining_site_count:
    0,

  representative_address:
    null,

  website:
    null,

  phone_number:
    null,

  email:
    null,
};

describe(
  "executePreparedInvestigationRequest",
  () => {
    it(
      "executes a ready mining request and admits valid evidence",
      async () => {
        const request =
          createReadyMiningRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () =>
            liveShapedPayload
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:mining-performance:aadi:2024",

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
        ).toBe("EXECUTED");

        expect(
          result.evidenceCollection
            ?.status
        ).toBe("AVAILABLE");

        expect(
          result.evidenceCollection
            ?.evidence
        ).toHaveLength(2);

        expect(
          result.evidenceCollection
            ?.causalConclusion
        ).toBe("UNKNOWN");

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "routes executed mining operational context through its evidence admission boundary",
      async () => {
        const request =
          createReadyOperationalContextRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () =>
            operationalContextPayload
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:mining-company:pt-adaro-andalan-indonesia-tbk",

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
            ?.evidence.length
        ).toBeGreaterThan(0);

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
            ?.evidence.some(
              (item) =>
                item.description ===
                "mining_site_count: 0"
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
      "rejects executed but invalid operational context at evidence admission",
      async () => {
        const request =
          createReadyOperationalContextRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => ({
            name:
              "Incomplete payload",
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
                "sectors:mining-company:invalid",
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
      "does not call the adapter when preparation already rejected the request",
      async () => {
        const ready =
          createReadyMiningRequest();

        const rejected:
          RXPreparedInvestigationRequest = {
          status:
            "REJECTED",

          request:
            ready.request,

          executionDecision: {
            requestId:
              ready.request.requestId,

            requirementId:
              ready.request.requirementId,

            capability:
              ready.request.capability,

            status:
              "REJECTED",

            issues: [
              "REQUIREMENT_MISMATCH",
            ],

            causalConclusion:
              "UNKNOWN",
          },

          operation: null,

          bindingIssues: [],
        };

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => {
            throw new Error(
              "adapter must not be called"
            );
          }
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            rejected,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "unused",
            }
          );

        expect(
          requestJsonSpy
        ).not.toHaveBeenCalled();

        expect(
          result.status
        ).toBe("SKIPPED");

        expect(
          result.execution
        ).toBeNull();

        expect(
          result.evidenceCollection
        ).toBeNull();

        expect(
          result.issue
        ).toBe(
          "PREPARED_REQUEST_REJECTED"
        );

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "keeps adapter failures outside the evidence vocabulary",
      async () => {
        const request =
          createReadyMiningRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => {
            throw new Error(
              "simulated network failure"
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
                "sectors:mining-performance:aadi:2024",
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
          result.execution?.status
        ).toBe("FAILED");

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
        ).toBe("UNKNOWN");
      }
    );

    it(
      "rejects an executed but transport-invalid mining payload at evidence admission",
      async () => {
        const request =
          createReadyMiningRequest();

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => ({
            data:
              "invalid",
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
                "sectors:mining-performance:aadi:2024",
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
        ).toBe("EXECUTED");

        expect(
          result.evidenceCollection
            ?.status
        ).toBe("INVALID");

        expect(
          result.evidenceCollection
            ?.issues
        ).toEqual([
          "INVALID_RESPONSE",
        ]);

        expect(
          result.evidenceCollection
            ?.evidence
        ).toEqual([]);

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

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
        ).toHaveBeenCalledTimes(1);

        expect(
          result.status
        ).toBe(
          "EVIDENCE_ADMITTED"
        );

        expect(
          result.execution?.status
        ).toBe("EXECUTED");

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
        ).toHaveLength(1);

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
      "preserves UNKNOWN causal conclusion across the orchestration boundary",
      async () => {
        const request =
          createReadyMiningRequest();

        const {
          adapter,
        } = createAdapter(
          async () =>
            liveShapedPayload
        );

        const result =
          await executePreparedInvestigationRequest(
            adapter,
            request,
            {
              companyId:
                "company-internal-001",

              sourceReference:
                "sectors:mining-performance:aadi:2024",
            }
          );

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");

        expect(
          result.evidenceCollection
            ?.causalConclusion
        ).toBe("UNKNOWN");
      }
    );
  }
);