import type {
  RXSectorsTypedOperationRequest,
} from "../data/sectors/sectors-operation-request";

import {
  bindInvestigationOperationRequest,
} from "./bind-operation-request";

import type {
  RXBindOperationRequestIssue,
  RXInvestigationOperationBindingContext,
} from "./bind-operation-request";

import {
  getCapabilityDefinition,
} from "./capability-registry";

import type {
  RXInvestigationExecutionDecision,
} from "./execution";

import type {
  RXEvidenceRequirement,
  RXEvidenceRequirementKind,
} from "./investigation-plan";

import type {
  RXPeerEvidenceRequirement,
  RXPeerEvidenceRequirementKind,
  RXPeerInvestigationDataRequest,
  RXPeerInvestigationPlan,
  RXPeerInvestigationTarget,
} from "./peer-investigation-plan";

import type {
  RXPeerInvestigationTargetContexts,
} from "./resolve-peer-investigation-target-contexts";

import {
  validateExecutionRequest,
} from "./validate-execution-request";

export type RXPreparePeerInvestigationTargetIssue =
  | "TARGET_REQUIREMENT_MISMATCH"
  | "FIRST_COMPANY_ID_MISMATCH"
  | "SECOND_COMPANY_ID_MISMATCH"
  | "SHARED_TARGET_COMPANY_ID_PRESENT";

export type RXPreparedPeerInvestigationRequest =
  | {
      status: "READY";

      request:
        RXPeerInvestigationDataRequest;

      executionDecision:
        RXInvestigationExecutionDecision;

      operation:
        RXSectorsTypedOperationRequest;

      targetIssues: [];

      bindingIssues: [];
    }
  | {
      status: "REJECTED";

      request:
        RXPeerInvestigationDataRequest;

      executionDecision:
        RXInvestigationExecutionDecision;

      operation: null;

      targetIssues:
        RXPreparePeerInvestigationTargetIssue[];

      bindingIssues:
        RXBindOperationRequestIssue[];
    };

export interface RXPreparedPeerInvestigationRequests {
  planId:
    string;

  caseId:
    string;

  requests:
    RXPreparedPeerInvestigationRequest[];

  readyCount:
    number;

  rejectedCount:
    number;

  /**
   * Peer request preparation performs deterministic
   * validation, target selection, and operation binding.
   *
   * It does NOT:
   * - execute Sectors operations,
   * - collect evidence,
   * - call an LLM,
   * - infer causal explanations.
   */
  causalConclusion:
    "UNKNOWN";
}

function mapPeerRequirementKind(
  kind:
    RXPeerEvidenceRequirementKind
): RXEvidenceRequirementKind {
  switch (kind) {
    case "FIRST_COMPANY_OPERATIONAL":
    case "SECOND_COMPANY_OPERATIONAL":
      return "COMPANY_OPERATIONAL";

    case "FIRST_COMPANY_HISTORICAL":
    case "SECOND_COMPANY_HISTORICAL":
      return "HISTORICAL_PERFORMANCE";

    case "SHARED_COMMODITY_PRICE":
      return "COMMODITY_PRICE";

    case "FIRST_COMPANY_MARKET":
    case "SECOND_COMPANY_MARKET":
      return "MARKET_TRANSACTION";
  }
}

function expectedTargetForRequirement(
  kind:
    RXPeerEvidenceRequirementKind
): RXPeerInvestigationTarget {
  switch (kind) {
    case "FIRST_COMPANY_OPERATIONAL":
    case "FIRST_COMPANY_HISTORICAL":
    case "FIRST_COMPANY_MARKET":
      return "FIRST_COMPANY";

    case "SECOND_COMPANY_OPERATIONAL":
    case "SECOND_COMPANY_HISTORICAL":
    case "SECOND_COMPANY_MARKET":
      return "SECOND_COMPANY";

    case "SHARED_COMMODITY_PRICE":
      return "SHARED";
  }
}

function projectRequirement(
  requirement:
    RXPeerEvidenceRequirement | undefined
): RXEvidenceRequirement | undefined {
  if (!requirement) {
    return undefined;
  }

  return {
    requirementId:
      requirement.requirementId,

    questionId:
      requirement.questionId,

    kind:
      mapPeerRequirementKind(
        requirement.kind
      ),

    description:
      requirement.description,

    required:
      requirement.required,
  };
}

type RXPeerTargetContextSelectionResult =
  | {
      status: "RESOLVED";

      context:
        RXInvestigationOperationBindingContext;

      issues: [];
    }
  | {
      status: "REJECTED";

      context: null;

      issues:
        RXPreparePeerInvestigationTargetIssue[];
    };

function selectTargetContext(
  request:
    RXPeerInvestigationDataRequest,
  requirement:
    RXPeerEvidenceRequirement,
  contexts:
    RXPeerInvestigationTargetContexts
): RXPeerTargetContextSelectionResult {
  const issues:
    RXPreparePeerInvestigationTargetIssue[] =
      [];

  const expectedTarget =
    expectedTargetForRequirement(
      requirement.kind
    );

  if (
    request.target !==
    expectedTarget
  ) {
    issues.push(
      "TARGET_REQUIREMENT_MISMATCH"
    );
  }

  switch (request.target) {
    case "FIRST_COMPANY":
      if (
        request.targetCompanyId !==
        contexts.firstCompany.companyId
      ) {
        issues.push(
          "FIRST_COMPANY_ID_MISMATCH"
        );
      }

      if (issues.length > 0) {
        return {
          status: "REJECTED",
          context: null,
          issues,
        };
      }

      return {
        status: "RESOLVED",
        context:
          contexts.firstCompany,
        issues: [],
      };

    case "SECOND_COMPANY":
      if (
        request.targetCompanyId !==
        contexts.secondCompany.companyId
      ) {
        issues.push(
          "SECOND_COMPANY_ID_MISMATCH"
        );
      }

      if (issues.length > 0) {
        return {
          status: "REJECTED",
          context: null,
          issues,
        };
      }

      return {
        status: "RESOLVED",
        context:
          contexts.secondCompany,
        issues: [],
      };

    case "SHARED":
      if (
        request.targetCompanyId !==
        null
      ) {
        issues.push(
          "SHARED_TARGET_COMPANY_ID_PRESENT"
        );
      }

      if (issues.length > 0) {
        return {
          status: "REJECTED",
          context: null,
          issues,
        };
      }

      return {
        status: "RESOLVED",
        context:
          contexts.shared,
        issues: [],
      };
  }
}

function preparePeerRequest(
  plan:
    RXPeerInvestigationPlan,
  request:
    RXPeerInvestigationDataRequest,
  contexts:
    RXPeerInvestigationTargetContexts
): RXPreparedPeerInvestigationRequest {
  const peerRequirement =
    plan.evidenceRequirements.find(
      (candidate) =>
        candidate.requirementId ===
        request.requirementId
    );

  const projectedRequirement =
    projectRequirement(
      peerRequirement
    );

  const capability =
    getCapabilityDefinition(
      request.capability
    );

  const executionDecision =
    validateExecutionRequest(
      request,
      projectedRequirement,
      capability
    );

  /**
   * Execution validation remains the first hard gate.
   * A request rejected here must never be target-bound.
   */
  if (
    executionDecision.status !==
    "READY"
  ) {
    return {
      status: "REJECTED",

      request,

      executionDecision,

      operation: null,

      targetIssues: [],

      bindingIssues: [],
    };
  }

  /**
   * READY execution validation implies that a matching
   * requirement was found. Keep a deterministic local
   * guard rather than asserting or casting.
   */
  if (!peerRequirement) {
    return {
      status: "REJECTED",

      request,

      executionDecision,

      operation: null,

      targetIssues: [
        "TARGET_REQUIREMENT_MISMATCH",
      ],

      bindingIssues: [],
    };
  }

  const targetSelection =
    selectTargetContext(
      request,
      peerRequirement,
      contexts
    );

  if (
    targetSelection.status ===
    "REJECTED"
  ) {
    return {
      status: "REJECTED",

      request,

      executionDecision,

      operation: null,

      targetIssues: [
        ...targetSelection.issues,
      ],

      bindingIssues: [],
    };
  }

  const binding =
    bindInvestigationOperationRequest(
      request.capability,
      request.purpose,
      targetSelection.context
    );

  if (
    binding.status ===
    "REJECTED"
  ) {
    return {
      status: "REJECTED",

      request,

      executionDecision,

      operation: null,

      targetIssues: [],

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

    targetIssues: [],

    bindingIssues: [],
  };
}

/**
 * Prepares all deterministic peer investigation
 * requests against already-resolved canonical target
 * contexts.
 *
 * Target semantics come from request.target and the
 * linked peer evidence requirement. Capabilities do not
 * silently choose which peer company should be used.
 *
 * No API call and no LLM call occurs here.
 */
export function preparePeerInvestigationRequests(
  plan:
    RXPeerInvestigationPlan,
  contexts:
    RXPeerInvestigationTargetContexts
): RXPreparedPeerInvestigationRequests {
  const requests =
    plan.dataRequests.map(
      (request) =>
        preparePeerRequest(
          plan,
          request,
          contexts
        )
    );

  const readyCount =
    requests.filter(
      (request) =>
        request.status ===
        "READY"
    ).length;

  const rejectedCount =
    requests.length -
    readyCount;

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