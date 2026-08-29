export type RXInvestigationStatus =
  | "QUEUED"
  | "INVESTIGATING"
  | "COMPLETE";

export type RXInvestigationTruthState =
  | "UNINVESTIGATED"
  | "EVIDENCE_COLLECTING"
  | "EVIDENCE_READY";

export interface RXInvestigationTrigger {
  detector:
    "PRODUCTION_VS_SALES";

  priorityScore: number;

  divergenceRatio: number;

  rank: number;

  /**
   * Trigger is a deterministic reason for opening
   * an investigation case.
   *
   * It is NOT a causal explanation.
   */
  triggerType:
    "DETERMINISTIC_DIVERGENCE_PRIORITY";
}

export interface RXInvestigationCase {
  caseId: string;

  companyId: string;

  commodity: string;

  commoditySubtype?: string;

  periodLabel: string;

  detector:
    "PRODUCTION_VS_SALES";

  trigger: RXInvestigationTrigger;

  sourceObservationIds: string[];

  status: RXInvestigationStatus;

  truthState: RXInvestigationTruthState;

  /**
   * Investigation agent may populate these later.
   * Case creation itself must not invent unknowns.
   */
  unknowns: string[];

  /**
   * No causal statement is allowed during deterministic
   * case creation.
   */
  causalExplanation:
    "UNKNOWN";
}