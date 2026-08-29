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
      "allows the single verified operational-context recon when every guard passes",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest:
              operationalRequest,
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
      "blocks operations outside the explicitly allowed recon operation",
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
      "blocks compiled historical performance because live recon permission remains operation-specific",
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
      "blocks execution when the local credit allowance is insufficient",
      () => {
        const result =
          evaluateLiveReconGuard({
            operationRequest:
              operationalRequest,
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