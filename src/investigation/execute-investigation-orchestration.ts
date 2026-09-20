import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  RXSectorsMcpToolCaller,
} from "../data/sectors-mcp/sectors-mcp-company-enrichment";

import type {
  RXPreparedInvestigationOrchestration,
} from "./prepare-investigation-orchestration";

import {
  executePreparedInvestigation,
} from "./execute-prepared-investigation";

import type {
  RXPreparedInvestigationExecutionResult,
} from "./execute-prepared-investigation";

import {
  executeFinancialReportMcp,
} from "./execute-financial-report-mcp";

import type {
  RXFinancialMcpExecutionResult,
} from "./execute-financial-report-mcp";

export interface RXInvestigationOrchestrationExecutionContext {
  companyId:
    string;

  symbol:
    string;

  retrievedAt?:
    string;
}

export type RXFinancialOrchestrationExecutionOutcome =
  | {
      status:
        "PREPARATION_REJECTED";

      requestId:
        string;

      execution:
        null;

      issues:
        string[];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EXECUTED";

      requestId:
        string;

      execution:
        RXFinancialMcpExecutionResult;

      issues:
        [];

      causalConclusion:
        "UNKNOWN";
    };

export interface RXInvestigationOrchestrationExecutionSummary {
  restRequestCount:
    number;

  restEvidenceAdmittedCount:
    number;

  restEvidenceRejectedCount:
    number;

  restExecutionFailedCount:
    number;

  restExecutionRejectedCount:
    number;

  restSkippedCount:
    number;

  restAdmissionNotSupportedCount:
    number;

  financialRequestCount:
    number;

  financialAnalyzedCount:
    number;

  financialEvidenceRejectedCount:
    number;

  financialExecutionFailedCount:
    number;

  financialPreparationRejectedCount:
    number;

  financialBindingRejectedCount:
    number;
}

export interface RXInvestigationOrchestrationExecutionResult {
  planId:
    string;

  caseId:
    string;

  rest:
    RXPreparedInvestigationExecutionResult;

  financial:
    RXFinancialOrchestrationExecutionOutcome[];

  summary:
    RXInvestigationOrchestrationExecutionSummary;

  causalConclusion:
    "UNKNOWN";
}

function buildFinancialSourceReference(
  symbol:
    string,

  requestId:
    string,
): string {
  return [
    "sectors-mcp",
    "company-financial-report",
    symbol.trim().toUpperCase(),
    requestId,
  ].join(":");
}

function buildSummary(
  rest:
    RXPreparedInvestigationExecutionResult,

  financial:
    RXFinancialOrchestrationExecutionOutcome[],
): RXInvestigationOrchestrationExecutionSummary {
  let financialAnalyzedCount =
    0;

  let financialEvidenceRejectedCount =
    0;

  let financialExecutionFailedCount =
    0;

  let financialPreparationRejectedCount =
    0;

  let financialBindingRejectedCount =
    0;

  for (
    const outcome
    of financial
  ) {
    if (
      outcome.status ===
      "PREPARATION_REJECTED"
    ) {
      financialPreparationRejectedCount +=
        1;

      continue;
    }

    switch (
      outcome.execution.status
    ) {
      case "ANALYZED":
        financialAnalyzedCount +=
          1;
        break;

      case "EVIDENCE_REJECTED":
        financialEvidenceRejectedCount +=
          1;
        break;

      case "EXECUTION_FAILED":
        financialExecutionFailedCount +=
          1;
        break;

      case "BINDING_REJECTED":
        financialBindingRejectedCount +=
          1;
        break;
    }
  }

  return {
    restRequestCount:
      rest.summary.totalCount,

    restEvidenceAdmittedCount:
      rest.summary.evidenceAdmittedCount,

    restEvidenceRejectedCount:
      rest.summary.evidenceRejectedCount,

    restExecutionFailedCount:
      rest.summary.executionFailedCount,

    restExecutionRejectedCount:
      rest.summary.executionRejectedCount,

    restSkippedCount:
      rest.summary.skippedCount,

    restAdmissionNotSupportedCount:
      rest.summary.admissionNotSupportedCount,

    financialRequestCount:
      financial.length,

    financialAnalyzedCount,

    financialEvidenceRejectedCount,

    financialExecutionFailedCount,

    financialPreparationRejectedCount,

    financialBindingRejectedCount,
  };
}

/**
 * Executes one already-prepared investigation orchestration.
 *
 * Boundary ownership remains explicit:
 *
 * - REST requests are executed only by the existing
 *   REST whole-investigation executor.
 *
 * - COMPANY_FINANCIAL_REPORT requests are executed only
 *   by the dedicated MCP financial executor.
 *
 * - A Financial failure never aborts the REST execution
 *   result because Financial evidence is contextual and
 *   optional in the canonical plan.
 *
 * - No AI synthesis occurs here.
 *
 * - No causal conclusion is inferred here.
 *
 * The MCP caller is injected. This composition layer owns
 * no API key and opens no MCP transport by itself.
 */
export async function executeInvestigationOrchestration(
  adapter:
    SectorsAdapter,

  mcpCaller:
    RXSectorsMcpToolCaller,

  prepared:
    RXPreparedInvestigationOrchestration,

  context:
    RXInvestigationOrchestrationExecutionContext,
): Promise<RXInvestigationOrchestrationExecutionResult> {
  const rest =
    await executePreparedInvestigation(
      adapter,
      prepared.rest,
      {
        companyId:
          context.companyId,

        retrievedAt:
          context.retrievedAt,
      },
    );

  const financial:
    RXFinancialOrchestrationExecutionOutcome[] =
      [];

  /**
   * Keep MCP dispatch sequential for the same reason the
   * canonical REST whole-runner is sequential:
   * deterministic ordering and failure diagnosis.
   *
   * One Financial request failure does not abort another
   * prepared MCP request.
   */
  for (
    const preparedFinancial
    of prepared.mcp
  ) {
    if (
      preparedFinancial.status ===
      "REJECTED"
    ) {
      financial.push({
        status:
          "PREPARATION_REJECTED",

        requestId:
          preparedFinancial.request.requestId,

        execution:
          null,

        issues: [
          ...preparedFinancial.bindingIssues,
        ],

        causalConclusion:
          "UNKNOWN",
      });

      continue;
    }

    const execution =
      await executeFinancialReportMcp(
        mcpCaller,
        {
          companyId:
            context.companyId,

          symbol:
            context.symbol,

          sourceReference:
            buildFinancialSourceReference(
              context.symbol,
              preparedFinancial.request.requestId,
            ),

          retrievedAt:
            context.retrievedAt,
        },
      );

    financial.push({
      status:
        "EXECUTED",

      requestId:
        preparedFinancial.request.requestId,

      execution,

      issues:
        [],

      causalConclusion:
        "UNKNOWN",
    });
  }

  return {
    planId:
      prepared.planId,

    caseId:
      prepared.caseId,

    rest,

    financial,

    summary:
      buildSummary(
        rest,
        financial,
      ),

    causalConclusion:
      "UNKNOWN",
  };
}