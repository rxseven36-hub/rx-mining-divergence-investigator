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

export type RXSectorsExecutionFailureIssue =
  | string;

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
      issues: RXSectorsExecutionFailureIssue[];
      cause: unknown;
    };

function projectExecutionFailureIssues(
  cause: unknown,
): RXSectorsExecutionFailureIssue[] {
  if (
    typeof cause !== "object" ||
    cause === null
  ) {
    return [];
  }

  const record =
    cause as {
      code?: unknown;
      status?: unknown;
      message?: unknown;
    };

  const issues:
    RXSectorsExecutionFailureIssue[] = [];

  if (
    typeof record.code === "string" &&
    record.code.trim().length > 0
  ) {
    issues.push(
      record.code.trim(),
    );
  }

  if (
    typeof record.status === "number" &&
    Number.isInteger(record.status)
  ) {
    issues.push(
      `HTTP_STATUS:${record.status}`,
    );
  }

  if (
    typeof record.message === "string" &&
    record.message.trim().length > 0
  ) {
    issues.push(
      `MESSAGE:${record.message.trim()}`,
    );
  }

  return Array.from(
    new Set(
      issues,
    ),
  );
}

/**
 * Controlled runtime boundary between a typed RX operation
 * and the official Sectors adapter.
 *
 * Rules:
 * - compilation happens before execution;
 * - rejected requests never reach the adapter;
 * - no REST path can be supplied by the caller;
 * - adapter failures remain distinguishable from
 *   deterministic request rejection;
 * - provider failures expose only bounded diagnostic issues;
 * - the original cause remains available for internal debugging.
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
      issues:
        projectExecutionFailureIssues(
          cause,
        ),
      cause,
    };
  }
}