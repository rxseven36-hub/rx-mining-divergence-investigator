export type RXMetricKind =
  | "PRODUCTION"
  | "SALES"
  | "RESOURCE"
  | "RESERVE"
  | "PRICE"
  | "VOLUME"
  | "MARKET_CAP"
  | "REVENUE"
  | "NET_PROFIT"
  | "OTHER";

export interface RXUnit {
  /**
   * Canonical representation only when semantics are known.
   *
   * Examples:
   * Mt
   * wmt
   * dmt
   * TNi
   * koz
   * kton
   * USD
   */
  symbol: string;

  dimension:
    | "MASS"
    | "CONTAINED_METAL"
    | "CURRENCY"
    | "PRICE"
    | "VOLUME"
    | "RATIO"
    | "UNKNOWN";

  raw?: string;
}