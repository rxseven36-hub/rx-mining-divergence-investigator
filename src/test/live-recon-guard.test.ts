import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateLiveReconGuard,
} from "../data/sectors/live-recon-guard";

describe(
  "evaluateLiveReconGuard",
  () => {
    const operationalRequest = {
      operation:
        "GET_MINING_OPERATIONAL_CONTEXT",
      purpose:
        "Verify the RX controlled live Sectors execution pipeline.",
      params: {
        sectorsSlug: "aadi",
      },
    } as const;

    it(
      "allows an explicitly authorized operational-context recon when every guard passes",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest:
              operationalRequest,

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: true,

            liveExecutionConfirmed:
              true,

            maxCredits: 1,
          });

        expect(result).toEqual({
          status: "READY",
          issues: [],
          estimatedCredits: 1,
        });
      }
    );

    it(
      "blocks live execution without explicit confirmation",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest:
              operationalRequest,

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: true,

            liveExecutionConfirmed:
              false,

            maxCredits: 1,
          });

        expect(result.status).toBe(
          "BLOCKED"
        );

        expect(
          result.issues
        ).toContain(
          "LIVE_EXECUTION_NOT_CONFIRMED"
        );
      }
    );

    it(
      "blocks live execution when the API key is absent",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest:
              operationalRequest,

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: false,

            liveExecutionConfirmed:
              true,

            maxCredits: 1,
          });

        expect(result.status).toBe(
          "BLOCKED"
        );

        expect(
          result.issues
        ).toContain(
          "API_KEY_MISSING"
        );
      }
    );

    it(
      "blocks an operation that was not explicitly authorized by the runner",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest: {
              operation:
                "GET_COMMODITY_PRICE_HISTORY",

              purpose:
                "Attempt an unapproved live recon operation.",

              params: {
                commodity: "COAL",

                period: {
                  kind: "YEAR",
                  year: 2024,
                },
              },
            },

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: true,

            liveExecutionConfirmed:
              true,

            maxCredits: 1,
          });

        expect(result.status).toBe(
          "BLOCKED"
        );

        expect(
          result.issues
        ).toContain(
          "OPERATION_NOT_ALLOWED"
        );
      }
    );

    it(
      "blocks compiled historical performance when the runner authorizes only operational context",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest: {
              operation:
                "GET_MINING_HISTORICAL_PERFORMANCE",

              purpose:
                "Attempt historical recon.",

              params: {
                sectorsSlug: "aadi",

                period: {
                  kind: "YEAR",
                  year: 2024,
                },
              },
            },

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: true,

            liveExecutionConfirmed:
              true,

            maxCredits: 1,
          });

        expect(result).toEqual({
          status: "BLOCKED",

          issues: [
            "OPERATION_NOT_ALLOWED",
          ],

          estimatedCredits: 1,
        });
      }
    );

    it(
      "allows historical performance only when that exact operation is explicitly authorized",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest: {
              operation:
                "GET_MINING_HISTORICAL_PERFORMANCE",

              purpose:
                "Collect controlled historical mining performance evidence.",

              params: {
                sectorsSlug: "aadi",

                period: {
                  kind: "YEAR",
                  year: 2024,
                },
              },
            },

            authorizedOperation:
              "GET_MINING_HISTORICAL_PERFORMANCE",

            apiKeyPresent: true,

            liveExecutionConfirmed:
              true,

            maxCredits: 1,
          });

        expect(result).toEqual({
          status: "READY",
          issues: [],
          estimatedCredits: 1,
        });
      }
    );

    it(
      "blocks a request that cannot be compiled",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest: {
              operation:
                "GET_MINING_OPERATIONAL_CONTEXT",

              purpose:
                "Attempt invalid operational recon.",

              params: {
                sectorsSlug: "   ",
              },
            },

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: true,

            liveExecutionConfirmed:
              true,

            maxCredits: 1,
          });

        expect(result).toEqual({
          status: "BLOCKED",

          issues: [
            "REQUEST_NOT_COMPILED",
          ],

          estimatedCredits: null,
        });
      }
    );

    it(
      "blocks execution when the local credit allowance is insufficient",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest:
              operationalRequest,

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: true,

            liveExecutionConfirmed:
              true,

            maxCredits: 0,
          });

        expect(result.status).toBe(
          "BLOCKED"
        );

        expect(
          result.issues
        ).toContain(
          "CREDIT_LIMIT_EXCEEDED"
        );

        expect(
          result.estimatedCredits
        ).toBe(1);
      }
    );

    it(
      "can report multiple independent safety failures without executing anything",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest:
              operationalRequest,

            authorizedOperation:
              "GET_MINING_OPERATIONAL_CONTEXT",

            apiKeyPresent: false,

            liveExecutionConfirmed:
              false,

            maxCredits: 0,
          });

        expect(result).toEqual({
          status: "BLOCKED",

          issues: [
            "LIVE_EXECUTION_NOT_CONFIRMED",
            "API_KEY_MISSING",
            "CREDIT_LIMIT_EXCEEDED",
          ],

          estimatedCredits: 1,
        });
      }
    );
  }
);