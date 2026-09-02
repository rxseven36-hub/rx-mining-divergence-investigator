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

  leftObservationId:
    RXNormalizedObservation["id"];

  rightObservationId:
    RXNormalizedObservation["id"];

  metric:
    RXNormalizedObservation["metric"] | null;

  commodity:
    RXNormalizedObservation["commodity"] | null;

  leftCommoditySubtype:
    RXNormalizedObservation["commoditySubtype"];

  rightCommoditySubtype:
    RXNormalizedObservation["commoditySubtype"];

  leftUnit:
    RXNormalizedObservation["unit"];

  rightUnit:
    RXNormalizedObservation["unit"];

  leftPeriod:
    RXNormalizedObservation["period"];

  rightPeriod:
    RXNormalizedObservation["period"];

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
