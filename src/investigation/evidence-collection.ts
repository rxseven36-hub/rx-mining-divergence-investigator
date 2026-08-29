import type {
  RXInvestigationCapability,
} from "./capability";

export type RXEvidenceCollectionStatus =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "INVALID"
  | "NOT_COMPARABLE";

export type RXEvidenceCollectionIssue =
  | "NO_DATA"
  | "INVALID_RESPONSE"
  | "SEMANTICS_UNKNOWN"
  | "UNIT_NOT_COMPARABLE"
  | "TIME_NOT_ALIGNED"
  | "RELATIONSHIP_INVALID";

export interface RXCollectedEvidenceItem {
  evidenceId: string;

  source: "SECTORS";

  /**
   * Reference to normalized/source evidence.
   * Collection contract itself does not reinterpret it.
   */
  sourceReference: string;

  truthClass:
    "SOURCE_FACT"
    | "COMPUTED_FACT";

  description: string;
}

export interface RXEvidenceCollectionResult {
  requestId: string;

  requirementId: string;

  capability:
    RXInvestigationCapability;

  status:
    RXEvidenceCollectionStatus;

  evidence:
    RXCollectedEvidenceItem[];

  issues:
    RXEvidenceCollectionIssue[];

  /**
   * Collection reports evidence state only.
   * It never manufactures causal conclusions.
   */
  causalConclusion:
    "UNKNOWN";
}