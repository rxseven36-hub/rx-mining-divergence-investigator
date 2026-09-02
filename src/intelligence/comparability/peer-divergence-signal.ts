import type {
  RXNormalizedObservation,
} from "../../data/normalization/normalized-observation";

import type {
  RXPeerObservationComparabilityResult,
} from "./peer-observation-comparability";

export type RXPeerDivergenceSignalStatus =
  | "COMPARABLE"
  | "NOT_COMPARABLE";

export interface RXPeerDivergenceSignal {
  status:
    RXPeerDivergenceSignalStatus;

  leftCompanyId:
    string;

  rightCompanyId:
    string;

  metric:
    RXNormalizedObservation["metric"] | null;

  commodity:
    RXNormalizedObservation["commodity"] | null;

  leftValue:
    number | null;

  rightValue:
    number | null;

  absoluteDifference:
    number | null;

  relativeDifference:
    number | null;

  comparability:
    RXPeerObservationComparabilityResult;

  causalConclusion:
    "UNKNOWN";
}
