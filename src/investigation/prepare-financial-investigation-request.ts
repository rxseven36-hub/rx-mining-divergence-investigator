import {
  bindFinancialReportMcpRequest,
} from "../data/sectors-mcp/financial-report-request";

import type {
  RXFinancialReportMcpRequest,
} from "../data/sectors-mcp/financial-report-request";

import {
  getCapabilityDefinition,
} from "./capability-registry";

import type {
  RXInvestigationDataRequest,
  RXEvidenceRequirement,
} from "./investigation-plan";

import {
  validateExecutionRequest,
} from "./validate-execution-request";

import type {
  RXInvestigationExecutionDecision,
} from "./execution";

export type RXPreparedFinancialInvestigationRequest =
  | {
      status:
        "READY";

      request:
        RXInvestigationDataRequest;

      requirement:
        RXEvidenceRequirement;

      executionDecision:
        RXInvestigationExecutionDecision;

      mcpRequest:
        RXFinancialReportMcpRequest;

      bindingIssues:
        [];
    }
  | {
      status:
        "REJECTED";

      request:
        RXInvestigationDataRequest;

      requirement:
        RXEvidenceRequirement | null;

      executionDecision:
        RXInvestigationExecutionDecision;

      mcpRequest:
        null;

      bindingIssues:
        string[];
    };

export function prepareFinancialInvestigationRequest(
  request:
    RXInvestigationDataRequest,

  requirement:
    RXEvidenceRequirement | undefined,

  symbol:
    string | undefined
): RXPreparedFinancialInvestigationRequest {
  const capability =
    getCapabilityDefinition(
      request.capability
    );

  const executionDecision =
    validateExecutionRequest(
      request,
      requirement,
      capability
    );

  if (
    executionDecision.status !==
    "READY"
  ) {
    return {
      status:
        "REJECTED",

      request,

      requirement:
        requirement ?? null,

      executionDecision,

      mcpRequest:
        null,

      bindingIssues:
        [],
    };
  }

  if (
    !capability ||
    capability.executionBoundary !==
      "SECTORS_MCP_ADAPTER" ||
    request.capability !==
      "COMPANY_FINANCIAL_REPORT"
  ) {
    return {
      status:
        "REJECTED",

      request,

      requirement:
        requirement ?? null,

      executionDecision,

      mcpRequest:
        null,

      bindingIssues: [
        "EXECUTION_BOUNDARY_NOT_SUPPORTED",
      ],
    };
  }

  const binding =
    bindFinancialReportMcpRequest(
      symbol ?? ""
    );

  if (
    binding.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      request,

      requirement:
        requirement ?? null,

      executionDecision,

      mcpRequest:
        null,

      bindingIssues: [
        ...binding.issues,
      ],
    };
  }

  if (!requirement) {
    return {
      status:
        "REJECTED",

      request,

      requirement:
        null,

      executionDecision,

      mcpRequest:
        null,

      bindingIssues: [],
    };
  }

  return {
    status:
      "READY",

    request,

    requirement,

    executionDecision,

    mcpRequest:
      binding.request,

    bindingIssues:
      [],
  };
}