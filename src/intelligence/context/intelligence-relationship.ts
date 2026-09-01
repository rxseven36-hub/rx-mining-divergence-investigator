import type {
  RXSectorsTypedOperationRequest,
} from "../../data/sectors/sectors-operation-request";

import type {
  RXIntelligenceSubject,
} from "./intelligence-context";

import type {
  RXTypedIntelligenceEvidence,
} from "./typed-intelligence-evidence";

export type RXIntelligenceRelationshipKind =
  | "DIRECT_COMPANY"
  | "COMMODITY_CONTEXT"
  | "MARKET_CONTEXT";

export type RXIntelligenceRelationshipIssue =
  | "EVIDENCE_OPERATION_MISMATCH"
  | "COMPANY_MISMATCH"
  | "COMMODITY_MISMATCH"
  | "MARKET_SYMBOL_MISMATCH";

export interface RXRelatedIntelligenceEvidence {
  status: "RELATED";

  relationship:
    RXIntelligenceRelationshipKind;

  subject:
    RXIntelligenceSubject;

  evidence:
    RXTypedIntelligenceEvidence;

  operation:
    RXSectorsTypedOperationRequest;

  issues: [];

  causalConclusion: "UNKNOWN";
}

export interface RXRejectedIntelligenceEvidenceRelationship {
  status: "REJECTED";

  relationship: null;

  subject:
    RXIntelligenceSubject;

  evidence: null;

  operation:
    RXSectorsTypedOperationRequest;

  issues:
    RXIntelligenceRelationshipIssue[];

  causalConclusion: "UNKNOWN";
}

export type RXIntelligenceEvidenceRelationship =
  | RXRelatedIntelligenceEvidence
  | RXRejectedIntelligenceEvidenceRelationship;