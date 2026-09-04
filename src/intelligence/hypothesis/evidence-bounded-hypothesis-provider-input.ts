import type {
  RXPeerIntelligenceEvidencePack,
} from "../context/create-peer-intelligence-evidence-pack";

/**
 * Explicit AI-provider boundary for proposing an
 * evidence-bounded hypothesis.
 *
 * The evidence pack has already been projected into the
 * minimum canonical context allowed for this AI stage.
 *
 * This contract does NOT grant the provider authority to:
 * - redefine canonical evidence,
 * - introduce evidence outside the supplied pack,
 * - establish causality,
 * - return trusted RX domain data.
 *
 * Provider output remains untrusted runtime data and must
 * pass the structural and deterministic hypothesis gates.
 */
export interface RXEvidenceBoundedHypothesisProviderInput {
  evidencePack:
    RXPeerIntelligenceEvidencePack;

  causalConclusion:
    "UNKNOWN";
}
