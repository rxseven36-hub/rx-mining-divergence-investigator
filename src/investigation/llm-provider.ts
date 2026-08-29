export interface LLMProvider {
  investigate(input: unknown): Promise<unknown>;
  challengeHypothesis(input: unknown): Promise<unknown>;
  synthesizeBrief(input: unknown): Promise<unknown>;
}
