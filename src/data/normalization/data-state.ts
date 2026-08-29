export type RXDataState =
  | "AVAILABLE"
  | "NULL_VALUE"
  | "MISSING"
  | "SEMANTICS_UNKNOWN"
  | "UNIT_UNKNOWN"
  | "PERIOD_UNKNOWN";

export function classifyDataState(input: {
  fieldPresent: boolean;
  value: number | null | undefined;
  semanticsKnown: boolean;
  unitKnown: boolean;
  periodKnown: boolean;
}): RXDataState {
  if (!input.fieldPresent) {
    return "MISSING";
  }

  if (!input.semanticsKnown) {
    return "SEMANTICS_UNKNOWN";
  }

  if (!input.unitKnown) {
    return "UNIT_UNKNOWN";
  }

  if (!input.periodKnown) {
    return "PERIOD_UNKNOWN";
  }

  if (input.value === null || input.value === undefined) {
    return "NULL_VALUE";
  }

  return "AVAILABLE";
}