import type {
  RXRankedPeerDivergencePriorityResult,
} from "../intelligence/priority/rank-peer-priorities";

import {
  createPeerInvestigationCase,
} from "./create-peer-investigation-case";

import type {
  RXPeerInvestigationCase,
} from "./peer-investigation-case";

export interface RXPeerInvestigationQueue {
  cases:
    RXPeerInvestigationCase[];

  rejectedPriorityCount:
    number;
}

/**
 * Converts already-ranked canonical peer priorities
 * into peer investigation cases.
 *
 * IMPORTANT:
 * This layer does not:
 * - rank priorities,
 * - rescore priorities,
 * - canonicalize peer orientation,
 * - interpret divergence,
 * - infer materiality or causality,
 * - call AI.
 *
 * Case validity remains delegated to
 * createPeerInvestigationCase().
 */
export function buildPeerInvestigationQueue(
  priorities:
    RXRankedPeerDivergencePriorityResult[]
): RXPeerInvestigationQueue {
  const cases:
    RXPeerInvestigationCase[] =
      [];

  let rejectedPriorityCount =
    0;

  for (
    const priority of priorities
  ) {
    const result =
      createPeerInvestigationCase(
        priority
      );

    if (
      !result.ok
    ) {
      rejectedPriorityCount +=
        1;

      continue;
    }

    cases.push(
      result.case
    );
  }

  /**
   * Defensive queue ordering.
   *
   * Ranking is expected to happen upstream,
   * but queue order must remain deterministic
   * when ranked input arrives shuffled.
   */
  cases.sort(
    (
      left,
      right
    ) =>
      left.trigger.rank -
      right.trigger.rank
  );

  return {
    cases,

    rejectedPriorityCount,
  };
}