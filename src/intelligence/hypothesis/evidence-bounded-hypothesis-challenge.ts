/**
 * Canonical reference from an adversarial hypothesis challenge
 * back to evidence that RX actually exposed in the intelligence
 * evidence pack.
 *
 * Both identifiers remain explicit so later deterministic
 * validation can verify evidence identity and request lineage.
 */
export interface RXHypothesisChallengeEvidenceReference {
  evidenceId:
    string;

  requestId:
    string;
}

/**
 * Evidence-bounded adversarial assessment of an already validated
 * hypothesis.
 *
 * A challenge is independent reasoning about weaknesses in the
 * hypothesis. It does not replace, mutate, or revise the validated
 * hypothesis and it is not a second hypothesis.
 *
 * Every challenging evidence reference must later be validated
 * against the exact evidence pack used by the challenge boundary.
 */
export interface RXEvidenceBoundedHypothesisChallenge {
  caseId:
    string;

  planId:
    string;

  /**
   * Identity of the already validated hypothesis being challenged.
   */
  hypothesisId:
    string;

  challengeId:
    string;

  /**
   * Adversarial reasoning about weaknesses, limitations, or
   * unresolved problems in the hypothesis.
   *
   * This is reasoning, not deterministic evidence.
   */
  critique:
    string;

  challengingEvidence:
    RXHypothesisChallengeEvidenceReference[];

  /**
   * Material concerns that remain unresolved after considering
   * the hypothesis and the canonical evidence available to the
   * challenge stage.
   */
  unresolvedConcerns:
    string[];

  /**
   * A challenge is not allowed to establish causality.
   */
  causalConclusion:
    "UNKNOWN";
}
