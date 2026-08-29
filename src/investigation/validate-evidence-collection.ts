import {
  getCapabilityDefinition,
} from "./capability-registry";

import type {
  RXEvidenceCollectionIssue,
  RXEvidenceCollectionResult,
} from "./evidence-collection";

export type RXEvidenceCollectionValidationIssue =
  | "UNKNOWN_CAPABILITY"
  | "AVAILABLE_WITHOUT_EVIDENCE"
  | "AVAILABLE_WITH_ISSUES"
  | "NON_AVAILABLE_WITH_EVIDENCE"
  | "NON_AVAILABLE_WITHOUT_ISSUE"
  | "ISSUE_NOT_ALLOWED_FOR_STATUS"
  | "DUPLICATE_EVIDENCE_ID";

export interface RXEvidenceCollectionValidation {
  valid: boolean;

  issues:
    RXEvidenceCollectionValidationIssue[];
}

function hasDuplicateEvidenceIds(
  result:
    RXEvidenceCollectionResult
): boolean {
  const ids =
    result.evidence.map(
      (item) => item.evidenceId
    );

  return (
    new Set(ids).size !==
    ids.length
  );
}

function allowedIssuesForStatus(
  status:
    RXEvidenceCollectionResult["status"]
): readonly RXEvidenceCollectionIssue[] {
  switch (status) {
    case "AVAILABLE":
      return [];

    case "UNAVAILABLE":
      return [
        "NO_DATA",
      ];

    case "INVALID":
      return [
        "INVALID_RESPONSE",
      ];

    case "NOT_COMPARABLE":
      return [
        "SEMANTICS_UNKNOWN",
        "UNIT_NOT_COMPARABLE",
        "TIME_NOT_ALIGNED",
        "RELATIONSHIP_INVALID",
      ];
  }
}

export function validateEvidenceCollection(
  result:
    RXEvidenceCollectionResult
): RXEvidenceCollectionValidation {
  const issues:
    RXEvidenceCollectionValidationIssue[] =
      [];

  if (
    !getCapabilityDefinition(
      result.capability
    )
  ) {
    issues.push(
      "UNKNOWN_CAPABILITY"
    );
  }

  if (
    result.status === "AVAILABLE"
  ) {
    if (
      result.evidence.length === 0
    ) {
      issues.push(
        "AVAILABLE_WITHOUT_EVIDENCE"
      );
    }

    if (
      result.issues.length > 0
    ) {
      issues.push(
        "AVAILABLE_WITH_ISSUES"
      );
    }
  } else {
    if (
      result.evidence.length > 0
    ) {
      issues.push(
        "NON_AVAILABLE_WITH_EVIDENCE"
      );
    }

    if (
      result.issues.length === 0
    ) {
      issues.push(
        "NON_AVAILABLE_WITHOUT_ISSUE"
      );
    }
  }

  const allowed =
    new Set(
      allowedIssuesForStatus(
        result.status
      )
    );

  if (
    result.issues.some(
      (issue) =>
        !allowed.has(issue)
    )
  ) {
    issues.push(
      "ISSUE_NOT_ALLOWED_FOR_STATUS"
    );
  }

  if (
    hasDuplicateEvidenceIds(
      result
    )
  ) {
    issues.push(
      "DUPLICATE_EVIDENCE_ID"
    );
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}