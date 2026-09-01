export type RXPeerObservationComparabilityIssue =
  | "PEER_NOT_ELIGIBLE"
  | "PEER_PAIR_MISMATCH"
  | "SAME_COMPANY"
  | "METRIC_NOT_ALIGNED"
  | "COMMODITY_NOT_ALIGNED"
  | "COMMODITY_NOT_IN_PEER_BASIS"
  | "COMMODITY_SUBTYPE_NOT_ALIGNED"
  | "DATA_MISSING"
  | "SEMANTICS_UNKNOWN"
  | "UNIT_NOT_COMPARABLE"
  | "TIME_NOT_ALIGNED";

export interface RXPeerObservationComparabilityResult {
  eligible:
    boolean;

  issues:
    RXPeerObservationComparabilityIssue[];

  causalConclusion:
    "UNKNOWN";
}