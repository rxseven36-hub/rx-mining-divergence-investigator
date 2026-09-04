import type {
  RXPeerIntelligenceEvidencePack,
} from "../context/create-peer-intelligence-evidence-pack";

import type {
  RXEvidenceBoundedHypothesis,
} from "./evidence-bounded-hypothesis";

/**
 * Explicit AI-provider boundary for adversarially challenging an
 * already validated evidence-bounded hypothesis.
 *
 * The provider receives only:
 * - the canonical AI-safe evidence pack,
 * - the already validated hypothesis being challenged,
 * - the invariant UNKNOWN causal conclusion.
 *
 * This contract does NOT grant the provider authority to:
 * - redefine canonical evidence,
 * - introduce evidence outside the supplied pack,
 * - replace or mutate the validated hypothesis,
 * - establish causality,
 * - return trusted RX domain data.
 *
 * Provider output remains untrusted runtime data and must pass
 * the structural and deterministic challenge gates.
 */
export interface RXEvidenceBoundedHypothesisChallengeProviderInput {
  evidencePack:
    RXPeerIntelligenceEvidencePack;

  hypothesis:
    RXEvidenceBoundedHypothesis;

  causalConclusion:
    "UNKNOWN";
}
