import type {
  RXPeerDivergencePriorityResult,
} from "../intelligence/priority/peer-divergence-priority";

import type {
  RXPeerDivergenceInvestigationSubject,
} from "./investigation-subject";

import type {
  RXInvestigationStatus,
  RXInvestigationTruthState,
} from "./investigation-case";

export interface RXPeerInvestigationTrigger {
  priorityScore:
    number;

  divergenceMagnitude:
    number;

  rank:
    number;

  /**
   * This trigger explains why the comparison entered
   * the investigation queue.
   *
   * It does NOT explain why the companies differ.
   */
  triggerType:
    "DETERMINISTIC_PEER_DIVERGENCE_PRIORITY";
}

export interface RXPeerInvestigationCase {
  caseId:
    string;

  subject:
    RXPeerDivergenceInvestigationSubject;

  comparisonIdentityKey:
    string;

  metric:
    RXPeerDivergencePriorityResult["metric"];

  commodity:
    RXPeerDivergencePriorityResult["commodity"];

  leftCommoditySubtype:
    RXPeerDivergencePriorityResult["leftCommoditySubtype"];

  rightCommoditySubtype:
    RXPeerDivergencePriorityResult["rightCommoditySubtype"];

  leftUnit:
    RXPeerDivergencePriorityResult["leftUnit"];

  rightUnit:
    RXPeerDivergencePriorityResult["rightUnit"];

  leftPeriod:
    RXPeerDivergencePriorityResult["leftPeriod"];

  rightPeriod:
    RXPeerDivergencePriorityResult["rightPeriod"];

  leftObservationId:
    RXPeerDivergencePriorityResult["leftObservationId"];

  rightObservationId:
    RXPeerDivergencePriorityResult["rightObservationId"];

  trigger:
    RXPeerInvestigationTrigger;

  status:
    RXInvestigationStatus;

  truthState:
    RXInvestigationTruthState;

  /**
   * Later investigation stages may populate unknowns.
   * Case creation itself must not invent them.
   */
  unknowns:
    string[];

  /**
   * Deterministic case creation is never allowed
   * to infer a causal explanation.
   */
  causalExplanation:
    "UNKNOWN";
}