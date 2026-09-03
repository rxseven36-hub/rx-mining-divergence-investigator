import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "./admit-mining-historical-performance-evidence";

import type {
  RXPeerEligibilityResult,
} from "../intelligence/comparability/peer-eligibility";

import {
  matchAdmittedPeerObservations,
} from "../intelligence/comparability/match-admitted-peer-observations";

import {
  createPeerDivergenceSignal,
} from "../intelligence/comparability/create-peer-divergence-signal";

import {
  scorePeerDivergence,
} from "../intelligence/priority/score-peer-divergence";

import {
  selectCanonicalPeerPriorities,
} from "../intelligence/priority/select-canonical-peer-priorities";

import {
  rankPeerPriorities,
} from "../intelligence/priority/rank-peer-priorities";

import {
  buildPeerInvestigationQueue,
} from "./peer-investigation-queue";

import type {
  RXPeerInvestigationQueue,
} from "./peer-investigation-queue";

export interface BuildAdmittedPeerInvestigationQueueInput {
  leftAdmission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult;

  rightAdmission:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult;

  peerEligibility:
    RXPeerEligibilityResult;
}

/**
 * Builds a deterministic peer investigation queue
 * from already-admitted historical mining evidence.
 *
 * Pipeline:
 *
 * admitted observations
 * -> peer observation matching
 * -> divergence signal
 * -> deterministic priority score
 * -> canonical priority selection
 * -> deterministic ranking
 * -> peer investigation queue
 *
 * IMPORTANT:
 * This orchestration layer does not:
 * - admit evidence,
 * - decide peer eligibility,
 * - decide observation comparability,
 * - calculate divergence independently,
 * - rescore priorities,
 * - canonicalize peer identity independently,
 * - rank independently,
 * - infer materiality or causality,
 * - call AI,
 * - call Sectors or any external API.
 */
export function buildAdmittedPeerInvestigationQueue(
  input:
    BuildAdmittedPeerInvestigationQueueInput
): RXPeerInvestigationQueue {
  const matches =
    matchAdmittedPeerObservations(
      input
    );

  const priorities =
    matches.map(
      (match) =>
        scorePeerDivergence(
          createPeerDivergenceSignal(
            match.leftObservation,
            match.rightObservation,
            match.comparability
          )
        )
    );

  const canonicalPriorities =
    selectCanonicalPeerPriorities(
      priorities
    );

  const rankedPriorities =
    rankPeerPriorities(
      canonicalPriorities
    );

  return buildPeerInvestigationQueue(
    rankedPriorities
  );
}