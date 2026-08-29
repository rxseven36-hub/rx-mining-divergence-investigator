export type RXSemanticState =
  | "KNOWN"
  | "UNKNOWN";

export interface RXSemanticKnowledge {
  state: RXSemanticState;

  /**
   * Human-readable description only.
   * Presence of this string NEVER proves semantics are known.
   */
  description?: string;

  /**
   * Explicit reason why RX considers the metric semantics known.
   * Required when state === KNOWN.
   */
  basis?: string;
}

export function isSemanticKnowledgeKnown(
  semantic:
    RXSemanticKnowledge
): boolean {
  return (
    semantic.state === "KNOWN" &&
    typeof semantic.basis === "string" &&
    semantic.basis.trim().length > 0
  );
}