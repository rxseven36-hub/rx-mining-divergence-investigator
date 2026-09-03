import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  executePreparedInvestigationRequest,
} from "./execute-prepared-investigation-request";

import type {
  RXPreparedInvestigationExecutionOutcome,
} from "./execute-prepared-investigation-request";

import type {
  RXPeerPreparedRequestExecutionRouting,
} from "./resolve-peer-execution-contexts";

export type RXRoutedPeerInvestigationExecutionOutcome =
  | {
      status:
        "SKIPPED";

      routing:
        Extract<
          RXPeerPreparedRequestExecutionRouting,
          {
            status:
              "SKIPPED";
          }
        >;

      executionOutcome:
        null;

      issue:
        "PEER_ROUTING_SKIPPED";

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "ROUTING_REJECTED";

      routing:
        Extract<
          RXPeerPreparedRequestExecutionRouting,
          {
            status:
              "REJECTED";
          }
        >;

      executionOutcome:
        null;

      issue:
        "PEER_EXECUTION_ROUTING_REJECTED";

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EXECUTED";

      routing:
        Extract<
          RXPeerPreparedRequestExecutionRouting,
          {
            status:
              "ROUTED";
          }
        >;

      executionOutcome:
        RXPreparedInvestigationExecutionOutcome;

      issue:
        null;

      causalConclusion:
        "UNKNOWN";
    };

/**
 * Executes exactly one already-routed peer investigation request.
 *
 * Routing is a hard execution boundary:
 *
 * - SKIPPED requests never reach the Sectors adapter.
 * - REJECTED routing never reaches the Sectors adapter.
 * - ROUTED requests reuse the canonical single-request
 *   execution and evidence-admission pipeline.
 *
 * Shared peer requests deliberately carry no companyId.
 *
 * No LLM call or causal inference occurs here.
 */
export async function executeRoutedPeerInvestigationRequest(
  adapter:
    SectorsAdapter,
  routing:
    RXPeerPreparedRequestExecutionRouting,
  retrievedAt?: string
): Promise<
  RXRoutedPeerInvestigationExecutionOutcome
> {
  if (
    routing.status ===
    "SKIPPED"
  ) {
    return {
      status:
        "SKIPPED",

      routing,

      executionOutcome:
        null,

      issue:
        "PEER_ROUTING_SKIPPED",

      causalConclusion:
        "UNKNOWN",
    };
  }

  if (
    routing.status ===
    "REJECTED"
  ) {
    return {
      status:
        "ROUTING_REJECTED",

      routing,

      executionOutcome:
        null,

      issue:
        "PEER_EXECUTION_ROUTING_REJECTED",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const executionOutcome =
    await executePreparedInvestigationRequest(
      adapter,
      routing.preparedRequest,
      {
        ...(routing.context.companyId ===
        null
          ? {}
          : {
              companyId:
                routing.context.companyId,
            }),

        sourceReference:
          routing.context.sourceReference,

        retrievedAt,
      }
    );

  return {
    status:
      "EXECUTED",

    routing,

    executionOutcome,

    issue: null,

    causalConclusion:
      "UNKNOWN",
  };
}
