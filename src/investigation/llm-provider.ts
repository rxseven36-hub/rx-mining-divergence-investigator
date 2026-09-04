import type {
  RXAIInvestigatorInput,
} from "./ai-investigator";

import type {
  RXEvidenceBoundedHypothesisProviderInput,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis-provider-input";

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
   * Proposes an interpretation using only the
   * AI-safe evidence pack supplied by RX.
   *
   * The result remains untrusted runtime data.
   * Structural and deterministic validation belong
   * to the evidence-bounded hypothesis boundary.
   */
  proposeHypothesis(
    input:
      RXEvidenceBoundedHypothesisProviderInput
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
