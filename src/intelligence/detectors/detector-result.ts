export type RXDetectorStatus =
  | "DETECTED"
  | "NO_DIVERGENCE"
  | "SKIPPED";

export type RXDivergenceDirection =
  | "SALES_ABOVE_PRODUCTION"
  | "PRODUCTION_ABOVE_SALES"
  | "BALANCED";

export type RXDetectorSkipReason =
  | "WRONG_METRIC_PAIR"
  | "DATA_MISSING"
  | "SEMANTICS_UNKNOWN"
  | "UNIT_NOT_COMPARABLE"
  | "TIME_NOT_ALIGNED"
  | "RELATIONSHIP_INVALID";

export interface RXProductionSalesCalculation {
  production: number;
  sales: number;

  /**
   * sales - production
   *
   * Positive:
   * sales > production
   *
   * Negative:
   * production > sales
   */
  signedDifference: number;

  absoluteDifference: number;

  /**
   * abs(sales - production) / abs(production)
   *
   * null when production is zero because RX refuses
   * to invent a percentage from a zero denominator.
   */
  differenceRatioOfProduction: number | null;

  direction: RXDivergenceDirection;
}

export interface RXDetectorResult {
  detector:
    "PRODUCTION_VS_SALES";

  status: RXDetectorStatus;

  companyId: string;

  commodity: string;

  commoditySubtype?: string;

  periodLabel: string;

  sourceObservationIds: string[];

  calculation?: RXProductionSalesCalculation;

  skipReasons: RXDetectorSkipReason[];

  /**
   * Detector establishes mathematical divergence only.
   *
   * It does NOT establish cause or materiality.
   */
  causalExplanation:
    "UNKNOWN";
}