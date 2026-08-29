export type RXPeriodKind =
  | "DATE"
  | "MONTH"
  | "QUARTER"
  | "YEAR"
  | "RANGE"
  | "UNKNOWN";

export interface RXTimePeriod {
  kind: RXPeriodKind;

  start?: string;
  end?: string;

  year?: number;
  quarter?: number;
  month?: number;

  /**
   * Some mining observations describe a reporting period while
   * resources/reserves may have a separate measurement year.
   */
  measurementYear?: number;

  rawLabel?: string;
}