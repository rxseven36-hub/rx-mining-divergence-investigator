import type {
  RXInvestigationCapability,
} from "./capability";

import type {
  RXInvestigationPlanStatus,
  RXInvestigationStopCondition,
  RXInvestigationRequestStatus,
} from "./investigation-plan";

export type RXPeerInvestigationQuestionKind =
  | "BILATERAL_OPERATIONAL_CONTEXT"
  | "BILATERAL_HISTORICAL_CONTEXT"
  | "SHARED_COMMODITY_CONTEXT"
  | "BILATERAL_MARKET_CONTEXT";

export type RXPeerEvidenceRequirementKind =
  | "FIRST_COMPANY_OPERATIONAL"
  | "SECOND_COMPANY_OPERATIONAL"
  | "FIRST_COMPANY_HISTORICAL"
  | "SECOND_COMPANY_HISTORICAL"
  | "SHARED_COMMODITY_PRICE"
  | "FIRST_COMPANY_MARKET"
  | "SECOND_COMPANY_MARKET";

export type RXPeerInvestigationTarget =
  | "FIRST_COMPANY"
  | "SECOND_COMPANY"
  | "SHARED";

export interface RXPeerInvestigationQuestion {
  questionId:
    string;

  kind:
    RXPeerInvestigationQuestionKind;

  question:
    string;

  /**
   * Investigation questions direct evidence collection.
   * They do not assert why the peer difference exists.
   */
  causalClaim:
    "NONE";
}

export interface RXPeerEvidenceRequirement {
  requirementId:
    string;

  questionId:
    string;

  kind:
    RXPeerEvidenceRequirementKind;

  description:
    string;

  required:
    boolean;
}

export interface RXPeerInvestigationDataRequest {
  requestId:
    string;

  requirementId:
    string;

  source:
    "SECTORS";

  capability:
    RXInvestigationCapability;

  purpose:
    string;

  status:
    RXInvestigationRequestStatus;

  /**
   * Target semantics are explicit because a peer
   * investigation may require evidence from two companies
   * plus context shared by the comparison.
   *
   * This field does NOT bind or execute the request.
   */
  target:
    RXPeerInvestigationTarget;

  /**
   * Company-specific requests carry the canonical subject
   * company id. Shared requests deliberately carry null.
   */
  targetCompanyId:
    string | null;
}

export interface RXPeerInvestigationPlan {
  planId:
    string;

  caseId:
    string;

  status:
    RXInvestigationPlanStatus;

  questions:
    RXPeerInvestigationQuestion[];

  evidenceRequirements:
    RXPeerEvidenceRequirement[];

  dataRequests:
    RXPeerInvestigationDataRequest[];

  stopConditions:
    RXInvestigationStopCondition[];

  /**
   * Planning identifies what evidence should be examined.
   * It never manufactures a causal explanation.
   */
  causalConclusion:
    "UNKNOWN";
}