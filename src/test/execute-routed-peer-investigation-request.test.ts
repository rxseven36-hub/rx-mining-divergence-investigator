import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  RXPeerPreparedRequestExecutionRouting,
} from "../investigation/resolve-peer-execution-contexts";

vi.mock(
  "../investigation/execute-prepared-investigation-request",
  () => ({
    executePreparedInvestigationRequest:
      vi.fn(),
  })
);

import {
  executePreparedInvestigationRequest,
} from "../investigation/execute-prepared-investigation-request";

import {
  executeRoutedPeerInvestigationRequest,
} from "../investigation/execute-routed-peer-investigation-request";

const mockedExecutePreparedInvestigationRequest =
  vi.mocked(
    executePreparedInvestigationRequest
  );

const adapter = {
  async requestJson<T>(): Promise<T> {
    throw new Error(
      "Adapter must not be called directly by bridge test."
    );
  },
} satisfies SectorsAdapter;

function createReadyPreparedRequest() {
  return {
    status:
      "READY",
  } as never;
}

function createRejectedPreparedRequest() {
  return {
    status:
      "REJECTED",
  } as never;
}

function createRouted(
  target:
    | "FIRST_COMPANY"
    | "SECOND_COMPANY"
    | "SHARED",
  companyId:
    string | null,
  sourceReference:
    string
): Extract<
  RXPeerPreparedRequestExecutionRouting,
  {
    status:
      "ROUTED";
  }
> {
  return {
    status:
      "ROUTED",

    preparedRequest:
      createReadyPreparedRequest(),

    context: {
      requestId:
        `REQUEST-${target}`,

      target,

      companyId,

      sourceReference,
    },

    issues: [],
  };
}

function createSkipped(): Extract<
  RXPeerPreparedRequestExecutionRouting,
  {
    status:
      "SKIPPED";
  }
> {
  return {
    status:
      "SKIPPED",

    preparedRequest:
      createRejectedPreparedRequest(),

    context: null,

    issue:
      "PREPARED_REQUEST_REJECTED",
  };
}

function createRoutingRejected(): Extract<
  RXPeerPreparedRequestExecutionRouting,
  {
    status:
      "REJECTED";
  }
> {
  return {
    status:
      "REJECTED",

    preparedRequest:
      createReadyPreparedRequest(),

    context: null,

    issues: [
      "FIRST_COMPANY_ID_MISMATCH",
    ],
  };
}

describe(
  "executeRoutedPeerInvestigationRequest",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mockedExecutePreparedInvestigationRequest
        .mockResolvedValue({
          status:
            "EVIDENCE_ADMITTED",
        } as never);
    });

    it(
      "does not execute preparation-skipped peer requests",
      async () => {
        const routing =
          createSkipped();

        const result =
          await executeRoutedPeerInvestigationRequest(
            adapter,
            routing
          );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).not.toHaveBeenCalled();

        expect(
          result.status
        ).toBe(
          "SKIPPED"
        );

        expect(
          result.executionOutcome
        ).toBeNull();

        expect(
          result.issue
        ).toBe(
          "PEER_ROUTING_SKIPPED"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not execute routing-rejected peer requests",
      async () => {
        const routing =
          createRoutingRejected();

        const result =
          await executeRoutedPeerInvestigationRequest(
            adapter,
            routing
          );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).not.toHaveBeenCalled();

        expect(
          result.status
        ).toBe(
          "ROUTING_REJECTED"
        );

        expect(
          result.executionOutcome
        ).toBeNull();

        expect(
          result.issue
        ).toBe(
          "PEER_EXECUTION_ROUTING_REJECTED"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "passes canonical first-company identity into execution",
      async () => {
        const routing =
          createRouted(
            "FIRST_COMPANY",
            "COMPANY-A",
            "sectors:mining-performance:company-a:2024"
          );

        const result =
          await executeRoutedPeerInvestigationRequest(
            adapter,
            routing,
            "2026-09-03T00:00:00.000Z"
          );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).toHaveBeenCalledWith(
          adapter,
          routing.preparedRequest,
          {
            companyId:
              "COMPANY-A",

            sourceReference:
              "sectors:mining-performance:company-a:2024",

            retrievedAt:
              "2026-09-03T00:00:00.000Z",
          }
        );

        expect(
          result.status
        ).toBe(
          "EXECUTED"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "passes canonical second-company identity into execution",
      async () => {
        const routing =
          createRouted(
            "SECOND_COMPANY",
            "COMPANY-B",
            "sectors:mining-performance:company-b:2024"
          );

        await executeRoutedPeerInvestigationRequest(
          adapter,
          routing
        );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).toHaveBeenCalledWith(
          adapter,
          routing.preparedRequest,
          {
            companyId:
              "COMPANY-B",

            sourceReference:
              "sectors:mining-performance:company-b:2024",

            retrievedAt:
              undefined,
          }
        );
      }
    );

    it(
      "keeps shared execution companyless",
      async () => {
        const routing =
          createRouted(
            "SHARED",
            null,
            "sectors:commodity-price:COAL:REQUEST-SHARED"
          );

        await executeRoutedPeerInvestigationRequest(
          adapter,
          routing,
          "2026-09-03T00:00:00.000Z"
        );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mockedExecutePreparedInvestigationRequest
        ).toHaveBeenCalledWith(
          adapter,
          routing.preparedRequest,
          {
            sourceReference:
              "sectors:commodity-price:COAL:REQUEST-SHARED",

            retrievedAt:
              "2026-09-03T00:00:00.000Z",
          }
        );

        const executionContext =
          mockedExecutePreparedInvestigationRequest
            .mock.calls[0]?.[2];

        expect(
          executionContext
        ).not.toHaveProperty(
          "companyId"
        );
      }
    );

    it(
      "preserves the canonical single-request execution outcome",
      async () => {
        const executionOutcome = {
          status:
            "EXECUTION_FAILED",
        };

        mockedExecutePreparedInvestigationRequest
          .mockResolvedValueOnce(
            executionOutcome as never
          );

        const routing =
          createRouted(
            "FIRST_COMPANY",
            "COMPANY-A",
            "sectors:mining-operational-context:company-a"
          );

        const result =
          await executeRoutedPeerInvestigationRequest(
            adapter,
            routing
          );

        expect(
          result.status
        ).toBe(
          "EXECUTED"
        );

        expect(
          result.executionOutcome
        ).toBe(
          executionOutcome
        );

        expect(
          result.issue
        ).toBeNull();

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);
