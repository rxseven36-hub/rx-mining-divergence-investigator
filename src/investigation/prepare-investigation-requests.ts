import type {
  RXSectorsTypedOperationRequest,
} from "../data/sectors/sectors-operation-request";

import {
  bindInvestigationOperationRequest,
} from "./bind-operation-request";

import type {
  RXBindOperationRequestIssue,
  RXInvestigationOperationContext,
} from "./bind-operation-request";

import {
  getCapabilityDefinition,
} from "./capability-registry";

import type {
  RXInvestigationExecutionDecision,
} from "./execution";

import type {
  RXInvestigationDataRequest,
  RXInvestigationPlan,
} from "./investigation-plan";

import {
  validateExecutionRequest,
} from "./validate-execution-request";

export type RXPreparedInvestigationRequest =
  | {
      status: "READY";

      request:
        RXInvestigationDataRequest;

      executionDecision:
        RXInvestigationExecutionDecision;

      operation:
        RXSectorsTypedOperationRequest;

      bindingIssues: [];
    }
  | {
      status: "REJECTED";

      request:
        RXInvestigationDataRequest;

      executionDecision:
        RXInvestigationExecutionDecision;

      operation: null;

      bindingIssues:
        RXBindOperationRequestIssue[];
    };

export interface RXPreparedInvestigationRequests {
  planId: string;

  caseId: string;

  requests:
    RXPreparedInvestigationRequest[];

  readyCount: number;

  rejectedCount: number;

  /**
   * Preparation validates and binds requests only.
   *
   * It does NOT:
   * - execute Sectors requests,
   * - collect evidence,
   * - call an LLM,
   * - infer causal explanations.
   */
  causalConclusion:
    "UNKNOWN";
}

function prepareRequest(
  plan:
    RXInvestigationPlan,
  request:
    RXInvestigationDataRequest,
  context:
    RXInvestigationOperationContext
): RXPreparedInvestigationRequest {
  const requirement =
    plan.evidenceRequirements.find(
      (candidate) =>
        candidate.requirementId ===
        request.requirementId
    );

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
      status: "REJECTED",

      request,

      executionDecision,

      operation: null,

      bindingIssues: [],
    };
  }
  /**
   * This preparer binds REST-backed capabilities only.
   *
   * MCP-backed capabilities require their own preparation
   * and execution boundary and must never reach the REST
   * operation binder.
   */
  if (
    !capability ||
    capability.executionBoundary !==
      "SECTORS_ADAPTER"
  ) {
    return {
      status:
        "REJECTED",

      request,

      executionDecision,

      operation:
        null,

      bindingIssues: [
        "EXECUTION_BOUNDARY_NOT_SUPPORTED",
      ],
    };
  }

  const restCapability =
    request.capability;

  if (
    restCapability ===
      "COMPANY_FINANCIAL_REPORT"
  ) {
    return {
      status:
        "REJECTED",

      request,

      executionDecision,

      operation:
        null,

      bindingIssues: [
        "EXECUTION_BOUNDARY_NOT_SUPPORTED",
      ],
    };
  }

  const binding =
    bindInvestigationOperationRequest(
      restCapability,
      request.purpose,
      context
    );

  if (binding.status === "REJECTED") {
    return {
      status: "REJECTED",

      request,

      executionDecision,

      operation: null,

      bindingIssues: [
        ...binding.issues,
      ],
    };
  }

  return {
    status: "READY",

    request,

    executionDecision,

    operation:
      binding.request,

    bindingIssues: [],
  };
}

export function prepareInvestigationRequests(
  plan:
    RXInvestigationPlan,
  context:
    RXInvestigationOperationContext
): RXPreparedInvestigationRequests {
  const requests =
    plan.dataRequests.map(
      (request) =>
        prepareRequest(
          plan,
          request,
          context
        )
    );

  const readyCount =
    requests.filter(
      (request) =>
        request.status === "READY"
    ).length;

  const rejectedCount =
    requests.length - readyCount;

  return {
    planId:
      plan.planId,

    caseId:
      plan.caseId,

    requests,

    readyCount,

    rejectedCount,

    causalConclusion:
      "UNKNOWN",
  };
}