import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  RXSectorsMcpToolCaller,
} from "../data/sectors-mcp/sectors-mcp-company-enrichment";

import type {
  RXInvestigationCase,
} from "./investigation-case";

import type {
  RXInvestigationOperationContext,
} from "./bind-operation-request";

import {
  createInvestigationPlan,
} from "./create-investigation-plan";

import {
  prepareInvestigationOrchestration,
} from "./prepare-investigation-orchestration";

import {
  executeInvestigationOrchestration,
} from "./execute-investigation-orchestration";

import type {
  RXInvestigationOrchestrationExecutionResult,
} from "./execute-investigation-orchestration";

export interface RXIntegratedInvestigationRunInput {
  investigationCase:
    RXInvestigationCase;

  operationContext:
    RXInvestigationOperationContext;

  retrievedAt?:
    string;
}

export interface RXIntegratedInvestigationRunResult {
  status:
    "COMPLETED";

  stage:
    "DETERMINISTIC_INVESTIGATION";

  investigationCase:
    RXInvestigationCase;

  execution:
    RXInvestigationOrchestrationExecutionResult;

  causalConclusion:
    "UNKNOWN";
}

/**
 * Canonical application composition for one already-established
 * investigation case.
 *
 * Ownership:
 *
 * investigation case
 * -> deterministic plan
 * -> execution-boundary orchestration
 * -> REST + Financial MCP execution
 * -> integrated deterministic result
 *
 * This layer:
 *
 * - does not own API keys;
 * - does not construct REST transport;
 * - does not construct MCP transport;
 * - does not perform AI synthesis;
 * - does not infer causality.
 *
 * Both provider boundaries are injected by the outer application
 * runtime.
 */
export async function runIntegratedInvestigation(
  adapter:
    SectorsAdapter,

  mcpCaller:
    RXSectorsMcpToolCaller,

  input:
    RXIntegratedInvestigationRunInput,
): Promise<RXIntegratedInvestigationRunResult> {
  const plan =
    createInvestigationPlan(
      input.investigationCase,
    );

  const prepared =
    prepareInvestigationOrchestration(
      plan,
      input.operationContext,
    );

  const execution =
    await executeInvestigationOrchestration(
      adapter,
      mcpCaller,
      prepared,
      {
        companyId:
          input.operationContext.companyId,

        symbol:
          input.operationContext.ticker ?? "",

        retrievedAt:
          input.retrievedAt,
      },
    );

  return {
    status:
      "COMPLETED",

    stage:
      "DETERMINISTIC_INVESTIGATION",

    investigationCase:
      input.investigationCase,

    execution,

    causalConclusion:
      "UNKNOWN",
  };
}