import type {
  RXMetricKind,
} from "../../types/metrics";

import type {
  RXSemanticKnowledge,
} from "./semantic-state";

export interface RXSemanticEligibilityInput {
  metric:
    RXMetricKind;

  sourceField: string;

  semantic:
    RXSemanticKnowledge;
}

export interface RXSemanticEligibilityResult {
  eligible: boolean;

  reason:
    | "EXPLICITLY_KNOWN"
    | "SEMANTICS_UNKNOWN"
    | "KNOWN_BASIS_MISSING";
}

export function evaluateSemanticEligibility(
  input:
    RXSemanticEligibilityInput
): RXSemanticEligibilityResult {
  if (
    input.semantic.state ===
    "UNKNOWN"
  ) {
    return {
      eligible: false,
      reason:
        "SEMANTICS_UNKNOWN",
    };
  }

  if (
    typeof input.semantic.basis !==
      "string" ||
    input.semantic.basis.trim()
      .length === 0
  ) {
    return {
      eligible: false,
      reason:
        "KNOWN_BASIS_MISSING",
    };
  }

  return {
    eligible: true,
    reason:
      "EXPLICITLY_KNOWN",
  };
}