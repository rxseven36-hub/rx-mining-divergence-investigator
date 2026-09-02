import type {
  RXPeerDivergenceSignal,
} from "../comparability/peer-divergence-signal";

export type RXPeerDivergencePriorityStatus =
  | "SCORABLE"
  | "UNSCORABLE";

export type RXPeerDivergencePriorityUnscorableReason =
  | "SIGNAL_NOT_COMPARABLE"
  | "RELATIVE_DIFFERENCE_UNDEFINED"
  | "RELATIVE_DIFFERENCE_INVALID"
  | "NO_DIVERGENCE";

export interface RXPeerDivergencePriorityResult {
  leftCompanyId:
    string;

  rightCompanyId:
    string;

  metric:
    RXPeerDivergenceSignal["metric"];

  commodity:
    RXPeerDivergenceSignal["commodity"];

  status:
    RXPeerDivergencePriorityStatus;

  score:
    number | null;

  divergenceMagnitude:
    number | null;

  unscorableReasons:
    RXPeerDivergencePriorityUnscorableReason[];

  causalConclusion:
    "UNKNOWN";
}
