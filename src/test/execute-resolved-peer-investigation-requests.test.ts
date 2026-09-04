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
  RXResolvedPeerExecutionContexts,
} from "../investigation/resolve-peer-execution-contexts";

vi.mock(
  "../investigation/execute-routed-peer-investigation-request",
  () => ({
    executeRoutedPeerInvestigationRequest:
      vi.fn(),
  })
);

import {
  executeRoutedPeerInvestigationRequest,
} from "../investigation/execute-routed-peer-investigation-request";

import {
  executeResolvedPeerInvestigationRequests,
} from "../investigation/execute-resolved-peer-investigation-requests";

const mockedExecuteRoutedPeerInvestigationRequest =
  vi.mocked(
    executeRoutedPeerInvestigationRequest
  );

const adapter = {
  async requestJson<T>(): Promise<T> {
    throw new Error(
      "Collection executor must delegate through the routed-request executor."
    );
  },
} satisfies SectorsAdapter;

function createResolved(
  requests:
    RXResolvedPeerExecutionContexts["requests"]
): RXResolvedPeerExecutionContexts {
  return {
    planId:
      "PLAN-001",

    caseId:
      "CASE-001",

    requests,

    routedCount:
      requests.filter(
        (request) =>
          request.status ===
          "ROUTED"
      ).length,

    skippedCount:
      requests.filter(
        (request) =>
          request.status ===
          "SKIPPED"
      ).length,

    rejectedCount:
      requests.filter(
        (request) =>
          request.status ===
          "REJECTED"
      ).length,

    causalConclusion:
      "UNKNOWN",
  };
}

function createRouting(
  status:
    "ROUTED" |
    "SKIPPED" |
    "REJECTED",
  id:
    string
) {
  return {
    status,
    __testId:
      id,
  } as never;
}

describe(
  "executeResolvedPeerInvestigationRequests",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "executes every resolved routing exactly once in canonical order",
      async () => {
        const first =
          createRouting(
            "ROUTED",
            "FIRST"
          );

        const second =
          createRouting(
            "SKIPPED",
            "SECOND"
          );

        const third =
          createRouting(
            "REJECTED",
            "THIRD"
          );

        const resolved =
          createResolved([
            first,
            second,
            third,
          ]);

        mockedExecuteRoutedPeerInvestigationRequest
          .mockResolvedValueOnce({
            status:
              "EXECUTED",
          } as never)
          .mockResolvedValueOnce({
            status:
              "SKIPPED",
          } as never)
          .mockResolvedValueOnce({
            status:
              "ROUTING_REJECTED",
          } as never);

        await executeResolvedPeerInvestigationRequests(
          adapter,
          resolved,
          "2026-09-04T11:30:00.000Z"
        );

        expect(
          mockedExecuteRoutedPeerInvestigationRequest
        ).toHaveBeenCalledTimes(
          3
        );

        expect(
          mockedExecuteRoutedPeerInvestigationRequest
            .mock.calls.map(
              (call) =>
                call[1]
            )
        ).toEqual([
          first,
          second,
          third,
        ]);
      }
    );

    it(
      "forwards the same adapter and retrievedAt to every routed execution boundary",
      async () => {
        const first =
          createRouting(
            "ROUTED",
            "FIRST"
          );

        const second =
          createRouting(
            "ROUTED",
            "SECOND"
          );

        const resolved =
          createResolved([
            first,
            second,
          ]);

        mockedExecuteRoutedPeerInvestigationRequest
          .mockResolvedValue({
            status:
              "EXECUTED",
          } as never);

        await executeResolvedPeerInvestigationRequests(
          adapter,
          resolved,
          "2026-09-04T11:35:00.000Z"
        );

        expect(
          mockedExecuteRoutedPeerInvestigationRequest
        ).toHaveBeenNthCalledWith(
          1,
          adapter,
          first,
          "2026-09-04T11:35:00.000Z"
        );

        expect(
          mockedExecuteRoutedPeerInvestigationRequest
        ).toHaveBeenNthCalledWith(
          2,
          adapter,
          second,
          "2026-09-04T11:35:00.000Z"
        );
      }
    );

    it(
      "preserves plan and case identity",
      async () => {
        const resolved =
          createResolved([]);

        const result =
          await executeResolvedPeerInvestigationRequests(
            adapter,
            resolved
          );

        expect(
          result.planId
        ).toBe(
          "PLAN-001"
        );

        expect(
          result.caseId
        ).toBe(
          "CASE-001"
        );
      }
    );

    it(
      "preserves returned outcomes in execution order",
      async () => {
        const first =
          createRouting(
            "ROUTED",
            "FIRST"
          );

        const second =
          createRouting(
            "ROUTED",
            "SECOND"
          );

        const firstOutcome = {
          status:
            "EXECUTED",
        } as never;

        const secondOutcome = {
          status:
            "EXECUTED",
        } as never;

        mockedExecuteRoutedPeerInvestigationRequest
          .mockResolvedValueOnce(
            firstOutcome
          )
          .mockResolvedValueOnce(
            secondOutcome
          );

        const result =
          await executeResolvedPeerInvestigationRequests(
            adapter,
            createResolved([
              first,
              second,
            ])
          );

        expect(
          result.outcomes
        ).toEqual([
          firstOutcome,
          secondOutcome,
        ]);
      }
    );

    it(
      "derives deterministic execution accounting from actual outcomes",
      async () => {
        const requests = [
          createRouting(
            "ROUTED",
            "A"
          ),
          createRouting(
            "ROUTED",
            "B"
          ),
          createRouting(
            "SKIPPED",
            "C"
          ),
          createRouting(
            "REJECTED",
            "D"
          ),
          createRouting(
            "ROUTED",
            "E"
          ),
        ];

        mockedExecuteRoutedPeerInvestigationRequest
          .mockResolvedValueOnce({
            status:
              "EXECUTED",
          } as never)
          .mockResolvedValueOnce({
            status:
              "EXECUTED",
          } as never)
          .mockResolvedValueOnce({
            status:
              "SKIPPED",
          } as never)
          .mockResolvedValueOnce({
            status:
              "ROUTING_REJECTED",
          } as never)
          .mockResolvedValueOnce({
            status:
              "EXECUTED",
          } as never);

        const result =
          await executeResolvedPeerInvestigationRequests(
            adapter,
            createResolved(
              requests
            )
          );

        expect(
          result.executedCount
        ).toBe(
          3
        );

        expect(
          result.skippedCount
        ).toBe(
          1
        );

        expect(
          result.routingRejectedCount
        ).toBe(
          1
        );
      }
    );

    it(
      "does not trust upstream routing counts as execution accounting",
      async () => {
        const routing =
          createRouting(
            "ROUTED",
            "FIRST"
          );

        const resolved = {
          ...createResolved([
            routing,
          ]),

          routedCount:
            999,

          skippedCount:
            999,

          rejectedCount:
            999,
        };

        mockedExecuteRoutedPeerInvestigationRequest
          .mockResolvedValue({
            status:
              "EXECUTED",
          } as never);

        const result =
          await executeResolvedPeerInvestigationRequests(
            adapter,
            resolved
          );

        expect(
          result.executedCount
        ).toBe(
          1
        );

        expect(
          result.skippedCount
        ).toBe(
          0
        );

        expect(
          result.routingRejectedCount
        ).toBe(
          0
        );
      }
    );

    it(
      "returns an empty deterministic collection without execution calls",
      async () => {
        const result =
          await executeResolvedPeerInvestigationRequests(
            adapter,
            createResolved([])
          );

        expect(
          mockedExecuteRoutedPeerInvestigationRequest
        ).not.toHaveBeenCalled();

        expect(
          result.outcomes
        ).toEqual([]);

        expect(
          result.executedCount
        ).toBe(
          0
        );

        expect(
          result.skippedCount
        ).toBe(
          0
        );

        expect(
          result.routingRejectedCount
        ).toBe(
          0
        );
      }
    );

    it(
      "never promotes collection execution into a causal conclusion",
      async () => {
        mockedExecuteRoutedPeerInvestigationRequest
          .mockResolvedValue({
            status:
              "EXECUTED",
          } as never);

        const result =
          await executeResolvedPeerInvestigationRequests(
            adapter,
            createResolved([
              createRouting(
                "ROUTED",
                "FIRST"
              ),
            ])
          );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not mutate the resolved execution-context collection",
      async () => {
        const first =
          createRouting(
            "ROUTED",
            "FIRST"
          );

        const resolved =
          createResolved([
            first,
          ]);

        const requestsBefore =
          [...resolved.requests];

        mockedExecuteRoutedPeerInvestigationRequest
          .mockResolvedValue({
            status:
              "EXECUTED",
          } as never);

        await executeResolvedPeerInvestigationRequests(
          adapter,
          resolved
        );

        expect(
          resolved.requests
        ).toEqual(
          requestsBefore
        );

        expect(
          resolved.requests[0]
        ).toBe(
          first
        );
      }
    );

    it(
      "waits for each request before starting the next request",
      async () => {
        const first =
          createRouting(
            "ROUTED",
            "FIRST"
          );

        const second =
          createRouting(
            "ROUTED",
            "SECOND"
          );

        let resolveFirst:
          (
            value:
              never
          ) => void =
            () => {};

        const firstPromise =
          new Promise<never>(
            (resolve) => {
              resolveFirst =
                resolve;
            }
          );

        mockedExecuteRoutedPeerInvestigationRequest
          .mockReturnValueOnce(
            firstPromise
          )
          .mockResolvedValueOnce({
            status:
              "EXECUTED",
          } as never);

        const executionPromise =
          executeResolvedPeerInvestigationRequests(
            adapter,
            createResolved([
              first,
              second,
            ])
          );

        await Promise.resolve();

        expect(
          mockedExecuteRoutedPeerInvestigationRequest
        ).toHaveBeenCalledTimes(
          1
        );

        resolveFirst({
          status:
            "EXECUTED",
        } as never);

        await executionPromise;

        expect(
          mockedExecuteRoutedPeerInvestigationRequest
        ).toHaveBeenCalledTimes(
          2
        );
      }
    );
  }
);
