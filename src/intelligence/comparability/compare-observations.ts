import type { RXNormalizedObservation } from "@/data/normalization/normalized-observation";

import { isSemanticKnowledgeKnown } from "../../data/normalization/semantic-state";

import {
  evaluateComparability,
  type ComparabilityResult,
} from "./evaluate-comparability";

function samePeriod(
  left: RXNormalizedObservation,
  right: RXNormalizedObservation
): boolean {
  return (
    left.period.kind === right.period.kind &&
    left.period.start === right.period.start &&
    left.period.end === right.period.end &&
    left.period.year === right.period.year &&
    left.period.quarter === right.period.quarter &&
    left.period.month === right.period.month &&
    left.period.measurementYear === right.period.measurementYear
  );
}

export function compareObservations(
  left: RXNormalizedObservation,
  right: RXNormalizedObservation
): ComparabilityResult {
  const dataExists =
    left.value !== null &&
    right.value !== null;

  /**
   * semanticDescription is intentionally ignored here.
   *
   * Descriptive text is not evidence that RX understands
   * the business semantics of a source field.
   */
  const semanticsKnown =
    isSemanticKnowledgeKnown(left.semantic) &&
    isSemanticKnowledgeKnown(right.semantic);

  const unitsComparable =
    left.unit.dimension !== "UNKNOWN" &&
    right.unit.dimension !== "UNKNOWN" &&
    left.unit.dimension === right.unit.dimension &&
    left.unit.symbol === right.unit.symbol;

  const timeAligned = samePeriod(left, right);

  const relationshipValid =
    left.companyId === right.companyId &&
    left.commodity === right.commodity &&
    left.commoditySubtype === right.commoditySubtype;

  return evaluateComparability({
    dataExists,
    semanticsKnown,
    unitsComparable,
    timeAligned,
    relationshipValid,
  });
}