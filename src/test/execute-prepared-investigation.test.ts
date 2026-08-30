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
  RXPreparedInvestigationRequests,
} from "../investigation/prepare-investigation-requests";

import {
  executePreparedInvestigation,
} from "../investigation/execute-prepared-investigation";

function createAdapter(
  implementation: (
    request: SectorsJsonRequest,
    callIndex: number
  ) => Promise<unknown>
): {
  adapter: SectorsAdapter;
  requestJsonSpy: ReturnType<typeof vi.fn>;
} {
  let callIndex = 0;

  const requestJsonSpy = vi.fn(
    async (
      request: SectorsJsonRequest
    ) => {
      const currentIndex =
        callIndex;

      callIndex += 1;

      return implementation(
        request,
        currentIndex
      );
    }
  );

  const adapter: SectorsAdapter = {
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

function readyDecision(
  requestId: string,
  requirementId: string,
  capability:
    RXPreparedInvestigationRequest["request"]["capability"]
) {
  return {
    requestId,
    requirementId,
    capability,
    status: "READY" as const,
    issues: [],
    causalConclusion:
      "UNKNOWN" as const,
  };
}

function createMiningRequest():
  RXPreparedInvestigationRequest {
  const requestId =
    "RX-R2";

  const requirementId =
    "RX-E2";

  const capability =
    "MINING_HISTORICAL_PERFORMANCE" as const;

  return {
    status: "READY",

    request: {
      requestId,
      requirementId,
      source: "SECTORS",
      capability,
      purpose:
        "Collect historical mining performance.",
      status: "PLANNED",
    },

    executionDecision:
      readyDecision(
        requestId,
        requirementId,
        capability
      ),

    operation: {
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
    },

    bindingIssues: [],
  };
}

function createCommodityRequest():
  RXPreparedInvestigationRequest {
  const requestId =
    "RX-R3";

  const requirementId =
    "RX-E3";

  const capability =
    "COMMODITY_PRICE_HISTORY" as const;

  return {
    status: "READY",

    request: {
      requestId,
      requirementId,
      source: "SECTORS",
      capability,
      purpose:
        "Collect commodity price history.",
      status: "PLANNED",
    },

    executionDecision:
      readyDecision(
        requestId,
        requirementId,
        capability
      ),

    operation: {
      operation:
        "GET_COMMODITY_PRICE_HISTORY",

      purpose:
        "Collect commodity price history.",

      params: {
        commodity: "COAL",

        period: {
          kind: "YEAR",
          year: 2024,
        },
      },
    },

    bindingIssues: [],
  };
}

function createRejectedRequest():
  RXPreparedInvestigationRequest {
  const mining =
    createMiningRequest();

  return {
    status: "REJECTED",

    request: {
      ...mining.request,

      requestId:
        "RX-R-REJECTED",

      requirementId:
        "RX-E-REJECTED",
    },

    executionDecision: {
      requestId:
        "RX-R-REJECTED",

      requirementId:
        "RX-E-REJECTED",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status: "REJECTED",

      issues: [
        "REQUIREMENT_MISMATCH",
      ],

      causalConclusion:
        "UNKNOWN",
    },

    operation: null,

    bindingIssues: [],
  };
}

function createPrepared(
  requests:
    RXPreparedInvestigationRequest[]
): RXPreparedInvestigationRequests {
  const readyCount =
    requests.filter(
      (request) =>
        request.status === "READY"
    ).length;

  return {
    planId: "PLAN-010D",

    caseId: "CASE-010D",

    requests,

    readyCount,

    rejectedCount:
      requests.length -
      readyCount,

    causalConclusion:
      "UNKNOWN",
  };
}

const liveMiningPayload = {
  year: 2024,

  available_years: [
    2024,
  ],

  data: [
    {
      year: 2024,

      commodity_type:
        "Coal",

      commodity_sub_type:
        "Thermal Coal",

      commodity_stats: {
        unit: "Mt",

        production_volume:
          48.11,

        sales_volume:
          55.8,

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

const liveCommodityPayload = [
  {
    name:
      "Coal",

    date:
      "2024-01-01",

    price_usd_per_ton:
      125.85,
  },
];

describe(
  "executePreparedInvestigation",
  () => {
    it(
      "executes the whole prepared investigation and summarizes mixed outcomes",
      async () => {
        const prepared =
          createPrepared([
            createMiningRequest(),
            createCommodityRequest(),
            createRejectedRequest(),
          ]);

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async (
            request
          ) => {
            if (
              request.path.includes(
                "/performance/"
              )
            ) {
              return liveMiningPayload;
            }

            return liveCommodityPayload;
          }
        );

        const result =
          await executePreparedInvestigation(
            adapter,
            prepared,
            {
              companyId:
                "company-internal-001",

              retrievedAt:
                "2026-08-30T00:00:00.000Z",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(2);

        expect(
          result.planId
        ).toBe("PLAN-010D");

        expect(
          result.caseId
        ).toBe("CASE-010D");

        expect(
          result.outcomes.map(
            (outcome) =>
              outcome.status
          )
        ).toEqual([
          "EVIDENCE_ADMITTED",
          "EVIDENCE_ADMITTED",
          "SKIPPED",
        ]);

        expect(
          result.summary
        ).toEqual({
          totalCount: 3,

          evidenceAdmittedCount:
            2,

          evidenceRejectedCount:
            0,

          executionFailedCount:
            0,

          executionRejectedCount:
            0,

          skippedCount: 1,

          admissionNotSupportedCount:
            0,
        });

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "continues after one request fails",
      async () => {
        const prepared =
          createPrepared([
            createMiningRequest(),
            createCommodityRequest(),
          ]);

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async (
            _request,
            callIndex
          ) => {
            if (
              callIndex === 0
            ) {
              throw new Error(
                "simulated first request failure"
              );
            }

            return liveCommodityPayload;
          }
        );

        const result =
          await executePreparedInvestigation(
            adapter,
            prepared,
            {
              companyId:
                "company-internal-001",
            }
          );

        expect(
          requestJsonSpy
        ).toHaveBeenCalledTimes(2);

        expect(
          result.outcomes[0]
            ?.status
        ).toBe(
          "EXECUTION_FAILED"
        );

        expect(
          result.outcomes[1]
            ?.status
        ).toBe(
          "EVIDENCE_ADMITTED"
        );

        expect(
          result.summary
            .executionFailedCount
        ).toBe(1);

        expect(
          result.summary
            .evidenceAdmittedCount
        ).toBe(1);

        expect(
          result.summary
            .admissionNotSupportedCount
        ).toBe(0);
      }
    );

    it(
      "does not execute rejected prepared requests",
      async () => {
        const prepared =
          createPrepared([
            createRejectedRequest(),
          ]);

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => {
            throw new Error(
              "must not execute"
            );
          }
        );

        const result =
          await executePreparedInvestigation(
            adapter,
            prepared,
            {
              companyId:
                "company-internal-001",
            }
          );

        expect(
          requestJsonSpy
        ).not.toHaveBeenCalled();

        expect(
          result.summary
            .skippedCount
        ).toBe(1);

        expect(
          result.summary
            .totalCount
        ).toBe(1);
      }
    );

    it(
      "preserves request ordering in outcome ordering",
      async () => {
        const mining =
          createMiningRequest();

        const commodity =
          createCommodityRequest();

        const prepared =
          createPrepared([
            mining,
            commodity,
          ]);

        const {
          adapter,
        } = createAdapter(
          async (
            request
          ) => {
            if (
              request.path.includes(
                "/performance/"
              )
            ) {
              return liveMiningPayload;
            }

            return liveCommodityPayload;
          }
        );

        const result =
          await executePreparedInvestigation(
            adapter,
            prepared,
            {
              companyId:
                "company-internal-001",
            }
          );

        expect(
          result.outcomes[0]
            ?.preparedRequest
            .request.requestId
        ).toBe(
          mining.request.requestId
        );

        expect(
          result.outcomes[1]
            ?.preparedRequest
            .request.requestId
        ).toBe(
          commodity.request.requestId
        );

        expect(
          result.outcomes[0]
            ?.status
        ).toBe(
          "EVIDENCE_ADMITTED"
        );

        expect(
          result.outcomes[1]
            ?.status
        ).toBe(
          "EVIDENCE_ADMITTED"
        );
      }
    );

    it(
      "returns a zeroed summary for an empty prepared investigation",
      async () => {
        const prepared =
          createPrepared([]);

        const {
          adapter,
          requestJsonSpy,
        } = createAdapter(
          async () => {
            throw new Error(
              "must not execute"
            );
          }
        );

        const result =
          await executePreparedInvestigation(
            adapter,
            prepared,
            {
              companyId:
                "company-internal-001",
            }
          );

        expect(
          requestJsonSpy
        ).not.toHaveBeenCalled();

        expect(
          result.outcomes
        ).toEqual([]);

        expect(
          result.summary
        ).toEqual({
          totalCount: 0,

          evidenceAdmittedCount:
            0,

          evidenceRejectedCount:
            0,

          executionFailedCount:
            0,

          executionRejectedCount:
            0,

          skippedCount: 0,

          admissionNotSupportedCount:
            0,
        });

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );
  }
);