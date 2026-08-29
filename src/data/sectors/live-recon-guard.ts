import type {
  RXSectorsTypedOperationRequest,
} from "./sectors-operation-request";

import {
  compileSectorsRestRequest,
} from "./sectors-rest-request-compiler";

export type RXLiveReconGuardIssue =
  | "LIVE_EXECUTION_NOT_CONFIRMED"
  | "API_KEY_MISSING"
  | "OPERATION_NOT_ALLOWED"
  | "REQUEST_NOT_COMPILED"
  | "CREDIT_LIMIT_EXCEEDED";

export interface RXLiveReconGuardInput {
  operationRequest:
    RXSectorsTypedOperationRequest;

  apiKeyPresent: boolean;

  /**
   * Must be explicitly true at the final
   * live-execution boundary.
   */
  liveExecutionConfirmed: boolean;

  /**
   * Maximum local credit allowance for
   * this single recon execution.
   */
  maxCredits: number;
}

export type RXLiveReconGuardResult =
  | {
      status: "READY";
      issues: [];
      estimatedCredits: number;
    }
  | {
      status: "BLOCKED";
      issues: RXLiveReconGuardIssue[];
      estimatedCredits: number | null;
    };

const ALLOWED_LIVE_RECON_OPERATION =
  "GET_MINING_OPERATIONAL_CONTEXT" as const;

/**
 * Final deterministic safety guard before a controlled
 * live reconnaissance request is allowed to execute.
 *
 * This function performs no network request.
 */
export function evaluateLiveReconGuard(
  input: RXLiveReconGuardInput
): RXLiveReconGuardResult {
  const issues:
    RXLiveReconGuardIssue[] = [];

  if (!input.liveExecutionConfirmed) {
    issues.push(
      "LIVE_EXECUTION_NOT_CONFIRMED"
    );
  }

  if (!input.apiKeyPresent) {
    issues.push(
      "API_KEY_MISSING"
    );
  }

  if (
    input.operationRequest.operation !==
    ALLOWED_LIVE_RECON_OPERATION
  ) {
    issues.push(
      "OPERATION_NOT_ALLOWED"
    );
  }

  const compiled =
    compileSectorsRestRequest(
      input.operationRequest
    );

  if (compiled.status !== "COMPILED") {
    issues.push(
      "REQUEST_NOT_COMPILED"
    );

    return {
      status: "BLOCKED",
      issues,
      estimatedCredits: null,
    };
  }

  const estimatedCredits =
    compiled.request.estimatedCredits;

  if (
    !Number.isInteger(
      input.maxCredits
    ) ||
    input.maxCredits <= 0 ||
    estimatedCredits >
      input.maxCredits
  ) {
    issues.push(
      "CREDIT_LIMIT_EXCEEDED"
    );
  }

  if (issues.length > 0) {
    return {
      status: "BLOCKED",
      issues,
      estimatedCredits,
    };
  }

  return {
    status: "READY",
    issues: [],
    estimatedCredits,
  };
}
