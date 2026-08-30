import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  RXPreparedInvestigationRequests,
} from "./prepare-investigation-requests";

import type {
  RXPreparedInvestigationExecutionOutcome,
} from "./execute-prepared-investigation-request";

import {
  executePreparedInvestigationRequest,
} from "./execute-prepared-investigation-request";

export interface RXPreparedInvestigationRunContext {
  companyId: string;

  /**
   * Optional audit timestamp propagated to
   * admitted evidence.
   */
  retrievedAt?: string;
}

export interface RXPreparedInvestigationExecutionSummary {
  totalCount: number;

  evidenceAdmittedCount: number;

  evidenceRejectedCount: number;

  executionFailedCount: number;

  executionRejectedCount: number;

  skippedCount: number;

  admissionNotSupportedCount: number;
}

export interface RXPreparedInvestigationExecutionResult {
  planId: string;

  caseId: string;

  outcomes:
    RXPreparedInvestigationExecutionOutcome[];

  summary:
    RXPreparedInvestigationExecutionSummary;

  /**
   * Whole-investigation orchestration reports
   * execution/evidence coverage only.
   *
   * It does not infer causal explanations.
   */
  causalConclusion:
    "UNKNOWN";
}

function buildSourceReference(
  prepared:
    RXPreparedInvestigationRequests["requests"][number]
): string {
  if (
    prepared.status ===
    "REJECTED"
  ) {
    return [
      "sectors",
      "investigation",
      prepared.request.capability,
      prepared.request.requestId,
    ].join(":");
  }

  switch (
    prepared.operation.operation
  ) {
    case "GET_MINING_OPERATIONAL_CONTEXT":
      return [
        "sectors",
        "mining-operational-context",
        prepared.operation.params.sectorsSlug,
      ].join(":");

    case "GET_MINING_HISTORICAL_PERFORMANCE": {
      const period =
        prepared.operation.params.period;

      const periodReference =
        period.kind === "YEAR"
          ? String(
              period.year ??
                "unknown-year"
            )
          : "unknown-period";

      return [
        "sectors",
        "mining-performance",
        prepared.operation.params.sectorsSlug,
        periodReference,
      ].join(":");
    }

    case "GET_COMMODITY_PRICE_HISTORY":
      return [
        "sectors",
        "commodity-price",
        prepared.operation.params.commodity,
        prepared.request.requestId,
      ].join(":");

    case "GET_COMPANY_MARKET_TRANSACTION_HISTORY":
      return [
        "sectors",
        "market-transaction",
        prepared.operation.params.ticker,
        prepared.request.requestId,
      ].join(":");
  }
}

function summarizeOutcomes(
  outcomes:
    RXPreparedInvestigationExecutionOutcome[]
): RXPreparedInvestigationExecutionSummary {
  const summary:
    RXPreparedInvestigationExecutionSummary = {
    totalCount:
      outcomes.length,

    evidenceAdmittedCount:
      0,

    evidenceRejectedCount:
      0,

    executionFailedCount:
      0,

    executionRejectedCount:
      0,

    skippedCount:
      0,

    admissionNotSupportedCount:
      0,
  };

  for (const outcome of outcomes) {
    switch (outcome.status) {
      case "EVIDENCE_ADMITTED":
        summary.evidenceAdmittedCount +=
          1;
        break;

      case "EVIDENCE_REJECTED":
        summary.evidenceRejectedCount +=
          1;
        break;

      case "EXECUTION_FAILED":
        summary.executionFailedCount +=
          1;
        break;

      case "EXECUTION_REJECTED":
        summary.executionRejectedCount +=
          1;
        break;

      case "SKIPPED":
        summary.skippedCount +=
          1;
        break;

      case "ADMISSION_NOT_SUPPORTED":
        summary.admissionNotSupportedCount +=
          1;
        break;
    }
  }

  return summary;
}

export async function executePreparedInvestigation(
  adapter:
    SectorsAdapter,
  prepared:
    RXPreparedInvestigationRequests,
  context:
    RXPreparedInvestigationRunContext
): Promise<
  RXPreparedInvestigationExecutionResult
> {
  const outcomes:
    RXPreparedInvestigationExecutionOutcome[] =
      [];

  /**
   * Intentionally sequential.
   *
   * Once this path reaches live Sectors execution,
   * sequential dispatch keeps request ordering,
   * local credit reservation, ledger behavior,
   * and failure diagnosis deterministic.
   *
   * One failed request does not abort the remaining
   * investigation requests.
   */
  for (
    const preparedRequest
    of prepared.requests
  ) {
    const outcome =
      await executePreparedInvestigationRequest(
        adapter,
        preparedRequest,
        {
          companyId:
            context.companyId,

          sourceReference:
            buildSourceReference(
              preparedRequest
            ),

          retrievedAt:
            context.retrievedAt,
        }
      );

    outcomes.push(outcome);
  }

  return {
    planId:
      prepared.planId,

    caseId:
      prepared.caseId,

    outcomes,

    summary:
      summarizeOutcomes(
        outcomes
      ),

    causalConclusion:
      "UNKNOWN",
  };
}