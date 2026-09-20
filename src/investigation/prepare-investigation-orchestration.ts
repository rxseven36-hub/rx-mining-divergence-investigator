import type {
  RXInvestigationPlan,
} from "./investigation-plan";

import type {
  RXInvestigationOperationContext,
} from "./bind-operation-request";

import {
  getCapabilityDefinition,
} from "./capability-registry";

import {
  prepareInvestigationRequests,
} from "./prepare-investigation-requests";

import type {
  RXPreparedInvestigationRequests,
} from "./prepare-investigation-requests";

import {
  prepareFinancialInvestigationRequest,
} from "./prepare-financial-investigation-request";

import type {
  RXPreparedFinancialInvestigationRequest,
} from "./prepare-financial-investigation-request";

export interface RXPreparedInvestigationOrchestration {
  planId:
    string;

  caseId:
    string;

  rest:
    RXPreparedInvestigationRequests;

  mcp:
    RXPreparedFinancialInvestigationRequest[];

  restRequestCount:
    number;

  mcpRequestCount:
    number;

  rejectedMcpCount:
    number;

  causalConclusion:
    "UNKNOWN";
}

/**
 * Partitions logical investigation requests by their
 * registered execution boundary before any transport
 * binding occurs.
 *
 * REST-backed requests continue through the existing
 * REST preparer unchanged.
 *
 * Financial MCP requests use their dedicated preparer.
 *
 * No transport is executed here.
 */
export function prepareInvestigationOrchestration(
  plan:
    RXInvestigationPlan,

  context:
    RXInvestigationOperationContext
): RXPreparedInvestigationOrchestration {
  const restRequests =
    plan.dataRequests.filter(
      (request) =>
        getCapabilityDefinition(
          request.capability
        )?.executionBoundary ===
          "SECTORS_ADAPTER"
    );

  const mcpRequests =
    plan.dataRequests.filter(
      (request) =>
        getCapabilityDefinition(
          request.capability
        )?.executionBoundary ===
          "SECTORS_MCP_ADAPTER"
    );

  const restPlan:
    RXInvestigationPlan = {
    ...plan,

    dataRequests:
      restRequests,
  };

  const rest =
    prepareInvestigationRequests(
      restPlan,
      context
    );

  const mcp =
    mcpRequests.map(
      (request) => {
        const requirement =
          plan.evidenceRequirements.find(
            (candidate) =>
              candidate.requirementId ===
              request.requirementId
          );

        return prepareFinancialInvestigationRequest(
          request,
          requirement,
          context.ticker
        );
      }
    );

  return {
    planId:
      plan.planId,

    caseId:
      plan.caseId,

    rest,

    mcp,

    restRequestCount:
      rest.requests.length,

    mcpRequestCount:
      mcp.length,

    rejectedMcpCount:
      mcp.filter(
        (request) =>
          request.status ===
          "REJECTED"
      ).length,

    causalConclusion:
      "UNKNOWN",
  };
}