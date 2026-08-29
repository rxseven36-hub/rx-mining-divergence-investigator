import type { RXCommodity } from "@/types/commodity";
import type { RXMetricKind, RXUnit } from "@/types/metrics";
import type { RXTimePeriod } from "@/types/time";
import type { RXSourceEvidence } from "@/truth/evidence";
import type { RXSemanticKnowledge } from "./semantic-state";

export interface RXNormalizedObservation {
  id: string;

  companyId: string;

  commodity: RXCommodity;

  /**
   * Commodity subtype must remain explicit.
   *
   * Examples:
   * Metallurgical Coal
   * Sub-bituminous Coal
   * Ferronickel
   * Limonite Ore
   * Saprolite Ore
   */
  commoditySubtype?: string;

  metric: RXMetricKind;

  /**
   * null means Sectors explicitly returned no value or the
   * normalization layer could not establish a numeric value.
   *
   * null MUST NOT be converted to zero.
   */
  value: number | null;

  unit: RXUnit;

  period: RXTimePeriod;

  evidence: RXSourceEvidence[];

  /**
   * Original source field can be retained for auditability.
   */
  sourceField?: string;

  /**
   * Human-readable description only.
   *
   * Presence of this field MUST NEVER be interpreted as proof
   * that the observation semantics are known.
   */
  semanticDescription?: string;

  /**
   * Explicit semantic knowledge used by eligibility and
   * comparability decisions.
   */
  semantic: RXSemanticKnowledge;
}