import type {
  RXPeerObservationComparabilityIssue,
} from "./peer-observation-comparability";

export type RXPeerRelativePositionIssue =
  | "NO_VALID_PEERS";

export interface RXPeerRelativePositionRejectedPeer {
  observationId:
    string;

  companyId:
    string;

  comparabilityIssues:
    RXPeerObservationComparabilityIssue[];
}

export interface RXPeerRelativePositionResult {
  status:
    "POSITIONED" | "NOT_POSITIONED";

  targetObservationId:
    string;

  targetCompanyId:
    string;

  targetValue:
    number | null;

  peerCount:
    number;

  peerMean:
    number | null;

  peerMedian:
    number | null;

  differenceFromPeerMean:
    number | null;

  differenceFromPeerMedian:
    number | null;

  peersBelowTarget:
    number;

  peersEqualTarget:
    number;

  peersAboveTarget:
    number;

  includedPeerObservationIds:
    string[];

  rejectedPeers:
    RXPeerRelativePositionRejectedPeer[];

  issues:
    RXPeerRelativePositionIssue[];

  causalConclusion:
    "UNKNOWN";
}