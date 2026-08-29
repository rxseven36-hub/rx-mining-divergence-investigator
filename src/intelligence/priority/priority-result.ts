import type {
  RXDetectorResult,
} from "../detectors/detector-result";

export type RXPriorityStatus =
  | "SCORABLE"
  | "UNSCORABLE";

export type RXPriorityUnscorableReason =
  | "DETECTOR_NOT_DETECTED"
  | "CALCULATION_MISSING"
  | "RATIO_UNDEFINED"
  | "RATIO_INVALID";

export interface RXPriorityResult {
  detector:
    RXDetectorResult["detector"];

  detectorStatus:
    RXDetectorResult["status"];

  companyId: string;

  commodity: string;

  commoditySubtype?: string;

  periodLabel: string;

  sourceObservationIds: string[];

  status: RXPriorityStatus;

  /**
   * 0 <= score < 100.
   *
   * V1 score measures divergence magnitude only.
   * It is NOT a claim of absolute business materiality.
   */
  score: number | null;

  /**
   * Source ratio used by the deterministic
   * scoring formula.
   */
  divergenceRatio: number | null;

  rank?: number;

  unscorableReasons:
    RXPriorityUnscorableReason[];

  /**
   * Priority scoring does not establish causality.
   */
  causalExplanation:
    "UNKNOWN";
}