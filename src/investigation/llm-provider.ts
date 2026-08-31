import type {
  RXAIInvestigatorInput,
} from "./ai-investigator";

/**
 * Boundary to an external LLM provider.
 *
 * IMPORTANT:
 * Provider output is untrusted runtime data.
 * A provider implementation must never be assumed
 * to return a valid RX domain object merely because
 * TypeScript describes the calling code.
 *
 * The investigation orchestrator is responsible for
 * validating provider output before it may enter the
 * trusted RX investigation domain.
 */
export interface LLMProvider {
  investigate(
    input:
      RXAIInvestigatorInput
  ): Promise<unknown>;

  /**
   * These seams remain intentionally untyped.
   * Their contracts belong to later investigation stages.
   */
  challengeHypothesis(
    input: unknown
  ): Promise<unknown>;

  synthesizeBrief(
    input: unknown
  ): Promise<unknown>;
}
