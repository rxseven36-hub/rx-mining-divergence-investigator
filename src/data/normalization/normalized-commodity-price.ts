import type {
  RXCommodity,
} from "@/types/commodity";

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
 * Normalized commodity-market price observation.
 *
 * IMPORTANT:
 * Commodity price is a market fact associated with a
 * commodity and date.
 *
 * It is deliberately NOT modeled as RXNormalizedObservation
 * because RXNormalizedObservation requires companyId.
 *
 * Associating a market commodity price with a company at the
 * normalization layer would manufacture a relationship that
 * the Sectors commodity-price endpoint does not establish.
 */
export interface RXNormalizedCommodityPriceObservation {
  id: string;

  commodity:
    RXCommodity;

  metric:
    Extract<
      RXMetricKind,
      "PRICE"
    >;

  value:
    number;

  /**
   * Canonical semantic unit established by the official
   * Sectors Commodity Price endpoint contract.
   *
   * Source field:
   *   price_usd_per_ton
   *
   * Meaning:
   *   USD per metric ton.
   */
  unit:
    RXUnit;

  /**
   * Commodity price records are point-in-time dated market
   * observations.
   */
  period:
    RXTimePeriod;

  evidence:
    RXSourceEvidence[];

  sourceField:
    "price_usd_per_ton";

  semanticDescription:
    string;

  semantic:
    RXSemanticKnowledge;
}