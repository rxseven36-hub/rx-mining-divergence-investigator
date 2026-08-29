import type {
  RXInvestigationDataRequest,
} from "./investigation-plan";

import type {
  RXCollectedEvidenceItem,
  RXEvidenceCollectionIssue,
  RXEvidenceCollectionResult,
  RXEvidenceCollectionStatus,
} from "./evidence-collection";

export interface RXEvidenceCollectionInput {
  request:
    RXInvestigationDataRequest;

  status:
    RXEvidenceCollectionStatus;

  evidence?:
    RXCollectedEvidenceItem[];

  issues?:
    RXEvidenceCollectionIssue[];
}

export function createEvidenceCollectionResult(
  input:
    RXEvidenceCollectionInput
): RXEvidenceCollectionResult {
  const evidence = [
    ...(input.evidence ?? []),
  ];

  const issues = [
    ...(input.issues ?? []),
  ];

  return {
    requestId:
      input.request.requestId,

    requirementId:
      input.request.requirementId,

    capability:
      input.request.capability,

    status:
      input.status,

    evidence,

    issues,

    causalConclusion:
      "UNKNOWN",
  };
}