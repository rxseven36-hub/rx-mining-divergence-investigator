/**
 * Canonical reference from an intelligence brief back to evidence
 * that has already entered the evidence-bounded reasoning chain.
 *
 * The pair remains explicit so later deterministic validation can
 * verify both evidence identity and request lineage.
 *
 * Presence in a brief does not turn reasoning into deterministic
 * fact and does not establish causality.
 */
export interface RXIntelligenceBriefEvidenceReference {
  evidenceId:
    string;

  requestId:
    string;
}

/**
 * Evidence-bounded synthesis of an already validated hypothesis
 * and its already validated adversarial challenge.
 *
 * This contract is a presentation and synthesis artifact.
 * It does not replace the hypothesis, replace the challenge,
 * redefine canonical evidence, or establish causal truth.
 *
 * Later deterministic validation must prove that identities and
 * evidence references remain bound to the exact trusted reasoning
 * chain supplied to the synthesis boundary.
 */
export interface RXEvidenceBoundedIntelligenceBrief {
  caseId:
    string;

  planId:
    string;

  briefId:
    string;

  /**
   * Identity of the validated hypothesis being summarized.
   */
  hypothesisId:
    string;

  /**
   * Identity of the validated adversarial challenge being
   * incorporated into the synthesis.
   */
  challengeId:
    string;

  /**
   * Concise synthesis of the evidence-bounded reasoning state.
   *
   * This is narrative reasoning, not deterministic evidence.
   */
  executiveSummary:
    string;

  /**
   * Explicit evidence lineage cited by this synthesis.
   *
   * Later validation must ensure these references are permitted
   * by the already validated hypothesis/challenge reasoning chain.
   */
  evidenceReferences:
    RXIntelligenceBriefEvidenceReference[];

  /**
   * Competing interpretations that remain plausible after
   * considering the validated hypothesis and challenge.
   *
   * These remain reasoning, not evidence.
   */
  alternativeExplanations:
    string[];

  /**
   * Material unknowns inherited or retained from the validated
   * reasoning chain.
   */
  uncertainties:
    string[];

  /**
   * Material concerns that remain unresolved after adversarial
   * challenge.
   */
  unresolvedConcerns:
    string[];

  /**
   * Brief synthesis is not allowed to establish causality.
   */
  causalConclusion:
    "UNKNOWN";
}
