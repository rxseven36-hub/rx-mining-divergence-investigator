import type {
  RXCapabilityDefinition,
} from "./capability";

import type {
  RXInvestigationDataRequest,
  RXEvidenceRequirement,
} from "./investigation-plan";

import type {
  RXInvestigationExecutionDecision,
  RXInvestigationExecutionIssue,
} from "./execution";

export function validateExecutionRequest(
  request:
    RXInvestigationDataRequest,
  requirement:
    RXEvidenceRequirement | undefined,
  capability:
    RXCapabilityDefinition | undefined
): RXInvestigationExecutionDecision {
  const issues:
    RXInvestigationExecutionIssue[] = [];

  if (request.status !== "PLANNED") {
    issues.push(
      "REQUEST_NOT_PLANNED"
    );
  }

  if (request.source !== "SECTORS") {
    issues.push(
      "SOURCE_NOT_SUPPORTED"
    );
  }

  if (!capability) {
    issues.push(
      "CAPABILITY_NOT_REGISTERED"
    );
  } else {
    if (!capability.enabled) {
      issues.push(
        "CAPABILITY_DISABLED"
      );
    }

    if (
      !requirement ||
      requirement.requirementId !==
        request.requirementId ||
      capability.requirementKind !==
        requirement.kind
    ) {
      issues.push(
        "REQUIREMENT_MISMATCH"
      );
    }
  }

  return {
    requestId:
      request.requestId,

    requirementId:
      request.requirementId,

    capability:
      request.capability,

    status:
      issues.length === 0
        ? "READY"
        : "REJECTED",

    issues,

    causalConclusion:
      "UNKNOWN",
  };
}