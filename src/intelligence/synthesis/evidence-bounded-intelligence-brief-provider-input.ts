import type {
  RXPeerIntelligenceEvidencePack,
} from "../context/create-peer-intelligence-evidence-pack";

import type {
  RXEvidenceBoundedHypothesis,
} from "../hypothesis/evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisChallenge,
} from "../hypothesis/evidence-bounded-hypothesis-challenge";

/**
 * Explicit AI-provider boundary for synthesizing an
 * evidence-bounded intelligence brief from an already validated
 * reasoning chain.
 *
 * The provider receives only:
 * - the canonical AI-safe evidence pack,
 * - the already validated hypothesis,
 * - the already validated adversarial challenge,
 * - the invariant UNKNOWN causal conclusion.
 *
 * This contract does NOT grant the provider authority to:
 * - redefine canonical evidence,
 * - introduce evidence outside the supplied pack,
 * - introduce evidence outside the validated reasoning chain,
 * - replace or mutate the validated hypothesis,
 * - replace or mutate the validated challenge,
 * - establish causality,
 * - return trusted RX domain data.
 *
 * Provider output remains untrusted runtime data and must pass
 * the structural and deterministic intelligence-brief gates.
 */
export interface RXEvidenceBoundedIntelligenceBriefProviderInput {
  evidencePack:
    RXPeerIntelligenceEvidencePack;

  hypothesis:
    RXEvidenceBoundedHypothesis;

  challenge:
    RXEvidenceBoundedHypothesisChallenge;

  causalConclusion:
    "UNKNOWN";
}
