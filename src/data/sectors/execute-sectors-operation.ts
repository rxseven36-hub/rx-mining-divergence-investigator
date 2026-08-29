import type {
  SectorsAdapter,
} from "./sectors-adapter";

import {
  compileSectorsRestRequest,
  type RXSectorsRestCompileIssue,
} from "./sectors-rest-request-compiler";

import type {
  RXSectorsTypedOperationRequest,
} from "./sectors-operation-request";

export type RXSectorsExecutionResult<T> =
  | {
      status: "EXECUTED";
      data: T;
      issues: [];
      cause: null;
    }
  | {
      status: "REJECTED";
      data: null;
      issues: RXSectorsRestCompileIssue[];
      cause: null;
    }
  | {
      status: "FAILED";
      data: null;
      issues: [];
      cause: unknown;
    };

/**
 * Controlled runtime boundary between a typed RX operation
 * and the official Sectors adapter.
 *
 * Rules:
 * - compilation happens before execution;
 * - rejected requests never reach the adapter;
 * - no REST path can be supplied by the caller;
 * - adapter failures remain distinguishable from
 *   deterministic request rejection.
 */
export async function executeSectorsOperation<T>(
  adapter: SectorsAdapter,
  operationRequest:
    RXSectorsTypedOperationRequest
): Promise<RXSectorsExecutionResult<T>> {
  const compiled =
    compileSectorsRestRequest(
      operationRequest
    );

  if (compiled.status === "REJECTED") {
    return {
      status: "REJECTED",
      data: null,
      issues: compiled.issues,
      cause: null,
    };
  }

  try {
    const data =
      await adapter.requestJson<T>(
        compiled.request
      );

    return {
      status: "EXECUTED",
      data,
      issues: [],
      cause: null,
    };
  } catch (cause: unknown) {
    return {
      status: "FAILED",
      data: null,
      issues: [],
      cause,
    };
  }
}
