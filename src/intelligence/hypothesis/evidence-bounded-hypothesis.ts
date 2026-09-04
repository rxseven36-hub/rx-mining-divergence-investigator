/**
 * Canonical reference from an AI-proposed hypothesis back to
 * evidence that RX actually exposed in the intelligence pack.
 *
 * The pair is intentionally explicit so later deterministic
 * validation can verify both evidence identity and request
 * lineage.
 */
export interface RXHypothesisEvidenceReference {
  evidenceId:
    string;

  requestId:
    string;
}

/**
 * Evidence-bounded hypothesis proposed by an intelligence
 * synthesis stage.
 *
 * This contract represents a proposal, not a proven causal
 * conclusion. Every supporting or counter-evidence reference
 * must later be validated against the exact evidence pack that
 * was supplied to the synthesis boundary.
 */
export interface RXEvidenceBoundedHypothesis {
  caseId:
    string;

  planId:
    string;

  hypothesisId:
    string;

  /**
   * Proposed interpretation of the admitted evidence.
   *
   * This is reasoning, not a deterministic fact.
   */
  statement:
    string;

  supportingEvidence:
    RXHypothesisEvidenceReference[];

  counterEvidence:
    RXHypothesisEvidenceReference[];

  /**
   * Plausible competing interpretations that remain open.
   *
   * These are proposals, not evidence.
   */
  alternativeExplanations:
    string[];

  /**
   * Material unknowns that prevent the hypothesis from being
   * treated as established fact.
   */
  uncertainties:
    string[];

  /**
   * Hypothesis synthesis is not allowed to establish causality.
   */
  causalConclusion:
    "UNKNOWN";
}
