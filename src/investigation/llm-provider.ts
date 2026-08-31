import type {
  RXAIInvestigatorDecision,
  RXAIInvestigatorInput,
} from "./ai-investigator";

export interface LLMProvider {
  investigate(
    input:
      RXAIInvestigatorInput
  ): Promise<
    RXAIInvestigatorDecision
  >;

  /**
   * These seams remain intentionally untyped in Sprint 012A.
   * Their contracts belong to later investigation stages.
   */
  challengeHypothesis(
    input: unknown
  ): Promise<unknown>;

  synthesizeBrief(
    input: unknown
  ): Promise<unknown>;
}
