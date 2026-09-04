import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  executeRoutedPeerInvestigationRequest,
} from "./execute-routed-peer-investigation-request";

import type {
  RXRoutedPeerInvestigationExecutionOutcome,
} from "./execute-routed-peer-investigation-request";

import type {
  RXResolvedPeerExecutionContexts,
} from "./resolve-peer-execution-contexts";

export interface RXExecutedPeerInvestigationRequests {
  planId:
    string;

  caseId:
    string;

  outcomes:
    RXRoutedPeerInvestigationExecutionOutcome[];

  executedCount:
    number;

  skippedCount:
    number;

  routingRejectedCount:
    number;

  /**
   * Collection execution only orchestrates already-resolved
   * peer request routings.
   *
   * It does NOT:
   * - infer causal explanations,
   * - score or rank evidence,
   * - reinterpret routing decisions,
   * - synthesize investigation conclusions,
   * - call an LLM.
   */
  causalConclusion:
    "UNKNOWN";
}

/**
 * Executes one resolved peer-request routing collection
 * in its existing canonical order.
 *
 * Each routing is delegated to the locked single-request
 * execution boundary.
 *
 * Execution is deliberately sequential:
 *
 * - request order remains observable and deterministic,
 * - routing semantics are not recomputed here,
 * - SKIPPED / REJECTED behavior remains owned by the
 *   single-request executor,
 * - no parallel API execution is introduced.
 */
export async function executeResolvedPeerInvestigationRequests(
  adapter:
    SectorsAdapter,
  resolved:
    RXResolvedPeerExecutionContexts,
  retrievedAt?: string
): Promise<
  RXExecutedPeerInvestigationRequests
> {
  const outcomes:
    RXRoutedPeerInvestigationExecutionOutcome[] =
      [];

  for (
    const routing of
    resolved.requests
  ) {
    const outcome =
      await executeRoutedPeerInvestigationRequest(
        adapter,
        routing,
        retrievedAt
      );

    outcomes.push(
      outcome
    );
  }

  const executedCount =
    outcomes.filter(
      (outcome) =>
        outcome.status ===
        "EXECUTED"
    ).length;

  const skippedCount =
    outcomes.filter(
      (outcome) =>
        outcome.status ===
        "SKIPPED"
    ).length;

  const routingRejectedCount =
    outcomes.filter(
      (outcome) =>
        outcome.status ===
        "ROUTING_REJECTED"
    ).length;

  return {
    planId:
      resolved.planId,

    caseId:
      resolved.caseId,

    outcomes,

    executedCount,

    skippedCount,

    routingRejectedCount,

    causalConclusion:
      "UNKNOWN",
  };
}
