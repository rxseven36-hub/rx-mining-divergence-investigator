import type {
  RXInvestigationCapability,
} from "./capability";
export type RXInvestigationQuestionKind =
  | "OPERATIONAL_CONTEXT"
  | "HISTORICAL_COMPARISON"
  | "COMMODITY_CONTEXT"
  | "MARKET_REACTION";

export type RXEvidenceRequirementKind =
  | "COMPANY_OPERATIONAL"
  | "HISTORICAL_PERFORMANCE"
  | "COMMODITY_PRICE"
  | "MARKET_TRANSACTION";

export type RXInvestigationDataSource =
  | "SECTORS";

export type RXInvestigationRequestStatus =
  | "PLANNED"
  | "COLLECTED"
  | "UNAVAILABLE";

export type RXInvestigationPlanStatus =
  | "PLANNED"
  | "COLLECTING"
  | "READY_FOR_SYNTHESIS"
  | "INCOMPLETE";

export type RXInvestigationStopCondition =
  | "REQUIRED_EVIDENCE_COLLECTED"
  | "REQUIRED_EVIDENCE_UNAVAILABLE"
  | "REQUEST_BUDGET_REACHED";

export interface RXInvestigationQuestion {
  questionId: string;

  kind: RXInvestigationQuestionKind;

  question: string;

  /**
   * Questions direct investigation.
   * They do not assert a cause.
   */
  causalClaim:
    "NONE";
}

export interface RXEvidenceRequirement {
  requirementId: string;

  questionId: string;

  kind: RXEvidenceRequirementKind;

  description: string;

  required: boolean;
}

export interface RXInvestigationDataRequest {
  requestId: string;

  requirementId: string;

  source: RXInvestigationDataSource;

  /**
   * Logical capability requested from the data layer.
   * This is intentionally NOT a raw URL.
   */
  capability: RXInvestigationCapability;

  purpose: string;

  status: RXInvestigationRequestStatus;
}

export interface RXInvestigationPlan {
  planId: string;

  caseId: string;

  status: RXInvestigationPlanStatus;

  questions: RXInvestigationQuestion[];

  evidenceRequirements:
    RXEvidenceRequirement[];

  dataRequests:
    RXInvestigationDataRequest[];

  stopConditions:
    RXInvestigationStopCondition[];

  /**
   * Planning may identify what needs investigation,
   * but it must not manufacture causal conclusions.
   */
  causalConclusion:
    "UNKNOWN";
}