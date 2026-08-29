export interface ComparabilityResult {
  eligible: boolean;
  reasons: string[];
}

export interface ComparabilityInput {
  dataExists: boolean;
  semanticsKnown: boolean;
  unitsComparable: boolean;
  timeAligned: boolean;
  relationshipValid: boolean;
}

export function evaluateComparability(
  input: ComparabilityInput
): ComparabilityResult {
  const reasons: string[] = [];

  if (!input.dataExists) reasons.push("DATA_MISSING");
  if (!input.semanticsKnown) reasons.push("SEMANTICS_UNKNOWN");
  if (!input.unitsComparable) reasons.push("UNIT_NOT_COMPARABLE");
  if (!input.timeAligned) reasons.push("TIME_NOT_ALIGNED");
  if (!input.relationshipValid) reasons.push("RELATIONSHIP_INVALID");

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
