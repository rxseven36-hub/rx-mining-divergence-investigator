import type {
  RXMetricKind,
  RXUnit,
} from "@/types/metrics";

import type {
  RXTimePeriod,
} from "@/types/time";

import type {
  RXSourceEvidence,
} from "@/truth/evidence";

import type {
  RXSemanticKnowledge,
} from "./semantic-state";

/**
 * Normalized company-security market observation.
 *
 * IMPORTANT:
 * Sectors Daily Transaction Data establishes:
 *
 * - an IDX symbol;
 * - a trading date;
 * - closing price;
 * - trading volume;
 * - market capitalization.
 *
 * It does NOT establish RX's internal companyId and it does
 * NOT establish a mining commodity relationship.
 *
 * Therefore this type deliberately does not reuse
 * RXNormalizedObservation, which requires both companyId
 * and commodity.
 *
 * Relationship between this source symbol and an RX company
 * belongs to a later evidence-admission boundary where the
 * requested investigation context can be validated.
 */
export interface RXNormalizedMarketTransactionObservation {
  id: string;

  /**
   * Symbol exactly as established by the Sectors
   * DailyDataItem transport record.
   *
   * Example:
   *   AADI.JK
   */
  symbol: string;

  metric:
    Extract<
      RXMetricKind,
      "PRICE" | "VOLUME" | "MARKET_CAP"
    >;

  value: number;

  unit: RXUnit;

  /**
   * Daily market records are point-in-time dated
   * observations.
   */
  period: RXTimePeriod;

  evidence: RXSourceEvidence[];

  sourceField:
    | "close"
    | "volume"
    | "market_cap";

  semanticDescription: string;

  semantic: RXSemanticKnowledge;
}