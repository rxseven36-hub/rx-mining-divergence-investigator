import type {
  RXAIInvestigatorInput,
} from "./ai-investigator";

import type {
  RXEvidenceBoundedHypothesisProviderInput,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis-provider-input";

import type {
  RXEvidenceBoundedHypothesisChallengeProviderInput,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis-challenge-provider-input";

import type {
  RXEvidenceBoundedIntelligenceBriefProviderInput,
} from "../intelligence/synthesis/evidence-bounded-intelligence-brief-provider-input";

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
   * Adversarially challenges an already validated
   * hypothesis using the exact AI-safe evidence pack
   * supplied by RX.
   *
   * The result remains untrusted runtime data.
   * Structural and deterministic validation belong
   * to the evidence-bounded challenge boundary.
   */
  challengeHypothesis(
    input:
      RXEvidenceBoundedHypothesisChallengeProviderInput
  ): Promise<unknown>;

  /**
   * Synthesizes an intelligence brief from the exact
   * AI-safe evidence pack and already validated reasoning chain.
   *
   * The result remains untrusted runtime data.
   * Structural and deterministic validation belong
   * to the evidence-bounded intelligence-brief boundary.
   */
  synthesizeBrief(
    input:
      RXEvidenceBoundedIntelligenceBriefProviderInput
  ): Promise<unknown>;
}
