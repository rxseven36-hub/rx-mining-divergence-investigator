import type {
  RXInvestigationCapability,
} from "./capability";

export type RXInvestigationExecutionStatus =
  | "READY"
  | "REJECTED";

export type RXInvestigationExecutionIssue =
  | "REQUEST_NOT_PLANNED"
  | "SOURCE_NOT_SUPPORTED"
  | "CAPABILITY_NOT_REGISTERED"
  | "CAPABILITY_DISABLED"
  | "REQUIREMENT_MISMATCH";

export interface RXInvestigationExecutionRequest {
  requestId: string;

  requirementId: string;

  source: "SECTORS";

  capability:
    RXInvestigationCapability;

  purpose: string;

  status: "PLANNED";
}

export interface RXInvestigationExecutionDecision {
  requestId: string;

  requirementId: string;

  capability:
    RXInvestigationCapability;

  status:
    RXInvestigationExecutionStatus;

  issues:
    RXInvestigationExecutionIssue[];

  /**
   * Execution validation decides only whether
   * a planned request may proceed.
   *
   * It does not collect evidence and does not
   * manufacture causal conclusions.
   */
  causalConclusion:
    "UNKNOWN";
}